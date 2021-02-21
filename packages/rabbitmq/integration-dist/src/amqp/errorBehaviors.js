"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MessageHandlerErrorBehavior;
(function (MessageHandlerErrorBehavior) {
    MessageHandlerErrorBehavior["ACK"] = "ACK";
    MessageHandlerErrorBehavior["NACK"] = "NACK";
    MessageHandlerErrorBehavior["REQUEUE"] = "REQUEUE";
})(MessageHandlerErrorBehavior = exports.MessageHandlerErrorBehavior || (exports.MessageHandlerErrorBehavior = {}));
/**
 * An error handler that will ack the message which caused an error during processing
 */
exports.ackErrorHandler = (channel, msg, error) => {
    channel.ack(msg);
};
/**
 * An error handler that will nack and requeue a message which created an error during processing
 */
exports.requeueErrorHandler = (channel, msg, error) => {
    channel.nack(msg, false, true);
};
/**
 * An error handler that will nack a message which created an error during processing
 */
exports.defaultNackErrorHandler = (channel, msg, error) => {
    channel.nack(msg, false, false);
};
exports.getHandlerForLegacyBehavior = (behavior) => {
    switch (behavior) {
        case MessageHandlerErrorBehavior.ACK:
            return exports.ackErrorHandler;
        case MessageHandlerErrorBehavior.REQUEUE:
            return exports.requeueErrorHandler;
        default:
            return exports.defaultNackErrorHandler;
    }
};
//# sourceMappingURL=errorBehaviors.js.map