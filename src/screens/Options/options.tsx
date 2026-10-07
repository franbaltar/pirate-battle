import pirateBattleTitle from "../../assets/ui/menu/title_pirate_battle.png";
import "./options.css";

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
    <main className="options-screen">
      <section className="options-screen__panel" aria-label="Options">
        <h1 className="options-screen__heading" aria-label="Options">
          <img src={pirateBattleTitle} alt="" />
        </h1>
        <div className="options-screen__fields">
          <div className="options-screen__field">
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
          </div>
          <div className="options-screen__field">
            <label htmlFor="enemy-spawn-rate">Enemy spawn rate</label>
            <select
              id="enemy-spawn-rate"
              name="enemy-spawn-rate"
              value={spawnRate}
              onChange={(event) =>
                onSpawnRateChange(
                  event.target.value as OptionsProps["spawnRate"],
                )
              }
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
          <button
            className="options-screen__back"
            type="button"
            onClick={onBack}
          >
            BACK
          </button>
        </div>
      </section>
    </main>
  );
}
