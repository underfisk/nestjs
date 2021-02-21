import { AmqpConnection } from './connection';
/**
 * Provides a connection container for Amqp to re-use existing connections
 */
export declare class AmqpConnectionPool {
    private static _connections;
    static closeAll(): Promise<void>;
    /**
     * Returns the connection if exists
     * @param uri
     */
    static getConnection(uri: string): AmqpConnection | undefined;
    static registerConnection(uri: string, connection: AmqpConnection): typeof AmqpConnectionPool | undefined;
}
//# sourceMappingURL=amqp-connection-pool.d.ts.map