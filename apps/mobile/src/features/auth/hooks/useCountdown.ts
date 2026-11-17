import { useEffect, useState } from 'react';

/** Counts down to zero once started. `start()` restarts it. Uses the clock, so it stays right if the app is backgrounded. */
export function useCountdown(seconds: number) {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endsAt === null) return;
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= endsAt) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, [endsAt]);

  function start() {
    const current = Date.now();
    setNow(current);
    setEndsAt(current + seconds * 1000);
  }

  const remaining = endsAt === null ? 0 : Math.max(0, Math.ceil((endsAt - now) / 1000));
  return { remaining, running: remaining > 0, start };
}

/** 45 → "0:45". */
export function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}
