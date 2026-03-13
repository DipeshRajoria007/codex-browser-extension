import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;
          if (isInline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
          return (
            <CodeBlock language={match?.[1] ?? ''}>
              {String(children).replace(/\n$/, '')}
            </CodeBlock>
          );
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-codex-accent hover:underline"
            >
              {children}
            </a>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full border border-codex-border text-sm">{children}</table>
            </div>
          );
        },
        th({ children }) {
          return <th className="border border-codex-border px-3 py-1.5 bg-codex-surface text-left">{children}</th>;
        },
        td({ children }) {
          return <td className="border border-codex-border px-3 py-1.5">{children}</td>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
