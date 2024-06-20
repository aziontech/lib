import { Azion } from 'azion';

const user = new Azion({ token: process.env.token });

const edgeSqlExample = async () => {
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
  await db.query([tableQuery]);
  console.log('Table created.');

  const users = await db.query(['SELECT * FROM users']);
  if (users.rows.length === 0) {
    const insertUser = await db.query(["INSERT INTO users (id, name) VALUES (1, 'John Doe');"]);
    console.log('User added:', insertUser);
  } else {
    console.log('User already exists:', users);
  }

  const directQueryResult = await db.query(['SELECT * FROM users']);
  console.log('Direct query result:', directQueryResult);

  // const del = await user.sql.delete(db.id);
  // console.log('Database deleted:', del);
};

await edgeSqlExample();
