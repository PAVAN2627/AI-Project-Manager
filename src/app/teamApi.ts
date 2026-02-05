import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../firebase/firebase'

export interface TeamMember {
  id: string
  name: string
  email: string
  role?: string
}

export interface Team {
  id: string
  name: string
  members: TeamMember[]
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface TeamDocument {
  name: string
  members: TeamMember[]
  createdAt: Timestamp
  updatedAt: Timestamp
  userId: string
}

const TEAMS_COLLECTION = 'teams'

export async function createTeam(userId: string, teamData: { name: string; members: TeamMember[] }): Promise<void> {
  console.log('createTeam API called with:', { userId, teamData })
  
  // Clean the team data to remove any undefined values
  const cleanMembers = teamData.members.map(member => ({
    id: member.id || '',
    name: member.name || '',
    email: member.email || '',
    ...(member.role && { role: member.role }) // Only include role if it exists
  }))
  
  const now = Timestamp.now()
  const teamDoc: TeamDocument = {
    name: teamData.name,
    members: cleanMembers,
    createdAt: now,
    updatedAt: now,
    userId
  }
  
  console.log('About to save team document:', teamDoc)
  
  try {
    const docRef = await addDoc(collection(db, TEAMS_COLLECTION), teamDoc)
    console.log('Team successfully created with ID:', docRef.id)
  } catch (error) {
    console.error('Error creating team in Firestore:', error)
    throw error
  }
}

export async function updateTeam(teamId: string, updates: { name?: string; members?: TeamMember[] }): Promise<void> {
  const teamRef = doc(db, TEAMS_COLLECTION, teamId)
  const updateData: Partial<TeamDocument> = {
    ...updates,
    updatedAt: Timestamp.now()
  }
  
  await updateDoc(teamRef, updateData)
}

export async function deleteTeam(teamId: string): Promise<void> {
  const teamRef = doc(db, TEAMS_COLLECTION, teamId)
  await deleteDoc(teamRef)
}

export function subscribeTeams(
  userId: string,
  onNext: (teams: Team[]) => void,
  onError: (error: Error) => void
): () => void {
  console.log('Subscribing to teams for user:', userId)
  
  const q = query(
    collection(db, TEAMS_COLLECTION),
    where('userId', '==', userId)
  )
  
  return onSnapshot(
    q,
    (snapshot) => {
      console.log('Teams snapshot received, docs count:', snapshot.docs.length)
      const teams: Team[] = snapshot.docs.map(doc => {
        const data = doc.data() as TeamDocument
        console.log('Team doc data:', data)
        return {
          id: doc.id,
          name: data.name,
          members: data.members,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          userId: data.userId
        }
      })
      // Sort on client side to avoid needing composite index
      teams.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      console.log('Processed teams:', teams)
      onNext(teams)
    },
    (error) => {
      console.error('Teams subscription error:', error)
      onError(error)
    }
  )
}