import { useState } from "react";
import GameScreen from "./screens/GameScreen/gameScreen.tsx";
import MainMenu from "./screens/MainMenu/mainMenu";
import Options from "./screens/Options/options";

function App() {
  const [screen, setScreen] = useState<"menu" | "game" | "options">("menu");

  if (screen === "game") return <GameScreen />;
  if (screen === "options") {
    return <Options onBack={() => setScreen("menu")} />;
  }

  return (
    <MainMenu
      onPlay={() => setScreen("game")}
      onOptions={() => setScreen("options")}
    />
  );
}

export default App;
