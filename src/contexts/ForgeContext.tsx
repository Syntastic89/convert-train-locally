import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { CURATED_MODELS, ForgeModel, ViewKey, DEVICE_PROFILE } from '@/data/forgeData';

export interface InstalledModel {
  id: string;
  name: string;
  params: string;
  sizeGB: number;
  quant: string;
  category: string;
  thumb: string;
  npuReady: boolean;
  npuTps: number;
  cpuTps: number;
  status: 'downloading' | 'ready' | 'converting' | 'onnx' | 'paused';
  progress: number;          // 0-100 download progress
  format: 'GGUF' | 'ONNX';
  useNpu: boolean;
  addedAt: number;
  loras: string[];
}

export interface TrainingRun {
  id: string;
  modelId: string;
  datasetId: string;
  goal: string;
  epochs: number;
  status: 'running' | 'done' | 'stopped';
  step: number;
  totalSteps: number;
  history: { step: number; loss: number; acc: number }[];
  loraName: string;
  startedAt: number;
}

interface Telemetry {
  npu: number;
  cpu: number;
  gpu: number;
  ramUsed: number;
  temp: number;
  battery: number;
  history: { t: number; npu: number; cpu: number }[];
}

interface ForgeCtx {
  view: ViewKey;
  setView: (v: ViewKey) => void;
  installed: InstalledModel[];
  installModel: (m: ForgeModel, quant?: string) => void;
  removeModel: (id: string) => void;
  toggleNpu: (id: string) => void;
  convertModel: (id: string) => void;
  finishConversion: (id: string) => void;
  activeModelId: string | null;
  setActiveModelId: (id: string) => void;
  isInstalled: (id: string) => boolean;
  getInstalled: (id: string) => InstalledModel | undefined;
  telemetry: Telemetry;
  storageUsed: number;
  wizardDone: boolean;
  completeWizard: (name: string) => void;
  openWizard: () => void;
  userName: string;
  glossaryKey: string | null;
  showGlossary: (k: string) => void;
  hideGlossary: () => void;
  runs: TrainingRun[];
  startRun: (r: Omit<TrainingRun, 'id' | 'step' | 'history' | 'status' | 'startedAt'>) => string;
  stopRun: (id: string) => void;
  toast: { id: number; title: string; body?: string }[];
  pushToast: (title: string, body?: string) => void;
}

const Ctx = createContext<ForgeCtx | undefined>(undefined);

const LS = 'localforge-npu-v1';

const load = () => {
  try {
    const raw = localStorage.getItem(LS);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const ForgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const saved = load();
  const [view, setView] = useState<ViewKey>('dashboard');
  const [installed, setInstalled] = useState<InstalledModel[]>(saved?.installed ?? []);
  const [activeModelId, setActiveModelId] = useState<string | null>(saved?.activeModelId ?? null);
  const [wizardDone, setWizardDone] = useState<boolean>(saved?.wizardDone ?? false);
  const [userName, setUserName] = useState<string>(saved?.userName ?? '');
  const [glossaryKey, setGlossaryKey] = useState<string | null>(null);
  const [runs, setRuns] = useState<TrainingRun[]>([]);
  const [toast, setToast] = useState<{ id: number; title: string; body?: string }[]>([]);
  const [telemetry, setTelemetry] = useState<Telemetry>({
    npu: 6, cpu: 12, gpu: 4, ramUsed: 9.2, temp: 41, battery: 92,
    history: Array.from({ length: 30 }, (_, i) => ({ t: i, npu: 5 + Math.random() * 6, cpu: 10 + Math.random() * 8 }))
  });

  const timers = useRef<Record<string, number>>({});

  useEffect(() => {
    localStorage.setItem(LS, JSON.stringify({ installed, activeModelId, wizardDone, userName }));
  }, [installed, activeModelId, wizardDone, userName]);

  const pushToast = useCallback((title: string, body?: string) => {
    const id = Date.now() + Math.random();
    setToast((t) => [...t, { id, title, body }]);
    window.setTimeout(() => setToast((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  // live hardware meters
  useEffect(() => {
    const busy = () =>
      installed.some((m) => m.status === 'downloading' || m.status === 'converting') ||
      runs.some((r) => r.status === 'running');
    const iv = window.setInterval(() => {
      setTelemetry((prev) => {
        const load = busy() ? 1 : 0;
        const npu = Math.max(2, Math.min(99, prev.npu + (load ? (Math.random() * 22 - 6) : (Math.random() * 8 - 4)) + (load ? 14 : -3)));
        const cpu = Math.max(4, Math.min(96, prev.cpu + (load ? (Math.random() * 16 - 5) : (Math.random() * 7 - 3.5)) + (load ? 5 : -2)));
        const gpu = Math.max(1, Math.min(70, prev.gpu + (Math.random() * 6 - 3)));
        const ramUsed = Math.max(6, Math.min(DEVICE_PROFILE.ram - 2, prev.ramUsed + (Math.random() * 0.8 - 0.4) + (load ? 0.3 : -0.15)));
        const temp = Math.max(37, Math.min(78, prev.temp + (load ? Math.random() * 1.6 - 0.4 : Math.random() - 0.7)));
        const history = [...prev.history.slice(-29), { t: (prev.history.at(-1)?.t ?? 0) + 1, npu, cpu }];
        return { ...prev, npu, cpu, gpu, ramUsed, temp, history, battery: prev.battery };
      });
    }, 1200);
    return () => window.clearInterval(iv);
  }, [installed, runs]);

  const isInstalled = useCallback((id: string) => installed.some((m) => m.id === id), [installed]);
  const getInstalled = useCallback((id: string) => installed.find((m) => m.id === id), [installed]);

  const installModel = useCallback((m: ForgeModel, quant?: string) => {
    if (installed.some((x) => x.id === m.id)) return;
    const entry: InstalledModel = {
      id: m.id,
      name: m.name,
      params: m.params,
      sizeGB: m.sizeGB,
      quant: quant ?? m.quant,
      category: m.category,
      thumb: m.thumb,
      npuReady: m.npuReady,
      npuTps: m.npuTps,
      cpuTps: m.cpuTps,
      status: 'downloading',
      progress: 0,
      format: 'GGUF',
      useNpu: false,
      addedAt: Date.now(),
      loras: []
    };
    setInstalled((prev) => [...prev, entry]);
    pushToast(`Downloading ${m.name}`, `${m.sizeGB.toFixed(1)} GB · ${m.quant} · saving to C:\\LocalForge\\Models`);

    const speed = 4 + Math.random() * 3; // % per tick
    const t = window.setInterval(() => {
      setInstalled((prev) =>
        prev.map((x) => {
          if (x.id !== m.id) return x;
          const next = Math.min(100, x.progress + speed);
          if (next >= 100) {
            window.clearInterval(timers.current[m.id]);
            delete timers.current[m.id];
            pushToast(`${m.name} is ready`, 'Open Chat Studio to start talking to it.');
            return { ...x, progress: 100, status: 'ready' };
          }
          return { ...x, progress: next };
        })
      );
    }, 320);
    timers.current[m.id] = t;
  }, [installed, pushToast]);

  const removeModel = useCallback((id: string) => {
    if (timers.current[id]) {
      window.clearInterval(timers.current[id]);
      delete timers.current[id];
    }
    setInstalled((prev) => prev.filter((m) => m.id !== id));
    setActiveModelId((cur) => (cur === id ? null : cur));
    pushToast('Model deleted', 'Disk space has been freed.');
  }, [pushToast]);

  const toggleNpu = useCallback((id: string) => {
    setInstalled((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        if (!m.npuReady && !m.useNpu) {
          pushToast('Convert it first', `${m.name} needs an ONNX conversion before the NPU can run it.`);
          return m;
        }
        pushToast(m.useNpu ? `${m.name} switched to CPU` : `${m.name} switched to NPU`,
          m.useNpu ? 'Slower, but works with every format.' : `Expect about ${m.npuTps} tokens per second.`);
        return { ...m, useNpu: !m.useNpu };
      })
    );
  }, [pushToast]);

  const convertModel = useCallback((id: string) => {
    setInstalled((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'converting' } : m)));
  }, []);

  const finishConversion = useCallback((id: string) => {
    setInstalled((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: 'onnx', format: 'ONNX', npuReady: true, useNpu: true, sizeGB: Math.max(0.9, m.sizeGB * 0.62) }
          : m
      )
    );
  }, []);

  const startRun: ForgeCtx['startRun'] = useCallback((r) => {
    const id = `run-${Date.now()}`;
    const totalSteps = r.totalSteps;
    const run: TrainingRun = { ...r, id, step: 0, history: [], status: 'running', startedAt: Date.now(), totalSteps };
    setRuns((prev) => [run, ...prev]);
    pushToast('Training started', 'You can keep using the app — this runs on the NPU in the background.');
    const t = window.setInterval(() => {
      setRuns((prev) =>
        prev.map((x) => {
          if (x.id !== id || x.status !== 'running') return x;
          const step = x.step + 1;
          const loss = Math.max(0.18, 2.35 * Math.exp(-step / (totalSteps * 0.32)) + Math.random() * 0.09);
          const acc = Math.min(0.985, 0.42 + (1 - Math.exp(-step / (totalSteps * 0.3))) * 0.55 + Math.random() * 0.01);
          const history = [...x.history, { step, loss: +loss.toFixed(3), acc: +acc.toFixed(3) }];
          if (step >= totalSteps) {
            window.clearInterval(timers.current[id]);
            delete timers.current[id];
            pushToast('Training finished', `${x.loraName} saved. Turn it on from My Models.`);
            return { ...x, step, history, status: 'done' };
          }
          return { ...x, step, history };
        })
      );
    }, 420);
    timers.current[id] = t;
    return id;
  }, [pushToast]);

  const stopRun = useCallback((id: string) => {
    if (timers.current[id]) {
      window.clearInterval(timers.current[id]);
      delete timers.current[id];
    }
    setRuns((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'stopped' } : r)));
    pushToast('Training stopped', 'Your progress so far has been saved.');
  }, [pushToast]);

  useEffect(() => () => Object.values(timers.current).forEach((t) => window.clearInterval(t)), []);

  // auto-select first ready model
  useEffect(() => {
    if (!activeModelId) {
      const ready = installed.find((m) => m.status === 'ready' || m.status === 'onnx');
      if (ready) setActiveModelId(ready.id);
    }
  }, [installed, activeModelId]);

  const storageUsed = installed.reduce((s, m) => s + m.sizeGB * (m.progress / 100), 0);

  const value: ForgeCtx = {
    view, setView,
    installed, installModel, removeModel, toggleNpu, convertModel, finishConversion,
    activeModelId, setActiveModelId, isInstalled, getInstalled,
    telemetry, storageUsed,
    wizardDone,
    completeWizard: (name: string) => { setUserName(name); setWizardDone(true); },
    openWizard: () => setWizardDone(false),
    userName,
    glossaryKey,
    showGlossary: (k) => setGlossaryKey(k),
    hideGlossary: () => setGlossaryKey(null),
    runs, startRun, stopRun,
    toast, pushToast
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useForge = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useForge must be used inside ForgeProvider');
  return c;
};

export const CURATED = CURATED_MODELS;
