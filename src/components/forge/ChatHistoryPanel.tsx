import React, { useMemo, useState } from 'react';
import {
  Search, Plus, Pin, PinOff, Pencil, Trash2, Download, MessageSquare, PanelLeftClose, PanelLeftOpen, Check, X
} from 'lucide-react';
import { Conversation } from '@/lib/chatHistory';
import { Btn } from '@/components/forge/ui';
import { cn } from '@/lib/utils';

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onPin: (id: string, pinned: boolean) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
  loading?: boolean;
}

const ChatHistoryPanel: React.FC<Props> = ({
  collapsed, onToggle, conversations, activeId, onSelect, onNew, onRename, onPin, onDelete, onExport, loading
}) => {
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const filtered = s ? conversations.filter((c) => c.title.toLowerCase().includes(s)) : conversations;
    return [...filtered].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [conversations, q]);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur-xl">
        <button onClick={onToggle} title="Show chat history" className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white">
          <PanelLeftOpen className="h-4 w-4" />
        </button>
        <button onClick={onNew} title="New chat" className="rounded-lg p-2 text-cyan-300 hover:bg-white/10">
          <Plus className="h-4 w-4" />
        </button>
        <span className="mt-1 font-mono text-[10px] text-slate-500">{conversations.length}</span>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-9.5rem)] min-h-[520px] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
        <MessageSquare className="h-4 w-4 text-violet-300" />
        <span className="text-[13px] font-semibold text-white">Your chats</span>
        <span className="font-mono text-[10px] text-slate-500">{conversations.length}</span>
        <button onClick={onToggle} title="Hide" className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2 p-3">
        <Btn size="sm" className="w-full" onClick={onNew}><Plus className="h-3.5 w-3.5" /> New chat</Btn>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search past chats…"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/[0.05] pl-8 pr-2 text-[12px] text-white placeholder:text-slate-500 focus:border-violet-400/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="forge-scroll flex-1 space-y-1 overflow-y-auto px-2 pb-3">
        {loading && <p className="px-2 py-3 text-[11.5px] text-slate-500">Loading history…</p>}
        {!loading && list.length === 0 && (
          <p className="px-2 py-3 text-[11.5px] leading-relaxed text-slate-500">
            {q ? 'No chats match that search.' : 'No saved chats yet. Anything you type is saved automatically.'}
          </p>
        )}
        {list.map((c) => (
          <div
            key={c.id}
            className={cn('group rounded-xl border px-2.5 py-2 transition',
              activeId === c.id ? 'border-violet-400/50 bg-violet-500/12' : 'border-transparent hover:border-white/10 hover:bg-white/[0.06]')}
          >
            {editing === c.id ? (
              <div className="flex items-center gap-1.5">
                <input
                  value={draft}
                  autoFocus
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { onRename(c.id, draft.trim() || c.title); setEditing(null); }
                    if (e.key === 'Escape') setEditing(null);
                  }}
                  className="h-7 flex-1 rounded-md border border-white/15 bg-black/40 px-2 text-[12px] text-white focus:outline-none"
                />
                <button onClick={() => { onRename(c.id, draft.trim() || c.title); setEditing(null); }} className="rounded p-1 text-emerald-300 hover:bg-white/10">
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setEditing(null)} className="rounded p-1 text-slate-400 hover:bg-white/10">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => onSelect(c.id)} className="w-full text-left">
                  <p className="flex items-center gap-1.5 truncate text-[12.5px] font-medium text-slate-100">
                    {c.pinned && <Pin className="h-3 w-3 shrink-0 text-amber-300" />}
                    <span className="truncate">{c.title}</span>
                  </p>
                  <p className="truncate font-mono text-[10px] text-slate-500">
                    {c.model_name ?? 'model'} · {new Date(c.updated_at).toLocaleDateString()} {new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </button>
                <div className="mt-1 flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                  <button onClick={() => onPin(c.id, !c.pinned)} title={c.pinned ? 'Unpin' : 'Pin'} className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-amber-300">
                    {c.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => { setEditing(c.id); setDraft(c.title); }} title="Rename" className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-cyan-300">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onExport(c.id)} title="Export as markdown" className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-violet-300">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onDelete(c.id)} title="Delete" className="ml-auto rounded p-1 text-slate-400 hover:bg-white/10 hover:text-rose-300">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <p className="border-t border-white/10 px-3 py-2 text-[10px] leading-relaxed text-slate-500">
        History is stored for this PC only. Nothing is tied to an account.
      </p>
    </div>
  );
};

export default ChatHistoryPanel;
