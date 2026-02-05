import { useState, useEffect } from 'react'
import { Brain, Clock, Trash2, RotateCcw, Sparkles, Target, Zap, Users } from 'lucide-react'
import type { IntentInterpretation } from '../../app/intentApi'
import { subscribeIntentHistory, deleteIntentFromHistory, type IntentHistoryItem } from '../../app/intentHistoryApi'
import { useAuthUser } from '../../app/useAuthUser'

interface IntentHistoryProps {
  onApplyIntent: (intent: IntentInterpretation, prompt: string) => void
  currentIntent: IntentInterpretation | null
}

export function IntentHistory({ onApplyIntent, currentIntent }: IntentHistoryProps) {
  const { user } = useAuthUser()
  const [history, setHistory] = useState<IntentHistoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Subscribe to intent history from Firebase
  useEffect(() => {
    if (!user) {
      setHistory([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const unsubscribe = subscribeIntentHistory(
      user.uid,
      (next) => {
        setHistory(next)
        setIsLoading(false)
      },
      (error) => {
        console.warn('[firestore] Failed to subscribe to intent history', error)
        setError(error instanceof Error ? error.message : 'Failed to load intent history from Firestore.')
        setIsLoading(false)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [user])

  const removeItem = async (id: string) => {
    if (!user) return
    
    try {
      await deleteIntentFromHistory(user.uid, id)
    } catch (error) {
      console.error('Failed to delete intent from history:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete intent from history')
    }
  }

  const clearHistory = async () => {
    if (!user) return
    
    // For now, delete items one by one (would be better with cloud function)
    try {
      await Promise.all(history.map(item => deleteIntentFromHistory(user.uid, item.id)))
    } catch (error) {
      console.error('Failed to clear intent history:', error)
      setError(error instanceof Error ? error.message : 'Failed to clear intent history')
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const getIntentSummary = (intent: IntentInterpretation) => {
    const features = []
    if (intent.showKanban) features.push('Kanban')
    if (intent.showPrioritySelector) features.push('Priority')
    if (intent.showTeamAssignment) features.push('Team')
    if (intent.filterStatus !== 'All') features.push(`Filter: ${intent.filterStatus}`)
    return features.join(', ') || 'Basic view'
  }

  const isCurrentIntent = (intent: IntentInterpretation) => {
    if (!currentIntent) return false
    return (
      intent.showKanban === currentIntent.showKanban &&
      intent.showPrioritySelector === currentIntent.showPrioritySelector &&
      intent.showTeamAssignment === currentIntent.showTeamAssignment &&
      intent.filterStatus === currentIntent.filterStatus
    )
  }

  if (isLoading) {
    return (
      <div className="card-glass p-8 text-center">
        <Brain className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
        <h3 className="text-lg font-semibold mb-2">Loading Intent History</h3>
        <p className="text-muted-foreground text-sm">
          Fetching your AI interface generations...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card-glass p-8 text-center">
        <Brain className="w-12 h-12 mx-auto mb-4 text-destructive" />
        <h3 className="text-lg font-semibold mb-2 text-destructive">Error Loading History</h3>
        <p className="text-muted-foreground text-sm mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-ghost text-sm"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="card-glass p-8 text-center">
        <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Intent History</h3>
        <p className="text-muted-foreground text-sm">
          Your AI interface generations will appear here
        </p>
        <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <Sparkles className="w-5 h-5 mx-auto mb-2 text-primary" />
          <p className="text-xs text-primary">
            Try generating an interface with the AI prompt above!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Intent History</h3>
          <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
            {history.length}
          </span>
        </div>
        <button
          onClick={clearHistory}
          className="btn-ghost text-xs py-1 px-2 text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-3 h-3" />
          Clear
        </button>
      </div>

      {/* History List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.id}
            className={`card-glass p-4 border transition-all cursor-pointer ${
              selectedItem === item.id 
                ? 'border-primary bg-primary/5' 
                : isCurrentIntent(item.intent)
                ? 'border-green-500/50 bg-green-500/5'
                : 'border-white/10 hover:border-white/20'
            }`}
            onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2 mb-1">
                    "{item.prompt}"
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(item.timestamp)}
                    {isCurrentIntent(item.intent) && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onApplyIntent(item.intent, item.prompt)
                    }}
                    className="p-1 hover:bg-primary/20 rounded text-primary"
                    title="Apply this intent"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeItem(item.id)
                    }}
                    className="p-1 hover:bg-destructive/20 rounded text-destructive"
                    title="Remove from history"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Intent Summary */}
              <div className="flex flex-wrap gap-1">
                {item.intent.showKanban && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Kanban
                  </span>
                )}
                {item.intent.showPrioritySelector && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Priority
                  </span>
                )}
                {item.intent.showTeamAssignment && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Team
                  </span>
                )}
                {item.intent.filterStatus !== 'All' && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                    {item.intent.filterStatus}
                  </span>
                )}
              </div>

              {/* Expanded Details */}
              {selectedItem === item.id && (
                <div className="pt-3 border-t border-white/10 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-muted-foreground mb-1">Configuration:</p>
                      <ul className="space-y-1">
                        <li className="flex justify-between">
                          <span>Kanban Board:</span>
                          <span className={item.intent.showKanban ? 'text-green-400' : 'text-red-400'}>
                            {item.intent.showKanban ? 'Enabled' : 'Disabled'}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Priority Selector:</span>
                          <span className={item.intent.showPrioritySelector ? 'text-green-400' : 'text-red-400'}>
                            {item.intent.showPrioritySelector ? 'Enabled' : 'Disabled'}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Team Assignment:</span>
                          <span className={item.intent.showTeamAssignment ? 'text-green-400' : 'text-red-400'}>
                            {item.intent.showTeamAssignment ? 'Enabled' : 'Disabled'}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Filter Status:</span>
                          <span className="text-primary">{item.intent.filterStatus}</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Raw JSON:</p>
                      <pre className="text-xs bg-black/30 p-2 rounded overflow-x-auto">
                        {JSON.stringify(item.intent, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}