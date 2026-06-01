import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'
import mechImage from "../../assets/mech_workflow.png"

const MECHANICAL_SYSTEMS = {
  engine: {
    name: 'Four-Stroke IC Engine Cycle',
    company: 'Thermodynamics & IC Engines',
    color: '#e28743',
    lightBg: '#fdf7f2',
    borderColor: 'border-[#e28743]',
    textColor: 'text-[#e28743]',
    bgColor: 'bg-[#e28743]',
    tabActive: 'tab-engine',
    architecture: 'Otto Cycle / Reciprocating Engine',
    tokenizer: 'Air-Fuel Mixture Combustion Cycle',
    contextWindow: 'Compression Ratio 10:1 - 12:1',
    trainingData: 'Thermal efficiency ~30% - 35%',
    uniqueTrait: 'Mechanical work output via gas expansion',
    steps: [
      {
        id: 1,
        title: 'Intake Stroke',
        icon: '📥',
        desc: 'Inlet valve opens while exhaust valve remains closed. Piston sweeps down from Top Dead Centre (TDC) to Bottom Dead Centre (BDC), creating a vacuum that draws in fuel-air charge.',
        detail: 'In modern engines, variable valve timing (VVT) controls the exact timing to optimize volumetric efficiency at different RPMs.',
        time: '180° Crank',
        space: 'V_max',
        timeNote: 'Duration of crankshaft angle',
        spaceNote: 'Maximum cylinder volume',
      },
      {
        id: 2,
        title: 'Compression Stroke',
        icon: '⚙️',
        desc: 'Both intake and exhaust valves close. Piston moves upwards from BDC to TDC, compressing the fuel-air charge to high pressure and temperature.',
        detail: 'Work is done on the gas. Compression ratio determines the efficiency and must be limited to prevent pre-ignition (knocking).',
        time: '180° Crank',
        space: 'V_min',
        timeNote: 'Duration of crankshaft angle',
        spaceNote: 'Clearance volume space',
      },
      {
        id: 3,
        title: 'Power Stroke (Combustion)',
        icon: '🔥',
        desc: 'Spark plug ignites compressed mixture near TDC. Rapid chemical reaction produces high-pressure, high-temp combustion gases forcing piston down.',
        detail: 'The expanding gas does work on the piston, converting chemical energy directly into mechanical reciprocating work.',
        time: '180° Crank',
        space: 'W_out',
        timeNote: 'Expansion stroke duration',
        spaceNote: 'Output work energy produced',
      },
      {
        id: 4,
        title: 'Exhaust Stroke',
        icon: '📤',
        desc: 'Exhaust valve opens. Piston sweeps up from BDC to TDC, expelling burned combustion gases from the cylinder into the exhaust manifold.',
        detail: 'Scavenging efficiency is critical: exhaust design must facilitate complete evacuation of product gases.',
        time: '180° Crank',
        space: 'V_clearance',
        timeNote: 'Duration of crankshaft angle',
        spaceNote: 'Clearance volume space',
      },
      {
        id: 5,
        title: 'Crankshaft Conversion',
        icon: '🔄',
        desc: 'Reciprocating motion of the piston is transferred via the connecting rod to the crankshaft, transforming it into rotational motion.',
        detail: 'Flywheel stores kinetic energy during power stroke to carry the crankshaft through the other three non-power strokes.',
        time: 'Continuous',
        space: 'T_torque',
        timeNote: 'Angular momentum transition',
        spaceNote: 'Torque generated on crankshaft',
      },
      {
        id: 6,
        title: 'Thermal Dissipation',
        icon: '🌡️',
        desc: 'Excess thermal energy is absorbed by the coolant jacket (water/glycol) or cooling fins to maintain structural integrity of the cylinder walls.',
        detail: 'Around 30% of energy is rejected to coolant, 35% to exhaust gases, and only 35% converted to mechanical power.',
        time: 'O(1) continuous',
        space: 'Q_reject',
        timeNote: 'Continuous thermal conduction',
        spaceNote: 'Rejected heat load capacity',
      },
    ],
  },
  cfd: {
    name: 'CFD Aerodynamics Simulation',
    company: 'Fluid Mechanics & Computation',
    color: '#1f77b4',
    lightBg: '#f0f7fb',
    borderColor: 'border-[#1f77b4]',
    textColor: 'text-[#1f77b4]',
    bgColor: 'bg-[#1f77b4]',
    tabActive: 'tab-cfd',
    architecture: 'Navier-Stokes Equations Solver (FVM)',
    tokenizer: 'Discretized Mesh grid (Hexa/Polyhedral)',
    contextWindow: 'Millions of cell elements',
    trainingData: 'K-epsilon / K-omega SST turbulence models',
    uniqueTrait: 'Iterative mass & momentum conservation',
    steps: [
      {
        id: 1,
        title: 'Geometry & Domain Setup',
        icon: '⬡',
        desc: 'CAD model is imported, cleaned up, and surrounded by a virtual fluid domain representing wind tunnel boundaries.',
        detail: 'Defines the inlet, outlet, and wall boundaries. Gaps and intersections are repaired to prevent mesh leakage.',
        time: 'O(n)',
        space: 'O(v)',
        timeNote: 'Linear in geometric feature count n',
        spaceNote: 'Volume domain mesh bounds v',
      },
      {
        id: 2,
        title: 'Mesh Discretization',
        icon: '↔',
        desc: 'Fluid domain is split into small cells (hexagonal, tetrahedral, or polyhedral) where flow equations will be solved.',
        detail: 'Prism layers are placed near solid walls to capture boundary layer velocity gradients.',
        time: 'O(e)',
        space: 'O(e)',
        timeNote: 'Highly dependent on cell count e',
        spaceNote: 'Grid coordinates cache',
      },
      {
        id: 3,
        title: 'Boundary Conditions',
        icon: '◎',
        desc: 'Inlet velocity vectors, outlet gauge pressure, wall roughness, and initial turbulence values are assigned.',
        detail: 'Implements mathematical constraints on cell faces at the edges of the computational domain.',
        time: 'O(b)',
        space: 'O(b)',
        timeNote: 'Calculated at boundary faces b',
        spaceNote: 'Boundary values array',
      },
      {
        id: 4,
        title: 'Equation Solver (Navier-Stokes)',
        icon: '⊕',
        desc: 'Finite Volume Method (FVM) solves conservation of mass, momentum, and energy across all grid cells iteratively.',
        detail: 'Couples pressure and velocity using algorithms like SIMPLE or PISO. Turbulence models resolve eddy viscosity.',
        time: 'O(i · e)',
        space: 'O(e)',
        timeNote: 'Iterative passes i across elements e',
        spaceNote: 'Cell variable matrix',
      },
      {
        id: 5,
        title: 'Convergence Verification',
        icon: '★',
        desc: 'Residual values representing error in mass and momentum are tracked until they fall below a designated threshold (e.g. 10^-5).',
        detail: 'Monitor points track lift and drag coefficients to verify they have reached steady-state values.',
        time: 'O(i)',
        space: 'O(i)',
        timeNote: 'Calculated per iteration i',
        spaceNote: 'Historical residuals log',
      },
      {
        id: 6,
        title: 'Post-Processing Plots',
        icon: '▶',
        desc: 'Calculated flow variables are visualised as velocity streamlines, pressure contours, and drag/lift coefficient values.',
        detail: 'Helps identify regions of flow separation, pressure gradients, and wake vortices behind aerodynamic bodies.',
        time: 'O(e)',
        space: 'O(e)',
        timeNote: 'Rendering elements complexity',
        spaceNote: 'Render buffer requirements',
      },
    ],
  },
  robotics: {
    name: 'Manipulator Kinematics & Control',
    company: 'Robotics & Multibody Dynamics',
    color: '#2ca02c',
    lightBg: '#f1fbf1',
    borderColor: 'border-[#2ca02c]',
    textColor: 'text-[#2ca02c]',
    bgColor: 'bg-[#2ca02c]',
    tabActive: 'tab-robotics',
    architecture: 'Denavit-Hartenberg (DH) Multibody Linkage',
    tokenizer: 'Joint Vectors & Link Parameters',
    contextWindow: '6 Degrees of Freedom (DoF) or more',
    trainingData: 'Euler-Lagrange equations / PID feedback loops',
    uniqueTrait: 'Spatial translation via coordinate transformations',
    steps: [
      {
        id: 1,
        title: 'DH Parameter Assignment',
        icon: '⬡',
        desc: 'Coordinate frames are assigned to each joint. Link length (a), link twist (α), link offset (d), and joint angle (θ) are defined.',
        detail: 'Creates the geometric model representing the kinematic configuration of the robot arm.',
        time: 'O(d_of)',
        space: 'O(d_of)',
        timeNote: 'Linear in degrees of freedom',
        spaceNote: 'Joint parameters array',
      },
      {
        id: 2,
        title: 'Joint Encoder Feedback',
        icon: '↔',
        desc: 'Optical encoders or resolvers read current angular positions of joint motors in real-time, sending them to the controller.',
        detail: 'Digital counter cards convert pulse trains into float radian values, applying gear ratios.',
        time: 'O(d_of)',
        space: 'O(d_of)',
        timeNote: 'Read latency per joint encoder',
        spaceNote: 'Encoder registers storage',
      },
      {
        id: 3,
        title: 'Forward Kinematics',
        icon: '◎',
        desc: 'Joint coordinates are substituted into homogenous transformation matrices, which are multiplied to find the end-effector position.',
        detail: 'Transformation: T_0^n = T_0^1 * T_1^2 * ... * T_{n-1}^n. Computes position (x, y, z) and orientation in cartesian space.',
        time: 'O(d_of)',
        space: 'O(1)',
        timeNote: 'Matrix multiplication chain',
        spaceNote: 'Fixed transformation matrix',
      },
      {
        id: 4,
        title: 'Inverse Kinematics',
        icon: '⚙️',
        desc: 'Given a target end-effector coordinate, analytical or numerical equations solve the required joint angles to reach it.',
        detail: 'Analytical methods are fast but configuration dependent. Numerical methods use Jacobian inversion (J^-1) iteratively.',
        time: 'O(i · d_of³)',
        space: 'O(d_of²)',
        timeNote: 'Numerical matrix inversion time',
        spaceNote: 'Jacobian matrix storage',
      },
      {
        id: 5,
        title: 'Trajectory Generation',
        icon: '★',
        desc: 'Calculates smooth transition profiles for joints, using cubic or quintic splines to limit acceleration changes (jerk).',
        detail: 'Generates joint angle, velocity, and acceleration values for each millisecond interval of the path.',
        time: 'O(t)',
        space: 'O(t)',
        timeNote: 'Proportional to path time steps t',
        spaceNote: 'Setpoints buffer array',
      },
      {
        id: 6,
        title: 'PID Controller Command',
        icon: '▶',
        desc: 'Computes current error: setpoint - actual. Proportional, Integral, and Derivative gains apply motor currents to reach target angles.',
        detail: 'Servo amplifier drives current to PWM amplifiers at 20kHz, minimising positioning error.',
        time: 'O(d_of)',
        space: 'O(d_of)',
        timeNote: 'Executed inside high-speed ISR',
        spaceNote: 'PID loop gains registers',
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
                  Crank / Duration
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
                  Domain / Volume
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
                  Duration Complexity
                </p>
                <p className="complexity-badge text-base block mb-1" style={{ color }}>
                  {step.time}
                </p>
                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-ink-400'}`}>{step.timeNote}</p>
              </div>

              <div className="rounded-xl p-3 bg-gray-50">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Control Space Boundary
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
  const { steps, color } = MECHANICAL_SYSTEMS[model]

  return (
    <div className={`overflow-x-auto rounded-2xl border ${isLight ? 'border-gray-100' : 'border-ink-800'} shadow-sm`}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: `${MECHANICAL_SYSTEMS[model].color}10` }}>
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
  const m = MECHANICAL_SYSTEMS[model]
  const icons = ['📥', '⚙️', '🔥', '📤', '🔄', '🌡️']

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${isLight ? 'border-gray-100' : 'border-ink-800'} p-6`}
      style={{ background: m.lightBg }}
    >
      <p className={`text-xs font-semibold uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-ink-500'} mb-4`}>
        Cycle / Process Sequence
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
  const m = MECHANICAL_SYSTEMS[model]

  const rows = [
    { label: 'Engineering Domain', value: m.architecture },
    { label: 'Governing Principle', value: m.tokenizer },
    { label: 'Operating Bounds', value: m.contextWindow },
    { label: 'Efficiency & Load', value: m.trainingData },
    { label: 'Key Characteristic', value: m.uniqueTrait },
  ]

  return (
    <div className={`rounded-2xl border ${isLight ? 'border-gray-100' : 'border-ink-800'} overflow-hidden shadow-sm`}>
      <div className="px-5 py-4" style={{ background: m.lightBg }}>
        <p className={`text-xs font-semibold uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-ink-500'} mb-2`}>
          System Specifications
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

export default function MechEnggSyllabus() {
  const { isLight } = useTheme();
  const [activeModel, setActiveModel] = useState('engine')
  const m = MECHANICAL_SYSTEMS[activeModel]

  const tabs = [
    { key: 'engine', label: 'Four-Stroke Cycle', tabClass: 'tab-gpt' },
    { key: 'cfd', label: 'CFD Simulation', tabClass: 'tab-claude' },
    { key: 'robotics', label: 'Joint Kinematics', tabClass: 'tab-deepseek' },
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
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Mechanical Systems, Fluid Dynamics & Robotics Analysis
          </div>

          <h1 className={`font-body font-black text-3xl sm:text-5xl lg:text-6xl tracking-wide ${isLight ? 'text-gray-900' : 'text-ink-50'} leading-[1.1] mb-4`}>
            How Mechanical Systems
            <br />
            <span
              className="inline-block"
              style={{
                background: `linear-gradient(90deg, ${MECHANICAL_SYSTEMS.engine.color}, ${MECHANICAL_SYSTEMS.cfd.color}, ${MECHANICAL_SYSTEMS.robotics.color})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Transfer Work & Energy
            </span>
          </h1>

          <p className={`${isLight ? 'text-gray-500' : 'text-ink-400'} text-base sm:text-lg max-w-xl mx-auto leading-relaxed`}>
            A step-by-step breakdown of thermodynamics cycles, CFD solvers, and robotics joint kinematics
            — detailing governing laws and control loop boundary states.
          </p>

          <div className="flex justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 flex-wrap">
            {Object.values(MECHANICAL_SYSTEMS).map((model) => (
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
              const model = MECHANICAL_SYSTEMS[tab.key]

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
                6-Stage System Execution
              </h2>
              <p className="text-sm text-gray-500">
                Click any stage to expand governing formulas and mechanical constraints.
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
                  ['n', 'Geometric feature count / CAD items'],
                  ['v', 'Fluid domain boundaries volume limit'],
                  ['e', 'Mesh element cells count (Millions)'],
                  ['i', 'Solver iteration cycles'],
                  ['b', 'Boundary conditions constraint faces'],
                  ['d_of', 'Degrees of freedom of manipulator'],
                  ['t', 'Discrete trajectory time steps'],
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
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Mechanical Engineering System Flowchart</p>
            <div className="flex justify-center">
              <img
                src={mechImage}
                alt="Mech workflow"
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
              Key operational parameters across thermodynamics, fluid dynamics, and robotics
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead className={`${isLight ? 'bg-gray-50' : 'bg-ink-900'} border-b ${isLight ? 'border-gray-100' : 'border-ink-800'}`}>
                <tr>
                  <th className={`text-left px-5 py-4 font-semibold ${isLight ? 'text-gray-600' : 'text-ink-400'}`}>Property</th>
                  {Object.values(MECHANICAL_SYSTEMS).map((item) => (
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
                  { label: 'Engineering Domain', keys: ['architecture'] },
                  { label: 'Governing Equations', keys: ['tokenizer'] },
                  { label: 'Primary Inputs', values: ['Fuel, Ambient Air, Spark', 'Fluid Properties, Boundary Vel/Press', 'Target Coordinates, DH parameters'] },
                  { label: 'Primary Outputs', values: ['Shaft Torque, Exhaust Heat', 'Lift/Drag force coefficients', 'Joint Angles, Servo Currents'] },
                  { label: 'Mathematical Focus', values: ['Thermodynamic energy conservation', 'Partial differential equations solving', 'Vector rotations & homogeneous matrices'] },
                  { label: 'Common Software', values: ['MATLAB, GT-SUITE, AVL Boost', 'ANSYS Fluent, OpenFOAM, Star-CCM+', 'ROS, SOLIDWORKS, CoppeliaSim'] },
                  { label: 'Hardware Interface', values: ['Pistons, Connecting rods, Crankshaft', 'Wind tunnel sensors, pitot tubes', 'Joint encoders, servo drives'] },
                  { label: 'Unique Trait', keys: ['uniqueTrait'] },
                ].map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? (isLight ? 'bg-white' : 'bg-ink-900') : (isLight ? 'bg-gray-50/50' : 'bg-ink-950/50')}>
                    <td className={`px-5 py-3 font-medium ${isLight ? 'text-gray-700' : 'text-ink-200'} border-r ${isLight ? 'border-gray-50' : 'border-ink-800'}`}>
                      {row.label}
                    </td>

                    {Object.entries(MECHANICAL_SYSTEMS).map(([key, model], j) => (
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