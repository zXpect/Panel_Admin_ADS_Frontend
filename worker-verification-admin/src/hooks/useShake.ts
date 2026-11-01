import { useEffect, useRef } from 'react';

/** El elemento tiembla de lado a lado (300 ms) cada vez que aparece un error nuevo (Motion.shake). */
export const useShake = <T extends HTMLElement>(trigger: unknown) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!trigger || !element) return;
    // Quitar y volver a poner la clase reinicia la animación aunque el error sea el mismo
    element.classList.remove('ads-shake');
    void element.offsetWidth;
    element.classList.add('ads-shake');
  }, [trigger]);

  return ref;
};
