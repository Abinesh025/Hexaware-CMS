import { useState, useEffect } from 'react'
import { studentService } from '../../services/api'
import { getSocket } from '../../services/socket'
import { useAuth } from '../../context/AuthContext'
import { BarChart3, TrendingUp, Award, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

// Compute percentage for a result (server may store .percentage or we derive it)
const getPct = (r) => {
  if (r.percentage != null) return Math.round(r.percentage)
  if (r.totalMarks > 0) return Math.round((r.score / r.totalMarks) * 100)
  // Legacy: score was stored as a percentage directly
  return r.score ?? 0
}

const PASS_THRESHOLD = 50

export default function StudentResults() {
  const { token } = useAuth()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItems = () => {
      setLoading(true)
      studentService.getResults()
        .then(res => setResults(res.data || []))
        .catch(() => toast.error('Failed to load results'))
        .finally(() => setLoading(false))
    }
    fetchItems()
    const socket = getSocket(token)
    const handleDataChanged = (type) => { if (type === 'result') fetchItems() }
    socket.on('data_changed', handleDataChanged)
    return () => socket.off('data_changed', handleDataChanged)
  }, [token])

  const pcts = results.map(getPct)
  const avg = results.length ? Math.round(pcts.reduce((a, v) => a + v, 0) / results.length) : null
  const best = results.length ? Math.max(...pcts) : null
  const passCount = pcts.filter(p => p >= PASS_THRESHOLD).length

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="page-title">My Results</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tests Taken',   value: results.length,                         icon: BarChart3,   color: 'text-sky-400' },
          { label: 'Average Score', value: avg  !== null ? `${avg}%`  : '—',       icon: TrendingUp,  color: 'text-lime-300' },
          { label: 'Best Score',    value: best !== null ? `${best}%` : '—',       icon: Award,       color: 'text-sky-300' },
          { label: 'Passed (≥50%)', value: results.length ? `${passCount}/${results.length}` : '—', icon: CheckCircle, color: 'text-green-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <Icon size={18} className={`${color} mb-2`} />
            <p className="text-ink-500 text-xs">{label}</p>
            <p className="font-display font-700 text-2xl text-ink-50">{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-800">
          <h2 className="section-title">All Results</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-ink-500 text-sm">Loading…</div>
        ) : results.length === 0 ? (
          <div className="p-12 text-center">
            <BarChart3 size={32} className="text-ink-700 mx-auto mb-3" />
            <p className="text-ink-500 text-sm">No results yet. Take a test!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-ink-800">
                  <th className="text-left px-5 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider">Test</th>
                  <th className="text-left px-5 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider">Score</th>
                  <th className="text-left px-5 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider hidden sm:table-cell">Progress</th>
                  <th className="text-left px-5 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const pct = getPct(r)
                  const passed = pct >= PASS_THRESHOLD
                  return (
                    <tr key={r._id || i} className="table-row">
                      <td className="px-5 py-3 text-ink-200 max-w-[160px] truncate">{r.test?.title || 'Test'}</td>
                      <td className="px-5 py-3">
                        <span className={`badge ${pct >= 75 ? 'tag-lime' : pct >= PASS_THRESHOLD ? 'tag-amber' : 'tag-red'}`}>
                          {r.totalMarks > 0 ? `${r.score}/${r.totalMarks}` : `${pct}%`}
                        </span>
                      </td>
                      <td className="px-5 py-3 w-40 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-ink-800 rounded-full">
                            <div
                              className={`h-full rounded-full ${pct >= 75 ? 'bg-lime-300' : pct >= PASS_THRESHOLD ? 'bg-sky-300' : 'bg-red-400'}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-ink-500 w-8">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {passed ? (
                          <span className="inline-flex items-center gap-1 text-xs font-600 text-green-400">
                            <CheckCircle size={13} /> Pass
                          </span>
                        ) : (
                          <span className="inline-flex flex-col">
                            <span className="inline-flex items-center gap-1 text-xs font-600 text-red-400">
                              <XCircle size={13} /> Fail
                            </span>
                            <span className="text-[10px] text-red-500/70 mt-0.5">Need Improvement</span>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-ink-500 text-xs">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
