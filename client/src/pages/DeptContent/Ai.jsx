import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'
import llmImage from "../../assets/llm.png" // or ../../assets/llm-cropped.png

const AI_MODELS = {
  chatgpt: {
    name: 'ChatGPT',
    company: 'OpenAI',
    color: '#10a37f',
    lightBg: '#f0fdf9',
    borderColor: 'border-[#10a37f]',
    textColor: 'text-[#10a37f]',
    bgColor: 'bg-[#10a37f]',
    tabActive: 'tab-gpt',
    architecture: 'GPT-4 (Transformer / Decoder-Only)',
    tokenizer: 'Byte-Pair Encoding (BPE) — cl100k_base',
    contextWindow: '128 000 tokens',
    trainingData: '570 GB text + RLHF fine-tuning',
    uniqueTrait: 'Plugin & tool-use ecosystem',
    steps: [
      {
        id: 1,
        title: 'Tokenization',
        icon: '⬡',
        desc: 'Raw user text is split via BPE (cl100k_base vocabulary of ~100k tokens). Subword units are assigned integer IDs, mapped to dense embedding vectors in ℝ^d_model.',
        detail: 'GPT-4 uses a 100,257-token vocabulary. Each token maps to a 12,288-dim embedding in the largest variant.',
        time: 'O(n)',
        space: 'O(n · d)',
        timeNote: 'Linear in input length n',
        spaceNote: 'Token embeddings matrix',
      },
      {
        id: 2,
        title: 'Positional Encoding',
        icon: '↔',
        desc: 'Learned absolute position embeddings are added to token embeddings so the model knows token order. Unlike original Transformers, GPT uses learned rather than sinusoidal PE.',
        detail: 'Positions 0…n-1 have dedicated learned vectors. These are summed with token embeddings before entering the transformer stack.',
        time: 'O(n)',
        space: 'O(n_max · d)',
        timeNote: 'One lookup per position',
        spaceNote: 'Stored PE table up to context limit',
      },
      {
        id: 3,
        title: 'Multi-Head Self-Attention',
        icon: '◎',
        desc: 'Causal (masked) multi-head attention lets each token attend only to itself and prior tokens. Scaled dot-product: softmax(QKᵀ/√d_k)·V, with h=96 heads in GPT-4.',
        detail: 'Query/Key/Value projections of size d_k = d_model/h. Causal mask prevents future token leakage. KV-cache stores K,V for previous tokens during autoregressive generation.',
        time: 'O(n² · d)',
        space: 'O(n² + n · d)',
        timeNote: 'Quadratic in sequence length',
        spaceNote: 'Attention matrix + KV cache',
      },
      {
        id: 4,
        title: 'Feed-Forward & Residuals',
        icon: '⊕',
        desc: 'Each transformer block applies: LayerNorm → MHA → residual add → LayerNorm → FFN (2-layer MLP with GELU) → residual add. FFN hidden dim = 4 × d_model.',
        detail: 'FFN: Linear(d, 4d) → GELU → Linear(4d, d). Residual connections stabilise gradients across 96 layers in GPT-4.',
        time: 'O(n · d²)',
        space: 'O(L · d²)',
        timeNote: 'Per layer, linear in sequence',
        spaceNote: 'Weight matrices across L layers',
      },
      {
        id: 5,
        title: 'RLHF Alignment',
        icon: '★',
        desc: 'A reward model trained on human preference rankings guides fine-tuning via Proximal Policy Optimisation (PPO). This makes responses helpful, harmless, and honest.',
        detail: 'Reward model scores completions; PPO updates language model policy. KL-divergence penalty keeps policy close to the original SFT checkpoint.',
        time: 'O(n)',
        space: 'O(n)',
        timeNote: 'Inference: one forward pass',
        spaceNote: 'Reward model weights in memory',
      },
      {
        id: 6,
        title: 'Autoregressive Decoding',
        icon: '▶',
        desc: 'The LM head projects hidden states to vocabulary logits. Temperature scaling + top-p sampling selects the next token. This repeats until EOS or max length.',
        detail: 'LM head: Linear(d_model, |V|). Each new token is appended and re-fed. KV-cache means only the new token is processed per step (no re-computation).',
        time: 'O(n · d²) total',
        space: 'O(n · d) KV cache',
        timeNote: 'Per step O(d²), amortised with cache',
        spaceNote: 'KV cache grows linearly with output',
      },
    ],
  },
  claude: {
    name: 'Claude',
    company: 'Anthropic',
    color: '#c4622d',
    lightBg: '#fff8f5',
    borderColor: 'border-[#c4622d]',
    textColor: 'text-[#c4622d]',
    bgColor: 'bg-[#c4622d]',
    tabActive: 'tab-claude',
    architecture: 'Constitutional AI (Transformer-based)',
    tokenizer: 'SentencePiece BPE — ~100k vocabulary',
    contextWindow: '200 000 tokens',
    trainingData: 'Web + books + CAI self-critique loop',
    uniqueTrait: 'Constitutional AI safety framework',
    steps: [
      {
        id: 1,
        title: 'Tokenization',
        icon: '⬡',
        desc: 'Text is tokenized via SentencePiece BPE with a ~100k vocabulary. Unicode normalisation is applied first, ensuring multilingual robustness across scripts.',
        detail: "Claude's tokenizer handles a wide range of Unicode characters gracefully, including CJK and RTL scripts, with dedicated tokens for code syntax.",
        time: 'O(n)',
        space: 'O(n · d)',
        timeNote: 'Linear scan over input chars',
        spaceNote: 'Embedding table + sequence buffer',
      },
      {
        id: 2,
        title: 'Positional Encoding',
        icon: '↔',
        desc: 'Claude uses Rotary Position Embedding (RoPE), which encodes relative position information directly into attention queries and keys, enabling better length generalisation.',
        detail: 'RoPE applies rotation matrices in 2D subspaces. Unlike absolute PE, it naturally generalises beyond training lengths and improves relative attention scores.',
        time: 'O(n · d)',
        space: 'O(d)',
        timeNote: 'Applied in-place per head',
        spaceNote: 'Only rotation coefficients stored',
      },
      {
        id: 3,
        title: 'Multi-Head Attention',
        icon: '◎',
        desc: 'Bidirectional attention during training; causal mask at inference. Claude employs Multi-Query Attention (MQA) variants to reduce KV-cache memory during long-context inference.',
        detail: 'MQA shares K and V projections across heads while Q remains head-specific. Reduces KV cache by factor of h at minimal quality cost.',
        time: 'O(n² · d)',
        space: 'O(n · d) with MQA',
        timeNote: 'Quadratic attention, linear cache with MQA',
        spaceNote: 'MQA reduces cache by head count h',
      },
      {
        id: 4,
        title: 'Feed-Forward & Norms',
        icon: '⊕',
        desc: 'Uses SwiGLU activation in FFN blocks: Linear(d,2·4d) → SiLU gate ⊗ Linear → Linear(4d,d). Pre-RMSNorm is applied before each sub-layer for training stability.',
        detail: 'SwiGLU: output = SiLU(xW₁) ⊗ (xW₂). RMSNorm simplifies LayerNorm by removing mean-centering, improving throughput.',
        time: 'O(n · d²)',
        space: 'O(L · d²)',
        timeNote: 'Dominated by FFN matrix multiply',
        spaceNote: 'SwiGLU has 2× weight matrices vs FFN',
      },
      {
        id: 5,
        title: 'Constitutional AI',
        icon: '★',
        desc: 'Instead of solely human feedback, Claude is trained with a written "constitution" — a set of principles. The model critiques its own outputs against these principles and revises them before a final RLHF stage.',
        detail: 'Step 1: SL-CAI — model revises harmful responses using constitution. Step 2: RL-CAI — AI-generated preference data trains the reward model, reducing human labelling.',
        time: 'O(n)',
        space: 'O(n)',
        timeNote: 'Inference: single forward pass',
        spaceNote: 'Constitution stored as fixed prompt context',
      },
      {
        id: 6,
        title: 'Autoregressive Decoding',
        icon: '▶',
        desc: 'Tokens are generated one at a time with temperature + top-k/top-p sampling. Claude supports streaming via server-sent events. Long-context efficiency is boosted by sparse attention patterns.',
        detail: 'At 200k context, Claude uses attention optimisations (flash-attention style) to avoid full O(n²) materialisation. KV cache persists across streamed tokens.',
        time: 'O(n · d²) total',
        space: 'O(n · d) KV cache',
        timeNote: 'Optimised with FlashAttention',
        spaceNote: 'Large KV cache at 200k context',
      },
    ],
  },
  deepseek: {
    name: 'DeepSeek',
    company: 'DeepSeek AI',
    color: '#1a6dd0',
    lightBg: '#f0f6ff',
    borderColor: 'border-[#1a6dd0]',
    textColor: 'text-[#1a6dd0]',
    bgColor: 'bg-[#1a6dd0]',
    tabActive: 'tab-deepseek',
    architecture: 'Mixture-of-Experts (MoE) Transformer',
    tokenizer: 'BPE — ~102k vocabulary (DeepSeek tokenizer)',
    contextWindow: '128 000 tokens',
    trainingData: '2T tokens multilingual + code corpus',
    uniqueTrait: 'Multi-head Latent Attention (MLA) + MoE',
    steps: [
      {
        id: 1,
        title: 'Tokenization',
        icon: '⬡',
        desc: 'DeepSeek uses a custom BPE tokenizer (~102k vocab) optimised for Chinese, English, and code. It includes explicit tokens for programming constructs and mathematical notation.',
        detail: 'Strong multilingual coverage. Code tokens cover Python, C++, Java. Math tokens support LaTeX. Vocab size balances compute efficiency and coverage.',
        time: 'O(n)',
        space: 'O(n · d)',
        timeNote: 'Linear in characters',
        spaceNote: 'Embedding table ~102k × d_model',
      },
      {
        id: 2,
        title: 'Positional Encoding',
        icon: '↔',
        desc: 'DeepSeek-V2/V3 uses RoPE with YaRN (Yet another RoPE extension) for context extension beyond training length without quality degradation.',
        detail: 'YaRN scales RoPE frequencies non-uniformly, enabling length extrapolation. Attention temperature is adjusted to compensate for longer sequences.',
        time: 'O(n · d)',
        space: 'O(d)',
        timeNote: 'YaRN adds minimal overhead',
        spaceNote: 'Only frequency coefficients cached',
      },
      {
        id: 3,
        title: 'Multi-head Latent Attention',
        icon: '◎',
        desc: "DeepSeek's novel MLA compresses K and V into a low-rank latent vector (d_c ≪ d_kv), dramatically shrinking KV-cache size while maintaining expressiveness.",
        detail: 'MLA: K,V are recovered from a shared latent c = W_DKV · x. At inference, only c (not full K,V) is cached. Cache size: O(n · d_c) vs O(n · d_kv · h).',
        time: 'O(n² · d_c)',
        space: 'O(n · d_c) MLA cache',
        timeNote: 'Reduced by compression ratio d_c/d',
        spaceNote: 'Up to 93% KV cache reduction vs MHA',
      },
      {
        id: 4,
        title: 'Mixture-of-Experts FFN',
        icon: '⊕',
        desc: 'Instead of a single dense FFN, DeepSeek uses MoE: N expert FFNs where each token activates only top-k experts (e.g., k=6 of N=160). A gating network routes tokens to experts.',
        detail: 'Total parameters: 671B (V3). Active per token: ~37B. Each token goes through: Gating(x) → top-k expert indices → sum of k expert outputs. Load balancing loss prevents expert collapse.',
        time: 'O(n · k · d²/N)',
        space: 'O(N · d²) params, O(k · d²) active',
        timeNote: 'Sublinear vs dense FFN due to sparsity',
        spaceNote: 'Total params large, active params small',
      },
      {
        id: 5,
        title: 'GRPO Alignment',
        icon: '★',
        desc: 'DeepSeek uses Group Relative Policy Optimisation (GRPO), a variant of PPO that eliminates the separate value/critic model. Groups of responses are compared relatively to estimate advantage.',
        detail: 'GRPO advantage: Â_i = (r_i - mean(r)) / std(r) within a group. No value model needed, halving RL memory. DeepSeek-R1 extends this with explicit chain-of-thought reasoning.',
        time: 'O(n)',
        space: 'O(n)',
        timeNote: 'Inference: single forward pass',
        spaceNote: 'No value model at inference',
      },
      {
        id: 6,
        title: 'Autoregressive Decoding',
        icon: '▶',
        desc: 'Tokens are generated autoregressively. The compact MLA KV-cache enables DeepSeek to handle very long contexts on less GPU memory. Multi-Token Prediction (MTP) is used to speed up throughput.',
        detail: 'MTP: simultaneously predicts next k tokens with auxiliary heads, accepting if consistent with main head. Boosts throughput without changing quality. Speculative decoding compatible.',
        time: 'O(n · k · d²/N) per step',
        space: 'O(n · d_c) compressed cache',
        timeNote: 'MTP can double effective throughput',
        spaceNote: 'MLA cache far smaller than MHA',
      }
    ]
  }
}

function StepCard({ step, index, color, lightBg }) {
  const { isLight } = useTheme();
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.15 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`step-card ${visible ? 'visible' : ''} relative cursor-pointer`}
      style={{ transitionDelay: `${index * 80}ms` }}
      onClick={() => setExpanded((e) => !e)}
    >
      {index < 5 && (
        <div
          className="absolute left-6 top-full w-px h-4 z-10"
          style={{ background: color, opacity: 0.3 }}
        />
      )}

      <div
        className={`rounded-2xl border transition-all duration-300 ${
          expanded ? 'shadow-lg' : 'shadow-sm hover:shadow-md'
        }`}
        style={{
          borderColor: expanded ? color : '#e5e7eb',
          background: expanded ? lightBg : '#ffffff',
        }}
      >
        <div className="flex items-start gap-4 p-5">
          <div className="flex-shrink-0 relative">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white"
              style={{ background: color }}
            >
              {step.icon}
            </div>
            <div
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
              style={{ background: '#111' }}
            >
              {step.id}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className={`font-semibold ${isLight ? 'text-gray-900' : 'text-ink-50'} font-body text-[15px]`}>
                {step.title}
              </h3>
              <span className="text-gray-400 text-sm">{expanded ? '−' : '+'}</span>
            </div>

            <p className={`${isLight ? 'text-gray-600' : 'text-ink-300'} text-sm leading-relaxed`}>{step.desc}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{ background: isLight ? '#f9fafb' : 'rgba(255, 255, 255, 0.02)', border: isLight ? '1px solid #e5e7eb' : '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Time
                </span>
                <span className="complexity-badge" style={{ color: color }}>
                  {step.time}
                </span>
              </div>

              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}
              >
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Space
                </span>
                <span className="complexity-badge" style={{ color: color }}>
                  {step.space}
                </span>
              </div>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="px-5 pb-5 pt-0 border-t" style={{ borderColor: `${color}22` }}>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1 rounded-xl p-3" style={{ background: `${color}10` }}>
                <p
                  className="text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color }}
                >
                  Deep Dive
                </p>
                <p className={`text-sm ${isLight ? 'text-gray-700' : 'text-ink-200'} leading-relaxed`}>{step.detail}</p>
              </div>

              <div className={`rounded-xl p-3 ${isLight ? 'bg-gray-50' : 'bg-ink-950'}`}>
                <p className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-ink-400'} mb-1.5`}>
                  Time Complexity
                </p>
                <p className="complexity-badge text-base block mb-1" style={{ color }}>
                  {step.time}
                </p>
                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-ink-400'}`}>{step.timeNote}</p>
              </div>

              <div className="rounded-xl p-3 bg-gray-50">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Space Complexity
                </p>
                <p className="complexity-badge text-base block mb-1" style={{ color }}>
                  {step.space}
                </p>
                <p className="text-xs text-gray-500">{step.spaceNote}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ComplexityTable({ model }) {
  const { isLight } = useTheme();
  const { steps, color } = AI_MODELS[model]

  return (
    <div className={`overflow-x-auto rounded-2xl border ${isLight ? 'border-gray-100' : 'border-ink-800'} shadow-sm`}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: `${AI_MODELS[model].color}10` }}>
            <th className={`text-left px-4 py-3 font-semibold ${isLight ? 'text-gray-700' : 'text-ink-200'} font-body w-8`}>#</th>
            <th className={`text-left px-4 py-3 font-semibold ${isLight ? 'text-gray-700' : 'text-ink-200'} font-body`}>Step</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700 font-body">Time</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700 font-body">Space</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((s, i) => (
            <tr key={s.id} className={i % 2 === 0 ? (isLight ? 'bg-white' : 'bg-ink-900') : (isLight ? 'bg-gray-50' : 'bg-ink-950')}>
              <td className="px-4 py-3 text-gray-400 font-mono text-xs">{s.id}</td>
              <td className={`px-4 py-3 ${isLight ? 'text-gray-800' : 'text-ink-100'} font-medium`}>{s.title}</td>
              <td className="px-4 py-3">
                <span className="complexity-badge" style={{ color }}>
                  {s.time}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="complexity-badge" style={{ color }}>
                  {s.space}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PipelineDiagram({ model }) {
  const { isLight } = useTheme();
  const m = AI_MODELS[model]
  const icons = ['⬡', '↔', '◎', '⊕', '★', '▶']

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${isLight ? 'border-gray-100' : 'border-ink-800'} p-6`}
      style={{ background: m.lightBg }}
    >
      <p className={`text-xs font-semibold uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-ink-500'} mb-4`}>
        Real-Time Pipeline
      </p>

      <div className="flex items-center gap-1 flex-wrap">
        {m.steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-sm"
                style={{ background: m.color }}
              >
                {icons[i]}
              </div>
              <span className={`text-[9px] ${isLight ? 'text-gray-500' : 'text-ink-400'} text-center w-14 leading-tight`}>
                {s.title}
              </span>
            </div>

            {i < 5 && (
              <svg width="24" height="12" className="flex-shrink-0 mb-4">
                <line
                  x1="0"
                  y1="6"
                  x2="20"
                  y2="6"
                  stroke={m.color}
                  strokeWidth="1.5"
                  strokeOpacity="0.5"
                />
                <polygon points="20,3 24,6 20,9" fill={m.color} fillOpacity="0.5" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ModelInfoCard({ model }) {
  const { isLight } = useTheme();
  const m = AI_MODELS[model]

  const rows = [
    { label: 'Architecture', value: m.architecture },
    { label: 'Tokenizer', value: m.tokenizer },
    { label: 'Context Window', value: m.contextWindow },
    { label: 'Unique Trait', value: m.uniqueTrait },
  ]

  return (
    <div className={`rounded-2xl border ${isLight ? 'border-gray-100' : 'border-ink-800'} overflow-hidden shadow-sm`}>
      <div className="px-5 py-4" style={{ background: m.lightBg }}>
        <p className={`text-xs font-semibold uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-ink-500'} mb-2`}>
          Model Specs
        </p>
        <p className="font-display font-bold text-2xl" style={{ color: m.color }}>
          {m.name}
        </p>
        <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-ink-400'}`}>{m.company}</p>
      </div>

      <div className={`divide-y ${isLight ? 'divide-gray-50' : 'divide-ink-800'}`}>
        {rows.map((r) => (
          <div key={r.label} className={`flex gap-3 px-5 py-3 ${isLight ? '' : 'bg-ink-900'}`}>
            <span className={`text-xs font-semibold ${isLight ? 'text-gray-400' : 'text-ink-500'} w-28 flex-shrink-0 mt-0.5`}>
              {r.label}
            </span>
            <span className={`text-sm ${isLight ? 'text-gray-700' : 'text-ink-200'}`}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Ai() {
  const { isLight } = useTheme();
  const [activeModel, setActiveModel] = useState('chatgpt')
  const m = AI_MODELS[activeModel]

  const tabs = [
    { key: 'chatgpt', label: 'ChatGPT', tabClass: 'tab-gpt' },
    { key: 'claude', label: 'Claude', tabClass: 'tab-claude' },
    { key: 'deepseek', label: 'DeepSeek', tabClass: 'tab-deepseek' },
  ]

  return (
    <div className={`min-h-screen ${isLight ? 'bg-white text-gray-900' : 'bg-ink-950 text-ink-100'} font-body transition-colors duration-300`}>
      {/* Hero */}
      <header className={`relative border-b ${isLight ? 'border-gray-100' : 'border-ink-800'} overflow-hidden`}>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${isLight ? 'border-gray-200 text-gray-500' : 'border-ink-800 text-ink-400'} text-xs mb-6`}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Real-Time Architecture Deep Dive
          </div>

          <h1 className={`font-body font-black text-3xl sm:text-5xl lg:text-6xl tracking-wide ${isLight ? 'text-gray-900' : 'text-ink-50'} leading-[1.1] mb-4`}>
            How AI Models
            <br />
            <span
              className="inline-block"
              style={{
                background: `linear-gradient(90deg, ${AI_MODELS.chatgpt.color}, ${AI_MODELS.claude.color}, ${AI_MODELS.deepseek.color})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Think in Real-Time
            </span>
          </h1>

          <p className={`${isLight ? 'text-gray-500' : 'text-ink-400'} text-base sm:text-lg max-w-xl mx-auto leading-relaxed`}>
            A step-by-step breakdown of the 6 pipeline stages powering ChatGPT, Claude,
            and DeepSeek — with time and space complexity at every stage.
          </p>

          <div className="flex justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 flex-wrap">
            {Object.values(AI_MODELS).map((model) => (
              <div
                key={model.name}
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium"
                style={{
                  background: model.lightBg,
                  color: model.color,
                  border: `1px solid ${model.color}33`,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: model.color }} />
                {model.name}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className={`sticky top-0 z-40 ${isLight ? 'bg-white/90' : 'bg-ink-950/90'} backdrop-blur-sm border-b ${isLight ? 'border-gray-100' : 'border-ink-800'}`}>
        <div className="max-w-5xl mx-auto px-2 sm:px-6">
          <div className="flex overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeModel === tab.key
              const model = AI_MODELS[tab.key]

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveModel(tab.key)}
                  className={`relative flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold transition-colors duration-200 ${isActive ? '' : (isLight ? 'text-gray-400 hover:text-gray-600' : 'text-ink-500 hover:text-ink-300')} 
                  } ${isActive ? `${tab.tabClass} tab-active` : ''}`}
                  style={{ color: isActive ? model.color : undefined }}
                >
                  {tab.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                      style={{ background: model.color }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-4">
            <div className="mb-6">
              <h2 className={`font-display font-bold text-2xl ${isLight ? 'text-gray-900' : 'text-ink-50'} mb-1`}>
                6-Step Processing Pipeline
              </h2>
              <p className="text-sm text-gray-500">
                Click any step to expand technical details & complexity analysis.
              </p>
            </div>

            {m.steps.map((step, i) => (
              <StepCard
                key={`${activeModel}-${step.id}`}
                step={step}
                index={i}
                color={m.color}
                lightBg={m.lightBg}
              />
            ))}
          </div>

          {/* Right */}
          <div className="space-y-6">
            <ModelInfoCard model={activeModel} />
            <PipelineDiagram model={activeModel} />

            <div>
              <h3 className={`font-semibold ${isLight ? 'text-gray-800' : 'text-ink-200'} mb-3 text-sm uppercase tracking-wider`}>
                Complexity Summary
              </h3>
              <ComplexityTable model={activeModel} />
            </div>

            <div className={`rounded-2xl border ${isLight ? 'border-gray-100' : 'border-ink-800'} p-4 ${isLight ? 'bg-gray-50' : 'bg-ink-900'}`}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Notation Guide
              </p>

              <div className="space-y-1.5">
                {[
                  ['n', 'Sequence / token length'],
                  ['d', 'Model hidden dimension'],
                  ['h', 'Number of attention heads'],
                  ['L', 'Number of transformer layers'],
                  ['N', 'Number of MoE experts'],
                  ['k', 'Active experts per token'],
                  ['d_c', 'MLA latent dimension'],
                ].map(([sym, desc]) => (
                  <div key={sym} className="flex items-baseline gap-2">
                    <code className="complexity-badge text-[11px]" style={{ color: m.color }}>
                      {sym}
                    </code>
                    <span className="text-xs text-gray-500">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* LLM Workflow Image Section */}
        <section className="mt-10 sm:mt-14">
          <div className={`rounded-2xl border ${isLight ? 'border-gray-100' : 'border-ink-800'} ${isLight ? 'bg-gray-50' : 'bg-ink-900'} p-4 sm:p-6 shadow-sm overflow-hidden`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">LLM Processing Workflow</p>
            <div className="flex justify-center">
              <img
                src={llmImage}
                alt="LLM workflow"
                className="w-full max-h-[400px] sm:max-h-[500px] object-contain mx-auto rounded-xl"
              />
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mt-16">
          <div className="text-center mb-8">
            <h2 className={`font-display font-bold text-3xl ${isLight ? 'text-gray-900' : 'text-ink-50'} mb-2`}>
              Side-by-Side Comparison
            </h2>
            <p className={`${isLight ? 'text-gray-500' : 'text-ink-400'} text-sm`}>
              Key architectural differences across all three models
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead className={`${isLight ? 'bg-gray-50' : 'bg-ink-900'} border-b ${isLight ? 'border-gray-100' : 'border-ink-800'}`}>
                <tr>
                  <th className={`text-left px-5 py-4 font-semibold ${isLight ? 'text-gray-600' : 'text-ink-400'}`}>Property</th>
                  {Object.values(AI_MODELS).map((item) => (
                    <th
                      key={item.name}
                      className="text-left px-5 py-4 font-semibold"
                      style={{ color: item.color }}
                    >
                      {item.name}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {[
                  { label: 'Architecture', keys: ['architecture'] },
                  { label: 'Tokenizer', keys: ['tokenizer'] },
                  { label: 'Context', keys: ['contextWindow'] },
                  { label: 'Attention Complexity', values: ['O(n² · d)', 'O(n² · d)', 'O(n² · d_c) MLA'] },
                  { label: 'KV Cache', values: ['O(n · d)', 'O(n · d/h) MQA', 'O(n · d_c) MLA'] },
                  { label: 'FFN Type', values: ['Dense + GELU', 'Dense SwiGLU', 'Sparse MoE SwiGLU'] },
                  { label: 'Position Encoding', values: ['Learned Absolute', 'RoPE', 'RoPE + YaRN'] },
                  { label: 'Alignment', values: ['RLHF + PPO', 'Constitutional AI', 'GRPO (no critic)'] },
                  { label: 'Unique Trait', keys: ['uniqueTrait'] },
                ].map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? (isLight ? 'bg-white' : 'bg-ink-900') : (isLight ? 'bg-gray-50/50' : 'bg-ink-950/50')}>
                    <td className={`px-5 py-3 font-medium ${isLight ? 'text-gray-700' : 'text-ink-200'} border-r ${isLight ? 'border-gray-50' : 'border-ink-800'}`}>
                      {row.label}
                    </td>

                    {Object.entries(AI_MODELS).map(([key, model], j) => (
                      <td key={key} className={`px-5 py-3 ${isLight ? 'text-gray-600' : 'text-ink-300'} text-xs leading-snug`}>
                        {row.values ? row.values[j] : row.keys ? model[row.keys[0]] : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}