import { useState } from "react";
import GameScreen from "./screens/GameScreen/gameScreen.tsx";

function App() {
  const [screen, setScreen] = useState<"menu" | "game">("menu");

  if (screen === "game") return <GameScreen />;

  return (
    <main>
      <h1>Pirate Battle</h1>
      <p>Jungle Gaming Challenge</p>
      <button onClick={() => setScreen("game")}>PLAY</button>
    </main>
  );
}

export default App;
