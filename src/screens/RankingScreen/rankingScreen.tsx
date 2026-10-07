import pirateBattleTitle from "../../assets/ui/menu/title_pirate_battle.png";
import { useRanking } from "../../hooks/useRanking";
import "./rankingScreen.css";

type RankingScreenProps = {
  onBack: () => void;
};

export default function RankingScreen({ onBack }: RankingScreenProps) {
  const { data, isLoading, isError } = useRanking();

  return (
    <main className="ranking-screen">
      <section
        className="ranking-screen__panel"
        aria-label="Ranking leaderboard"
      >
        <h1 className="ranking-screen__heading">
          <span className="ranking-screen__sr-only">RANKING</span>
          <img src={pirateBattleTitle} alt="" />
        </h1>
        {isLoading ? (
          <p className="ranking-screen__status">Loading ranking...</p>
        ) : null}
        {isError ? (
          <p className="ranking-screen__status ranking-screen__status--error">
            Failed to load ranking.
          </p>
        ) : null}
        {data ? (
          <ol className="ranking-screen__list">
            {data.map((entry, index) => (
              <li className="ranking-screen__row" key={entry.id}>
                <span>{index + 1}. </span>
                <span>{entry.playerName}</span>
                <span> - {entry.score}</span>
              </li>
            ))}
          </ol>
        ) : null}
        <button className="ranking-screen__back" type="button" onClick={onBack}>
          BACK
        </button>
      </section>
    </main>
  );
}
