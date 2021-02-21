import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { AmqpConnectionPool } from '../amqp/amqp-connection-pool';
import { AmqpConnection } from '../amqp/connection';
import { RabbitMQConfig } from '../rabbitmq.interfaces';
import { RabbitmqClientOptions } from './rabbitmq-client-options';

/**
 * Proxy client for golevelup rabbitmq client
 * Supports RPC (direct-reply) and publishing
 * Subscriptions will be done using decorator (probably a custom one
 * since MessagePattern would make sense for the direct reply)
 * EventPattern will be used for the subscription
 */
export class RabbitMqClient extends ClientProxy {
  constructor(private readonly config: RabbitmqClientOptions) {
    super();
    console.log('RabbitMqClient CREATED');
  }

  async connect(): Promise<any> {
    console.log('connect');
    console.log(this.config);
    await AmqpConnectionPool.create(this.config);
  }

  async close() {
    console.log('close');
    await AmqpConnectionPool.close(this.config.uri);
  }

  async dispatchEvent(packet: ReadPacket<any>): Promise<any> {
    return console.log('event to dispatch: ', packet);
  }

  publish(
    packet: ReadPacket<any>,
    callback: (packet: WritePacket<any>) => void
  ): Function {
    console.log('message:', packet);

    // In a real-world application, the "callback" function should be executed
    // with payload sent back from the responder. Here, we'll simply simulate (5 seconds delay)
    // that response came through by passing the same "data" as we've originally passed in.
    setTimeout(() => callback({ response: packet.data }), 5000);

    return () => console.log('teardown');
  }
}
