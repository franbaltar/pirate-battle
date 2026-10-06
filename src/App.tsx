import { useState } from "react";
import GameScreen from "./screens/GameScreen/gameScreen.tsx";
import MainMenu from "./screens/MainMenu/mainMenu";
import Options from "./screens/Options/options";

type GameSettings = {
  duration: number;
};

function App() {
  const [screen, setScreen] = useState<"menu" | "game" | "options">("menu");
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    duration: 30,
  });
  if (screen === "game") return <GameScreen duration={gameSettings.duration} />;
  if (screen === "options") {
    return (
      <Options
        onBack={() => setScreen("menu")}
        duration={gameSettings.duration}
        onDurationChange={(duration) => setGameSettings({ duration })}
      />
    );
  }

  return (
    <MainMenu
      onPlay={() => setScreen("game")}
      onOptions={() => setScreen("options")}
    />
  );
}

export default App;
