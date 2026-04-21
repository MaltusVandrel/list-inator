import React from 'react';
import type { Context } from '../types/index';

interface ContextSelectorProps {
  contexts: Context[];
  activeContextId: string | null;
  onContextSelect: (contextId: string) => void;
}

export const ContextSelector: React.FC<ContextSelectorProps> = ({
  contexts,
  activeContextId,
  onContextSelect,
}) => {
  return (
    <select
      value={activeContextId || ''}
      onChange={(e) => onContextSelect(e.target.value)}
      className="px-3 width-stretch sm:px-4 py-2 sm:py-2.5 bg-gothic-700 text-gothic-100 border border-gothic-600 rounded font-semibold text-sm hover:bg-gothic-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blood-600 focus:border-transparent">
      <option value="">Select Context</option>
      {contexts.map((context) => (
        <option
          key={context.id}
          value={context.id}>
          {context.title}
        </option>
      ))}
    </select>
  );
};
