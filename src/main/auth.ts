/* eslint-disable @typescript-eslint/explicit-function-return-type */
import keytar from 'keytar'
import { v4 as uuidv4 } from 'uuid'

const SERVICE_NAME = 'toolsngon' // tên app (hiện trong Keychain)
const ACCESS_KEY = 'accessToken'
const REFRESH_KEY = 'refreshToken'
const DEVICE_KEY = 'deviceID'

export async function getDeviceID(): Promise<string | null> {
  return keytar.getPassword(SERVICE_NAME, DEVICE_KEY)
}
export async function ensureDeviceID(): Promise<string> {
  let id = await getDeviceID()
  if (!id) {
    id = uuidv4()
    await setDeviceID(id)
  }
  return id
}
export async function setDeviceID(deviceID: string) {
  await keytar.setPassword(SERVICE_NAME, DEVICE_KEY, deviceID)
}
export async function saveTokens(access: string, refresh: string) {
  await keytar.setPassword(SERVICE_NAME, ACCESS_KEY, access)
  await keytar.setPassword(SERVICE_NAME, REFRESH_KEY, refresh)
}

export async function getAccessToken(): Promise<string | null> {
  return keytar.getPassword(SERVICE_NAME, ACCESS_KEY)
}

export async function getRefreshToken(): Promise<string | null> {
  return keytar.getPassword(SERVICE_NAME, REFRESH_KEY)
}

export async function clearTokens() {
  await keytar.deletePassword(SERVICE_NAME, ACCESS_KEY)
  await keytar.deletePassword(SERVICE_NAME, REFRESH_KEY)
}
