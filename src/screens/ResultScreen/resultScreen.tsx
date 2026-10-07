import { useState } from "react";
import { useSubmitScore } from "../../hooks/useSubmitScore";

type ResultScreenProps = {
  score: number;
  onRestart: () => void;
  onMenu: () => void;
};

export default function ResultScreen({
  score,
  onRestart,
  onMenu,
}: ResultScreenProps) {
  const [playerName, setPlayerName] = useState("");
  const mutation = useSubmitScore();

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
        onClick={() => mutation.mutate({ playerName, score })}
        disabled={!playerName.trim() || mutation.isPending}
      >
        {mutation.isPending ? "SUBMITTING..." : "SUBMIT SCORE"}
      </button>
      {mutation.isError ? <p>Failed to submit score.</p> : null}
      {mutation.isSuccess ? <p>Score submitted!</p> : null}
      <button type="button" onClick={onRestart}>
        RESTART
      </button>
      <button type="button" onClick={onMenu}>
        MENU
      </button>
    </main>
  );
}
