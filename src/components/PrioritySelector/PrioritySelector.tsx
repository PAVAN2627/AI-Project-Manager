import { useState } from 'react'
import { Zap, AlertTriangle, Clock, AlertCircle } from 'lucide-react'

import type { Task, TaskPriority } from '../../types/task'
import { TASK_PRIORITY_LABEL, TASK_PRIORITY_ORDER } from '../../types/task'

type PrioritySelectorProps = {
  tasks: Task[]
  onUpdateTask: (task: Task) => void
}

const PRIORITY_ICONS: Record<TaskPriority, typeof Zap> = {
  low: Clock,
  medium: Zap,
  high: AlertTriangle,
  critical: AlertCircle,
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'text-muted-foreground',
  medium: 'text-primary',
  high: 'text-warning',
  critical: 'text-destructive',
}

export function PrioritySelector({ tasks, onUpdateTask }: PrioritySelectorProps) {
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all')

  const filteredTasks = selectedPriority === 'all' 
    ? tasks 
    : tasks.filter(task => task.priority === selectedPriority)

  if (tasks.length === 0) {
    return (
      <div className="p-6 text-center">
        <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No tasks available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Priority Filter Buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setSelectedPriority('all')}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            selectedPriority === 'all'
              ? 'bg-primary text-white shadow-lg border-2 border-primary'
              : 'bg-white/10 text-gray-300 hover:bg-white/15 border-2 border-white/20 hover:border-white/30'
          }`}
        >
          All ({tasks.length})
        </button>
        {TASK_PRIORITY_ORDER.map((priority) => {
          const Icon = PRIORITY_ICONS[priority]
          const count = tasks.filter(t => t.priority === priority).length
          return (
            <button
              key={priority}
              onClick={() => setSelectedPriority(priority)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                selectedPriority === priority
                  ? 'bg-primary text-white shadow-lg border-2 border-primary'
                  : 'bg-white/10 text-gray-300 hover:bg-white/15 border-2 border-white/20 hover:border-white/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              {TASK_PRIORITY_LABEL[priority]} ({count})
            </button>
          )
        })}
      </div>

      {/* Task Cards in Horizontal Layout - Similar to AI UI Decision Plan */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm">
              No tasks found for the selected priority.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => {
              const Icon = PRIORITY_ICONS[task.priority]
              return (
                <div key={task.id} className="card-glass p-4 hover:bg-white/10 transition-colors border border-white/10">
                  <div className="space-y-3">
                    {/* Task Title */}
                    <h4 className="font-medium text-sm line-clamp-2 min-h-[2.5rem] leading-tight">{task.title}</h4>
                    
                    {/* Priority and Status Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${PRIORITY_COLORS[task.priority]}`} />
                        <span className="text-sm font-medium text-muted-foreground">Priority:</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        task.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                        task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {TASK_PRIORITY_LABEL[task.priority]}
                      </span>
                    </div>

                    {/* Status Row */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        task.status === 'done' ? 'bg-green-500/20 text-green-400' :
                        task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                        task.status === 'blocked' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Priority Selector Row */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Change:</span>
                      <select
                        value={task.priority}
                        onChange={(e) => onUpdateTask({ ...task, priority: e.target.value as TaskPriority })}
                        className="px-2 py-1 bg-black/20 border border-white/10 rounded text-xs focus:outline-none focus:border-primary"
                      >
                        {TASK_PRIORITY_ORDER.map((priority) => (
                          <option key={priority} value={priority} className="bg-gray-800 text-white">
                            {TASK_PRIORITY_LABEL[priority]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
