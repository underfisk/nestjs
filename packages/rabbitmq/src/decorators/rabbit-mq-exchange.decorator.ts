import { DECORATORS } from './constants';

export function RabbitMqExchange(exchange: string | string[]): MethodDecorator {
  return (
    target: object,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    Reflect.defineMetadata(DECORATORS.EXCHANGE, exchange, descriptor.value);
    // Reflect.defineMetadata(
    //   PATTERN_HANDLER_METADATA,
    //   PatternHandler.MESSAGE,
    //   descriptor.value,
    // );
    //Reflect.defineMetadata(TRANSPORT_METADATA, transport, descriptor.value);
    return descriptor;
  };
}
