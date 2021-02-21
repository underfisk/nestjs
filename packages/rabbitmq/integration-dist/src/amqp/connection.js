"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const amqpcon = require("amqp-connection-manager");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const uuid = require("uuid");
const errorBehaviors_1 = require("./errorBehaviors");
const handlerResponses_1 = require("./handlerResponses");
const DIRECT_REPLY_QUEUE = 'amq.rabbitmq.reply-to';
const defaultConfig = {
    prefetchCount: 10,
    defaultExchangeType: 'topic',
    defaultRpcErrorBehavior: errorBehaviors_1.MessageHandlerErrorBehavior.REQUEUE,
    defaultSubscribeErrorBehavior: errorBehaviors_1.MessageHandlerErrorBehavior.REQUEUE,
    exchanges: [],
    defaultRpcTimeout: 10000,
    connectionInitOptions: {
        wait: true,
        timeout: 5000,
        reject: true,
    },
    connectionManagerOptions: {},
    registerHandlers: true,
    enableDirectReplyTo: true,
};
class AmqpConnection {
    constructor(config) {
        this.messageSubject = new rxjs_1.Subject();
        this.initialized = new rxjs_1.Subject();
        this.config = Object.assign(Object.assign({}, defaultConfig), config);
        this.logger = new common_1.Logger(AmqpConnection.name);
    }
    get channel() {
        if (!this._channel)
            throw new Error('channel is not available');
        return this._channel;
    }
    get connection() {
        if (!this._connection)
            throw new Error('connection is not available');
        return this._connection;
    }
    get managedChannel() {
        return this._managedChannel;
    }
    get managedConnection() {
        return this._managedConnection;
    }
    get configuration() {
        return this.config;
    }
    async init() {
        const options = Object.assign(Object.assign({}, defaultConfig.connectionInitOptions), this.config.connectionInitOptions);
        const { wait, timeout: timeoutInterval, reject } = options;
        const p = this.initCore();
        if (!wait)
            return p;
        return this.initialized
            .pipe(operators_1.take(1), operators_1.timeoutWith(timeoutInterval, rxjs_1.throwError(new Error(`Failed to connect to a RabbitMQ broker within a timeout of ${timeoutInterval}ms`))), operators_1.catchError((err) => (reject ? rxjs_1.throwError(err) : rxjs_1.EMPTY)))
            .toPromise();
    }
    async initCore() {
        this.logger.log('Trying to connect to a RabbitMQ broker');
        this._managedConnection = amqpcon.connect(Array.isArray(this.config.uri) ? this.config.uri : [this.config.uri], this.config.connectionManagerOptions);
        this._managedConnection.on('connect', ({ connection }) => {
            this._connection = connection;
            this.logger.log('Successfully connected to a RabbitMQ broker');
        });
        this._managedChannel = this._managedConnection.createChannel({
            name: AmqpConnection.name,
        });
        this._managedChannel.on('connect', () => this.logger.log('Successfully connected a RabbitMQ channel'));
        this._managedChannel.on('error', (err, { name }) => this.logger.log(`Failed to setup a RabbitMQ channel - name: ${name} / error: ${err.message} ${err.stack}`));
        this._managedChannel.on('close', () => this.logger.log('Successfully closed a RabbitMQ channel'));
        await this._managedChannel.addSetup((c) => this.setupInitChannel(c));
    }
    async setupInitChannel(channel) {
        this._channel = channel;
        this.config.exchanges.forEach(async (x) => channel.assertExchange(x.name, x.type || this.config.defaultExchangeType, x.options));
        await channel.prefetch(this.config.prefetchCount);
        if (this.config.enableDirectReplyTo) {
            await this.initDirectReplyQueue(channel);
        }
        this.initialized.next();
    }
    async initDirectReplyQueue(channel) {
        // Set up a consumer on the Direct Reply-To queue to facilitate RPC functionality
        await channel.consume(DIRECT_REPLY_QUEUE, async (msg) => {
            if (msg == null) {
                return;
            }
            const correlationMessage = {
                correlationId: msg.properties.correlationId.toString(),
                message: JSON.parse(msg.content.toString()),
            };
            this.messageSubject.next(correlationMessage);
        }, {
            noAck: true,
        });
    }
    async request(requestOptions) {
        const correlationId = requestOptions.correlationId || uuid.v4();
        const timeout = requestOptions.timeout || this.config.defaultRpcTimeout;
        const payload = requestOptions.payload || {};
        const response$ = this.messageSubject.pipe(operators_1.filter((x) => x.correlationId === correlationId), operators_1.map((x) => x.message), operators_1.first());
        this.publish(requestOptions.exchange, requestOptions.routingKey, payload, {
            replyTo: DIRECT_REPLY_QUEUE,
            correlationId,
        });
        const timeout$ = rxjs_1.interval(timeout).pipe(operators_1.first(), operators_1.map(() => {
            throw new Error(`Failed to receive response within timeout of ${timeout}ms`);
        }));
        return rxjs_1.race(response$, timeout$).toPromise();
    }
    async createSubscriber(handler, msgOptions) {
        return this._managedChannel.addSetup((channel) => this.setupSubscriberChannel(handler, msgOptions, channel));
    }
    async setupSubscriberChannel(handler, msgOptions, channel) {
        const { exchange, routingKey, allowNonJsonMessages } = msgOptions;
        const { queue } = await channel.assertQueue(msgOptions.queue || '', msgOptions.queueOptions || undefined);
        const routingKeys = Array.isArray(routingKey) ? routingKey : [routingKey];
        await Promise.all(routingKeys.map((x) => channel.bindQueue(queue, exchange, x)));
        await channel.consume(queue, async (msg) => {
            try {
                if (msg == null) {
                    throw new Error('Received null message');
                }
                const response = await this.handleMessage(handler, msg, allowNonJsonMessages);
                if (response instanceof handlerResponses_1.Nack) {
                    channel.nack(msg, false, response.requeue);
                    return;
                }
                if (response) {
                    throw new Error('Received response from subscribe handler. Subscribe handlers should only return void');
                }
                channel.ack(msg);
            }
            catch (e) {
                if (msg == null) {
                    return;
                }
                else {
                    const errorHandler = msgOptions.errorHandler ||
                        errorBehaviors_1.getHandlerForLegacyBehavior(msgOptions.errorBehavior ||
                            this.config.defaultSubscribeErrorBehavior);
                    await errorHandler(channel, msg, e);
                }
            }
        });
    }
    async createRpc(handler, rpcOptions) {
        return this._managedChannel.addSetup((channel) => this.setupRpcChannel(handler, rpcOptions, channel));
    }
    async setupRpcChannel(handler, rpcOptions, channel) {
        const { exchange, routingKey, allowNonJsonMessages } = rpcOptions;
        const { queue } = await channel.assertQueue(rpcOptions.queue || '', rpcOptions.queueOptions || undefined);
        const routingKeys = Array.isArray(routingKey) ? routingKey : [routingKey];
        await Promise.all(routingKeys.map((x) => channel.bindQueue(queue, exchange, x)));
        await channel.consume(queue, async (msg) => {
            try {
                if (msg == null) {
                    throw new Error('Received null message');
                }
                const response = await this.handleMessage(handler, msg, allowNonJsonMessages);
                if (response instanceof handlerResponses_1.Nack) {
                    channel.nack(msg, false, response.requeue);
                    return;
                }
                const { replyTo, correlationId } = msg.properties;
                if (replyTo) {
                    this.publish('', replyTo, response, { correlationId });
                }
                channel.ack(msg);
            }
            catch (e) {
                if (msg == null) {
                    return;
                }
                else {
                    const errorHandler = rpcOptions.errorHandler ||
                        errorBehaviors_1.getHandlerForLegacyBehavior(rpcOptions.errorBehavior ||
                            this.config.defaultSubscribeErrorBehavior);
                    await errorHandler(channel, msg, e);
                }
            }
        });
    }
    async publish(exchange, routingKey, message, options) {
        // source amqplib channel is used directly to keep the behavior of throwing connection related errors
        if (!this.managedConnection.isConnected() || !this._channel) {
            throw new Error('AMQP connection is not available');
        }
        let buffer;
        if (message instanceof Buffer) {
            buffer = message;
        }
        else if (message instanceof Uint8Array) {
            buffer = Buffer.from(message);
        }
        else if (message != null) {
            buffer = Buffer.from(JSON.stringify(message));
        }
        else {
            buffer = Buffer.alloc(0);
        }
        this._channel.publish(exchange, routingKey, buffer, options);
    }
    handleMessage(handler, msg, allowNonJsonMessages) {
        let message = undefined;
        if (msg.content) {
            if (allowNonJsonMessages) {
                try {
                    message = JSON.parse(msg.content.toString());
                }
                catch (_a) {
                    // Let handler handle parsing error, it has the raw message anyway
                    message = undefined;
                }
            }
            else {
                message = JSON.parse(msg.content.toString());
            }
        }
        return handler(message, msg);
    }
}
exports.AmqpConnection = AmqpConnection;
//# sourceMappingURL=connection.js.map