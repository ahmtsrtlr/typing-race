import { useEffect, useState } from 'react';
/** Compact the race when a software keyboard shrinks the visual viewport. */
export function useMobileKeyboard() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const viewport = window.visualViewport;
    let baseline = window.innerHeight;
    const update = () => {
      baseline = Math.max(baseline, window.innerHeight);
      const typing = document.activeElement?.id === 'race-input';
      const mobile = window.matchMedia('(max-width: 760px)').matches;
      setOpen(mobile && typing && baseline - (viewport?.height ?? window.innerHeight) > 120);
    };
    viewport?.addEventListener('resize', update);
    window.addEventListener('resize', update);
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', update);
    return () => {
      viewport?.removeEventListener('resize', update);
      window.removeEventListener('resize', update);
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', update);
    };
  }, []);
  return open;
}
