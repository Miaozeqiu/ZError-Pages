<template>
  <section class="community-section" aria-labelledby="community-heading">
    <header class="community-intro">
      <span class="community-eyebrow">ZError 社区</span>
      <h2 id="community-heading">一起交流，<br />共同进步。</h2>
      <p>分享使用心得，获取更新动态。<br />让每一次交流，都带来一点新收获。</p>
    </header>
    <div class="community-grid">
      <article v-for="item in communities" :key="item.name" class="community-card">
        <div class="community-card-main">
          <span class="community-icon" :class="item.id">
            <img :src="item.icon" alt="" width="28" height="28" />
          </span>
          <div>
            <h3>{{ item.name }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>
        <div class="community-card-actions">
          <a v-if="item.url" :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.action }}</a>
          <button v-else type="button" @click="copyWechat">复制公众号名称</button>
          <details v-if="item.qr" class="community-qr">
            <summary :aria-label="'查看' + item.name + '二维码'">扫码加入</summary>
            <div class="community-qr-popover">
              <img :src="item.qr" :alt="item.name + '二维码'" width="200" />
              <span>使用 QQ 扫码加入</span>
            </div>
          </details>
          <span v-if="item.id === 'wechat' && copyStatus" class="community-copy-status" role="status">{{ copyStatus }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import qqIcon from '@/assets/community-qq.svg'
import channelIcon from '@/assets/community-channel.svg'
import wechatIcon from '@/assets/community-wechat.svg'
import bilibiliIcon from '@/assets/community-bilibili.svg'
import qqGroupQr from '@/assets/qrcode_1792642922118.jpg'
import channelQr from '@/assets/qrcode_1764491300797.jpg'

const communities = [
  { id: 'qq', name: 'QQ 群聊', description: '交流问题与使用心得', icon: qqIcon, url: 'https://qm.qq.com/q/OtPOsvZEYi', action: '加入群聊', qr: qqGroupQr },
  { id: 'channel', name: 'QQ 频道', description: 'ZE题库交流', icon: channelIcon, url: 'https://pd.qq.com/s/51jqhjhn9', action: '加入频道', qr: channelQr },
  { id: 'wechat', name: '微信公众号', description: '@未耕之地', icon: wechatIcon },
  { id: 'bilibili', name: 'Bilibili', description: '@M0zey', icon: bilibiliIcon, url: 'https://space.bilibili.com/3546886514412225', action: '关注动态' },
]

const copyStatus = ref('')
async function copyWechat() {
  try {
    await navigator.clipboard.writeText('未耕之地')
    copyStatus.value = '已复制'
  } catch {
    copyStatus.value = '公众号：未耕之地'
  }
}
</script>

<style scoped>
.community-section {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(230px, 0.8fr) minmax(0, 1.7fr);
  align-items: center;
  gap: clamp(2rem, 5vw, 4rem);
  width: 100%;
  max-width: 1120px;
  margin: 1rem auto 0;
  padding: 1.5rem 0;
}

.community-eyebrow {
  color: #b67516;
  font-size: 0.8125rem;
  font-weight: 600;
}

.community-intro h2 {
  margin: 0.75rem 0 1rem;
  color: #2c3e50;
  font-size: clamp(1.8rem, 3vw, 2.2rem);
  font-weight: 600;
  line-height: 1.45;
  letter-spacing: -0.025em;
}

.community-intro p {
  margin: 0;
  color: #7a8490;
  font-size: 0.875rem;
  line-height: 1.9;
}

.community-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.community-card {
  min-width: 0;
  padding: 1.25rem;
  border: 1px solid #edf0f2;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 6px rgb(35 48 60 / 3%);
}

.community-card-main {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.community-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  border-radius: 13px;
}

.community-icon img { display: block; }
.community-icon.qq { background: #eef9ff; }
.community-icon.channel { background: #effbfc; }
.community-icon.wechat { background: #effbed; }
.community-icon.bilibili { background: #fff0f5; }

.community-card h3 {
  margin: 0;
  color: #34424f;
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.6;
}

.community-card p {
  margin: 0.2rem 0 0;
  color: #87909a;
  font-size: 0.75rem;
  line-height: 1.7;
}

.community-card-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 1rem;
  min-height: 36px;
  margin: 0.75rem 0 -0.25rem;
  font-size: 0.75rem;
}

.community-card-actions a,
.community-card-actions button,
.community-card-actions summary {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #b67516;
  font: inherit;
  text-decoration: none;
  cursor: pointer;
}

.community-card-actions summary { color: #87909a; list-style: none; }
.community-card-actions summary::-webkit-details-marker { display: none; }

.community-card-actions :is(a, button, summary):focus-visible {
  outline: 2px solid #fcb334;
  outline-offset: 3px;
  border-radius: 3px;
}

.community-qr { position: relative; }
.community-qr-popover {
  position: absolute;
  z-index: 5;
  bottom: calc(100% + 8px);
  right: 0;
  width: 200px;
  padding: 12px;
  border: 1px solid #edf0f2;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 8px 30px rgb(35 48 60 / 12%);
  text-align: center;
  color: #7a8490;
}
.community-qr-popover img { display: block; width: 100%; height: auto; margin-bottom: 8px; }
.community-copy-status { color: #7a8490; }

@media (hover: hover) and (pointer: fine) {
  .community-card-actions :is(a, button, summary):hover { color: #d48b1c; }
}

@media (max-width: 800px) {
  .community-section { grid-template-columns: 1fr; gap: 1.75rem; }
  .community-intro h2 br { display: none; }
}

@media (max-width: 480px) {
  .community-grid { grid-template-columns: 1fr; }
  .community-qr-popover { right: auto; left: -60px; }
}
</style>
