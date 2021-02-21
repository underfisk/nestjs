"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rabbitmq_constants_1 = require("./rabbitmq.constants");
exports.isRabbitContext = (executionContext) => {
    const handler = executionContext.getHandler();
    return Reflect.getMetadataKeys(handler).includes(rabbitmq_constants_1.RABBIT_HANDLER);
};
//# sourceMappingURL=rabbitmq.helpers.js.map