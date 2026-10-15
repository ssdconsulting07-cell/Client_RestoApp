import { useEffect } from 'react';

export default function useScrollLock(actif) {
  useEffect(() => {
    if (!actif) return;

    const scrollY = window.scrollY;
    const original = document.body.style.cssText;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.cssText = original;
      window.scrollTo(0, scrollY);
    };
  }, [actif]);
}