import { useEffect, useRef, useState } from "react";

// Round timing and crash odds match azart-vault (api/crash.go)
export const GROWTH_PER_SECOND = Math.log(2) / 5;
const PHASE_MS = 8000;
const CRASH_EDGE = 0.035;
const HISTORY_LIMIT = 20;

const STREAM_URL = "/api/casino/crash";
const STALL_MS = 5000;
const RETRY_MS = 30000;

export type CrashPhase = "waiting" | "running" | "crashed";

type Snapshot = {
  phase: CrashPhase;
  multiplier: number;
  countdown: number;
  elapsed_ms?: number;
  bets: { username: string }[];
  next_bets: { username: string }[];
  history: number[];
};

export type CrashRound = {
  // false while the casino is unreachable and a local round is simulated
  live: boolean;
  phase: CrashPhase;
  multiplier: number;
  // seconds since the current round took off
  elapsed: number;
  countdown: number;
  // players in the current and next round; null when not live
  players: number | null;
  history: number[];
};

const randomCrashPoint = () => {
  const r = Math.random();
  return r < CRASH_EDGE ? 1 : (1 - CRASH_EDGE) / (1 - r);
};

export const useCrashRound = (): CrashRound => {
  const state = useRef({
    live: false,
    lastMessage: 0,
    phase: "waiting" as CrashPhase,
    startedAt: 0,
    endsAt: 0,
    crashPoint: randomCrashPoint(),
    crashedAt: 1,
    players: null as number | null,
    history: [] as number[],
  });
  const [round, setRound] = useState<CrashRound>({
    live: false,
    phase: "waiting",
    multiplier: 1,
    elapsed: 0,
    countdown: 0,
    players: null,
    history: [],
  });

  useEffect(() => {
    const s = state.current;
    s.endsAt = performance.now() + PHASE_MS;

    let source: EventSource | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      source = new EventSource(STREAM_URL);
      source.onmessage = (event) => {
        const snapshot = JSON.parse(event.data) as Snapshot;
        const now = performance.now();
        const wasSimulating = !s.live;
        s.live = true;
        s.lastMessage = now;
        if (
          snapshot.phase === "running" &&
          (s.phase !== "running" || wasSimulating)
        ) {
          s.startedAt = now - (snapshot.elapsed_ms ?? 0);
        }
        s.phase = snapshot.phase;
        if (snapshot.phase === "crashed") s.crashedAt = snapshot.multiplier;
        if (snapshot.phase !== "running") {
          s.endsAt = now + snapshot.countdown * 1000;
        }
        s.players = new Set(
          [...snapshot.bets, ...snapshot.next_bets].map((b) => b.username)
        ).size;
        s.history = snapshot.history;
      };
      source.onerror = () => {
        // a failed proxy response closes the stream for good, so retry later ourselves
        if (source?.readyState === EventSource.CLOSED) {
          s.live = false;
          s.players = null;
          retry = setTimeout(connect, RETRY_MS);
        }
      };
    };
    connect();

    // Simulates rounds locally whenever the stream is down
    const simulate = (now: number) => {
      if (s.phase === "waiting" && now >= s.endsAt) {
        s.phase = "running";
        s.startedAt = now;
        s.crashPoint = randomCrashPoint();
      } else if (
        s.phase === "running" &&
        Math.exp((GROWTH_PER_SECOND * (now - s.startedAt)) / 1000) >=
          s.crashPoint
      ) {
        s.phase = "crashed";
        s.crashedAt = Math.round(s.crashPoint * 100) / 100;
        s.endsAt = now + PHASE_MS;
        s.history = [...s.history, s.crashedAt].slice(-HISTORY_LIMIT);
      } else if (s.phase === "crashed" && now >= s.endsAt) {
        s.phase = "waiting";
        s.endsAt = now + PHASE_MS;
      }
    };

    let frame = 0;
    const tick = (now: number) => {
      if (s.live && now - s.lastMessage > STALL_MS) {
        s.live = false;
        s.players = null;
      }
      if (!s.live) simulate(now);

      const elapsed =
        s.phase === "running"
          ? Math.max(0, (now - s.startedAt) / 1000)
          : s.phase === "crashed"
          ? Math.log(Math.max(s.crashedAt, 1)) / GROWTH_PER_SECOND
          : 0;
      const multiplier =
        s.phase === "running"
          ? Math.exp(GROWTH_PER_SECOND * elapsed)
          : s.phase === "crashed"
          ? s.crashedAt
          : 1;
      const countdown =
        s.phase === "running"
          ? 0
          : Math.max(0, Math.ceil((s.endsAt - now) / 1000));

      setRound((prev) =>
        prev.phase === s.phase &&
        prev.elapsed === elapsed &&
        prev.countdown === countdown &&
        prev.live === s.live &&
        prev.players === s.players &&
        prev.history === s.history
          ? prev
          : {
              live: s.live,
              phase: s.phase,
              multiplier,
              elapsed,
              countdown,
              players: s.players,
              history: s.history,
            }
      );
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(retry);
      source?.close();
    };
  }, []);

  return round;
};
