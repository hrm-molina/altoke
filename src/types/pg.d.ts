declare module "pg" {
  export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number | null;
    command: string;
    oid: number;
    fields: any[];
  }

  export class Client {
    constructor(config?: any);
    connect(): Promise<void>;
    query<T = any>(queryText: string, values?: any[]): Promise<QueryResult<T>>;
    end(): Promise<void>;
  }

  export class Pool {
    constructor(config?: any);
    connect(): Promise<any>;
    query<T = any>(queryText: string, values?: any[]): Promise<QueryResult<T>>;
    end(): Promise<void>;
  }
}
