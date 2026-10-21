import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

interface NumberNavigationProps {
  bookName: string;
  first: number;
  last: number;
  selected: number;
  placement: 'top' | 'bottom';
  onSelect: (number: number) => void;
}

export function NumberNavigation({ bookName, first, last, selected, placement, onSelect }: NumberNavigationProps) {
  const [target, setTarget] = useState(selected);
  const [focusedNumber, setFocusedNumber] = useState(selected);
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setTarget(selected); setFocusedNumber(selected); }, [selected]);
  useEffect(() => {
    const track = trackRef.current;
    const active = activeRef.current;
    if (!track || !active) return;
    const centerSelected = () => { track.scrollLeft = active.offsetLeft - track.offsetLeft - (track.clientWidth - active.clientWidth) / 2; };
    centerSelected();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(centerSelected);
    observer.observe(track);
    return () => observer.disconnect();
  }, [selected, first, last]);

  const numbers = Array.from({ length: last - first + 1 }, (_, index) => first + index);
  const jumpId = `number-scrubber-${placement}`;
  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, number: number) => {
    const next = event.key === 'ArrowRight' ? Math.min(last, number + 1)
      : event.key === 'ArrowLeft' ? Math.max(first, number - 1)
      : event.key === 'Home' ? first
      : event.key === 'End' ? last : undefined;
    if (next === undefined) return;
    event.preventDefault();
    trackRef.current?.querySelector<HTMLButtonElement>(`button[data-number="${next}"]`)?.focus();
  };

  return (
    <nav className={`number-navigation number-navigation--${placement}`} aria-label={`${bookName} number navigation ${placement === 'top' ? 'above' : 'below'} the music`}>
      <div className="number-navigation__row">
        {placement === 'bottom' && <button className="number-step" type="button" aria-label={`Previous ${bookName} number below the music`} disabled={selected <= first} onClick={() => onSelect(selected - 1)}>← <span>Previous</span></button>}
        <div className="number-carousel" ref={trackRef} role="group" aria-label={`Swipe or scroll through ${bookName} numbers`}>
          {numbers.map((number) => <button key={number} ref={number === selected ? activeRef : undefined} type="button" data-number={number} tabIndex={number === focusedNumber ? 0 : -1} aria-label={`${bookName} ${number}`} aria-current={number === selected ? 'page' : undefined} onFocus={() => setFocusedNumber(number)} onKeyDown={(event) => moveFocus(event, number)} onClick={() => { if (number !== selected) onSelect(number); }}>{number}</button>)}
        </div>
        {placement === 'bottom' && <button className="number-step" type="button" aria-label={`Next ${bookName} number below the music`} disabled={selected >= last} onClick={() => onSelect(selected + 1)}><span>Next</span> →</button>}
      </div>
      {placement === 'bottom' && <div className="number-navigation__jump">
        <label htmlFor={jumpId}>Jump farther</label>
        <input id={jumpId} type="range" min={first} max={last} value={target} aria-valuetext={`${bookName} ${target}`} onChange={(event) => setTarget(Number(event.target.value))} onKeyDown={(event) => { if (event.key === 'Enter' && target !== selected) onSelect(target); }} />
        <button type="button" disabled={target === selected} onClick={() => onSelect(target)}>Go to {target}</button>
      </div>}
    </nav>
  );
}
