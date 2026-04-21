import React from 'react';

interface RollButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export const RollButton: React.FC<RollButtonProps> = ({
  disabled = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-blood-500 hover:bg-blood-600 disabled:bg-gray-600 text-white font-bold py-1.5 sm:py-2 px-4 sm:px-6 rounded text-sm sm:text-base shadow-lg transform hover:scale-105 transition-transform disabled:scale-100 flex items-center justify-center gap-2 whitespace-nowrap">
      <i className="fas fa-dice"></i>
      ROLL
    </button>
  );
};
