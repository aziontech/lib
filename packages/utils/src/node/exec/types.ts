export interface Logger {
  info(message: string): void;
  error(message: string): void;
  success(message: string): void;
  warn(message: string): void;
  debug(message: string): void;
  pending(message: string): void;
  complete(message: string): void;
  start(message: string): void;
}

export interface ExecOptions {
  verbose?: boolean;
  interactive?: boolean;
}

export interface ProcessOutput {
  stdout: string;
  stderr: string;
}

export interface ExecOptions {
  scope?: string;
  verbose?: boolean;
  interactive?: boolean;
}
