export class KVError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KVError';
  }
}

export class KVConnectionError extends KVError {
  constructor(message: string) {
    super(message);
    this.name = 'KVConnectionError';
  }
}

export class KVTimeoutError extends KVError {
  constructor(message: string) {
    super(message);
    this.name = 'KVTimeoutError';
  }
}

export class KVNotFoundError extends KVError {
  constructor(key: string) {
    super(`Key not found: ${key}`);
    this.name = 'KVNotFoundError';
  }
}
