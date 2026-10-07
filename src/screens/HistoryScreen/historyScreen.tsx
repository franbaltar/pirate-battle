import { useHistory } from "../../hooks/useHistory";

type HistoryScreenProps = {
  onBack: () => void;
};

export default function HistoryScreen({ onBack }: HistoryScreenProps) {
  const { data, isLoading, isError } = useHistory();

  return (
    <main>
      <h1>MATCH HISTORY</h1>
      {isLoading ? <p>Loading history...</p> : null}
      {isError ? <p>Failed to load history.</p> : null}
      {data ? (
        <ol>
          {data.map((entry) => (
            <li key={entry.id}>
              <span>{entry.playerName}</span>
              <span> - {entry.score}</span>
              <span> - {new Date(entry.playedAt).toLocaleString()}</span>
            </li>
          ))}
        </ol>
      ) : null}
      <button type="button" onClick={onBack}>
        BACK
      </button>
    </main>
  );
}
