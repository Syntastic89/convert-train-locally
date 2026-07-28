import React, { useState } from 'react';
import {
  GraduationCap, Database, Target, Rocket, Check, Loader2, Search, Globe, UploadCloud, ArrowRight, ArrowLeft, Square
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/lib/supabase';
import { useForge } from '@/contexts/ForgeContext';
import { CURATED_DATASETS, TRAINING_GOALS } from '@/data/forgeData';
import { GlassCard, Btn, Badge, SectionTitle, HelpDot, ShimmerBar } from '@/components/forge/ui';
import { cn } from '@/lib/utils';

const STEP_LABELS = ['Choose a model', 'Choose data', 'Set the goal', 'Train'];

const Trainer: React.FC = () => {
  const { installed, runs, startRun, stopRun, setView, pushToast } = useForge();
  const trainable = installed.filter((m) => m.status === 'ready' || m.status === 'onnx');

  const [step, setStep] = useState(0);
  const [modelId, setModelId] = useState<string>('');
  const [dataset, setDataset] = useState<{ id: string; name: string; rows: string }>();
  const [goal, setGoal] = useState(TRAINING_GOALS[0].id);
  const [strength, setStrength] = useState(2);
  const [loraName, setLoraName] = useState('');
  const [hfQ, setHfQ] = useState('');
  const [hfDs, setHfDs] = useState<{ id: string; downloads: number; likes: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const activeRun = runs.find((r) => r.status === 'running') ?? runs[0];
  const model = installed.find((m) => m.id === modelId);
  const goalObj = TRAINING_GOALS.find((g) => g.id === goal)!;

  const searchDatasets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('hf-hub', {
        body: { kind: 'datasets', search: hfQ.trim() || 'instruct', sort: 'downloads', limit: 9 }
      });
      if (error) throw error;
      setHfDs((data?.items ?? []).map((d: { id: string; downloads: number; likes: number }) => d));
      pushToast('Hugging Face datasets loaded', `${data?.items?.length ?? 0} results`);
    } catch {
      pushToast('Could not reach Hugging Face', 'Use one of the recommended datasets instead.');
    } finally {
      setLoading(false);
    }
  };

  const begin = () => {
    if (!model || !dataset) return;
    const name = (loraName.trim() || `${model.name}-${goalObj.id}`).replace(/\s+/g, '-').toLowerCase() + '.lora';
    startRun({
      modelId: model.id,
      datasetId: dataset.id,
      goal: goalObj.label,
      epochs: strength,
      totalSteps: 60 + strength * 25,
      loraName: name
    });
    setStep(3);
  };

  const canNext = step === 0 ? !!modelId : step === 1 ? !!dataset : true;

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Trainer"
        sub="Teach a model new tricks with a Hugging Face dataset. Pick, point, press start — we handle LoRA ranks, learning rates and the NPU scheduling for you."
        term="lora"
      />

      {/* stepper */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {STEP_LABELS.map((l, i) => (
            <React.Fragment key={l}>
              <button
                onClick={() => i <= step && setStep(i)}
                className={cn('flex items-center gap-2 rounded-xl px-3 py-2 text-left transition',
                  i === step ? 'bg-gradient-to-r from-violet-600/30 to-cyan-500/15' : i < step ? 'hover:bg-white/[0.06]' : 'opacity-50')}
              >
                <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold',
                  i < step ? 'bg-emerald-500/25 text-emerald-200' : i === step ? 'bg-violet-500/35 text-white' : 'bg-white/[0.07] text-slate-500')}>
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={cn('text-[12px] font-medium', i === step ? 'text-white' : 'text-slate-400')}>{l}</span>
              </button>
              {i < STEP_LABELS.length - 1 && <span className="hidden h-px flex-1 bg-white/10 sm:block" />}
            </React.Fragment>
          ))}
        </div>
      </GlassCard>

      {/* STEP 0 — model */}
      {step === 0 && (
        <GlassCard className="p-6">
          <h3 className="flex items-center gap-2 text-base font-semibold text-white">
            <GraduationCap className="h-4 w-4 text-violet-300" /> Which model should learn?
          </h3>
          <p className="mt-1 text-sm text-slate-400">Training makes a small add-on file. Your original model is never damaged.</p>
          {trainable.length === 0 ? (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
              <p className="text-sm text-slate-400">You need at least one downloaded model first.</p>
              <Btn className="mt-3" onClick={() => setView('library')}>Open the Model Store</Btn>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {trainable.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModelId(m.id)}
                  className={cn('flex items-center gap-3 rounded-xl border p-3 text-left transition',
                    modelId === m.id ? 'border-violet-400/60 bg-violet-500/15' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]')}
                >
                  <img src={m.thumb} alt="" className="h-11 w-11 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{m.name}</p>
                    <p className="font-mono text-[10px] text-slate-500">{m.params} · {m.format}</p>
                  </div>
                  {modelId === m.id && <Check className="ml-auto h-4 w-4 text-violet-300" />}
                </button>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* STEP 1 — dataset */}
      {step === 1 && (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <GlassCard className="p-6">
            <h3 className="flex items-center gap-2 text-base font-semibold text-white">
              <Database className="h-4 w-4 text-cyan-300" /> Recommended datasets <HelpDot term="dataset" />
            </h3>
            <p className="mt-1 text-sm text-slate-400">Hand-picked and known to work. Click one.</p>
            <div className="mt-4 space-y-2">
              {CURATED_DATASETS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDataset(d)}
                  className={cn('w-full rounded-xl border p-3 text-left transition',
                    dataset?.id === d.id ? 'border-cyan-400/60 bg-cyan-500/12' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]')}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-semibold text-white">{d.name}</p>
                    <Badge tone="cyan">{d.rows} rows</Badge>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-slate-400">{d.desc}</p>
                  <p className="mt-1 font-mono text-[10px] text-slate-600">{d.id}</p>
                </button>
              ))}
            </div>
          </GlassCard>

          <div className="space-y-4">
            <GlassCard className="p-5">
              <h3 className="text-sm font-semibold text-white">Search all Hugging Face datasets</h3>
              <div className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={hfQ}
                    onChange={(e) => setHfQ(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchDatasets()}
                    placeholder="e.g. roleplay, medical, python"
                    className="h-9 w-full rounded-xl border border-white/10 bg-white/[0.05] pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none"
                  />
                </div>
                <Btn size="sm" onClick={searchDatasets} disabled={loading}>
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
                </Btn>
              </div>
              <div className="mt-3 space-y-1.5">
                {hfDs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDataset({ id: d.id, name: d.id.split('/').pop() ?? d.id, rows: '—' })}
                    className={cn('w-full truncate rounded-lg border px-3 py-2 text-left font-mono text-[11px] transition',
                      dataset?.id === d.id ? 'border-cyan-400/60 bg-cyan-500/12 text-white' : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]')}
                  >
                    {d.id}
                  </button>
                ))}
              </div>
            </GlassCard>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault(); setDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) { setDataset({ id: f.name, name: f.name, rows: 'your file' }); pushToast('Dataset loaded', `${f.name} will be used for training.`); }
              }}
              className={cn('flex min-h-[150px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition',
                dragging ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/15 bg-white/[0.03]')}
            >
              <UploadCloud className="h-6 w-6 text-slate-400" />
              <p className="mt-2 text-[13px] font-medium text-white">…or drop your own file</p>
              <p className="mt-1 text-[11px] text-slate-500">CSV, JSONL, TXT or a folder of documents</p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2 — goal */}
      {step === 2 && (
        <GlassCard className="p-6">
          <h3 className="flex items-center gap-2 text-base font-semibold text-white">
            <Target className="h-4 w-4 text-fuchsia-300" /> What do you want it to learn?
          </h3>
          <p className="mt-1 text-sm text-slate-400">Say it in plain English. We translate it into the right settings.</p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {TRAINING_GOALS.map((g) => (
              <button
                key={g.id}
                onClick={() => setGoal(g.id)}
                className={cn('rounded-xl border p-3 text-left transition',
                  goal === g.id ? 'border-fuchsia-400/60 bg-fuchsia-500/12' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]')}
              >
                <p className="text-[13px] font-medium text-white">{g.label}</p>
                <p className="mt-0.5 font-mono text-[10px] text-slate-500">auto: {g.epochs} passes · lr {g.lr}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-300">
                  How hard should it study? <HelpDot term="epochs" />
                </span>
                <span className="font-mono text-[11px] text-cyan-200">{strength} pass{strength > 1 ? 'es' : ''}</span>
              </div>
              <input
                type="range" min={1} max={6} value={strength}
                onChange={(e) => setStrength(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
                style={{ background: `linear-gradient(90deg,#d946ef ${(strength / 6) * 100}%, rgba(255,255,255,0.1) ${(strength / 6) * 100}%)` }}
              />
              <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                <span>Light touch</span><span>Deep retrain</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                {strength <= 2 ? 'Safe and quick. Great first attempt.' : strength <= 4 ? 'Stronger effect, takes longer.' : 'Very strong — the model may start repeating your data.'}
              </p>
            </div>
            <div>
              <label className="text-[12px] font-medium text-slate-300">Name your add-on file</label>
              <input
                value={loraName}
                onChange={(e) => setLoraName(e.target.value)}
                placeholder={model ? `${model.name}-${goal}` : 'my-first-training'}
                className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-400/50 focus:outline-none"
              />
              <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-[10.5px] leading-relaxed text-slate-400">
                <p>model  : {model?.name ?? '—'}</p>
                <p>data   : {dataset?.name ?? '—'}</p>
                <p>method : QLoRA r=16 α=32</p>
                <p>device : Hexagon NPU (45 TOPS)</p>
                <p>time   : ~{(strength * 11 + 6)} minutes</p>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* STEP 3 — training */}
      {step === 3 && (
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <GlassCard className="p-6" glow={activeRun?.status === 'running'}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                <Rocket className="h-4 w-4 text-violet-300" /> Training progress
              </h3>
              {activeRun && (
                <Badge tone={activeRun.status === 'running' ? 'cyan' : activeRun.status === 'done' ? 'emerald' : 'amber'}>
                  {activeRun.status === 'running' ? 'Learning…' : activeRun.status === 'done' ? 'Finished' : 'Stopped'}
                </Badge>
              )}
            </div>

            {!activeRun ? (
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-400">Nothing training yet.</p>
                <Btn className="mt-3" onClick={() => setStep(0)}>Set up a training run</Btn>
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <div className="mb-2 flex justify-between font-mono text-[11px] text-slate-400">
                    <span>step {activeRun.step} / {activeRun.totalSteps}</span>
                    <span>{Math.round((activeRun.step / activeRun.totalSteps) * 100)}%</span>
                  </div>
                  <ShimmerBar value={(activeRun.step / activeRun.totalSteps) * 100} />
                </div>

                <div className="mt-5 h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeRun.history}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="step" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <YAxis yAxisId="l" tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 2.6]} />
                      <YAxis yAxisId="r" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 1]} />
                      <Tooltip contentStyle={{ background: '#0b0b1a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line yAxisId="l" type="monotone" dataKey="loss" name="Mistakes (loss)" stroke="#f472b6" strokeWidth={2} dot={false} />
                      <Line yAxisId="r" type="monotone" dataKey="acc" name="Accuracy" stroke="#34d399" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ['Mistakes', activeRun.history.at(-1)?.loss?.toFixed(3) ?? '—'],
                    ['Accuracy', activeRun.history.at(-1) ? `${(activeRun.history.at(-1)!.acc * 100).toFixed(1)}%` : '—'],
                    ['Passes', `${activeRun.epochs}`],
                    ['Output', activeRun.loraName]
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-white/10 bg-black/30 p-3">
                      <p className="truncate font-mono text-[12px] font-semibold text-white">{v}</p>
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">{k}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {activeRun.status === 'running' ? (
                    <Btn variant="danger" onClick={() => stopRun(activeRun.id)}><Square className="h-4 w-4" /> Stop training</Btn>
                  ) : (
                    <>
                      <Btn onClick={() => setView('chat')}>Try the trained model</Btn>
                      <Btn variant="outline" onClick={() => setStep(0)}>Train something else</Btn>
                    </>
                  )}
                </div>

                {activeRun.status === 'done' && (
                  <div className="mt-4 forge-pop rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-4">
                    <p className="text-[13px] font-semibold text-emerald-100">Training complete</p>
                    <p className="mt-1 text-[12px] text-emerald-100/80">
                      <span className="font-mono">{activeRun.loraName}</span> is saved next to your model. It is switched on automatically for new chats.
                    </p>
                  </div>
                )}
              </>
            )}
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-white">Plain-English readout</h3>
            <ul className="mt-3 space-y-3 text-[11.5px] leading-relaxed text-slate-400">
              <li><strong className="text-slate-200">Mistakes (loss)</strong> should fall. Lower means the model is copying your data better.</li>
              <li><strong className="text-slate-200">Accuracy</strong> should rise towards 90%+. Above 99% usually means it memorised instead of learned.</li>
              <li>You can close this page — training keeps running on the NPU.</li>
              <li>Nothing is uploaded. Your dataset never leaves the laptop.</li>
            </ul>
            {runs.length > 1 && (
              <>
                <h4 className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Earlier runs</h4>
                <div className="mt-2 space-y-1.5">
                  {runs.slice(1).map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                      <span className="truncate font-mono text-[10.5px] text-slate-300">{r.loraName}</span>
                      <Badge tone={r.status === 'done' ? 'emerald' : 'amber'}>{r.status}</Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </GlassCard>
        </div>
      )}

      {/* nav buttons */}
      {step < 3 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Btn variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Btn>
          <div className="flex items-center gap-3">
            {step === 2 ? (
              <Btn size="lg" onClick={begin} disabled={!modelId || !dataset}>
                <Rocket className="h-4 w-4" /> Start training
              </Btn>
            ) : (
              <Btn size="lg" onClick={() => setStep(step + 1)} disabled={!canNext}>
                Next <ArrowRight className="h-4 w-4" />
              </Btn>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Trainer;
