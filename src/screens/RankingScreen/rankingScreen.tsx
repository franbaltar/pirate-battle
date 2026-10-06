import { useRanking } from "../../hooks/useRanking";

type RankingScreenProps = {
  onBack: () => void;
};

export default function RankingScreen({ onBack }: RankingScreenProps) {
  const { data, isLoading, isError } = useRanking();

  return (
    <main>
      <h1>RANKING</h1>
      {isLoading ? <p>Loading ranking...</p> : null}
      {isError ? <p>Failed to load ranking.</p> : null}
      {data ? (
        <ol>
          {data.map((entry, index) => (
            <li key={entry.id}>
              <span>{index + 1}. </span>
              <span>{entry.playerName}</span>
              <span> - {entry.score}</span>
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
