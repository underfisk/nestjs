import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { RabbitMQConfig } from '../rabbitmq.interfaces';
/**
 * This server will handle subscriptions and rpc
 * registering for client-proxy
 */
export declare class RabbitMqServerAdapter extends Server implements CustomTransportStrategy {
    private readonly config;
    constructor(config: RabbitMQConfig);
    listen(callback: () => void): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=rabbit-mq-server-adapter.d.ts.map