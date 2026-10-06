type OptionsProps = {
  onBack: () => void;
  duration: number;
  onDurationChange: (duration: number) => void;
  spawnRate: "low" | "normal" | "high";
  onSpawnRateChange: (spawnRate: "low" | "normal" | "high") => void;
};

export default function Options({
  onBack,
  duration,
  onDurationChange,
  spawnRate,
  onSpawnRateChange,
}: OptionsProps) {
  return (
    <main>
      <h1>Options</h1>
      <label htmlFor="game-duration">Game duration</label>
      <select
        id="game-duration"
        name="game-duration"
        value={duration}
        onChange={(event) => onDurationChange(Number(event.target.value))}
      >
        <option value="30">30 seconds</option>
        <option value="60">60 seconds</option>
        <option value="90">90 seconds</option>
      </select>
      <label htmlFor="enemy-spawn-rate">Enemy spawn rate</label>
      <select
        id="enemy-spawn-rate"
        name="enemy-spawn-rate"
        value={spawnRate}
        onChange={(event) =>
          onSpawnRateChange(event.target.value as OptionsProps["spawnRate"])
        }
      >
        <option value="low">Low</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
      </select>
      <button type="button" onClick={onBack}>
        BACK
      </button>
    </main>
  );
}
