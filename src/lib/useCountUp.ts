import { useEffect, useRef, useState } from "react";

const COUNT_UP_MS = 900;

// Eases up to new values instead of jumping, like the balance in azart-lounge.
// Decreases (e.g. an admin correction) snap straight to the new value.
// `bumps` increments on every increase, so callers can key a highlight on it.
export const useCountUp = (target: number) => {
  const [shown, setShown] = useState(target);
  const [bumps, setBumps] = useState(0);
  const shownRef = useRef(target);
  const previous = useRef(target);

  useEffect(() => {
    if (target === previous.current) return;
    const increased = target > previous.current;
    previous.current = target;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!increased || reduceMotion) {
      shownRef.current = target;
      setShown(target);
      if (increased) setBumps((b) => b + 1);
      return;
    }

    setBumps((b) => b + 1);
    const from = shownRef.current;
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const f = Math.min((now - start) / COUNT_UP_MS, 1);
      shownRef.current = from + (target - from) * (1 - (1 - f) ** 3);
      setShown(shownRef.current);
      if (f < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return { value: Math.round(shown), bumps };
};
