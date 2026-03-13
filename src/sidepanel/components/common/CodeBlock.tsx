import React, { useState } from 'react';

interface CodeBlockProps {
  children: string;
  language: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ children, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-2">
      <div className="flex items-center justify-between bg-codex-surface border border-codex-border rounded-t-lg px-3 py-1 text-xs text-codex-muted">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-codex-muted hover:text-codex-text"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="!rounded-t-none !mt-0 !border-t-0">
        <code className={`language-${language}`}>{children}</code>
      </pre>
    </div>
  );
};
