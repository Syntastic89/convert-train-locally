import React from 'react';
import {
  Cpu, Zap, Download, MessageSquare, GraduationCap, HardDrive, Thermometer,
  BatteryCharging, CheckCircle2, ArrowRight, Gauge, Layers
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { useForge } from '@/contexts/ForgeContext';
import { DEVICE_PROFILE, HERO_IMAGE, CURATED_MODELS } from '@/data/forgeData';
import { GlassCard, Btn, Meter, Badge, HelpDot, SectionTitle, ProgressRing } from '@/components/forge/ui';
import UpdatesSignup from '@/components/forge/UpdatesSignup';

const STEPS = [
  { n: 1, title: 'Pick a model', body: 'Open the Model Store and hit Download on anything with a green NPU badge.', view: 'library' as const, icon: Download },
  { n: 2, title: 'Make it NPU fast', body: 'Drag the file into the Converter. It turns into ONNX and runs ~4x quicker.', view: 'convert' as const, icon: Cpu },
  { n: 3, title: 'Start talking', body: 'Chat Studio. Slide the personality dials. No prompt writing needed.', view: 'chat' as const, icon: MessageSquare }
];

const Dashboard: React.FC = () => {
  const { telemetry, installed, setView, storageUsed, activeModelId, getInstalled, installModel, isInstalled } = useForge();
  const active = activeModelId ? getInstalled(activeModelId) : undefined;
  const ready = installed.filter((m) => m.status === 'ready' || m.status === 'onnx');
  const busy = installed.filter((m) => m.status === 'downloading' || m.status === 'converting');
  const recommended = CURATED_MODELS.filter((m) => m.npuReady && !isInstalled(m.id)).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* HERO */}
      <GlassCard glow className="overflow-hidden">
        <div className="relative">
          <img src={HERO_IMAGE} alt="Snapdragon NPU" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070713] via-[#070713]/85 to-transparent" />
          <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge tone="emerald"><CheckCircle2 className="h-3 w-3" /> Everything checks out</Badge>
                <Badge tone="violet">Snapdragon X Elite Extreme</Badge>
                <Badge tone="cyan">Windows 11 ARM64</Badge>
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {ready.length > 0 ? 'Your AI is ready.' : 'Your AI is one click away.'}
                <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-200 bg-clip-text text-transparent">
                  Fully offline. Fully unfiltered.
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                {ready.length > 0
                  ? `${ready.length} model${ready.length > 1 ? 's are' : ' is'} installed on this PC and running on your 45 TOPS Hexagon NPU. Nothing you type ever leaves the laptop.`
                  : 'Download an uncensored model, convert it for the neural engine and chat — no terminal, no Python, no accounts. Just click the buttons.'}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Btn size="lg" onClick={() => setView(ready.length > 0 ? 'chat' : 'library')}>
                  {ready.length > 0 ? <><MessageSquare className="h-4 w-4" /> Open Chat Studio</> : <><Download className="h-4 w-4" /> Browse the Model Store</>}
                </Btn>
                <Btn size="lg" variant="outline" onClick={() => setView('convert')}>
                  <Cpu className="h-4 w-4" /> Convert a model for NPU
                </Btn>
              </div>
              {active && (
                <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 backdrop-blur">
                  <img src={active.thumb} alt="" className="h-9 w-9 rounded-lg object-cover" />
                  <div className="text-left">
                    <p className="text-xs text-slate-400">Loaded right now</p>
                    <p className="font-mono text-[13px] font-semibold text-white">
                      {active.name} · {active.params} · {active.format}
                    </p>
                  </div>
                  <Badge tone={active.useNpu ? 'emerald' : 'amber'}>{active.useNpu ? 'NPU' : 'CPU'}</Badge>
                </div>
              )}
            </div>

            {/* live meters */}
            <div className="rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Gauge className="h-4 w-4 text-cyan-300" /> Live hardware
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> streaming
                </span>
              </div>
              <div className="space-y-3.5">
                <Meter label="Hexagon NPU" value={telemetry.npu} term="npu" accent="from-violet-400 to-fuchsia-400" />
                <Meter label="Oryon CPU (12 cores)" value={telemetry.cpu} accent="from-cyan-400 to-sky-400" />
                <Meter label="Adreno GPU" value={telemetry.gpu} accent="from-emerald-400 to-teal-400" />
                <Meter label="Memory" value={telemetry.ramUsed} unit=" GB" max={DEVICE_PROFILE.ram} accent="from-amber-400 to-orange-400" />
              </div>
              <div className="mt-4 h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetry.history}>
                    <defs>
                      <linearGradient id="npuA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.7} />
                        <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="cpuA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ background: '#0b0b1a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 11 }}
                      labelFormatter={() => ''}
                    />
                    <Area type="monotone" dataKey="npu" stroke="#a78bfa" fill="url(#npuA)" strokeWidth={2} name="NPU %" />
                    <Area type="monotone" dataKey="cpu" stroke="#22d3ee" fill="url(#cpuA)" strokeWidth={1.5} name="CPU %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center">
                <div>
                  <Thermometer className="mx-auto h-3.5 w-3.5 text-orange-300" />
                  <p className="mt-1 font-mono text-xs text-white">{telemetry.temp.toFixed(0)}°C</p>
                </div>
                <div>
                  <BatteryCharging className="mx-auto h-3.5 w-3.5 text-emerald-300" />
                  <p className="mt-1 font-mono text-xs text-white">{telemetry.battery}%</p>
                </div>
                <div>
                  <HardDrive className="mx-auto h-3.5 w-3.5 text-cyan-300" />
                  <p className="mt-1 font-mono text-xs text-white">{storageUsed.toFixed(1)} GB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 3 step quick start */}
      <div>
        <SectionTitle title="Three clicks to unfiltered AI" sub="This is the whole process. Really." />
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <GlassCard key={s.n} className="group cursor-pointer p-5 transition-all hover:-translate-y-1 hover:border-violet-400/40" >
              <button onClick={() => setView(s.view)} className="w-full text-left">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-cyan-400/20 font-mono text-sm font-bold text-white">
                    {s.n}
                  </span>
                  <s.icon className="h-5 w-5 text-slate-500 transition group-hover:text-cyan-300" />
                </div>
                <h3 className="text-base font-semibold text-white">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{s.body}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-cyan-300">
                  Take me there <ArrowRight className="h-3 w-3" />
                </span>
              </button>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* activity + device */}
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <GlassCard className="p-5">
          <SectionTitle title="Your models" sub={installed.length ? 'Everything stored on this PC right now.' : 'Nothing installed yet — grab one below.'} />
          {installed.length === 0 ? (
            <div className="space-y-3">
              {recommended.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <img src={m.thumb} alt="" className="h-11 w-11 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{m.name} <span className="font-mono text-[11px] text-slate-500">{m.params}</span></p>
                    <p className="truncate text-xs text-slate-400">{m.blurb}</p>
                  </div>
                  <Btn size="sm" onClick={() => installModel(m)}><Download className="h-3.5 w-3.5" /> Get it</Btn>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {installed.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  {m.status === 'downloading'
                    ? <ProgressRing value={m.progress} size={44} />
                    : <img src={m.thumb} alt="" className="h-11 w-11 rounded-lg object-cover" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{m.name}</p>
                    <p className="font-mono text-[11px] text-slate-500">
                      {m.params} · {m.quant} · {m.format} · {m.sizeGB.toFixed(1)} GB
                    </p>
                  </div>
                  {m.status === 'downloading' && <Badge tone="cyan">Downloading</Badge>}
                  {m.status === 'ready' && <Badge tone="amber">CPU only</Badge>}
                  {m.status === 'onnx' && <Badge tone="emerald">NPU ready</Badge>}
                  <Btn size="sm" variant="outline" onClick={() => setView(m.status === 'ready' ? 'convert' : 'chat')}>
                    {m.status === 'ready' ? 'Speed it up' : 'Chat'}
                  </Btn>
                </div>
              ))}
              {busy.length > 0 && (
                <p className="font-mono text-[11px] text-slate-500">{busy.length} job(s) running on the NPU…</p>
              )}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <SectionTitle title="This PC" sub="Auto-detected. Nothing for you to configure." />
          <dl className="space-y-2.5 font-mono text-[12px]">
            {[
              ['Device', DEVICE_PROFILE.name],
              ['Silicon', DEVICE_PROFILE.chip],
              ['CPU', DEVICE_PROFILE.cores],
              ['NPU', DEVICE_PROFILE.npu],
              ['GPU', DEVICE_PROFILE.gpu],
              ['Memory', `${DEVICE_PROFILE.ram} GB LPDDR5X`],
              ['OS', DEVICE_PROFILE.os],
              ['Runtime', DEVICE_PROFILE.driver]
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 border-b border-white/5 pb-2">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-right text-slate-200">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3">
            <Zap className="h-4 w-4 shrink-0 text-emerald-300" />
            <p className="text-[11px] leading-relaxed text-emerald-100">
              Your NPU runs models about <strong>4x faster</strong> than the CPU at a quarter of the battery.
              <HelpDot term="npu" className="ml-1 inline-block align-middle" />
            </p>
          </div>
          <Btn variant="subtle" size="sm" className="mt-3 w-full" onClick={() => setView('manage')}>
            <Layers className="h-3.5 w-3.5" /> Open benchmarks
          </Btn>
        </GlassCard>
      </div>

      <UpdatesSignup />
    </div>
  );
};

export default Dashboard;
