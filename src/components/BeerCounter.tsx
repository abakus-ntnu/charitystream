import React, { useEffect, useId, useRef, useState } from "react";

import { SpriteRects } from "@/components/PixelSprite";

import { DRUNK_SPRITES, drunkStage, PALETTE } from "@/lib/abaku";
import { HS_MATCH_LIMIT } from "@/lib/constants";
import { formatCurrency } from "@/lib/helpers";
import { useCountUp } from "@/lib/useCountUp";

import { BeerData } from "@/models/types";

import styles from "./BeerCounter.module.css";

const GLASS = "#757575";
const GLASS_LIGHT = "#aaaaaa";
const FIXTURE = "#3a3a3a";
const BEER = "#c9a227";
const BEER_DARK = "#8f7119";
const BEER_LIGHT = "#e0bb45";
const FOAM = "#f2f2f2";
const FOAM_SHADE = "#d6cfb8";
const TAP_RED = "#e21617";

// The beer is drawn as a full glass and pushed down to show the level.
// Its surface travels over the glass height; an empty glass also hides the foam.
const GLASS_DEPTH = 56;
const EMPTY_OFFSET = 72;

const BUBBLES = [
  { x: 34, delay: 0, duration: 2.6 },
  { x: 42, delay: 1.1, duration: 3.1 },
  { x: 50, delay: 0.5, duration: 2.2 },
  { x: 58, delay: 1.8, duration: 2.9 },
  { x: 66, delay: 0.9, duration: 2.4 },
  { x: 46, delay: 2.3, duration: 3.4 },
  { x: 62, delay: 1.5, duration: 2.7 },
];

const SPLASH = [
  { x: 46, y: 30, dx: -3 },
  { x: 52, y: 26, dx: 0 },
  { x: 57, y: 29, dx: 3 },
];

const ABAKU_PX = 2.5;

// stars that circle Abaku's head once wasted
const STARS = [
  { x: 121, y: 57 },
  { x: 137, y: 57 },
  { x: 129, y: 49 },
  { x: 129, y: 65 },
];

const Abaku = ({ x, y, stage }: { x: number; y: number; stage: number }) => (
  <g shapeRendering="crispEdges">
    <SpriteRects
      rows={DRUNK_SPRITES[stage]}
      palette={PALETTE}
      x={x}
      y={y}
      px={ABAKU_PX}
    />
    {/* a small beer raised in the right hand, tipping further the drunker Abaku gets */}
    <g className={styles.miniBeer}>
      <rect x={145} y={72} width={8} height={10} fill={BEER} />
      <rect x={145} y={70} width={8} height={3} fill={FOAM} />
      <rect x={153} y={74} width={2} height={6} fill={GLASS_LIGHT} />
    </g>
  </g>
);

const Bump = ({ bumps, children }: { bumps: number; children: string }) => (
  <span
    key={bumps}
    className={bumps ? "inline-block animate-bump" : "inline-block"}
  >
    {children}
  </span>
);

type Props = { beerData: BeerData | null };

const BeerCounter = ({ beerData }: Props) => {
  const spent = beerData?.spent ?? 0;
  const hsMatch = beerData?.hsMatch ?? 0;
  const matchLimit = beerData?.matchLimit ?? HS_MATCH_LIMIT;

  // the glass fills up as HS's match approaches its limit
  const fill = matchLimit > 0 ? Math.min(hsMatch / matchLimit, 1) : 0;
  const full = fill >= 1;

  const clipId = `beer-clip-${useId().replace(/:/g, "")}`;
  const shownSpent = useCountUp(spent);
  const shownMatch = useCountUp(hsMatch);

  // Start empty and let the glass fill up once mounted
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const level = mounted ? fill : 0;
  const offset = level > 0 ? (1 - level) * GLASS_DEPTH : EMPTY_OFFSET;
  const stage = drunkStage(fill);

  // Every sale pours a new beer; the key restarts the CSS animations
  const [pour, setPour] = useState({ key: 0, added: 0 });
  const lastSpent = useRef(spent);
  useEffect(() => {
    const added = spent - lastSpent.current;
    lastSpent.current = spent;
    if (added > 0) setPour((p) => ({ key: p.key + 1, added }));
  }, [spent]);
  const pouring = pour.key > 0;

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-baseline justify-between gap-4">
        {full && <div className="eyebrow text-gold">Maks nådd!</div>}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <svg
          className={`${styles.art} w-full max-w-[32rem] h-auto`}
          viewBox="0 -4 160 124"
          aria-hidden="true"
        >
          <defs>
            <clipPath id={clipId}>
              <rect x={28} y={-4} width={48} height={104} />
            </clipPath>
          </defs>

          {/* bar counter and tap */}
          <rect x={0} y={108} width={160} height={4} fill={FIXTURE} />
          <rect x={6} y={8} width={8} height={100} fill={FIXTURE} />
          <rect x={6} y={8} width={52} height={6} fill={GLASS_LIGHT} />
          <rect x={6} y={12} width={52} height={2} fill={GLASS} />
          <rect x={48} y={14} width={8} height={6} fill={GLASS_LIGHT} />
          <rect x={50} y={20} width={4} height={3} fill={GLASS} />
          <g
            key={`lever-${pour.key}`}
            className={`${styles.lever} ${pouring ? styles.leverPull : ""}`}
          >
            <rect x={48} y={-2} width={8} height={4} fill={TAP_RED} />
            <rect x={50} y={2} width={4} height={6} fill={TAP_RED} />
          </g>

          <g clipPath={`url(#${clipId})`}>
            <rect
              key={`stream-${pour.key}`}
              className={`${styles.stream} ${pouring ? styles.streamPour : ""}`}
              x={50}
              y={23}
              width={4}
              height={77}
              fill={BEER}
            />
            <g
              className={styles.beer}
              style={{ transform: `translateY(${offset}px)` }}
            >
              <rect x={28} y={44} width={48} height={56} fill={BEER} />
              <rect x={36} y={44} width={4} height={56} fill={BEER_LIGHT} />
              <rect x={64} y={44} width={8} height={56} fill={BEER_DARK} />
              {BUBBLES.map((b) => (
                <rect
                  key={b.x}
                  className={styles.bubble}
                  style={{
                    animationDelay: `${b.delay}s`,
                    animationDuration: `${b.duration}s`,
                  }}
                  x={b.x}
                  y={96}
                  width={2}
                  height={2}
                  fill={FOAM}
                />
              ))}
              <g
                key={`foam-${pour.key}`}
                className={`${styles.foam} ${pouring ? styles.foamPuff : ""}`}
              >
                <rect x={28} y={38} width={48} height={8} fill={FOAM} />
                <rect x={28} y={44} width={48} height={2} fill={FOAM_SHADE} />
                <rect x={32} y={34} width={12} height={4} fill={FOAM} />
                <rect x={44} y={32} width={16} height={6} fill={FOAM} />
                <rect x={50} y={30} width={8} height={2} fill={FOAM} />
                <rect x={64} y={34} width={8} height={4} fill={FOAM} />
              </g>
              {pouring &&
                SPLASH.map((s) => (
                  <rect
                    key={`splash-${pour.key}-${s.x}`}
                    className={styles.splash}
                    style={{ "--dx": `${s.dx}px` } as React.CSSProperties}
                    x={s.x}
                    y={s.y}
                    width={2}
                    height={2}
                    fill={FOAM}
                  />
                ))}
            </g>
          </g>

          {/* the glass */}
          <g shapeRendering="crispEdges">
            <rect x={24} y={40} width={4} height={68} fill={GLASS} />
            <rect x={76} y={40} width={4} height={68} fill={GLASS} />
            <rect x={24} y={100} width={56} height={8} fill={GLASS} />
            <rect x={32} y={102} width={40} height={2} fill={GLASS_LIGHT} />
            <rect x={80} y={52} width={16} height={4} fill={GLASS} />
            <rect x={92} y={52} width={4} height={40} fill={GLASS} />
            <rect x={80} y={88} width={16} height={4} fill={GLASS} />
            <rect
              x={30}
              y={50}
              width={2}
              height={40}
              fill={FOAM}
              opacity={0.3}
            />
          </g>

          {full && (
            <g fill={FOAM}>
              <rect x={22} y={38} width={6} height={4} />
              <rect x={22} y={42} width={4} height={8} />
              <rect x={76} y={38} width={6} height={4} />
              <rect x={78} y={42} width={4} height={5} />
            </g>
          )}

          {pouring && (
            <text
              key={`popup-${pour.key}`}
              className={styles.popup}
              x={84}
              y={36}
              fill={BEER}
              fontSize={12}
              fontWeight={800}
            >
              +{formatCurrency(pour.added)}
            </text>
          )}

          {/* --drunk (0 to 1) tips the beer in Abaku's hand */}
          <g style={{ "--drunk": level } as React.CSSProperties}>
            <g
              key={`abaku-${pour.key}`}
              className={pouring ? styles.abakuHop : undefined}
            >
              <g className={styles.abaku}>
                <Abaku x={110} y={68} stage={stage} />
              </g>
            </g>
            {stage >= 3 && (
              <g className={styles.stars} fill={BEER}>
                {STARS.map((s) => (
                  <rect
                    key={`${s.x}-${s.y}`}
                    x={s.x}
                    y={s.y}
                    width={2}
                    height={2}
                  />
                ))}
              </g>
            )}
          </g>
        </svg>
      </div>

      <dl className="grid grid-cols-2 gap-4 m-0">
        <div>
          <dt className="eyebrow">Brukt i baren</dt>
          <dd className="m-0 text-3xl md:text-4xl font-extrabold tabular-nums">
            <Bump bumps={shownSpent.bumps}>
              {formatCurrency(shownSpent.value)}
            </Bump>
          </dd>
        </div>
        <div className="text-right">
          <dt className="eyebrow">HS matcher</dt>
          <dd className="m-0 text-3xl md:text-4xl font-extrabold tabular-nums text-gold">
            <Bump bumps={shownMatch.bumps}>
              {formatCurrency(shownMatch.value)}
            </Bump>
          </dd>
        </div>
      </dl>
    </div>
  );
};

export default BeerCounter;
