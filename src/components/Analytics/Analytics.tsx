import { useMemo } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Award,
  Activity
} from 'lucide-react'
import type { Task } from '../../types/task'
import type { User } from '../../types/user'

interface AnalyticsProps {
  tasks: Task[]
  users: User[]
  teams: Array<{id: string, name: string, members: Array<{id: string, name: string, email: string, role?: string}>}>
}

export function Analytics({ tasks, users, teams }: AnalyticsProps) {
  const analytics = useMemo(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'done').length
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
    const blockedTasks = tasks.filter(t => t.status === 'blocked').length
    const todoTasks = tasks.filter(t => t.status === 'todo').length
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    
    const priorityBreakdown = {
      critical: tasks.filter(t => t.priority === 'critical').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    }
    
    const assignmentStats = {
      assigned: tasks.filter(t => t.assigneeId).length,
      unassigned: tasks.filter(t => !t.assigneeId).length,
    }
    
    const userProductivity = users.map(user => {
      const userTasks = tasks.filter(t => t.assigneeId === user.id)
      const completed = userTasks.filter(t => t.status === 'done').length
      const total = userTasks.length
      return {
        user,
        total,
        completed,
        rate: total > 0 ? (completed / total) * 100 : 0
      }
    }).sort((a, b) => b.rate - a.rate)
    
    const teamStats = teams.map(team => {
      const teamTasks = tasks.filter(t => 
        team.members.some(member => member.id === t.assigneeId)
      )
      const completed = teamTasks.filter(t => t.status === 'done').length
      return {
        team,
        total: teamTasks.length,
        completed,
        rate: teamTasks.length > 0 ? (completed / teamTasks.length) * 100 : 0
      }
    }).sort((a, b) => b.rate - a.rate)
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      todoTasks,
      completionRate,
      priorityBreakdown,
      assignmentStats,
      userProductivity,
      teamStats
    }
  }, [tasks, users, teams])

  if (tasks.length === 0) {
    return (
      <div className="card-glass p-12 text-center">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
        <p className="text-muted-foreground">Create some tasks to see analytics</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-glass p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <p className="text-2xl font-bold">{analytics.totalTasks}</p>
          <p className="text-sm text-muted-foreground">Total Tasks</p>
        </div>
        
        <div className="card-glass p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <p className="text-2xl font-bold">{analytics.completedTasks}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
          <div className="mt-2 w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${analytics.completionRate}%` }}
            />
          </div>
          <p className="text-xs text-green-400 mt-1">{analytics.completionRate.toFixed(1)}% Complete</p>
        </div>
        
        <div className="card-glass p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-2xl font-bold">{analytics.inProgressTasks}</p>
          <p className="text-sm text-muted-foreground">In Progress</p>
        </div>
        
        <div className="card-glass p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-500/20 flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-2xl font-bold">{analytics.blockedTasks}</p>
          <p className="text-sm text-muted-foreground">Blocked</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <div className="card-glass p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h3 className="font-semibold">Priority Breakdown</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(analytics.priorityBreakdown).map(([priority, count]) => {
              const percentage = analytics.totalTasks > 0 ? (count / analytics.totalTasks) * 100 : 0
              const colors = {
                critical: 'bg-red-500',
                high: 'bg-orange-500',
                medium: 'bg-yellow-500',
                low: 'bg-green-500'
              }
              return (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colors[priority as keyof typeof colors]}`} />
                    <span className="text-sm capitalize">{priority}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}</span>
                    <div className="w-20 bg-white/10 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${colors[priority as keyof typeof colors]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Assignment Stats */}
        <div className="card-glass p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-secondary" />
            <h3 className="font-semibold">Assignment Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Assigned Tasks</span>
              <span className="text-lg font-bold text-green-400">{analytics.assignmentStats.assigned}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Unassigned Tasks</span>
              <span className="text-lg font-bold text-orange-400">{analytics.assignmentStats.unassigned}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div 
                className="bg-green-400 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${analytics.totalTasks > 0 ? (analytics.assignmentStats.assigned / analytics.totalTasks) * 100 : 0}%` 
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalTasks > 0 ? 
                `${((analytics.assignmentStats.assigned / analytics.totalTasks) * 100).toFixed(1)}% of tasks are assigned` :
                'No tasks available'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Team Performance */}
      {teams.length > 0 && (
        <div className="card-glass p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Team Performance</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.teamStats.map((teamStat, index) => (
              <div key={teamStat.team.id} className="card-glass p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{teamStat.team.name}</h4>
                  {index === 0 && teamStat.rate > 0 && (
                    <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Award className="w-3 h-3 text-yellow-400" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tasks: {teamStat.total}</span>
                    <span>Done: {teamStat.completed}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${teamStat.rate}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{teamStat.rate.toFixed(1)}% completion rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Productivity */}
      <div className="card-glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">User Productivity</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.userProductivity.slice(0, 6).map((userStat, index) => (
            <div key={userStat.user.id} className="card-glass p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{userStat.user.name}</h4>
                {index === 0 && userStat.rate > 0 && (
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tasks: {userStat.total}</span>
                  <span>Done: {userStat.completed}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${userStat.rate}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{userStat.rate.toFixed(1)}% completion rate</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}