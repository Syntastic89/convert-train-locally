import React, { useState } from 'react';
import {
  Home, Store, Cpu, MessageSquare, GraduationCap, HardDrive, LifeBuoy,
  Minus, Square, X, Search, Wifi, ShieldCheck, Menu, Zap, Sparkles
} from 'lucide-react';
import { useForge } from '@/contexts/ForgeContext';
import { NAV_ITEMS, ViewKey, DEVICE_PROFILE } from '@/data/forgeData';
import { Badge, Btn, ShimmerBar } from '@/components/forge/ui';
import { cn } from '@/lib/utils';

const ICONS: Record<ViewKey, React.ElementType> = {
  dashboard: Home,
  library: Store,
  convert: Cpu,
  chat: MessageSquare,
  train: GraduationCap,
  manage: HardDrive,
  help: LifeBuoy
};

export const TitleBar: React.FC<{ onMenu: () => void }> = ({ onMenu }) => {
  const { pushToast, setView, telemetry } = useForge();
  const [q, setQ] = useState('');
  const [maximized, setMaximized] = useState(true);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setView('library');
    pushToast('Searching the model store', `Looking for "${q.trim()}" on Hugging Face`);
    window.dispatchEvent(new CustomEvent('forge-search', { detail: q.trim() }));
    setQ('');
  };

  return (
    <header className="relative z-30 flex h-11 shrink-0 items-center gap-3 border-b border-white/10 bg-black/40 px-3 backdrop-blur-2xl">
      <button onClick={onMenu} className="rounded-md p-1.5 text-slate-300 hover:bg-white/10 lg:hidden" aria-label="Menu">
        <Menu className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[0_0_14px_-2px_rgba(139,92,246,0.9)]">
          <Zap className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-[13px] font-semibold tracking-tight text-white">LocalForge NPU</span>
        <span className="hidden font-mono text-[10px] text-slate-500 sm:inline">v2.4.1 · ARM64</span>
      </div>

      <form onSubmit={submitSearch} className="mx-auto hidden w-full max-w-md items-center md:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search uncensored models, datasets, anything…"
            className="h-7 w-full rounded-md border border-white/10 bg-white/[0.05] pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden items-center gap-1.5 font-mono text-[10px] text-emerald-300 sm:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          NPU {telemetry.npu.toFixed(0)}%
        </span>
        <ShieldCheck className="hidden h-3.5 w-3.5 text-cyan-300 sm:block" />
        <Wifi className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
        <div className="flex items-center">
          <button onClick={() => pushToast('Minimised to tray', 'LocalForge keeps running in the background.')}
            className="px-3 py-2.5 text-slate-300 hover:bg-white/10" aria-label="Minimise">
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => { setMaximized(!maximized); pushToast(maximized ? 'Restored window' : 'Maximised window'); }}
            className="px-3 py-2.5 text-slate-300 hover:bg-white/10" aria-label="Maximise">
            <Square className="h-3 w-3" />
          </button>
          <button onClick={() => pushToast('Close blocked', 'A model is loaded — close it from My Models first.')}
            className="px-3 py-2.5 text-slate-300 hover:bg-rose-600 hover:text-white" aria-label="Close">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export const Sidebar: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { view, setView, installed, storageUsed, openWizard, userName } = useForge();
  const ready = installed.filter((m) => m.status === 'ready' || m.status === 'onnx').length;
  const pct = (storageUsed / DEVICE_PROFILE.storageTotal) * 100;

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" />}
      <aside
        className={cn(
          'fixed inset-y-11 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-white/10 bg-black/50 backdrop-blur-2xl transition-transform duration-300 lg:static lg:inset-auto lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="px-3 pt-4">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {userName ? `Hi ${userName}` : 'Workspace'}
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = ICONS[item.key];
              const active = view === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => { setView(item.key); onClose(); }}
                  className={cn(
                    'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all',
                    active
                      ? 'bg-gradient-to-r from-violet-600/25 to-cyan-500/10 text-white'
                      : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100'
                  )}
                >
                  {active && <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-gradient-to-b from-violet-400 to-cyan-300" />}
                  <Icon className={cn('h-4 w-4 shrink-0', active && 'text-cyan-300')} />
                  <span className="flex-1">
                    <span className="block text-[13px] font-medium leading-tight">{item.label}</span>
                    <span className="block text-[10px] leading-tight text-slate-500">{item.hint}</span>
                  </span>
                  {item.key === 'manage' && ready > 0 && (
                    <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.5 font-mono text-[10px] text-cyan-200">{ready}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto space-y-3 p-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <div className="mb-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Disk used by models</span>
              <span className="font-mono text-white">{storageUsed.toFixed(1)} GB</span>
            </div>
            <ShimmerBar value={pct} />
            <p className="mt-2 font-mono text-[10px] text-slate-500">
              {(DEVICE_PROFILE.storageTotal - storageUsed).toFixed(0)} GB free of {DEVICE_PROFILE.storageTotal} GB
            </p>
          </div>

          <div className="rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-600/15 to-cyan-500/10 p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-violet-300" />
              <span className="text-[11px] font-semibold text-white">Snapdragon X Elite</span>
            </div>
            <p className="font-mono text-[10px] leading-relaxed text-slate-400">45 TOPS Hexagon NPU detected</p>
            <Badge tone="emerald" className="mt-2">Hardware ready</Badge>
          </div>

          <Btn variant="outline" size="sm" className="w-full" onClick={openWizard}>
            Replay setup guide
          </Btn>
        </div>
      </aside>
    </>
  );
};
