<template>
  <div class="home-root">
  <div class="home-page">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="title home-hero-title">开源的大学生 AI 题库</h1>
        <p class="subtitle home-hero-subtitle">
          支持<a
            href="https://docs.ocsjs.com/"
            target="_blank"
            style="color: #fcb334; text-decoration: none"
            >OCS网课助手</a
          >
        </p>
        <div class="home-download-actions">
          <div class="home-download-choice">
            <a v-if="recommended" :href="recommended.downloadUrl" class="home-action-button home-action-download">
              <img :src="downloadPlatformIcons[recommended.platform]" alt="" class="home-download-system-icon" width="24" height="24" />
              <span>
                <strong>立即下载 ZError</strong>
                <small>{{ recommended.platformName }} · {{ recommended.architecture }} · {{ recommended.fileFormat }}</small>
              </span>
            </a>
            <router-link
              v-else
              :to="{ path: '/', hash: platformGroup ? '#download-' + platformGroup.id : '#all-downloads' }"
              class="home-action-button home-action-download"
            >
              <img v-if="platformGroup" :src="downloadPlatformIcons[platformGroup.id]" alt="" class="home-download-system-icon" width="24" height="24" />
              <ActionIcon v-else name="download" class="home-fallback-download-icon" />
              <span>
                <strong>{{ platformGroup ? '选择 ' + platformGroup.name + ' 安装包' : '查看全部下载' }}</strong>
                <small v-if="downloadStatus === 'loading'">正在读取可用版本…</small>
              </span>
            </router-link>
            <router-link v-if="recommended || platformGroup" to="/#all-downloads" class="home-download-secondary">
              查看全部下载 <ActionIcon name="chevron-down" />
            </router-link>
          </div>
          <a href="https://tiku.zerror.cc" class="home-action-button home-action-bank">
            <img :src="bankIcon" alt="" width="24" height="24" class="home-bank-icon" />
            <span>
              <strong>在线题库</strong>
              <small>在浏览器中使用</small>
            </span>
          </a>
        </div>
      </div>
      <AppWindowPreview />
    </div>

    <div class="search-feature-section">
      <div class="search-feature-content">
        <h3 class="search-feature-title animate-element">
          <span class="feature-ink feature-ink-underline">多模型<svg viewBox="0 0 160 16" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10C40 15 99 2 156 6M7 13C52 12 112 5 151 8" /></svg></span><br />
          <span class="feature-ink feature-ink-circle">并发<svg viewBox="0 0 120 64" preserveAspectRatio="none" aria-hidden="true"><path d="M108 13C88-2 30 0 10 17C-8 35 11 60 51 60C90 63 121 47 116 27C111 7 74 0 42 5M106 12C81 1 30 3 12 21" /></svg></span>请求。
        </h3>
        <p class="search-feature-desc animate-element">
          支持多个模型并发请求，由总结模型汇总答案，提高回答准确性。
        </p>
      </div>
      <div class="feature-visual-stack animate-element">
        <canvas ref="featureCanvas" class="feature-canvas" width="800" height="600" alt="功能展示"></canvas>
      </div>
    </div>

    <div class="search-feature-section reverse">
      <div class="search-feature-content">
        <h3 class="search-feature-title animate-element">
          完美<span class="feature-ink feature-ink-circle">支持<svg viewBox="0 0 120 64" preserveAspectRatio="none" aria-hidden="true"><path d="M107 11C74-2 24 2 8 22C-4 41 17 62 57 60C94 59 120 43 115 25C110 9 80 1 49 4M111 18C100 5 69 1 40 7" /></svg></span><br />
          <span class="feature-ink feature-ink-underline">图片题目<svg viewBox="0 0 160 16" preserveAspectRatio="none" aria-hidden="true"><path d="M3 9C44 15 101 3 157 5M9 13C60 12 116 5 151 8" /></svg></span>。
        </h3>
        <p class="search-feature-desc animate-element">
          兼容 OCS 网课助手，借助视觉大模型识别图片中的公式，自动生成答案。
        </p>
      </div>
      <div class="feature-visual-stack animate-element">
        <canvas ref="ocsCanvas" class="feature-canvas" width="800" height="600" alt="OCS与视觉模型展示"></canvas>
      </div>
    </div>

    <SiteCommunity />

  </div>
    <section id="all-downloads" ref="downloadsSection" class="home-downloads" aria-labelledby="home-downloads-heading">
      <div class="home-downloads-heading">
        <h2 id="home-downloads-heading">让学习，轻松一点。</h2>
        <span v-if="latest" class="home-release-version">正式版 v{{ latest.version }}</span>
      </div>
      <div v-if="groups.length" class="home-download-grid">
        <section
          v-for="group in groups"
          :id="'download-' + group.id"
          :key="group.id"
          class="home-download-platform"
          :aria-labelledby="'download-label-' + group.id"
        >
          <h3 :id="'download-label-' + group.id">
            <img :src="downloadListIcons[group.id]" alt="" width="20" height="20" />
            {{ group.name }}
          </h3>
          <ul>
            <li v-for="installer in group.installers" :key="installer.downloadUrl">
              <a
                :href="installer.downloadUrl"
                :aria-label="'下载 ' + group.name + ' ' + installer.architecture + ' ' + installer.fileFormat"
              >
                <strong>{{ installer.architecture }}</strong>
                <span class="home-installer-format">{{ installer.fileFormat }}</span>
                <ActionIcon name="download" class="home-installer-icon" />
              </a>
            </li>
          </ul>
        </section>

      </div>
      <p v-else class="home-download-status" role="status">
        {{ downloadStatus === 'loading' ? '正在读取发布列表…' : '暂时无法从官网获取安装包。' }}
      </p>
      <div class="home-download-resources">
        <router-link to="/changelog">更新日志</router-link>
        <a :href="latest?.releaseUrl || githubReleases">GitHub 发布页</a>
      </div>
    </section>


  </div>
</template>

<script>
import multiModelImage from "@/assets/multi-model.png";
import questionImage from "@/assets/question.png";
import ocsImage from "@/assets/ocs.png";
import visionImage from "@/assets/vision.png";
import appleDownloadIcon from "@/assets/download-apple.svg";
import windowsDownloadIcon from "@/assets/download-windows.svg";
import linuxDownloadIcon from "@/assets/download-linux.svg";
import windowsColorIcon from "@/assets/platform-windows-color.svg";
import linuxColorIcon from "@/assets/platform-linux-color.svg";
import bankIcon from "@/assets/lucide-globe.svg";
import ActionIcon from "@/components/ActionIcon.vue";
import AppWindowPreview from "@/components/AppWindowPreview.vue";
import SiteCommunity from "@/components/SiteCommunity.vue";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useHomeDownloads } from "@/composables/useHomeDownloads";
import "@/assets/styles/home.css"; // 导入样式文件

const downloadPlatformIcons = {
  macos: appleDownloadIcon,
  windows: windowsDownloadIcon,
  linux: linuxDownloadIcon,
};

const downloadListIcons = {
  macos: appleDownloadIcon,
  windows: windowsColorIcon,
  linux: linuxColorIcon,
};

export default {
  components: { ActionIcon, AppWindowPreview, SiteCommunity },
  setup() {
    const route = useRoute();
    const downloadsSection = ref(null);
    const { latest, status: downloadStatus, groups, platformGroup, recommended, githubReleases } = useHomeDownloads();
    onMounted(() => {
      if (route.hash === "#all-downloads") downloadsSection.value?.scrollIntoView();
    });

    const featureCanvas = ref(null);
    const ocsCanvas = ref(null);

    // Helper for rounded rect clipping
    const roundRect = (ctx, x, y, width, height, radius) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    const drawOcsCanvas = () => {
      const canvas = ocsCanvas.value;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const imgBase = new Image();
      const imgOverlay = new Image();
      imgBase.src = visionImage;
      imgOverlay.src = ocsImage;

      let baseLoaded = false;
      let overlayLoaded = false;

      const drawImages = () => {
        if (!baseLoaded || !overlayLoaded) return;

        // vision.png ratio
        const baseRatio = imgBase.height / imgBase.width;
        // ocs.png ratio
        const overlayRatio = imgOverlay.height / imgOverlay.width;

        // Define sizes.
        // We want base (vision) to be shifted right, overlay (ocs) to be on the left
        const baseWidth = 540;
        const baseHeight = baseWidth * baseRatio;

        const overlayWidth = baseWidth * 0.75;
        const overlayHeight = overlayWidth * overlayRatio;

        // Offset logic: OCS is on the left (x=0), vision is shifted right
        const overlayX = 0;
        const overlayY = baseHeight * 0.12;

        const baseX = overlayWidth * 0.45;
        const baseY = 0;

        // Padding for shadows
        const padding = 60;
        const totalWidth = Math.max(baseX + baseWidth, overlayX + overlayWidth) + padding * 2;
        const totalHeight = Math.max(baseY + baseHeight, overlayY + overlayHeight) + padding * 2;

        const dpr = Math.max(window.devicePixelRatio || 1, 3);
        canvas.width = totalWidth * dpr;
        canvas.height = totalHeight * dpr;

        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.translate(padding, padding);

        // Draw base (vision)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 15;
        ctx.shadowOffsetX = 0;

        ctx.save();
        roundRect(ctx, baseX, baseY, baseWidth, baseHeight, 16);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.clip();
        ctx.drawImage(imgBase, baseX, baseY, baseWidth, baseHeight);
        ctx.restore();

        // Draw overlay (ocs) in front
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 20;

        ctx.save();
        roundRect(ctx, overlayX, overlayY, overlayWidth, overlayHeight, 16);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.clip();
        ctx.drawImage(imgOverlay, overlayX, overlayY, overlayWidth, overlayHeight);
        ctx.restore();
      };

      imgBase.onload = () => {
        baseLoaded = true;
        drawImages();
      };

      imgOverlay.onload = () => {
        overlayLoaded = true;
        drawImages();
      };
    };

    const drawFeatureCanvas = () => {
      const canvas = featureCanvas.value;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const imgBase = new Image();
      const imgOverlay = new Image();
      imgBase.src = multiModelImage;
      imgOverlay.src = questionImage;

      let baseLoaded = false;
      let overlayLoaded = false;

      const drawImages = () => {
        if (!baseLoaded || !overlayLoaded) return;

        // Get natural aspect ratios
        const baseRatio = imgBase.height / imgBase.width;
        const overlayRatio = imgOverlay.height / imgOverlay.width;

        // Define base image size relative to canvas
        const baseWidth = 800; // Base rendering width
        const baseHeight = baseWidth * baseRatio;

        // Define overlay image size and position (1.2x width of base, offset right/down)
        const overlayWidth = baseWidth * 1.2;
        const overlayHeight = overlayWidth * overlayRatio;
        const overlayX = baseWidth * 0.4; // 100% - ~32% visual overlap = ~0.6 -> shift right
        const overlayY = baseHeight * 0.3; // 30% down

        // Calculate total needed canvas size (including shadows)
        const padding = 60; // Extra space for shadows
        const totalWidth = Math.max(baseWidth, overlayX + overlayWidth) + padding * 2;
        const totalHeight = Math.max(baseHeight, overlayY + overlayHeight) + padding * 2;

        // Set actual canvas resolution (High DPI)
        // Use a higher multiplier (e.g. 3 or 4) to ensure crisp rendering when scaled down by CSS
        const dpr = Math.max(window.devicePixelRatio || 1, 3);
        canvas.width = totalWidth * dpr;
        canvas.height = totalHeight * dpr;

        // Scale context to match DPR
        ctx.scale(dpr, dpr);

        // Enable high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Center the drawing in the padded area
        ctx.translate(padding, padding);

        // Draw base image with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 15;
        ctx.shadowOffsetX = 0;

        ctx.save();
        roundRect(ctx, 0, 0, baseWidth, baseHeight, 16);
        ctx.fillStyle = 'white';
        ctx.fill(); // Fill to ensure shadow shows under transparent areas
        ctx.clip();
        ctx.drawImage(imgBase, 0, 0, baseWidth, baseHeight);
        ctx.restore();

        // Draw overlay with stronger shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 20;

        ctx.save();
        roundRect(ctx, overlayX, overlayY, overlayWidth, overlayHeight, 16);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.clip();
        ctx.drawImage(imgOverlay, overlayX, overlayY, overlayWidth, overlayHeight);
        ctx.restore();
      };

      imgBase.onload = () => {
        baseLoaded = true;
        drawImages();
      };

      imgOverlay.onload = () => {
        overlayLoaded = true;
        drawImages();
      };
    };

    onMounted(() => {
      // 绘制 canvas
      drawFeatureCanvas();
      drawOcsCanvas();

      // 创建Intersection Observer实例
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // 当元素进入视口时添加可见类
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              // 元素显示后，不再观察
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1, // 当10%的元素可见时触发
        },
      );

      // 观察所有带有animate-element类的元素
      document.querySelectorAll(".animate-element").forEach((el) => {
        observer.observe(el);
      });
    });

    return {
      featureCanvas,
      downloadsSection,
      latest,
      downloadStatus,
      groups,
      platformGroup,
      recommended,
      downloadPlatformIcons,
      downloadListIcons,
      bankIcon,
      githubReleases,
      ocsCanvas,
    };
  },
};
</script>

<style scoped>
.search-feature-content {
  min-width: 0;
  max-width: 300px;
}
.search-feature-title {
  margin-bottom: 1.25rem;
  font-size: clamp(1.9rem, 2.8vw, 2.4rem);
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.035em;
  color: #252b32;
}
.search-feature-desc {
  font-size: 1rem;
  line-height: 1.7;
  color: #454d58;
}
.feature-ink { position: relative; display: inline-block; }
.feature-ink svg {
  position: absolute;
  pointer-events: none;
  overflow: visible;
  fill: none;
  stroke: #fcb334;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.feature-ink path { vector-effect: non-scaling-stroke; }
.feature-ink-underline svg { width: 106%; height: 0.28em; left: -3%; bottom: 0.03em; }
.feature-ink-circle svg { width: 125%; height: 1.32em; left: -12%; top: 0.08em; transform: rotate(-5deg); }
@media (max-width: 900px) {
  .search-feature-content { width: 100%; max-width: 620px; text-align: left; }
  .search-feature-title br { display: none; }
}

.hero-section {
  margin-top: clamp(3.25rem, 7vw, 6.5rem);
  margin-bottom: clamp(2.9rem, 6vw, 5rem);
}

.home-hero-title {
  margin-bottom: 1rem;
  color: #272019;
  font-size: clamp(2.2rem, 5.7vw, 4.5rem);
  font-weight: 700;
  letter-spacing: -0.045em;
  text-wrap: balance;
}

.home-hero-subtitle {
  margin-top: 0;
  margin-bottom: 1.6rem;
  font-weight: 400;
}

.home-download-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 0.65rem 0.85rem;
  width: min(100%, 30rem);
}

.home-download-choice {
  display: grid;
  min-width: 0;
  gap: 0.2rem;
}

.home-action-button {
  display: flex;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  min-height: 60px;
  padding: 0.62rem 1rem;
  border: 1px solid transparent;
  border-radius: 999px;
  text-align: left;
  text-decoration: none;
}

.home-action-download {
  border-color: #fcb334;
  background: #fcb334;
  color: #fff;
}

.home-action-bank {
  border-color: #f6dfb0;
  background: #fffbf3;
  color: #fcb334;
}

.home-action-button strong,
.home-action-button small {
  display: block;
  line-height: 1.35;
}

.home-action-button strong {
  font-size: 0.975rem;
  font-weight: 650;
}

.home-action-button small {
  margin-top: 0.2rem;
  color: inherit;
  font-size: 0.73rem;
  font-weight: 500;
}

.home-action-bank small {
  color: inherit;
}

.home-action-bank strong {
  font-weight: 600;
}

.home-fallback-download-icon {
  flex: 0 0 24px;
  font-size: 1.3rem;
}

.home-download-system-icon {
  flex: 0 0 24px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.home-bank-icon {
  flex: 0 0 24px;
  object-fit: contain;
}

.home-download-secondary {
  display: inline-flex;
  align-items: center;
  justify-self: center;
  gap: 0.4rem;
  min-height: 40px;
  padding: 0 0.55rem;
  border-radius: 8px;
  color: #4a5568;
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
}

.home-download-secondary .action-icon {
  font-size: 0.75rem;
}

.home-downloads {
  box-sizing: border-box;
  width: 100%;
  max-width: 1120px;
  margin: clamp(3rem, 6vw, 5rem) auto 0;
  padding: clamp(2rem, 5vw, 3.5rem) clamp(1.25rem, 4vw, 3rem) 1.75rem;
  border: 1px solid #ffbf51;
  border-radius: 24px;
  background: linear-gradient(115deg, #f3a321 0%, #fcb334 45%, #ffd574 100%);
  color: #292118;
  scroll-margin-top: 95px;
}

.home-downloads-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  text-align: center;
}

.home-downloads-heading h2 {
  margin: 0;
  color: #fff;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  line-height: 1.2;
  letter-spacing: -0.04em;
}

.home-release-version {
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
}

.home-download-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  align-items: start;
  gap: 0.8rem;
  max-width: 900px;
  margin-inline: auto;
}

.home-download-platform {
  min-width: 0;
  padding: 1.25rem 1rem 1rem;
  border: 1px solid rgb(255 255 255 / 65%);
  border-radius: 15px;
  background: #fffdf9;
  box-shadow: 0 4px 14px rgb(169 98 0 / 5%);
  scroll-margin-top: 95px;
}

.home-download-platform h3 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin: 0 0 1rem;
  color: #30261a;
  font-size: 1.125rem;
  font-weight: 650;
}

.home-download-platform h3 img {
  flex: none;
  object-fit: contain;
}

.home-download-platform ul {
  display: grid;
  gap: 0.42rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.home-download-platform li a {
  display: flex;
  box-sizing: border-box;
  min-height: 47px;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.7rem;
  border: 1px solid rgb(140 70 0 / 10%);
  border-radius: 9px;
  background: #fff8eb;
  box-shadow: 0 1px 2px rgb(140 70 0 / 12%);
  color: #4b3a20;
  font-size: 0.88rem;
  text-decoration: none;
}

.home-installer-format {
  padding: 0.15rem 0.35rem;
  border-radius: 5px;
  background: #fff;
  color: #635137;
  font-size: 0.72rem;
}

.home-installer-icon {
  margin-left: auto;
  color: #815519;
  font-size: 1.12rem;
}

.home-download-status {
  margin: 0;
  color: #fff;
  text-align: center;
}

.home-download-resources {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  justify-content: center;
  margin-top: 1.3rem;
}

.home-download-resources a {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 0.25rem;
  color: #613d0b;
  font-size: 0.85rem;
  text-decoration: none;
}

.home-root :is(.home-download-actions, .home-downloads) a:focus-visible {
  outline: 2px solid #865718;
  outline-offset: 3px;
}

@media (hover: hover) {
  .home-action-download:hover {
    border-color: #f1a91f;
    background: #f1a91f;
  }

  .home-action-bank:hover {
    border-color: #f0cd88;
    background: #fff6e5;
  }

  .home-download-platform li a:hover {
    background: #fff4df;
    box-shadow: 0 2px 4px rgb(140 70 0 / 14%);
  }

  .home-download-secondary:hover,
  .home-download-resources a:hover {
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
}

@media (max-width: 1800px) {
  .home-download-actions {
    margin-inline: auto;
  }
}

@media (max-width: 570px) {
  .home-download-actions {
    grid-template-columns: minmax(0, 1fr);
    max-width: 20rem;
  }
}
</style>
