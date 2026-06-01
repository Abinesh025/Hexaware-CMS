import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'
import iotImage from "../../assets/iot_workflow.png"

const MICRO_CONTROLLERS = {
  arduino: {
    name: 'Arduino (ATmega328P)',
    company: 'Microchip Technology',
    color: '#00979d',
    lightBg: '#f0fbfc',
    borderColor: 'border-[#00979d]',
    textColor: 'text-[#00979d]',
    bgColor: 'bg-[#00979d]',
    tabActive: 'tab-arduino',
    architecture: '8-bit AVR RISC Harvard Architecture',
    tokenizer: 'AVR Instruction Set (130 instructions)',
    contextWindow: '32 KB Flash Memory',
    trainingData: '1024-byte EEPROM / 2 KB SRAM',
    uniqueTrait: 'Deterministic single-cycle execution',
    steps: [
      {
        id: 1,
        title: 'Power-On Reset (POR)',
        icon: '⚡',
        desc: 'When power is applied or reset pin goes low, internal voltage comparator starts. Program Counter (PC) is forced to 0x0000, initiating startup vectors.',
        detail: 'AVR start up time is controlled by fuses. Typically takes ~64ms for power to stabilise before first opcode execution.',
        time: 'O(1)',
        space: 'O(1)',
        timeNote: 'Constant hardware delay',
        spaceNote: 'No RAM usage at reset',
      },
      {
        id: 2,
        title: 'Instruction Fetch',
        icon: '📥',
        desc: 'The Program Counter places flash address on the 16-bit program memory bus. 16-bit instruction word is fetched into the instruction register.',
        detail: 'Hardware prefetching is not used; single-level pipelining means next instruction is fetched while current one executes.',
        time: '1 Cycle',
        space: '16-bit',
        timeNote: 'One clock cycle',
        spaceNote: 'Instruction register buffer',
      },
      {
        id: 3,
        title: 'Instruction Decode',
        icon: '⚙️',
        desc: 'Internal decoder logic maps 16-bit opcode to control lines. ALU paths, registers, and memory lines are selected for execution.',
        detail: 'Most instructions are single-register or register-to-register. Decoding is fully hardwired for high efficiency.',
        time: 'O(1)',
        space: 'O(1)',
        timeNote: 'Parallel gate propagation delay',
        spaceNote: 'Combinational logic storage',
      },
      {
        id: 4,
        title: 'ALU Execution',
        icon: '⊕',
        desc: 'The 8-bit Arithmetic Logic Unit performs operation (ADD, SUB, AND, OR, XOR) on contents of General Purpose Registers.',
        detail: 'ALU connects directly to all 32 general purpose registers, enabling single-cycle ALU execution.',
        time: '1 Cycle',
        space: '8-bit',
        timeNote: 'Completed in a single clock cycle',
        spaceNote: '8-bit ALU register storage',
      },
      {
        id: 5,
        title: 'SRAM Access',
        icon: '💾',
        desc: 'If instruction accesses data memory (LDS, STS, LDD, STD), the 8-bit data bus reads or writes data to the 2 KB SRAM space.',
        detail: 'SRAM access takes an extra clock cycle compared to register access because of data bus limitations.',
        time: '2 Cycles',
        space: '8-bit',
        timeNote: 'SRAM read/write latency',
        spaceNote: 'Data bus width',
      },
      {
        id: 6,
        title: 'I/O & Register Writeback',
        icon: '▶',
        desc: 'Results are written back to the destination register or mapped I/O ports, toggling physical pins like PORTB/PORTD.',
        detail: 'Direct port manipulation (e.g., PORTB |= 0x20) changes physical output pin voltage state within 1 cycle.',
        time: '1 Cycle',
        space: 'O(1)',
        timeNote: 'Single cycle writeback',
        spaceNote: 'Port register flip-flops',
      },
    ],
  },
  esp32: {
    name: 'ESP32 (WROOM-32)',
    company: 'Espressif Systems',
    color: '#e7352b',
    lightBg: '#fef1f0',
    borderColor: 'border-[#e7352b]',
    textColor: 'text-[#e7352b]',
    bgColor: 'bg-[#e7352b]',
    tabActive: 'tab-esp32',
    architecture: 'Tensilica Xtensa Dual-Core 32-bit LX6',
    tokenizer: 'Xtensa ISA with DSP extensions',
    contextWindow: '4 MB External SPI Flash',
    trainingData: '520 KB Internal SRAM / 8 KB RTC',
    uniqueTrait: 'Integrated Wi-Fi & Bluetooth baseband',
    steps: [
      {
        id: 1,
        title: 'ROM Bootloader',
        icon: '⬡',
        desc: 'On power up, PRO_CPU begins executing ROM code. It configures default clock speeds, SPI flash communication, and validates the partition table.',
        detail: 'Verifies flash integrity by calculating SHA256 checksums of the bootloader header before loading apps.',
        time: 'O(n)',
        space: 'O(1)',
        timeNote: 'Linear with binary size n',
        spaceNote: 'ROM memory space only',
      },
      {
        id: 2,
        title: 'Second-Stage Boot',
        icon: '↔',
        desc: 'Loads bootloader from flash into internal IRAM. Configures MMU flash cache and initialises the RTC and external RAM (PSRAM) if present.',
        detail: 'Mounts virtual flash memory maps so code can be executed directly from external flash using the cache controller.',
        time: 'O(n)',
        space: 'O(m)',
        timeNote: 'Linear in memory copy block size',
        spaceNote: 'IRAM allocation buffer m',
      },
      {
        id: 3,
        title: 'FreeRTOS Scheduler Start',
        icon: '◎',
        desc: 'Initialises FreeRTOS. Spawns the main task and pins the background radio control loops to Core 0 while Core 1 handles user application logic.',
        detail: 'Preemptive scheduler ticks at 1000Hz (1ms), using task control blocks (TCBs) to perform context switches.',
        time: 'O(1)',
        space: 'O(k)',
        timeNote: 'Constant scheduler ticks',
        spaceNote: 'Memory allocated for L tasks',
      },
      {
        id: 4,
        title: 'RF Stack & LwIP Init',
        icon: '📶',
        desc: 'Power is applied to the internal RF synthesizer. The Wi-Fi driver allocates hardware DMA buffers and initialises the LwIP TCP/IP stack.',
        detail: 'Maintains background RF calibration routines to adjust for temperature drift, operating on Wi-Fi/BT co-existence protocols.',
        time: 'O(1)',
        space: 'O(b)',
        timeNote: 'Asynchronous stack start',
        spaceNote: 'RX/TX DMA rings allocation',
      },
      {
        id: 5,
        title: 'App Task Loop',
        icon: '★',
        desc: 'User code inside loopTask runs on Core 1. Background interrupts handle network packets, UART messages, and ADC readings.',
        detail: 'Can utilise hardware acceleration for cryptographic operations (AES, SHA, RSA) to speed up communication.',
        time: 'O(1)',
        space: 'O(s)',
        timeNote: 'Per-task event loop execution',
        spaceNote: 'Task stack allocation buffer s',
      },
      {
        id: 6,
        title: 'Power Management & Sleep',
        icon: '▶',
        desc: 'ESP32 monitors CPU load and enters Light Sleep or Deep Sleep (10µA draw) when idle, retaining state in RTC memory.',
        detail: 'Deep Sleep shuts down main cores, flash, and Wi-Fi, keeping only the ULP (Ultra-Low Power) co-processor active.',
        time: 'O(1)',
        space: 'O(rtc)',
        timeNote: 'Instantaneous mode switch',
        spaceNote: '8 KB RTC fast/slow memory space',
      },
    ],
  },
  rp2040: {
    name: 'Raspberry Pi RP2040',
    company: 'Raspberry Pi Ltd',
    color: '#c51a4a',
    lightBg: '#fef1f4',
    borderColor: 'border-[#c51a4a]',
    textColor: 'text-[#c51a4a]',
    bgColor: 'bg-[#c51a4a]',
    tabActive: 'tab-rp2040',
    architecture: 'Dual ARM Cortex-M0+ cores',
    tokenizer: 'ARMv6-M Thumb Instruction Set',
    contextWindow: 'Up to 16 MB External Flash',
    trainingData: '264 KB Multi-bank SRAM / PIO block',
    uniqueTrait: 'Programmable I/O (PIO) state machines',
    steps: [
      {
        id: 1,
        title: 'BootROM Selection',
        icon: '⬡',
        desc: 'Hardware checks BOOTSEL pin. If pulled low, it boots from external flash; otherwise, it presents a USB Mass Storage device for drag-and-drop programming.',
        detail: 'ROM contains highly optimised routines for USB MSC, double-precision floating point math, and flash writing.',
        time: 'O(1)',
        space: 'O(1)',
        timeNote: 'Immediate hardware check',
        spaceNote: 'Uses ROM code exclusively',
      },
      {
        id: 2,
        title: 'Dual Core Boot',
        icon: '↔',
        desc: 'Core 0 starts execution from flash via XIP cache. Core 1 is held in a sleep state (WFE) waiting for entry commands from Core 0.',
        detail: 'Core 0 configures vector tables, system clocks, and initialises the memory striping layout across 6 SRAM banks.',
        time: 'O(1)',
        space: 'O(1)',
        timeNote: 'Hardware startup vector',
        spaceNote: 'Boot vectors space',
      },
      {
        id: 3,
        title: 'Inter-Core Mailbox Setup',
        icon: '◎',
        desc: 'Core 0 communicates with Core 1 using hardware Mailbox FIFOs. Core 0 pushes the launch address to wake up Core 1.',
        detail: 'FIFOs are 8 entries deep and generate interrupts when written to, enabling efficient inter-core synchronisation.',
        time: 'O(1)',
        space: 'O(1)',
        timeNote: 'FIFO read/write latency',
        spaceNote: '8-entry FIFO hardware space',
      },
      {
        id: 4,
        title: 'PIO State Machine Load',
        icon: '⚙️',
        desc: 'Core 0 loads custom assembly instructions into the Programmable I/O (PIO) blocks, enabling hardware-level execution of protocols.',
        detail: 'PIO blocks run independently of the main CPUs, handling bit-banging protocols (I2S, WS2812, VGA) with cycle-accurate timing.',
        time: 'O(1)',
        space: 'O(p)',
        timeNote: 'Immediate instruction load',
        spaceNote: '32-instruction memory per block',
      },
      {
        id: 5,
        title: 'Direct Memory Access (DMA)',
        icon: '★',
        desc: 'DMA channels are configured to transfer data between peripherals (ADC, SPI, PIO) and SRAM without involving the CPU.',
        detail: 'Ring buffers and scatter-gather list transfers allow continuous data logging at high speeds.',
        time: '1 Cycle',
        space: 'O(d)',
        timeNote: 'Zero-CPU overhead transfer',
        spaceNote: 'DMA configuration registers d',
      },
      {
        id: 6,
        title: 'Dual-Core Parallel Run',
        icon: '▶',
        desc: 'Both cores execute tasks simultaneously, sharing SRAM with no contention due to bus striping and crossbar interconnects.',
        detail: 'Hardware spinlocks ensure thread safety when modifying shared peripherals or memory regions.',
        time: 'O(1)',
        space: 'O(1)',
        timeNote: 'Parallel code execution',
        spaceNote: 'Lock registers space',
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
                  Latency
                </p>
                <p className="complexity-badge text-base block mb-1" style={{ color }}>
                  {step.time}
                </p>
                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-ink-400'}`}>{step.timeNote}</p>
              </div>

              <div className="rounded-xl p-3 bg-gray-50">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Hardware Buffer
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
  const { steps, color } = MICRO_CONTROLLERS[model]

  return (
    <div className={`overflow-x-auto rounded-2xl border ${isLight ? 'border-gray-100' : 'border-ink-800'} shadow-sm`}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: `${MICRO_CONTROLLERS[model].color}10` }}>
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
  const m = MICRO_CONTROLLERS[model]
  const icons = ['⚡', '📥', '⚙️', '⊕', '💾', '▶']

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${isLight ? 'border-gray-100' : 'border-ink-800'} p-6`}
      style={{ background: m.lightBg }}
    >
      <p className={`text-xs font-semibold uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-ink-500'} mb-4`}>
        Execution Pipeline
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
  const m = MICRO_CONTROLLERS[model]

  const rows = [
    { label: 'Core Architecture', value: m.architecture },
    { label: 'Instruction Set', value: m.tokenizer },
    { label: 'Flash Capacity', value: m.contextWindow },
    { label: 'SRAM & Memory', value: m.trainingData },
    { label: 'Unique Feature', value: m.uniqueTrait },
  ]

  return (
    <div className={`rounded-2xl border ${isLight ? 'border-gray-100' : 'border-ink-800'} overflow-hidden shadow-sm`}>
      <div className="px-5 py-4" style={{ background: m.lightBg }}>
        <p className={`text-xs font-semibold uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-ink-500'} mb-2`}>
          Hardware Specs
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

export default function EEE() {
  const { isLight } = useTheme();
  const [activeModel, setActiveModel] = useState('arduino')
  const m = MICRO_CONTROLLERS[activeModel]

  const tabs = [
    { key: 'arduino', label: 'Arduino (AVR)', tabClass: 'tab-gpt' },
    { key: 'esp32', label: 'ESP32 (Xtensa)', tabClass: 'tab-claude' },
    { key: 'rp2040', label: 'RP2040 (Cortex)', tabClass: 'tab-deepseek' },
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
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            Hardware & Microcontroller Architecture Deep Dive
          </div>

          <h1 className={`font-body font-black text-3xl sm:text-5xl lg:text-6xl tracking-wide ${isLight ? 'text-gray-900' : 'text-ink-50'} leading-[1.1] mb-4`}>
            How Micro-Controllers
            <br />
            <span
              className="inline-block"
              style={{
                background: `linear-gradient(90deg, ${MICRO_CONTROLLERS.arduino.color}, ${MICRO_CONTROLLERS.esp32.color}, ${MICRO_CONTROLLERS.rp2040.color})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Execute Code in Real-Time
            </span>
          </h1>

          <p className={`${isLight ? 'text-gray-500' : 'text-ink-400'} text-base sm:text-lg max-w-xl mx-auto leading-relaxed`}>
            A step-by-step breakdown of execution pipelines powering AVR, Xtensa,
            and ARM Cortex chips — with hardware latency at every stage.
          </p>

          <div className="flex justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 flex-wrap">
            {Object.values(MICRO_CONTROLLERS).map((model) => (
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
              const model = MICRO_CONTROLLERS[tab.key]

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveModel(tab.key)}
                  className={`relative flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold transition-colors duration-200 ${isActive ? '' : (isLight ? 'text-gray-400 hover:text-gray-600' : 'text-ink-500 hover:text-ink-300')}  ${isActive ? `${tab.tabClass} tab-active` : ''}`}
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
                6-Stage Hardware Pipeline
              </h2>
              <p className="text-sm text-gray-500">
                Click any stage to expand technical registers & timing constraints.
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
                  ['n', 'Binary program length'],
                  ['m', 'RAM allocation size'],
                  ['k', 'Number of running tasks'],
                  ['L', 'FreeRTOS task queue limit'],
                  ['s', 'Assigned task stack size'],
                  ['p', 'PIO code instruction limit'],
                  ['d', 'DMA control register channels'],
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
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">IoT Hardware Processing Workflow</p>
            <div className="flex justify-center">
              <img
                src={iotImage}
                alt="IoT workflow"
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
              Key hardware and architecture details across all microcontrollers
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead className={`${isLight ? 'bg-gray-50' : 'bg-ink-900'} border-b ${isLight ? 'border-gray-100' : 'border-ink-800'}`}>
                <tr>
                  <th className={`text-left px-5 py-4 font-semibold ${isLight ? 'text-gray-600' : 'text-ink-400'}`}>Property</th>
                  {Object.values(MICRO_CONTROLLERS).map((item) => (
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
                  { label: 'Instruction Set', keys: ['tokenizer'] },
                  { label: 'Internal Cache', values: ['None', '32 KB Instruction, 16 KB Data', '16 KB Instruction Direct Cache'] },
                  { label: 'Direct Port Access', values: ['Supported (1 Cycle)', 'Supported (Latch delay)', 'Supported (SIO bus)'] },
                  { label: 'Execution Mode', values: ['Single-threaded', 'Dual-core preemptive thread', 'Dual-core execution'] },
                  { label: 'Hardware Interlocks', values: ['None', 'Spinlocks / Mutexes', 'Hardware Spinlocks'] },
                  { label: 'External Memory Support', values: ['None (Internal Only)', 'Up to 16 MB External Flash', 'Up to 16 MB QSPI Flash'] },
                  { label: 'Peripherals', values: ['UART, SPI, I2C, ADC, PWM', 'UART, SPI, I2C, ADC, DAC, capacitive touch, Wi-Fi/BT', 'UART, SPI, I2C, ADC, PWM, PIO State Machines'] },
                  { label: 'Unique Trait', keys: ['uniqueTrait'] },
                ].map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? (isLight ? 'bg-white' : 'bg-ink-900') : (isLight ? 'bg-gray-50/50' : 'bg-ink-950/50')}>
                    <td className={`px-5 py-3 font-medium ${isLight ? 'text-gray-700' : 'text-ink-200'} border-r ${isLight ? 'border-gray-50' : 'border-ink-800'}`}>
                      {row.label}
                    </td>

                    {Object.entries(MICRO_CONTROLLERS).map(([key, model], j) => (
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