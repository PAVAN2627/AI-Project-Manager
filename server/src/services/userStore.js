import fs from 'node:fs/promises'
import path from 'node:path'

/**
* Minimal hackathon-only user store.
*
* - Persists to a local JSON file (`server/data/users.json`)
* - Stores passwords in plaintext (explicitly allowed by the issue notes)
*/

const usersFilePath = path.join(process.cwd(), 'server', 'data', 'users.json')

let writeLock = Promise.resolve()

function withWriteLock(fn) {
  const next = writeLock.then(fn, fn)
  // Keep the chain alive even if a write fails.
  writeLock = next.then(
    () => undefined,
    () => undefined,
  )
  return next
}

async function ensureUsersFile() {
  const dir = path.dirname(usersFilePath)
  await fs.mkdir(dir, { recursive: true })

  try {
    await fs.access(usersFilePath)
  } catch {
    await fs.writeFile(usersFilePath, JSON.stringify([], null, 2) + '\n', 'utf8')
  }
}

async function readUsers() {
  await ensureUsersFile()
  const raw = await fs.readFile(usersFilePath, 'utf8')

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    console.warn(`Failed to parse users JSON at ${usersFilePath}; treating as empty list`)
    return []
  }
}

async function writeUsers(users) {
  await ensureUsersFile()

  const dir = path.dirname(usersFilePath)
  const tmpPath = path.join(dir, 'users.json.tmp')
  await fs.writeFile(tmpPath, JSON.stringify(users, null, 2) + '\n', 'utf8')
  await fs.rename(tmpPath, usersFilePath)
}

export async function createUser({ email, password }) {
  return withWriteLock(async () => {
    const users = await readUsers()
    const existing = users.find((u) => u.email === email)
    if (existing) {
      throw new Error('USER_EXISTS')
    }

    users.push({
      email,
      password,
      createdAt: new Date().toISOString(),
    })

    await writeUsers(users)
    return { email }
  })
}

export async function verifyUserPassword({ email, password }) {
  const users = await readUsers()
  const user = users.find((u) => u.email === email)
  if (!user) return false
  return user.password === password
}
