import { useState } from "react";

type ResultScreenProps = {
  score: number;
  onRestart: () => void;
  onMenu: () => void;
  onSubmitScore: (playerName: string) => void;
};

export default function ResultScreen({
  score,
  onRestart,
  onMenu,
  onSubmitScore,
}: ResultScreenProps) {
  const [playerName, setPlayerName] = useState("");

  return (
    <main>
      <h1>GAME OVER</h1>
      <p>Final score: {score}</p>
      <label htmlFor="player-name">Player name</label>
      <input
        id="player-name"
        name="playerName"
        type="text"
        value={playerName}
        onChange={(event) => setPlayerName(event.target.value)}
      />
      <button
        type="button"
        onClick={() => onSubmitScore(playerName)}
        disabled={!playerName.trim()}
      >
        SUBMIT SCORE
      </button>
      <button type="button" onClick={onRestart}>
        RESTART
      </button>
      <button type="button" onClick={onMenu}>
        MENU
      </button>
    </main>
  );
}
