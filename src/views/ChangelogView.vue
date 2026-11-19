<template>
  <div class="changelog-page">
    <div class="changelog-header">
      <h1>更新日志</h1>
      <p class="subtitle">ZError版本更新记录</p>
    </div>

    <p v-if="status === 'loading'" class="subtitle" role="status">正在读取发布列表…</p>
    <p v-else-if="status === 'error'" class="subtitle" role="status">暂时无法读取发布列表。</p>
    <p v-else-if="!releases.length" class="subtitle" role="status">暂无正式发布。</p>

    <div class="changelog-container">
      <article v-for="release in releases" :key="release.tag" class="log-card">
        <a class="version-badge" :href="release.releaseUrl">v{{ release.version }}</a>
        <div class="log-content">
          <time v-if="release.releaseDate" class="log-date" :datetime="release.releaseDate">
            {{ release.releaseDate.slice(0, 10) }}
          </time>
          <div v-if="release.notes" class="log-description">{{ release.notes }}</div>
        </div>
      </article>
    </div>
    <p class="release-link">
      <a :href="githubReleases">在 GitHub 查看全部发布</a>
    </p>
  </div>
</template>

<script setup lang="ts">
import { githubReleases, useReleaseList } from '../composables/useReleaseList'

const { releases, status } = useReleaseList()
</script>

<style scoped>
.changelog-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.changelog-header {
  text-align: center;
  margin-bottom: 3rem;
}

.changelog-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.changelog-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.log-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: flex-start;
  transition: transform 0.3s ease;
}

.log-card:hover {
  transform: translateY(-3px);
}

.version-badge {
  background: #FCB334;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  text-decoration: none;
  margin-right: 1.5rem;
  flex-shrink: 0;
}

.log-content {
  flex: 1;
}

.log-date {
  display: block;
  font-size: 1rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
}

.log-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #2c3e50;
  white-space: pre-wrap;
}
.release-link {
  margin-top: 1.5rem;
}

@media (max-width: 540px) {
  .log-card {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
