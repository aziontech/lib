import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

// KVContext Simulate KV Storage API with file system

class KVContext {
  #pathKV;
  #metadataPrefix;

  constructor(kvName, pathKV) {
    this.kvName = kvName;
    this.#pathKV = pathKV || `.edge/kv/${kvName}`;
    this.#metadataPrefix = `.metadata-${kvName}.json`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get(key, returnType = 'text', options = {}) {
    try {
      const item = await fs.promises.readFile(`${this.#pathKV}/${key}`);
      const metadata = await KVContext.getMetadata(this.#pathKV, key, this.#metadataPrefix);

      if (metadata?.expiration) {
        const now = Math.floor(Date.now() / 1000);
        if (now >= metadata.expiration) {
          await this.delete(key);
          return { value: null, metadata: null };
        }
      }

      return {
        value: await this.#convertValue(item, returnType),
        metadata: metadata?.metadata || null,
      };
    } catch {
      return { value: null, metadata: null };
    }
  }

  async getMultiple(keys, returnType = 'text', options = {}) {
    const results = new Map();

    for (const key of keys) {
      const result = await this.get(key, returnType, options);
      results.set(key, result);
    }

    return results;
  }

  async put(key, value, options = {}) {
    const prefix = path.dirname(key);
    await fs.promises.mkdir(`${this.#pathKV}/${prefix}`, {
      recursive: true,
    });

    let fileContent;
    if (value instanceof ReadableStream) {
      const reader = value.getReader();
      const chunks = [];
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        chunks.push(chunk);
      }
      fileContent = Buffer.concat(chunks);
    } else if (value instanceof ArrayBuffer) {
      fileContent = Buffer.from(value);
    } else if (typeof value === 'object') {
      fileContent = JSON.stringify(value);
    } else {
      fileContent = String(value);
    }

    await fs.promises.writeFile(`${this.#pathKV}/${key}`, fileContent);
    await KVContext.putMetadata(this.#pathKV, key, options, this.#metadataPrefix);

    if (options.expirationTtl) {
      setTimeout(async () => {
        try {
          await this.delete(key);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
        } catch (error) {}
      }, options.expirationTtl * 1000);
    } else if (options.expiration) {
      const now = Math.floor(Date.now() / 1000);
      const ttl = options.expiration - now;
      if (ttl > 0) {
        setTimeout(async () => {
          try {
            await this.delete(key);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
          } catch (error) {}
        }, ttl * 1000);
      }
    }
  }

  async delete(key) {
    try {
      await fs.promises.rm(`${this.#pathKV}/${key}`);
      try {
        await fs.promises.rm(`${this.#pathKV}/${key}${this.#metadataPrefix}`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
      } catch (error) {}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
    } catch (error) {}
  }

  async #convertValue(buffer, returnType) {
    switch (returnType) {
      case 'json':
        return JSON.parse(buffer.toString());
      case 'arrayBuffer':
        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
      case 'stream':
        return Readable.from(buffer);
      case 'text':
      default:
        return buffer.toString();
    }
  }

  static async putMetadata(pathKV, key, options, metadataPrefix) {
    const bodyMetadata = {
      metadata: options?.metadata || null,
      expiration: options?.expiration || null,
      expirationTtl: options?.expirationTtl || null,
    };
    await fs.promises.writeFile(`${pathKV}/${key}${metadataPrefix}`, JSON.stringify(bodyMetadata, undefined, 2));
    return bodyMetadata;
  }

  static async getMetadata(pathKV, key, metadataPrefix) {
    try {
      let data = await fs.promises.readFile(`${pathKV}/${key}${metadataPrefix}`);
      data = JSON.parse(data.toString());
      return {
        metadata: data?.metadata || null,
        expiration: data?.expiration || null,
        expirationTtl: data?.expirationTtl || null,
      };
    } catch {
      return { metadata: null };
    }
  }
}

export default KVContext;
