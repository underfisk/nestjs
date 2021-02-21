import {
  CustomTransportStrategy,
  Server,
  Transport,
} from '@nestjs/microservices';
import { RabbitMQConfig } from '../rabbitmq.interfaces';
import { AmqpConnectionPool } from '../amqp/amqp-connection-pool';

/**
 * This server will handle subscriptions and rpc
 * registering for client-proxy
 */
export class RabbitMqServerAdapter extends Server
  implements CustomTransportStrategy {
  public readonly transportId = Transport.RMQ;
  constructor(private readonly config: RabbitMQConfig) {
    super();
  }

  async listen(callback: () => void) {
    console.log('RabbitMQ is fired up');
    // console.log(this.getHandlers())
    // const connections = await AmqpConnectionPool.create(this.config)
    // Setup each connection
  }

  async close() {
    console.log('Closing all connections');
    await AmqpConnectionPool.closeAll();
  }
}
