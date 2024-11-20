import React from 'react';
import { ConfigPanel } from '../components/admin/config-panel';

export function Admin() {
  return (
    <div className="flex-1 overflow-y-auto">
      <ConfigPanel />
    </div>
  );
}