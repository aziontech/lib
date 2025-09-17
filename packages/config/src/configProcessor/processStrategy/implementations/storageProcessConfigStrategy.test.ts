import { AzionConfig } from '../../../types';
import StorageProcessConfigStrategy from './storageProcessConfigStrategy';

describe('StorageProcessConfigStrategy', () => {
    let strategy: StorageProcessConfigStrategy;

    beforeEach(() => {
        strategy = new StorageProcessConfigStrategy();
    });

    describe('transformToManifest', () => {
        it('should return undefined when no storage is provided', () => {
            const config: AzionConfig = {};
            const result = strategy.transformToManifest(config);
            expect(result).toBeUndefined();
        });

        it('should return undefined when storage array is empty', () => {
            const config: AzionConfig = { storage: [] };
            const result = strategy.transformToManifest(config);
            expect(result).toBeUndefined();
        });

        it('should transform a basic storage configuration to manifest format', () => {
            const config: AzionConfig = {
                storage: [
                    {
                        name: 'my-storage',
                        dir: './public',
                        edgeAccess: 'read_only',
                        prefix: 'assets',
                    },
                ],
            };

            const result = strategy.transformToManifest(config);

            expect(result).toEqual([
                {
                    name: 'my-storage',
                    edge_access: 'read_only',
                    dir: './public',
                    prefix: 'assets',
                },
            ]);
        });

        it('should use default edge_access when not provided', () => {
            const config: AzionConfig = {
                storage: [
                    {
                        name: 'my-storage',
                        dir: './public',
                        prefix: 'assets',
                    },
                ],
            };

            const result = strategy.transformToManifest(config);

            expect(result).toEqual([
                {
                    name: 'my-storage',
                    edge_access: 'read_only',
                    dir: './public',
                    prefix: 'assets',
                },
            ]);
        });

        it('should transform multiple storage configurations to manifest format', () => {
            const config: AzionConfig = {
                storage: [
                    {
                        name: 'storage-1',
                        dir: './public',
                        edgeAccess: 'read_only',
                        prefix: 'assets',
                    },
                    {
                        name: 'storage-2',
                        dir: './static',
                        edgeAccess: 'read_write',
                        prefix: 'images',
                    },
                ],
            };

            const result = strategy.transformToManifest(config);

            expect(result).toHaveLength(2);
            expect(result![0].name).toBe('storage-1');
            expect(result![1].name).toBe('storage-2');
            expect(result![0].edge_access).toBe('read_only');
            expect(result![1].edge_access).toBe('read_write');
        });
    });

    describe('transformToConfig', () => {
        it('should return undefined when no storage is provided', () => {
            const payload = {};
            const transformedPayload: AzionConfig = {};
            const result = strategy.transformToConfig(payload, transformedPayload);
            expect(result).toBeUndefined();
        });

        it('should return undefined when storage array is empty', () => {
            const payload = { storage: [] };
            const transformedPayload: AzionConfig = {};
            const result = strategy.transformToConfig(payload, transformedPayload);
            expect(result).toBeUndefined();
        });

        it('should transform a basic storage manifest to config format', () => {
            const payload = {
                storage: [
                    {
                        name: 'my-storage',
                        edge_access: 'read_only',
                        dir: './public',
                        prefix: 'assets',
                    },
                ],
            };
            const transformedPayload: AzionConfig = {};

            const result = strategy.transformToConfig(payload, transformedPayload);

            expect(result).toEqual([
                {
                    name: 'my-storage',
                    edgeAccess: 'read_only',
                    dir: './public',
                    prefix: 'assets',
                },
            ]);
            expect(transformedPayload.storage).toEqual([
                {
                    name: 'my-storage',
                    edgeAccess: 'read_only',
                    dir: './public',
                    prefix: 'assets',
                },
            ]);
        });

        it('should use default edgeAccess when not provided', () => {
            const payload = {
                storage: [
                    {
                        name: 'my-storage',
                        dir: './public',
                        prefix: 'assets',
                    },
                ],
            };
            const transformedPayload: AzionConfig = {};

            const result = strategy.transformToConfig(payload, transformedPayload);

            expect(result![0].edgeAccess).toBe('read_only');
        });

        it('should transform multiple storage manifests to config format', () => {
            const payload = {
                storage: [
                    {
                        name: 'storage-1',
                        edge_access: 'read_only',
                        dir: './public',
                        prefix: 'assets',
                    },
                    {
                        name: 'storage-2',
                        edge_access: 'read_write',
                        dir: './static',
                        prefix: 'images',
                    },
                ],
            };
            const transformedPayload: AzionConfig = {};

            const result = strategy.transformToConfig(payload, transformedPayload);

            expect(result).toHaveLength(2);
            expect(result![0].name).toBe('storage-1');
            expect(result![1].name).toBe('storage-2');
            expect(result![0].edgeAccess).toBe('read_only');
            expect(result![1].edgeAccess).toBe('read_write');
            expect(transformedPayload.storage).toEqual(result);
        });

        it('should handle existing storage in transformedPayload', () => {
            const payload = {
                storage: [
                    {
                        name: 'new-storage',
                        edge_access: 'read_only',
                        dir: './public',
                        prefix: 'assets',
                    },
                ],
            };
            const transformedPayload: AzionConfig = {
                storage: [
                    {
                        name: 'existing-storage',
                        edgeAccess: 'read_write',
                        dir: './existing',
                        prefix: 'existing',
                    },
                ],
            };

            strategy.transformToConfig(payload, transformedPayload);

            // The transformToConfig method replaces the existing storage array
            expect(transformedPayload.storage).toHaveLength(1);
            expect(transformedPayload.storage![0].name).toBe('new-storage');
        });
    });
});
