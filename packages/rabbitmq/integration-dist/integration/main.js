"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const rabbit_mq_server_adapter_1 = require("../src/adapter/rabbit-mq-server-adapter");
async function bootstrap() {
    console.log("Creating an app");
    const config = {
        uri: ['1234', 'hey'],
        exchanges: []
    };
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
        strategy: new rabbit_mq_server_adapter_1.RabbitMqServerAdapter(config)
    });
    await app.listenAsync();
}
bootstrap();
//# sourceMappingURL=main.js.map