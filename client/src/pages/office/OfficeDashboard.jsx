import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Users, Briefcase, CheckCircle, Clock, ShieldAlert, ArrowRight, TrendingUp } from 'lucide-react'
import { officeAdmissionsService, officeFacultyService, officeSalaryService } from '../../services/api'
import toast from 'react-hot-toast'

export default function OfficeDashboard() {
  const [data, setData] = useState({
    totalAdmissions: 0,
    pendingAdmissions: 0,
    totalFaculty: 0,
    activeFaculty: 0,
    pendingSalaries: 0,
    paidSalaries: 0,
    recentAdmissions: [],
    recentFaculty: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [admissionsRes, facultyRes, salaryRes] = await Promise.all([
          officeAdmissionsService.getAll({ limit: 100 }),
          officeFacultyService.getAll({ limit: 100 }),
          officeSalaryService.getAll({ limit: 100 })
        ])

        const admissions = admissionsRes.data.data || []
        const faculty = facultyRes.data.data || []
        const salaries = salaryRes.data.data || []

        const pendingAdmissions = admissions.filter(a => a.admissionStatus === 'pending').length
        const activeFaculty = faculty.filter(f => f.employmentStatus === 'active').length
        const pendingSalaries = salaries.filter(s => s.paymentStatus === 'pending').length
        const paidSalaries = salaries.filter(s => s.paymentStatus === 'paid').length

        setData({
          totalAdmissions: admissions.length,
          pendingAdmissions,
          totalFaculty: faculty.length,
          activeFaculty,
          pendingSalaries,
          paidSalaries,
          recentAdmissions: admissions.slice(0, 5),
          recentFaculty: faculty.slice(0, 5)
        })
      } catch (err) {
        console.error(err)
        toast.error('Failed to load dashboard statistics')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-ink-400 text-sm">Loading office stats…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-50">Office Staff Dashboard</h1>
        <p className="text-sm text-ink-400">Manage admissions workflow, faculty register & payroll records</p>
      </div>

      {/* Grid of stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Admissions Stats */}
        <div className="card p-6 border-ink-800 bg-ink-900/50 relative overflow-hidden group hover:border-sky-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-400/5 rounded-full blur-2xl group-hover:bg-sky-400/10 transition-all" />
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <span className="text-xs text-ink-500 uppercase font-mono tracking-wider">Student Admissions</span>
              <div>
                <p className="text-3xl font-bold text-ink-50">{data.totalAdmissions}</p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-400">
                  <Clock size={12} />
                  <span>{data.pendingAdmissions} pending approvals</span>
                </div>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-400/10 flex items-center justify-center text-sky-300">
              <GraduationCap size={24} />
            </div>
          </div>
        </div>

        {/* Faculty Stats */}
        <div className="card p-6 border-ink-800 bg-ink-900/50 relative overflow-hidden group hover:border-lime-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-lime-400/5 rounded-full blur-2xl group-hover:bg-lime-400/10 transition-all" />
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <span className="text-xs text-ink-500 uppercase font-mono tracking-wider">Faculty Members</span>
              <div>
                <p className="text-3xl font-bold text-ink-50">{data.totalFaculty}</p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-lime-400">
                  <CheckCircle size={12} />
                  <span>{data.activeFaculty} active members</span>
                </div>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center text-lime-300">
              <Users size={24} />
            </div>
          </div>
        </div>

        {/* Salaries Stats */}
        <div className="card p-6 border-ink-800 bg-ink-900/50 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/5 rounded-full blur-2xl group-hover:bg-emerald-400/10 transition-all" />
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <span className="text-xs text-ink-500 uppercase font-mono tracking-wider">Faculty Payroll</span>
              <div>
                <p className="text-3xl font-bold text-ink-50">{data.pendingSalaries + data.paidSalaries}</p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-400">
                  <TrendingUp size={12} />
                  <span>{data.pendingSalaries} pending payments</span>
                </div>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-350">
              <Briefcase size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Actions & Recents tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Admissions */}
          <div className="card p-6 border-ink-800 bg-ink-900/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-ink-100">Recent Student Admissions</h3>
              <Link to="/office/admissions" className="text-xs text-sky-400 hover:text-sky-300 inline-flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {data.recentAdmissions.length === 0 ? (
              <p className="text-sm text-ink-500 py-4 text-center">No admission records found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-ink-800 text-xs text-ink-400 font-mono">
                      <th className="py-2.5">Student Name</th>
                      <th className="py-2.5">Department</th>
                      <th className="py-2.5">Year</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-800/40 text-ink-200">
                    {data.recentAdmissions.map((adm) => (
                      <tr key={adm._id} className="hover:bg-ink-800/20 transition-colors">
                        <td className="py-3 font-500">{adm.studentName}</td>
                        <td className="py-3 text-xs text-ink-400">{adm.department}</td>
                        <td className="py-3 text-xs">{adm.admissionYear}</td>
                        <td className="py-3">
                          <span className={`badge text-[10px] ${
                            adm.admissionStatus === 'approved' ? 'tag-lime' :
                            adm.admissionStatus === 'rejected' ? 'tag-red' : 'tag-amber'
                          }`}>
                            {adm.admissionStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Faculty */}
          <div className="card p-6 border-ink-800 bg-ink-900/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-ink-100">Faculty Roster Summary</h3>
              <Link to="/office/faculty" className="text-xs text-lime-400 hover:text-lime-300 inline-flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {data.recentFaculty.length === 0 ? (
              <p className="text-sm text-ink-500 py-4 text-center">No faculty records found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-ink-800 text-xs text-ink-400 font-mono">
                      <th className="py-2.5">Faculty Name</th>
                      <th className="py-2.5">Designation</th>
                      <th className="py-2.5">Department</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-800/40 text-ink-200">
                    {data.recentFaculty.map((fac) => (
                      <tr key={fac._id} className="hover:bg-ink-800/20 transition-colors">
                        <td className="py-3 font-500">{fac.facultyName}</td>
                        <td className="py-3 text-xs">{fac.designation}</td>
                        <td className="py-3 text-xs text-ink-400">{fac.department}</td>
                        <td className="py-3">
                          <span className={`badge text-[10px] ${
                            fac.employmentStatus === 'active' ? 'tag-lime' : 'tag-red'
                          }`}>
                            {fac.employmentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Shortcuts & Operations Notes */}
        <div className="space-y-6">
          <div className="card p-6 border-ink-800 bg-ink-900/50">
            <h3 className="font-display font-bold text-lg text-ink-100 mb-4">Operations Shortcuts</h3>
            <div className="grid grid-cols-1 gap-3">
              <Link to="/office/admissions" className="p-4 rounded-xl border border-ink-800 hover:border-sky-400/30 bg-ink-950/40 hover:bg-ink-800/20 transition-all flex justify-between items-center group">
                <div>
                  <span className="block font-semibold text-ink-200 text-sm">Admissions Registry</span>
                  <span className="text-xs text-ink-500">Record & verify student entries</span>
                </div>
                <ArrowRight size={16} className="text-ink-500 group-hover:text-sky-300 transition-colors" />
              </Link>
              <Link to="/office/faculty" className="p-4 rounded-xl border border-ink-800 hover:border-lime-400/30 bg-ink-950/40 hover:bg-ink-800/20 transition-all flex justify-between items-center group">
                <div>
                  <span className="block font-semibold text-ink-200 text-sm">Faculty Profiles</span>
                  <span className="text-xs text-ink-500">Manage teacher classifications</span>
                </div>
                <ArrowRight size={16} className="text-ink-500 group-hover:text-lime-300 transition-colors" />
              </Link>
              <Link to="/office/salary" className="p-4 rounded-xl border border-ink-800 hover:border-emerald-400/30 bg-ink-950/40 hover:bg-ink-800/20 transition-all flex justify-between items-center group">
                <div>
                  <span className="block font-semibold text-ink-200 text-sm">Payroll Records</span>
                  <span className="text-xs text-ink-500">Manage monthly salary slips</span>
                </div>
                <ArrowRight size={16} className="text-ink-500 group-hover:text-emerald-350 transition-colors" />
              </Link>
            </div>
          </div>

          <div className="card p-6 border-ink-800 bg-ink-900/50 flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-ink-100 mb-3">Office Administration Note</h3>
              <p className="text-sm text-ink-400 mb-4 leading-relaxed">
                Ensure all newly admitted students have correct registration credentials. Monthly payroll allocations should be cross-verified against allowances and deductions.
              </p>
            </div>
            <div className="bg-ink-950/50 p-4 border border-ink-800 rounded-xl flex items-center gap-3 text-xs text-ink-400 mt-2">
              <ShieldAlert size={16} className="text-sky-300 shrink-0" />
              <span>Administrative records are securely logged and auditable.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
