<template>
  <div class="download-page">
    <div class="download-header">
      <h1>下载 ZError</h1>
      <p class="subtitle">选择适合你系统的安装包 · 当前版本 {{ version }}</p>
    </div>

    <div class="download-grid">
      <section class="download-card">
        <div class="os-badge mac">macOS</div>
        <h2>Mac（Apple Silicon）</h2>
        <p class="hint">适用于 M 系列芯片。下载 DMG 后拖入「应用程序」。</p>
        <a class="download-btn" :href="macUrl" download>
          下载 macOS 版
        </a>
        <p class="meta">{{ macFileName }}</p>
      </section>

      <section class="download-card">
        <div class="os-badge win">Windows</div>
        <h2>Windows x64</h2>
        <p class="hint">适用于 64 位 Windows。下载后直接运行安装程序。</p>
        <a class="download-btn" :href="winUrl" download>
          下载 Windows 版
        </a>
        <p class="meta">{{ winFileName }}</p>
      </section>
    </div>

    <div class="changelog-box" v-if="changelog">
      <h3>本版更新</h3>
      <pre class="changelog-text">{{ changelog }}</pre>
      <router-link class="more-link" to="/changelog">查看完整更新日志</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DownloadView',
  data() {
    return {
      version: '2.2.7',
      macUrl: 'https://webapi.zaizhexue.top/apps/ZError_2.2.7_aarch64_r5.dmg',
      winUrl: 'https://webapi.zaizhexue.top/apps/ZError_2.2.7_x64-setup.exe',
      changelog: '',
    }
  },
  computed: {
    macFileName() {
      try {
        return decodeURIComponent(new URL(this.macUrl).pathname.split('/').pop() || '')
      } catch {
        return 'ZError macOS.dmg'
      }
    },
    winFileName() {
      try {
        return decodeURIComponent(new URL(this.winUrl).pathname.split('/').pop() || '')
      } catch {
        return 'ZError Windows.exe'
      }
    },
  },
  async mounted() {
    try {
      const res = await fetch('/latest_version.json', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (data.version) this.version = data.version
      if (data.downloadUrlMac || data.downloadUrlDarwin) {
        this.macUrl = data.downloadUrlMac || data.downloadUrlDarwin
      }
      if (data.downloadUrlWin || data.downloadUrlWindows || data.downloadUrl) {
        this.winUrl = data.downloadUrlWin || data.downloadUrlWindows || data.downloadUrl
      }
      if (data.changelog) this.changelog = data.changelog
    } catch (e) {
      console.warn('加载 latest_version.json 失败', e)
    }
  },
}
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

.download-card h2 {
  margin: 0;
  font-size: 1.35rem;
  color: #2c3e50;
}

.hint {
  margin: 0;
  color: #7f8c8d;
  line-height: 1.5;
  font-size: 0.95rem;
  flex: 1;
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

.meta {
  margin: 0;
  font-size: 0.8rem;
  color: #95a5a6;
  word-break: break-all;
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
