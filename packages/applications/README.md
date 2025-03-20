# Azion Applications Client

The Azion Applications Client provides a comprehensive interface to interact with Azion Edge Applications API. This client allows you to manage edge applications and their components including cache settings, device groups, function instances, origins, and rules engine configurations.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Debug Mode](#debug-mode)
- [Usage](#usage)
- [API Reference](#api-reference)
  - [Edge Application](#edge-application)
    - [createApplication](#createapplication)
    - [getApplication](#getapplication)
    - [getApplications](#getapplications)
    - [updateApplication](#updateapplication)
    - [deleteApplication](#deleteapplication)
  - [Cache Settings](#cache-settings)
    - [createCacheSetting](#createcachesetting)
    - [getCacheSetting](#getcachesetting)
    - [getCacheSettings](#getcachesettings)
    - [updateCacheSetting](#updatecachesetting)
    - [deleteCacheSetting](#deletecachesetting)
  - [Device Groups](#device-groups)
    - [createDeviceGroup](#createdevicegroup)
    - [getDeviceGroup](#getdevicegroup)
    - [getDeviceGroups](#getdevicegroups)
    - [updateDeviceGroup](#updatedevicegroup)
    - [deleteDeviceGroup](#deletedevicegroup)
- [Types](#types)
- [Contributing](#contributing)

## Installation

Install the package using npm or yarn:

```bash
npm install azion
```

or

```bash
yarn add azion
```

## Environment Variables

Configure the client using the following environment variables:

- `AZION_TOKEN`: Your Azion API token
- `AZION_DEBUG`: Enable debug mode (true/false)

Example `.env` file:

```env
AZION_TOKEN=your-api-token
AZION_DEBUG=true
```

## Debug Mode

Debug mode provides detailed logging of API requests and responses. Enable it by setting the `AZION_DEBUG` environment variable to `true` or passing `true` as the `debug` parameter in the methods.

## Usage

### Using Environment Variables

```typescript
import { createApplication, getApplications } from 'azion/applications';

// Create a new application
const { data: newApp, error } = await createApplication({
  data: { 
    name: "My Edge Application",
    delivery_protocol: "http,https",
    application_acceleration: true
  }
});

// List all applications
const { data: apps, error } = await getApplications({
  params: { page: 1, page_size: 20 }
});
```

### Using Client Configuration

```typescript
import createClient from 'azion/applications';

const client = createClient({
  token: 'your-api-token',
  options: { debug: true }
});

// Create application using client
const { data: app } = await client.createApplication({
  data: { name: "My Edge Application" }
});
```

## API Reference

### Edge Application

#### `createApplication`

Creates a new edge application.

**Parameters:**

- `data: { name: string; delivery_protocol: string; application_acceleration: boolean; }` - The data for the new application.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationResponse<AzionApplication>>` - The created application object or error if creation failed.

---

#### `getApplication`

Retrieves a specific edge application.

**Parameters:**

- `applicationId: number` - The ID of the application to retrieve.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationResponse<AzionApplication>>` - The retrieved application object or error if not found.

---

#### `getApplications`

Lists all edge applications.

**Parameters:**

- `params?: { page?: number; page_size?: number; order?: 'id' | 'name'; sort?: 'asc' | 'desc'; }` - Optional parameters for filtering and pagination.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationCollectionResponse<AzionApplication>>` - A collection of applications or error if retrieval failed.

---

#### `updateApplication`

Updates an existing edge application.

**Parameters:**

- `applicationId: number` - The ID of the application to update.
- `data: { name?: string; delivery_protocol?: string; application_acceleration?: boolean; }` - The updated data for the application.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationResponse<AzionApplication>>` - The updated application object or error if the update failed.

---

#### `deleteApplication`

Deletes an edge application.

**Parameters:**

- `applicationId: number` - The ID of the application to delete.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationResponse<AzionDeletedApplication>>` - Confirmation of deletion or error if the operation failed.

### Cache Settings

#### createCacheSetting

Creates a new cache setting.

**Parameters**:

- `data: { name: string; browser_cache_settings: string; cdn_cache_settings: string; }` - The data for the new cache setting.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns**:

`Promise<AzionApplicationResponse<AzionCacheSetting>>` - The created cache setting object or error if creation failed.

---

#### getCacheSetting

Retrieve a specific cache setting.

**Parameters**:

- `cacheSettingId: number` - The ID of the cache setting to retrieve.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns**:

- `Promise<AzionApplicationResponse<AzionCacheSetting>>` - The retrieved cache setting object or error if not found.
-

---

#### getCacheSettings

List all cache settings.

**Parameters**:

- `params?: { page?: number; page_size?: number; order?: 'id' | 'name'; sort?: 'asc' | 'desc'; }` - Optional parameters for filtering and pagination.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns**:

- `Promise<AzionApplicationCollectionResponse<AzionCacheSetting>>` - A collection of cache settings or error if retrieval failed.
  
---

#### updateCacheSetting

Update an existing cache setting.

**Parameters**:

- `cacheSettingId: number` - The ID of the cache setting to update.
- `data: { name?: string; browser_cache_settings?: string; cdn_cache_settings?: string; }` - The updated data for the cache setting.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns**:

- `Promise<AzionApplicationResponse<AzionCacheSetting>>` - The updated cache setting object or error if the update failed.

---

#### deleteCacheSetting

Delete a cache setting.

**Parameters**:

- `cacheSettingId: number` - The ID of the cache setting to delete.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns**:

- `Promise<AzionApplicationResponse<AzionDeletedCacheSetting>>` - Confirmation of deletion or error if the operation failed.

---

### Device Groups

#### `createDeviceGroup`

Creates a new device group.

**Parameters:**

- `data: { name: string; user_agent: string; }` - The data for the new device group.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationResponse<AzionDeviceGroup>>` - The created device group object or error if creation failed.

---

#### `getDeviceGroup`

Retrieves a specific device group.

**Parameters:**

- `deviceGroupId: number` - The ID of the device group to retrieve.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationResponse<AzionDeviceGroup>>` - The retrieved device group object or error if not found.

---

#### `getDeviceGroups`

Lists all device groups.

**Parameters:**

- `params?: { page?: number; page_size?: number; order?: 'id' | 'name'; sort?: 'asc' | 'desc'; }` - Optional parameters for filtering and pagination.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationCollectionResponse<AzionDeviceGroup>>` - A collection of device groups or error if retrieval failed.

---

#### `updateDeviceGroup`

Updates an existing device group.

**Parameters:**

- `deviceGroupId: number` - The ID of the device group to update.
- `data: { name?: string; user_agent?: string; }` - The updated data for the device group.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationResponse<AzionDeviceGroup>>` - The updated device group object or error if the update failed.

---

#### `deleteDeviceGroup`

Deletes a device group.

**Parameters:**

- `deviceGroupId: number` - The ID of the device group to delete.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationResponse<AzionDeletedDeviceGroup>>` - Confirmation of deletion or error if the operation failed.

### Function Instances

#### `createFunctionInstance`

Creates a new function instance.

**Parameters:**

- `data: ApiCreateFunctionInstancePayload` - The data for the new function instance.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationResponse<AzionFunctionInstance>>` - The created function instance object or error if creation failed.

---

#### `getFunctionInstance`

Retrieves a specific function instance.

**Parameters:**

- `functionInstanceId: number` - The ID of the function instance to retrieve.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationResponse<AzionFunctionInstance>>` - The retrieved function instance object or error if not found.

---

#### `getFunctionInstances`

Lists all function instances.

**Parameters:**

- `params?: ApiListFunctionInstancesParams` - Optional parameters for filtering and pagination.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationCollectionResponse<AzionFunctionInstance>>` - A collection of function instances or error if retrieval failed.

---

#### `updateFunctionInstance`

Updates an existing function instance.

**Parameters:**

- `functionInstanceId: number` - The ID of the function instance to update.
- `data: ApiUpdateFunctionInstancePayload` - The updated data for the function instance.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationResponse<AzionFunctionInstance>>` - The updated function instance object or error if the update failed.

---

#### `deleteFunctionInstance`

Deletes a function instance.

**Parameters:**

- `functionInstanceId: number` - The ID of the function instance to delete.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationResponse<AzionDeletedFunctionInstance>>` - Confirmation of deletion or error if the operation failed.

### Origins

#### `createOrigin`

Creates a new origin.

**Parameters:**

- `data: { name: string; url: string; }` - The data for the new origin.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationResponse<AzionOrigin>>` - The created origin object or error if creation failed.

---

#### `getOrigin`

Retrieves a specific origin.

**Parameters:**

- `originId: number` - The ID of the origin to retrieve.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationResponse<AzionOrigin>>` - The retrieved origin object or error if not found.

---

#### `getOrigins`

Lists all origins.

**Parameters:**

- `params?: { page?: number; page_size?: number; order?: 'id' | 'name'; sort?: 'asc' | 'desc'; }` - Optional parameters for filtering and pagination.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationCollectionResponse<AzionOrigin>>` - A collection of origins or error if retrieval failed.

---

#### `updateOrigin`

Updates an existing origin.

**Parameters:**

- `originId: number` - The ID of the origin to update.
- `data: { name?: string; url?: string; }` - The updated data for the origin.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationResponse<AzionOrigin>>` - The updated origin object or error if the update failed.

---

#### `deleteOrigin`

Deletes an origin.

**Parameters:**

- `originId: number` - The ID of the origin to delete.
- `options?: { debug?: boolean }` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationResponse<AzionDeletedOrigin>>` - Confirmation of deletion or error if the operation failed.

### Rules Engine

#### `createRule`

Creates a new rule.

**Parameters:**

- `data: ApiCreateRulePayload` - The data for the new rule.
- `options?: AzionClientOptions` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationResponse<AzionRule>>` - The created rule object or error if creation failed.

---

#### `getRule`

Retrieves a specific rule.

**Parameters:**

- `ruleId: number` - The ID of the rule to retrieve.
- `options?: AzionClientOptions` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationResponse<AzionRule>>` - The retrieved rule object or error if not found.

---

#### `getRules`

Lists all rules.

**Parameters:**

- `params?: ApiListRulesParams` - Optional parameters for filtering and pagination.
- `options?: AzionClientOptions` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationCollectionResponse<AzionRule>>` - A collection of rules or error if retrieval failed.

---

#### `updateRule`

Updates an existing rule.

**Parameters:**

- `ruleId: number` - The ID of the rule to update.
- `data: ApiUpdateRulePayload` - The updated data for the rule.
- `options?: AzionClientOptions` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationResponse<AzionRule>>` - The updated rule object or error if the update failed.

---

#### `deleteRule`

Deletes a rule.

**Parameters:**

- `ruleId: number` - The ID of the rule to delete.
- `options?: AzionClientOptions` - Optional parameters including debug mode.

**Returns:**

- `Promise<AzionApplicationResponse<AzionDeletedRule>>` - Confirmation of deletion or error if the operation failed.

## Types

The package exports various TypeScript types for use with the API:

```typescript
import type {
  AzionApplication,
  AzionCacheSetting,
  AzionDeviceGroup,
  AzionFunctionInstance,
  AzionOrigin,
  AzionRule,
  AzionClientOptions
} from 'azion/applications';
```

For more detailed information about these types, please refer to the source code.

## Contributing

Feel free to submit issues or pull requests to improve the functionality or documentation.
