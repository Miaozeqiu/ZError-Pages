<template>
  <div class="download-page">
    <div class="download-header">
      <h1>下载 ZError</h1>
      <p v-if="latest" class="subtitle">当前正式版 v{{ latest.version }}</p>
    </div>

    <p v-if="status === 'loading'" class="subtitle" role="status">正在读取发布列表…</p>
    <p v-else-if="status === 'error'" class="subtitle" role="status">暂时无法读取发布列表。</p>
    <p v-else-if="!groups.length" class="subtitle" role="status">当前正式版没有可用的安装包。</p>

    <div v-if="groups.length" class="download-grid">
      <section v-for="group in groups" :key="group.platform" class="download-card">
        <div class="os-badge" :class="group.badge">{{ group.name }}</div>
        <a
          v-for="asset in group.installers"
          :key="asset.downloadUrl"
          class="download-btn"
          :href="asset.downloadUrl"
          :aria-label="'下载 ' + group.name + ' ' + (architectureNames[asset.arch] || asset.arch) + ' ' + formatNames[asset.format]"
        >
          {{ architectureNames[asset.arch] || asset.arch }} · {{ formatNames[asset.format] }}
        </a>
      </section>
    </div>

    <div v-if="latest?.notes" class="changelog-box">
      <h3>本版更新</h3>
      <pre class="changelog-text">{{ latest.notes }}</pre>
    </div>

    <div class="release-links">
      <router-link class="more-link" to="/changelog">更新日志</router-link>
      <a class="more-link" :href="latest?.releaseUrl || githubReleases">GitHub 发布页</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { githubReleases, useReleaseList } from '../composables/useReleaseList'

const platforms = [
  { platform: 'windows', name: 'Windows', badge: 'win' },
  { platform: 'macos', name: 'macOS', badge: 'mac' },
  { platform: 'linux', name: 'Linux', badge: 'linux' },
] as const
const architectureNames: Record<string, string> = {
  x86_64: 'x64',
  aarch64: 'ARM64',
  i686: 'x86',
  universal: '通用版',
}
const formatNames = { exe: 'EXE', msi: 'MSI', dmg: 'DMG', appimage: 'AppImage', deb: 'DEB' }
const { releases, status } = useReleaseList()
const latest = computed(() => releases.value[0])
const groups = computed(() => platforms.map(platform => ({
  ...platform,
  installers: latest.value?.installers.filter(asset => asset.platform === platform.platform) || [],
})).filter(group => group.installers.length))
</script>

<style scoped>
.download-page {
  padding: 2rem 1.25rem 3rem;
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.download-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.download-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin: 0 0 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
}

.download-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

.download-card {
  background: #fff;
  border: 1px solid rgba(28, 36, 33, 0.1);
  border-radius: 16px;
  padding: 1.75rem 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

.os-badge {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
}

.os-badge.mac {
  background: rgba(44, 62, 80, 0.08);
  color: #2c3e50;
}

.os-badge.win {
  background: rgba(252, 179, 52, 0.18);
  color: #b87500;
}

.os-badge.linux {
  background: rgba(72, 124, 94, 0.14);
  color: #326247;
}

.release-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-top: 1.5rem;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.5rem;
  padding: 0.85rem 1.35rem;
  border-radius: 10px;
  background: #fcb334;
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease;
}

.download-btn:hover {
  background: #e5a02c;
  transform: translateY(-1px);
}

.changelog-box {
  margin-top: 2rem;
  background: #fff;
  border: 1px solid rgba(28, 36, 33, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
}

.changelog-box h3 {
  margin: 0 0 0.75rem;
  color: #2c3e50;
  font-size: 1.15rem;
}

.changelog-text {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  color: #4a5568;
  line-height: 1.6;
  font-size: 0.95rem;
}

.more-link {
  display: inline-block;
  margin-top: 1rem;
  color: #fcb334;
  text-decoration: none;
  font-weight: 600;
}

.more-link:hover {
  text-decoration: underline;
}

@media (max-width: 720px) {
  .download-header h1 {
    font-size: 2rem;
  }

  .download-grid {
    grid-template-columns: 1fr;
  }
}
</style>
