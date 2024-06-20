import { Azion } from 'azion';

const user = new Azion({ token: '', debug: true });

const getUsers = async () => {
  const dbName = 'my-database';
  const dbs = await user.sql.getAll();
  let db = dbs.find((database) => database.name === dbName);
  if (!db) {
    db = await user.sql.create(dbName);
  } else {
    db = await user.sql.get(db.id);
  }
  const users = await db.query(['SELECT * FROM users']);
  return users.rows;
};

const getStorageExample = async () => {
  const testBucketName = 'ola-pessoal';
  const testObjectName = 'test-object';
  const testFileContent = 'Hello, world!';

  let bucket = await user.storage.get(testBucketName);
  if (!bucket) {
    bucket = await user.storage.create(testBucketName, 'read_write');
  }

  const objects = await bucket.listObjects();
  const uploadResponse = await bucket.uploadObject(testObjectName, testFileContent);
  const object = await bucket.getObject(testObjectName);
  const newContent = 'Hello, updated world!';
  const updateResponse = await bucket.updateObject(testObjectName, newContent);
  const deleteObjectResponse = await bucket.deleteObject(testObjectName);
  const deleteBucketResponse = await user.storage.delete(testBucketName);

  return { objects, uploadResponse, object, updateResponse, deleteObjectResponse, deleteBucketResponse };
};

const main = async (event) => {
  const url = new URL(event.request.url);
  let response;

  if (url.pathname === '/sql') {
    const users = await getUsers();
    const userRows = users.map((user) => `<tr><td>${user[0]}</td><td>${user[1]}</td></tr>`).join('');
    const html = `
      <html>
        <body>
          <h1>Users</h1>
          <table border="1">
            <tr><th>ID</th><th>Name</th></tr>
            ${userRows}
          </table>
        </body>
      </html>
    `;
    response = new Response(html, { headers: new Headers([['Content-Type', 'text/html']]), status: 200 });
  } else if (url.pathname === '/storage') {
    const storageData = await getStorageExample();
    response = new Response(JSON.stringify(storageData), {
      headers: new Headers([['Content-Type', 'application/json']]),
      status: 200,
    });
  } else {
    response = new Response('Not Found', { status: 404 });
  }

  return response;
};

export default main;
