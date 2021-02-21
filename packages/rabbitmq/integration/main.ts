import { NestContainer, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RabbitMqServerAdapter } from '../src/adapter/rabbit-mq-server-adapter';
import { RabbitMQConfig } from '../src';

async function bootstrap() {
  console.log('Creating an app');
  const config: RabbitMQConfig = {
    uri: [
      'amqps://fxzgrted:EmWTAxM9cRzLbSKR_YBte-WcsA5doHE7@sparrow.rmq.cloudamqp.com/fxzgrted',
      'amqps://fxzgrted:EmWTAxM9cRzLbSKR_YBte-WcsA5doHE7@sparrow.rmq.cloudamqp.com/fxzgrted',
    ],
    exchanges: [],
  };
  const app = await NestFactory.createMicroservice(AppModule, {
    strategy: new RabbitMqServerAdapter(config),
  });
  await app.listenAsync();
}

bootstrap();
