import pirateBattleTitle from "../../assets/ui/menu/title_pirate_battle.png";
import { useHistory } from "../../hooks/useHistory";
import "./historyscreen.css";

type HistoryScreenProps = {
  onBack: () => void;
};

export default function HistoryScreen({ onBack }: HistoryScreenProps) {
  const { data, isLoading, isError } = useHistory();

  return (
    <main className="history-screen">
      <section className="history-screen__panel" aria-label="Match history">
        <h1 className="history-screen__heading">
          <span className="history-screen__sr-only">MATCH HISTORY</span>
          <img src={pirateBattleTitle} alt="" />
        </h1>
        {isLoading ? (
          <p className="history-screen__status">Loading history...</p>
        ) : null}
        {isError ? (
          <p className="history-screen__status history-screen__status--error">
            Failed to load history.
          </p>
        ) : null}
        {data ? (
          <ol className="history-screen__list">
            {data.map((entry) => (
              <li className="history-screen__row" key={entry.id}>
                <span className="history-screen__player">
                  {entry.playerName}
                </span>
                <span className="history-screen__score"> - {entry.score}</span>
                <span className="history-screen__date">
                  {" "}
                  - {new Date(entry.playedAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        ) : null}
        <button className="history-screen__back" type="button" onClick={onBack}>
          BACK
        </button>
      </section>
    </main>
  );
}
