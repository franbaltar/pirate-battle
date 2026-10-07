import pirateBattleTitle from "../../assets/ui/menu/title_pirate_battle.png";
import "./mainMenu.css";

type MainMenuProps = {
  onPlay: () => void;
  onOptions: () => void;
  onRanking: () => void;
  onHistory: () => void;
};

export default function MainMenu({
  onPlay,
  onOptions,
  onRanking,
  onHistory,
}: MainMenuProps) {
  return (
    <main className="main-menu">
      <section className="main-menu__panel" aria-label="Main menu">
        <h1 className="main-menu__heading">
          <img
            className="main-menu__title"
            src={pirateBattleTitle}
            alt="Pirate Battle"
          />
        </h1>
        <nav className="main-menu__actions" aria-label="Main menu actions">
          <button
            className="main-menu__button main-menu__button--primary"
            type="button"
            onClick={onPlay}
          >
            PLAY
          </button>
          <button
            className="main-menu__button main-menu__button--secondary"
            type="button"
            onClick={onOptions}
          >
            OPTIONS
          </button>
          <button
            className="main-menu__button main-menu__button--secondary"
            type="button"
            onClick={onRanking}
          >
            RANKING
          </button>
          <button
            className="main-menu__button main-menu__button--secondary"
            type="button"
            onClick={onHistory}
          >
            HISTORY
          </button>
        </nav>
      </section>
    </main>
  );
}
