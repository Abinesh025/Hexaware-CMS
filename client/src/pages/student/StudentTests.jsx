import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { studentService } from '../../services/api'
import { getSocket } from '../../services/socket'
import { useAuth } from '../../context/AuthContext'
import { FileText, Clock, Play, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { DEPART_CHECKER } from '../../utils/deptChecker'

export default function StudentTests() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [departmentFilter, setDepartmentFilter] = useState('')

  useEffect(() => {
    const fetchItems = () => {
      setLoading(true)
      const params = {}
      if (departmentFilter) params.department = departmentFilter

      studentService.getTests(params)
        .then(res => setTests(res.data || []))
        .catch(() => toast.error('Failed to load tests'))
        .finally(() => setLoading(false))
    }
    fetchItems()
    const socket = getSocket(token)
    const handleDataChanged = (type) => { if (type === 'test') fetchItems() }
    socket.on('data_changed', handleDataChanged)
    return () => socket.off('data_changed', handleDataChanged)
  }, [token, departmentFilter])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-ink-400 hover:text-lime-300 transition-colors mb-2 text-sm font-500">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="page-title mb-0">Tests</h1>
        <div className="w-full sm:w-48">
          <select 
            className="input w-full"
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
          >
            <option value="">My Department's Tests</option>
            {Object.keys(DEPART_CHECKER).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse h-20" />
          ))}
        </div>
      ) : tests.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={32} className="text-ink-700 mx-auto mb-3" />
          <p className="text-ink-500 text-sm">No tests available yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map(test => (
            <div key={test._id} className="card p-5 flex items-center gap-4 hover:border-ink-700 transition-all">
              <div className="w-10 h-10 bg-ink-800 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-ink-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-ink-100 font-500 text-sm">{test.title}</h3>
                  {test.department && (
                    <span className="text-[10px] uppercase font-600 bg-ink-800 text-ink-400 px-1.5 py-0.5 rounded">
                      {test.department}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-500">
                  <span className="flex items-center gap-1"><Clock size={11} /> {test.duration || 30} min</span>
                  <span>{test.questions?.length || 0} questions</span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/student/test/${test._id}`)}
                className="btn-primary py-2 px-4 text-xs"
              >
                <Play size={13} /> Start
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
