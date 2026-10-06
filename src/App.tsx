import { useState } from "react";
import GameScreen from "./screens/GameScreen/gameScreen.tsx";
import MainMenu from "./screens/MainMenu/mainMenu";

function App() {
  const [screen, setScreen] = useState<"menu" | "game">("menu");

  if (screen === "game") return <GameScreen />;

  return <MainMenu onPlay={() => setScreen("game")} />;
}

export default App;
