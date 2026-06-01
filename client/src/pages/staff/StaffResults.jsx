import { useState, useEffect } from 'react'
import { testService } from '../../services/api'
import { BarChart3, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const getPct = (r) => {
  if (r.percentage != null) return Math.round(r.percentage)
  if (r.totalMarks > 0) return Math.round((r.score / r.totalMarks) * 100)
  return r.score ?? 0
}
const PASS_THRESHOLD = 50

export default function StaffResults() {
  const [tests, setTests] = useState([])
  const [selected, setSelected] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  // Load all tests for dropdown
  useEffect(() => {
    testService.getAll()
      .then(res => setTests(Array.isArray(res?.data) ? res.data : res.data?.data || []))
      .catch(() => toast.error('Failed to load tests'))
  }, [])

  // Load results when a test is selected
  useEffect(() => {
    if (!selected) { 
      setResults([]) 
      return 
    }
    setLoading(true)
    testService.getResults(selected)
      .then(res => {
        const arr = Array.isArray(res.data) ? res.data : res.data?.data || []
        setResults(arr)
      })
      .catch(() => toast.error('Failed to load results'))
      .finally(() => setLoading(false))
  }, [selected])

  const avg = results.length
    ? Math.round(results.reduce((a, r) => a + (r.score || 0), 0) / results.length)
    : null

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="page-title">Results</h1>

      {/* Test selection */}
      <div>
        <label className="label">Select Test</label>
        <select
          className="input max-w-sm"
          value={selected}
          onChange={e => setSelected(e.target.value)}
        >
          <option value="">— Choose a test —</option>
          {Array.isArray(tests) && tests.map(t => (
            <option key={t._id} value={t._id}>{t.title}</option>
          ))}
        </select>
      </div>

      {/* Stats and table */}
      {selected && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card">
              <p className="text-ink-500 text-xs">Submissions</p>
              <p className="font-display font-700 text-2xl text-ink-50">{results.length}</p>
            </div>
            <div className="stat-card">
              <p className="text-ink-500 text-xs">Average Score</p>
              <p className="font-display font-700 text-2xl text-ink-50">{avg !== null ? `${avg}%` : '—'}</p>
            </div>
            <div className="stat-card">
              <p className="text-ink-500 text-xs">Pass Rate (≥50%)</p>
              <p className="font-display font-700 text-2xl text-ink-50">
                {results.length
                  ? `${Math.round((results.filter(r => getPct(r) >= PASS_THRESHOLD).length / results.length) * 100)}%`
                  : '—'}
              </p>
            </div>
          </div>

          <div className="card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-ink-500 text-sm">Loading…</div>
            ) : !Array.isArray(results) || results.length === 0 ? (
              <div className="p-12 text-center">
                <BarChart3 size={32} className="text-ink-700 mx-auto mb-3" />
                <p className="text-ink-500 text-sm">No submissions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="border-b border-ink-800">
                      <th className="text-left px-5 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider">Student</th>
                      <th className="text-left px-5 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider">Score</th>
                      <th className="text-left px-5 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider hidden sm:table-cell">Progress</th>
                      <th className="text-left px-5 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(results) && results.map((r, i) => {
                      const pct = getPct(r)
                      const passed = pct >= PASS_THRESHOLD
                      return (
                        <tr key={r._id || i} className="table-row">
                          <td className="px-5 py-3 text-ink-200 max-w-[140px] truncate">{r.student?.name || '—'}</td>
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
        </>
      )}
    </div>
  )
}