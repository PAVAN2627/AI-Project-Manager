import { useState } from 'react'
import { 
  Sparkles, 
  Wand2, 
  Layout, 
  Settings, 
  Eye,
  Zap,
  Brain,
  Lightbulb
} from 'lucide-react'
import { useEnhancedTamboUI } from '../../tambo/useEnhancedTamboUI'
import type { IntentInterpretation } from '../../app/intentApi'

interface UIGeneratorProps {
  onGenerateInterface: (prompt: string) => void
  isGenerating: boolean
  currentIntent: IntentInterpretation | null
}

const PRESET_PROMPTS = [
  {
    category: 'Task Management',
    prompts: [
      'Show me all high priority tasks in a kanban board',
      'Display blocked tasks with team assignments',
      'Create a priority selector for urgent tasks',
      'Show completed tasks with analytics',
      'Display all tasks with team member assignments'
    ]
  },
  {
    category: 'Analytics & Reports',
    prompts: [
      'Show me project analytics and completion rates',
      'Display team performance metrics',
      'Create a dashboard with task statistics',
      'Show priority breakdown and user productivity',
      'Generate a comprehensive project report'
    ]
  },
  {
    category: 'Team Collaboration',
    prompts: [
      'Show team assignments and member workload',
      'Display unassigned tasks for team allocation',
      'Create a team performance dashboard',
      'Show collaborative task management interface',
      'Display team member productivity metrics'
    ]
  },
  {
    category: 'Custom Views',
    prompts: [
      'Create a minimal task view without distractions',
      'Show only in-progress tasks with priorities',
      'Display a comprehensive project overview',
      'Create a focus mode for individual productivity',
      'Show a timeline view of task completion'
    ]
  }
]

const INTERFACE_TEMPLATES = [
  {
    name: 'Project Dashboard',
    description: 'Complete overview with kanban, analytics, and team assignments',
    icon: Layout,
    prompt: 'Create a comprehensive project dashboard with kanban board, analytics, and team assignments'
  },
  {
    name: 'Priority Focus',
    description: 'Focus on high-priority tasks with priority selector',
    icon: Zap,
    prompt: 'Show high priority tasks with priority selector and quick actions'
  },
  {
    name: 'Team Collaboration',
    description: 'Team-focused view with assignments and collaboration tools',
    icon: Settings,
    prompt: 'Display team assignments, member workload, and collaboration features'
  },
  {
    name: 'Analytics View',
    description: 'Data-driven insights with charts and metrics',
    icon: Brain,
    prompt: 'Show comprehensive analytics with task metrics, team performance, and insights'
  }
]

export function UIGenerator({ onGenerateInterface, isGenerating, currentIntent }: UIGeneratorProps) {
  const [customPrompt, setCustomPrompt] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(PRESET_PROMPTS[0].category)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { isTamboAvailable, error } = useEnhancedTamboUI()

  const handleGenerateCustom = () => {
    if (customPrompt.trim()) {
      onGenerateInterface(customPrompt.trim())
    }
  }

  const handlePresetPrompt = (prompt: string) => {
    onGenerateInterface(prompt)
  }

  const handleTemplateSelect = (template: typeof INTERFACE_TEMPLATES[0]) => {
    onGenerateInterface(template.prompt)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center animate-pulse-glow">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">
          <span className="text-gradient">AI Interface</span> Generator
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Describe your ideal project interface and watch it come to life with AI
        </p>
        {isTamboAvailable && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
            <Sparkles className="w-4 h-4" />
            Tambo AI Enhanced
          </div>
        )}
      </div>

      {/* Custom Prompt Input */}
      <div className="card-glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Custom Interface Prompt</h3>
        </div>
        <div className="space-y-4">
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Describe your ideal interface... e.g., 'Show me all blocked tasks with team assignments and priority levels'"
            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            rows={3}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Brain className="w-4 h-4" />
              AI will interpret your request and generate the perfect interface
            </div>
            <button
              onClick={handleGenerateCustom}
              disabled={!customPrompt.trim() || isGenerating}
              className="btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Interface
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Interface Templates */}
      <div className="card-glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <Layout className="w-5 h-5 text-secondary" />
          <h3 className="font-semibold">Quick Templates</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INTERFACE_TEMPLATES.map((template) => (
            <button
              key={template.name}
              onClick={() => handleTemplateSelect(template)}
              disabled={isGenerating}
              className="card-glass p-4 text-left hover:bg-white/10 transition-colors border border-white/10 hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <template.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1">{template.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preset Prompts */}
      <div className="card-glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Preset Prompts</h3>
        </div>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESET_PROMPTS.map((category) => (
            <button
              key={category.category}
              onClick={() => setSelectedCategory(category.category)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.category
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10'
              }`}
            >
              {category.category}
            </button>
          ))}
        </div>

        {/* Prompts */}
        <div className="space-y-2">
          {PRESET_PROMPTS.find(cat => cat.category === selectedCategory)?.prompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handlePresetPrompt(prompt)}
              disabled={isGenerating}
              className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm border border-white/10 hover:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="flex-1">{prompt}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Interface Status */}
      {currentIntent && (
        <div className="card-glass p-6 border border-green-500/30 bg-green-500/5">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold text-green-400">Current Interface</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Kanban:</span>
              <span className={currentIntent.showKanban ? 'text-green-400' : 'text-red-400'}>
                {currentIntent.showKanban ? 'On' : 'Off'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Priority:</span>
              <span className={currentIntent.showPrioritySelector ? 'text-green-400' : 'text-red-400'}>
                {currentIntent.showPrioritySelector ? 'On' : 'Off'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Team:</span>
              <span className={currentIntent.showTeamAssignment ? 'text-green-400' : 'text-red-400'}>
                {currentIntent.showTeamAssignment ? 'On' : 'Off'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Filter:</span>
              <span className="text-primary">{currentIntent.filterStatus}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="card-glass p-4 border border-red-500/30 bg-red-500/5">
          <div className="flex items-center gap-2 text-red-400">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Generation Error</span>
          </div>
          <p className="text-sm text-red-300 mt-1">{error}</p>
        </div>
      )}

      {/* Advanced Options */}
      <div className="card-glass p-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium mb-4 hover:text-primary transition-colors"
        >
          <Settings className="w-4 h-4" />
          Advanced Options
          <div className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
            ▼
          </div>
        </button>
        
        {showAdvanced && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Interface Style</label>
                <select className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary">
                  <option>Modern Glass</option>
                  <option>Minimal Clean</option>
                  <option>Dark Professional</option>
                  <option>Colorful Vibrant</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Animation Level</label>
                <select className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary">
                  <option>Smooth (Recommended)</option>
                  <option>Minimal</option>
                  <option>None</option>
                  <option>Enhanced</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" defaultChecked />
                Enable responsive design
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" defaultChecked />
                Include accessibility features
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}