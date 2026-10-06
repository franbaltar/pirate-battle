type MainMenuProps = {
  onPlay: () => void;
};

export default function MainMenu({ onPlay }: MainMenuProps) {
  return (
    <main>
      <h1>Pirate Battle</h1>
      <p>Jungle Gaming Challenge</p>
      <button type="button" onClick={onPlay}>
        PLAY
      </button>
    </main>
  );
}
