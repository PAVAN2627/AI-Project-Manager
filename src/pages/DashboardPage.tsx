import { useEffect, useMemo, useState } from 'react'

import { useAuthUser } from '../app/useAuthUser'
import { KanbanBoard } from '../components/KanbanBoard/KanbanBoard'
import { NewTaskForm } from '../components/NewTaskForm/NewTaskForm'
import { PrioritySelector } from '../components/PrioritySelector/PrioritySelector'
import { PromptBar } from '../components/PromptBar/PromptBar'
import { Sidebar } from '../components/Sidebar/Sidebar'
import { TeamAssignmentPanel } from '../components/TeamAssignmentPanel/TeamAssignmentPanel'
import { TeamCreation } from '../components/TeamCreation/TeamCreation'
import { Analytics } from '../components/Analytics/Analytics'
import { IntentHistory } from '../components/IntentHistory/IntentHistory'
import { UIGenerator } from '../components/UIGenerator/UIGenerator'
import { mockUsers } from '../data/mockUsers'
import type { IntentFilterStatus, IntentInterpretation } from '../app/intentApi'
import { interpretIntentWithTambo } from '../app/tamboIntentService'
import { createTask, subscribeTasks, updateTask } from '../app/taskApi'
import { createTeam, updateTeam, deleteTeam, subscribeTeams, type Team } from '../app/teamApi'
import { addIntentToHistory } from '../app/intentHistoryApi'
import type { Task } from '../types/task'
import { Brain, Sparkles, Rocket, Target, ListChecks, Ban, Zap, ChevronDown, Loader2 } from 'lucide-react'

interface UIPlan {
  kanban: { enabled: boolean; filterStatus?: 'todo' | 'in_progress' | 'blocked' | 'done' }
  prioritySelector: { enabled: boolean }
  teamAssignment: { enabled: boolean }
}

const INITIAL_PLAN: UIPlan = {
  kanban: { enabled: true },
  prioritySelector: { enabled: false },
  teamAssignment: { enabled: false },
}

const KANBAN_FILTER_STATUS_MAP: Record<IntentFilterStatus, UIPlan['kanban']['filterStatus']> = {
  All: undefined,
  Todo: 'todo',
  'In Progress': 'in_progress',
  Blocked: 'blocked',
  Done: 'done',
}

function toKanbanFilterStatus(status: IntentFilterStatus): UIPlan['kanban']['filterStatus'] {
  return KANBAN_FILTER_STATUS_MAP[status]
}

function toUIPlan(intent: IntentInterpretation): UIPlan {
  const filterStatus = toKanbanFilterStatus(intent.filterStatus)

  return {
    kanban: {
      enabled: intent.showKanban,
      filterStatus,
    },
    prioritySelector: { enabled: intent.showPrioritySelector },
    teamAssignment: { enabled: intent.showTeamAssignment },
  }
}

export function DashboardPage() {
  const { user } = useAuthUser()
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskError, setTaskError] = useState<string | null>(null)
  const [isTasksBusy, setIsTasksBusy] = useState(false)
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [intent, setIntent] = useState<IntentInterpretation | null>(null)
  const [intentError, setIntentError] = useState<string | null>(null)
  const [isInterpretingIntent, setIsInterpretingIntent] = useState(false)
  const [isPlanDetailsOpen, setIsPlanDetailsOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState('ai-interface')
  const [teams, setTeams] = useState<Team[]>([])

  const [activePlan, setActivePlan] = useState<UIPlan>(INITIAL_PLAN)
  const [hasAttemptedIntent, setHasAttemptedIntent] = useState(false)

  const visibleTasks = useMemo(() => {
    if (!activePlan.kanban.enabled) return tasks
    if (activePlan.kanban.filterStatus) {
      return tasks.filter((t) => t.status === activePlan.kanban.filterStatus)
    }
    return tasks
  }, [activePlan, tasks])

  useEffect(() => {
    if (!user) {
      setTasks([])
      setTaskError(null)
      setIsLoadingTasks(false)
      return
    }

    setIsLoadingTasks(true)
    setTaskError(null)

    const unsubscribe = subscribeTasks(
      user.uid,
      (next) => {
        setTasks(next)
        setIsLoadingTasks(false)
      },
      (error) => {
        console.warn('[firestore] Failed to subscribe to tasks', error)
        setTaskError(error instanceof Error ? error.message : 'Failed to load tasks from Firestore.')
        setIsLoadingTasks(false)
      },
    )

    return () => {
      unsubscribe()
    }
  }, [user])

  // Subscribe to teams
  useEffect(() => {
    if (!user) {
      setTeams([])
      return
    }

    const unsubscribe = subscribeTeams(
      user.uid,
      (next) => {
        console.log('Teams subscription update:', next)
        setTeams(next)
      },
      (error) => {
        console.error('[firestore] Failed to subscribe to teams', error)
      },
    )

    return () => {
      unsubscribe()
    }
  }, [user])

  function handleCreateTask(title: string) {
    if (!user) return

    setIsTasksBusy(true)
    setTaskError(null)
    void createTask(user.uid, { title })
      .catch((error) => {
        setTaskError(error instanceof Error ? error.message : 'Failed to create task')
      })
      .finally(() => {
        setIsTasksBusy(false)
      })
  }

  function handleUpdateTask(nextTask: Task) {
    if (!user) return

    const previousTask = tasks.find((t) => t.id === nextTask.id) ?? null

    const patch: { status?: Task['status']; priority?: Task['priority']; assigneeId?: string | null } = {}

    if (!previousTask || previousTask.status !== nextTask.status) {
      patch.status = nextTask.status
    }

    if (!previousTask || previousTask.priority !== nextTask.priority) {
      patch.priority = nextTask.priority
    }

    if (!previousTask || previousTask.assigneeId !== nextTask.assigneeId) {
      patch.assigneeId = nextTask.assigneeId ?? null
    }

    if (Object.keys(patch).length === 0) return

    setIsTasksBusy(true)
    setTaskError(null)
    void updateTask(user.uid, nextTask.id, patch)
      .catch((error) => {
        setTaskError(error instanceof Error ? error.message : 'Failed to update task')
      })
      .finally(() => {
        setIsTasksBusy(false)
      })
  }

  async function handleGenerateInterface(rawInput: string) {
    const trimmed = rawInput.trim()
    if (!trimmed) {
      setIntentError('Please enter a prompt before generating an interface.')
      setHasAttemptedIntent(true)
      setIsPlanDetailsOpen(true)
      return
    }

    console.log('🚀 Starting interface generation...')
    console.log('Input:', trimmed)
    console.log('Tambo API key available:', !!import.meta.env.VITE_TAMBO_API_KEY)

    setIntentError(null)
    setHasAttemptedIntent(true)
    setIsPlanDetailsOpen(true)
    setIsInterpretingIntent(true)
    setActiveSection('ai-interface')
    
    try {
      console.log('🚀 Generating interface for prompt:', trimmed)
      const nextIntent = await interpretIntentWithTambo(trimmed, true) // Pass true to indicate Tambo is available
      console.log('✅ Intent received:', nextIntent)
      
      setIntent(nextIntent)
      setActivePlan(toUIPlan(nextIntent))
      
      // Add to intent history
      if (user) {
        try {
          await addIntentToHistory(user.uid, trimmed, nextIntent)
        } catch (error) {
          console.warn('Failed to save intent to history:', error)
        }
      }
    } catch (error) {
      console.error('❌ Failed to interpret intent:', error)
      setIntentError(error instanceof Error ? error.message : 'Failed to interpret intent.')
    } finally {
      setIsInterpretingIntent(false)
    }
  }

  const handleApplyIntent = (newIntent: IntentInterpretation, prompt: string) => {
    setIntent(newIntent)
    setActivePlan(toUIPlan(newIntent))
    setPrompt(prompt)
    setHasAttemptedIntent(true)
    setActiveSection('ai-interface')
  }

  const handleCreateTeam = async (teamName: string, members: Array<{id: string, name: string, email: string, role?: string}>) => {
    console.log('handleCreateTeam called with:', { teamName, members, userExists: !!user })
    
    if (!user) {
      console.error('No user authenticated for team creation')
      alert('Please log in to create teams')
      return
    }
    
    console.log('User authenticated, creating team:', { userId: user.uid, teamName, members })
    
    try {
      await createTeam(user.uid, { name: teamName, members })
      console.log('Team created successfully in Firebase')
    } catch (error) {
      console.error('Failed to create team:', error)
      alert(`Failed to create team: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    if (!user) return
    
    try {
      await deleteTeam(teamId)
      console.log('Team deleted successfully')
    } catch (error) {
      console.error('Failed to delete team:', error)
    }
  }

  const handleUpdateTeam = async (teamId: string, updatedTeam: { name: string; members: Array<{id: string, name: string, email: string, role?: string}> }) => {
    if (!user) return
    
    try {
      await updateTeam(teamId, updatedTeam)
      console.log('Team updated successfully')
    } catch (error) {
      console.error('Failed to update team:', error)
    }
  }

  const handleSidebarNavigation = (section: string) => {
    setActiveSection(section)
    
    switch (section) {
      case 'all-tasks':
        setActivePlan({
          kanban: { enabled: true },
          prioritySelector: { enabled: false },
          teamAssignment: { enabled: false },
        })
        setHasAttemptedIntent(true)
        break
      case 'quick-actions':
        setActivePlan({
          kanban: { enabled: false },
          prioritySelector: { enabled: true },
          teamAssignment: { enabled: true },
        })
        setHasAttemptedIntent(true)
        break
      case 'analytics':
        setActivePlan({
          kanban: { enabled: false },
          prioritySelector: { enabled: false },
          teamAssignment: { enabled: false },
        })
        setHasAttemptedIntent(true)
        break
      case 'intent-history':
        setIsPlanDetailsOpen(true)
        break
      case 'ui-generator':
        setActivePlan({
          kanban: { enabled: false },
          prioritySelector: { enabled: false },
          teamAssignment: { enabled: false },
        })
        setHasAttemptedIntent(true)
        setPrompt('Show me all tasks with priorities and team assignments')
        break
      case 'create-team':
        setActivePlan({
          kanban: { enabled: false },
          prioritySelector: { enabled: false },
          teamAssignment: { enabled: false },
        })
        setHasAttemptedIntent(true)
        break
      default:
        setActivePlan(INITIAL_PLAN)
        setHasAttemptedIntent(false)
        setPrompt('')
        break
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-hero">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-radial pointer-events-none" />
      
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onNavigate={handleSidebarNavigation}
        activeSection={activeSection}
      />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        {/* Header - Only show on main AI interface */}
        {activeSection === 'ai-interface' && (
          <header className="sticky top-0 z-10 glass border-b border-white/10">
            <div className="p-6 lg:p-8 max-w-7xl mx-auto">
              {/* Title section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center animate-pulse-glow">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                  <span className="text-gradient">AI-Powered</span> Project Manager
                </h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Describe your needs in natural language and watch your interface{' '}
                  <span className="text-primary font-medium">transform intelligently</span>
                </p>
              </div>
              
              {/* Prompt section */}
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-2 text-sm text-primary font-medium mb-3">
                  <Sparkles className="w-4 h-4" />
                  What would you like to see?
                </div>
                <PromptBar
                  value={prompt}
                  isBusy={isInterpretingIntent}
                  onChange={setPrompt}
                  onSubmit={handleGenerateInterface}
                />
                
                {!hasAttemptedIntent && (
                  <div className="mt-6 animate-fade-in">
                    <p className="text-sm text-muted-foreground mb-3">Try these examples:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { icon: Ban, text: 'Blocked Tasks', prompt: 'Show me blocked tasks that need immediate attention with priority management' },
                        { icon: Target, text: 'Team Workflow', prompt: 'Create a complete team workflow with task assignments and priority management' },
                        { icon: Zap, text: 'Project Dashboard', prompt: 'Display a comprehensive project dashboard with analytics and team performance' },
                      ].map((example, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setPrompt(example.prompt)
                            handleGenerateInterface(example.prompt)
                          }}
                          className="btn-ghost text-sm py-2 px-4"
                        >
                          <example.icon className="w-4 h-4" />
                          {example.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Main content */}
        <main className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Show horizontal layout when both priority and team assignment are enabled */}
          {activePlan.prioritySelector.enabled && activePlan.teamAssignment.enabled ? (
            <div className="space-y-6">
              {/* Horizontal layout for Quick Actions */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Priority Selector */}
                <div className="card-glass overflow-hidden animate-slide-in-left">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-warning" />
                    <h3 className="font-semibold">Priority Selector</h3>
                  </div>
                  <div className="p-4">
                    <PrioritySelector tasks={tasks} onUpdateTask={handleUpdateTask} />
                  </div>
                </div>

                {/* Team Assignment */}
                <div className="card-glass overflow-hidden animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                  <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                    <Target className="w-5 h-5 text-secondary" />
                    <h3 className="font-semibold">Team Assignment</h3>
                  </div>
                  <div className="p-4">
                    <TeamAssignmentPanel tasks={tasks} teams={teams} onUpdateTask={handleUpdateTask} />
                  </div>
                </div>
              </div>
            </div>
          ) : activePlan.teamAssignment.enabled && !activePlan.prioritySelector.enabled ? (
            /* Team Assignment Full Width */
            <div className="space-y-6">
              <div className="card-glass overflow-hidden animate-slide-in-up">
                <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
                  <Target className="w-6 h-6 text-secondary" />
                  <h2 className="text-xl font-semibold">Team Assignment</h2>
                </div>
                <div className="p-6">
                  <TeamAssignmentPanel tasks={tasks} teams={teams} onUpdateTask={handleUpdateTask} />
                </div>
              </div>
            </div>
          ) : activePlan.prioritySelector.enabled && !activePlan.teamAssignment.enabled ? (
            /* Priority Selector Full Width */
            <div className="space-y-6">
              <div className="card-glass overflow-hidden animate-slide-in-up">
                <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-warning" />
                  <h2 className="text-xl font-semibold">Priority Management</h2>
                </div>
                <div className="p-6">
                  <PrioritySelector tasks={tasks} onUpdateTask={handleUpdateTask} />
                </div>
              </div>
            </div>
          ) : activeSection === 'all-tasks' ? (
            /* All Tasks with Add Task Form */
            <div className="grid lg:grid-cols-[1fr_320px] gap-6">
              {/* Main area - Kanban Board */}
              <div className="min-h-[500px]">
                {isLoadingTasks ? (
                  <div className="card-glass p-12 text-center">
                    <Loader2 className="w-10 h-10 mx-auto mb-4 text-primary animate-spin" />
                    <p className="text-muted-foreground">Loading your tasks...</p>
                  </div>
                ) : (
                  <KanbanBoard tasks={visibleTasks} users={mockUsers} onUpdateTask={handleUpdateTask} />
                )}
              </div>

              {/* Side panel with Add Task Form */}
              <div className="space-y-4">
                <NewTaskForm
                  isBusy={isTasksBusy || isLoadingTasks}
                  error={taskError}
                  onCreateTask={handleCreateTask}
                />
              </div>
            </div>
          ) : (
            /* Full Width Layout for all other sections */
            <div className="min-h-[500px]">
              {activeSection === 'create-team' ? (
                <TeamCreation 
                  onCreateTeam={handleCreateTeam} 
                  existingTeams={teams}
                  onDeleteTeam={handleDeleteTeam}
                  onUpdateTeam={handleUpdateTeam}
                />
              ) : activeSection === 'analytics' ? (
                <Analytics tasks={tasks} users={mockUsers} teams={teams} />
              ) : activeSection === 'intent-history' ? (
                <IntentHistory onApplyIntent={handleApplyIntent} currentIntent={intent} />
              ) : activeSection === 'ui-generator' ? (
                <UIGenerator 
                  onGenerateInterface={handleGenerateInterface}
                  isGenerating={isInterpretingIntent}
                  currentIntent={intent}
                />
              ) : isLoadingTasks ? (
                <div className="card-glass p-12 text-center">
                  <Loader2 className="w-10 h-10 mx-auto mb-4 text-primary animate-spin" />
                  <p className="text-muted-foreground">Loading your tasks...</p>
                </div>
              ) : activePlan.kanban.enabled ? (
                <KanbanBoard tasks={visibleTasks} users={mockUsers} onUpdateTask={handleUpdateTask} />
              ) : hasAttemptedIntent ? (
                <div className="card-glass p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Interface Customized</h3>
                  <p className="text-muted-foreground mb-4">Your view has been optimized based on AI analysis.</p>
                  <p className="text-sm text-muted-foreground/70 mb-6">
                    Try: "Show me all tasks" to reveal the kanban board
                  </p>
                  <button
                    onClick={() => {
                      setPrompt('Show me all tasks')
                      handleGenerateInterface('Show me all tasks')
                    }}
                    className="btn-gradient"
                  >
                    Show All Tasks
                  </button>
                </div>
              ) : (
                <div className="card-glass p-12 text-center">
                  <div className="flex justify-center gap-4 mb-6">
                    <Rocket className="w-10 h-10 text-primary animate-float" />
                    <Sparkles className="w-10 h-10 text-secondary animate-float" style={{ animationDelay: '0.5s' }} />
                    <Target className="w-10 h-10 text-accent animate-float" style={{ animationDelay: '1s' }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Ready to Transform Your Workflow</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Use the AI prompt above to customize your project interface. 
                    I can show you kanban boards, priority filters, team assignments, and more!
                  </p>
                  
                  {/* Quick stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    {[
                      { icon: ListChecks, value: tasks.length, label: 'Total Tasks', color: 'text-primary' },
                      { icon: Target, value: tasks.filter(t => t.status === 'done').length, label: 'Completed', color: 'text-success' },
                      { icon: Ban, value: tasks.filter(t => t.status === 'blocked').length, label: 'Blocked', color: 'text-destructive' },
                      { icon: Zap, value: tasks.filter(t => t.priority === 'high' || t.priority === 'critical').length, label: 'High Priority', color: 'text-warning' },
                    ].map((stat, index) => (
                      <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI UI Decision Plan - Show always when intent generated */}
          {hasAttemptedIntent && (
            <div className="mt-6">
              <div className="card-glass overflow-hidden animate-slide-in-up">
                <button
                  onClick={() => setIsPlanDetailsOpen(!isPlanDetailsOpen)}
                  className="w-full px-4 py-3 flex items-center gap-2 hover:bg-white/5 transition-colors"
                >
                  <Brain className="w-5 h-5 text-primary" />
                  <span className="font-semibold flex-1 text-left">AI UI Decision Plan</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isPlanDetailsOpen ? 'rotate-180' : ''}`} />
                </button>
                {isPlanDetailsOpen && (
                  <div className="border-t border-white/10 p-4">
                    {intentError ? (
                      <div className="card-glass p-3 border-l-4 border-destructive">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-destructive flex-shrink-0" />
                          <span className="text-destructive text-sm font-medium">Error:</span>
                          <span className="text-sm text-destructive">{intentError}</span>
                        </div>
                      </div>
                    ) : intent ? (
                      <div className="space-y-3">
                        {/* Horizontal cards for intent details - 3 per row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div className="card-glass p-3 hover:bg-white/10 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium text-muted-foreground">Kanban Board:</span>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                intent.showKanban ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {intent.showKanban ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          </div>
                          <div className="card-glass p-3 hover:bg-white/10 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium text-muted-foreground">Filter Status:</span>
                              </div>
                              <span className="text-sm text-primary font-medium">
                                {intent.filterStatus}
                              </span>
                            </div>
                          </div>
                          <div className="card-glass p-3 hover:bg-white/10 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-warning" />
                                <span className="text-sm font-medium text-muted-foreground">Priority Selector:</span>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                intent.showPrioritySelector ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {intent.showPrioritySelector ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          </div>
                          <div className="card-glass p-3 hover:bg-white/10 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-secondary" />
                                <span className="text-sm font-medium text-muted-foreground">Team Assignment:</span>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                intent.showTeamAssignment ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {intent.showTeamAssignment ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <details className="mt-3">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                            View Raw JSON
                          </summary>
                          <pre className="text-xs text-muted-foreground bg-black/30 p-3 rounded-lg overflow-x-auto mt-2">
                            {JSON.stringify(intent, null, 2)}
                          </pre>
                        </details>
                      </div>
                    ) : (
                      <div className="card-glass p-3 text-center">
                        <span className="text-sm text-muted-foreground">No plan generated yet.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}