import * as amqplib from 'amqplib';
export declare enum MessageHandlerErrorBehavior {
    ACK = "ACK",
    NACK = "NACK",
    REQUEUE = "REQUEUE"
}
export declare type MessageErrorHandler = (channel: amqplib.Channel, msg: amqplib.ConsumeMessage, error: any) => Promise<void> | void;
/**
 * An error handler that will ack the message which caused an error during processing
 */
export declare const ackErrorHandler: MessageErrorHandler;
/**
 * An error handler that will nack and requeue a message which created an error during processing
 */
export declare const requeueErrorHandler: MessageErrorHandler;
/**
 * An error handler that will nack a message which created an error during processing
 */
export declare const defaultNackErrorHandler: MessageErrorHandler;
export declare const getHandlerForLegacyBehavior: (behavior: MessageHandlerErrorBehavior) => MessageErrorHandler;
//# sourceMappingURL=errorBehaviors.d.ts.map