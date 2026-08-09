import { IpcRenderer, IpcRendererEvent } from 'electron'

type Listener<T> = (_event: IpcRendererEvent, payload: T) => void

export const invoke =
  <TArgs extends unknown[], TResult>(
    ipcRenderer: IpcRenderer,
    channel: string,
    mapArgs: (...args: TArgs) => unknown = (...args: TArgs) => args[0]
  ) =>
  (...args: TArgs): Promise<TResult> =>
    ipcRenderer.invoke(channel, mapArgs(...args)) as Promise<TResult>

export const listen = <TPayload>(
  ipcRenderer: IpcRenderer,
  channel: string,
  callback: (payload: TPayload) => void
): (() => void) => {
  const listener: Listener<TPayload> = (_event, payload) => callback(payload)
  ipcRenderer.on(channel, listener)
  return () => ipcRenderer.removeListener(channel, listener)
}

export const listenEvent = (
  ipcRenderer: IpcRenderer,
  channel: string,
  callback: () => void
): (() => void) => {
  ipcRenderer.on(channel, callback)
  return () => ipcRenderer.removeListener(channel, callback)
}
