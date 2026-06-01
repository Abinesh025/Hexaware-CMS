import api from '../../services/api'
import { getSocket } from '../../services/socket'
import { useAuth } from '../../context/AuthContext'
import { Pencil, Trash2, Plus, Download, Eye, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import MaterialViewer from '../../components/MaterialViewer' // Added missing import for useState and useEffect

const empty = { title: '', description: '', subject: '', department: '', unit: '', topic: '', fileType: 'pdf' }

export default function AdminMaterials() {
  const { token } = useAuth()
  const [materials, setMaterials] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(empty)
  const [search, setSearch]     = useState('')
  const [file, setFile]         = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState(null)
    
  const handleDownload = async (material) => {
    if (!material?._id) return
    try {
      toast.loading('Starting download...', { id: 'dl' })
      // Use api instance so x-admin-token header is sent automatically
      const response = await api.get(`/api/admin/materials/download/${material._id}`, {
        responseType: 'blob',
      })
      const blob = new Blob([response.data])
      const objectUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      // Pull filename from Content-Disposition if available
      const cd = response.headers['content-disposition'] || ''
      const match = cd.match(/filename="?([^"]+)"?/)
      link.download = match ? match[1] : (material.title || 'download')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(objectUrl)
      toast.success('Download complete', { id: 'dl' })
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Download failed', { id: 'dl' })
    }
  }
    
  const fetch = () => {
    setLoading(true)
    api.get('/api/admin/materials')
      .then(r => setMaterials(r.data.data))
      .catch(err => toast.error(err.response?.data?.message || 'Failed to fetch materials'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { 
    fetch() 
    const socket = getSocket(token);
    const handleDataChanged = (type) => { if (type === 'material') fetch() }
    socket.on('data_changed', handleDataChanged);
    return () => socket.off('data_changed', handleDataChanged);
  }, [token])

  const openAdd  = () => { setEditing(null); setForm(empty); setFile(null); setShowModal(true) }
  const openEdit = m  => { 
    setEditing(m._id); 
    setForm({ title: m.title, description: m.description, subject: m.subject, department: m.department || '', unit: m.unit, topic: m.topic, fileType: m.fileType }); 
    setFile(null);
    setShowModal(true) 
  }

  const handleSave = async () => {
    if (!editing) {
      // New upload: all fields required
      if (!form.title || !form.subject || !form.department || !form.unit || !form.topic) {
        return toast.error('Please fill required fields (title, subject, department, unit, topic)');
      }
    } else {
      // Edit: only non-file fields required
      if (!form.subject || !form.department || !form.topic) {
        return toast.error('Please fill subject, department and topic');
      }
    }
    setSubmitting(true)

    try {
      if (editing) {
        await api.put(`/api/admin/materials/${editing}`, form)
        toast.success('Material updated')
      } else {
        if (!file) return toast.error('File is required for new material')
        
        const fd = new FormData()
        Object.keys(form).forEach(k => fd.append(k, form[k]))
        fd.append('file', file)
        
        await api.post('/api/admin/materials/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Material uploaded successfully')
      }
      setShowModal(false)
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this material?')) return
    try {
      await api.delete(`/api/admin/materials/${id}`)
      toast.success('Material deleted')
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    }
  }

  const filtered = materials.filter(m =>
    m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.subject?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Link to="/admin" className="inline-flex items-center gap-2 text-ink-400 hover:text-sky-400 transition-colors mb-2 text-sm font-500">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-ink-100">Materials</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm bg-sky-500 hover:bg-sky-400">
          <Plus size={15} /> Add Material
        </button>
      </div>

      <div className="bg-ink-900 border border-ink-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-ink-800">
          <input className="input w-full sm:w-64 text-sm" placeholder="Search materials..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <p className="text-ink-500 text-sm p-4">Loading...</p>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="text-ink-500 text-xs uppercase border-b border-ink-800">
              <tr>
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left">Subject & Topic</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left sticky right-0 bg-ink-900 border-l border-ink-800 z-10 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.5)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m._id} className="border-t border-ink-800 hover:bg-ink-800/40">
                  <td className="px-5 py-3">
                    <p className="text-ink-100 font-medium">{m.title}</p>
                    <p className="text-ink-500 text-xs truncate max-w-xs">{m.description || 'No description'}</p>
                  </td>
                  <td className="px-5 py-3 text-ink-300">
                    <span className="block">{m.subject} - {m.unit}</span>
                    <span className="text-xs text-ink-500">{m.topic}</span>
                  </td>
                  <td className="px-5 py-3 text-ink-300">
                    <span className="badge tag-lime text-xs">{m.fileType?.toUpperCase()}</span>
                    {m.fileUrl && (
                      <span className="ml-1 text-[10px] text-ink-500 font-mono uppercase">
                        {m.fileUrl.split('.').pop()?.split('?')[0]?.toUpperCase() || ''}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 sticky right-0 bg-ink-900 border-l border-ink-800 z-10 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.5)]">
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedMaterial(m)} className="btn-ghost p-1.5 hover:text-lime-300">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => handleDownload(m)} className="btn-ghost p-1.5 hover:text-sky-400">
                        <Download size={14} />
                      </button>
                      <button onClick={() => openEdit(m)} className="btn-ghost p-1.5"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(m._id)} className="btn-ghost p-1.5 text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-ink-500">No materials found</td></tr>
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {selectedMaterial && (
        <MaterialViewer 
          material={selectedMaterial} 
          onClose={() => setSelectedMaterial(null)} 
        />
      )}

      {showModal && (
        <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-ink-900 border border-ink-800 rounded-2xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-ink-100 font-semibold mb-4">{editing ? 'Edit Material' : 'Add Material'}</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {!editing && (
                <div className="col-span-2">
                  <label className="text-ink-500 text-xs mb-1 block">Title *</label>
                  <input className="input w-full text-sm" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
              )}
              <div className="col-span-2">
                <label className="text-ink-500 text-xs mb-1 block">Description</label>
                <input className="input w-full text-sm" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="text-ink-500 text-xs mb-1 block">Subject *</label>
                <input className="input w-full text-sm" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div>
                <label className="text-ink-500 text-xs mb-1 block">Department *</label>
                <input className="input w-full text-sm" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
              </div>
              {!editing && (
                <div>
                  <label className="text-ink-500 text-xs mb-1 block">Unit *</label>
                  <input className="input w-full text-sm" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
                </div>
              )}
              <div>
                <label className="text-ink-500 text-xs mb-1 block">Topic *</label>
                <input className="input w-full text-sm" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} />
              </div>
              <div>
                <label className="text-ink-500 text-xs mb-1 block">File Type *</label>
                <select className="input w-full text-sm" value={form.fileType} onChange={e => setForm({ ...form, fileType: e.target.value })}>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="link">Link</option>
                </select>
              </div>
              {!editing && (
                <div className="col-span-2">
                  <label className="text-ink-500 text-xs mb-1 block">File Upload *</label>
                  <input type="file" className="text-sm text-ink-100 placeholder:text-ink-600 block w-full border border-ink-800 rounded-lg p-2" onChange={e => setFile(e.target.files[0])} />
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button onClick={() => setShowModal(false)} className="btn-ghost text-sm">Cancel</button>
              <button onClick={handleSave} disabled={submitting} className="btn-primary text-sm">{submitting ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}