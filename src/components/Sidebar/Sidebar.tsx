import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase/firebase'
import { isFirebaseConfigured } from '../../firebase/firebaseConfig'
import {
  Brain,
  ListTodo,
  Zap,
  BarChart3,
  History,
  Wand2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Users
} from 'lucide-react'

interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  onNavigate: (section: string) => void
  activeSection: string
}

const menuItems = [
  { id: 'ai-interface', label: 'AI Interface', icon: Brain },
  { id: 'all-tasks', label: 'All Tasks', icon: ListTodo },
  { id: 'quick-actions', label: 'Quick Actions', icon: Zap },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'intent-history', label: 'Intent History', icon: History },
  { id: 'ui-generator', label: 'UI Generator', icon: Wand2 },
  { id: 'create-team', label: 'Create Team', icon: Users },
]

export function Sidebar({ isCollapsed, onToggleCollapse, onNavigate, activeSection }: SidebarProps) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth)
    }
    navigate('/')
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen flex flex-col transition-all duration-300 z-20
        ${isCollapsed ? 'w-20' : 'w-72'}
        bg-sidebar border-r border-sidebar-border`}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-gradient truncate">AI Manager</h1>
              <p className="text-xs text-muted-foreground">Project Dashboard</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
              {!isCollapsed && (
                <span className="font-medium truncate">{item.label}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
            text-destructive hover:bg-destructive/10
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full 
          bg-sidebar border border-sidebar-border flex items-center justify-center
          text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  )
}