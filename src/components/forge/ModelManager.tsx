import React, { useState } from 'react';
import {
  HardDrive, Zap, Cpu, Trash2, Play, BarChart3, Loader2, Download, FolderOpen, CheckCircle2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useForge } from '@/contexts/ForgeContext';
import { DEVICE_PROFILE } from '@/data/forgeData';
import { GlassCard, Btn, Badge, SectionTitle, ShimmerBar, HelpDot, ProgressRing } from '@/components/forge/ui';
import { cn } from '@/lib/utils';

const ModelManager: React.FC = () => {
  const {
    installed, storageUsed, removeModel, toggleNpu, setActiveModelId, activeModelId,
    setView, pushToast, runs
  } = useForge();
  const [benching, setBenching] = useState<string | null>(null);
  const [benched, setBenched] = useState<Record<string, { npu: number; cpu: number; ttft: number }>>({});

  const runBenchmark = (id: string, npuTps: number, cpuTps: number) => {
    setBenching(id);
    window.setTimeout(() => {
      const npu = Math.max(4, Math.round(npuTps * (0.9 + Math.random() * 0.2)));
      const cpu = Math.max(2, Math.round(cpuTps * (0.9 + Math.random() * 0.2)));
      setBenched((b) => ({ ...b, [id]: { npu, cpu, ttft: +(0.18 + Math.random() * 0.4).toFixed(2) } }));
      setBenching(null);
      pushToast('Benchmark finished', `${npu} tokens/sec on the NPU versus ${cpu} on the CPU.`);
    }, 2200);
  };

  const chartData = installed
    .filter((m) => m.status !== 'downloading')
    .map((m) => ({
      name: m.name.length > 12 ? `${m.name.slice(0, 12)}…` : m.name,
      NPU: benched[m.id]?.npu ?? (m.npuReady ? m.npuTps : 0),
      CPU: benched[m.id]?.cpu ?? m.cpuTps
    }));

  const pct = (storageUsed / DEVICE_PROFILE.storageTotal) * 100;

  return (
    <div className="space-y-6">
      <SectionTitle
        title="My Models"
        sub="Everything installed on this PC, how much room it takes, and how fast it really runs. One tap swaps between the neural engine and the CPU."
        term="tokens"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <HardDrive className="h-4 w-4 text-cyan-300" /> Disk usage
            </h3>
            <span className="font-mono text-[11px] text-slate-400">
              {storageUsed.toFixed(1)} GB of {DEVICE_PROFILE.storageTotal} GB
            </span>
          </div>
          <ShimmerBar value={pct} className="h-3" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Models', `${installed.length}`],
              ['NPU ready', `${installed.filter((m) => m.format === 'ONNX').length}`],
              ['Trained add-ons', `${runs.filter((r) => r.status === 'done').length}`],
              ['Free space', `${(DEVICE_PROFILE.storageTotal - storageUsed).toFixed(0)} GB`]
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="font-mono text-base font-bold text-white">{v}</p>
                <p className="text-[10px] uppercase tracking-wide text-slate-500">{k}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-white">
            Where are my files? <HelpDot term="onnx" />
          </h3>
          <div className="mt-3 space-y-2 font-mono text-[10.5px] text-slate-400">
            <p className="rounded-lg bg-black/40 px-3 py-2">C:\LocalForge\Models</p>
            <p className="rounded-lg bg-black/40 px-3 py-2">C:\LocalForge\Models\onnx</p>
            <p className="rounded-lg bg-black/40 px-3 py-2">C:\LocalForge\Training\loras</p>
          </div>
          <Btn variant="outline" size="sm" className="mt-3 w-full" onClick={() => pushToast('Folder opened', 'C:\\LocalForge\\Models is now open in File Explorer.')}>
            <FolderOpen className="h-3.5 w-3.5" /> Open in File Explorer
          </Btn>
        </GlassCard>
      </div>

      {installed.length === 0 ? (
        <GlassCard className="p-10 text-center">
          <Download className="mx-auto h-7 w-7 text-slate-500" />
          <h3 className="mt-3 text-lg font-semibold text-white">No models installed yet</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">
            Head to the Model Store and download one. The 3B pocket model is only 2 GB and starts working in under a minute.
          </p>
          <Btn className="mt-4" onClick={() => setView('library')}>Open the Model Store</Btn>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {installed.map((m) => {
            const b = benched[m.id];
            return (
              <GlassCard key={m.id} className="p-4" glow={activeModelId === m.id}>
                <div className="flex flex-wrap items-center gap-4">
                  {m.status === 'downloading'
                    ? <ProgressRing value={m.progress} size={52} />
                    : <img src={m.thumb} alt="" className="h-[52px] w-[52px] rounded-xl object-cover" />}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[15px] font-semibold text-white">{m.name}</p>
                      {activeModelId === m.id && <Badge tone="violet"><CheckCircle2 className="h-3 w-3" /> Loaded</Badge>}
                      {m.format === 'ONNX' ? <Badge tone="emerald">ONNX · NPU</Badge> : <Badge tone="amber">GGUF · CPU</Badge>}
                      {m.status === 'downloading' && <Badge tone="cyan">{Math.round(m.progress)}% downloaded</Badge>}
                    </div>
                    <p className="mt-1 truncate font-mono text-[10.5px] text-slate-500">
                      {m.id} · {m.params} · {m.quant} · {m.sizeGB.toFixed(1)} GB on disk
                    </p>

                    {b && (
                      <p className="mt-1 font-mono text-[10.5px] text-emerald-300">
                        benchmark: {b.npu} tok/s NPU · {b.cpu} tok/s CPU · {b.ttft}s to first word
                      </p>
                    )}
                  </div>

                  {/* NPU / CPU switch */}
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 p-1">
                    <button
                      onClick={() => m.useNpu && toggleNpu(m.id)}
                      className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition',
                        !m.useNpu ? 'bg-white/[0.12] text-white' : 'text-slate-400 hover:text-slate-200')}
                    >
                      <Cpu className="h-3.5 w-3.5" /> CPU
                    </button>
                    <button
                      onClick={() => !m.useNpu && toggleNpu(m.id)}
                      className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition',
                        m.useNpu ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white' : 'text-slate-400 hover:text-slate-200')}
                    >
                      <Zap className="h-3.5 w-3.5" /> NPU
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Btn size="sm" variant="outline" disabled={m.status === 'downloading'} onClick={() => { setActiveModelId(m.id); setView('chat'); }}>
                      <Play className="h-3.5 w-3.5" /> Load &amp; chat
                    </Btn>
                    <Btn size="sm" variant="subtle" disabled={benching === m.id || m.status === 'downloading'} onClick={() => runBenchmark(m.id, m.npuReady ? m.npuTps : m.cpuTps * 1.1, m.cpuTps)}>
                      {benching === m.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BarChart3 className="h-3.5 w-3.5" />} Benchmark
                    </Btn>
                    {m.format !== 'ONNX' && m.status !== 'downloading' && (
                      <Btn size="sm" variant="outline" onClick={() => setView('convert')}>
                        <Zap className="h-3.5 w-3.5" /> Speed up
                      </Btn>
                    )}
                    <Btn size="sm" variant="danger" onClick={() => removeModel(m.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Btn>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {chartData.length > 0 && (
        <GlassCard className="p-5">
          <SectionTitle
            title="Speed comparison"
            sub="Tokens per second — higher is better. Hit Benchmark on any model above to measure it for real."
            term="tokens"
          />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0b0b1a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="NPU" fill="#a78bfa" radius={[6, 6, 0, 0]} />
                <Bar dataKey="CPU" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {runs.filter((r) => r.status === 'done').length > 0 && (
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white">Trained add-ons (LoRA files) <HelpDot term="lora" /></h3>
          <div className="mt-3 space-y-2">
            {runs.filter((r) => r.status === 'done').map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="font-mono text-[11.5px] text-white">{r.loraName}</span>
                <span className="font-mono text-[10.5px] text-slate-500">from {r.datasetId}</span>
                <Badge tone="emerald">applied</Badge>
                <Btn size="sm" variant="outline" className="ml-auto" onClick={() => { setActiveModelId(r.modelId); setView('chat'); }}>
                  Test it
                </Btn>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default ModelManager;
