# Tech Spec - MRSS Video Generator

## Visão Geral

O **MRSS Video Generator** é uma aplicação Node.js/TypeScript que processa feeds RSS e gera automaticamente vídeos animados com efeitos Ken Burns e overlays de texto baseados no conteúdo dos artigos.

## Arquitetura do Sistema

### Stack Tecnológico

- **Runtime**: Node.js
- **Linguagem**: TypeScript
- **Framework Web**: Express.js
- **Processamento de Vídeo**: FFmpeg (via fluent-ffmpeg)
- **Parsing XML**: xml2js
- **Web Scraping**: Cheerio + Axios
- **UI**: HTML/CSS vanilla

### Estrutura do Projeto

```
poc-vg/
├── src/
│   ├── index.ts              # Servidor Express principal
│   ├── index.html            # Interface web
│   ├── style.css             # Estilos da interface
│   ├── router/
│   │   └── index.ts          # Rotas da API
│   └── services/
│       ├── feedParser.ts     # Processamento de feeds RSS
│       ├── imageScraper.ts   # Extração de imagens de artigos
│       └── videoMaker.ts     # Geração de vídeos com FFmpeg
├── public/                   # Arquivos estáticos (imagens/vídeos gerados)
├── package.json
└── tsconfig.json
```

## Componentes Principais

### 1. Servidor Principal (`src/index.ts`)

- **Responsabilidade**: Configuração e inicialização do servidor Express
- **Porta**: 3000
- **Middlewares**:
  - `express.json()` - Parse de JSON
  - `express.static()` - Servir arquivos estáticos
- **Rotas**:
  - `GET /` - Interface web
  - `POST /api/feed` - Processamento de feeds RSS

### 2. Router (`src/router/index.ts`)

- **Endpoint**: `POST /api/feed`
- **Input**: `{ url: string }` - URL do feed RSS
- **Output**: `{ videos: string[] }` - Array de URLs dos vídeos gerados
- **Validação**: Verifica presença da URL do feed
- **Error Handling**: Retorna 400 para input inválido, 500 para erros de processamento

### 3. Feed Parser (`src/services/feedParser.ts`)

**Funcionalidades**:
- Faz requisição HTTP para obter o feed RSS
- Parse XML do feed usando `xml2js`
- Extrai título, link e imagem de cada item
- Processa até 10 itens por feed
- Fallback para image scraper quando media:content não está disponível
- Gera vídeo usando `createAdvancedStoryVideo`

**Fluxo**:
1. Download do feed RSS
2. Parse XML → JSON
3. Extração de metadados dos itens
4. Obtenção de imagens (direto do feed ou via scraping)
5. Geração de vídeos

### 4. Image Scraper (`src/services/imageScraper.ts`)

**Funcionalidade**:
- Scraping de imagens de artigos web
- Usa Cheerio para parse HTML
- Retorna a primeira imagem encontrada
- Error handling com fallback para null

### 5. Video Maker (`src/services/videoMaker.ts`)

**Funções Disponíveis**:

#### `createKenBurnsVideo(title, imageUrl)`
- Vídeo básico com efeito Ken Burns
- Zoom de 100% para 120%
- Texto centralizado na parte inferior
- Duração: 15 segundos

#### `createKenBurnsVideoWithText(title, imageUrl, options)`
- Versão customizável do vídeo Ken Burns
- **Opções**:
  - `fontSize`: Tamanho da fonte (padrão: 48)
  - `fontColor`: Cor da fonte (padrão: 'white')
  - `backgroundColor`: Cor de fundo do texto (padrão: 'black@0.5')
  - `position`: Posição do texto ('top', 'center', 'bottom')
  - `showBackground`: Mostrar fundo do texto (padrão: true)

#### `createAnimatedStoryVideo(title, imageUrl, options)`
- Vídeo com animações sequenciais
- **Timeline**:
  - 0-2s: Zoom suave (100% → 115%)
  - 2s: Overlay preto (30% opacidade)
  - 2s: Tag "EXCLUSIVE" aparece
  - 4s: Título principal aparece
  - 6.5s: Call-to-action aparece
- **Opções**:
  - `exclusive`: Mostrar tag exclusive (padrão: true)
  - `ctaText`: Texto do CTA (padrão: "READ MORE")
  - `duration`: Duração em segundos (padrão: 8)

#### `createAdvancedStoryVideo(title, imageUrl, options)`
- Vídeo mais sofisticado com texto dividido em linhas
- **Features**:
  - Divisão automática do título em 3 partes
  - Animações de fade-in escalonadas
  - Text escaping para compatibilidade FFmpeg
  - Timeline personalizada
- **Opções**:
  - `exclusive`: Tag exclusive (padrão: true)
  - `duration`: Duração (padrão: 8)
  - `headlineLines`: Linhas do título customizadas

## Processamento de Vídeo

### FFmpeg Configuration

- **Resolução**: 1280x720 (HD) / 1920x1080 (Full HD)
- **Frame Rate**: 30 FPS
- **Codec**: H.264 (padrão FFmpeg)
- **Filtros Utilizados**:
  - `zoompan`: Efeito Ken Burns
  - `drawtext`: Overlays de texto
  - `drawbox`: Overlays gráficos
  - `enable`: Controle temporal de elementos

### Text Escaping

Função `escapeText()` remove caracteres problemáticos para FFmpeg:
- Aspas simples → backticks
- Dois pontos, parênteses, colchetes
- Vírgulas, ponto e vírgula
- Quebras de linha

## API Specification

### POST /api/feed

**Request**:
```json
{
  "url": "https://example.com/rss-feed.xml"
}
```

**Response Success (200)**:
```json
{
  "videos": [
    "/public/uuid-video-1.mp4",
    "/public/uuid-video-2.mp4"
  ]
}
```

**Response Error (400)**:
```json
{
  "error": "Missing feed URL"
}
```

**Response Error (500)**:
```json
{
  "error": "Failed to process feed"
}
```

## Dependências

### Produção
- `axios`: HTTP client para requisições
- `cheerio`: jQuery server-side para scraping
- `express`: Framework web
- `fluent-ffmpeg`: Interface Node.js para FFmpeg
- `uuid`: Geração de IDs únicos
- `xml2js`: Parser XML para JSON

### Desenvolvimento
- `typescript`: Compilador TypeScript
- `ts-node`: Execução direta de TypeScript
- `nodemon`: Auto-reload durante desenvolvimento
- `@types/*`: Definições de tipos TypeScript

## Considerações de Performance

1. **Limitação de Processamento**: Apenas 10 itens por feed
2. **Processamento Sequencial**: Vídeos são gerados um por vez
3. **Storage**: Arquivos gerados salvos em `/public`
4. **Memory Usage**: FFmpeg pode consumir memória significativa

## Limitações Conhecidas

1. **FFmpeg Dependency**: Requer FFmpeg instalado no sistema
2. **Storage Management**: Não há limpeza automática de arquivos antigos
3. **Error Handling**: Limitado para cenários de falha do FFmpeg
4. **Concurrent Processing**: Não suporta processamento paralelo
5. **Input Validation**: Validação básica de URLs

## Possíveis Melhorias

1. **Queue System**: Implementar sistema de filas para processamento assíncrono
2. **Storage Cleanup**: Rotina de limpeza de arquivos antigos
3. **Error Recovery**: Melhor handling de erros do FFmpeg
4. **Caching**: Cache de imagens e metadados
5. **Monitoring**: Logs estruturados e métricas
6. **Security**: Validação mais robusta de URLs e sanitização
7. **Scalability**: Suporte a múltiplas instâncias e load balancing

## Configuração de Desenvolvimento

```bash
# Instalação
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start
```

**Pré-requisitos**:
- Node.js 16+
- FFmpeg instalado no PATH do sistema
- TypeScript (instalado via dev dependencies) 