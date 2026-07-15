import { Capacitor } from '@capacitor/core'

async function downloadApk(url: string) {
  if (!Capacitor.isNativePlatform()) return
  const plugins = (Capacitor as any).Plugins as Record<string, any>
  const plugin = plugins.ApkUpdater
  if (plugin?.downloadAndInstall) {
    await plugin.downloadAndInstall({ url })
  }
}

export default downloadApk
