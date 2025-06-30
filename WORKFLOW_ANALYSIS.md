# Análise do Workflow Proposto - Phase 1

## Estado Atual vs Requisitos Propostos

### ✅ **Já Implementado**

1. **Ingestão de Feed MRSS/RSS**
   - ✅ Recebe URL do feed via API POST `/api/feed`
   - ✅ Processa feeds RSS/MRSS usando `xml2js`
   - ✅ Extrai metadados dos artigos

2. **Limitação de Artigos**
   - ✅ Processa máximo 10 artigos por feed
   - ✅ Fallback para quantidade disponível se < 10

3. **Extração de Imagens**
   - ✅ Detecta `media:content` no feed
   - ✅ Fallback para scraping da primeira imagem do artigo
   - ❌ **GAP**: Não implementado fallback para logo do publisher

4. **Extração de Títulos**
   - ✅ Extrai título de cada artigo do feed

5. **Geração de Vídeo**
   - ✅ Efeito Ken Burns implementado
   - ✅ FFmpeg para processamento
   - ✅ Overlays de texto e animações
   - ❌ **GAP**: Direção específica (centro → top-left)
   - ❌ **GAP**: Duração de 20 segundos (atual: 8-15s)

### ❌ **Não Implementado - Requer Desenvolvimento**

1. **Sistema de Scheduling**
   - ❌ Scanning automático a cada 3 dias
   - ❌ Detecção de novos artigos
   - ❌ Sistema de cron jobs

2. **Gerenciamento de Storage**
   - ❌ Rotação automática de vídeos
   - ❌ Deletion de vídeos antigos
   - ❌ Controle de espaço em disco

3. **API de Feed Player**
   - ❌ Endpoint para recuperar playlists
   - ❌ Sistema de playlist automática
   - ❌ Gerenciamento de estado dos vídeos

4. **Animações Específicas**
   - ❌ CTA button com animação específica
   - ❌ Timeline de animações conforme sample

## Plano de Implementação - Phase 1

### **Milestone 1: Ajustes na Geração de Vídeo**

#### 1.1 Atualizar Ken Burns Effect
```typescript
// Modificar videoMaker.ts
function createKenBurnsVideo() {
  // Implementar pan específico: center → top-left
  // Duração: 20 segundos
  // Zoom: 1.0 → 1.15 em 20s
}
```

#### 1.2 Implementar Fallback para Publisher Logo
```typescript
// Adicionar em feedParser.ts
async function getPublisherLogo(feedUrl: string): Promise<string> {
  // Extrair domínio do feed
  // Buscar logo via favicon ou scraping
  // Fallback para logo padrão
}
```

#### 1.3 Animação de CTA Específica
```typescript
// Implementar timeline conforme sample:
// 0-5s: Imagem com Ken Burns
// 5-15s: Título aparece com fade-in
// 15-20s: CTA button slide-in
```

### **Milestone 2: Sistema de Scheduling**

#### 2.1 Implementar Cron Jobs
```typescript
// Adicionar dependência: node-cron
import cron from 'node-cron';

// Executar a cada 3 dias
cron.schedule('0 0 */3 * *', async () => {
  await processAllFeeds();
});
```

#### 2.2 Sistema de Detecção de Novos Artigos
```typescript
interface ProcessedArticle {
  id: string;
  title: string;
  url: string;
  publishDate: Date;
  videoPath: string;
}

// Implementar cache/database para tracking
```

#### 2.3 Storage Management
```typescript
// Implementar rotação de vídeos
async function rotateVideos(maxVideos: number = 10) {
  // Ordenar por data
  // Deletar mais antigos
  // Manter apenas os 10 mais recentes
}
```

### **Milestone 3: API de Feed Player**

#### 3.1 Novos Endpoints
```typescript
// router/playlist.ts
GET /api/playlist/:feedId      // Recuperar playlist
GET /api/videos/:feedId        // Listar vídeos do feed
POST /api/feeds                // Registrar novo feed
DELETE /api/videos/:videoId    // Deletar vídeo específico
```

#### 3.2 Database Schema
```sql
-- Feeds registrados
CREATE TABLE feeds (
  id UUID PRIMARY KEY,
  url VARCHAR NOT NULL,
  publisher_name VARCHAR,
  logo_url VARCHAR,
  created_at TIMESTAMP,
  last_processed TIMESTAMP
);

-- Artigos processados
CREATE TABLE articles (
  id UUID PRIMARY KEY,
  feed_id UUID REFERENCES feeds(id),
  title VARCHAR NOT NULL,
  url VARCHAR NOT NULL,
  image_url VARCHAR,
  video_path VARCHAR,
  publish_date TIMESTAMP,
  created_at TIMESTAMP
);
```

## Especificações Técnicas Detalhadas

### **Ken Burns Effect - Requisitos Específicos**

```typescript
// Implementação proposta
export async function createArticleVideo(
  title: string,
  imageUrl: string,
  publisherLogo?: string
): Promise<string> {
  
  const videoFilters = [
    // Ken Burns: center → top-left over 20 seconds
    "zoompan=z='min(1+0.0075*t,1.15)'" +
    ":x='iw/2-(iw/zoom/2)-t*2'" +  // Move para esquerda
    ":y='ih/2-(ih/zoom/2)-t*1.5'" + // Move para cima
    ":d=600:s=1280x720", // 20s * 30fps = 600 frames
    
    // Timeline de animações
    // 0-5s: Apenas imagem
    // 5-15s: Título fade-in
    `drawtext=text='${escapeText(title)}'` +
    ":fontsize=48:fontcolor=white" +
    ":x='(w-text_w)/2':y='h-text_h-150'" +
    ":alpha='if(lt(t,5),0,if(lt(t,6),(t-5),1))'" +
    ":enable='gte(t,5)'",
    
    // 15-20s: CTA button
    `drawbox=x='(w-200)/2':y='h-80':w=200:h=50` +
    ":color=red@0.8:t=fill" +
    ":alpha='if(lt(t,15),0,if(lt(t,16),(t-15),1))'" +
    ":enable='gte(t,15)'",
    
    `drawtext=text='READ MORE'` +
    ":fontsize=24:fontcolor=white" +
    ":x='(w-text_w)/2':y='h-65'" +
    ":alpha='if(lt(t,15),0,if(lt(t,16),(t-15),1))'" +
    ":enable='gte(t,15)'"
  ];
  
  // Configurar para 20 segundos
  ffmpeg(imagePath)
    .loop(20)
    .videoFilter(videoFilters)
    .duration(20)
    .output(videoPath)
}
```

### **Sistema de Feeds Automático**

```typescript
// Estrutura proposta
class FeedManager {
  async registerFeed(url: string): Promise<string> {
    // Registrar feed no database
    // Processar imediatamente
    // Agendar processamento futuro
  }
  
  async processFeed(feedId: string): Promise<void> {
    // Buscar novos artigos
    // Comparar com cache
    // Gerar vídeos para novos artigos
    // Limpar vídeos antigos
  }
  
  async getPlaylist(feedId: string): Promise<Video[]> {
    // Retornar lista de vídeos ativos
    // Ordenados por data (mais recente primeiro)
  }
}
```

## Dependências Adicionais Necessárias

```json
{
  "dependencies": {
    "node-cron": "^3.0.0",      // Scheduling
    "sqlite3": "^5.1.0",        // Database local
    "sequelize": "^6.33.0",     // ORM
    "sharp": "^0.32.0"          // Processamento de imagens
  }
}
```

## Cronograma Estimado

- **Milestone 1**: 1-2 semanas
  - Ajustes na geração de vídeo
  - Implementação de fallbacks
  
- **Milestone 2**: 2-3 semanas
  - Sistema de scheduling
  - Storage management
  
- **Milestone 3**: 2-3 semanas
  - API de playlist
  - Interface de gerenciamento

**Total estimado**: 5-8 semanas para implementação completa

## Riscos e Considerações

1. **Performance**: FFmpeg pode ser CPU-intensivo para múltiplos vídeos
2. **Storage**: Controle de espaço em disco crítico
3. **Network**: Reliability de feeds externos
4. **Scaling**: Considerar queue system para produção
5. **Error Handling**: Robustez para falhas de rede/processamento

## Próximos Passos

1. **Validar requisitos** com sample de referência
2. **Definir prioridades** dos milestones
3. **Setup de database** (SQLite para desenvolvimento)
4. **Implementar Milestone 1** como MVP
5. **Testes e iteração** baseados em feedback 