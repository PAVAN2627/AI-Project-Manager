import { useState } from 'react'
import { User, UserCheck, Users } from 'lucide-react'

import type { Task, TaskStatus } from '../../types/task'
import { TASK_STATUS_LABEL, TASK_STATUS_ORDER, TASK_PRIORITY_LABEL } from '../../types/task'

type TeamAssignmentPanelProps = {
  tasks: Task[]
  teams: Array<{id: string, name: string, members: Array<{id: string, name: string, email: string, role?: string}>}>
  onUpdateTask: (task: Task) => void
}

export function TeamAssignmentPanel({ tasks, teams, onUpdateTask }: TeamAssignmentPanelProps) {
  const [selectedUser, setSelectedUser] = useState<string | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all')
  const [selectedTeam, setSelectedTeam] = useState<string | 'all'>('all')

  const filteredTasks = tasks.filter(task => {
    const userMatch = selectedUser === 'all' || task.assigneeId === selectedUser || 
                     (selectedUser === 'unassigned' && !task.assigneeId)
    const statusMatch = selectedStatus === 'all' || task.status === selectedStatus
    const teamMatch = selectedTeam === 'all' || teams.some(team => 
      team.id === selectedTeam && team.members.some(member => member.id === task.assigneeId)
    )
    return userMatch && statusMatch && teamMatch
  })

  // Get all team members for display purposes
  const allTeamMembers = teams.flatMap(team => team.members)

  if (tasks.length === 0) {
    return (
      <div className="p-4 text-center">
        <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No tasks available</p>
        {teams.length === 0 && (
          <p className="text-xs text-muted-foreground mt-2">Create teams to assign tasks to team members</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Filter by Team</label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
          >
            <option value="all" className="bg-gray-800 text-white">All Teams</option>
            {teams.length === 0 ? (
              <option disabled className="bg-gray-800 text-gray-400">No teams created yet</option>
            ) : (
              teams.map(team => (
                <option key={team.id} value={team.id} className="bg-gray-800 text-white">
                  {team.name} ({team.members.length} members)
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Filter by Assignee</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
          >
            <option value="all" className="bg-gray-800 text-white">All Assignees ({tasks.length})</option>
            {/* Show team members only */}
            {teams.flatMap(team => team.members).map(member => {
              const userTasks = tasks.filter(t => t.assigneeId === member.id).length
              return (
                <option key={member.id} value={member.id} className="bg-gray-800 text-white">
                  {member.name} ({userTasks}) - Team Member
                </option>
              )
            })}
            <option value="unassigned" className="bg-gray-800 text-white">
              Unassigned ({tasks.filter(t => !t.assigneeId).length})
            </option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Filter by Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as TaskStatus | 'all')}
            className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
          >
            <option value="all" className="bg-gray-800 text-white">All Statuses</option>
            {TASK_STATUS_ORDER.map(status => (
              <option key={status} value={status} className="bg-gray-800 text-white">
                {TASK_STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Horizontal Task Cards - 3 per row */}
      {/* Horizontal Task Cards - 2 per row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground text-sm">
              {teams.length === 0 
                ? "Create teams first to assign tasks to team members"
                : "No tasks found for the selected filters."
              }
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const assignedTeam = teams.find(team => 
              team.members.some(member => member.id === task.assigneeId)
            )
            const assignedMember = assignedTeam?.members.find(member => member.id === task.assigneeId)
            const displayName = assignedMember?.name || 'Unassigned'
            
            return (
              <div key={task.id} className="card-glass p-4 hover:bg-white/10 transition-colors border border-white/10">
                <div className="space-y-3">
                  {/* Task Title */}
                  <h4 className="font-medium text-sm line-clamp-2 min-h-[2.5rem] leading-tight">{task.title}</h4>
                  
                  {/* Status Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      task.status === 'done' ? 'bg-green-500/20 text-green-400' :
                      task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                      task.status === 'blocked' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {TASK_STATUS_LABEL[task.status]}
                    </span>
                  </div>

                  {/* Priority Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Priority:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      task.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                      task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {TASK_PRIORITY_LABEL[task.priority]}
                    </span>
                  </div>

                  {/* Team Row */}
                  {assignedTeam && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Team:</span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                        {assignedTeam.name}
                      </span>
                    </div>
                  )}

                  {/* Current Assignee Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Assigned:</span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-white/10 text-muted-foreground">
                      {displayName}
                    </span>
                  </div>
                  
                  {/* Assignment Selector Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Change:</span>
                    <select
                      value={task.assigneeId || ''}
                      onChange={(e) => onUpdateTask({ 
                        ...task, 
                        assigneeId: e.target.value || null 
                      })}
                      className="px-2 py-1 bg-black/20 border border-white/10 rounded text-xs focus:outline-none focus:border-primary"
                    >
                      <option value="">Unassigned</option>
                      {/* Team members only */}
                      {teams.flatMap(team => 
                        team.members.map(member => (
                          <option key={member.id} value={member.id} className="bg-gray-800 text-white">
                            {member.name} ({team.name})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
