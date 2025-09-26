/* eslint-disable @typescript-eslint/explicit-function-return-type */
import keytar from "keytar"

const SERVICE_NAME = "toolsngon" // tên app (hiện trong Keychain)
const ACCESS_KEY = "accessToken"
const REFRESH_KEY = "refreshToken"

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
