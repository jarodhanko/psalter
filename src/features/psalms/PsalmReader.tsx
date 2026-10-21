import { useEffect, useState } from 'react';
import { getKjvPsalm, type Psalm } from '../../data/kjvPsalms';

interface PsalmReaderProps {
  number: number;
}

/** KJV text is a lazy, locally bundled asset; opening this reader never calls an API. */
export function PsalmReader({ number }: PsalmReaderProps) {
  const [psalm, setPsalm] = useState<Psalm>();
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setPsalm(undefined);
    setError(false);
    void getKjvPsalm(number)
      .then((next) => {
        if (!active) return;
        if (next) setPsalm(next);
        else setError(true);
      })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [number]);

  return (
    <section className="psalm-reader" id="current-psalm" aria-labelledby="psalm-reader-title">
      <h3 id="psalm-reader-title">Psalm {number} <small>King James Version</small></h3>
      {!psalm && !error && <p role="status">Loading the local Psalm text…</p>}
      {error && <p role="alert">The local Psalm text could not be loaded. Try updating or reinstalling the app.</p>}
      {psalm?.title && <p className="psalm-superscription">{psalm.title}</p>}
      {psalm && <div className="psalm-verses" role="region" aria-label={`Psalm ${number} verses`} tabIndex={0}>
        {psalm.verses.map((verse) => <p key={verse.number}>
          <sup aria-label={`Verse ${verse.number}`}>{verse.number}</sup>{' '}{verse.text}
        </p>)}
      </div>}
      <p className="psalm-source">KJV text is bundled for offline reading; see the project’s source and rights notes.</p>
    </section>
  );
}
