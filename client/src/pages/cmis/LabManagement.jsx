import { useEffect, useState } from 'react'
import { labsService, departmentService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Plus, Search, Pencil, Trash2, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'

const emptyForm = {
  labName: '',
  department: '',
  equipmentName: '',
  quantity: 1,
  condition: 'Working',
  purchaseDate: new Date().toISOString().split('T')[0],
  remarks: ''
}

const DEPT_MAP = {
  "Computer Science and Engineering": "CSE",
  "Computer Science and Business Systems": "CSBS",
  "Artificial Intelligence and Data Science": "AI&DS",
  "Information Technology": "IT",
  "Electronics and Communication Engineering": "ECE",
  "Electrical and Electronics Engineering": "EEE",
  "Mechanical Engineering": "Mechanical",
  "Civil Engineering": "Civil",
  "Biomedical Engineering": "BME",
  "Master of Business Administration": "MBA",
  "Master of Computer Applications": "MCA"
}

const STATIC_LABS = [
  {
    "department": "CSE",
    "labName": "Programming Laboratory",
    "labCode": "CSE101",
    "capacity": 60,
    "numberOfSystems": 60,
    "labIncharge": "Dr. R. Kumar",
    "location": "Block A - First Floor",
    "equipmentCount": 75,
    "status": "Active",
    "lastMaintenanceDate": "2025-12-15"
  },
  {
    "department": "CSE",
    "labName": "Database Management Systems Lab",
    "labCode": "CSE102",
    "capacity": 60,
    "numberOfSystems": 60,
    "labIncharge": "Prof. S. Priya",
    "location": "Block A - Second Floor",
    "equipmentCount": 70,
    "status": "Active",
    "lastMaintenanceDate": "2026-01-10"
  },
  {
    "department": "CSBS",
    "labName": "Business Analytics Lab",
    "labCode": "CSBS101",
    "capacity": 50,
    "numberOfSystems": 50,
    "labIncharge": "Dr. K. Saravanan",
    "location": "Block B - First Floor",
    "equipmentCount": 62,
    "status": "Active",
    "lastMaintenanceDate": "2026-01-05"
  },
  {
    "department": "CSBS",
    "labName": "Data Science Lab",
    "labCode": "CSBS102",
    "capacity": 50,
    "numberOfSystems": 50,
    "labIncharge": "Prof. P. Divya",
    "location": "Block B - Second Floor",
    "equipmentCount": 65,
    "status": "Under Maintenance",
    "lastMaintenanceDate": "2026-02-01"
  },
  {
    "department": "AI&DS",
    "labName": "Artificial Intelligence Lab",
    "labCode": "AIDS101",
    "capacity": 60,
    "numberOfSystems": 60,
    "labIncharge": "Dr. M. Arun",
    "location": "Block C - First Floor",
    "equipmentCount": 80,
    "status": "Active",
    "lastMaintenanceDate": "2026-01-15"
  },
  {
    "department": "AI&DS",
    "labName": "Machine Learning Lab",
    "labCode": "AIDS102",
    "capacity": 60,
    "numberOfSystems": 60,
    "labIncharge": "Prof. N. Harini",
    "location": "Block C - Second Floor",
    "equipmentCount": 85,
    "status": "Active",
    "lastMaintenanceDate": "2026-02-10"
  },
  {
    "department": "IT",
    "labName": "Networking Lab",
    "labCode": "IT101",
    "capacity": 55,
    "numberOfSystems": 55,
    "labIncharge": "Dr. V. Karthik",
    "location": "Block D - First Floor",
    "equipmentCount": 78,
    "status": "Active",
    "lastMaintenanceDate": "2026-01-20"
  },
  {
    "department": "IT",
    "labName": "Cyber Security Lab",
    "labCode": "IT102",
    "capacity": 55,
    "numberOfSystems": 55,
    "labIncharge": "Prof. A. Ramesh",
    "location": "Block D - Second Floor",
    "equipmentCount": 72,
    "status": "Active",
    "lastMaintenanceDate": "2026-01-28"
  },
  {
    "department": "ECE",
    "labName": "Digital Electronics Lab",
    "labCode": "ECE101",
    "capacity": 40,
    "numberOfSystems": 25,
    "labIncharge": "Dr. S. Balaji",
    "location": "Block E - Ground Floor",
    "equipmentCount": 120,
    "status": "Active",
    "lastMaintenanceDate": "2026-01-18"
  },
  {
    "department": "ECE",
    "labName": "Embedded Systems Lab",
    "labCode": "ECE102",
    "capacity": 40,
    "numberOfSystems": 25,
    "labIncharge": "Prof. K. Rajesh",
    "location": "Block E - First Floor",
    "equipmentCount": 130,
    "status": "Active",
    "lastMaintenanceDate": "2026-02-02"
  },
  {
    "department": "EEE",
    "labName": "Electrical Machines Lab",
    "labCode": "EEE101",
    "capacity": 40,
    "numberOfSystems": 20,
    "labIncharge": "Dr. R. Senthil",
    "location": "Block F - Ground Floor",
    "equipmentCount": 110,
    "status": "Active",
    "lastMaintenanceDate": "2026-01-25"
  },
  {
    "department": "EEE",
    "labName": "Power Electronics Lab",
    "labCode": "EEE102",
    "capacity": 40,
    "numberOfSystems": 20,
    "labIncharge": "Prof. V. Anitha",
    "location": "Block F - First Floor",
    "equipmentCount": 105,
    "status": "Under Maintenance",
    "lastMaintenanceDate": "2026-02-05"
  },
  {
    "department": "Mechanical",
    "labName": "CAD/CAM Laboratory",
    "labCode": "MECH101",
    "capacity": 45,
    "numberOfSystems": 30,
    "labIncharge": "Dr. T. Prakash",
    "location": "Mechanical Block - First Floor",
    "equipmentCount": 95,
    "status": "Active",
    "lastMaintenanceDate": "2026-01-22"
  },
  {
    "department": "Mechanical",
    "labName": "Thermal Engineering Lab",
    "labCode": "MECH102",
    "capacity": 45,
    "numberOfSystems": 15,
    "labIncharge": "Prof. G. Suresh",
    "location": "Mechanical Block - Ground Floor",
    "equipmentCount": 140,
    "status": "Active",
    "lastMaintenanceDate": "2026-01-30"
  },
  {
    "department": "Civil",
    "labName": "Concrete Technology Lab",
    "labCode": "CIVIL101",
    "capacity": 40,
    "numberOfSystems": 10,
    "labIncharge": "Dr. P. Mohan",
    "location": "Civil Block - Ground Floor",
    "equipmentCount": 125,
    "status": "Active",
    "lastMaintenanceDate": "2026-01-15"
  },
  {
    "department": "Civil",
    "labName": "Surveying Lab",
    "labCode": "CIVIL102",
    "capacity": 40,
    "numberOfSystems": 15,
    "labIncharge": "Prof. K. Naveen",
    "location": "Civil Block - First Floor",
    "equipmentCount": 115,
    "status": "Active",
    "lastMaintenanceDate": "2026-02-08"
  },
  {
    "department": "BME",
    "labName": "Biomedical Instrumentation Lab",
    "labCode": "BME101",
    "capacity": 35,
    "numberOfSystems": 20,
    "labIncharge": "Dr. J. Vignesh",
    "location": "Biomedical Block - First Floor",
    "equipmentCount": 150,
    "status": "Active",
    "lastMaintenanceDate": "2026-01-20"
  },
  {
    "department": "MBA",
    "labName": "Business Analytics Lab",
    "labCode": "MBA101",
    "capacity": 50,
    "numberOfSystems": 50,
    "labIncharge": "Prof. S. Kavitha",
    "location": "MBA Block - Second Floor",
    "equipmentCount": 60,
    "status": "Active",
    "lastMaintenanceDate": "2026-01-12"
  },
  {
    "department": "MCA",
    "labName": "Software Development Lab",
    "labCode": "MCA101",
    "capacity": 60,
    "numberOfSystems": 60,
    "labIncharge": "Dr. A. Manikandan",
    "location": "MCA Block - First Floor",
    "equipmentCount": 75,
    "status": "Active",
    "lastMaintenanceDate": "2026-02-03"
  }
]

export default function LabManagement() {
  const { user } = useAuth()
  const [labs, setLabs] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [activeTab, setActiveTab] = useState('infrastructure')

  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [conditionFilter, setConditionFilter] = useState('')

  const isEditable = user?.role === 'admin' || user?.role === 'hod'

  const fetchLabs = async () => {
    setLoading(true)
    try {
      const res = await labsService.getAll({
        department: deptFilter,
        condition: conditionFilter
      })
      setLabs(res.data.data)
    } catch (err) {
      toast.error('Failed to load lab infrastructure records')
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getAll()
      setDepartments(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchLabs()
    fetchDepartments()
  }, [deptFilter, conditionFilter])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.labName || !form.department || !form.equipmentName || !form.quantity) {
      toast.error('Required fields are missing')
      return
    }

    try {
      if (editing) {
        await labsService.update(editing, form)
        toast.success('Equipment record updated')
      } else {
        await labsService.create(form)
        toast.success('Equipment record created')
      }
      setShowModal(false)
      fetchLabs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this equipment record?')) return
    try {
      await labsService.delete(id)
      toast.success('Record deleted')
      fetchLabs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record')
    }
  }

  const openAdd = () => {
    setForm(emptyForm)
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (item) => {
    setForm({
      labName: item.labName,
      department: item.department,
      equipmentName: item.equipmentName,
      quantity: item.quantity,
      condition: item.condition,
      purchaseDate: item.purchaseDate ? new Date(item.purchaseDate).toISOString().split('T')[0] : '',
      remarks: item.remarks || ''
    })
    setEditing(item._id)
    setShowModal(true)
  }

  const filtered = labs.filter((l) =>
    l.labName.toLowerCase().includes(search.toLowerCase()) ||
    l.equipmentName.toLowerCase().includes(search.toLowerCase())
  )

  const filteredStaticLabs = STATIC_LABS.filter((l) => {
    // Department filter
    if (deptFilter) {
      const mappedCode = DEPT_MAP[deptFilter] || deptFilter;
      if (l.department.toLowerCase() !== mappedCode.toLowerCase()) return false;
    }
    // Condition/Status filter
    if (conditionFilter) {
      if (conditionFilter === 'Working' && l.status !== 'Active') return false;
      if (conditionFilter === 'Under Maintenance' && l.status !== 'Under Maintenance') return false;
      if (conditionFilter === 'Broken' && l.status !== 'Broken') return false;
    }
    // Search filter
    if (search) {
      const s = search.toLowerCase();
      return (
        l.labName.toLowerCase().includes(s) ||
        l.labCode.toLowerCase().includes(s) ||
        l.labIncharge.toLowerCase().includes(s) ||
        l.location.toLowerCase().includes(s)
      );
    }
    return true;
  })

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-50">Laboratory Infrastructure</h1>
          <p className="text-sm text-ink-400">Manage labs, equipment conditions, quantities, and inventory</p>
        </div>
        {isEditable && activeTab === 'equipment' && (
          <button onClick={openAdd} className="btn-primary">
            <Plus size={16} /> Add Equipment
          </button>
        )}
      </div>

      {/* Tab Selector */}
      <div className="flex gap-6 border-b border-ink-800 mb-6">
        <button
          onClick={() => setActiveTab('infrastructure')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'infrastructure' ? 'text-lime-300' : 'text-ink-400 hover:text-ink-200'
          }`}
        >
          Lab Infrastructure Directory
          {activeTab === 'infrastructure' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'equipment' ? 'text-lime-300' : 'text-ink-400 hover:text-ink-200'
          }`}
        >
          Equipment Inventory Catalog
          {activeTab === 'equipment' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-400" />
          )}
        </button>
      </div>

      <div className="bg-ink-900 border border-ink-800 rounded-2xl overflow-hidden mb-6">
        {/* Search & Filters */}
        <div className="p-4 border-b border-ink-800 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={16} />
            <input
              className="input pl-10 text-sm"
              placeholder="Search by lab name or equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input md:w-56 text-sm"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d.departmentName}>{d.departmentName}</option>
            ))}
          </select>
          <select
            className="input md:w-44 text-sm"
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
          >
            <option value="">All Conditions</option>
            <option value="Working">Working</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Broken">Broken</option>
          </select>
        </div>

        {activeTab === 'equipment' ? (
          loading ? (
            <div className="p-12 text-center text-ink-500">
              <div className="w-8 h-8 border-2 border-lime-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              Loading infrastructure records...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-ink-400 text-xs uppercase bg-ink-950/40 border-b border-ink-800">
                  <tr>
                    <th className="px-6 py-4">Lab Name</th>
                    <th className="px-6 py-4">Equipment</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Condition</th>
                    <th className="px-6 py-4">Purchase Date</th>
                    {isEditable && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-800/60">
                  {filtered.map((l) => (
                    <tr key={l._id} className="hover:bg-ink-800/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-ink-100">{l.labName}</td>
                      <td className="px-6 py-4 text-ink-200">
                        <div>{l.equipmentName}</div>
                        {l.remarks && <div className="text-[10px] text-ink-500 font-mono italic">{l.remarks}</div>}
                      </td>
                      <td className="px-6 py-4 text-ink-300">{l.department}</td>
                      <td className="px-6 py-4 text-ink-300 font-mono">{l.quantity}</td>
                      <td className="px-6 py-4">
                        <span className={`badge ${l.condition === 'Working' ? 'tag-lime' : l.condition === 'Broken' ? 'tag-red' : 'tag-amber'}`}>
                          {l.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-ink-400">
                        {l.purchaseDate ? new Date(l.purchaseDate).toLocaleDateString() : '—'}
                      </td>
                      {isEditable && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => openEdit(l)} className="btn-ghost p-2" title="Edit Item">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => handleDelete(l._id)} className="btn-ghost p-2 text-red-400 hover:text-red-300" title="Delete Item">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={isEditable ? 7 : 6} className="px-6 py-12 text-center text-ink-500">
                        No infrastructure items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStaticLabs.map((l) => (
                <div key={l.labCode} className="bg-ink-950/20 border border-ink-800 hover:border-lime-400/40 transition-all rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="badge tag-lime mb-1">{l.labCode}</span>
                        <h3 className="font-bold text-ink-50 font-display text-base line-clamp-1">{l.labName}</h3>
                      </div>
                      <span className={`badge ${l.status === 'Active' ? 'tag-lime' : 'tag-amber'}`}>
                        {l.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-ink-300 mb-4 bg-ink-950/40 p-3 rounded-xl border border-ink-800/40">
                      <div className="flex justify-between">
                        <span className="text-ink-500">Department:</span>
                        <span className="font-semibold text-ink-200">{l.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-500">Incharge:</span>
                        <span className="font-semibold text-ink-200">{l.labIncharge}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-500">Location:</span>
                        <span className="font-semibold text-ink-200">{l.location}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div className="bg-ink-800/40 p-2 rounded-lg border border-ink-800/50">
                        <div className="text-[10px] text-ink-500 uppercase tracking-wider font-semibold">Systems</div>
                        <div className="text-sm font-bold text-ink-100 mt-0.5">{l.numberOfSystems}</div>
                      </div>
                      <div className="bg-ink-800/40 p-2 rounded-lg border border-ink-800/50">
                        <div className="text-[10px] text-ink-500 uppercase tracking-wider font-semibold">Capacity</div>
                        <div className="text-sm font-bold text-ink-100 mt-0.5">{l.capacity}</div>
                      </div>
                      <div className="bg-ink-800/40 p-2 rounded-lg border border-ink-800/50">
                        <div className="text-[10px] text-ink-500 uppercase tracking-wider font-semibold">Equipment</div>
                        <div className="text-sm font-bold text-ink-100 mt-0.5">{l.equipmentCount}</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-ink-800/60 pt-3 mt-3 flex justify-between items-center text-[11px] text-ink-400 font-mono">
                    <span>Last Maintained:</span>
                    <span>{l.lastMaintenanceDate}</span>
                  </div>
                </div>
              ))}
              {filteredStaticLabs.length === 0 && (
                <div className="col-span-full py-12 text-center text-ink-500">
                  No laboratories found matching filters.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-ink-900 border border-ink-800 rounded-2xl p-6 w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold font-display text-ink-150 mb-4">
              {editing ? 'Edit Infrastructure Equipment' : 'Add Laboratory Equipment'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Laboratory Name</label>
                <input
                  className="input"
                  placeholder="e.g. Advanced AI & Robotics Lab"
                  value={form.labName}
                  onChange={(e) => setForm({ ...form, labName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Department</label>
                <select
                  className="input"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  required
                >
                  <option value="" disabled>Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d.departmentName}>{d.departmentName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Equipment Name</label>
                <input
                  className="input"
                  placeholder="e.g. High Performance NVIDIA Workstation"
                  value={form.equipmentName}
                  onChange={(e) => setForm({ ...form, equipmentName: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    className="input"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Condition</label>
                  <select
                    className="input"
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  >
                    <option value="Working">Working</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Broken">Broken</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Purchase Date</label>
                <input
                  type="date"
                  className="input"
                  value={form.purchaseDate}
                  onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Remarks</label>
                <textarea
                  className="input h-20"
                  placeholder="Asset numbers, warranty terms..."
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Infrastructure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
