'use client';

import { useState } from 'react';
import TopBar from './components/TopBar';
import MapView from './components/MapView';
import BottomPanels from './components/BottomPanels';
import CardGrid from './components/CardGrid';

export default function Home() {
  const [variant, setVariant] = useState('THREATS');
  const [region, setRegion] = useState('Global');

  return (
    <main>
      <TopBar variant={variant} setVariant={setVariant} region={region} setRegion={setRegion} />
      <MapView variant={variant} region={region} />
      <BottomPanels />
      <CardGrid />
    </main>
  );
}