# 🏴‍☠️ Pirate Battle

Pirate Battle é um jogo 2D top-down de combate naval desenvolvido como parte do desafio técnico para a posição de **Game Developer na Jungle Gaming**.

O projeto combina **React + TypeScript** para a estrutura da aplicação e **PixiJS** como engine de renderização do jogo, com foco em gameplay, organização de código, efeitos visuais, persistência de configurações, ranking e testes automatizados.

## 🎮 Gameplay

O jogador controla um navio pirata em uma arena marítima e deve sobreviver enquanto enfrenta diferentes tipos de inimigos.

### Principais mecânicas

- Movimento em quatro direções
- Rotação do navio de acordo com a direção do movimento
- Tiro frontal
- Tiro lateral com 3 projéteis
- Dois tipos de inimigos:
  - **Chaser** — persegue o jogador
  - **Shooter** — dispara projéteis à distância

- Sistema de vida e dano
- Colisão com ilhas
- Colisão entre projéteis e inimigos
- Pontuação por inimigo derrotado
- Spawn configurável de inimigos
- Timer configurável
- Pause
- Restart
- Game Over
- Efeitos visuais para disparos, dano e destruição

### 🕹️ Controles

| Ação                   | Controle              |
| ---------------------- | --------------------- |
| Movimento              | `WASD` / `Arrow Keys` |
| Tiro frontal           | `Space`               |
| Tiro lateral           | `Shift`               |
| Pause                  | `P`                   |
| Restart após Game Over | `R`                   |

---

## 🖥️ Interface

O jogo possui diferentes telas e estados:

- **Main Menu**
- **Game**
- **Options**
- **Pause**
- **Result**
- **Ranking**
- **Match History**

As configurações de jogo podem ser alteradas pelo menu de opções.

### Configurações disponíveis

- Duração da partida:
  - 30 segundos
  - 60 segundos
  - 90 segundos

- Taxa de spawn:
  - Low
  - Normal
  - High

As configurações selecionadas são persistidas utilizando `localStorage`.

---

## ⚙️ Tecnologias

### Front-end

- **React**
- **TypeScript**
- **Vite**
- **PixiJS**
- **ESLint**

### Data / API

- **Axios**
- **TanStack Query**
- **MSW (Mock Service Worker)**

### Testes

- **Playwright**

---

## 🏗️ Arquitetura

A aplicação utiliza React para controlar o fluxo das telas e da interface, enquanto o PixiJS é responsável pela renderização e pelo game loop.

### Estrutura principal

```text
src/
├── screens/
│   ├── GameScreen/
│   ├── MainMenu/
│   ├── Options/
│   ├── ResultScreen/
│   ├── RankingScreen/
│   └── HistoryScreen/
│
├── game/
│   ├── entities/
│   │   ├── Player.ts
│   │   ├── Chaser.ts
│   │   └── Shooter.ts
│   │
│   └── config/
│       └── gameConfig.ts
│
├── hooks/
│   ├── useRanking.ts
│   ├── useHistory.ts
│   └── useSubmitScore.ts
│
├── services/
│   ├── api.ts
│   └── rankingService.ts
│
└── mocks/
    ├── handlers.ts
    └── browser.ts
```

O arquivo `GameScreen` inicializa a aplicação PixiJS, controla o game loop e integra as entidades, colisões, projéteis, efeitos visuais e HUD.

As entidades principais foram separadas em classes próprias para manter responsabilidades relacionadas ao jogador e aos inimigos organizadas.

A configuração de gameplay também foi centralizada em `gameConfig.ts`, facilitando ajustes de velocidade, vida, cooldowns, spawn e outras propriedades.

Para mais detalhes sobre as decisões de arquitetura:

👉 **[ARCHITECTURE.md](./ARCHITECTURE.md)**

---

## 🌊 PixiJS

O jogo utiliza o **PixiJS** para renderização da arena e das entidades.

A aplicação PixiJS é criada dentro do `GameScreen` e utiliza um ticker para executar o game loop.

O loop atualiza:

- Movimento do jogador
- Movimento dos inimigos
- Projéteis
- Colisões
- Cooldowns
- Spawn de inimigos
- Timer
- Efeitos temporários
- Estado da partida

Os assets são carregados utilizando o sistema de assets do PixiJS e algumas texturas são compartilhadas entre diferentes elementos para evitar carregamentos desnecessários.

---

## 💥 Efeitos visuais

O jogo utiliza os assets fornecidos no desafio para criar feedback visual durante o gameplay.

Entre eles:

- Efeito de disparo
- Efeito de dano
- Explosão ao destruir inimigos
- Explosão ao destruir o jogador
- Sprites de projéteis
- Elementos visuais da arena
- HUD personalizado

Os efeitos temporários possuem duração controlada e são removidos do stage após sua utilização.

---

## ❤️ HUD

Durante a partida, o HUD apresenta:

- Vida atual do jogador
- Pontuação
- Tempo restante

O HUD também se adapta ao tamanho disponível da tela.

---

## 🌐 API e dados

O projeto possui uma camada de serviços utilizando **Axios** para comunicação com uma API.

Atualmente os endpoints são simulados utilizando **MSW**.

### Endpoints

```text
GET  /api/ranking
GET  /api/history
POST /api/scores
```

### Ranking

Retorna a lista de pontuações dos jogadores.

### History

Retorna o histórico de partidas.

### Submit Score

Envia o nome do jogador e sua pontuação ao final da partida.

---

## 🔄 TanStack Query

O **TanStack Query** é utilizado para gerenciamento dos dados provenientes da API.

Foram criados hooks específicos para cada operação:

```text
useRanking
useHistory
useSubmitScore
```

Além do gerenciamento das requisições, o projeto utiliza invalidação de queries após o envio de uma nova pontuação para manter os dados de ranking e histórico atualizados.

Também existem estados de:

- Loading
- Error
- Success
- Submitting

---

## 🧪 MSW

O **Mock Service Worker** é utilizado para simular a API durante o desenvolvimento.

Isso permite que a aplicação utilize uma camada de comunicação semelhante à de uma API real sem depender de um backend externo.

Os handlers simulam:

```text
GET /api/ranking
GET /api/history
POST /api/scores
```

---

## 🧪 Testes E2E

O projeto utiliza **Playwright** para testes end-to-end.

Os testes cobrem os principais fluxos da aplicação:

- Abertura do Main Menu
- Navegação entre telas
- Persistência das configurações
- Abertura do Ranking
- Inicialização do gameplay
- Renderização do canvas
- Game Over

### Executar os testes

```bash
npx playwright test
```

Para executar os testes com interface visual:

```bash
npx playwright test --ui
```

---

## 🚀 Como executar o projeto

### Pré-requisitos

- Node.js
- npm

### Instalação

Clone o repositório:

```bash
git clone https://github.com/franbaltar/pirate-battle.git
```

Entre na pasta:

```bash
cd pirate-battle
```

Instale as dependências:

```bash
npm install
```

Execute o projeto:

```bash
npm run dev
```

O Vite disponibilizará a aplicação localmente.

---

## 🔧 Scripts

### Desenvolvimento

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Testes E2E

```bash
npx playwright test
```

---

## 🎯 Objetivos do projeto

O principal objetivo deste projeto foi aplicar conceitos de desenvolvimento de jogos utilizando tecnologias web modernas, com atenção especial para:

- Renderização 2D com PixiJS
- Game loop
- Gerenciamento de entidades
- Detecção de colisões
- Controle de estado do jogo
- Organização entre UI e gameplay
- Gerenciamento de dados assíncronos
- Mock de APIs
- Testes automatizados
- Feedback visual durante o gameplay

---

## 📌 Escopo e limitações

O projeto foi desenvolvido dentro do período disponível para o desafio técnico, priorizando as funcionalidades principais de gameplay, arquitetura, integração de dados e testes.

Alguns recursos avançados não fazem parte desta implementação, como:

- Backend real
- Sistema multiplayer
- Controles touch completos
- Sistema de áudio completo
- Física avançada
- Sistema ECS
- Otimizações avançadas de bundle
- Cenários complexos de rede

---

## 👨‍💻 Autor

**Francisco Baltar**

Desenvolvedor Full Stack em início de carreira, graduado em Análise e Desenvolvimento de Sistemas.

**GitHub:**
https://github.com/franbaltar

**Projeto desenvolvido para o desafio técnico da Jungle Gaming.**
