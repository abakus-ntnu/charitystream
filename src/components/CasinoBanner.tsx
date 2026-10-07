import { GROWTH_PER_SECOND, useCrashRound } from "@/lib/useCrashRound";

import styles from "./CasinoBanner.module.css";

const CASINO_URL = "https://casino.abakus.no";

// graph geometry, in viewBox units
const W = 200;
const H = 120;
const LEFT = 10;
const RIGHT = 16;
const TOP = 16;
const BOTTOM = 10;
const MIN_SECONDS = 8;
const STEPS = 48;
const HISTORY_SHOWN = 8;

const BURST = [
  { dx: 0, dy: -9, rotate: 0 },
  { dx: 7, dy: -6, rotate: 45 },
  { dx: 9, dy: 0, rotate: 90 },
  { dx: -7, dy: -6, rotate: -45 },
  { dx: -9, dy: 0, rotate: 90 },
  { dx: 6, dy: 6, rotate: -45 },
  { dx: -6, dy: 6, rotate: 45 },
];

// Same colouring as the history chips in azart-lounge's crash page
const tone = (multiplier: number) =>
  multiplier >= 10
    ? styles.chipGold
    : multiplier >= 2
    ? styles.chipGreen
    : styles.chipGray;

const CrashGraph = ({
  elapsed,
  multiplier,
  crashed,
}: {
  elapsed: number;
  multiplier: number;
  crashed: boolean;
}) => {
  const tMax = Math.max(MIN_SECONDS, elapsed * 1.15);
  const mMax = Math.max(2, multiplier * 1.2);
  const x = (t: number) => LEFT + (t / tMax) * (W - LEFT - RIGHT);
  const y = (m: number) =>
    H - BOTTOM - ((m - 1) / (mMax - 1)) * (H - BOTTOM - TOP);

  const points = Array.from({ length: STEPS + 1 }, (_, i) => {
    const t = (elapsed * i) / STEPS;
    return `${x(t).toFixed(1)} ${y(Math.exp(GROWTH_PER_SECOND * t)).toFixed(
      1
    )}`;
  });
  const line = `M${points.join(" L")}`;
  const area = `${line} L${x(elapsed).toFixed(1)} ${H - BOTTOM} L${LEFT} ${
    H - BOTTOM
  } Z`;
  const tipX = x(elapsed);
  const tipY = y(multiplier);

  return (
    <svg
      className="block w-full h-auto"
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
    >
      <g shapeRendering="crispEdges" fill="#3a3a3a">
        <rect
          x={LEFT}
          y={H - BOTTOM}
          width={W - LEFT - RIGHT + 6}
          height="1.5"
        />
        <rect
          x={LEFT - 1.5}
          y={TOP - 6}
          width="1.5"
          height={H - BOTTOM - TOP + 7.5}
        />
      </g>
      {elapsed > 0 && (
        <>
          <path d={area} fill="#e21617" opacity={crashed ? 0.08 : 0.14} />
          <path
            d={line}
            fill="none"
            stroke={crashed ? "#730202" : "#e21617"}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </>
      )}
      {crashed ? (
        <g className={styles.burst} key={`${tipX}-${tipY}`}>
          {BURST.map((spark, i) => (
            <rect
              key={i}
              x={tipX + spark.dx - 1.5}
              y={tipY + spark.dy - 3}
              width="3"
              height="6"
              fill={i % 2 ? "#c9a227" : "#e21617"}
              transform={`rotate(${spark.rotate} ${tipX + spark.dx} ${
                tipY + spark.dy
              })`}
            />
          ))}
        </g>
      ) : (
        elapsed > 0 && <circle cx={tipX} cy={tipY} r="4" fill="#f2f2f2" />
      )}
    </svg>
  );
};

const CasinoBanner = () => {
  const round = useCrashRound();
  const crashed = round.phase === "crashed";
  const recent = round.history.slice(-HISTORY_SHOWN).reverse();

  return (
    <a
      className={`${styles.banner} group flex flex-col gap-4 h-full p-5 md:p-6 bg-panel no-underline hover:bg-panel-hover focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2`}
      href={CASINO_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="logo flex items-center gap-2 text-lg md:text-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.mark} src="/webkom.svg" alt="" />
          <span>
            Webkom<span className="logo__accent">Casino</span>
          </span>
        </span>
        {round.live && round.players !== null && (
          <span className="eyebrow inline-flex items-center gap-2 text-green-6 tabular-nums">
            <span className="relative flex size-2">
              <span className="absolute inset-0 bg-green-6 opacity-75 motion-safe:animate-ping" />
              <span className="relative size-2 bg-green-6" />
            </span>
            {round.players} {round.players === 1 ? "spiller" : "spillere"} nå
          </span>
        )}
      </div>

      <div className="relative bg-ink-alt">
        <CrashGraph
          elapsed={round.elapsed}
          multiplier={round.multiplier}
          crashed={crashed}
        />
        <div className="absolute top-3 left-[9%] md:top-4 flex flex-col gap-1">
          <span
            className={`eyebrow ${
              crashed
                ? "text-red-5"
                : round.phase === "running"
                ? "text-green-6"
                : ""
            }`}
          >
            {crashed
              ? `Krasjet! Ny runde om ${round.countdown}s`
              : round.phase === "running"
              ? "Crash · Kjør!"
              : `Crash · Starter om ${round.countdown}s`}
          </span>
          <span
            className={`text-4xl md:text-5xl font-extrabold tabular-nums leading-none ${
              crashed
                ? "text-red-5"
                : round.phase === "running"
                ? "text-text"
                : "text-text-faint"
            }`}
          >
            {round.multiplier.toFixed(2)}×
          </span>
        </div>
      </div>

      {recent.length > 0 && (
        <ol className={styles.history} aria-label="Siste runder">
          {recent.map((m, i) => (
            <li
              key={`${round.history.length}-${i}`}
              className={`${styles.chip} ${tone(m)}`}
            >
              {m.toFixed(2)}×
            </li>
          ))}
        </ol>
      )}

      <span className="button button--primary group-hover:bg-red-5 text-center">
        Spill på casino.abakus.no →
      </span>
    </a>
  );
};

export default CasinoBanner;
