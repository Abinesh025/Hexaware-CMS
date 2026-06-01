import { useState, useEffect, useRef } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { BookOpen, Upload, Trash2, Video, Mic, File, Plus, X, Play, Eye, Download, Pause, ArrowLeft, Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { DEPART_CHECKER } from '../../utils/deptChecker'

const typeConfig = {
  notes: { icon: BookOpen, color: 'tag-lime' },
  video: { icon: Video, color: 'tag-sky' },
  voice: { icon: Mic, color: 'tag-amber' },
  file: { icon: File, color: 'tag-red' },
}
import MaterialViewer from '../../components/MaterialViewer'

export default function StaffMaterials() {
  const { user } = useAuth()
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [filterDept, setFilterDept] = useState('')
  const [filterSem, setFilterSem] = useState('')
  const [filterCourse, setFilterCourse] = useState('')
  const [form, setForm] = useState({
    title: '',
    type: 'notes',
    subject: '',
    department: user?.department || '',
    unit: '',
    semester: '',
    course: '',
  })

  useEffect(() => {
    if (user?.department) {
      setForm(p => ({ ...p, department: user.department }))
    }
  }, [user])
  const [file, setFile] = useState(null)
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const fileRef = useRef()
  // Load materials
  const loadMaterials = () => {
    setLoading(true)
    api.get('/api/staff/materials')
      .then(res => setMaterials(res.data?.data || []))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load materials'))
      .finally(() => setLoading(false))
  }

  useEffect(loadMaterials, [])

  // Upload or Edit material
  const handleUpload = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!editId) {
      // Upload mode: all fields required
      if (!form.title || !form.subject || !form.department || !form.unit || !form.type || !form.semester || !form.course) {
        return toast.error('Please fill all required fields (including Semester and Course)')
      }
    } else {
      // Edit mode: only updateable fields required
      if (!form.subject || !form.department || !form.type || !form.semester || !form.course) {
        return toast.error('Please fill subject, department, type, semester and course')
      }
    }

    if (!editId && !file) return toast.error('Please select a file')

    setUploading(true)
    setProgress(0)

    try {
      if (editId) {
        // Edit Mode uses PUT and expects JSON metadata
        const updateData = { ...form }
        const res = await api.put(`/api/staff/materials/${editId}`, updateData)
        setMaterials(prev => prev.map(m => m._id === editId ? res.data.data : m))
        toast.success('Material updated!')
      } else {
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => fd.append(k, v))
        fd.append('file', file)

        const res = await api.post('/api/materials/upload', fd, {
          onUploadProgress: (p) => setProgress(Math.round((p.loaded * 100) / p.total)),
        })

        setMaterials(prev => [res.data.data || res.data, ...prev])
        toast.success('Material uploaded!')
      }

      setForm({ title: '', type: 'notes', subject: '', department: user?.department || '', unit: '', semester: '', course: '' })
      setFile(null)
      setShowForm(false)
      setEditId(null)
      setProgress(0)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || (editId ? 'Update failed' : 'Upload failed'))
    } finally {
      setUploading(false)
    }
  }

  const handleEditClick = (material) => {
    setEditId(material._id)
    setForm({
      title: material.title || '',
      type: material.type || 'notes',
      subject: material.subject || '',
      department: material.department || '',
      unit: material.unit || '',
      semester: material.semester || '',
      course: material.course || ''
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Delete material
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return
    try {
      await api.delete(`/api/staff/materials/${id}`)
      setMaterials(m => m.filter(x => x._id !== id))
      toast.success('Deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const filteredMaterials = materials.filter(m => {
    if (filterDept && m.department !== filterDept) return false
    if (filterSem && m.semester !== Number(filterSem)) return false
    if (filterCourse && !m.course?.toLowerCase().includes(filterCourse.toLowerCase())) return false
    return true
  })
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Link to="/staff" className="inline-flex items-center gap-2 text-ink-400 hover:text-lime-300 transition-colors mb-2 text-sm font-500">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="page-title">Materials</h1>
        <button onClick={() => {
          setEditId(null)
          setForm({ title: '', type: 'notes', subject: '', department: user?.department || '', unit: '', semester: '', course: '' })
          setShowForm(s => !s)
        }} className="btn-primary whitespace-nowrap w-full sm:w-auto">
          {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Upload</>}
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <select 
            className="input w-full" 
            value={filterDept} 
            onChange={e => setFilterDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {Object.keys(DEPART_CHECKER).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        <div>
          <select 
            className="input w-full" 
            value={filterSem} 
            onChange={e => setFilterSem(e.target.value)}
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>
        <div>
          <input
            type="text"
            className="input w-full"
            placeholder="Search course..."
            value={filterCourse}
            onChange={e => setFilterCourse(e.target.value)}
          />
        </div>
      </div>

      {/* Upload/Edit form */}
      {showForm && (
        <div className="card p-6 animate-fade-up">
          <h2 className="section-title mb-4">{editId ? 'Edit Material Metadata' : 'Upload New Material'}</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!editId && (
                <div>
                  <label className="label">Title</label>
                  <input
                    className="input"
                    placeholder="Material title"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    required
                  />
                </div>
              )}
              <div className={editId ? 'sm:col-span-2' : ''}>
                <label className="label">Type</label>
                <select
                  className="input"
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                >
                  <option value="notes">Notes</option>
                  <option value="video">Video</option>
                  <option value="voice">Voice</option>
                  <option value="file">File</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Subject</label>
                <input
                  className="input"
                  placeholder="Subject"
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  required
                />
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
              {!editId && (
                <div>
                  <label className="label">Unit</label>
                  <input
                    className="input"
                    placeholder="Unit"
                    value={form.unit}
                    onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                    required
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Semester</label>
                <select
                  className="input"
                  value={form.semester}
                  onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}
                  required
                >
                  <option value="" disabled>Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Course Name / Code</label>
                <input
                  className="input"
                  placeholder="e.g. CS3001"
                  value={form.course}
                  onChange={e => setForm(p => ({ ...p, course: e.target.value }))}
                  required
                />
              </div>
            </div>

            {!editId && (
              <div>
                <label className="label">File</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border border-dashed border-ink-700 rounded-xl p-6 text-center cursor-pointer hover:border-lime-300/50 transition-colors"
                >
                  <Upload size={20} className="text-ink-500 mx-auto mb-2" />
                  {file ? (
                    <p className="text-ink-200 text-sm">{file.name}</p>
                  ) : (
                    <p className="text-ink-500 text-sm">Click to select file</p>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    onChange={e => setFile(e.target.files[0])}
                  />
                </div>

                {uploading && (
                  <div className="mt-2 w-full bg-ink-700 rounded-full h-2">
                    <div
                      className="bg-lime-400 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <button type="submit" disabled={uploading} className="btn-primary">
                {editId ? <><Pencil size={15} /> {uploading ? 'Updating…' : 'Save Changes'}</> : <><Upload size={15} /> {uploading ? 'Uploading…' : 'Upload Material'}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of materials */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-ink-500 text-sm">Loading…</div>
        ) : filteredMaterials.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen size={32} className="text-ink-700 mx-auto mb-3" />
            <p className="text-ink-500 text-sm">No materials uploaded yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-800">
                <th className="text-left px-5 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-5 py-3 text-ink-500 font-500 text-xs uppercase tracking-wider">Uploaded</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filteredMaterials) && filteredMaterials.map((m, i) => {
                const cfg = typeConfig[m.type] || typeConfig.file
                const Icon = cfg.icon
                return (
                  <tr key={m._id || i} className="table-row">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-ink-800 rounded-lg flex items-center justify-center">
                          <Icon size={13} className="text-ink-400" />
                        </div>
                        <div>
                          <p className="text-ink-200 font-500">{m.title}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {m.semester && (
                              <span className="text-[10px] bg-lime-400/10 text-lime-400 px-1.5 py-0.5 rounded font-500">
                                Sem {m.semester}
                              </span>
                            )}
                            {m.course && (
                              <span className="text-[10px] bg-sky-400/10 text-sky-400 px-1.5 py-0.5 rounded font-500">
                                {m.course}
                              </span>
                            )}
                            {m.subject && (
                              <span className="text-[10px] bg-ink-800 text-ink-400 px-1.5 py-0.5 rounded">
                                {m.subject}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${cfg.color}`}>{m.type}</span>
                      {m.fileUrl && (
                        <span className="ml-1 text-[10px] text-ink-500 font-mono uppercase">
                          {m.fileUrl.split('.').pop()?.split('?')[0]?.toUpperCase() || ''}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-ink-500 text-xs">
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedMaterial(m)}
                            className="btn-ghost py-1 px-2 text-sky-400 hover:text-sky-300 hover:bg-sky-400/10"
                            title="View"
                          >
                            {m.type === 'video' || m.type === 'voice' ? <Play size={14} /> : <Eye size={14} />} 
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditClick(m); }}
                            className="btn-ghost py-1 px-2 text-lime-400 hover:text-lime-300 hover:bg-lime-400/10"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(m._id)}
                            className="btn-ghost py-1 px-2 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Material Viewer Modal */}
      {selectedMaterial && (
        <MaterialViewer 
          material={selectedMaterial} 
          onClose={() => setSelectedMaterial(null)} 
        />
      )}
    </div>
  )
}