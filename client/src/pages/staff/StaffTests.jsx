import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { FileText, Plus, Trash2, X, PlusCircle, MinusCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { DEPART_CHECKER } from '../../utils/deptChecker'

const emptyQuestion = () => ({ question: '', options: ['', '', '', ''], correctAnswer: 0 })

export default function StaffTests() {
  const { user } = useAuth()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', subject: ' ', department: user?.department || '', duration: 30, questions: [emptyQuestion()] })

  useEffect(() => {
    if (user?.department) {
      setForm(f => ({ ...f, department: user.department }))
    }
  }, [user])

  const load = () => {
    setLoading(true)
    api.get('/api/staff/tests')
      .then(res => setTests(res.data?.data || []))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load tests'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

    const validateForm = (f) => {
    if (!f.title || !f.subject || !f.duration) return false
    if (!Array.isArray(f.questions) || f.questions.length === 0) return false
    for (let q of f.questions) {
      if (!q.question || !q.options || q.options.length < 2 || q.correctAnswer === undefined) return false
    }
    return true
  }

  const addQuestion = () => setForm(f => ({ ...f, questions: [...f.questions, emptyQuestion()] }))
  const removeQuestion = (i) => setForm(f => ({ ...f, questions: f.questions.filter((_, j) => j !== i) }))

  const updateQ = (i, field, val) => setForm(f => {
    const qs = [...f.questions]
    qs[i] = { ...qs[i], [field]: val }
    return { ...f, questions: qs }
  })

  const updateOption = (qi, oi, val) => setForm(f => {
    const qs = [...f.questions]
    const opts = [...qs[qi].options]
    opts[oi] = val
    qs[qi] = { ...qs[qi], options: opts }
    return { ...f, questions: qs }
  })

const handleSave = async (e) => {
  console.log(form)
  e.preventDefault()
  if (!validateForm(form)) {
    toast.error('Please fill all required fields correctly!')
    return
  }

  setSaving(true)
  try {
    const res = await api.post('/api/tests', form)
    setTests(t => [res.data?.data || res.data, ...t])
    setForm({ title: '', subject: '', department: user?.department || '', duration: 30, questions: [emptyQuestion()] })
    setShowForm(false)
    
    toast.success('Test created!')
  } catch (err) {
    console.error(err)
    toast.error(err.response?.data?.message || 'Failed to create test')
  } finally {
    setSaving(false)
  }
}

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this test?')) return
    try {
      await api.delete(`/api/staff/tests/${id}`)
      setTests(t => t.filter(x => x._id !== id))
      toast.success('Test deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Link to="/staff" className="inline-flex items-center gap-2 text-ink-400 hover:text-lime-300 transition-colors mb-2 text-sm font-500">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="page-title">Tests</h1>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary">
          {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Create Test</>}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 animate-fade-up space-y-5">
          <h2 className="section-title">New Test</h2>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Test Title</label>
                <input className="input" placeholder="e.g. Chapter 3 Quiz" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Department</label>
                <input
                  type="text"
                  className="input bg-ink-900 border-ink-800 text-ink-400 cursor-not-allowed"
                  value={form.department || user?.department || ''}
                  disabled
                  readOnly
                />
              </div>
              <div>
                <label className="label">Subject</label>
                <input className="input" placeholder="e.g. Software Engineering" value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Duration (minutes)</label>
                <input type="number" className="input" min="5" max="180" value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {form.questions.map((q, qi) => (
                <div key={qi} className="bg-ink-800/50 border border-ink-700 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-400 text-xs font-display font-500 uppercase tracking-wider">Question {qi + 1}</span>
                    {form.questions.length > 1 && (
                      <button type="button" onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-300">
                        <MinusCircle size={16} />
                      </button>
                    )}
                  </div>
                  <input className="input" placeholder="Question text…" value={q.question}
                    onChange={e => updateQ(qi, 'question', e.target.value)} required />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qi}`}
                          checked={q.correctAnswer === oi}
                          onChange={() => updateQ(qi, 'correctAnswer', oi)}
                          className="accent-lime-300"
                        />
                        <input className="input text-sm py-2" placeholder={`Option ${oi + 1}`}
                          value={opt} onChange={e => updateOption(qi, oi, e.target.value)} />
                      </div>
                    ))}
                  </div>
                  <p className="text-ink-600 text-xs">● Select the correct answer</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button type="button" onClick={addQuestion} className="btn-outline">
                <PlusCircle size={15} /> Add Question
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving…' : 'Create Test'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tests list */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-ink-500 text-sm">Loading…</div>
        ) : tests.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={32} className="text-ink-700 mx-auto mb-3" />
            <p className="text-ink-500 text-sm">No tests yet. Create your first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-ink-800">
                  <th className="text-left px-5 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider">Title</th>
                  <th className="text-left px-5 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider hidden sm:table-cell">Department</th>
                  <th className="text-left px-5 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider">Questions</th>
                  <th className="text-left px-5 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider hidden sm:table-cell">Duration</th>
                  <th className="text-left px-5 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider hidden sm:table-cell">Created</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {tests.map((t, i) => (
                  <tr key={t._id || i} className="table-row">
                    <td className="px-5 py-3 text-ink-200 font-500 max-w-[140px] truncate">{t.title}</td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      {t.department
                        ? <span className="tag-sky badge">{t.department}</span>
                        : <span className="text-ink-600 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3"><span className="tag-sky badge">{t.questions?.length || 0} Qs</span></td>
                    <td className="px-5 py-3 text-ink-400 hidden sm:table-cell">{t.duration || 30} min</td>
                    <td className="px-5 py-3 text-ink-500 text-xs hidden sm:table-cell">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => handleDelete(t._id)} className="btn-ghost py-1 px-2 text-red-400 hover:text-red-300 hover:bg-red-400/10">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
