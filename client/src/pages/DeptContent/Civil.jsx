import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'
import civilImage from "../../assets/civil_workflow.png"

const CIVIL_SYSTEMS = {
  foundation: {
    name: 'Bored Piling Deep Foundation',
    company: 'Geotechnical & Structural Engineering',
    color: '#a05a2c',
    lightBg: '#fbf2ec',
    borderColor: 'border-[#a05a2c]',
    textColor: 'text-[#a05a2c]',
    bgColor: 'bg-[#a05a2c]',
    tabActive: 'tab-foundation',
    architecture: 'Deep bored friction & end-bearing piles',
    tokenizer: 'Standard Penetration Test (SPT) blow count',
    contextWindow: 'Pile depth up to 50m+',
    trainingData: 'High load capacity / Skin friction friction',
    uniqueTrait: 'Load transfer to bedrock through soil layers',
    steps: [
      {
        id: 1,
        title: 'Geotechnical Soil Test',
        icon: '🪨',
        desc: 'Boreholes are drilled down to load bearing layers. Soil samples are taken; Standard Penetration Tests (SPT) record blow counts (N-values).',
        detail: 'Determines the soil profile, moisture content, water table level, cohesion, and friction angle to calculate pile capacity.',
        time: 'O(b)',
        space: 'd_max',
        timeNote: 'Proportional to borehole count b',
        spaceNote: 'Borehole maximum depth d_max',
      },
      {
        id: 2,
        title: 'Excavation & Shoring',
        icon: '🚜',
        desc: 'Rotary drilling rig excavates the pile shaft. Bentonite or polymer slurry is pumped in to support the borehole walls from collapse.',
        detail: 'Slurry pressure creates a filter cake seal on the bore walls, balancing lateral soil and hydrostatic pressures.',
        time: 'O(d)',
        space: 'V_shaft',
        timeNote: 'Drilling rate per metre depth d',
        spaceNote: 'Borehole shaft volume space',
      },
      {
        id: 3,
        title: 'Borehole Cleaning',
        icon: '🧹',
        desc: 'Drilling tool cleans the bottom of the pile to remove loose sediment, ensuring direct end-bearing contact with bedrock.',
        detail: 'Sediment accumulation at the pile base can cause significant settlement under structural load.',
        time: 'O(1)',
        space: 'O(1)',
        timeNote: 'Clean-out cycle time',
        spaceNote: 'Sediment thickness tolerance',
      },
      {
        id: 4,
        title: 'Rebar Cage Insertion',
        icon: '🏗️',
        desc: 'Reinforcement steel cage (vertical bars & helical ties) is fabricated and lowered into the shaft using a crane.',
        detail: 'Helical ties resist shear forces. Spacers maintain concrete cover thickness around steel cage.',
        time: 'O(s)',
        space: 'W_steel',
        timeNote: 'Splicing & lowering rate of cages s',
        spaceNote: 'Weight capacity of steel reinforcement',
      },
      {
        id: 5,
        title: 'Concrete Pouring (Tremie)',
        icon: '🔌',
        desc: 'Tremie pipe is inserted to the bottom. High-slump concrete is poured, rising from the bottom to displace bentonite slurry upwards.',
        detail: 'Tremie pipe must remain submerged in fresh concrete at all times to prevent contamination and aggregate separation.',
        time: 'O(v)',
        space: 'V_concrete',
        timeNote: 'Pouring rate per volume v',
        spaceNote: 'Cylinder volume capacity',
      },
      {
        id: 6,
        title: 'Pile Cap Consolidation',
        icon: '▶',
        desc: 'Pile head is chipped to expose rebar. Concrete cap is cast over pile groups to distribute skyscraper column loads uniformly.',
        detail: 'Integrates all piles in a group to act as a single rigid foundation, resisting bending moments and axial forces.',
        time: 'O(1)',
        space: 'O(p)',
        timeNote: 'Concrete curing time',
        spaceNote: 'Pile count in group p',
      },
    ],
  },
  water: {
    name: 'Municipal Water Purification',
    company: 'Environmental Engineering',
    color: '#008080',
    lightBg: '#f0fcfc',
    borderColor: 'border-[#008080]',
    textColor: 'text-[#008080]',
    bgColor: 'bg-[#008080]',
    tabActive: 'tab-water',
    architecture: 'Multi-barrier physical & chemical purification',
    tokenizer: 'Alum dosage / Turbidity NTU measurement',
    contextWindow: 'Flow rate in Million Litres per Day (MLD)',
    trainingData: 'IS 10500 drinking water quality standards',
    uniqueTrait: 'Continuous chemical flocculation & filtration',
    steps: [
      {
        id: 1,
        title: 'Screening & Aeration',
        icon: '🌊',
        desc: 'Raw water passes screen bars to remove floating debris. Aeration sprays water into air to release gases and oxidize iron/manganese.',
        detail: 'CO2 and H2S are stripped, improving taste and smell. Iron oxidises from soluble ferrous to insoluble ferric state.',
        time: 'Continuous',
        space: 'Q_flow',
        timeNote: 'Continuous flow cycle',
        spaceNote: 'Volumetric flow rate Q',
      },
      {
        id: 2,
        title: 'Coagulation & Flocculation',
        icon: '🧪',
        desc: 'Coagulant (Alum) is rapidly mixed. Negatively charged clay/silt particles are neutralised, clumping into small micro-flocs.',
        detail: 'Slow paddle mixing in flocculator promotes collision of micro-flocs to form large, heavy macro-flocs.',
        time: 'O(t)',
        space: 'V_basin',
        timeNote: 'Retention mixing time t',
        spaceNote: 'Flocculation basin volume',
      },
      {
        id: 3,
        title: 'Sedimentation Basin',
        icon: '⏳',
        desc: 'Water enters a clarifier. Velocity is reduced, allowing heavy flocs to settle to the bottom as sludge due to gravity.',
        detail: 'Sludge scrapers collect settled sludge at the bottom hopper for disposal, while clear water overflows launders.',
        time: '2-4 hours',
        space: 'A_surface',
        timeNote: 'Detention settling time',
        spaceNote: 'Surface settling area',
      },
      {
        id: 4,
        title: 'Rapid Sand Filtration',
        icon: '⏳',
        desc: 'Water trickles down dual-media filters (anthracite coal & sand), trapping remaining microscopic suspended flocs.',
        detail: 'Filters are periodically cleaned by backwashing — pumping water and air upwards to loosen trapped particles.',
        time: 'Continuous',
        space: 'A_filter',
        timeNote: 'Filtration rate (m3/m2/hr)',
        spaceNote: 'Filter bed surface area',
      },
      {
        id: 5,
        title: 'Disinfection (Chlorination)',
        icon: '🦠',
        desc: 'Chlorine gas or sodium hypochlorite is injected into water to kill pathogenic bacteria, protozoa, and viruses.',
        detail: 'Ensures residual chlorine (0.2 mg/l) remains in the distribution pipeline to prevent re-contamination.',
        time: '30 min',
        space: 'C_dosage',
        timeNote: 'Disinfectant contact time',
        spaceNote: 'Chlorine dosing concentration',
      },
      {
        id: 6,
        title: 'Storage & Gravity Feed',
        icon: '▶',
        desc: 'Treated water is pumped to elevated service reservoirs (ESRs) and distributed to town pipelines via gravity.',
        detail: 'System pressures are maintained to supply domestic connections with sufficient pressure.',
        time: 'Continuous',
        space: 'V_storage',
        timeNote: 'Supply schedule control',
        spaceNote: 'Reservoir storage capacity',
      },
    ],
  },
  highway: {
    name: 'Smart Flexible Pavement Design',
    company: 'Transportation Highway Engineering',
    color: '#4b5563',
    lightBg: '#f3f4f6',
    borderColor: 'border-[#4b5563]',
    textColor: 'text-[#4b5563]',
    bgColor: 'bg-[#4b5563]',
    tabActive: 'tab-highway',
    architecture: 'Layered asphalt flexible pavement structure',
    tokenizer: 'California Bearing Ratio (CBR) percentage',
    contextWindow: 'Design traffic in Million Standard Axles (MSA)',
    trainingData: 'IRC:37 flexible pavement guidelines',
    uniqueTrait: 'Wheel load distribution via stress dispersion',
    steps: [
      {
        id: 1,
        title: 'Subgrade Preparation',
        icon: '⬡',
        desc: 'Natural soil is excavated, graded, and compacted using heavy rollers to achieve maximum dry density (97% Proctor density).',
        detail: 'Subgrade strength is measured by CBR test. Soil stabilization (using lime/cement) is performed if CBR is less than 5%.',
        time: 'O(w)',
        space: 'CBR_%',
        timeNote: 'Compaction passes width w',
        spaceNote: 'California Bearing Ratio value',
      },
      {
        id: 2,
        title: 'Granular Sub-Base (GSB)',
        icon: '↔',
        desc: 'Granular material (gravel/crushed stone) is laid and compacted to act as a drainage layer and distribute wheel loads.',
        detail: 'Prevents capillary rise of water from subgrade, protecting upper pavement layers from moisture damage.',
        time: 'O(l)',
        space: 't_gsb',
        timeNote: 'GSB laying rate l',
        spaceNote: 'Sub-base layer thickness',
      },
      {
        id: 3,
        title: 'Wet Mix Macadam (WMM) Base',
        icon: '◎',
        desc: 'Crushed graded aggregate mixed with water is laid to form a dense base course, providing primary structural support.',
        detail: 'Compacted using vibratory rollers. A thin bituminous primer coat is sprayed over the base to bind layers.',
        time: 'O(l)',
        space: 't_wmm',
        timeNote: 'Base course laying rate',
        spaceNote: 'Base layer thickness',
      },
      {
        id: 4,
        title: 'Dense Bituminous Macadam',
        icon: '⊕',
        desc: 'Coarse aggregates mixed with hot bitumen binder are laid and compacted to form the core structural asphalt layer.',
        detail: 'Acts as the main load-bearing binder course, resisting fatigue cracking under repetitive heavy axle loads.',
        time: 'O(l)',
        space: 't_dbm',
        timeNote: 'Asphalt laying rate',
        spaceNote: 'Binder layer thickness',
      },
      {
        id: 5,
        title: 'Bituminous Concrete Wearing',
        icon: '★',
        desc: 'The top wearing layer is laid using premium aggregates and polymer modified bitumen to resist skid and weather action.',
        detail: 'Provides a smooth riding surface, keeps rainwater out of the pavement, and resists rutting.',
        time: 'O(l)',
        space: 't_wearing',
        timeNote: 'Surface paving speed',
        spaceNote: 'Wearing course thickness',
      },
      {
        id: 6,
        title: 'ITS Sensors & Markings',
        icon: '▶',
        desc: 'Smart traffic systems (inductive loop detectors, speed cameras, solar studs, and reflective lines) are integrated.',
        detail: 'Inductive loops count vehicles and measure axle loads in real-time, sending data to traffic management centers.',
        time: 'O(1)',
        space: 'O(s)',
        timeNote: 'Hardware install time',
        spaceNote: 'Sensor density along corridor s',
      },
    ],
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
          borderColor: expanded ? color : (isLight ? '#e5e7eb' : 'rgba(255, 255, 255, 0.08)'),
          background: expanded ? (isLight ? lightBg : 'rgba(255, 255, 255, 0.03)') : (isLight ? '#ffffff' : 'rgb(26, 25, 22)'),
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
                  Duration
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
                  Scale / Volume
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
                  Technical Details
                </p>
                <p className={`text-sm ${isLight ? 'text-gray-700' : 'text-ink-200'} leading-relaxed`}>{step.detail}</p>
              </div>

              <div className={`rounded-xl p-3 ${isLight ? 'bg-gray-50' : 'bg-ink-950'}`}>
                <p className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-ink-400'} mb-1.5`}>
                  Process Duration
                </p>
                <p className="complexity-badge text-base block mb-1" style={{ color }}>
                  {step.time}
                </p>
                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-ink-400'}`}>{step.timeNote}</p>
              </div>

              <div className="rounded-xl p-3 bg-gray-50">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Volume / Spatial Boundary
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
  const { steps, color } = CIVIL_SYSTEMS[model]

  return (
    <div className={`overflow-x-auto rounded-2xl border ${isLight ? 'border-gray-100' : 'border-ink-800'} shadow-sm`}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: `${CIVIL_SYSTEMS[model].color}10` }}>
            <th className={`text-left px-4 py-3 font-semibold ${isLight ? 'text-gray-700' : 'text-ink-200'} font-body w-8`}>#</th>
            <th className={`text-left px-4 py-3 font-semibold ${isLight ? 'text-gray-700' : 'text-ink-200'} font-body`}>Stage</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700 font-body">Duration</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700 font-body">Volume Space</th>
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
  const m = CIVIL_SYSTEMS[model]
  const icons = ['🪨', '🚜', '🧹', '🏗', '🔌', '▶']

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${isLight ? 'border-gray-100' : 'border-ink-800'} p-6`}
      style={{ background: m.lightBg }}
    >
      <p className={`text-xs font-semibold uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-ink-500'} mb-4`}>
        Construction Sequence
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
  const m = CIVIL_SYSTEMS[model]

  const rows = [
    { label: 'Civil Sub-domain', value: m.architecture },
    { label: 'Parameters / Standard', value: m.tokenizer },
    { label: 'Structural Limits', value: m.contextWindow },
    { label: 'Performance Metric', value: m.trainingData },
    { label: 'Key Mechanism', value: m.uniqueTrait },
  ]

  return (
    <div className={`rounded-2xl border ${isLight ? 'border-gray-100' : 'border-ink-800'} overflow-hidden shadow-sm`}>
      <div className="px-5 py-4" style={{ background: m.lightBg }}>
        <p className={`text-xs font-semibold uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-ink-500'} mb-2`}>
          Technical Specifications
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

export default function CivilEnggTopics() {
  const { isLight } = useTheme();
  const [activeModel, setActiveModel] = useState('foundation')
  const m = CIVIL_SYSTEMS[activeModel]

  const tabs = [
    { key: 'foundation', label: 'Bored Piling', tabClass: 'tab-gpt' },
    { key: 'water', label: 'Water Purification', tabClass: 'tab-claude' },
    { key: 'highway', label: 'Highway Pavement', tabClass: 'tab-deepseek' },
  ]

  return (
    <div className={`min-h-screen ${isLight ? 'bg-white text-gray-900' : 'bg-ink-950 text-ink-100'} font-body transition-colors duration-300`}>
      <header className={`relative border-b ${isLight ? 'border-gray-100' : 'border-ink-800'} overflow-hidden`}>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: isLight 
              ? 'linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)' 
              : 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: isLight ? 0.03 : 0.08
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${isLight ? 'border-gray-200 text-gray-500' : 'border-ink-800 text-ink-400'} text-xs mb-6`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            Infrastructure Engineering, Hydrology & Geotechnical Deep Dive
          </div>

          <h1 className={`font-body font-black text-3xl sm:text-5xl lg:text-6xl tracking-wide ${isLight ? 'text-gray-900' : 'text-ink-50'} leading-[1.1] mb-4`}>
            How Civil Infrastructures
            <br />
            <span
              className="inline-block"
              style={{
                background: `linear-gradient(90deg, ${CIVIL_SYSTEMS.foundation.color}, ${CIVIL_SYSTEMS.water.color}, ${CIVIL_SYSTEMS.highway.color})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Are Designed & Constructed
            </span>
          </h1>

          <p className={`${isLight ? 'text-gray-500' : 'text-ink-400'} text-base sm:text-lg max-w-xl mx-auto leading-relaxed`}>
            A step-by-step breakdown of deep bored foundations, water purification treatment processes,
            and smart asphalt pavement construction — complete with design guidelines and standards.
          </p>

          <div className="flex justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 flex-wrap">
            {Object.values(CIVIL_SYSTEMS).map((model) => (
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

      <div className={`sticky top-0 z-40 ${isLight ? 'bg-white/90' : 'bg-ink-950/90'} backdrop-blur-sm border-b ${isLight ? 'border-gray-100' : 'border-ink-800'}`}>
        <div className="max-w-5xl mx-auto px-2 sm:px-6">
          <div className="flex overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeModel === tab.key
              const model = CIVIL_SYSTEMS[tab.key]

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveModel(tab.key)}
                  className={`relative flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold transition-colors duration-200 ${isActive ? '' : (isLight ? 'text-gray-400 hover:text-gray-600' : 'text-ink-500 hover:text-ink-300')} ${isActive ? `${tab.tabClass} tab-active` : ''}`}
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="mb-6">
              <h2 className={`font-display font-bold text-2xl ${isLight ? 'text-gray-900' : 'text-ink-50'} mb-1`}>
                6-Stage Construction Process
              </h2>
              <p className="text-sm text-gray-500">
                Click any stage to expand geotechnical requirements and design codes.
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
                  ['b', 'Number of soil test boreholes'],
                  ['d_max', 'Maximum borehole depth (Metres)'],
                  ['d', 'Drilling rate per metre depth'],
                  ['s', 'Splicing rate of steel cages'],
                  ['v', 'Concrete pouring rate volume'],
                  ['p', 'Piles count in structural group'],
                  ['Q_flow', 'Volumetric flow rate of water treatment'],
                  ['C_dosage', 'Chlorine dosage concentration'],
                  ['w', 'Soil compaction roll passes'],
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

        <section className="mt-10 sm:mt-14">
          <div className={`rounded-2xl border ${isLight ? 'border-gray-100' : 'border-ink-800'} ${isLight ? 'bg-gray-50' : 'bg-ink-900'} p-4 sm:p-6 shadow-sm overflow-hidden`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Civil Engineering Infrastructure Workflow</p>
            <div className="flex justify-center">
              <img
                src={civilImage}
                alt="Civil workflow"
                className="w-full max-h-[400px] sm:max-h-[500px] object-contain mx-auto rounded-xl"
              />
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="text-center mb-8">
            <h2 className={`font-display font-bold text-3xl ${isLight ? 'text-gray-900' : 'text-ink-50'} mb-2`}>
              Side-by-Side Comparison
            </h2>
            <p className={`${isLight ? 'text-gray-500' : 'text-ink-400'} text-sm`}>
              Key operational parameters across foundation, environment, and highway fields
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead className={`${isLight ? 'bg-gray-50' : 'bg-ink-900'} border-b ${isLight ? 'border-gray-100' : 'border-ink-800'}`}>
                <tr>
                  <th className={`text-left px-5 py-4 font-semibold ${isLight ? 'text-gray-600' : 'text-ink-400'}`}>Property</th>
                  {Object.values(CIVIL_SYSTEMS).map((item) => (
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
                  { label: 'Civil Sub-domain', keys: ['architecture'] },
                  { label: 'Key Design Code', keys: ['tokenizer'] },
                  { label: 'Primary Inputs', values: ['Soil profile, column loads', 'Turbidity, chemical composition', 'Subgrade strength, axel load'] },
                  { label: 'Primary Outputs', values: ['Pile bearing capacity, settlement', 'Purified drinking water flow', 'Pavement layer thicknesses'] },
                  { label: 'Calculated Bounds', values: ['Bearing capacity & shaft friction', 'Floc settling velocity & filter headloss', 'Vertical subgrade strain & fatigue tensile strain'] },
                  { label: 'Design Software', values: ['STAAD.Pro, PLAXIS, GEO5', 'EPANET, BioWin, GPS-X', 'Civil 3D, MX Road, Kenlayer'] },
                  { label: 'Testing Method', values: ['Standard Penetration Test (SPT), Pile Load Test', 'Turbidity meter, Jar test, BOD test', 'California Bearing Ratio (CBR) test, Benkelman Beam Deflection'] },
                  { label: 'Unique Trait', keys: ['uniqueTrait'] },
                ].map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? (isLight ? 'bg-white' : 'bg-ink-900') : (isLight ? 'bg-gray-50/50' : 'bg-ink-950/50')}>
                    <td className={`px-5 py-3 font-medium ${isLight ? 'text-gray-700' : 'text-ink-200'} border-r ${isLight ? 'border-gray-50' : 'border-ink-800'}`}>
                      {row.label}
                    </td>

                    {Object.entries(CIVIL_SYSTEMS).map(([key, model], j) => (
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