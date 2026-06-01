import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { studentService, testService } from '../../services/api'
import { CheckCircle, ChevronRight, ChevronLeft, X, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TakeTest() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!testId) return
    setLoading(true)
    studentService.getTest(testId)
      .then(res => setTest(res.data))
      .catch(() => {
        toast.error('Failed to load test')
        navigate('/student/tests')
      })
      .finally(() => setLoading(false))
  }, [testId, navigate])

  const handleSubmit = async () => {
    if (!test) return
    const questions = test.questions || []
    const orderedAnswers = questions.map((_, i) => (answers[i] !== undefined ? answers[i] : -1))
    setSubmitting(true)
    try {
      const res = await testService.submit(test._id, orderedAnswers)
      toast.success(`Test submitted! Score: ${res.data?.score ?? '—'}%`)
      navigate('/student/results')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="card p-12 animate-pulse h-48" />
      </div>
    )
  }

  if (!test) return null

  const questions = test.questions || []
  const q = questions[current]
  const progress = questions.length ? ((current + 1) / questions.length) * 100 : 0

  if (!questions.length) {
    return (
      <div className="p-6 text-center max-w-2xl mx-auto">
        <p className="text-ink-500">This test has no questions.</p>
        <Link to="/student/tests" className="btn-ghost mt-4 inline-block">Back to Tests</Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link
        to="/student/tests"
        className="inline-flex items-center gap-2 text-ink-400 hover:text-lime-300 transition-colors mb-4 text-sm font-500"
      >
        <ArrowLeft size={16} /> Back to Tests
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-600 text-ink-100">{test.title}</h2>
          <p className="text-ink-500 text-sm">{current + 1} / {questions.length}</p>
        </div>
        <button onClick={() => navigate('/student/tests')} className="btn-ghost p-2" type="button">
          <X size={18} />
        </button>
      </div>

      <div className="h-1.5 bg-ink-800 rounded-full mb-8">
        <div
          className="h-full bg-lime-300 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="card p-6 mb-6">
        <p className="text-ink-100 font-500 mb-6">{q.question}</p>
        <div className="space-y-3">
          {(q.options || []).map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setAnswers(a => ({ ...a, [current]: i }))}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                answers[current] === i
                  ? 'border-lime-300 bg-lime-300/10 text-lime-300'
                  : 'border-ink-700 text-ink-300 hover:border-ink-500'
              }`}
            >
              <span className="font-mono text-xs mr-3 opacity-50">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrent(c => c - 1)}
          disabled={current === 0}
          className="btn-outline disabled:opacity-30"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {current < questions.length - 1 ? (
          <button type="button" onClick={() => setCurrent(c => c + 1)} className="btn-primary">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary">
            <CheckCircle size={16} />
            {submitting ? 'Submitting…' : 'Submit Test'}
          </button>
        )}
      </div>
    </div>
  )
}
