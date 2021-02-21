"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Provides a connection container for Amqp to re-use existing connections
 */
class AmqpConnectionPool {
    static async closeAll() {
        this._connections.forEach(async (e, uri) => {
            console.log("Closing " + uri + " connection");
            await e.managedConnection.close();
            console.log("Connection closed.");
        });
    }
    /**
     * Returns the connection if exists
     * @param uri
     */
    static getConnection(uri) {
        return this._connections.get(uri);
    }
    static registerConnection(uri, connection) {
        //Void duplicates
        if (this._connections.has(uri)) {
            return;
        }
        this._connections.set(uri, connection);
        return this;
    }
}
exports.AmqpConnectionPool = AmqpConnectionPool;
AmqpConnectionPool._connections = new Map();
//# sourceMappingURL=amqp-connection-pool.js.map