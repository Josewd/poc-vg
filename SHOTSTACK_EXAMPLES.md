# Shotstack Video Maker - Exemplos de Uso

Este projeto agora inclui integração completa com a API Shotstack para criação de vídeos profissionais usando templates, **incluindo processamento automático de feeds MRSS** similar ao endpoint do FFmpeg.

## Configuração

- **API Key**: `ort2vvEEUIGo3VifniEcXv7AdtEhdcBvvAk5dEpS`
- **Webhook URL**: `https://webhook.site/c3543d8c-beca-4707-a1c2-8a84545cdea0`

## 🚀 Endpoint Principal - Processar Feed MRSS

### **POST** `/shotstack` ⭐ **NOVO**

**Este é o endpoint principal**, similar ao endpoint do FFmpeg. Recebe uma URL de feed MRSS e gera automaticamente vídeos para os itens usando Shotstack.

```json
{
  "url": "https://rss.cnn.com/rss/edition.rss",
  "templateId": "2635a995-c613-478b-8dd6-429529854211",
  "maxItems": 5
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Processamento concluído: 4 vídeos criados, 1 erros",
  "summary": {
    "total": 5,
    "success": 4,
    "errors": 1
  },
  "videos": [
    {
      "title": "Breaking: Important News Story",
      "link": "https://example.com/news/story1",
      "imageUrl": "https://example.com/image1.jpg",
      "videoUrl": "https://cdn.shotstack.io/au/v1/video1.mp4",
      "status": "success"
    },
    {
      "title": "Tech Update: New Innovation",
      "link": "https://example.com/news/story2",
      "imageUrl": "https://example.com/image2.jpg",
      "videoUrl": "",
      "status": "error",
      "error": "Template processing failed"
    }
  ]
}
```

**Características:**
- ✅ Processa feeds RSS/MRSS automaticamente
- ✅ Extrai imagens dos itens ou do conteúdo do artigo
- ✅ Cria vídeos usando template Shotstack
- ✅ Aguarda conclusão de cada vídeo (polling automático)
- ✅ Retorna URLs dos vídeos prontos
- ✅ Tratamento robusto de erros
- ✅ Limitação configurável de itens (maxItems)
- ✅ Pausa entre requests para não sobrecarregar a API

### Exemplo com cURL:
```bash
curl -X POST http://localhost:3000/shotstack \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://rss.cnn.com/rss/edition.rss",
    "templateId": "2635a995-c613-478b-8dd6-429529854211",
    "maxItems": 3
  }'
```

## Outros Endpoints Disponíveis

### 1. Criar Vídeo Simples
**POST** `/shotstack/create`

Cria um vídeo usando um template com substituições básicas.

```json
{
  "templateId": "2635a995-c613-478b-8dd6-429529854211",
  "title": "Título do Vídeo",
  "imageUrl": "https://exemplo.com/imagem.jpg",
  "additionalReplacements": {
    "subtitle": "Subtítulo opcional",
    "author": "Nome do Autor"
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "videoUrl": "https://cdn.shotstack.io/au/v1/video.mp4",
  "message": "Vídeo criado com sucesso!"
}
```

### 2. Criar Vídeo de Notícia
**POST** `/shotstack/news`

Especializado para criar vídeos de notícias/artigos.

```json
{
  "templateId": "2635a995-c613-478b-8dd6-429529854211",
  "headline": "Manchete da Notícia",
  "imageUrl": "https://exemplo.com/noticia.jpg",
  "author": "Jornalista",
  "date": "2024-01-15"
}
```

### 3. Template Personalizado
**POST** `/shotstack/template`

Renderiza usando configuração completa de template.

```json
{
  "templateData": {
    "id": "2635a995-c613-478b-8dd6-429529854211",
    "merge": [
      {
        "find": "headline1",
        "replace": "2024"
      },
      {
        "find": "IMAGE_1",
        "replace": "https://templates.shotstack.io/car-sale-slideshow-video/27efb285-a3b2-47e6-8440-574a6b660183/pexels-photo-9513395.jpg"
      }
    ]
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "render": {
    "success": true,
    "message": "Created",
    "response": {
      "id": "b9db24e4-5a4c-4ccd-b43d-4ecfc51c0b2a",
      "status": "queued"
    }
  }
}
```

### 4. Verificar Status do Render
**GET** `/shotstack/status/:renderId`

Verifica o progresso de um render específico.

**Resposta:**
```json
{
  "success": true,
  "response": {
    "id": "b9db24e4-5a4c-4ccd-b43d-4ecfc51c0b2a",
    "status": "done",
    "url": "https://cdn.shotstack.io/au/v1/video.mp4"
  }
}
```

Status possíveis:
- `queued`: Na fila
- `fetching`: Buscando recursos
- `rendering`: Renderizando
- `saving`: Salvando
- `done`: Concluído
- `failed`: Falhou

### 5. Listar Todos os Renders
**GET** `/shotstack/renders`

Lista todos os renders da conta.

## Comparação com FFmpeg

| Recurso | FFmpeg (Atual) | Shotstack (Novo) |
|---------|----------------|------------------|
| **Entrada** | Feed MRSS URL | Feed MRSS URL |
| **Processamento** | Local (FFmpeg) | Cloud (Shotstack) |
| **Qualidade** | Básica | Profissional |
| **Templates** | Código fixo | Templates visuais |
| **Escalabilidade** | Limitada | Alta |
| **Velocidade** | Média | Rápida (paralelo) |
| **Recursos** | CPU local | Cloud infinita |

## Exemplo de Uso Completo

```javascript
// 1. Processar feed automaticamente
const response = await fetch('http://localhost:3000/shotstack', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
    templateId: '2635a995-c613-478b-8dd6-429529854211',
    maxItems: 10
  })
});

const result = await response.json();

// 2. Verificar resultados
console.log(`Criados: ${result.summary.success} vídeos`);
console.log(`Erros: ${result.summary.errors}`);

// 3. Usar URLs dos vídeos
result.videos.forEach(video => {
  if (video.status === 'success') {
    console.log(`Vídeo: ${video.title}`);
    console.log(`URL: ${video.videoUrl}`);
  }
});
```

## Casos de Uso

1. **🆕 Automação de Conteúdo**: Processar feeds RSS e gerar vídeos automaticamente
2. **📰 Portais de Notícias**: Converter artigos em vídeos profissionais
3. **📱 Redes Sociais**: Criar conteúdo visual para engajamento
4. **🎯 Marketing**: Gerar vídeos promocionais em escala
5. **🔄 Integração CMS**: Automatizar criação de vídeos em sistemas existentes

## Testes

Execute o script de teste para verificar todas as funcionalidades:

```bash
npm run test:shotstack
```

O script testa:
- ✅ Processamento de feed MRSS (endpoint principal)
- ✅ Criação de vídeos individuais
- ✅ Templates personalizados
- ✅ Verificação de status
- ✅ Listagem de renders

## Próximos Passos

- [ ] Cache de vídeos gerados para evitar re-processamento
- [ ] Interface web para gerenciar templates e renders
- [ ] Suporte a múltiplos templates por feed
- [ ] Webhooks para notificações em tempo real
- [ ] Analytics de uso e performance 