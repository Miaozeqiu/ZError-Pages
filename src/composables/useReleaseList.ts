import { onMounted, ref } from 'vue'

export const githubReleases = 'https://github.com/Miaozeqiu/ZError/releases'
const openAppUpdates = 'https://open.zerrorai.com/v1/app-updates'
const releaseApi = openAppUpdates + '/releases'
const downloadBase = openAppUpdates + '/download/'

type Installer = {
  name: string
  downloadUrl: string
  platform: 'windows' | 'macos' | 'linux'
  arch: string
  format: 'exe' | 'msi' | 'dmg' | 'appimage' | 'deb'
}
type Release = {
  tag: string
  version: string
  name: string
  releaseDate: string | null
  releaseUrl: string
  notes: string
  installers: Installer[]
}

function verifyReleases(list: unknown): Release[] {
  if (!Array.isArray(list)) throw new Error('发布列表格式无效')
  return (list as Release[]).filter(release => release
    && /^v?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(release.tag)
    && release.version === release.tag.replace(/^v/, '')
    && release.releaseUrl === githubReleases + '/tag/' + release.tag
    && typeof release.name === 'string' && typeof release.notes === 'string'
    && Array.isArray(release.installers))
    .map(release => ({
      ...release,
      installers: release.installers.filter(asset => asset
        && ['windows', 'macos', 'linux'].includes(asset.platform)
        && ['exe', 'msi', 'dmg', 'appimage', 'deb'].includes(asset.format)
        && typeof asset.name === 'string' && /^[a-zA-Z0-9_.-]+$/.test(asset.name)
        && typeof asset.arch === 'string'
        && asset.downloadUrl === downloadBase + release.tag + '/' + asset.name),
    }))
}

export function useReleaseList() {
  const releases = ref<Release[]>([])
  const status = ref<'loading' | 'ready' | 'error'>('loading')

  onMounted(async () => {
    try {
      const response = await fetch(releaseApi, { cache: 'no-store', signal: AbortSignal.timeout(12_000) })
      if (!response.ok) throw new Error('发布列表请求失败')
      const data = await response.json()
      releases.value = verifyReleases(data.releases)
      status.value = 'ready'
    } catch {
      status.value = 'error'
    }
  })

  return { releases, status }
}
