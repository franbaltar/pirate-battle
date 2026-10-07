import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GameScreen from "./screens/GameScreen/gameScreen.tsx";
import HistoryScreen from "./screens/HistoryScreen/historyScreen";
import MainMenu from "./screens/MainMenu/mainMenu";
import Options from "./screens/Options/options";
import RankingScreen from "./screens/RankingScreen/rankingScreen";
import ResultScreen from "./screens/ResultScreen/resultScreen";

type GameSettings = {
  duration: number;
  spawnRate: "low" | "normal" | "high";
};

const GAME_SETTINGS_STORAGE_KEY = "pirate-battle-settings";
const DEFAULT_GAME_SETTINGS: GameSettings = {
  duration: 30,
  spawnRate: "normal",
};

const queryClient = new QueryClient();

function AppContent() {
  const [screen, setScreen] = useState<
    "menu" | "game" | "options" | "result" | "ranking" | "history"
  >("menu");
  const [gameSettings, setGameSettings] = useState<GameSettings>(() => {
    try {
      const savedSettings = localStorage.getItem(GAME_SETTINGS_STORAGE_KEY);
      if (!savedSettings) return DEFAULT_GAME_SETTINGS;

      const parsedSettings = JSON.parse(savedSettings) as Partial<GameSettings>;
      return {
        duration:
          parsedSettings.duration === 30 ||
          parsedSettings.duration === 60 ||
          parsedSettings.duration === 90
            ? parsedSettings.duration
            : DEFAULT_GAME_SETTINGS.duration,
        spawnRate:
          parsedSettings.spawnRate === "low" ||
          parsedSettings.spawnRate === "normal" ||
          parsedSettings.spawnRate === "high"
            ? parsedSettings.spawnRate
            : DEFAULT_GAME_SETTINGS.spawnRate,
      };
    } catch {
      return DEFAULT_GAME_SETTINGS;
    }
  });
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    localStorage.setItem(
      GAME_SETTINGS_STORAGE_KEY,
      JSON.stringify(gameSettings),
    );
  }, [gameSettings]);

  if (screen === "game") {
    return (
      <GameScreen
        duration={gameSettings.duration}
        spawnRate={gameSettings.spawnRate}
        onGameOver={(score) => {
          setFinalScore(score);
          setScreen("result");
        }}
      />
    );
  }
  if (screen === "options") {
    return (
      <Options
        onBack={() => setScreen("menu")}
        duration={gameSettings.duration}
        onDurationChange={(duration) =>
          setGameSettings((settings) => ({ ...settings, duration }))
        }
        spawnRate={gameSettings.spawnRate}
        onSpawnRateChange={(spawnRate) =>
          setGameSettings((settings) => ({ ...settings, spawnRate }))
        }
      />
    );
  }
  if (screen === "result") {
    return (
      <ResultScreen
        score={finalScore}
        onRestart={() => setScreen("game")}
        onMenu={() => setScreen("menu")}
      />
    );
  }
  if (screen === "ranking") {
    return <RankingScreen onBack={() => setScreen("menu")} />;
  }
  if (screen === "history") {
    return <HistoryScreen onBack={() => setScreen("menu")} />;
  }

  return (
    <MainMenu
      onPlay={() => setScreen("game")}
      onOptions={() => setScreen("options")}
      onRanking={() => setScreen("ranking")}
      onHistory={() => setScreen("history")}
    />
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
