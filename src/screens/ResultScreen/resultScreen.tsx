import { useState } from "react";
import { useSubmitScore } from "../../hooks/useSubmitScore";
import "./resultScreen.css";

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
    <main className="result-screen">
      <section className="result-screen__panel" aria-label="Game over results">
        <h1 className="result-screen__heading">GAME OVER</h1>
        <p className="result-screen__score">
          <span>Final score:</span>
          <strong>{score}</strong>
        </p>
        <div className="result-screen__submit">
          <label htmlFor="player-name">Player name</label>
          <input
            id="player-name"
            name="playerName"
            type="text"
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
          />
          <button
            className="result-screen__button result-screen__button--primary"
            type="button"
            onClick={() => mutation.mutate({ playerName, score })}
            disabled={!playerName.trim() || mutation.isPending}
          >
            {mutation.isPending ? "SUBMITTING..." : "SUBMIT SCORE"}
          </button>
          {mutation.isError ? (
            <p className="result-screen__feedback result-screen__feedback--error">
              Failed to submit score.
            </p>
          ) : null}
          {mutation.isSuccess ? (
            <p className="result-screen__feedback result-screen__feedback--success">
              Score submitted!
            </p>
          ) : null}
        </div>
        <nav className="result-screen__navigation" aria-label="Result actions">
          <button
            className="result-screen__button result-screen__button--secondary"
            type="button"
            onClick={onRestart}
          >
            RESTART
          </button>
          <button
            className="result-screen__button result-screen__button--secondary"
            type="button"
            onClick={onMenu}
          >
            MENU
          </button>
        </nav>
      </section>
    </main>
  );
}
