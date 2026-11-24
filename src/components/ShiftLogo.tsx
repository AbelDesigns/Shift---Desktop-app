import React from 'react';

interface ShiftLogoProps {
  size?: number;
  className?: string;
}

/**
 * Official Shift isotipo: dual parallel forward-slanted kinetic bars (//) in Shift Red (#FF2A36).
 */
export const ShiftLogo: React.FC<ShiftLogoProps> = ({ size = 20, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Shift"
    >
      <path d="M8.7 3H13.3L7.9 21H3.3L8.7 3Z" fill="#FF2A36" />
      <path d="M16.1 3H20.7L15.3 21H10.7L16.1 3Z" fill="#FF2A36" />
    </svg>
  );
};
