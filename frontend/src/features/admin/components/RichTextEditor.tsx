import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Image as ImageIcon,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  Highlighter,
  Type,
  ChevronDown,
} from 'lucide-react';

export type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  showWordCount?: boolean;
  className?: string;
};

type FormatCommand = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  command: 'bold' | 'italic' | 'underline' | 'strikeThrough' | 'insertUnorderedList' | 'insertOrderedList' | 'formatBlock' | 'justifyLeft' | 'justifyCenter' | 'justifyRight' | 'createLink' | 'insertImage' | 'removeFormat' | 'undo' | 'redo';
  value?: string;
};

const textCommands: FormatCommand[] = [
  { icon: Bold, label: 'Bold (Ctrl+B)', command: 'bold' },
  { icon: Italic, label: 'Italic (Ctrl+I)', command: 'italic' },
  { icon: Underline, label: 'Underline', command: 'underline' },
  { icon: Strikethrough, label: 'Strikethrough', command: 'strikeThrough' },
  { icon: Highlighter, label: 'Remove Formatting', command: 'removeFormat' },
];

const paragraphCommands: FormatCommand[] = [
  { icon: Heading1, label: 'Heading 1', command: 'formatBlock', value: 'H1' },
  { icon: Heading2, label: 'Heading 2', command: 'formatBlock', value: 'H2' },
  { icon: Heading3, label: 'Heading 3', command: 'formatBlock', value: 'H3' },
  { icon: Quote, label: 'Quote', command: 'formatBlock', value: 'BLOCKQUOTE' },
  { icon: Code, label: 'Code', command: 'formatBlock', value: 'PRE' },
];

const listCommands: FormatCommand[] = [
  { icon: List, label: 'Bulleted List', command: 'insertUnorderedList' },
  { icon: ListOrdered, label: 'Numbered List', command: 'insertOrderedList' },
];

const alignmentCommands: FormatCommand[] = [
  { icon: AlignLeft, label: 'Align Left', command: 'justifyLeft' },
  { icon: AlignCenter, label: 'Align Center', command: 'justifyCenter' },
  { icon: AlignRight, label: 'Align Right', command: 'justifyRight' },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start composing your content...',
  minHeight = 220,
  showWordCount = true,
  className = '',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const checkActiveStates = useCallback(() => {
    if (typeof document === 'undefined') return;
    const states: Record<string, boolean> = {};
    try {
      states.bold = document.queryCommandState('bold');
      states.italic = document.queryCommandState('italic');
      states.underline = document.queryCommandState('underline');
      states.strikeThrough = document.queryCommandState('strikeThrough');
      states.insertUnorderedList = document.queryCommandState('insertUnorderedList');
      states.insertOrderedList = document.queryCommandState('insertOrderedList');
    } catch (error) {
      // ignore
    }
    setActiveStates(states);
  }, []);

  const exec = useCallback(
    (command: FormatCommand['command'], commandValue?: string) => {
      if (!editorRef.current) return;
      editorRef.current.focus();
      if (command === 'createLink') {
        setShowLinkPrompt(true);
        return;
      }
      if (command === 'insertImage') {
        const url = window.prompt('Image URL:');
        if (url) {
          document.execCommand('insertImage', false, url);
        }
        return;
      }
      try {
        document.execCommand(command, false, commandValue);
      } catch (error) {
        // ignore unsupported commands
      }
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
      checkActiveStates();
    },
    [onChange, checkActiveStates]
  );

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const insertLink = useCallback(() => {
    if (!linkUrl) {
      setShowLinkPrompt(false);
      return;
    }
    if (editorRef.current) {
      editorRef.current.focus();
    }
    try {
      document.execCommand('createLink', false, linkUrl);
    } catch (error) {
      // ignore
    }
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    setLinkUrl('');
    setShowLinkPrompt(false);
  }, [linkUrl, onChange]);

  const stats = useMemo(() => {
    const plain = value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = plain ? plain.split(' ').length : 0;
    const chars = plain.length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return { words, chars, minutes };
  }, [value]);

  const ToolbarButton = ({ cmd, label, value: cmdValue }: { cmd: FormatCommand; label?: string; value?: string }) => {
    const Icon = cmd.icon;
    const key = cmd.command + (cmd.value ?? '');
    const active = activeStates[cmd.command] ?? false;
    return (
      <button
        type="button"
        title={label ?? cmd.label}
        aria-label={label ?? cmd.label}
        aria-pressed={active}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => exec(cmd.command, cmdValue)}
        className={`inline-flex h-8 min-w-[2rem] items-center justify-center gap-1 rounded-md px-2 text-xs font-semibold transition-all ${
          active ? 'bg-[#003580]/10 text-[#003580]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]'
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
        {label && <span className="hidden sm:inline">{label}</span>}
      </button>
    );
  };

  return (
    <div className={`overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${className}`}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--border-color)] bg-gradient-to-b from-slate-50/80 to-white px-2 py-1.5">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowHeadingMenu((open) => !open)}
            onMouseDown={(event) => event.preventDefault()}
            className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
            aria-haspopup="menu"
            aria-expanded={showHeadingMenu}
          >
            <Type className="h-3.5 w-3.5" />
            Paragraph
            <ChevronDown className="h-3 w-3" />
          </button>
          {showHeadingMenu && (
            <div className="absolute left-0 top-9 z-10 w-44 overflow-hidden rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] py-1 shadow-lg">
              {paragraphCommands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.label}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      exec(cmd.command, cmd.value);
                      setShowHeadingMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
                  >
                    <Icon className="h-4 w-4 text-[var(--text-muted)]" />
                    {cmd.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <span className="mx-1 h-5 w-px bg-[var(--bg-page)]" />
        {textCommands.map((cmd) => (
          <ToolbarButton key={cmd.label} cmd={cmd} />
        ))}
        <span className="mx-1 h-5 w-px bg-[var(--bg-page)]" />
        {listCommands.map((cmd) => (
          <ToolbarButton key={cmd.label} cmd={cmd} />
        ))}
        <span className="mx-1 h-5 w-px bg-[var(--bg-page)]" />
        {alignmentCommands.map((cmd) => (
          <ToolbarButton key={cmd.label} cmd={cmd} />
        ))}
        <span className="mx-1 h-5 w-px bg-[var(--bg-page)]" />
        <button
          type="button"
          title="Insert link"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setLinkUrl('');
            setShowLinkPrompt(true);
          }}
          className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md px-2 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]"
        >
          <Link2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Insert image"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => exec('insertImage')}
          className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md px-2 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]"
        >
          <ImageIcon className="h-3.5 w-3.5" />
        </button>
        <span className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            title="Undo"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => exec('undo')}
            className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md px-2 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Redo"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => exec('redo')}
            className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md px-2 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </span>
      </div>

      {showLinkPrompt && (
        <div className="flex items-center gap-2 border-b border-[var(--border-color)] bg-blue-50/60 px-3 py-2">
          <Link2 className="h-3.5 w-3.5 text-[#003580]" />
          <input
            type="url"
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            placeholder="https://example.com"
            className="flex-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1 text-sm outline-none focus:border-[#003580]"
            autoFocus
            onKeyDown={(event) => {
              if (event.key === 'Enter') insertLink();
              if (event.key === 'Escape') {
                setShowLinkPrompt(false);
                setLinkUrl('');
              }
            }}
          />
          <button
            type="button"
            onClick={insertLink}
            className="rounded-md bg-[#003580] px-3 py-1 text-xs font-semibold text-white hover:brightness-110"
          >
            Insert
          </button>
          <button
            type="button"
            onClick={() => {
              setShowLinkPrompt(false);
              setLinkUrl('');
            }}
            className="rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
          >
            Cancel
          </button>
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={checkActiveStates}
        onMouseUp={checkActiveStates}
        onBlur={handleInput}
        data-placeholder={placeholder}
        className="cms-rich-editor px-4 py-3 text-sm text-[var(--text-primary)] outline-none"
        style={{ minHeight }}
        dangerouslySetInnerHTML={{ __html: value }}
      />

      <style>{`
        .cms-rich-editor:empty::before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
        .cms-rich-editor h1 { font-size: 1.6rem; font-weight: 700; margin: 0.6rem 0; color: #0f172a; }
        .cms-rich-editor h2 { font-size: 1.3rem; font-weight: 700; margin: 0.5rem 0; color: #0f172a; }
        .cms-rich-editor h3 { font-size: 1.1rem; font-weight: 600; margin: 0.4rem 0; color: #0f172a; }
        .cms-rich-editor p { margin: 0.4rem 0; line-height: 1.65; }
        .cms-rich-editor ul { list-style: disc; margin-left: 1.4rem; margin-top: 0.4rem; margin-bottom: 0.4rem; }
        .cms-rich-editor ol { list-style: decimal; margin-left: 1.4rem; margin-top: 0.4rem; margin-bottom: 0.4rem; }
        .cms-rich-editor blockquote { border-left: 3px solid #003580; padding-left: 0.8rem; color: #475569; font-style: italic; margin: 0.6rem 0; }
        .cms-rich-editor pre { background: #0f172a; color: #e2e8f0; padding: 0.6rem 0.8rem; border-radius: 6px; font-family: 'Fira Code', monospace; font-size: 12px; overflow-x: auto; }
        .cms-rich-editor a { color: #003580; text-decoration: underline; }
        .cms-rich-editor img { max-width: 100%; height: auto; border-radius: 6px; margin: 0.4rem 0; }
      `}</style>

      {showWordCount && (
        <div className="flex items-center justify-between border-t border-[var(--border-color)] bg-[var(--bg-page)] px-3 py-1.5 text-[10px] text-[var(--text-muted)]">
          <span>{stats.words} words · {stats.chars} characters</span>
          <span>~{stats.minutes} min read</span>
        </div>
      )}
    </div>
  );
}
