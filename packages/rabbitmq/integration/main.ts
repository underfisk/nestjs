import { NestContainer, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RabbitMqServerAdapter } from '../src/adapter/rabbit-mq-server-adapter';
import { RabbitMQConfig } from '../src';

async function bootstrap() {
  console.log('Creating an app');
  const config: RabbitMQConfig = {
    uri: [
      'abc',
      'abc
    ],
    exchanges: [],
  };
  const app = await NestFactory.createMicroservice(AppModule, {
    strategy: new RabbitMqServerAdapter(config),
  });
  await app.listenAsync();
}

bootstrap();
