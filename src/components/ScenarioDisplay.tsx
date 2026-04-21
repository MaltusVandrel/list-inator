import React from 'react';
import type { Scenario } from '../types/index';

interface ScenarioDisplayProps {
  scenario: Scenario | undefined;
}

export const ScenarioDisplay: React.FC<ScenarioDisplayProps> = ({
  scenario,
}) => {
  if (!scenario) return null;

  return (
    <div className="bg-gothic-800 px-3 sm:px-4 py-1.5 sm:py-2 border-b border-gothic-700">
      <p className="text-xs sm:text-sm text-gothic-300">
        <span className="font-bold text-gothic-100">Scenario:</span>{' '}
        {scenario.title}
      </p>
    </div>
  );
};
