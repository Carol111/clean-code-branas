import pgp from "pg-promise";

export default interface DatabaseConnection {
  query(statement: string, params?: any): Promise<any>;
  close(): Promise<void>;
}

export class PgPromiseAdapter implements DatabaseConnection {
  connection: any;

  constructor(connectionString: string) {
    this.connection = pgp()(connectionString);
  }

  async query(statement: string, params: any): Promise<any> {
    return this.connection.query(statement, params);
  }

  async close(): Promise<void> {
    await this.connection.$pool.end();
  }
}
