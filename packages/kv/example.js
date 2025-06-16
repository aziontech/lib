// Exemplo de uso do novo setupKV
import { setupKV } from './src/index.js';

async function exemploKV() {
  try {
    console.log('🚀 Configurando KV...');

    // Criar instância KV configurada
    const kv = await setupKV({
      bucket: 'exemplo-bucket',
      ttl: 300, // 5 minutos
      cache: true,
      prefix: 'app:',
    });

    console.log('✅ KV configurado com sucesso!');

    // Armazenar dados
    console.log('\n📝 Armazenando dados...');
    await kv.put('usuario:123', {
      nome: 'João Silva',
      idade: 30,
      email: 'joao@exemplo.com',
    });

    await kv.put('config:tema', 'dark', {
      ttl: 600, // TTL específico de 10 minutos
      metadata: { versao: '1.0' },
    });

    console.log('✅ Dados armazenados!');

    // Recuperar dados
    console.log('\n📖 Recuperando dados...');
    const usuario = await kv.get('usuario:123');
    if (usuario.data) {
      console.log('Usuário:', usuario.data.value);
      console.log('Do cache:', usuario.data.fromCache);
    }

    const tema = await kv.get('config:tema');
    if (tema.data) {
      console.log('Tema:', tema.data.value);
      console.log('Metadados:', tema.data.metadata);
    }

    // Verificar existência
    console.log('\n🔍 Verificando existência...');
    const existe = await kv.has('usuario:123');
    console.log('Usuário existe:', existe.data);

    // Listar chaves
    console.log('\n📋 Listando chaves...');
    const todasChaves = await kv.list();
    console.log('Todas as chaves:', todasChaves.data?.keys);

    const chavesUsuario = await kv.list({ prefix: 'usuario:' });
    console.log('Chaves de usuário:', chavesUsuario.data?.keys);

    // Remover uma chave
    console.log('\n🗑️ Removendo chave...');
    await kv.delete('config:tema');
    console.log('Tema removido!');

    // Verificar se foi removido
    const temaExiste = await kv.has('config:tema');
    console.log('Tema ainda existe:', temaExiste.data);

    // Limpar tudo (comentado para não apagar dados reais)
    // console.log('\n🧹 Limpando tudo...');
    // await kv.clear();
    // console.log('Tudo limpo!');

    console.log('\n🎉 Exemplo concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar exemplo
exemploKV();
