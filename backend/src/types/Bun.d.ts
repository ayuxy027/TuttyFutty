declare module "bun:sqlite" {
  export interface Database {
    close(): void;
    exec(sql: string): void;
    query(sql: string): Statement;
    prepare(sql: string): Statement;
    serialize(): Uint8Array;
  }

  export interface Statement {
    all(...params: unknown[]): unknown[];
    get(...params: unknown[]): unknown | undefined;
    run(...params: unknown[]): { changes: number; lastInsertRowid: number };
    finalize(): void;
    toString(): string;
  }

  export interface DatabaseOptions {
    readonly?: boolean;
    create?: boolean;
    readwrite?: boolean;
  }

  export class Database {
    constructor(path: string, options?: DatabaseOptions);
    close(): void;
    exec(sql: string): void;
    query(sql: string): Statement;
    prepare(sql: string): Statement;
    serialize(): Uint8Array;
  }

  export class Statement {
    all(...params: unknown[]): unknown[];
    get(...params: unknown[]): unknown | undefined;
    run(...params: unknown[]): { changes: number; lastInsertRowid: number };
    finalize(): void;
    toString(): string;
  }
}
