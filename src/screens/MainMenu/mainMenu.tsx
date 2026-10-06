type MainMenuProps = {
  onPlay: () => void;
  onOptions: () => void;
  onRanking: () => void;
};

export default function MainMenu({
  onPlay,
  onOptions,
  onRanking,
}: MainMenuProps) {
  return (
    <main>
      <h1>Pirate Battle</h1>
      <p>Jungle Gaming Challenge</p>
      <button type="button" onClick={onPlay}>
        PLAY
      </button>
      <button type="button" onClick={onOptions}>
        OPTIONS
      </button>
      <button type="button" onClick={onRanking}>
        RANKING
      </button>
    </main>
  );
}
