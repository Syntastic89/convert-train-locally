// ============================================================
// LocalForge NPU — single source of truth for app data
// Every list, label, preset and glossary entry lives here.
// ============================================================

export type ModelCategory = 'Chat' | 'Roleplay' | 'Coding' | 'Reasoning' | 'Writing' | 'Vision';

export interface ForgeModel {
  id: string;              // HuggingFace repo id
  name: string;            // Friendly name
  author: string;
  params: string;          // "8B"
  sizeGB: number;          // download size (Q4 gguf estimate)
  quant: string;           // default quant
  license: string;
  rating: number;          // 0-5
  downloads: string;       // human readable
  npuReady: boolean;       // has an ONNX/QNN path that fits the Hexagon NPU
  npuTps: number;          // tokens/sec on Snapdragon X Elite NPU
  cpuTps: number;          // tokens/sec on ARM CPU
  ramGB: number;           // RAM needed
  category: ModelCategory;
  uncensored: boolean;
  blurb: string;           // plain english, zero jargon
  strengths: string[];
  thumb: string;
}

export const HERO_IMAGE =
  'https://d64gsuwffb70l.cloudfront.net/6a685d97f47329210cafd2c9_1785225846998_a52b2cb8.jpg';

const T = [
  'https://d64gsuwffb70l.cloudfront.net/6a685d97f47329210cafd2c9_1785225862994_a98d8948.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6a685d97f47329210cafd2c9_1785225866153_d0154e4d.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6a685d97f47329210cafd2c9_1785225865698_ccc67b16.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6a685d97f47329210cafd2c9_1785225867526_41f81893.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6a685d97f47329210cafd2c9_1785225867150_cfdde7ce.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6a685d97f47329210cafd2c9_1785225869081_81b65ddd.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6a685d97f47329210cafd2c9_1785225870021_d296187a.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6a685d97f47329210cafd2c9_1785225879739_1f40e109.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6a685d97f47329210cafd2c9_1785225901414_15b3a470.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6a685d97f47329210cafd2c9_1785225901666_cd6b6643.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6a685d97f47329210cafd2c9_1785225901731_e19e66f7.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6a685d97f47329210cafd2c9_1785225904222_648b816a.jpg'
];

export const CURATED_MODELS: ForgeModel[] = [
  {
    id: 'cognitivecomputations/Dolphin3.0-Llama3.1-8B',
    name: 'Dolphin 3.0',
    author: 'cognitivecomputations',
    params: '8B',
    sizeGB: 4.9,
    quant: 'Q4_K_M',
    license: 'Llama 3.1 Community',
    rating: 4.9,
    downloads: '1.2M',
    npuReady: true,
    npuTps: 42,
    cpuTps: 11,
    ramGB: 8,
    category: 'Chat',
    uncensored: true,
    blurb: 'The all-rounder. Answers anything you ask without lecturing you, and still writes clean, useful text. Best first pick for most people.',
    strengths: ['No refusals', 'Great instructions', 'Balanced tone'],
    thumb: T[0]
  },
  {
    id: 'Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2',
    name: 'Lexi Uncensored V2',
    author: 'Orenguteng',
    params: '8B',
    sizeGB: 4.7,
    quant: 'Q4_K_M',
    license: 'Llama 3.1 Community',
    rating: 4.8,
    downloads: '870K',
    npuReady: true,
    npuTps: 40,
    cpuTps: 10,
    ramGB: 8,
    category: 'Chat',
    uncensored: true,
    blurb: 'Blunt and direct. Says what it thinks with almost no filter, while keeping the smart parts of Llama 3.1 intact.',
    strengths: ['Very direct', 'Fast replies', 'Low memory'],
    thumb: T[1]
  },
  {
    id: 'NousResearch/Hermes-3-Llama-3.1-8B',
    name: 'Hermes 3',
    author: 'NousResearch',
    params: '8B',
    sizeGB: 4.9,
    quant: 'Q4_K_M',
    license: 'Llama 3.1 Community',
    rating: 4.8,
    downloads: '2.4M',
    npuReady: true,
    npuTps: 39,
    cpuTps: 10,
    ramGB: 8,
    category: 'Reasoning',
    uncensored: true,
    blurb: 'Thinks carefully before it answers. Perfect when you want long, structured explanations or step-by-step plans.',
    strengths: ['Deep answers', 'Follows a persona', 'Long context'],
    thumb: T[2]
  },
  {
    id: 'huihui-ai/Qwen2.5-7B-Instruct-abliterated-v3',
    name: 'Qwen 2.5 Abliterated',
    author: 'huihui-ai',
    params: '7B',
    sizeGB: 4.4,
    quant: 'Q4_K_M',
    license: 'Apache 2.0',
    rating: 4.7,
    downloads: '640K',
    npuReady: true,
    npuTps: 45,
    cpuTps: 12,
    ramGB: 7,
    category: 'Coding',
    uncensored: true,
    blurb: 'Excellent at code and maths, with the safety refusals surgically removed. Great multilingual skills too.',
    strengths: ['Code + maths', '29 languages', 'Apache licence'],
    thumb: T[3]
  },
  {
    id: 'huihui-ai/Mistral-Nemo-Instruct-2407-abliterated',
    name: 'Mistral Nemo Free',
    author: 'huihui-ai',
    params: '12B',
    sizeGB: 7.1,
    quant: 'Q4_K_M',
    license: 'Apache 2.0',
    rating: 4.6,
    downloads: '410K',
    npuReady: true,
    npuTps: 27,
    cpuTps: 6,
    ramGB: 12,
    category: 'Writing',
    uncensored: true,
    blurb: 'A bigger brain for long documents and stories. Handles 128,000 words of context so it never forgets your chat.',
    strengths: ['Huge memory', 'Beautiful prose', 'Multilingual'],
    thumb: T[4]
  },
  {
    id: 'huihui-ai/Llama-3.2-3B-Instruct-abliterated',
    name: 'Llama 3.2 Pocket',
    author: 'huihui-ai',
    params: '3B',
    sizeGB: 2.0,
    quant: 'Q4_K_M',
    license: 'Llama 3.2 Community',
    rating: 4.5,
    downloads: '520K',
    npuReady: true,
    npuTps: 88,
    cpuTps: 26,
    ramGB: 4,
    category: 'Chat',
    uncensored: true,
    blurb: 'Tiny, unfiltered and unbelievably quick on the Snapdragon NPU. Runs all day on battery without the fans spinning up.',
    strengths: ['Fastest on NPU', 'Battery friendly', 'Only 2 GB'],
    thumb: T[5]
  },
  {
    id: 'huihui-ai/Phi-3.5-mini-instruct-abliterated',
    name: 'Phi 3.5 Mini Free',
    author: 'huihui-ai',
    params: '3.8B',
    sizeGB: 2.4,
    quant: 'Q4_K_M',
    license: 'MIT',
    rating: 4.4,
    downloads: '300K',
    npuReady: true,
    npuTps: 76,
    cpuTps: 22,
    ramGB: 5,
    category: 'Reasoning',
    uncensored: true,
    blurb: 'Microsoft-trained and NPU-native. Punches far above its size for logic puzzles and summaries.',
    strengths: ['Native ONNX build', 'MIT licence', 'Sharp logic'],
    thumb: T[6]
  },
  {
    id: 'TheDrummer/Tiger-Gemma-9B-v3',
    name: 'Tiger Gemma',
    author: 'TheDrummer',
    params: '9B',
    sizeGB: 5.6,
    quant: 'Q4_K_M',
    license: 'Gemma',
    rating: 4.7,
    downloads: '180K',
    npuReady: false,
    npuTps: 0,
    cpuTps: 8,
    ramGB: 10,
    category: 'Roleplay',
    uncensored: true,
    blurb: 'Built for characters and roleplay. Stays in persona for hours and never breaks the scene to warn you.',
    strengths: ['Stays in character', 'Vivid detail', 'Warm tone'],
    thumb: T[7]
  },
  {
    id: 'Gryphe/MythoMax-L2-13b',
    name: 'MythoMax',
    author: 'Gryphe',
    params: '13B',
    sizeGB: 7.9,
    quant: 'Q4_K_M',
    license: 'Llama 2',
    rating: 4.5,
    downloads: '3.1M',
    npuReady: false,
    npuTps: 0,
    cpuTps: 5,
    ramGB: 14,
    category: 'Writing',
    uncensored: true,
    blurb: 'The classic storyteller. Legendary for fiction, screenplays and long-form creative writing with zero hand-holding.',
    strengths: ['Story king', 'Rich imagery', 'Community favourite'],
    thumb: T[8]
  },
  {
    id: 'huihui-ai/DeepSeek-R1-Distill-Qwen-7B-abliterated',
    name: 'DeepSeek R1 Free',
    author: 'huihui-ai',
    params: '7B',
    sizeGB: 4.4,
    quant: 'Q4_K_M',
    license: 'MIT',
    rating: 4.6,
    downloads: '760K',
    npuReady: true,
    npuTps: 33,
    cpuTps: 9,
    ramGB: 8,
    category: 'Reasoning',
    uncensored: true,
    blurb: 'Shows its work. It literally thinks out loud before answering, which makes it brilliant for tricky problems.',
    strengths: ['Visible thinking', 'Maths beast', 'MIT licence'],
    thumb: T[9]
  },
  {
    id: 'NousResearch/Nous-Hermes-2-Mistral-7B-DPO',
    name: 'Nous Hermes 2',
    author: 'NousResearch',
    params: '7B',
    sizeGB: 4.4,
    quant: 'Q4_K_M',
    license: 'Apache 2.0',
    rating: 4.4,
    downloads: '1.5M',
    npuReady: true,
    npuTps: 44,
    cpuTps: 12,
    ramGB: 8,
    category: 'Chat',
    uncensored: true,
    blurb: 'Rock solid daily driver. Polite when you want it, unfiltered when you ask, and very hard to confuse.',
    strengths: ['Reliable', 'JSON output', 'Apache licence'],
    thumb: T[10]
  },
  {
    id: 'llava-hf/llava-v1.6-mistral-7b-hf',
    name: 'LLaVA Vision',
    author: 'llava-hf',
    params: '7B',
    sizeGB: 5.1,
    quant: 'Q4_K_M',
    license: 'Apache 2.0',
    rating: 4.3,
    downloads: '900K',
    npuReady: true,
    npuTps: 24,
    cpuTps: 5,
    ramGB: 9,
    category: 'Vision',
    uncensored: false,
    blurb: 'Drop in a screenshot or photo and just ask about it. Reads charts, memes, receipts and handwriting.',
    strengths: ['Sees images', 'Reads charts', 'Drag & drop'],
    thumb: T[11]
  }
];

export const MODEL_CATEGORIES: ('All' | ModelCategory)[] = [
  'All', 'Chat', 'Roleplay', 'Coding', 'Reasoning', 'Writing', 'Vision'
];

// ---------------- Conversion pipeline ----------------
export const CONVERT_STEPS = [
  { key: 'inspect', label: 'Reading your model file', detail: 'Checking layers, tokenizer and weight format' },
  { key: 'graph', label: 'Building the ONNX graph', detail: 'Tracing every operation into an open standard graph' },
  { key: 'quantize', label: 'Shrinking to INT4 / INT8', detail: 'Smaller numbers = far faster on the Hexagon NPU' },
  { key: 'qnn', label: 'Adding Snapdragon QNN hooks', detail: 'Mapping the graph onto the X Elite neural engine' },
  { key: 'verify', label: 'Checking the answers match', detail: 'Running 20 test prompts against the original' },
  { key: 'pack', label: 'Packing your .onnx bundle', detail: 'Saving to your Models folder, ready to chat' }
];

export const PRECISION_OPTIONS = [
  { id: 'int4', label: 'INT4 — fastest', hint: 'Half the size, ~2.4x quicker on NPU. Best for chat.' },
  { id: 'int8', label: 'INT8 — balanced', hint: 'Recommended. Great speed, almost no quality loss.' },
  { id: 'fp16', label: 'FP16 — highest quality', hint: 'Biggest file, slowest. Use for training exports.' }
];

// ---------------- Chat personality ----------------
export const PERSONALITY_PRESETS = [
  { id: 'unfiltered', name: 'Unfiltered', tone: 85, creativity: 70, length: 60, desc: 'Says it straight, no disclaimers.' },
  { id: 'creative', name: 'Storyteller', tone: 55, creativity: 95, length: 85, desc: 'Long, vivid, imaginative writing.' },
  { id: 'coder', name: 'Engineer', tone: 30, creativity: 20, length: 55, desc: 'Terse, technical, code-first.' },
  { id: 'friend', name: 'Best Friend', tone: 70, creativity: 60, length: 45, desc: 'Casual, warm, chatty.' },
  { id: 'analyst', name: 'Analyst', tone: 20, creativity: 25, length: 75, desc: 'Structured bullet points and facts.' }
];

// ---------------- Trainer ----------------
export const CURATED_DATASETS = [
  { id: 'cognitivecomputations/dolphin', name: 'Dolphin Instructions', rows: '4.5M', desc: 'Huge pile of uncensored question/answer pairs. The classic starting point.' },
  { id: 'teknium/OpenHermes-2.5', name: 'OpenHermes 2.5', rows: '1.0M', desc: 'High quality assistant chats. Makes models more helpful and articulate.' },
  { id: 'Open-Orca/OpenOrca', name: 'Open Orca', rows: '4.2M', desc: 'Reasoning-heavy examples. Teaches step-by-step thinking.' },
  { id: 'PygmalionAI/PIPPA', name: 'PIPPA Roleplay', rows: '17K', desc: 'Human roleplay logs. Best for character and persona training.' },
  { id: 'unalignment/toxic-dpo-v0.2', name: 'Toxic DPO', rows: '541', desc: 'Removes refusals. Small but extremely effective at un-censoring.' },
  { id: 'sahil2801/CodeAlpaca-20k', name: 'CodeAlpaca 20k', rows: '20K', desc: 'Programming instructions. Sharpen coding ability fast.' },
  { id: 'gsm8k', name: 'GSM8K Maths', rows: '8.8K', desc: 'Grade-school word problems for better arithmetic.' },
  { id: 'HuggingFaceH4/no_robots', name: 'No Robots', rows: '10K', desc: 'Human-written prompts. Makes replies sound less like an AI.' }
];

export const TRAINING_GOALS = [
  { id: 'uncensor', label: 'Remove refusals and safety lectures', epochs: 2, lr: '2e-4' },
  { id: 'persona', label: 'Teach it a personality or character', epochs: 3, lr: '1e-4' },
  { id: 'knowledge', label: 'Teach it my documents and facts', epochs: 4, lr: '5e-5' },
  { id: 'style', label: 'Copy my writing style', epochs: 3, lr: '1e-4' },
  { id: 'code', label: 'Make it better at code', epochs: 2, lr: '2e-4' }
];

// ---------------- Device / hardware ----------------
export const DEVICE_PROFILE = {
  name: 'Snapdragon X Elite Extreme',
  chip: 'X1E-00-1DE',
  cores: '12 Oryon CPU @ 4.3 GHz',
  npu: 'Hexagon NPU — 45 TOPS (INT8)',
  gpu: 'Adreno X1-85 (4.6 TFLOPS)',
  ram: 32,
  storageTotal: 1024,
  os: 'Windows 11 Pro 24H2 (ARM64)',
  driver: 'QNN 2.28 / DirectML 1.15'
};

// ---------------- Glossary for "What does this mean?" ----------------
export const GLOSSARY: Record<string, string> = {
  npu: 'The NPU is a special chip inside your Snapdragon laptop built only for AI maths. It is roughly 4x faster than the CPU for chatting and uses a fraction of the battery.',
  onnx: 'ONNX is a universal file format for AI models. Converting to ONNX lets your Snapdragon NPU run the model directly instead of the slower CPU.',
  quantization: 'Quantizing means storing the model\'s numbers with fewer digits. The file gets much smaller and much faster, and you almost never notice a quality difference.',
  uncensored: 'An uncensored (or "abliterated") model has had its refusal behaviour removed, so it answers your question instead of telling you it cannot help.',
  parameters: 'Parameters are the little dials inside a model. More parameters usually means smarter answers, but a bigger download and slower replies.',
  quant: 'Q4 / INT4 means 4-bit numbers — smallest and fastest. INT8 is a bit bigger but slightly more accurate. FP16 is full quality and biggest.',
  tokens: 'A token is about three quarters of a word. Tokens per second is simply how fast the AI types its answer.',
  lora: 'A LoRA is a tiny add-on file created by training. It teaches your model something new without rewriting the whole 5 GB model.',
  epochs: 'An epoch is one full pass over your training data. Two or three passes is usually perfect — more can make the model repeat itself.',
  dataset: 'A dataset is just a big spreadsheet of example conversations. The model reads them and copies the pattern.',
  context: 'Context is how much of the conversation the model can remember at once. Bigger context = it forgets less.'
};

// ---------------- Navigation ----------------
export type ViewKey = 'dashboard' | 'library' | 'convert' | 'chat' | 'train' | 'manage' | 'help';

export const NAV_ITEMS: { key: ViewKey; label: string; hint: string }[] = [
  { key: 'dashboard', label: 'Home', hint: 'Your device at a glance' },
  { key: 'library', label: 'Model Store', hint: 'Download uncensored models' },
  { key: 'convert', label: 'NPU Converter', hint: 'Drag, drop, convert to ONNX' },
  { key: 'chat', label: 'Chat Studio', hint: 'Talk to your local model' },
  { key: 'train', label: 'Trainer', hint: 'Teach a model with datasets' },
  { key: 'manage', label: 'My Models', hint: 'Storage and benchmarks' },
  { key: 'help', label: 'Plain English Help', hint: 'Every word explained' }
];

export const formatGB = (n: number) => `${n.toFixed(1)} GB`;
