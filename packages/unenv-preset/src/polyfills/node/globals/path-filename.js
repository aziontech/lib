import process from 'process';
globalThis.__filename = process.cwd();
export default globalThis.__filename;
