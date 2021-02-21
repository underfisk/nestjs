"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const microservices_1 = require("@nestjs/microservices");
const amqp_connection_pool_1 = require("../amqp/amqp-connection-pool");
const connection_1 = require("../amqp/connection");
/**
 * This server will handle subscriptions and rpc
 * registering for client-proxy
 */
class RabbitMqServerAdapter extends microservices_1.Server {
    constructor(config) {
        super();
        this.config = config;
    }
    async listen(callback) {
        console.log("RabbitMQ is fired up");
        const uris = Array.isArray(this.config.uri) ? this.config.uri : [this.config.uri];
        await Promise.all(uris.map(async (uri) => {
            const conn = amqp_connection_pool_1.AmqpConnectionPool.getConnection(uri);
            if (!conn) {
                console.log("Registering a new connection for uri: " + uri);
                const connection = new connection_1.AmqpConnection(this.config);
                await connection.init();
                console.log("Connected to " + uri);
                amqp_connection_pool_1.AmqpConnectionPool.registerConnection(uri, connection);
            }
        }));
    }
    async close() {
        console.log("Closing all connections");
        await amqp_connection_pool_1.AmqpConnectionPool.closeAll();
    }
}
exports.RabbitMqServerAdapter = RabbitMqServerAdapter;
//# sourceMappingURL=rabbit-mq-server-adapter.js.map