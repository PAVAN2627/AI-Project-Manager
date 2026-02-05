import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  limit,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../firebase/firebase'
import type { IntentInterpretation } from './intentApi'

export interface IntentHistoryItem {
  id: string
  prompt: string
  intent: IntentInterpretation
  timestamp: Date
  applied: boolean
  userId: string
}

export interface IntentHistoryDocument {
  prompt: string
  intent: IntentInterpretation
  timestamp: Timestamp
  applied: boolean
  userId: string
}

const INTENT_HISTORY_COLLECTION = 'intentHistory'

export async function addIntentToHistory(
  userId: string, 
  prompt: string, 
  intent: IntentInterpretation
): Promise<void> {
  const historyDoc: IntentHistoryDocument = {
    prompt,
    intent,
    timestamp: Timestamp.now(),
    applied: true,
    userId
  }
  
  await addDoc(collection(db, INTENT_HISTORY_COLLECTION), historyDoc)
}

export async function deleteIntentFromHistory(intentId: string): Promise<void> {
  const intentRef = doc(db, INTENT_HISTORY_COLLECTION, intentId)
  await deleteDoc(intentRef)
}

export async function clearIntentHistory(): Promise<void> {
  // Note: This would require a cloud function for efficient batch delete
  // For now, we'll handle this client-side with individual deletes
  console.warn('Clear history not implemented - would require cloud function for efficiency')
}

export function subscribeIntentHistory(
  userId: string,
  onNext: (history: IntentHistoryItem[]) => void,
  onError: (error: Error) => void
): () => void {
  const q = query(
    collection(db, INTENT_HISTORY_COLLECTION),
    where('userId', '==', userId),
    limit(50) // Keep last 50 items
  )
  
  return onSnapshot(
    q,
    (snapshot) => {
      const history: IntentHistoryItem[] = snapshot.docs.map(doc => {
        const data = doc.data() as IntentHistoryDocument
        return {
          id: doc.id,
          prompt: data.prompt,
          intent: data.intent,
          timestamp: data.timestamp.toDate(),
          applied: data.applied,
          userId: data.userId
        }
      })
      // Sort on client side to avoid needing composite index
      history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      onNext(history)
    },
    onError
  )
}