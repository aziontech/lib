import primitives from '@edge-runtime/primitives';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

class FetchEventContext extends primitives.FetchEvent {
  constructor(type, eventInitDict) {
    super(type, eventInitDict);
    const argsPathEnv = globalThis.bundler.argsPath || 'azion/args.json';
    const argsPath = join(process.cwd(), argsPathEnv);
    if (existsSync(argsPath)) {
      try {
        const args = JSON.parse(readFileSync(argsPath, 'utf8'));
        this.args = args || {};
      } catch (error) {
        console.error(`Error reading args.json: ${error.message}`);
      }
    }
    this.console = {
      log: (log) => console.log(log),
    };
  }
}

export default FetchEventContext;
