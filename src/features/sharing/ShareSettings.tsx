import { useState } from 'react';
import { DeferredFeature } from '../DeferredFeature';
import type { SongLocation } from './shareUrl';
import type { ViewerSettings } from './viewerSettings';

const loadShareSettings = () => import('./ShareSettingsContent').then(module => module.ShareSettingsContent);

export function ShareSettings({ location, settings }: { location: SongLocation; settings: ViewerSettings }) {
  const [opened, setOpened] = useState(false);
  return <details className="share-settings" onToggle={event => { if (event.currentTarget.open) setOpened(true); }}>
    <summary>Share this setting</summary>
    {opened && <DeferredFeature load={loadShareSettings} featureProps={{ location, settings }} label="Share link" />}
  </details>;
}
