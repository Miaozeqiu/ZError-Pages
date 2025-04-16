<template>
  <div class="app-container">
    <nav>
      <div class="nav-brand">
        <img src="@/assets/zerror.svg" alt="Logo" class="nav-logo">
        <span class="brand-name">ZError</span>
      </div>
      <button class="hamburger" @click="toggleMenu">
        <svg t="1744518248746" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4556" width="24" height="24">
          <path d="M804.571429 256a36.571429 36.571429 0 0 1 0 73.142857H219.428571a36.571429 36.571429 0 1 1 0-73.142857h585.142858z m0 219.428571a36.571429 36.571429 0 0 1 0 73.142858H219.428571a36.571429 36.571429 0 0 1 0-73.142858h585.142858z m0 219.428572a36.571429 36.571429 0 0 1 0 73.142857H219.428571a36.571429 36.571429 0 0 1 0-73.142857h585.142858z" fill="#2c3e50" fill-opacity="0.65" p-id="4557"></path>
        </svg>
      </button>
      <div class="nav-links" :class="{ 'active': isMenuOpen }">
        <router-link to="/">首页</router-link>
        <a href="#" @click.prevent="showDownloadModal = true">下载</a>
        <router-link to="/changelog">更新日志</router-link>
        <a href="https://github.com/Miaozeqiu/ZError" target="_blank" class="github-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
        </a>
      </div>
    </nav>
    <main>
      <router-view />
    </main>

    <!-- 添加下载弹窗 -->
    <transition name="modal-fade">
      <div class="modal" v-if="showDownloadModal">
        <div class="modal-content">
          <span class="close" @click="showDownloadModal = false">&times;</span>
          <a>下载 ZError for Windows</a>
          <div class="download-options">
            <a href="https://dwpan.com/f/jVsq/ZError_Setup_1.1.0.exe" class="download-btn direct-download">
              <i class="icon-download"></i> 直链下载
            </a>
            <a href="https://wwyl.lanzoum.com/b00ocrzzje" class="download-btn cloud-download">
              <i class="icon-cloud"></i> 蓝奏云下载(密码:43so)
            </a>
            <a href="https://www.123865.com/s/RnebVv-m6b3v" class="download-btn cloud-download">
              <i class="icon-cloud"></i> 123网盘下载
            </a>
            <a href="https://www.123684.com/s/RnebVv-m6b3v" class="download-btn cloud-download">
              <i class="icon-cloud"></i> 123网盘下载（备用）
            </a>
            <a href="https://pan.quark.cn/s/b5302b71bb09" class="download-btn cloud-download">
              <i class="icon-cloud"></i> 夸克网盘
            </a>
            <a href="https://pan.quark.cn/s/7142e7e19adb" class="download-btn cloud-download">
              <i class="icon-cloud"></i> 夸克网盘（备用）
            </a>

          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { provide, ref, watch } from 'vue'

export default {
  setup() {
    const showDownloadModal = ref(false)
    const isMenuOpen = ref(false)

    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value
    }

    const openDownloadModal = () => {
      showDownloadModal.value = true
    }

    watch(showDownloadModal, (newVal) => {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      const nav = document.querySelector('nav')
      if(newVal) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
        nav.style.paddingRight = `${parseInt(window.getComputedStyle(nav).paddingRight) + scrollbarWidth}px`
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.paddingRight = ''
        nav.style.paddingRight = ''
        document.body.style.overflow = ''
      }
    })

    provide('downloadModal', {
      show: showDownloadModal,
      open: openDownloadModal
    })

    return {
      showDownloadModal,
      isMenuOpen,
      toggleMenu
    }
  }
}
</script>

<style>
/* 新增body样式防止偏移 */
body {
  margin: 0;
  overflow-y: scroll;
}

.modal {
  /* 保持原有样式 */
  backdrop-filter: blur(20px);
}

/* 添加过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-content {
  animation: modal-in 0.3s ease;
}

@keyframes modal-in {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal {
  position: fixed;
  z-index: 2000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(20px); /* 添加背景模糊效果 */
}

.modal-content {
  background-color: #fefefe;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15); /* 增强阴影效果 */
  /* border: 1px solid rgba(0,0,0,0.1);  */
}


.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close:hover {
  color: black;
}

.download-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

.download-btn {
  padding: 12px 20px;
  border-radius: 6px;
  text-align: center;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.direct-download {
  background: #ffffff;
  color: #FCB334;
  border: 1px solid #FCB334;
}

.direct-download:hover {
  background: #FCB334;
  color: #fff;
}

.cloud-download {
  background: #ffffff;
  color: #FCB334;
  border: 1px solid #FCB334;
}

.cloud-download:hover {
  background: #FCB334;
  color: #fff;
}


.app-container {
  min-height: 100vh;
}

nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1rem 1.5rem;
  background: transparent; /* 改为半透明背景 */
  backdrop-filter: blur(5px); /* 添加毛玻璃效果 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.nav-brand {
  width: 800px;
  display: flex;
  align-items: center;
  gap: 8px; /* 减少图标与品牌名称间距 */
}

.nav-logo {
  height: 48px; /* 稍微缩小图标 */
  width: 48px;
}

.nav-links {
  display: flex;
  gap: 1.5rem; /* 减少导航链接间距 */
}

.brand-name {
  font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  font-size: 2.5rem;
  font-weight: 900;
  color: #FCB334;
  letter-spacing: 0.5px;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center; /* 新增：垂直居中 */
}

.github-icon {
  display: flex;
  align-items: center;
  color: #2c3e50;
  transition: all 0.3s ease;
}

.github-icon:hover {
  color: #FCB334;
  transform: scale(1.1);
}

.github-icon svg {
  width: 24px;
  height: 24px;
}



.nav-links a {

  padding: 0.5rem 0;
  position: relative;
  transition: all 0.3s ease;
  flex-direction: row;
  flex-shrink: 0; /* 防止被压缩 */
}

.nav-links a:hover {
  color: #FCB334;
}

.nav-links a.router-link-exact-active {
  color: #FCB334;
  border-bottom: none;
}

.nav-links a.router-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #FCB334;
}
main {
  margin-top: 70px;  /* 改用margin-top */
}

/* 保留原有的导航链接样式 */
nav a {
  color: #2c3e50;
  text-decoration: none;
  font-weight: 500;
}

nav a.router-link-exact-active {
  color: #FCB334;
  border-bottom: 2px solid #FCB334;
}

body {
  margin: 0px;
}



/* 默认隐藏汉堡按钮 */
.hamburger {
  display: none;
}

/* 默认显示导航链接 */
.nav-links {
  display: flex;
}

@media (max-width: 1200px) {
  .nav-brand {
    width: 500px;
  }
}

@media (max-width: 768px) {

  nav{
    background-color: #fff;
  }
  /* 小屏幕下显示汉堡按钮 */
  .hamburger {
    display: flex;
    position: absolute;
    right: 1.5rem;
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: 1000;

  }

  /* 小屏幕下默认隐藏导航菜单 */
  .nav-links {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    background: #fff;
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
    z-index: 999;
    box-shadow: 1px 10px 10px rgba(0, 0, 0, 0.02);
    /* 添加过渡效果 */
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease, opacity 0.3s ease;
    opacity: 0;
  }

  .nav-links.active {
    max-height: 500px; /* 足够容纳所有菜单项的高度 */
    opacity: 1;
    display: flex;
  }
}
</style>
