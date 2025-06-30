# 🎬 Video Generator com Shotstack

Gerador automático de vídeos profissionais a partir de feeds MRSS usando a API Shotstack.

## 🚀 Como Usar

### 1. Iniciar o Servidor
```bash
npm install
npm run dev
```

### 2. Gerar Vídeos Automaticamente
**POST** `http://localhost:3000/shotstack`

```json
{
  "url": "https://rss.cnn.com/rss/edition.rss",
  "templateId": "2635a995-c613-478b-8dd6-429529854211",
  "maxItems": 5
}
```

### 3. Receber URLs dos Vídeos
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
      "title": "Breaking News Story",
      "videoUrl": "https://cdn.shotstack.io/au/v1/video.mp4",
      "status": "success"
    }
  ]
}
```

## ✨ O Que Faz

1. **Recebe** uma URL de feed RSS/MRSS
2. **Extrai** títulos, imagens e metadados dos artigos
3. **Cria** vídeos profissionais usando templates Shotstack
4. **Retorna** URLs dos vídeos prontos para uso

## 🎯 Exemplo Prático

```bash
curl -X POST http://localhost:3000/shotstack \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://feeds.bbci.co.uk/news/rss.xml",
    "templateId": "2635a995-c613-478b-8dd6-429529854211",
    "maxItems": 3
  }'
```

## 🔧 Configuração

O projeto já vem configurado com:
- **API Key Shotstack**: `ort2vvEEUIGo3VifniEcXv7AdtEhdcBvvAk5dEpS`
- **Template ID padrão**: `2635a995-c613-478b-8dd6-429529854211`
- **Webhook**: `https://webhook.site/c3543d8c-beca-4707-a1c2-8a84545cdea0`

## 🧪 Testar

```bash
npm run test:shotstack
```

## 📚 Documentação Completa

Veja `SHOTSTACK_EXAMPLES.md` para exemplos detalhados e outros endpoints disponíveis.

## 🔄 Fluxo Completo

```
Feed RSS → Parse → Extração de Imagens → Template Shotstack → Vídeo Profissional
```

**Simples assim!** 🎉 