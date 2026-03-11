export class BaseService {
  protected log(message: string, ...args: unknown[]): void {
    console.log(`[${this.constructor.name}] ${message}`, ...args);
  }

  protected error(message: string, ...args: unknown[]): void {
    console.error(`[${this.constructor.name}] ${message}`, ...args);
  }
}
