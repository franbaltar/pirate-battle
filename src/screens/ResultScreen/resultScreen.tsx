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
  return (
    <main>
      <h1>GAME OVER</h1>
      <p>Final score: {score}</p>
      <button type="button" onClick={onRestart}>
        RESTART
      </button>
      <button type="button" onClick={onMenu}>
        MENU
      </button>
    </main>
  );
}
