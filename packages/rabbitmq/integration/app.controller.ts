import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RabbitMqExchange } from '../src/decorators/rabbit-mq-exchange.decorator';

@Controller()
export class AppController {
  /** @example MessagePattern will be use to subscribe **/
  @RabbitMqExchange('testing-exchange')
  @MessagePattern('rmq-say-echo-in-rpc')
  async sayEcho(@Payload() data: any) {
    console.log('Echo is called');
    return data;
  }
}
