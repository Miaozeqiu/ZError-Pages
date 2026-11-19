<template>
  <div class="download-page">
    <header class="download-hero">
      <h1>下载 <span>ZError</span></h1>
      <p>适用于 Windows、macOS 和 Linux 的桌面应用。</p>
      <div v-if="latest" class="release-meta">
        <span class="version">正式版 v{{ latest.version }}</span>
        <time v-if="releaseDate && latest.releaseDate" :datetime="latest.releaseDate">
          {{ releaseDate }}发布
        </time>
      </div>
    </header>

    <div v-if="groups.length" class="platforms">
      <template v-for="(group, index) in visibleGroups" :key="group.platform">
        <section class="platform-group" :aria-labelledby="'platform-' + group.platform">
          <div class="download-platform-heading">
            <span class="download-platform-mark" aria-hidden="true">
              <span v-if="group.platform === 'windows'" class="window-icon"></span>
              <span v-else-if="group.platform === 'macos'" class="mac-icon"></span>
              <span v-else class="terminal-icon"></span>
            </span>
            <div>
              <p v-if="group === recommended" class="platform-note">推荐用于此设备</p>
              <h2 :id="'platform-' + group.platform">{{ group.name }}</h2>
            </div>
          </div>

          <ul class="installer-list">
            <li v-for="asset in group.installers" :key="asset.downloadUrl">
              <a class="download-link" :href="asset.downloadUrl">
                <span class="visually-hidden">下载 {{ group.name }} </span>
                <span class="installer-label">
                  <strong>{{ architectureLabel(group.platform, asset.arch) }}</strong>
                  <span>{{ formatNames[asset.format] }} 安装包</span>
                </span>
                <span class="download-action" aria-hidden="true">
                  <ActionIcon name="download" />
                </span>
              </a>
            </li>
          </ul>
        </section>

        <div v-if="index === 0 && recommended && groups.length > 1" class="platform-toggle">
          <button type="button" :aria-expanded="showOtherPlatforms" @click="showOtherPlatforms = !showOtherPlatforms">
            {{ showOtherPlatforms ? '收起其他平台' : '查看其他平台' }}
            <ActionIcon name="chevron-down" class="disclosure-icon" />
          </button>
        </div>
      </template>
    </div>

    <p v-else class="download-status" role="status">
      <template v-if="status === 'loading'">正在读取发布列表…</template>
      <template v-else-if="status === 'error'">暂时无法读取发布列表，可前往 GitHub 查看安装包。</template>
      <template v-else>官网暂未列出安装包，可前往 GitHub 查看发布附件。</template>
    </p>

    <div class="release-panel">
      <details v-if="latest?.notes" class="release-notes">
        <summary>本版更新 <ActionIcon name="chevron-down" class="disclosure-icon" /></summary>
        <pre class="changelog-text">{{ latest.notes }}</pre>
      </details>
      <div class="release-links">
        <router-link to="/changelog">更新日志</router-link>
        <a :href="latest?.releaseUrl || githubReleases">GitHub 发布页</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ActionIcon from '../components/ActionIcon.vue'
import { githubReleases, useReleaseList } from '../composables/useReleaseList'

const platforms = [
  { platform: 'windows', name: 'Windows' },
  { platform: 'macos', name: 'macOS' },
  { platform: 'linux', name: 'Linux' },
] as const
type Platform = typeof platforms[number]['platform']

const architectureNames: Record<string, string> = {
  x86_64: 'x64',
  aarch64: 'ARM64',
  i686: 'x86',
  universal: '通用版',
}
const macArchitectureNames: Record<string, string> = {
  aarch64: 'Apple 芯片',
  x86_64: 'Intel 芯片',
}
const formatNames = { exe: 'EXE', msi: 'MSI', dmg: 'DMG', appimage: 'AppImage', deb: 'DEB' }
const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'long',
  timeZone: 'Asia/Shanghai',
})

function architectureLabel(platform: Platform, arch: string) {
  const macLabel = platform === 'macos' ? macArchitectureNames[arch] : undefined
  return macLabel || architectureNames[arch] || arch
}

const devicePlatform = ref<Platform>()
const showOtherPlatforms = ref(false)

onMounted(() => {
  const agent = navigator.userAgent
  const touchMac = /Macintosh/i.test(agent) && navigator.maxTouchPoints > 1
  if (touchMac || /Android|iPhone|iPad|iPod|Mobile/i.test(agent)) return
  if (/Windows/i.test(agent)) devicePlatform.value = 'windows'
  else if (/Macintosh|Mac OS X/i.test(agent)) devicePlatform.value = 'macos'
  else if (/Linux/i.test(agent) && !/CrOS/i.test(agent)) devicePlatform.value = 'linux'
})

const { releases, status } = useReleaseList()
const latest = computed(() => releases.value[0])
const releaseDate = computed(() => {
  const timestamp = Date.parse(latest.value?.releaseDate || '')
  return Number.isFinite(timestamp) ? dateFormatter.format(timestamp) : ''
})
const groups = computed(() => platforms.map(platform => ({
  ...platform,
  installers: latest.value?.installers.filter(asset => asset.platform === platform.platform) || [],
})).filter(group => group.installers.length))
const recommended = computed(() => groups.value.find(group => group.platform === devicePlatform.value))
const visibleGroups = computed(() => {
  if (!recommended.value) return groups.value
  if (!showOtherPlatforms.value) return [recommended.value]
  return [recommended.value, ...groups.value.filter(group => group !== recommended.value)]
})
</script>

<style scoped>
:global(body:has(.download-page)) {
  background:
    radial-gradient(ellipse 730px 490px at 50% 105px, #ffe3d0 0%, transparent 100%),
    linear-gradient(#fff8f0, #fffdfb 600px, #fff 930px);
}

:global(.app-container:has(.download-page) > nav) {
  background: rgb(255 250 244 / 84%);
  border-bottom-color: #eadbca;
  backdrop-filter: blur(12px);
}

:global(.app-container > main:has(> .download-page)) {
  min-height: calc(100svh - 135px);
}

.download-page {
  --ink: #221a13;
  --muted: #69584a;
  --line: #eadccd;
  --accent: #a9480d;
  box-sizing: border-box;
  width: 100%;
  max-width: 790px;
  margin: 0 auto;
  padding-bottom: 3.5rem;
  color: var(--ink);
  font-family: system-ui, "PingFang SC", "Microsoft YaHei", sans-serif;
}

.download-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: clamp(3.5rem, 8vw, 6.1rem) 0 clamp(3rem, 6vw, 4.5rem);
  text-align: center;
}

.download-hero h1 {
  margin: 0;
  font-size: clamp(2.35rem, 7.7vw, 5.2rem);
  font-weight: 750;
  line-height: 1.03;
  letter-spacing: -0.065em;
}

.download-hero h1 span {
  display: inline-block;
  margin-inline-start: 0.045em;
  color: #b54c0d;
}

.download-hero > p {
  margin: 0;
  color: var(--muted);
  font-size: clamp(0.875rem, 2.1vw, 1.15rem);
  line-height: 1.6;
}

.release-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.45rem 0.75rem;
  color: var(--muted);
  font-size: 0.75rem;
}

.version {
  padding: 0.22rem 0.63rem;
  border: 1px solid #e7c2a6;
  border-radius: 99px;
  background: rgb(255 252 246 / 74%);
  color: #884010;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}

.platforms {
  display: grid;
  gap: 2rem;
}

.download-platform-heading {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 1rem;
}

.download-platform-heading h2 {
  margin: 0;
  font-size: clamp(1.45rem, 3vw, 2rem);
  font-weight: 720;
  line-height: 1.06;
  letter-spacing: -0.045em;
}

.platform-note {
  margin: 0 0 0.3rem;
  color: var(--muted);
  font-size: 0.8rem;
}

.download-platform-mark {
  display: grid;
  flex: 0 0 39px;
  place-items: center;
  height: 39px;
  color: var(--accent);
}

.window-icon {
  width: 25px;
  aspect-ratio: 1;
  border-radius: 2px;
  background:
    linear-gradient(90deg, transparent 46%, #fff7ef 46% 54%, transparent 54%),
    linear-gradient(transparent 46%, #fff7ef 46% 54%, transparent 54%),
    currentColor;
}

.mac-icon {
  position: relative;
  box-sizing: border-box;
  width: 28px;
  height: 19px;
  margin-bottom: 4px;
  border: 2px solid currentColor;
  border-radius: 4px 4px 2px 2px;
}

.mac-icon::after {
  position: absolute;
  right: -6px;
  bottom: -6px;
  left: -6px;
  height: 3px;
  border-radius: 0 0 5px 5px;
  background: currentColor;
  content: '';
}

.terminal-icon {
  position: relative;
  display: grid;
  place-items: center;
  width: 29px;
  height: 21px;
  border: 2px solid currentColor;
  border-radius: 4px;
}

.terminal-icon::before {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 5px;
  height: 5px;
  border-top: 1.5px solid currentColor;
  border-right: 1.5px solid currentColor;
  transform: rotate(45deg);
  content: '';
}

.terminal-icon::after {
  position: absolute;
  top: 12px;
  left: 15px;
  width: 6px;
  border-bottom: 1.5px solid currentColor;
  content: '';
}

.installer-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.installer-list > li:only-child {
  grid-column: 1 / -1;
}

.download-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  box-sizing: border-box;
  min-height: 83px;
  height: 100%;
  padding: 0.8rem 1.3rem;
  border: 1px solid var(--line);
  border-radius: 17px;
  background: rgb(255 253 250 / 72%);
  box-shadow: 0 2px 8px rgb(117 63 25 / 4%);
  color: var(--ink);
  text-decoration: none;
  transition: background-color 150ms ease, border-color 150ms ease,
    transform 150ms cubic-bezier(0.23, 1, 0.32, 1);
}

.installer-label {
  display: grid;
  min-width: 0;
  gap: 0.25rem;
}

.installer-label strong {
  font-size: 1.1rem;
  font-weight: 690;
}

.installer-label > span {
  color: var(--muted);
  font-size: 0.8125rem;
  overflow-wrap: anywhere;
}

.download-action {
  display: grid;
  flex: 0 0 1.75rem;
  place-items: center;
  height: 1.75rem;
  color: var(--accent);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.platform-toggle {
  display: flex;
  justify-content: center;
}

.platform-toggle button {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 42px;
  padding: 0 1.05rem;
  border: 1px solid var(--line);
  border-radius: 99px;
  background: rgb(255 253 250 / 76%);
  color: var(--muted);
  font: inherit;
  font-size: 0.875rem;
  cursor: pointer;
}

.disclosure-icon {
  font-size: 0.75rem;
}

.platform-toggle button[aria-expanded="true"] .disclosure-icon,
.release-notes[open] .disclosure-icon {
  transform: rotate(180deg);
}

@media (hover: hover) and (pointer: fine) {
  .download-link:hover,
  .platform-toggle button:hover {
    border-color: #d8aa85;
    background: #fff3e7;
  }
}

.download-link:active {
  transform: scale(0.985);
}

.download-page :is(a, button, summary):focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.download-status {
  margin: 0;
  padding: 1.1rem 1.25rem;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: #fcfbf8;
  color: var(--muted);
  line-height: 1.6;
}

.release-panel {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.4rem 1.25rem;
  margin-top: 2.6rem;
  padding-top: 0.55rem;
  border-top: 1px solid var(--line);
}

.release-notes {
  flex: 1 1 13rem;
  min-width: 0;
}

.release-notes summary {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 44px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  list-style: none;
}

.release-notes summary::-webkit-details-marker {
  display: none;
}

.changelog-text {
  margin: 0 0 0.4rem;
  padding: 0.35rem 0;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  color: var(--muted);
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.65;
}

.release-links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0 1rem;
  margin-left: auto;
}

.release-links a {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  min-height: 44px;
  color: var(--accent);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  text-underline-offset: 0.22em;
}

.release-links a:hover {
  text-decoration: underline;
}

@media (max-width: 590px) {
  :global(main:has(> .download-page)) {
    margin-top: 64px;
  }

  .installer-list {
    grid-template-columns: minmax(0, 1fr);
  }

  .release-links {
    margin-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .download-link {
    transition: none;
  }

  .download-link:active {
    transform: none;
  }
}
</style>
