import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { studentService } from '../../services/api'
import { BookOpen, FileText, BarChart3, MessageSquare, TrendingUp, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import MetaData from "../../components/layout/MetaData"
export default function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ materials: 0, tests: 0, results: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      studentService.getMaterials().catch(() => ({ data: [] })),
      studentService.getTests().catch(() => ({ data: [] })),
      studentService.getResults().catch(() => ({ data: [] })),
    ]).then(([m, t, r]) => {
      setStats({
        materials: m.data?.length || 0,
        tests: t.data?.length || 0,
        results: r.data || [],
      })
    }).finally(() => setLoading(false))
  }, [])

  const avgScore = stats.results.length
    ? Math.round(stats.results.reduce((a, r) => a + (r.score || 0), 0) / stats.results.length)
    : null

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-fade-up">
        <p className="text-ink-500 text-sm mb-1">{greeting} 👋</p>
        <h1 className="page-title">{user?.name}</h1>
      </div>

<MetaData title="Student" />

      {/* Quick links */}
      <div className="animate-fade-up animate-delay-200">
        <h2 className="section-title mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { to: '/student/materials', icon: BookOpen, label: 'Browse Materials', desc: 'Notes, videos & files', color: 'lime' },
            { to: '/student/tests', icon: FileText, label: 'Take a Test', desc: 'Pending assessments', color: 'sky' },
            { to: '/student/results', icon: BarChart3, label: 'View Results', desc: 'Track your progress', color: 'amber' },
            { to: '/student/chat', icon: MessageSquare, label: 'Chat', desc: 'Talk to instructors', color: 'purple' },
          ].map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to} className="card p-4 hover:border-lime-300/30 transition-all group">
              <div className={`w-9 h-9 rounded-xl mb-3 flex items-center justify-center ${
                color === 'lime' ? 'bg-lime-300/10' :
                color === 'sky' ? 'bg-sky-400/10' :
                color === 'amber' ? 'bg-sky-300/10' : 'bg-sky-400/10'
              }`}>
                <Icon size={16} className={
                  color === 'lime' ? 'text-lime-300' :
                  color === 'sky' ? 'text-sky-400' :
                  color === 'amber' ? 'text-sky-300' : 'text-sky-400'
                } />
              </div>
              <p className="text-ink-100 text-sm font-500 mb-0.5">{label}</p>
              <p className="text-ink-500 text-xs">{desc}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-lime-300 opacity-0 group-hover:opacity-100 transition-opacity">
                Go <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent results */}
      {stats.results.length > 0 && (
        <div className="animate-fade-up animate-delay-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Results</h2>
            <Link to="/student/results" className="text-lime-300 text-sm hover:text-lime-400 flex items-center gap-1">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[360px]">
                <thead>
                  <tr className="border-b border-ink-800">
                    <th className="text-left px-4 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider">Test</th>
                    <th className="text-left px-4 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider">Score</th>
                    <th className="text-left px-4 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.results.slice(0, 5).map((r, i) => (
                    <tr key={r._id || i} className="table-row">
                      <td className="px-4 py-3 text-ink-200 max-w-[160px] truncate">{r.test?.title || 'Test'}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${r.score >= 70 ? 'tag-lime' : r.score >= 50 ? 'tag-amber' : 'tag-red'}`}>
                          {r.score}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-500">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, color, label, value }) {
  const colors = {
    lime: { bg: 'bg-lime-300/10', text: 'text-lime-300' },
    sky: { bg: 'bg-sky-400/10', text: 'text-sky-400' },
    amber: { bg: 'bg-sky-300/10', text: 'text-sky-300' },
    green: { bg: 'bg-lime-300/10', text: 'text-lime-300' },
  }
  const c = colors[color] || colors.lime

  return (
    <div className="stat-card hover:-translate-y-1 hover:shadow-lg hover:shadow-ink-900/50 transition-all duration-300 group cursor-default">
      <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={16} className={c.text} />
      </div>
      <p className="text-ink-500 text-xs">{label}</p>
      <p className="font-display font-700 text-2xl text-ink-50 mt-0.5">{value}</p>
    </div>
  )
}
