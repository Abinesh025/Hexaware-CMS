import { useAuth } from '../../context/AuthContext'
import { ArrowLeft, ExternalLink, Mail, Code, Briefcase, Share2, Compass, Award } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PlacementOffCampus() {
  const { user } = useAuth()

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-up">
      <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-ink-400 hover:text-lime-300 transition-colors mb-2 text-sm font-500">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ink-800 pb-4">
        <div>
          <h1 className="page-title text-2xl md:text-3xl">Off-Campus Placement Preparation</h1>
          <p className="text-ink-400 mt-1">Strategies, portals, and connection templates for off-campus drives</p>
        </div>
        <div className="shrink-0">
          <span className="tag-sky badge text-sm font-600 px-3 py-1.5 capitalize">{user?.department}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Portals and Preparation Sites */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section 1: Job Search Portals & Strategies */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-400/10 rounded-xl flex items-center justify-center text-sky-400">
                <Compass size={20} />
              </div>
              <h2 className="text-lg font-bold text-ink-50">1. Job Search & Application Channels</h2>
            </div>
            <p className="text-sm text-ink-400">Major portals to track off-campus job updates and application flows.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-ink-800/40 p-4 rounded-xl border border-ink-800 space-y-2">
                <h3 className="text-sm font-semibold text-sky-300">Outreach Portals</h3>
                <ul className="text-xs text-ink-300 space-y-2">
                  <li className="flex justify-between items-center bg-ink-950 p-2 rounded">
                    <span>LinkedIn Jobs & Networking</span>
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-300"><ExternalLink size={14} /></a>
                  </li>
                  <li className="flex justify-between items-center bg-ink-950 p-2 rounded">
                    <span>Naukri & Indeed Portals</span>
                    <a href="https://naukri.com" target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-300"><ExternalLink size={14} /></a>
                  </li>
                  <li className="flex justify-between items-center bg-ink-950 p-2 rounded">
                    <span>Instahyre & Hirist (Startup Tech)</span>
                    <a href="https://instahyre.com" target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-300"><ExternalLink size={14} /></a>
                  </li>
                </ul>
              </div>

              <div className="bg-ink-800/40 p-4 rounded-xl border border-ink-800 space-y-2">
                <h3 className="text-sm font-semibold text-lime-300">Off-Campus Preparation Sites</h3>
                <ul className="text-xs text-ink-300 space-y-2">
                  <li className="flex justify-between items-center bg-ink-950 p-2 rounded">
                    <span>LeetCode (Problem Solving)</span>
                    <a href="https://leetcode.com" target="_blank" rel="noreferrer" className="text-lime-400 hover:text-lime-300"><ExternalLink size={14} /></a>
                  </li>
                  <li className="flex justify-between items-center bg-ink-950 p-2 rounded">
                    <span>GeeksforGeeks (Interview Prep)</span>
                    <a href="https://geeksforgeeks.org" target="_blank" rel="noreferrer" className="text-lime-400 hover:text-lime-300"><ExternalLink size={14} /></a>
                  </li>
                  <li className="flex justify-between items-center bg-ink-950 p-2 rounded">
                    <span>HackerRank (Assessments Practice)</span>
                    <a href="https://hackerrank.com" target="_blank" rel="noreferrer" className="text-lime-400 hover:text-lime-300"><ExternalLink size={14} /></a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Referral Cold Outreach Templates */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center text-amber-400">
                <Mail size={20} />
              </div>
              <h2 className="text-lg font-bold text-ink-50">2. Cold Outreach & Referral Templates</h2>
            </div>
            <p className="text-sm text-ink-400">Use these structures when reaching out to recruiters or developers on LinkedIn for referral requests.</p>
            
            <div className="space-y-4">
              <div className="bg-ink-800/40 p-4 rounded-xl border border-ink-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">LinkedIn / Connection Note (300 Char Limit)</span>
                </div>
                <pre className="text-xs text-ink-300 whitespace-pre-wrap font-sans bg-ink-950 p-3 rounded border border-ink-800">
{`Hello [Name],
I hope you're doing well. I'm a pre-final year student at HIT Engineering College specializing in [Your Department]. I'm highly interested in the [Job Title] role at [Company] (Requisition ID: [ID]). Could you please review my profile for a potential referral?
Thanks!`}
                </pre>
              </div>

              <div className="bg-ink-800/40 p-4 rounded-xl border border-ink-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Cold Email Template</span>
                </div>
                <pre className="text-xs text-ink-300 whitespace-pre-wrap font-sans bg-ink-950 p-3 rounded border border-ink-800">
{`Subject: Referral Request - [Job Title] - [Your Name]

Dear [Name/Recruiter],

I hope you are having a great week.

My name is [Your Name], currently pursuing my B.E. in [Your Department] at HIT Engineering College. I came across the open role of [Job Title] (ID: [Requisition ID]) at [Company] and felt my technical background in [list 2 skills, e.g. React / Node.js or Microcontrollers] aligns well with your team's goals.

I have attached my resume for your reference. I would be extremely grateful if you could refer me for this position.

Thank you for your time and consideration.

Best regards,
[Your Name]
[LinkedIn Profile Link]
[GitHub Profile Link]`}
                </pre>
              </div>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Portfolio & Networking tips */}
        <div className="space-y-6">
          {/* Card: Portfolio Building */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-3 text-lime-400">
              <Code size={20} />
              <h2 className="text-lg font-bold text-ink-50">GitHub & Projects</h2>
            </div>
            <p className="text-xs text-ink-400">Your profile is your digital proof of skill. Optimize it with these practices:</p>
            <ul className="space-y-3 text-xs text-ink-300 list-disc pl-4">
              <li><strong>GitHub Readme:</strong> Create an elegant profile README documenting your key tech stack and current achievements.</li>
              <li><strong>Project Documentation:</strong> Write thorough README files for your top 3 projects detailing installation steps, architecture diagrams, and APIs used.</li>
              <li><strong>Deployments:</strong> Host your client interfaces on platforms like Netlify, Vercel, or GitHub Pages. Make sure live URLs work!</li>
            </ul>
          </div>

          {/* Card: Important Rules */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <Award size={20} />
              <h2 className="text-lg font-bold text-ink-50">General Rules</h2>
            </div>
            <ul className="space-y-3 text-xs text-ink-300">
              <li className="flex gap-2">
                <span className="text-red-400">●</span>
                <span>Track application details (Company, Date Applied, Status) in a spreadsheet to stay organized.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-400">●</span>
                <span>Consistently solve at least 1-2 coding problems daily on LeetCode to build problem-solving muscle.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-400">●</span>
                <span>Interact with technical communities on Reddit, Discord, or StackOverflow to hear about off-campus openings early.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
