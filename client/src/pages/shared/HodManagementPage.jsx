import { useEffect, useState, useCallback } from 'react'
import { hodManagementService } from '../../services/api'
import {
  Building2, Users, UserCheck, UserX, Search,
  RefreshCw, ChevronDown, Trash2, CheckCircle,
  AlertCircle, Clock, ShieldCheck, X, AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

// ─────────────────── Confirmation Modal ───────────────────────
function ConfirmModal({ open, title, message, confirmLabel, confirmClass, onConfirm, onCancel, loading }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onCancel} />
      <div className="relative bg-ink-900 border border-ink-700 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-up">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-bold font-display text-ink-50 text-base">{title}</h3>
            <p className="text-sm text-ink-400 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm text-ink-300 hover:text-ink-100 border border-ink-700 hover:border-ink-600 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 ${confirmClass}`}
          >
            {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────── Staff Picker Drawer ─────────────────────
function StaffPicker({ dept, staffList, loadingStaff, selectedStaffId, onSelect, onAssign, assigning, onClose }) {
  const [staffSearch, setStaffSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const filteredStaff = staffList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(staffSearch.toLowerCase()) ||
      (s.regnum && s.regnum.toLowerCase().includes(staffSearch.toLowerCase()))
    const matchesRole = roleFilter === 'all' ? true : s.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="border-t border-ink-800 bg-ink-950/60 p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-ink-100 font-display">Assign HOD — {dept.departmentName}</h4>
          <p className="text-xs text-ink-400 mt-0.5">Select a faculty member from the list below to appoint as HOD</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-ink-800 text-ink-500 hover:text-ink-300 transition-colors">
          <X size={16} />
        </button>
      </div>

      {loadingStaff ? (
        <div className="flex items-center justify-center py-8 gap-2.5 text-sm text-ink-400">
          <span className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          Loading eligible staff members…
        </div>
      ) : staffList.length === 0 ? (
        <div className="p-6 bg-ink-900 border border-ink-800 rounded-xl text-center">
          <Users size={24} className="text-ink-600 mx-auto mb-2" />
          <p className="text-xs text-ink-400">No active staff found in {dept.departmentName}.</p>
          <p className="text-[11px] text-ink-600 mt-1">Please add staff members to this department in Staff Management first.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Staff Search bar & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                type="text"
                placeholder="Filter staff by name, email or registration number…"
                className="input pl-9 py-2 text-xs w-full bg-ink-900/50"
                value={staffSearch}
                onChange={e => setStaffSearch(e.target.value)}
              />
            </div>
            <div className="relative min-w-[160px]">
              <select
                className="input text-xs appearance-none pr-8 w-full bg-ink-900/50 py-2"
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="staff">Staff / Faculty</option>
                <option value="hod">Current HODs</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
            </div>
          </div>

          {/* Grid / List of staff cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {filteredStaff.map(s => {
              const isSelected = selectedStaffId === s._id
              return (
                <div
                  key={s._id}
                  onClick={() => onSelect(s._id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 relative ${
                    isSelected
                      ? 'bg-lime-400/10 border-lime-400 shadow-md shadow-lime-400/5'
                      : 'bg-ink-900 border-ink-800 hover:border-ink-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isSelected ? 'bg-lime-400 text-ink-950' : 'bg-ink-800 text-ink-400'
                  }`}>
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-0.5 min-w-0 pr-8">
                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-lime-300' : 'text-ink-100'}`}>
                      {s.name}
                    </p>
                    <p className="text-xs text-ink-400 truncate font-mono">{s.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-ink-800 text-ink-400 border border-ink-700">
                        {s.role === 'hod' ? 'HOD' : 'Staff / Faculty'}
                      </span>
                      {s.regnum && (
                        <span className="text-[10px] text-ink-500 font-mono">Reg: {s.regnum}</span>
                      )}
                    </div>
                  </div>
                  {/* Select indicator */}
                  <div className={`absolute top-3.5 right-3.5 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    isSelected ? 'border-lime-400 bg-lime-400 text-ink-950' : 'border-ink-700'
                  }`}>
                    {isSelected && <span className="w-1.5 h-1.5 bg-ink-950 rounded-full" />}
                  </div>
                </div>
              )
            })}
            {filteredStaff.length === 0 && (
              <div className="col-span-full py-6 text-center text-xs text-ink-500">
                No staff match your search criteria.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-ink-800/40">
            <button
              onClick={onClose}
              disabled={assigning}
              className="px-4 py-2 text-xs font-semibold text-ink-300 hover:text-ink-100 border border-ink-800 hover:border-ink-700 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onAssign}
              disabled={!selectedStaffId || assigning}
              className="flex items-center gap-1.5 px-5 py-2 bg-lime-400 hover:bg-lime-300 disabled:bg-ink-800 disabled:text-ink-500 text-ink-950 text-xs font-bold rounded-lg transition-all shadow-md shadow-lime-400/10"
            >
              {assigning
                ? <span className="w-3.5 h-3.5 border-2 border-ink-950 border-t-transparent rounded-full animate-spin" />
                : <UserCheck size={13} />}
              {assigning ? 'Appointing…' : 'Appoint HOD'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────── Main Component ──────────────────────────
export default function HodManagementPage() {
  const { user } = useAuth()
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('')
  const [selectedHodFilter, setSelectedHodFilter] = useState('')
  const [hodStatusFilter, setHodStatusFilter] = useState('all')

  // Per-department state maps
  const [openAssignDept, setOpenAssignDept]   = useState(null) // deptId currently showing staff picker
  const [staffMap, setStaffMap]               = useState({})   // { deptId: staffList }
  const [loadingStaff, setLoadingStaff]       = useState({})   // { deptId: bool }
  const [selectedStaff, setSelectedStaff]     = useState({})   // { deptId: staffId }
  const [assigning, setAssigning]             = useState({})   // { deptId: bool }

  // Confirm modal state
  const [modal, setModal] = useState({
    open: false, type: null, deptId: null, deptName: '', hodName: '', loading: false
  })

  // Read hasAdminToken to support Admin roles too
  const hasAdminToken = !!sessionStorage.getItem('adminToken')
  const userRole = hasAdminToken ? 'admin' : (user?.role || '')

  const loadDepartments = useCallback(() => {
    setLoading(true)
    hodManagementService.getDepartments()
      .then(res => setDepartments(res.data.data))
      .catch(() => toast.error('Failed to load departments'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadDepartments() }, [loadDepartments])

  const loadStaff = async (deptId) => {
    if (staffMap[deptId]) return
    setLoadingStaff(prev => ({ ...prev, [deptId]: true }))
    try {
      const res = await hodManagementService.getDepartmentStaff(deptId)
      setStaffMap(prev => ({ ...prev, [deptId]: res.data.data }))
    } catch {
      toast.error('Failed to load staff list for this department')
    } finally {
      setLoadingStaff(prev => ({ ...prev, [deptId]: false }))
    }
  }

  const handleOpenAssign = (deptId) => {
    setOpenAssignDept(deptId)
    loadStaff(deptId)
  }

  const handleCloseAssign = () => {
    setOpenAssignDept(null)
    setSelectedStaff({})
  }

  // ── Open remove confirm modal
  const confirmRemove = (dept) => {
    setModal({
      open: true,
      type: 'remove',
      deptId: dept._id,
      deptName: dept.departmentName,
      hodName: dept.hod?.name || 'the current HOD',
      loading: false
    })
  }

  // ── Open assign confirm modal
  const confirmAssign = (deptId, deptName) => {
    const staffId = selectedStaff[deptId]
    const staff = (staffMap[deptId] || []).find(s => s._id === staffId)
    if (!staffId || !staff) { toast.error('Please select a staff member first'); return }
    setModal({
      open: true,
      type: 'assign',
      deptId,
      deptName,
      hodName: staff.name,
      staffId,
      loading: false
    })
  }

  // ── Execute removal
  const executeRemove = async () => {
    setModal(prev => ({ ...prev, loading: true }))
    try {
      const res = await hodManagementService.removeHod(modal.deptId)
      toast.success(res.data.message)
      loadDepartments()
      // Force reload staff list on next open
      setStaffMap(prev => { const n = { ...prev }; delete n[modal.deptId]; return n })
      setOpenAssignDept(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove HOD')
    } finally {
      setModal(prev => ({ ...prev, open: false, loading: false }))
    }
  }

  // ── Execute assignment
  const executeAssign = async () => {
    setModal(prev => ({ ...prev, loading: true }))
    const { deptId, staffId } = modal
    try {
      const res = await hodManagementService.assignHod(deptId, staffId)
      toast.success(res.data.message)
      loadDepartments()
      setStaffMap(prev => { const n = { ...prev }; delete n[deptId]; return n })
      setSelectedStaff(prev => { const n = { ...prev }; delete n[deptId]; return n })
      setOpenAssignDept(null)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to assign HOD'
      toast.error(msg)
    } finally {
      setModal(prev => ({ ...prev, open: false, loading: false }))
    }
  }

  const filtered = departments.filter(d => {
    const matchesSearch = d.departmentName.toLowerCase().includes(search.toLowerCase()) ||
      d.departmentCode.toLowerCase().includes(search.toLowerCase())
    const matchesDept = selectedDeptFilter ? d.departmentName === selectedDeptFilter : true
    const matchesHod = selectedHodFilter ? (d.hod?._id === selectedHodFilter) : true
    const matchesStatus = hodStatusFilter === 'all' ? true :
      hodStatusFilter === 'assigned' ? !!d.hod : !d.hod
    return matchesSearch && matchesDept && matchesHod && matchesStatus
  })

  const withHod = departments.filter(d => d.hod).length
  const withoutHod = departments.filter(d => !d.hod).length

  const accentClass = userRole === 'principal' ? 'text-amber-300 bg-amber-400/10 border-amber-400/20' : 'text-blue-300 bg-blue-400/10 border-blue-400/20'
  const btnAssign   = userRole === 'principal' ? 'bg-amber-400 hover:bg-amber-300 shadow-amber-400/20' : 'bg-blue-500 hover:bg-blue-400 shadow-blue-500/20'

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono mb-3 ${accentClass}`}>
            {userRole === 'principal' ? '👑 Principal Panel' : '⬡ Admin Panel'}
          </div>
          <h1 className="text-2xl font-bold font-display text-ink-50">HOD Assignment Management</h1>
          <p className="text-sm text-ink-400 mt-1">
            Manage Head of Department assignments across all departments
          </p>
        </div>
        <button
          onClick={loadDepartments}
          className="flex items-center gap-2 px-4 py-2.5 bg-ink-900 border border-ink-800 hover:border-ink-700 text-sm text-ink-300 hover:text-ink-100 rounded-xl transition-all"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ink-900 border border-ink-800 text-sm">
          <Building2 size={14} className="text-ink-400" />
          <span className="text-ink-300">{departments.length} Total Departments</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ink-900 border border-lime-400/20 text-sm">
          <UserCheck size={14} className="text-lime-400" />
          <span className="text-lime-300">{withHod} with HOD</span>
        </div>
        {withoutHod > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ink-900 border border-red-400/20 text-sm">
            <UserX size={14} className="text-red-400" />
            <span className="text-red-300">{withoutHod} without HOD</span>
          </div>
        )}
      </div>

      {/* Business rules notice */}
      <div className="bg-ink-900/60 border border-ink-800 rounded-xl p-4 text-xs text-ink-400 space-y-1">
        <p className="font-semibold text-ink-300 font-mono uppercase tracking-wider mb-2">Assignment Rules</p>
        <p>• One department can have only one active HOD at a time.</p>
        <p>• Selected staff must belong to the same department they will head.</p>
        <p>• <span className="text-red-400 font-medium">Existing HOD must be removed first</span> before assigning a new HOD — direct replacement is not allowed.</p>
        <p>• All assignment and removal actions are logged for audit purposes.</p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            type="text"
            placeholder="Search departments by name or code…"
            className="input pl-9 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Department Filter Dropdown */}
        <div className="relative min-w-[200px]">
          <select
            className="input text-sm appearance-none pr-8 w-full bg-ink-900"
            value={selectedDeptFilter}
            onChange={e => {
              setSelectedDeptFilter(e.target.value)
              setSelectedHodFilter('')
            }}
          >
            <option value="">— All Departments —</option>
            {departments.map(d => (
              <option key={d._id} value={d.departmentName}>{d.departmentName}</option>
            ))}
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
        </div>

        {/* HOD Status Filter Dropdown */}
        <div className="relative min-w-[200px]">
          <select
            className="input text-sm appearance-none pr-8 w-full bg-ink-900"
            value={hodStatusFilter}
            onChange={e => setHodStatusFilter(e.target.value)}
          >
            <option value="all">— All HOD Statuses —</option>
            <option value="assigned">With HOD Assigned</option>
            <option value="unassigned">No HOD Assigned</option>
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
        </div>

        {/* HOD / Staff Filter Dropdown */}
        <div className="relative min-w-[200px]">
          <select
            className="input text-sm appearance-none pr-8 w-full bg-ink-900"
            value={selectedHodFilter}
            onChange={e => setSelectedHodFilter(e.target.value)}
          >
            <option value="">— All HODs (Staff) —</option>
            {Array.from(new Map(departments.filter(d => d.hod).map(d => [d.hod._id, d.hod])).values()).map(hod => (
              <option key={hod._id} value={hod._id}>{hod.name}</option>
            ))}
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
        </div>
      </div>

      {/* Department Table */}
      {loading ? (
        <div className="text-center py-14 text-ink-400 text-sm">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading departments…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14 text-ink-500 text-sm">
          No departments match the filter criteria.
        </div>
      ) : (
        <div className="bg-ink-900 border border-ink-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_2fr_1fr_auto] gap-4 px-5 py-3 border-b border-ink-800 text-xs font-mono text-ink-500 uppercase tracking-wider">
            <span>Department</span>
            <span>Code</span>
            <span>Current HOD</span>
            <span>Assigned</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-ink-800/50">
            {filtered.map(dept => {
              const hasHod = !!dept.hod
              const isPickerOpen = openAssignDept === dept._id

              return (
                <div key={dept._id} className="transition-colors hover:bg-ink-800/10">
                  {/* Main row */}
                  <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr_1fr_auto] gap-4 items-center px-5 py-4">
                    {/* Dept name */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-ink-800 flex items-center justify-center text-ink-400 text-xs font-bold font-mono shrink-0">
                        {dept.departmentCode?.slice(0, 3)}
                      </div>
                      <span className="font-medium text-ink-100 text-sm">{dept.departmentName}</span>
                    </div>

                    {/* Code */}
                    <span className="text-xs font-mono text-ink-500 hidden md:block">{dept.departmentCode}</span>

                    {/* HOD info */}
                    <div>
                      {hasHod ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle size={13} className="text-lime-400 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-lime-300">{dept.hod.name}</p>
                            <p className="text-xs text-ink-500 font-mono">{dept.hod.email}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-400 text-xs">
                          <AlertCircle size={13} />
                          No HOD assigned
                        </div>
                      )}
                    </div>

                    {/* Assigned at */}
                    <div className="hidden md:block">
                      {dept.hodAssignedAt ? (
                        <div>
                          <p className="text-xs font-mono text-ink-400">
                            {new Date(dept.hodAssignedAt).toLocaleDateString()}
                          </p>
                          {dept.hodAssignedByRole && (
                            <p className="text-xs text-ink-600 capitalize">by {dept.hodAssignedByRole}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-ink-700">—</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {hasHod ? (
                        <>
                          {/* Remove HOD */}
                          <button
                            onClick={() => confirmRemove(dept)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 hover:border-red-400/40 text-red-400 text-xs rounded-lg transition-all"
                            title="Remove current HOD"
                          >
                            <Trash2 size={12} />
                            Remove HOD
                          </button>
                          {/* Disabled assign */}
                          <button
                            disabled
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-800/50 border border-ink-700 text-ink-600 text-xs rounded-lg cursor-not-allowed"
                            title="Remove existing HOD first to assign a new one"
                          >
                            <UserX size={12} />
                            Assign HOD
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => isPickerOpen ? handleCloseAssign() : handleOpenAssign(dept._id)}
                          className={`flex items-center gap-1.5 px-4 py-1.5 text-ink-950 text-xs font-semibold rounded-lg transition-all shadow-md ${btnAssign} text-ink-950`}
                        >
                          <Users size={12} />
                          {isPickerOpen ? 'Close' : 'Assign HOD'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Staff picker (only if no HOD and this dept is expanded) */}
                  {isPickerOpen && !hasHod && (
                    <StaffPicker
                      dept={dept}
                      staffList={staffMap[dept._id] || []}
                      loadingStaff={!!loadingStaff[dept._id]}
                      selectedStaffId={selectedStaff[dept._id] || ''}
                      onSelect={staffId => setSelectedStaff(prev => ({ ...prev, [dept._id]: staffId }))}
                      onAssign={() => confirmAssign(dept._id, dept.departmentName)}
                      assigning={!!assigning[dept._id]}
                      onClose={handleCloseAssign}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={modal.open}
        loading={modal.loading}
        title={modal.type === 'remove' ? 'Remove Current HOD?' : 'Confirm HOD Assignment'}
        message={
          modal.type === 'remove'
            ? `This will remove ${modal.hodName} as HOD of ${modal.deptName} and revert them to regular staff. You can assign a new HOD after removal.`
            : `Assign ${modal.hodName} as the new Head of Department for ${modal.deptName}? This action will be logged.`
        }
        confirmLabel={modal.type === 'remove' ? 'Yes, Remove HOD' : 'Yes, Assign HOD'}
        confirmClass={
          modal.type === 'remove'
            ? 'bg-red-500 hover:bg-red-400 text-white'
            : 'bg-lime-400 hover:bg-lime-300 text-ink-950'
        }
        onConfirm={modal.type === 'remove' ? executeRemove : executeAssign}
        onCancel={() => setModal(prev => ({ ...prev, open: false }))}
      />
    </div>
  )
}
