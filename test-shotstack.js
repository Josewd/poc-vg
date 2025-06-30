const axios = require('axios');

// Configuração
const API_BASE = 'http://localhost:3000';
const TEST_TEMPLATE_ID = '2635a995-c613-478b-8dd6-429529854211';
const TEST_IMAGE = 'https://templates.shotstack.io/car-sale-slideshow-video/27efb285-a3b2-47e6-8440-574a6b660183/pexels-photo-9513395.jpg';
const TEST_FEED_URL = 'https://rss.cnn.com/rss/edition.rss'; // CNN RSS feed para teste

async function testShotstackIntegration() {
  console.log('🎬 Testando integração Shotstack...\n');

  try {
    // Teste 0: Endpoint principal - Processar feed MRSS com Shotstack (NOVO)
    console.log('🆕 Testando endpoint principal - Processar feed MRSS...');
    const feedResponse = await axios.post(`${API_BASE}/shotstack`, {
      url: TEST_FEED_URL,
      templateId: TEST_TEMPLATE_ID,
      maxItems: 2 // Apenas 2 itens para teste
    });

    console.log('✅ Feed processado com Shotstack:', {
      success: feedResponse.data.success,
      message: feedResponse.data.message,
      summary: feedResponse.data.summary,
      videosCreated: feedResponse.data.videos?.length || 0
    });

    // Mostrar detalhes dos primeiros vídeos criados
    if (feedResponse.data.videos && feedResponse.data.videos.length > 0) {
      console.log('\n📹 Primeiros vídeos criados:');
      feedResponse.data.videos.slice(0, 2).forEach((video, index) => {
        console.log(`  ${index + 1}. ${video.title.substring(0, 50)}...`);
        console.log(`     Status: ${video.status}`);
        if (video.status === 'success') {
          console.log(`     URL: ${video.videoUrl}`);
        } else {
          console.log(`     Erro: ${video.error}`);
        }
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Erro ao processar feed MRSS:', error.response?.data || error.message);
  }

  try {
    // Teste 1: Criar vídeo simples
    console.log('\n1️⃣ Testando criação de vídeo simples...');
    const simpleVideoResponse = await axios.post(`${API_BASE}/shotstack/create`, {
      templateId: TEST_TEMPLATE_ID,
      title: 'Teste Shotstack Integration',
      imageUrl: TEST_IMAGE,
      additionalReplacements: {
        subtitle: 'Subtítulo de teste',
        author: 'Sistema de Teste'
      }
    });

    console.log('✅ Vídeo simples:', simpleVideoResponse.data);

  } catch (error) {
    console.error('❌ Erro ao criar vídeo simples:', error.response?.data || error.message);
  }

  try {
    // Teste 2: Criar vídeo de notícia
    console.log('\n2️⃣ Testando criação de vídeo de notícia...');
    const newsVideoResponse = await axios.post(`${API_BASE}/shotstack/news`, {
      templateId: TEST_TEMPLATE_ID,
      headline: 'Breaking News: Shotstack Integration Successful!',
      imageUrl: TEST_IMAGE,
      author: 'AI Reporter',
      date: new Date().toISOString().split('T')[0]
    });

    console.log('✅ Vídeo de notícia:', newsVideoResponse.data);

  } catch (error) {
    console.error('❌ Erro ao criar vídeo de notícia:', error.response?.data || error.message);
  }

  try {
    // Teste 3: Template personalizado (apenas iniciar render)
    console.log('\n3️⃣ Testando template personalizado...');
    const customTemplateResponse = await axios.post(`${API_BASE}/shotstack/template`, {
      templateData: {
        id: TEST_TEMPLATE_ID,
        merge: [
          {
            find: 'headline1',
            replace: 'Custom Template Test 2024'
          },
          {
            find: 'IMAGE_1',
            replace: TEST_IMAGE
          }
        ]
      }
    });

    console.log('✅ Template personalizado iniciado:', customTemplateResponse.data);

    // Teste 4: Verificar status do render
    if (customTemplateResponse.data.render?.response?.id) {
      console.log('\n4️⃣ Verificando status do render...');
      const renderId = customTemplateResponse.data.render.response.id;
      
      const statusResponse = await axios.get(`${API_BASE}/shotstack/status/${renderId}`);
      console.log('✅ Status do render:', statusResponse.data);
    }

  } catch (error) {
    console.error('❌ Erro ao testar template personalizado:', error.response?.data || error.message);
  }

  try {
    // Teste 5: Listar renders
    console.log('\n5️⃣ Listando todos os renders...');
    const rendersResponse = await axios.get(`${API_BASE}/shotstack/renders`);
    console.log('✅ Lista de renders (total):', rendersResponse.data.response?.data?.length || 0);

  } catch (error) {
    console.error('❌ Erro ao listar renders:', error.response?.data || error.message);
  }

  console.log('\n🎉 Testes concluídos!');
  console.log('\n💡 Principais recursos testados:');
  console.log('   ✅ Processamento automático de feeds MRSS');
  console.log('   ✅ Criação de vídeos individuais');
  console.log('   ✅ Templates personalizados');
  console.log('   ✅ Verificação de status');
  console.log('   ✅ Listagem de renders');
}

// Função para aguardar o servidor estar ativo
async function waitForServer() {
  console.log('⏳ Aguardando servidor estar ativo...');
  
  for (let i = 0; i < 30; i++) {
    try {
      await axios.get(`${API_BASE}/shotstack/renders`);
      console.log('✅ Servidor ativo!\n');
      return true;
    } catch (error) {
      if (i === 29) {
        console.error('❌ Servidor não respondeu após 30 tentativas');
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Executar testes
async function main() {
  console.log('🚀 Iniciando testes da integração Shotstack\n');
  
  const serverReady = await waitForServer();
  if (!serverReady) {
    console.log('💡 Para executar os testes, primeiro inicie o servidor:');
    console.log('   npm run dev');
    return;
  }

  await testShotstackIntegration();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testShotstackIntegration, waitForServer }; 