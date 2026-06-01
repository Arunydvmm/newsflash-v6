'use client'
export default function GlitchText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span
      className={`relative font-mono font-bold select-none ${className}`}
      style={{ color: 'var(--cyber-primary)' }}
      data-text={text}
    >
      {text}
      <style>{`
        [data-text]::before,
        [data-text]::after {
          content: attr(data-text);
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
        }
        [data-text]::before {
          color: #ff3860;
          animation: glitch-1 3s infinite linear;
          clip-path: polygon(0 30%, 100% 30%, 100% 50%, 0 50%);
        }
        [data-text]::after {
          color: #00d9ff;
          animation: glitch-2 3s infinite linear;
          clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%);
        }
        @keyframes glitch-1 {
          0%, 90%, 100% { transform: translate(0); opacity: 0; }
          92%            { transform: translate(-2px, 1px); opacity: 0.8; }
          94%            { transform: translate(2px, -1px); opacity: 0.8; }
          96%            { transform: translate(-1px, 0); opacity: 0.8; }
        }
        @keyframes glitch-2 {
          0%, 85%, 100% { transform: translate(0); opacity: 0; }
          87%            { transform: translate(2px, -1px); opacity: 0.8; }
          89%            { transform: translate(-2px, 1px); opacity: 0.8; }
        }
      `}</style>
    </span>
  )
}