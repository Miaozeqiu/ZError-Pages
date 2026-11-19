import { computed, onMounted, ref } from 'vue'
import { githubReleases, useReleaseList } from './useReleaseList'

const platforms = [
  { id: 'macos', name: 'macOS' },
  { id: 'windows', name: 'Windows' },
  { id: 'linux', name: 'Linux' },
] as const

type Platform = typeof platforms[number]['id']
type Device = { platform: Platform; arch?: string }

type ClientHints = {
  getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string; bitness?: string }>
}

const architectureNames: Record<string, string> = {
  x86_64: 'x64',
  aarch64: 'ARM64',
  i686: 'x86',
  armv7: 'ARMv7',
  universal: '通用版',
}

const formatNames = { exe: 'EXE', msi: 'MSI', dmg: 'DMG', appimage: 'AppImage', deb: 'DEB' }
const formatOrder = ['exe', 'msi', 'dmg', 'appimage', 'deb']

export function installerArchitecture(platform: Platform, arch: string) {
  if (platform === 'macos' && arch === 'aarch64') return 'Apple 芯片'
  if (platform === 'macos' && arch === 'x86_64') return 'Intel 芯片'
  return architectureNames[arch] || arch
}

async function detectDesktop(browser: Navigator): Promise<Device | undefined> {
  const agent = browser.userAgent
  if (/Android|iPhone|iPad|iPod|Mobile|CrOS/i.test(agent)
    || (/Macintosh/i.test(agent) && browser.maxTouchPoints > 1)) return

  const platform = /Windows/i.test(agent) ? 'windows'
    : /Macintosh|Mac OS X/i.test(agent) ? 'macos'
    : /Linux/i.test(agent) ? 'linux'
    : undefined
  if (!platform) return

  const hints = (browser as Navigator & { userAgentData?: ClientHints }).userAgentData
  try {
    const { architecture, bitness } = await hints?.getHighEntropyValues?.(['architecture', 'bitness']) || {}
    if (architecture === 'arm' && bitness === '64') return { platform, arch: 'aarch64' }
    if (architecture === 'arm' && bitness === '32' && platform === 'linux') return { platform, arch: 'armv7' }
    if (architecture === 'x86' && bitness === '64') return { platform, arch: 'x86_64' }
    if (architecture === 'x86' && bitness === '32') return { platform, arch: 'i686' }
  } catch {
    // Some browsers restrict client hints. Fall back to explicit architecture tokens.
  }

  if (/aarch64|arm64/i.test(agent)) return { platform, arch: 'aarch64' }
  // macOS browsers can report Intel even on Apple silicon.
  if (platform !== 'macos' && /x86_64|amd64|Win64|WOW64/i.test(agent)) {
    return { platform, arch: 'x86_64' }
  }
  if (platform !== 'macos' && /i[3-6]86/i.test(agent)) return { platform, arch: 'i686' }
  return { platform }
}

export function useHomeDownloads() {
  const { releases, status } = useReleaseList()
  const device = ref<Device>()

  onMounted(async () => {
    device.value = await detectDesktop(navigator)
  })

  const latest = computed(() => releases.value[0])
  const groups = computed(() => platforms.map(platform => ({
    ...platform,
    installers: (latest.value?.installers.filter(asset => asset.platform === platform.id) ?? [])
      .sort((a, b) => formatOrder.indexOf(a.format) - formatOrder.indexOf(b.format))
      .map(asset => ({
        ...asset,
        architecture: installerArchitecture(asset.platform, asset.arch),
        fileFormat: formatNames[asset.format],
      })),
  })).filter(platform => platform.installers.length))

  const platformGroup = computed(() => groups.value.find(group => group.id === device.value?.platform))
  const recommended = computed(() => {
    const group = platformGroup.value
    if (!group) return
    const arch = device.value?.arch

    const installer = group.installers.find(asset => asset.arch === arch)
      ?? group.installers.find(asset => asset.arch === 'universal')
      ?? (!arch && new Set(group.installers.map(asset => asset.arch)).size === 1 ? group.installers[0] : undefined)

    if (installer) return { ...installer, platformName: group.name }
  })

  return { latest, status, groups, platformGroup, recommended, githubReleases }
}
