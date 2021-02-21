import * as amqpcon from 'amqp-connection-manager';
import * as amqplib from 'amqplib';
import { MessageHandlerOptions, RabbitMQConfig, RequestOptions } from '../rabbitmq.interfaces';
import { RpcResponse, SubscribeResponse } from './handlerResponses';
export interface CorrelationMessage {
    correlationId: string;
    message: {};
}
export declare class AmqpConnection {
    private readonly messageSubject;
    private readonly config;
    private readonly logger;
    private readonly initialized;
    private _managedConnection;
    private _managedChannel;
    private _channel?;
    private _connection?;
    constructor(config: RabbitMQConfig);
    get channel(): amqplib.Channel;
    get connection(): amqplib.Connection;
    get managedChannel(): amqpcon.ChannelWrapper;
    get managedConnection(): amqpcon.AmqpConnectionManager;
    get configuration(): Required<RabbitMQConfig>;
    init(): Promise<void>;
    private initCore;
    private setupInitChannel;
    private initDirectReplyQueue;
    request<T extends {}>(requestOptions: RequestOptions): Promise<T>;
    createSubscriber<T>(handler: (msg: T | undefined, rawMessage?: amqplib.ConsumeMessage) => Promise<SubscribeResponse>, msgOptions: MessageHandlerOptions): Promise<void>;
    private setupSubscriberChannel;
    createRpc<T, U>(handler: (msg: T | undefined, rawMessage?: amqplib.ConsumeMessage) => Promise<RpcResponse<U>>, rpcOptions: MessageHandlerOptions): Promise<void>;
    setupRpcChannel<T, U>(handler: (msg: T | undefined, rawMessage?: amqplib.ConsumeMessage) => Promise<RpcResponse<U>>, rpcOptions: MessageHandlerOptions, channel: amqplib.ConfirmChannel): Promise<void>;
    publish(exchange: string, routingKey: string, message: any, options?: amqplib.Options.Publish): Promise<void>;
    private handleMessage;
}
//# sourceMappingURL=connection.d.ts.map