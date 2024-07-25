import { Crypto, CryptoKey } from '@peculiar/webcrypto';

globalThis.crypto = new Crypto();
globalThis.CryptoKey = CryptoKey;
