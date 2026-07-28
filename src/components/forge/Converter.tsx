import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  UploadCloud, FileBox, Cpu, Check, Loader2, Sparkles, Zap, RotateCcw, FolderOpen, ArrowRight
} from 'lucide-react';
import { useForge } from '@/contexts/ForgeContext';
import { CONVERT_STEPS, PRECISION_OPTIONS } from '@/data/forgeData';
import { GlassCard, Btn, Badge, SectionTitle, ShimmerBar, HelpDot } from '@/components/forge/ui';
import { cn } from '@/lib/utils';

interface Job {
  name: string;
  sizeGB: number;
  modelId?: string;
  precision: string;
}

const Converter: React.FC = () => {
  const { installed, convertModel, finishConversion, pushToast, setView, setActiveModelId } = useForge();
  const [dragging, setDragging] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [precision, setPrecision] = useState('int8');
  const [stepIdx, setStepIdx] = useState(-1);
  const [stepPct, setStepPct] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | null>(null);

  const convertibles = installed.filter((m) => m.status === 'ready');

  const log = (s: string) => setLogs((l) => [...l.slice(-60), `[${new Date().toLocaleTimeString()}] ${s}`]);

  const beginJob = (j: Job) => {
    setJob(j);
    setDone(false);
    setStepIdx(-1);
    setStepPct(0);
    setLogs([`[${new Date().toLocaleTimeString()}] Loaded ${j.name} (${j.sizeGB.toFixed(1)} GB)`]);
    pushToast('Model loaded into the converter', 'Press Convert when you are ready.');
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    beginJob({ name: f.name, sizeGB: Math.max(0.6, f.size / 1e9 || 4.6), precision });
  }, [precision]);

  const start = () => {
    if (!job) return;
    if (job.modelId) convertModel(job.modelId);
    setStepIdx(0);
    setStepPct(0);
    log(`Starting ${job.precision.toUpperCase()} conversion for Snapdragon X Elite (QNN 2.28)`);
  };

  useEffect(() => {
    if (stepIdx < 0 || done) return;
    timer.current = window.setInterval(() => {
      setStepPct((p) => {
        const next = p + 6 + Math.random() * 9;
        if (next >= 100) {
          const s = CONVERT_STEPS[stepIdx];
          log(`${s.label} — complete`);
          if (stepIdx === CONVERT_STEPS.length - 1) {
            setDone(true);
            setStepIdx(CONVERT_STEPS.length);
            if (job?.modelId) {
              finishConversion(job.modelId);
              setActiveModelId(job.modelId);
            }
            pushToast('Conversion complete', 'Your model now runs on the Hexagon NPU.');
            return 100;
          }
          setStepIdx(stepIdx + 1);
          return 0;
        }
        return next;
      });
    }, 240);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [stepIdx, done, job, finishConversion, pushToast, setActiveModelId]);

  const reset = () => {
    if (timer.current) window.clearInterval(timer.current);
    setJob(null); setStepIdx(-1); setStepPct(0); setDone(false); setLogs([]);
  };

  const running = stepIdx >= 0 && !done;

  return (
    <div className="space-y-6">
      <SectionTitle
        title="NPU Converter"
        sub="Drag any model file in. We turn it into an ONNX bundle your Snapdragon neural engine can run — roughly four times faster and much kinder to your battery."
        term="onnx"
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        {/* DROP ZONE / PROGRESS */}
        <div className="space-y-4">
          {!job && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={cn(
                'group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300',
                dragging
                  ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_70px_-15px_rgba(34,211,238,0.7)] scale-[1.01]'
                  : 'border-white/15 bg-white/[0.03] hover:border-violet-400/60 hover:bg-violet-500/[0.07]'
              )}
            >
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) beginJob({ name: f.name, sizeGB: Math.max(0.6, f.size / 1e9 || 4.6), precision });
                }}
              />
              <div className={cn('mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/40 to-cyan-500/30 transition-transform', dragging && 'scale-110')}
                style={{ animation: 'floaty 3.5s ease-in-out infinite' }}>
                <UploadCloud className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Drop a model file here</h3>
              <p className="mt-1.5 max-w-sm text-sm text-slate-400">
                .gguf, .safetensors, .bin or a whole folder. Or click to browse your PC.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['.gguf', '.safetensors', '.pt', '.bin', 'folder'].map((x) => (
                  <span key={x} className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 font-mono text-[10px] text-slate-400">{x}</span>
                ))}
              </div>
            </div>
          )}

          {job && (
            <GlassCard className="p-5" glow={done}>
              <div className="flex items-start gap-4">
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                  done ? 'bg-emerald-500/20' : 'bg-violet-500/20')}>
                  {done ? <Check className="h-6 w-6 text-emerald-300" /> : <FileBox className="h-6 w-6 text-violet-200" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-white">{job.name}</p>
                  <p className="font-mono text-[11px] text-slate-500">
                    {job.sizeGB.toFixed(1)} GB → {(job.sizeGB * (precision === 'int4' ? 0.52 : precision === 'int8' ? 0.68 : 1.05)).toFixed(1)} GB · {precision.toUpperCase()}
                  </p>
                </div>
                <Badge tone={done ? 'emerald' : running ? 'cyan' : 'slate'}>
                  {done ? 'Converted' : running ? 'Working' : 'Ready'}
                </Badge>
              </div>

              {done ? (
                <div className="mt-5 forge-pop">
                  <div className="rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/15 to-cyan-500/10 p-5 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/25">
                      <Sparkles className="h-7 w-7 text-emerald-200" />
                    </div>
                    <h3 className="text-xl font-bold text-white">All done — it&apos;s NPU accelerated</h3>
                    <p className="mx-auto mt-1.5 max-w-md text-sm text-emerald-100/80">
                      Saved to <span className="font-mono">C:\LocalForge\Models\onnx</span>. It is now the model your chats use.
                    </p>
                    <div className="mx-auto mt-4 grid max-w-sm grid-cols-3 gap-3">
                      {[['Before', '11 tok/s', 'text-slate-300'], ['After', '43 tok/s', 'text-emerald-200'], ['Battery', '−62%', 'text-cyan-200']].map(([k, v, c]) => (
                        <div key={k} className="rounded-xl bg-black/35 p-3">
                          <p className={cn('font-mono text-sm font-bold', c)}>{v}</p>
                          <p className="text-[10px] uppercase tracking-wide text-slate-500">{k}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      <Btn onClick={() => setView('chat')}><Zap className="h-4 w-4" /> Chat with it now</Btn>
                      <Btn variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" /> Convert another</Btn>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-5 space-y-3">
                    {CONVERT_STEPS.map((s, i) => {
                      const state = stepIdx > i ? 'done' : stepIdx === i ? 'active' : 'todo';
                      return (
                        <div key={s.key} className={cn('rounded-xl border p-3 transition-all',
                          state === 'active' ? 'border-violet-400/50 bg-violet-500/10' :
                          state === 'done' ? 'border-emerald-400/25 bg-emerald-500/[0.07]' : 'border-white/10 bg-white/[0.02]')}>
                          <div className="flex items-center gap-3">
                            <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                              state === 'done' ? 'bg-emerald-500/25 text-emerald-200' :
                              state === 'active' ? 'bg-violet-500/30 text-white' : 'bg-white/[0.07] text-slate-500')}>
                              {state === 'done' ? <Check className="h-3.5 w-3.5" /> : state === 'active' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : i + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className={cn('text-[13px] font-medium', state === 'todo' ? 'text-slate-500' : 'text-white')}>{s.label}</p>
                              <p className="truncate text-[11px] text-slate-500">{s.detail}</p>
                            </div>
                            {state === 'active' && <span className="font-mono text-[11px] text-cyan-200">{Math.round(stepPct)}%</span>}
                          </div>
                          {state === 'active' && <ShimmerBar value={stepPct} className="mt-2.5 h-1.5" />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {!running && <Btn onClick={start}><Cpu className="h-4 w-4" /> Convert to ONNX for NPU</Btn>}
                    {running && <Btn variant="subtle" disabled><Loader2 className="h-4 w-4 animate-spin" /> Converting…</Btn>}
                    <Btn variant="outline" onClick={reset}>Cancel</Btn>
                  </div>
                </>
              )}
            </GlassCard>
          )}

          {logs.length > 0 && (
            <GlassCard className="p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Technical log (you can ignore this)</p>
              <div className="forge-scroll max-h-40 overflow-y-auto rounded-lg bg-black/50 p-3 font-mono text-[10px] leading-relaxed text-emerald-200/80">
                {logs.map((l, i) => <p key={i}>{l}</p>)}
              </div>
            </GlassCard>
          )}
        </div>

        {/* SIDE PANEL */}
        <div className="space-y-4">
          <GlassCard className="p-5">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-white">
              Number precision <HelpDot term="quantization" />
            </h3>
            <p className="mt-1 text-[11px] text-slate-400">INT8 is picked for you. It is the best all-round choice on this chip.</p>
            <div className="mt-3 space-y-2">
              {PRECISION_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  disabled={running}
                  onClick={() => setPrecision(p.id)}
                  className={cn('w-full rounded-xl border p-3 text-left transition disabled:opacity-50',
                    precision === p.id ? 'border-violet-400/60 bg-violet-500/15' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]')}
                >
                  <p className="text-[13px] font-medium text-white">{p.label}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{p.hint}</p>
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-white">Or pick one you already downloaded</h3>
            {convertibles.length === 0 ? (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
                <FolderOpen className="mx-auto h-5 w-5 text-slate-500" />
                <p className="mt-2 text-[12px] text-slate-400">
                  Nothing waiting for conversion. Grab a model from the store first.
                </p>
                <Btn size="sm" variant="outline" className="mt-3" onClick={() => setView('library')}>
                  Open Model Store <ArrowRight className="h-3.5 w-3.5" />
                </Btn>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {convertibles.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => beginJob({ name: `${m.name} · ${m.quant}.gguf`, sizeGB: m.sizeGB, modelId: m.id, precision })}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-violet-400/40 hover:bg-white/[0.07]"
                  >
                    <img src={m.thumb} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-white">{m.name}</p>
                      <p className="font-mono text-[10px] text-slate-500">{m.sizeGB.toFixed(1)} GB · {m.quant}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-500" />
                  </button>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-white">Why bother converting?</h3>
            <ul className="mt-3 space-y-2.5 text-[12px] leading-relaxed text-slate-400">
              {[
                'Your Snapdragon has a 45 TOPS NPU that only understands ONNX. Converting unlocks it.',
                'Answers appear about 4x quicker, and the fans stay quiet.',
                'The file gets 30–48% smaller, so you can keep more models on disk.',
                'We run 20 test prompts afterwards to prove the answers still match.'
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Converter;
