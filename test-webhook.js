const axios = require('axios');

// Configuração
const API_BASE = 'http://localhost:3000';

async function testWebhookSystem() {
  console.log('🔗 Testando sistema de webhook...\n');

  try {
    // Teste 1: Simular webhook do Shotstack (render concluído)
    console.log('1️⃣ Simulando webhook de render concluído...');
    const mockRenderData = {
      id: 'test-render-123',
      owner: 'test-user',
      status: 'done',
      url: 'https://cdn.shotstack.io/au/v1/test-video.mp4',
      data: {
        timeline: { background: '#000000' }
      }
    };

    const webhookResponse = await axios.post(`${API_BASE}/webhook/shotstack`, mockRenderData);
    console.log('✅ Webhook processado:', {
      success: webhookResponse.data.success,
      message: webhookResponse.data.message,
      renderId: webhookResponse.data.renderId
    });

  } catch (error) {
    console.error('❌ Erro ao enviar webhook:', error.response?.data || error.message);
  }

  try {
    // Teste 2: Simular webhook de render com erro
    console.log('\n2️⃣ Simulando webhook de render com erro...');
    const mockErrorData = {
      id: 'test-render-error-456',
      owner: 'test-user',
      status: 'failed',
      error: 'Template processing failed: Invalid image URL'
    };

    const errorWebhookResponse = await axios.post(`${API_BASE}/webhook/shotstack`, mockErrorData);
    console.log('✅ Webhook de erro processado:', {
      success: errorWebhookResponse.data.success,
      renderId: errorWebhookResponse.data.renderId,
      status: errorWebhookResponse.data.status
    });

  } catch (error) {
    console.error('❌ Erro ao enviar webhook de erro:', error.response?.data || error.message);
  }

  try {
    // Teste 3: Consultar status via webhook store
    console.log('\n3️⃣ Consultando status via webhook store...');
    const statusResponse = await axios.get(`${API_BASE}/webhook/status/test-render-123`);
    console.log('✅ Status via webhook:', {
      id: statusResponse.data.response.id,
      status: statusResponse.data.response.status,
      url: statusResponse.data.response.url,
      webhookReceived: statusResponse.data.response.metadata?.webhookReceived
    });

  } catch (error) {
    console.error('❌ Erro ao consultar status:', error.response?.data || error.message);
  }

  try {
    // Teste 4: Consultar render inexistente
    console.log('\n4️⃣ Consultando render inexistente...');
    const notFoundResponse = await axios.get(`${API_BASE}/webhook/status/render-nao-existe`);
    console.log('✅ Resposta inesperada para render inexistente');

  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Render inexistente tratado corretamente:', error.response.data.error);
    } else {
      console.error('❌ Erro inesperado:', error.response?.data || error.message);
    }
  }

  try {
    // Teste 5: Listar todos os renders do webhook store
    console.log('\n5️⃣ Listando renders do webhook store...');
    const rendersResponse = await axios.get(`${API_BASE}/webhook/renders`);
    console.log('✅ Renders no webhook store:', {
      total: rendersResponse.data.total,
      renders: rendersResponse.data.renders.map(r => ({
        id: r.id,
        status: r.status,
        hasUrl: !!r.url,
        webhookReceived: r.metadata?.webhookReceived
      }))
    });

  } catch (error) {
    console.error('❌ Erro ao listar renders:', error.response?.data || error.message);
  }

  try {
    // Teste 6: Simular múltiplos updates do mesmo render
    console.log('\n6️⃣ Simulando múltiplos updates do mesmo render...');
    
    // Status: queued
    await axios.post(`${API_BASE}/webhook/shotstack`, {
      id: 'test-render-progressive-789',
      status: 'queued'
    });
    console.log('✅ Status queued registrado');

    // Status: rendering
    await axios.post(`${API_BASE}/webhook/shotstack`, {
      id: 'test-render-progressive-789',
      status: 'rendering'
    });
    console.log('✅ Status rendering atualizado');

    // Status: done
    await axios.post(`${API_BASE}/webhook/shotstack`, {
      id: 'test-render-progressive-789',
      status: 'done',
      url: 'https://cdn.shotstack.io/au/v1/progressive-video.mp4'
    });
    console.log('✅ Status done finalizado');

    // Verificar estado final
    const finalStatus = await axios.get(`${API_BASE}/webhook/status/test-render-progressive-789`);
    console.log('✅ Estado final:', {
      status: finalStatus.data.response.status,
      url: finalStatus.data.response.url
    });

  } catch (error) {
    console.error('❌ Erro ao testar updates progressivos:', error.response?.data || error.message);
  }

  console.log('\n🎉 Testes de webhook concluídos!');
  console.log('\n💡 Recursos testados:');
  console.log('   ✅ Recebimento de webhooks do Shotstack');
  console.log('   ✅ Armazenamento de status em memória');
  console.log('   ✅ Consulta de status via webhook store');
  console.log('   ✅ Tratamento de renders inexistentes');
  console.log('   ✅ Listagem de todos os renders');
  console.log('   ✅ Updates progressivos de status');
}

// Função para aguardar o servidor estar ativo
async function waitForServer() {
  console.log('⏳ Aguardando servidor estar ativo...');
  
  for (let i = 0; i < 30; i++) {
    try {
      await axios.get(`${API_BASE}/webhook/renders`);
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

// Testar webhook com render real (opcional)
async function testRealWebhook() {
  console.log('\n🔧 Teste opcional: Criando render real para testar webhook...');
  
  try {
    const renderResponse = await axios.post(`${API_BASE}/shotstack/template`, {
      templateData: {
        id: '2635a995-c613-478b-8dd6-429529854211',
        merge: [
          {
            find: 'headline1',
            replace: 'Webhook Test Video'
          },
          {
            find: 'IMAGE_1',
            replace: 'https://templates.shotstack.io/car-sale-slideshow-video/27efb285-a3b2-47e6-8440-574a6b660183/pexels-photo-9513395.jpg'
          }
        ]
      }
    });

    if (renderResponse.data.success) {
      const renderId = renderResponse.data.render.response.id;
      console.log(`✅ Render real iniciado: ${renderId}`);
      console.log('💡 O webhook será recebido automaticamente quando o render for concluído');
      console.log(`💡 Verifique o status em: ${API_BASE}/webhook/status/${renderId}`);
    }

  } catch (error) {
    console.error('❌ Erro ao criar render real:', error.response?.data || error.message);
  }
}

// Executar testes
async function main() {
  console.log('🚀 Iniciando testes do sistema de webhook\n');
  
  const serverReady = await waitForServer();
  if (!serverReady) {
    console.log('💡 Para executar os testes, primeiro inicie o servidor:');
    console.log('   npm run dev');
    return;
  }

  await testWebhookSystem();
  
  // Perguntar se quer testar com render real
  console.log('\n❓ Deseja testar com um render real do Shotstack? (pode demorar alguns minutos)');
  console.log('💡 Descomente a linha abaixo para ativar:');
  console.log('// await testRealWebhook();');
  
  // await testRealWebhook(); // Descomente para testar com render real
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testWebhookSystem, waitForServer, testRealWebhook }; 