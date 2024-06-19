import { Azion } from 'azion';

const user = new Azion({ token: process.env.token });

const edgeStorageExample = async () => {
  const testBucketName = 'ola-pessoal';
  const testObjectName = 'test-object';
  const testFileContent = 'Hello, world!';

  console.log('Listando todos os buckets...');
  const buckets = await user.storage.getAll();
  console.log('Buckets:', buckets);

  let bucket = buckets.find((b) => b.name === testBucketName);
  if (!bucket) {
    console.log('Criando um novo bucket...');
    bucket = await user.storage.create(testBucketName, 'read_write');
    console.log('Bucket criado:', bucket);
  } else {
    console.log('Bucket já existe:', bucket);
  }

  console.log(`Listando objetos no bucket '${testBucketName}'...`);
  console.log(await user.storage.get(testBucketName));
  const objects = await user.storage.get(testBucketName).listObjects();
  console.log('Objetos:', objects);

  console.log(`Fazendo upload de um objeto para o bucket '${testBucketName}'...`);
  const uploadResponse = await user.storage.get(testBucketName).uploadObject(testObjectName, testFileContent);
  console.log('Upload realizado:', uploadResponse);

  console.log(`Obtendo o objeto '${testObjectName}' do bucket '${testBucketName}'...`);
  const object = await user.storage.get(testBucketName).getObject(testObjectName);
  console.log('Objeto obtido:', object);

  console.log(`Atualizando o objeto '${testObjectName}' no bucket '${testBucketName}'...`);
  const newContent = 'Hello, updated world!';
  const updateResponse = await user.storage.get(testBucketName).updateObject(testObjectName, newContent);
  console.log('Objeto atualizado:', updateResponse);

  console.log(`Deletando o objeto '${testObjectName}' do bucket '${testBucketName}'...`);
  const deleteObjectResponse = await user.storage.get(testBucketName).deleteObject(testObjectName);
  console.log('Objeto deletado:', deleteObjectResponse);

  console.log(`Deletando o bucket '${testBucketName}'...`);
  const deleteBucketResponse = await user.storage.delete(testBucketName);
  console.log('Bucket deletado:', deleteBucketResponse);
};

await edgeStorageExample();
