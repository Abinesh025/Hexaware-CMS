import { Info } from 'lucide-react'

export default function AboutPlatform() {
  const features = [
    "Role-based access for Admin, Staff, and Students",
    "Material upload and management",
    "Assessment and progress tracking",
    "Secure authentication",
    "Real-time communication and notifications"
  ]

  return (
    <div className="bg-ink-900 rounded-2xl p-6 md:p-8 shadow-sm border border-ink-800 transition-colors">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
          <Info className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-semibold text-ink-50">About E.G.S Learning Platform</h3>
      </div>
      
      <div className="text-ink-400 space-y-4">
        <p className="leading-relaxed">
          E.G.S Learning Platform is a centralized learning management system designed for students, staff, and administrators. It helps manage courses, materials, assessments, communication, progress tracking, and academic resources in one secure platform.
        </p>
        
        <div className="pt-2">
          <h4 className="font-semibold text-lg text-ink-50 mb-3">Key Features:</h4>
          <ul className="list-disc pl-5 space-y-2">
            {features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
