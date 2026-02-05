import { useState } from 'react'
import { Users, UserPlus, Trash2, Mail, Crown, Edit3, X } from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  email: string
  role?: string
}

interface Team {
  id: string
  name: string
  members: TeamMember[]
}

interface TeamCreationProps {
  onCreateTeam?: (teamName: string, members: TeamMember[]) => void
  existingTeams?: Team[]
  onDeleteTeam?: (teamId: string) => void
  onUpdateTeam?: (teamId: string, updatedTeam: { name: string; members: TeamMember[] }) => void
}

export function TeamCreation({ onCreateTeam, existingTeams = [], onDeleteTeam, onUpdateTeam }: TeamCreationProps) {
  const [teamName, setTeamName] = useState('')
  const [members, setMembers] = useState<TeamMember[]>([])
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [lastCreatedTeam, setLastCreatedTeam] = useState<string>('')
  const [editingTeam, setEditingTeam] = useState<string | null>(null)
  const [editTeamName, setEditTeamName] = useState('')
  const [editMembers, setEditMembers] = useState<TeamMember[]>([])
  const [addingMemberToTeam, setAddingMemberToTeam] = useState<string | null>(null)
  const [newEditMemberName, setNewEditMemberName] = useState('')
  const [newEditMemberEmail, setNewEditMemberEmail] = useState('')
  const [newEditMemberRole, setNewEditMemberRole] = useState('')

  const addMember = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) return

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      ...(newMemberRole.trim() && { role: newMemberRole.trim() }) // Only add role if not empty
    }

    setMembers(prev => [...prev, newMember])
    setNewMemberName('')
    setNewMemberEmail('')
    setNewMemberRole('')
  }

  const removeMember = (memberId: string) => {
    setMembers(prev => prev.filter(member => member.id !== memberId))
  }

  const addEditMember = () => {
    if (!newEditMemberName.trim() || !newEditMemberEmail.trim()) return

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: newEditMemberName.trim(),
      email: newEditMemberEmail.trim(),
      ...(newEditMemberRole.trim() && { role: newEditMemberRole.trim() }) // Only add role if not empty
    }

    setEditMembers(prev => [...prev, newMember])
    setNewEditMemberName('')
    setNewEditMemberEmail('')
    setNewEditMemberRole('')
  }

  const removeEditMember = (memberId: string) => {
    setEditMembers(prev => prev.filter(member => member.id !== memberId))
  }

  const startEditingTeam = (team: Team) => {
    setEditingTeam(team.id)
    setEditTeamName(team.name)
    setEditMembers([...team.members])
  }

  const cancelEditingTeam = () => {
    setEditingTeam(null)
    setEditTeamName('')
    setEditMembers([])
    setAddingMemberToTeam(null)
    setNewEditMemberName('')
    setNewEditMemberEmail('')
    setNewEditMemberRole('')
  }

  const saveTeamChanges = () => {
    if (!editingTeam || !editTeamName.trim() || editMembers.length === 0) return
    
    onUpdateTeam?.(editingTeam, {
      name: editTeamName.trim(),
      members: editMembers
    })
    
    cancelEditingTeam()
  }

  const handleCreateTeam = () => {
    if (!teamName.trim() || members.length === 0) return
    
    setLastCreatedTeam(teamName)
    onCreateTeam?.(teamName, members)
    setTeamName('')
    setMembers([])
    setShowCreateForm(false)
    
    // Clear the form inputs as well
    setNewMemberName('')
    setNewMemberEmail('')
    setNewMemberRole('')
    
    // Show success message
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="card-glass p-4 border border-green-500/30 bg-green-500/10 animate-fade-in">
          <div className="flex items-center gap-2 text-green-400">
            <Crown className="w-5 h-5" />
            <span className="font-medium">Team "{lastCreatedTeam}" created successfully!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Team Management</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-gradient px-4 py-2 font-medium rounded-lg flex items-center gap-2"
        >
          {showCreateForm ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Create New Team
            </>
          )}
        </button>
      </div>

      {/* Existing Teams */}
      {existingTeams.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Crown className="w-5 h-5 text-accent" />
            Existing Teams ({existingTeams.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {existingTeams.map((team) => (
              <div key={team.id} className="card-glass p-6 border border-white/10">
                {editingTeam === team.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={editTeamName}
                        onChange={(e) => setEditTeamName(e.target.value)}
                        className="text-lg font-semibold bg-black/20 border border-white/10 rounded px-3 py-1 text-foreground focus:outline-none focus:border-primary"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveTeamChanges}
                          className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditingTeam}
                          className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded hover:bg-gray-500/30 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {editMembers.map((member, index) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-medium text-white">
                            {member.name[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                              {index === 0 && (
                                <Crown className="w-3 h-3 text-accent" title="Team Lead" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                              {member.role && (
                                <>
                                  <span className="text-muted-foreground">•</span>
                                  <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                                </>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeEditMember(member.id)}
                            className="p-1 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {/* Add Member Form */}
                      {addingMemberToTeam === team.id ? (
                        <div className="space-y-3 p-3 border border-white/20 rounded-lg bg-white/5">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={newEditMemberName}
                              onChange={(e) => setNewEditMemberName(e.target.value)}
                              placeholder="Member name"
                              className="px-3 py-2 bg-black/20 border border-white/10 rounded text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                            />
                            <input
                              type="email"
                              value={newEditMemberEmail}
                              onChange={(e) => setNewEditMemberEmail(e.target.value)}
                              placeholder="Email address"
                              className="px-3 py-2 bg-black/20 border border-white/10 rounded text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                            />
                            <input
                              type="text"
                              value={newEditMemberRole}
                              onChange={(e) => setNewEditMemberRole(e.target.value)}
                              placeholder="Role (optional)"
                              className="px-3 py-2 bg-black/20 border border-white/10 rounded text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={addEditMember}
                              disabled={!newEditMemberName.trim() || !newEditMemberEmail.trim()}
                              className="px-3 py-1 btn-gradient text-sm rounded disabled:opacity-50"
                            >
                              Add Member
                            </button>
                            <button
                              onClick={() => setAddingMemberToTeam(null)}
                              className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded hover:bg-gray-500/30 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingMemberToTeam(team.id)}
                          className="w-full p-3 border-2 border-dashed border-white/20 rounded-lg text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          Add Member
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">{team.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditingTeam(team)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Edit team"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {onDeleteTeam && (
                          <button
                            onClick={() => onDeleteTeam(team.id)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Delete team"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {team.members.map((member, index) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-medium text-white">
                            {member.name[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                              {index === 0 && (
                                <Crown className="w-3 h-3 text-accent" title="Team Lead" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                              {member.role && (
                                <>
                                  <span className="text-muted-foreground">•</span>
                                  <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Team Form */}
      {showCreateForm && (
        <div className="space-y-6 animate-fade-in">
          {/* Team Name */}
          <div className="card-glass p-6">
            <div className="flex items-center gap-3 mb-4">
              <Edit3 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Team Details</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name..."
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Add Team Members */}
          <div className="card-glass p-6">
            <div className="flex items-center gap-3 mb-4">
              <UserPlus className="w-5 h-5 text-secondary" />
              <h3 className="text-lg font-semibold text-foreground">Add Team Members</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Member name"
                  className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  placeholder="Role (optional)"
                  className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
                <button
                  onClick={addMember}
                  disabled={!newMemberName.trim() || !newMemberEmail.trim()}
                  className="px-4 py-2 btn-gradient text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Team Members List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {members.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No team members added yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Add members using the form above</p>
                </div>
              ) : (
                members.map((member, index) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-medium text-white">
                        {member.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                          {index === 0 && (
                            <Crown className="w-3 h-3 text-accent" title="Team Lead" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                          {member.role && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="p-1 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Create Team Button - Only show when form is filled and not showing success message */}
          {(teamName.trim() && members.length > 0 && !showSuccessMessage) && (
            <div className="card-glass p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Ready to create team?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Team "{teamName}" with {members.length} member{members.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={handleCreateTeam}
                  className="btn-gradient px-6 py-3 font-medium rounded-lg"
                >
                  Create Team
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {existingTeams.length === 0 && !showCreateForm && (
        <div className="card-glass p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Teams Created Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first team to start collaborating and assigning tasks to team members.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-gradient px-6 py-3 font-medium rounded-lg"
          >
            Create Your First Team
          </button>
        </div>
      )}
    </div>
  )
}