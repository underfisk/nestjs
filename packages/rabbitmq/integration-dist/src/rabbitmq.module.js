"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RabbitMQModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
const nestjs_discovery_1 = require("@golevelup/nestjs-discovery");
const nestjs_modules_1 = require("@golevelup/nestjs-modules");
const common_1 = require("@nestjs/common");
const external_context_creator_1 = require("@nestjs/core/helpers/external-context-creator");
const lodash_1 = require("lodash");
const connection_1 = require("./amqp/connection");
const rabbitmq_constants_1 = require("./rabbitmq.constants");
let RabbitMQModule = RabbitMQModule_1 = class RabbitMQModule extends nestjs_modules_1.createConfigurableDynamicRootModule(rabbitmq_constants_1.RABBIT_CONFIG_TOKEN, {
    providers: [
        {
            provide: connection_1.AmqpConnection,
            useFactory: async (config) => {
                return RabbitMQModule_1.AmqpConnectionFactory(config);
            },
            inject: [rabbitmq_constants_1.RABBIT_CONFIG_TOKEN],
        },
    ],
    exports: [connection_1.AmqpConnection],
}) {
    constructor(discover, amqpConnection, externalContextCreator) {
        super();
        this.discover = discover;
        this.amqpConnection = amqpConnection;
        this.externalContextCreator = externalContextCreator;
        this.logger = new common_1.Logger(RabbitMQModule_1.name);
    }
    static async AmqpConnectionFactory(config) {
        const connection = new connection_1.AmqpConnection(config);
        await connection.init();
        const logger = new common_1.Logger(RabbitMQModule_1.name);
        logger.log('Successfully connected to RabbitMQ');
        return connection;
    }
    static build(config) {
        const logger = new common_1.Logger(RabbitMQModule_1.name);
        logger.warn('build() is deprecated. use forRoot() or forRootAsync() to configure RabbitMQ');
        return {
            module: RabbitMQModule_1,
            providers: [
                {
                    provide: connection_1.AmqpConnection,
                    useFactory: async () => {
                        return RabbitMQModule_1.AmqpConnectionFactory(config);
                    },
                },
            ],
            exports: [connection_1.AmqpConnection],
        };
    }
    static attach(connection) {
        return {
            module: RabbitMQModule_1,
            providers: [
                {
                    provide: connection_1.AmqpConnection,
                    useValue: connection,
                },
            ],
            exports: [connection_1.AmqpConnection],
        };
    }
    async onModuleDestroy() {
        this.logger.verbose('Closing AMQP Connection');
        await this.amqpConnection.managedConnection.close();
    }
    async onModuleInit() {
        if (!this.amqpConnection.configuration.registerHandlers) {
            this.logger.log('Skipping RabbitMQ Handlers due to configuration. This application instance will not receive messages over RabbitMQ');
            return;
        }
        this.logger.log('Initializing RabbitMQ Handlers');
        const rabbitMeta = await this.discover.providerMethodsWithMetaAtKey(rabbitmq_constants_1.RABBIT_HANDLER);
        const grouped = lodash_1.groupBy(rabbitMeta, (x) => x.discoveredMethod.parentClass.name);
        const providerKeys = Object.keys(grouped);
        for (const key of providerKeys) {
            this.logger.log(`Registering rabbitmq handlers from ${key}`);
            await Promise.all(grouped[key].map(async ({ discoveredMethod, meta: config }) => {
                const handler = this.externalContextCreator.create(discoveredMethod.parentClass.instance, discoveredMethod.handler, discoveredMethod.methodName);
                const { exchange, routingKey, queue } = config;
                const handlerDisplayName = `${discoveredMethod.parentClass.name}.${discoveredMethod.methodName} {${config.type}} -> ${exchange}::${routingKey}::${queue || 'amqpgen'}`;
                if (config.type === 'rpc' &&
                    !this.amqpConnection.configuration.enableDirectReplyTo) {
                    this.logger.warn(`Direct Reply-To Functionality is disabled. RPC handler ${handlerDisplayName} will not be registered`);
                    return;
                }
                this.logger.log(handlerDisplayName);
                return config.type === 'rpc'
                    ? this.amqpConnection.createRpc(handler, config)
                    : this.amqpConnection.createSubscriber(handler, config);
            }));
        }
    }
};
RabbitMQModule = RabbitMQModule_1 = __decorate([
    common_1.Module({
        imports: [nestjs_discovery_1.DiscoveryModule],
    }),
    __metadata("design:paramtypes", [nestjs_discovery_1.DiscoveryService,
        connection_1.AmqpConnection,
        external_context_creator_1.ExternalContextCreator])
], RabbitMQModule);
exports.RabbitMQModule = RabbitMQModule;
//# sourceMappingURL=rabbitmq.module.js.map