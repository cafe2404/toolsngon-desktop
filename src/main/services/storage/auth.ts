import { app, safeStorage } from 'electron'
import { promises as fs } from 'fs'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

interface AuthStore {
  version: 1
  deviceID?: string
  accessToken?: string
  refreshToken?: string
}

const STORE_FILE_NAME = 'auth-storage.json'
let mutationQueue: Promise<void> = Promise.resolve()

function getStorePath(): string {
  return join(app.getPath('userData'), STORE_FILE_NAME)
}

function encrypt(value: string): string {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Secure storage is not available on this device')
  }

  return safeStorage.encryptString(value).toString('base64')
}

function decrypt(value?: string): string | null {
  if (!value) return null
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Secure storage is not available on this device')
  }

  return safeStorage.decryptString(Buffer.from(value, 'base64'))
}

async function readStore(): Promise<AuthStore> {
  try {
    const contents = await fs.readFile(getStorePath(), 'utf8')
    const store = JSON.parse(contents) as Partial<AuthStore>
    return {
      version: 1,
      deviceID: store.deviceID,
      accessToken: store.accessToken,
      refreshToken: store.refreshToken
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { version: 1 }
    }
    throw error
  }
}

async function writeStore(store: AuthStore): Promise<void> {
  const storePath = getStorePath()
  await fs.mkdir(app.getPath('userData'), { recursive: true })
  await fs.writeFile(storePath, JSON.stringify(store), { encoding: 'utf8', mode: 0o600 })

  // writeFile does not update permissions when the file already exists.
  if (process.platform !== 'win32') {
    await fs.chmod(storePath, 0o600)
  }
}

function mutateStore(update: (store: AuthStore) => void): Promise<void> {
  const mutation = async (): Promise<void> => {
    const store = await readStore()
    update(store)
    await writeStore(store)
  }

  mutationQueue = mutationQueue.then(mutation, mutation)
  return mutationQueue
}

export async function getDeviceID(): Promise<string | null> {
  await mutationQueue
  return decrypt((await readStore()).deviceID)
}

export async function ensureDeviceID(): Promise<string> {
  let deviceID = ''
  await mutateStore((store) => {
    deviceID = decrypt(store.deviceID) ?? uuidv4()
    store.deviceID = encrypt(deviceID)
  })
  return deviceID
}

export async function setDeviceID(deviceID: string): Promise<void> {
  await mutateStore((store) => {
    store.deviceID = encrypt(deviceID)
  })
}

export async function saveTokens(access: string, refresh: string): Promise<void> {
  await mutateStore((store) => {
    store.accessToken = encrypt(access)
    store.refreshToken = encrypt(refresh)
  })
}

export async function getAccessToken(): Promise<string | null> {
  await mutationQueue
  return decrypt((await readStore()).accessToken)
}

export async function getRefreshToken(): Promise<string | null> {
  await mutationQueue
  return decrypt((await readStore()).refreshToken)
}

export async function clearTokens(): Promise<void> {
  await mutateStore((store) => {
    delete store.accessToken
    delete store.refreshToken
  })
}
