import { useEffect, useState, type ComponentType } from 'react';

/** Optional tools load after opening and can retry without replacing the score or its settings. */
export function DeferredFeature<Props extends object>({ load, featureProps, label }: {
  load: () => Promise<ComponentType<Props>>;
  featureProps: Props;
  label: string;
}) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ Component?: ComponentType<Props>; failed?: boolean }>({});
  useEffect(() => {
    let active = true;
    setState({});
    void Promise.resolve().then(load).then(Component => { if (active) setState({ Component }); })
      .catch(() => { if (active) setState({ failed: true }); });
    return () => { active = false; };
  }, [load, attempt]);

  if (state.Component) return <state.Component {...featureProps} />;
  if (state.failed) return <div>
    <p role="alert">{label} could not be loaded. Check your connection and try again; your score settings are unchanged.</p>
    <button type="button" onClick={() => setAttempt(value => value + 1)}>Retry {label}</button>
  </div>;
  return <p role="status">Loading {label}…</p>;
}
