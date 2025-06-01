import React from 'react';
import { RefreshCw, MessageSquare, Maximize2, Copy } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onRegenerate: () => void;
  onExplain: () => void;
  onFullscreen: () => void;
  onCopy: () => void;
}

export function ContextMenu({
  x,
  y,
  onClose,
  onRegenerate,
  onExplain,
  onFullscreen,
  onCopy
}: ContextMenuProps) {
  React.useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="card fixed z-50"
      style={{
        top: y,
        left: x,
        maxWidth: '200px',
        backgroundColor: 'rgba(36, 40, 50, 0.95)',
        backdropFilter: 'blur(10px)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <ul className="list">
        <li className="element" onClick={onRegenerate}>
          <RefreshCw />
          <span className="label">Regenerate</span>
        </li>
        <li className="element" onClick={onExplain}>
          <MessageSquare />
          <span className="label">Explain</span>
        </li>
        <li className="element" onClick={onFullscreen}>
          <Maximize2 />
          <span className="label">Fullscreen</span>
        </li>
      </ul>
      <div className="separator"></div>
      <ul className="list">
        <li className="element" onClick={onCopy}>
          <Copy />
          <span className="label">Copy Message</span>
        </li>
      </ul>
    </div>
  );
}