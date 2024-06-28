
# Azion TypeScript SDK
Using the Azion SDK you can use the products inside or outside Azion. If used in a structure outside of Azion Runtime, the interfaces will communicate through the Fetch API. If the project is executed in the Azion runtime, communication will use internal structures and will be faster and more efficient.

## Installation
To use the Azion client, you must first install it in your project:

```sh
npm install azion
```

## Settings
Configure your client with your authentication token.

```javascript
import { createClient } from 'azion';

const user = createClient({ token: process.env.token });
```

## Usage Examples
#### Edge Storage
The following example demonstrates how to list, create, update, and delete buckets and objects in Azion Edge Storage.

```javascript
import { createClient } from 'azion';

const user = createClient({ token: process.env.token });

 const testBucketName = 'hello-guys';
 const testObjectName = 'test-object';
 const testFileContent = 'Hello, world!';

 console.log('List all buckets...');
 const buckets = await user.storage.getAll();
 console.log('Buckets:', buckets);

 let bucket = buckets.find((b) => b.name === testBucketName);
 if (!bucket) {
 console.log('Creating a new bucket...');
 bucket = await user.storage.create(testBucketName, 'read_write');
 console.log('Bucket created:', bucket);
 } else {
 console.log('Bucket already exists:', bucket);
 }

 console.log(`List objects in bucket '${testBucketName}'...`);
 const objects = await user.storage.get(testBucketName).listObjects();
 console.log('Objects:', objects);

 console.log(`Uploading an object to bucket '${testBucketName}'...`);
 const uploadResponse = await user.storage.get(testBucketName).uploadObject(testObjectName, testFileContent);
 console.log('Upload performed:', uploadResponse);

 console.log(`Getting object '${testObjectName}' from bucket '${testBucketName}'...`);
 const object = await user.storage.get(testBucketName).getObject(testObjectName);
 console.log('Object obtained:', object);

 console.log(`Updating object '${testObjectName}' in bucket '${testBucketName}'...`);
 const newContent = 'Hello, updated world!';
 const updateResponse = await user.storage.get(testBucketName).updateObject(testObjectName, newContent);
 console.log('Object updated:', updateResponse);

 console.log(`Deleting object '${testObjectName}' from bucket '${testBucketName}'...`);
 const deleteObjectResponse = await user.storage.get(testBucketName).deleteObject(testObjectName);
 console.log('Object deleted:', deleteObjectResponse);

 console.log(`Deleting bucket '${testBucketName}'...`);
 const deleteBucketResponse = await user.storage.delete(testBucketName);
 console.log('Bucket deleted:', deleteBucketResponse);
};

await edgeStorageExample();
```

### Edge SQL
The following example demonstrates how to create a database, create a table, insert and query data using the Azion SQL client.

```javascript
import { createClient } from 'azion';

const user = createClient({ token: process.env.token });

 const dbName = 'my-database';
 const dbs = await user.sql.getAll();
 console.log('Databases:', dbs);

 let db = dbs.find((database) => database.name === dbName);
 if (!db) {
 db = await user.sql.create(dbName);
 console.log('Database created:', db);
 } else {
 db = await user.sql.get(db.id);
 console.log('Specific database:', db);
 }

 const tableQuery = 'CREATE TABLE IF NOT EXISTS users (id INT PRIMARY KEY, name VARCHAR(100));';
 await db.execute([tableQuery]);
 console.log('Table created.');

 const users = await db.query(['SELECT * FROM users']);
 if (users.rows.length === 0) {
 const insertUser = await db.execute(["INSERT INTO users (id, name) VALUES (1, 'John Doe');"]);
 console.log('User added:', insertUser);
 } else {
 console.log('User already exists:', users);
 }

 const directQueryResult = await db.query(['SELECT * FROM users']);
 console.log('Direct query result:', directQueryResult);

 const del = await user.sql.delete(db.id);
 console.log('Database deleted:', del);
```

