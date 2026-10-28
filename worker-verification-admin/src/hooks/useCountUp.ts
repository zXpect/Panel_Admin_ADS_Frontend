import { useEffect, useRef, useState } from 'react';

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Número que cuenta hasta su valor (400 ms, desacelerando) en lugar de cambiar de golpe (Motion.countTo). */
export const useCountUp = (target: number, duration = 400) => {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    // Con la pestaña oculta el navegador no pinta cuadros: se pone el valor directo
    if (from === target || reducedMotion() || document.hidden) {
      fromRef.current = target;
      setValue(target);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) * (1 - t);
      const current = Math.round(from + (target - from) * eased);
      fromRef.current = current;
      setValue(current);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
};
