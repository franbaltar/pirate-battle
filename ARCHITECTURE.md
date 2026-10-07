# Architecture

## Overview

React renders the application UI and screens. `App` owns navigation between screens and the shared game settings and result state. Game settings are persisted in `localStorage`.

PixiJS renders the real-time game and runs its gameplay loop. `GameScreen` is the integration point: the React screen initializes the PixiJS application, passes in settings, and reports the final score through its `onGameOver` callback.

Axios handles HTTP communication through a shared `/api` client. TanStack Query manages server state: hooks query ranking and match history, while score submission invalidates both queries after success. MSW provides the `/api/ranking`, `/api/history`, and `/api/scores` handlers in development; `main.tsx` starts the worker before rendering the React root in development mode.

Playwright covers end-to-end browser flows, including the main menu, options persistence, ranking, entering gameplay, and the timer-driven Game Over flow.

## Application Structure

`App` controls screen flow with a `screen` state and renders one screen at a time. It passes callbacks for navigation and game events, stores duration and spawn-rate settings in `localStorage`, and keeps the final score between gameplay and the result screen.

- **MainMenu** presents the entry actions and calls callbacks to open gameplay, options, ranking, or history.
- **GameScreen** receives duration and spawn-rate settings, initializes a PixiJS `Application` in a React-managed container, and runs gameplay through PixiJS stage objects, input handlers, and the ticker. When the game ends, it reports the score through `onGameOver`; `App` stores it and switches to **ResultScreen**.
- **Options** displays the current duration and spawn rate as controlled inputs, sends changes to `App`, and returns to the menu through `onBack`.
- **ResultScreen** displays the final score, accepts a player name, submits the score through `useSubmitScore`, and provides restart and menu callbacks.
- **RankingScreen** reads ranking data through `useRanking`, displays loading/error states and the ordered results, and returns to the menu through `onBack`.
- **HistoryScreen** reads match history through `useHistory`, displays loading/error states and localized match dates, and returns to the menu through `onBack`.

## PixiJS Game Architecture

### Initialization and canvas lifecycle

`GameScreen` uses a React `useEffect` to create a PixiJS `Application` and initialize its renderer with `resizeTo` set to the screen's container. It loads the arena, island, HUD, projectile, and effect textures with `Assets.load()`, then creates the game objects. After the asynchronous entity setup, it checks whether the React component was unmounted and otherwise appends `app.canvas` to the container. React renders the container; PixiJS renders the gameplay objects into its canvas.

### Stage and arena

The stage uses sortable children. A `TilingSprite` fills the screen with the ocean at a low `zIndex`. Three island positions and radii are stored separately for circular collision checks; their visible tiles are placed in `Graphics` containers. The `Player`, `Chaser`, and `Shooter` entity graphics are then added to the stage. The Shooter's initial position is selected from screen corners while checking distance from the player and clearance from islands.

### Gameplay loop and input

`app.ticker` runs `updateShip`, which advances the timer, updates cooldowns, moves the player and active enemies, handles Chaser respawning and Shooter firing, and advances projectiles. Keyboard listeners on `window` collect movement keys (WASD and arrows), Space for a frontal shot, Shift for a side shot, and P for pause. R restarts after game over. While paused or game over, the gameplay update returns early.

### Projectiles and collisions

Player projectiles and Shooter projectiles are kept in separate arrays. Each entry stores its PixiJS sprite and direction vector. The ticker moves them at the corresponding configured speed, then removes them on collision or when they leave the screen. Collision checks use distances between object centers and the existing island/entity radii; these checks remain separate from projectile sprite visuals. Hits update Chaser health/score or Player health, and defeated entities follow their existing removal and respawn paths.

### HUD, effects, and overlays

The HUD is a PixiJS `Container` above gameplay, with three panel sprites, icons, and text for health, score, and time. Its layout is recalculated when screen dimensions change. Temporary firing, damage, and death sprites are tracked separately from projectiles; `updateTemporaryEffects` fades them using ticker elapsed time and removes/destroys each sprite without destroying shared textures. Pause and Game Over each use a PixiJS `Graphics` panel and `Text`, layered above the HUD. The P key toggles pause visibility; timer expiry or zero Player health triggers `onGameOver` and the Game Over display.

### Unmount cleanup

The cleanup registered by `GameScreen` removes the window keyboard listeners and ticker callbacks, destroys any remaining temporary effect sprites, and clears pressed keys. On React unmount, the PixiJS application is destroyed with its view removed. If unmount happens during asynchronous initialization, an `isUnmounted` check destroys the application before its canvas is attached.

## Game Entities

`Player`, `Chaser`, and `Shooter` each expose a PixiJS `Container` as `graphic` and an asynchronous `ready` promise for loading their sprite textures. Their `reset` methods position the graphic for a new or reset game state. Movement, collision resolution, damage, and firing decisions are performed by `GameScreen` using the entity properties; the entity classes provide the graphics and configured values used by that loop.

- **Player** composes its ship graphic from hull, sail, and flag sprites. It exposes movement speed, rotation speed, and collision radius from configuration. `reset(x, y)` positions the ship and resets its rotation; Player health is maintained in `GameScreen`.
- **Chaser** renders the chaser ship and exposes movement speed, collision radius, maximum health, current health, and an `active` flag. `GameScreen` moves it toward the player, applies projectile damage, awards score when its health reaches zero, and later resets it at its initial position. Reset recreates its graphic when needed after destruction.
- **Shooter** renders the shooter ship and exposes movement speed, collision radius, projectile speed and radius, and fire interval. `GameScreen` moves it to maintain distance from the player, chooses an initial corner position clear of islands when possible, and fires its projectiles on the configured interval.

`src/game/config/gameConfig.ts` centralizes gameplay constants used by these entities and `GameScreen`, including player and Chaser health, movement speeds, rotation speed, collision radii, Chaser score, spawn intervals, Shooter firing settings, projectile speed/radius/cooldowns/spread, and the default game duration. The exported object is declared `as const` so these values retain literal readonly types.

## Assets and Visual Effects

PixiJS assets are loaded asynchronously during game initialization. Shared textures are reused by multiple sprites where appropriate, such as projectiles, HUD elements, island tiles and temporary visual effects.

The game uses dedicated assets for:

- Ocean and islands
- Player and enemy ships
- HUD
- Projectiles
- Firing effects
- Damage effects
- Death effects

Temporary visual effects are tracked separately from gameplay projectiles. They are removed after their configured duration and destroyed without destroying the shared texture.

The entity classes are responsible for loading the textures used by their respective ship graphics.

## Data and API Architecture

For ranking and match history, data flows from the React screen through its custom hook and TanStack Query to a service function, then through Axios to the API endpoint intercepted by MSW:

`React screen → custom hook → TanStack Query → service function → Axios → MSW mock endpoint`

- `src/services/api.ts` creates the shared Axios instance with `baseURL: "/api"`.
- `src/services/rankingService.ts` defines the ranking, history, and score submission types and implements the HTTP calls. It requests `/ranking` and `/history` and posts score data to `/scores` using the shared client.
- `src/hooks/useRanking.ts` calls `getRanking` with the TanStack Query key `["ranking"]`.
- `src/hooks/useHistory.ts` calls `getHistory` with the query key `["history"]`.
- `src/hooks/useSubmitScore.ts` exposes a mutation using `submitScore`. On success, it invalidates the `ranking` and `history` query keys in parallel so those query results can refresh.

In development, MSW intercepts these endpoints:

- `GET /api/ranking` returns the static ranking array.
- `GET /api/history` returns the static match history array.
- `POST /api/scores` reads the submitted score body and returns it as JSON with status `201`. The current handler does not persist the score or update the mock arrays.

## API Mocking with MSW

MSW provides browser-level request interception during development, allowing the application to keep its normal Axios and service-based API flow without requiring a running backend. The UI and query hooks make API-style requests, while MSW returns deterministic local responses for the configured routes.

- `src/mocks/browser.ts` creates the MSW browser worker with `setupWorker(...handlers)`.
- `src/mocks/handlers.ts` defines the mock endpoints. `GET /api/ranking` returns a static ranking array, `GET /api/history` returns a static match-history array, and `POST /api/scores` reads the request body and responds with that body as JSON using status `201`. The score handler does not save submissions or update either array.
- `src/main.tsx` starts the worker only when `import.meta.env.DEV` is true. It awaits `worker.start()` before rendering `<App />`, so development requests are intercepted from the start. Outside development, this startup block does not run.

## End-to-End Testing

Playwright is configured to discover tests in `./tests`, run them in Chromium using the Desktop Chrome device profile, and start the Vite development server at `http://127.0.0.1:5173` before the suite.

The existing tests validate these user-facing flows:

- **Main Menu:** the heading and primary navigation buttons are visible.
- **Options persistence:** duration and spawn-rate selections remain set after a page reload.
- **Ranking:** the ranking screen displays its heading, mocked entries, score, and Back button.
- **Gameplay initialization:** selecting Play opens GameScreen and renders the PixiJS canvas.
- **Game Over:** selecting the shortest game duration and starting a game eventually displays the Game Over heading.

These tests cover browser-visible screens, navigation, persistence, canvas initialization, and the timer-driven transition to Game Over. They do not implement visual regression testing or detailed real-time gameplay assertions.

## Lifecycle and Cleanup

`GameScreen` ties the PixiJS application lifecycle to the React component lifecycle.

During initialization, the PixiJS `Application` is created, the renderer is initialized, assets are loaded, and the game objects are added to the stage.

The game loop and keyboard listeners are registered after initialization. When the component unmounts, the registered listeners and ticker callbacks are removed, temporary effects are cleaned up, and the PixiJS application is destroyed.

Projectile and temporary-effect sprites are also removed and destroyed when they are no longer needed, while shared textures are kept available for reuse.

## Architectural Decisions

1. **React for UI and application flow:** The screens are React components, and `App` uses React state and callbacks to navigate between them, retain game settings and final score, and connect Options and GameScreen events to the relevant screens.
2. **PixiJS for real-time gameplay:** GameScreen uses a PixiJS `Application`, stage, sprites, graphics, and ticker for canvas rendering and frame-by-frame updates, keeping gameplay rendering separate from the DOM-based screens.
3. **Separate entity classes:** `Player`, `Chaser`, and `Shooter` each own their ship graphic, asset-loading promise, reset behavior, and relevant configured properties; GameScreen coordinates their interactions.
4. **Centralized game configuration:** `gameConfig.ts` keeps the values used by entities and GameScreen, such as movement, health, collision radii, spawn intervals, and projectile settings, in one typed object.
5. **TanStack Query for server state:** The ranking and history hooks use queries for their remote data, while score submission uses a mutation and invalidates both query keys after success.
6. **Axios for HTTP communication:** A shared Axios instance provides the `/api` base URL, and the ranking service uses it for the ranking, history, and score requests.
7. **MSW for API mocking:** The browser worker intercepts the same `/api` routes during development and returns local handler responses, so the app can exercise its HTTP flow without a running backend.
8. **Playwright for end-to-end testing:** The existing tests drive Chromium through the Vite-served app and check the menu, settings persistence, ranking, canvas initialization, and timer-driven Game Over flow.
