import { useAuth } from '../../context/AuthContext'
import { ArrowLeft, BookOpen, Code, FileText, CheckCircle, BrainCircuit, UserCheck, Terminal, HardDrive } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PlacementOnCampus() {
  const { user } = useAuth()
  
  const isCse = user?.department === 'Computer Science and Engineering'
  const isEce = user?.department === 'Electronics and Communication Engineering'

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-up">
      <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-ink-400 hover:text-lime-300 transition-colors mb-2 text-sm font-500">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ink-800 pb-4">
        <div>
          <h1 className="page-title text-2xl md:text-3xl">On-Campus Placement Preparation</h1>
          <p className="text-ink-400 mt-1">Syllabus, topics, and guide tailored for your department</p>
        </div>
        <div className="shrink-0">
          <span className="tag-lime badge text-sm font-600 px-3 py-1.5 capitalize">{user?.department}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Preparation Material */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Aptitude & Logical Reasoning */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-lime-400/10 rounded-xl flex items-center justify-center text-lime-400">
                <BrainCircuit size={20} />
              </div>
              <h2 className="text-lg font-bold text-ink-50">1. Quantitative Aptitude & Reasoning</h2>
            </div>
            <p className="text-sm text-ink-400">Essential non-technical topics frequently tested in first-round elimination rounds.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-ink-800/40 p-4 rounded-xl border border-ink-800">
                <h3 className="text-sm font-semibold text-lime-300 mb-2">Quantitative Aptitude</h3>
                <ul className="text-xs text-ink-300 space-y-1.5 list-disc pl-4">
                  <li><strong>Averages & Percentages:</strong> Profit & Loss, Simple & Compound Interest.</li>
                  <li><strong>Time & Work / Speed:</strong> Pipes & Cisterns, Train problems, Relative speed.</li>
                  <li><strong>Numbers:</strong> LCM & HCF, Number systems, Progressions (AP/GP).</li>
                  <li><strong>Permutations & Probability:</strong> Basic arrangements and card-rolling games.</li>
                </ul>
              </div>
              <div className="bg-ink-800/40 p-4 rounded-xl border border-ink-800">
                <h3 className="text-sm font-semibold text-sky-300 mb-2">Logical Reasoning</h3>
                <ul className="text-xs text-ink-300 space-y-1.5 list-disc pl-4">
                  <li><strong>Syllogisms:</strong> Statement-conclusion deductive logic.</li>
                  <li><strong>Data Interpretation:</strong> Bar charts, pie charts, and data sufficiency tables.</li>
                  <li><strong>Series & Puzzles:</strong> Blood relations, directions, grid seating arrangements.</li>
                  <li><strong>Coding-Decoding:</strong> Alphabetical shifts and pattern mapping.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Technical Interview Preparations (Department Specific) */}
          {isCse && (
            <div className="card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                  <Terminal size={20} />
                </div>
                <h2 className="text-lg font-bold text-ink-50">2. Technical & Coding Preparation</h2>
              </div>
              <p className="text-sm text-ink-400">Core Computer Science technical concepts and programming round strategies.</p>
              
              <div className="space-y-3">
                <div className="bg-ink-800/40 p-4 rounded-xl border border-ink-800">
                  <h3 className="text-sm font-semibold text-indigo-300 mb-2">Programming & Data Structures</h3>
                  <p className="text-xs text-ink-300 mb-3">Focus on languages like C++, Java, or Python. Study these core structures:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-ink-950 p-2 rounded border border-ink-800 text-ink-300">Arrays & Strings</div>
                    <div className="bg-ink-950 p-2 rounded border border-ink-800 text-ink-300">Linked Lists</div>
                    <div className="bg-ink-950 p-2 rounded border border-ink-800 text-ink-300">Stacks & Queues</div>
                    <div className="bg-ink-950 p-2 rounded border border-ink-800 text-ink-300">Trees & Graphs</div>
                  </div>
                </div>

                <div className="bg-ink-800/40 p-4 rounded-xl border border-ink-800">
                  <h3 className="text-sm font-semibold text-indigo-300 mb-2">CS Core Concepts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-ink-300">
                    <div className="bg-ink-950 p-3 rounded border border-ink-800 space-y-1">
                      <span className="font-600 text-lime-300">DBMS</span>
                      <p className="text-[11px] text-ink-400">SQL Queries, Joins, Normalization (1NF to BCNF), ACID Properties, Transactions.</p>
                    </div>
                    <div className="bg-ink-950 p-3 rounded border border-ink-800 space-y-1">
                      <span className="font-600 text-sky-300">Operating Systems</span>
                      <p className="text-[11px] text-ink-400">Process Scheduling, Deadlocks, Semaphores, Paging & Segmentation, Virtual Memory.</p>
                    </div>
                    <div className="bg-ink-950 p-3 rounded border border-ink-800 space-y-1">
                      <span className="font-600 text-amber-300">Computer Networks</span>
                      <p className="text-[11px] text-ink-400">OSI & TCP/IP Layers, IP Addressing, DNS, HTTP/HTTPS, TCP vs UDP handshakes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isEce && (
            <div className="card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                  <HardDrive size={20} />
                </div>
                <h2 className="text-lg font-bold text-ink-50">2. ECE Core Technical Preparation</h2>
              </div>
              <p className="text-sm text-ink-400">Core Electronics concepts, hardware programming, and circuit analysis for hardware/embedded roles.</p>
              
              <div className="space-y-3">
                <div className="bg-ink-800/40 p-4 rounded-xl border border-ink-800">
                  <h3 className="text-sm font-semibold text-indigo-300 mb-2">Digital Logic & Microcontrollers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-ink-300">
                    <div className="bg-ink-950 p-3 rounded border border-ink-800">
                      <strong className="text-lime-300 block mb-1">Digital Design</strong>
                      Combinational circuits (Multiplexers, Decoders), Sequential circuits (Flip-Flops, Counters, Latches), Finite State Machines (FSMs).
                    </div>
                    <div className="bg-ink-950 p-3 rounded border border-ink-800">
                      <strong className="text-sky-300 block mb-1">Microprocessors & Microcontrollers</strong>
                      8085/8086 Instruction sets, 8051 Microcontroller Architecture, Interrupt handling, Timers, and Memory mapping.
                    </div>
                  </div>
                </div>

                <div className="bg-ink-800/40 p-4 rounded-xl border border-ink-800">
                  <h3 className="text-sm font-semibold text-indigo-300 mb-2">Embedded Systems & Hardware Programming</h3>
                  <ul className="text-xs text-ink-300 space-y-1.5 list-disc pl-4">
                    <li><strong>Embedded C:</strong> Bitwise operators, pointers in hardware registers, volatile and const declarations, memory layouts.</li>
                    <li><strong>Communication Protocols:</strong> UART, SPI, I2C, CAN Bus (speeds, wiring, and synchronization).</li>
                    <li><strong>VLSI Design:</strong> MOS transistor equations, CMOS inverter, Setup & Hold times, static and dynamic power dissipation.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Col: Resume & HR guidelines */}
        <div className="space-y-6">
          {/* Card: Resume Prep */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <FileText size={20} />
              <h2 className="text-lg font-bold text-ink-50">Resume Tips</h2>
            </div>
            <ul className="space-y-3 text-xs text-ink-300">
              <li className="flex gap-2">
                <CheckCircle size={15} className="text-lime-400 shrink-0 mt-0.5" />
                <span>Keep it strictly to <strong>1 page</strong> with clean, professional layouts (no colored stars/skill bars).</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={15} className="text-lime-400 shrink-0 mt-0.5" />
                <span>Use the **XYZ Formula** for projects: *"Accomplished [X], as measured by [Y], by doing [Z]"*.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={15} className="text-lime-400 shrink-0 mt-0.5" />
                <span>List your core department programming language (C/C++, Java, Embedded C) and database skills.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={15} className="text-lime-400 shrink-0 mt-0.5" />
                <span>Ensure your GitHub repository and LinkedIn links are clickable and active.</span>
              </li>
            </ul>
          </div>

          {/* Card: HR Interview Prep */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-3 text-sky-400">
              <UserCheck size={20} />
              <h2 className="text-lg font-bold text-ink-50">HR Interview</h2>
            </div>
            <div className="space-y-3 text-xs text-ink-300">
              <div className="bg-ink-950 p-3 rounded border border-ink-800">
                <strong className="text-ink-200">"Tell me about yourself."</strong>
                <p className="text-[11px] text-ink-400 mt-1">Prepare a 60-second summary: background ➔ major achievements ➔ technical projects ➔ reason for applying to this company.</p>
              </div>
              <div className="bg-ink-950 p-3 rounded border border-ink-800">
                <strong className="text-ink-200">"Why E.G.S?"</strong>
                <p className="text-[11px] text-ink-400 mt-1">Be ready to explain how your student projects, coursework, and coding tests align with the company's domains.</p>
              </div>
              <div className="bg-ink-950 p-3 rounded border border-ink-800">
                <strong className="text-ink-200">STAR Method</strong>
                <p className="text-[11px] text-ink-400 mt-1">Answer behavioral questions (conflicts, teamwork) using **S**ituation, **T**ask, **A**ction, and **R**esult.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
