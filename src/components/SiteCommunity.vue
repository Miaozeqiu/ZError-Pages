<template>
  <section class="community-section" aria-labelledby="community-heading">
    <header class="community-heading">
      <h2 id="community-heading">加入社区</h2>
      <p>交流使用心得，关注最新动态。</p>
    </header>

    <div class="community-grid">
      <article v-for="item in communities" :key="item.name" class="community-card">
        <div class="community-card-heading">
          <img :src="item.icon" alt="" width="28" height="28" />
          <h3>{{ item.name }}</h3>
        </div>
        <div class="community-card-actions">
          <a :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.action }}<AppPreviewIcon name="arrow-right" class="community-action-icon" /></a>
          <div
            class="community-qr"
            :class="{ 'is-open': openQr === item.id }"
            @pointerenter="showQrOnHover($event, item.id)"
            @pointerleave="closeQrOnLeave"
            @focusin="showQrOnFocus($event, item.id)"
            @focusout="closeQrOnBlur"
            @keydown.esc.stop.prevent="openQr = ''"
          >
            <button
              type="button"
              :aria-label="'查看' + item.name + '二维码'"
              :aria-expanded="openQr === item.id"
              :aria-controls="'community-qr-' + item.id"
              @click="showQrOnClick($event, item.id)"
            ><AppPreviewIcon name="qr-code" class="community-qr-icon" /></button>
            <div v-show="openQr === item.id" :id="'community-qr-' + item.id" class="community-qr-popover">
              <img :src="item.qr" :alt="item.name + '二维码'" width="200" />
              <span>使用 QQ 扫码加入</span>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div class="community-socials">
      <div class="community-wechat">
        <button type="button" class="community-social-link" aria-label="复制微信公众号名称，未耕之地" @click="copyWechat">
          <img :src="wechatIcon" alt="" width="24" height="24" />
          <span>未耕之地<span class="community-social-platform">微信公众号</span></span>
        </button>
        <span class="community-copy-status" role="status">{{ copyStatus }}</span>
      </div>
      <a class="community-social-link" href="https://space.bilibili.com/3546886514412225" target="_blank" rel="noopener noreferrer">
        <img :src="bilibiliIcon" alt="" width="24" height="24" />
        <span>M0zey<span class="community-social-platform">Bilibili</span></span>
      </a>
    </div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AppPreviewIcon from './AppPreviewIcon.vue'
import qqIcon from '@/assets/community-qq.svg'
import channelIcon from '@/assets/community-channel.svg'
import wechatIcon from '@/assets/community-wechat.svg'
import bilibiliIcon from '@/assets/community-bilibili.svg'
import qqGroupQr from '@/assets/qrcode_1792642922118.jpg'
import channelQr from '@/assets/qrcode_1764491300797.jpg'

const communities = [
  { id: 'group', name: 'QQ 群聊', icon: qqIcon, url: 'https://qm.qq.com/q/OtPOsvZEYi', action: '加入群聊', qr: qqGroupQr },
  { id: 'channel', name: 'QQ 频道', icon: channelIcon, url: 'https://pd.qq.com/s/51jqhjhn9', action: '加入频道', qr: channelQr },
]

const openQr = ref('')
function showQrOnHover(event, id) {
  if (event.pointerType === 'mouse') openQr.value = id
}
function closeQrOnLeave(event) {
  if (event.pointerType === 'mouse') openQr.value = ''
}
function showQrOnFocus(event, id) {
  if (event.target.matches(':focus-visible')) openQr.value = id
}
function closeQrOnBlur(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) openQr.value = ''
}
function showQrOnClick(event, id) {
  openQr.value = event.pointerType === 'touch' && openQr.value === id ? '' : id
}
function closeQrOutside(event) {
  if (!event.target.closest('.community-qr')) openQr.value = ''
}
onMounted(() => document.addEventListener('pointerdown', closeQrOutside))
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeQrOutside))

const copyStatus = ref('')
async function copyWechat() {
  try {
    await navigator.clipboard.writeText('未耕之地')
    copyStatus.value = '名称已复制'
  } catch {
    copyStatus.value = '公众号：未耕之地'
  }
}
</script>

<style scoped>
.community-section {
  position: relative;
  isolation: isolate;
  box-sizing: border-box;
  width: 100%;
  max-width: 960px;
  margin: 1rem auto 0;
  padding: 2rem 0;
}

.community-section::before {
  position: absolute;
  z-index: -1;
  inset: -24px;
  pointer-events: none;
  background:
    linear-gradient(180deg, #fff 0%, rgb(255 255 255 / 98%) 20%, rgb(255 255 255 / 70%) 50%, rgb(255 255 255 / 15%) 85%, transparent 100%),
    linear-gradient(105deg, #fcb334 0% 12%, #f4df77 28%, #b8dfac 48%, #c2e5ed 66%, #fff 92%);
  mask-image: radial-gradient(ellipse closest-side, #000 40%, transparent 100%);
  content: '';
}

.community-heading { text-align: center; margin-bottom: 2.5rem; }
.community-heading h2 {
  margin: 0;
  color: #2c3e50;
  font-size: clamp(1.75rem, 3vw, 2.125rem);
  font-weight: 600;
  letter-spacing: -0.025em;
}
.community-heading p {
  margin: 0.75rem 0 0;
  color: #7a8490;
  font-size: 0.9375rem;
  line-height: 1.7;
}

.community-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}
.community-card {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  box-sizing: border-box;
  min-height: 104px;
  min-width: 0;
  padding: 1.625rem;
  border: 1px solid rgb(255 255 255 / 85%);
  border-radius: 14px;
  background: linear-gradient(135deg, rgb(255 255 255 / 62%), rgb(255 255 255 / 30%));
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  backdrop-filter: blur(20px) saturate(120%);
  box-shadow: 0 6px 24px rgb(89 63 30 / 5%), 0 1px 2px rgb(89 63 30 / 6%), inset 0 1px 0 #fff;
}
.community-card:has(.community-qr.is-open) { z-index: 2; }
.community-card-heading { display: flex; align-items: center; gap: 0.75rem; }
.community-card-heading img { display: block; flex-shrink: 0; }
.community-card h3 {
  margin: 0;
  color: #34424f;
  font-size: 1.125rem;
  font-weight: 600;
}
.community-card-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}
.community-card-actions a,
.community-qr button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 40px;
  color: #b67516;
  text-decoration: none;
  cursor: pointer;
}
.community-qr button { width: 40px; padding: 0; border: 0; background: transparent; color: #92979c; font: inherit; }
.community-action-icon { width: 16px; height: 16px; }
.community-qr-icon { width: 19px; height: 19px; }
.community-qr.is-open button { color: #b67516; }

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
  font-size: 0.75rem;
}
.community-qr-popover::after {
  position: absolute;
  top: 100%;
  left: -1px;
  right: -1px;
  height: 10px;
  content: '';
}
.community-qr-popover img { display: block; width: 100%; height: auto; margin-bottom: 8px; }

.community-socials {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem 3rem;
  margin-top: 2rem;
}
.community-social-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #55616d;
  font: inherit;
  font-size: 0.875rem;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}
.community-social-platform { display: block; margin-top: 0.25rem; color: #92979c; font-size: 0.75rem; }
.community-wechat { position: relative; }
.community-copy-status {
  position: absolute;
  top: calc(100% + 4px);
  left: 36px;
  white-space: nowrap;
  color: #b67516;
  font-size: 0.75rem;
}
.community-section :is(a, button):focus-visible {
  outline: 2px solid #fcb334;
  outline-offset: 4px;
  border-radius: 4px;
}
@supports not ((backdrop-filter: blur(20px)) or (-webkit-backdrop-filter: blur(20px))) {
  .community-card { background: #fffcf6; border-color: #eee8de; }
}
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
  .community-card {
    background: #fff;
    border-color: #dedbd5;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}
@media (hover: hover) and (pointer: fine) {
  .community-card-actions :is(a, button):hover,
  .community-social-link:hover { color: #b67516; }
}
@media (max-width: 640px) {
  .community-heading { margin-bottom: 1.75rem; }
  .community-grid { grid-template-columns: 1fr; gap: 1rem; }
  .community-card { padding: 1rem; min-height: 92px; }
  .community-qr-popover img { max-height: min(240px, 45svh); object-fit: contain; }
  .community-socials { gap: 1.5rem 2rem; }
}
</style>
