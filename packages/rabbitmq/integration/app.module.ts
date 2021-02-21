import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import {
  ClientProxy,
  ClientProxyFactory,
  ClientsModule,
} from '@nestjs/microservices';
import { RabbitmqClientOptions } from '../src/client/rabbitmq-client-options';
import { RabbitMqClient } from '../src/client/rabbit-mq-client';

@Module({
  controllers: [AppController],
  providers: [
    {
      provide: 'RMQ',
      useFactory: () => {
        const options: RabbitmqClientOptions = {
          uri:
            'amqps://fxzgrted:EmWTAxM9cRzLbSKR_YBte-WcsA5doHE7@sparrow.rmq.cloudamqp.com/fxzgrted',
        };
        return ClientProxyFactory.create({
          customClass: RabbitMqClient,
          options,
        });
      },
    },
  ],
  imports: [
    ClientsModule.register([{ name: 'RMQ', customClass: RabbitMqClient }]),
  ],
})
export class AppModule implements OnModuleInit {
  constructor(@Inject('RMQ') private readonly client: ClientProxy) {}

  async onModuleInit() {
    console.log('MODULE INIT');
    await this.client.connect();
  }
}
