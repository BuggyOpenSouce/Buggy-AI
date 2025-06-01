// project/src/components/LoadingIndicator.tsx
import React from 'react';

const indicatorStyles = `
  .loading-indicator-svg {
    width: 3.25em;
    transform-origin: center;
    animation: rotate4 2s linear infinite;
  }

  .loading-indicator-svg circle {
    fill: none;
    stroke: hsl(214, 97%, 59%);
    stroke-width: 2;
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
    stroke-linecap: round;
    animation: dash4 1.5s ease-in-out infinite;
  }

  @keyframes rotate4 {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash4 {
    0% {
      stroke-dasharray: 1, 200;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 200;
      stroke-dashoffset: -35px;
    }
    100% {
      stroke-dashoffset: -125px;
    }
  }
`;

export function LoadingIndicator() {
  return (
    <>
      <style>{indicatorStyles}</style>
      <svg className="loading-indicator-svg" viewBox="25 25 50 50">
        <circle cx="50" cy="50" r="20"></circle>
      </svg>
    </>
  );
}