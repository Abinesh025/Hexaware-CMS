import { useState } from 'react'
import { Palette, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className="bg-ink-900 rounded-2xl p-6 md:p-8 shadow-sm border border-ink-800 transition-colors relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
          <Palette className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-ink-50">Change Theme</h3>
          <p className="text-sm font-medium text-ink-400">Hover to select your preferred appearance</p>
        </div>
      </div>

      {isHovered && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-ink-800 p-1 rounded-xl border border-ink-700 shadow-sm animate-in fade-in slide-in-from-right-4 duration-200">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              theme === 'light' 
                ? 'bg-ink-100 text-ink-900 shadow-sm' 
                : 'text-ink-400 hover:text-ink-100'
            }`}
          >
            <Sun className="w-4 h-4" />
            Light
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              theme === 'dark' 
                ? 'bg-ink-100 text-ink-900 shadow-sm' 
                : 'text-ink-400 hover:text-ink-100'
            }`}
          >
            <Moon className="w-4 h-4" />
            Night
          </button>
        </div>
      )}
    </div>
  )
}
