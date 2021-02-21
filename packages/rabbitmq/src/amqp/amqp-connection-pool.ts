import { AmqpConnection } from './connection';
import { RabbitMQConfig } from '../rabbitmq.interfaces';
import { uniq } from 'lodash';

/**
 * Provides a connection container for Amqp to re-use existing connections
 */
export class AmqpConnectionPool {
  private static _connections: Map<string, AmqpConnection> = new Map();

  static async create(config: RabbitMQConfig) {
    const uris = uniq(Array.isArray(config.uri) ? config.uri : [config.uri]);
    uris.forEach(async (uri) => {
      console.log('Itearting over uri: ' + uri);
      const connection = AmqpConnectionPool.registerConnection(
        uri,
        new AmqpConnection(config)
      );
      await connection.init();
      console.log('Connected!');
    });
    return this._connections;
  }

  static async closeAll() {
    AmqpConnectionPool._connections.forEach(async (e, uri) => {
      console.log('Closing ' + uri + ' connection');
      await e.managedConnection.close();
      console.log('Connection closed.');
    });
  }

  static async close(uri: string | string[]) {
    /**
     * @todo I might have to see if another clientProxy is using
     * that same connection because we are re-using so i might need a list of clientProxy
     * registered and see if this is the last one
     */
    console.log('Close invoked');
    const list = uniq(Array.isArray(uri) ? uri : [uri]);
    AmqpConnectionPool._connections.forEach(async (e, key) => {
      const isTarget = list.some((u) => key === u);
      if (isTarget) {
        console.log('Closing uri connection for : ' + key);
        await e.managedConnection.close();
      }
    });
  }

  /**
   * Returns the connection if exists
   * @param uri
   */
  static getConnection(uri: string): AmqpConnection | undefined {
    return AmqpConnectionPool._connections.get(uri);
  }

  static registerConnection(uri: string, connection: AmqpConnection) {
    AmqpConnectionPool._connections.set(uri, connection);
    return connection;
  }
}
