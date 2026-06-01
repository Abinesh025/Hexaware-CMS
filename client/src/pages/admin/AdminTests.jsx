import { useEffect, useState } from 'react'
import api from '../../services/api'
import { getSocket } from '../../services/socket'
import { useAuth } from '../../context/AuthContext'
import {
  FileText, Plus, Trash2, Pencil, X, Check,
  ChevronDown, ChevronUp, Users, Clock, Hash, Search, ArrowLeft
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { DEPART_CHECKER } from '../../utils/deptChecker'

const TABS = ['All Tests', 'Create Test', 'Student Results']

const EMPTY_FORM = {
  title: '',
  subject: '',
  duration: '',
  assignedTo: '',
  questions: [{ question: '', options: ['', '', '', ''], answer: 0 }],
}

export default function AdminTest() {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const [tests, setTests] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [resultsLoading, setResultsLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [expandedTest, setExpandedTest] = useState(null)
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [resultSearch, setResultSearch] = useState('')
  const [resultDeptFilter, setResultDeptFilter] = useState('')
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [toast, setToast] = useState(null)

  // ── fetch tests ──────────────────────────────────────────────
  useEffect(() => {
    const fetchTests = () => {
      setLoading(true)
      api.get('/api/admin/tests')
        .then(res => setTests(res.data?.data ?? []))
        .catch(err => showToast(err.response?.data?.message || 'Failed to fetch tests', 'error'))
        .finally(() => setLoading(false))
    }
    fetchTests()
    const socket = getSocket(token)
    const handleDataChanged = (type) => { if (type === 'test') fetchTests() }
    socket.on('data_changed', handleDataChanged)
    return () => socket.off('data_changed', handleDataChanged)
  }, [token])

  // ── fetch results ─────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 2) return
    const fetchResults = () => {
      setResultsLoading(true)
      api.get('/api/admin/results')
        .then(res => setResults(res.data.data ?? []))
        .catch(err => showToast(err.response?.data?.message || 'Failed to fetch results', 'error'))
        .finally(() => setResultsLoading(false))
    }
    fetchResults()
    const socket = getSocket(token)
    const handleDataChanged = (type) => { if (type === 'result') fetchResults() }
    socket.on('data_changed', handleDataChanged)
    return () => socket.off('data_changed', handleDataChanged)
  }, [activeTab, token])

  // ── toast helper ──────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── form helpers ──────────────────────────────────────────────
  const updateQuestion = (qi, field, value) => {
    setForm(f => {
      const qs = [...f.questions]
      if (field === 'question') qs[qi] = { ...qs[qi], question: value }
      else if (field === 'answer') qs[qi] = { ...qs[qi], answer: Number(value) }
      return { ...f, questions: qs }
    })
  }

  const updateOption = (qi, oi, value) => {
    setForm(f => {
      const qs = [...f.questions]
      const opts = [...qs[qi].options]
      opts[oi] = value
      qs[qi] = { ...qs[qi], options: opts }
      return { ...f, questions: qs }
    })
  }

  const addQuestion = () =>
    setForm(f => ({
      ...f,
      questions: [...f.questions, { question: '', options: ['', '', '', ''], answer: 0 }],
    }))

  const removeQuestion = (qi) =>
    setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== qi) }))

  // ── submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title || !form.subject) return showToast('Title and subject are required', 'error')
    setSubmitting(true)
    try {
      if (editId) {
        const res = await api.put(`/api/admin/tests/${editId}`, form)
        setTests(t => t.map(x => x._id === editId ? res.data.data : x))
        showToast('Test updated')
        setEditId(null)
      } else {
        const res = await api.post('/api/admin/tests', form)
        setTests(t => [res.data.data, ...t])
        showToast('Test created')
      }
      setForm(EMPTY_FORM)
      setActiveTab(0)
    } catch (err) {
      showToast(err.response?.data?.message || 'Something went wrong', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (test) => {
    setForm({
      title: test.title,
      subject: test.subject,
      duration: test.duration,
      assignedTo: test.assignedTo ?? '',
      questions: test.questions ?? [{ question: '', options: ['', '', '', ''], answer: 0 }],
    })
    setEditId(test._id)
    setActiveTab(1)
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/api/admin/tests/${deleteId}`)
      setTests(t => t.filter(x => x._id !== deleteId))
      showToast('Test deleted')
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error')
    } finally {
      setDeleteId(null)
    }
  }

  // ── filtered tests ────────────────────────────────────────────
  const filtered = tests.filter(t =>
    ((t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.subject?.toLowerCase().includes(search.toLowerCase()))) &&
    (departmentFilter === '' || t.assignedTo === departmentFilter || String(t.assignedTo ?? '').includes(departmentFilter))
  )

  const filteredResults = results.filter(r => {
    const dept = (r.student?.department ?? '').toLowerCase()
    const matchSearch =
      (r.studentName ?? r.student?.name ?? r.student ?? '').toLowerCase().includes(resultSearch.toLowerCase()) ||
      (r.testTitle ?? r.test?.title ?? r.test ?? '').toLowerCase().includes(resultSearch.toLowerCase()) ||
      dept.includes(resultSearch.toLowerCase()) ||
      (r.student?.batch ?? '').toLowerCase().includes(resultSearch.toLowerCase())
    const matchDept = resultDeptFilter === '' || dept === resultDeptFilter.toLowerCase()
    return matchSearch && matchDept
  })

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="p-6 relative max-w-7xl mx-auto">
      <Link to="/admin" className="inline-flex items-center gap-2 text-ink-400 hover:text-sky-400 transition-colors mb-4 mt-2 text-sm font-500">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg
          ${toast.type === 'error' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
            : 'bg-lime-500/20 text-lime-400 border border-lime-500/30'}`}>
          {toast.msg}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="bg-ink-900 border border-ink-800 rounded-xl p-6 w-80">
            <p className="text-ink-100 font-medium mb-1">Delete this test?</p>
            <p className="text-ink-500 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2 rounded-lg text-sm border border-ink-700 text-ink-400 hover:bg-ink-800 transition">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-2 rounded-lg text-sm bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <h1 className="text-xl font-semibold text-ink-100 mb-6">Tests</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-ink-900 border border-ink-800 rounded-xl p-1 mb-6 overflow-x-auto max-w-full">
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap
              ${activeTab === i ? 'bg-ink-800 text-ink-100' : 'text-ink-500 hover:text-ink-300'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── TAB 0 : All Tests ─────────────────────────────────── */}
      {activeTab === 0 && (
        <div>
          {/* search + add */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[160px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search tests…"
                className="w-full pl-8 pr-3 py-2 bg-ink-900 border border-ink-800 rounded-lg text-sm
                  text-ink-100 placeholder-ink-600 focus:outline-none focus:border-ink-600"
              />
            </div>
            <select 
              className="px-3 py-2 bg-ink-900 border border-ink-800 rounded-lg text-sm text-ink-100 focus:outline-none focus:border-ink-600"
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {Object.keys(DEPART_CHECKER).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <button onClick={() => { setEditId(null); setForm(EMPTY_FORM); setActiveTab(1) }}
              className="flex items-center gap-2 px-4 py-2 bg-lime-400/10 border border-lime-400/30
                text-lime-400 rounded-lg text-sm hover:bg-lime-400/20 transition whitespace-nowrap">
              <Plus size={14} /> New Test
            </button>
          </div>

          {loading ? (
            <p className="text-ink-500 text-sm">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="bg-ink-900 border border-ink-800 rounded-xl p-8 text-center">
              <FileText size={28} className="text-ink-700 mx-auto mb-2" />
              <p className="text-ink-500 text-sm">No tests found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map(test => (
                <div key={test._id} className="bg-ink-900 border border-ink-800 rounded-xl overflow-hidden">
                  {/* row */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-sky-300 shrink-0" />
                      <div>
                        <p className="text-ink-100 text-sm font-medium">{test.title}</p>
                        <p className="text-ink-500 text-xs">{test.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* meta pills */}
                      <div className="hidden sm:flex items-center gap-3 text-xs text-ink-500">
                        {test.department && (
                          <span className="px-2 py-0.5 rounded-md bg-violet-400/10 text-violet-300 border border-violet-400/20 text-xs font-medium">
                            {test.department}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Hash size={11} className="text-violet-400" />
                          {test.questions?.length ?? 0} Qs
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-sky-400" />
                          {test.duration ?? '—'} min
                        </span>
                        {test.assignedTo && (
                          <span className="flex items-center gap-1">
                            <Users size={11} className="text-sky-400" />
                            {test.assignedTo}
                          </span>
                        )}
                      </div>
                      {/* actions */}
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(test)}
                          className="p-1.5 rounded-lg text-ink-500 hover:text-sky-400 hover:bg-ink-800 transition">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteId(test._id)}
                          className="p-1.5 rounded-lg text-ink-500 hover:text-sky-400 hover:bg-ink-800 transition">
                          <Trash2 size={14} />
                        </button>
                        <button onClick={() => setExpandedTest(expandedTest === test._id ? null : test._id)}
                          className="p-1.5 rounded-lg text-ink-500 hover:text-ink-300 hover:bg-ink-800 transition">
                          {expandedTest === test._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* expanded questions preview */}
                  {expandedTest === test._id && (
                    <div className="border-t border-ink-800 px-4 pb-4 pt-3 flex flex-col gap-3">
                      {(test.questions ?? []).map((q, qi) => (
                        <div key={qi} className="bg-ink-950/50 border border-ink-800 rounded-lg p-3">
                          <p className="text-ink-300 text-xs font-medium mb-2">
                            Q{qi + 1}. {q.question}
                          </p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {q.options?.map((opt, oi) => (
                              <span key={oi}
                                className={`text-xs px-2 py-1 rounded-md
                                  ${oi === q.answer
                                    ? 'bg-lime-400/10 text-lime-400 border border-lime-400/30'
                                    : 'text-ink-500 border border-ink-800'}`}>
                                {String.fromCharCode(65 + oi)}. {opt}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 1 : Create / Edit Test ────────────────────────── */}
      {activeTab === 1 && (
        <div className="max-w-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-ink-100 text-sm font-medium">
              {editId ? 'Edit Test' : 'Create New Test'}
            </p>
            {editId && (
              <button onClick={() => { setEditId(null); setForm(EMPTY_FORM) }}
                className="flex items-center gap-1 text-xs text-ink-500 hover:text-ink-300 transition">
                <X size={12} /> Clear
              </button>
            )}
          </div>

          {/* meta fields */}
          <div className="bg-ink-900 border border-ink-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Title', key: 'title', placeholder: 'e.g. Chapter 3 Quiz' },
              { label: 'Subject', key: 'subject', placeholder: 'e.g. Mathematics' },
              { label: 'Duration (min)', key: 'duration', placeholder: 'e.g. 30' },
              { label: 'Assign To (batch/class)', key: 'assignedTo', placeholder: 'e.g. Batch A' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-ink-500 text-xs mb-1">{label}</label>
                <input
                  value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 bg-ink-950 border border-ink-800 rounded-lg text-sm
                    text-ink-100 placeholder-ink-700 focus:outline-none focus:border-ink-600"
                />
              </div>
            ))}
          </div>

          {/* questions */}
          <div className="flex flex-col gap-3">
            {form.questions.map((q, qi) => (
              <div key={qi} className="bg-ink-900 border border-ink-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-ink-500 font-medium">Question {qi + 1}</span>
                  {form.questions.length > 1 && (
                    <button onClick={() => removeQuestion(qi)}
                      className="text-ink-600 hover:text-sky-400 transition">
                      <X size={13} />
                    </button>
                  )}
                </div>
                <input
                  value={q.question}
                  onChange={e => updateQuestion(qi, 'question', e.target.value)}
                  placeholder="Enter question…"
                  className="w-full px-3 py-2 bg-ink-950 border border-ink-800 rounded-lg text-sm
                    text-ink-100 placeholder-ink-700 focus:outline-none focus:border-ink-600 mb-3"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-600">
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      <input
                        value={opt}
                        onChange={e => updateOption(qi, oi, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                        className="w-full pl-7 pr-3 py-2 bg-ink-950 border border-ink-800 rounded-lg text-sm
                          text-ink-100 placeholder-ink-700 focus:outline-none focus:border-ink-600"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-500">Correct answer:</span>
                  <div className="flex gap-1">
                    {q.options.map((_, oi) => (
                      <button key={oi}
                        onClick={() => updateQuestion(qi, 'answer', oi)}
                        className={`w-7 h-7 rounded-lg text-xs font-medium transition
                          ${q.answer === oi
                            ? 'bg-lime-400/20 text-lime-400 border border-lime-400/40'
                            : 'text-ink-600 border border-ink-800 hover:border-ink-600'}`}>
                        {String.fromCharCode(65 + oi)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* add question + submit */}
          <div className="flex gap-3">
            <button onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 border border-ink-700 text-ink-400
                rounded-lg text-sm hover:bg-ink-800 transition">
              <Plus size={13} /> Add Question
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-lime-400/10 border border-lime-400/30
                text-lime-400 rounded-lg text-sm hover:bg-lime-400/20 transition disabled:opacity-50">
              <Check size={13} />
              {submitting ? 'Saving…' : editId ? 'Update Test' : 'Create Test'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 2 : Student Results ───────────────────────────── */}
      {activeTab === 2 && (
        <div>
          {resultsLoading ? (
            <p className="text-ink-500 text-sm">Loading…</p>
          ) : results.length === 0 ? (
            <div className="bg-ink-900 border border-ink-800 rounded-xl p-8 text-center">
              <BarChart3Icon size={28} className="text-ink-700 mx-auto mb-2" />
              <p className="text-ink-500 text-sm">No results yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3 mb-2">
                <div className="relative flex-1 max-w-xs">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                  <input
                    value={resultSearch} onChange={e => setResultSearch(e.target.value)}
                    placeholder="Search students, tests…"
                    className="w-full pl-8 pr-3 py-2 bg-ink-900 border border-ink-800 rounded-xl text-sm
                      text-ink-100 placeholder-ink-600 focus:outline-none focus:border-ink-600"
                  />
                </div>
                <select
                  value={resultDeptFilter}
                  onChange={e => setResultDeptFilter(e.target.value)}
                  className="px-3 py-2 bg-ink-900 border border-ink-800 rounded-xl text-sm text-ink-100 focus:outline-none focus:border-ink-600"
                >
                  <option value="">All Departments</option>
                  {Object.keys(DEPART_CHECKER).map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="overflow-x-auto bg-ink-900 border border-ink-800 rounded-xl">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-ink-800 bg-ink-900">
                      {['Student', 'Dept/Batch', 'Test', 'Score', 'Total', '%', 'Date'].map(h => (
                        <th key={h} className="text-left text-xs text-ink-500 font-medium py-3 px-4 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((r, i) => {
                      const pct = r.total ? Math.round((r.score / r.total) * 100) : 0
                      return (
                        <tr key={r._id ?? i} className="border-b border-ink-800/50 hover:bg-ink-800/40 transition">
                          <td className="py-3 px-4 text-ink-200 max-w-[120px] truncate">{r.studentName ?? r.student?.name ?? r.student ?? '—'}</td>
                          <td className="py-3 px-4 text-ink-400 text-xs whitespace-nowrap">
                            {r.student?.department
                              ? <span className="px-2 py-0.5 rounded-md bg-violet-400/10 text-violet-300 border border-violet-400/20">{r.student.department}</span>
                              : '—'}
                            {r.student?.batch ? ` (${r.student.batch})` : ''}
                          </td>
                          <td className="py-3 px-4 text-ink-400 max-w-[120px] truncate">{r.testTitle ?? r.test?.title ?? r.test ?? '—'}</td>
                          <td className="py-3 px-4 text-sky-400 font-medium">{r.score}</td>
                          <td className="py-3 px-4 text-ink-500">{r.total}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1.5 bg-ink-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-lime-400"
                                  style={{ width: `${pct}%` }} />
                              </div>
                              <span className={`text-xs font-medium whitespace-nowrap
                                ${pct >= 75 ? 'text-lime-400' : pct >= 50 ? 'text-sky-300' : 'text-sky-400'}`}>
                                {pct}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-ink-600 text-xs whitespace-nowrap">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      )
                    })}
                    {filteredResults.length === 0 && (
                      <tr><td colSpan={7} className="px-5 py-8 text-center text-ink-500">No results found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// fallback icon ref used in results empty state
function BarChart3Icon(props) {
  const { BarChart3 } = require('lucide-react')
  return <BarChart3 {...props} />
}