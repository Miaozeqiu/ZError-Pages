<template>
  <div class="home-page">
    <div class="hero-section">
      <div class="hero-content">
        <p class="title animate-element">开源免费的大学生的AI题库</p>
        <p class="subtitle animate-element">支持OCS网课助手</p>
        <div class="button-group animate-element">
          <a href="#" @click.prevent="openDownloadModal" class="cta-button">立即下载</a>
          <a href="https://ze.zaizhexue.top" class="cta-button bank-button">在线题库</a>
        </div>
      </div>
      <img src="@/assets/ZError首页.png" alt="ZError首页" class="hero-image">
    </div>

    <div class="platform-section">
      <h3 class="platform-title animate-element">支持的AI平台</h3>
      <div class="platform-grid">

        <div class="platform-item animate-element">
          <div class="platform-icon" v-html="siliconSvg"></div>
          <span>硅基</span>
        </div>

        <div class="platform-item animate-element">
          <div class="platform-icon" v-html="bailianSvg"></div>
          <span>阿里百炼</span>
        </div>

        <div class="platform-item animate-element">
          <div class="platform-icon" v-html="deepseekSvg"></div>
          <span>DeepSeek</span>
        </div>

      </div>
    </div>

    <!-- 移动社交媒体区域到平台区域之后 -->
    <div class="social-media-section">
      <div class="social-header">
        <h3 class="social-title animate-element">关注我们</h3>
        <p class="social-subtitle animate-element">了解开发者动态</p>
      </div>
      <div class="social-icons">
        <div class="social-item animate-element">
          <a href="#" class="social-icon wechat">
            <svg t="1744442807199" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11101" width="24" height="24">
              <path d="M1010.8 628c0-141.2-141.3-256.2-299.9-256.2-168 0-300.3 115.1-300.3 256.2 0 141.4 132.3 256.2 300.3 256.2 35.2 0 70.7-8.9 106-17.7l96.8 53-26.6-88.2c70.9-53.2 123.7-123.7 123.7-203.3zM618 588.8c-22.1 0-40-17.9-40-40s17.9-40 40-40 40 17.9 40 40c0 22-17.9 40-40 40z m194.3-0.3c-22.1 0-40-17.9-40-40s17.9-40 40-40 40 17.9 40 40-17.9 40-40 40z" fill="#00C800" p-id="11102"></path>
              <path d="M366.3 106.9c-194.1 0-353.1 132.3-353.1 300.3 0 97 52.9 176.6 141.3 238.4l-35.3 106.2 123.4-61.9c44.2 8.7 79.6 17.7 123.7 17.7 11.1 0 22.1-0.5 33-1.4-6.9-23.6-10.9-48.3-10.9-74 0-154.3 132.5-279.5 300.2-279.5 11.5 0 22.8 0.8 34 2.1C692 212.6 539.9 106.9 366.3 106.9zM247.7 349.2c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z m246.6 0c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z" fill="#00C800" p-id="11103"></path>
            </svg>
          </a>
          <div class="social-text">
            <p class="social-name">@未耕之地</p>
            <p class="social-desc">微信公众号</p>
          </div>
        </div>

        <div class="social-item animate-element">
          <a href="https://space.bilibili.com/3494375787072223?spm_id_from=333.1296.0.0" class="social-icon bilibili">
            <svg t="1744443533641" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12093" width="24" height="24">
              <path d="M387.5 241.7l-74.9-72.6s-11.7-14.4 8.1-30.7c19.9-16.2 20.9-9 27.6-4.5 6.7 4.5 111.4 107.8 111.4 107.8h-72.2z m248.8 2.7l74.9-72.6s11.7-14.4-8.1-30.7c-19.8-16.2-20.9-9-27.6-4.5-6.7 4.5-111.4 107.8-111.4 107.8h72.2z" fill="#FB759C" p-id="12094"></path>
              <path d="M917.4 378.8c-2.7-113.7-101.5-135.3-101.5-135.3s-506.2-4.1-611.8 0c-105.6 29.8-97.5 135.3-97.5 135.3s1.4 226-0.1 340.4c11.4 114.4 99.6 132.6 99.6 132.6s35.2 0.7 60.9 0.7c2.7 7.4 4.7 43.3 44.7 43.3 39.9 0 44.7-43.3 44.7-43.3s292.4-1.4 316.7-1.4c1.4 12.2 7.4 45.3 47.4 44.7 39.9-0.7 42.6-47.4 42.6-47.4s13.5-1.4 54.1 0c94.7-17.6 100.2-128.6 100.2-128.6s-1.3-227.3 0-341z m-81.5 361.9c0 17.9-14.2 32.5-31.7 32.5H227.9c-17.5 0-31.7-14.5-31.7-32.5V359c0-17.9 14.2-32.5 31.7-32.5h576.3c17.5 0 31.7 14.5 31.7 32.5v381.7z" fill="#FB759C" p-id="12095"></path>
              <path d="M256.9 466.8l169.2-32.5 12.8 63.6-167.8 32.5z m526.5 0l-169.2-32.5-12.9 63.6 167.9 32.5zM438.9 624.5s37.2 67 78.5-21.7c39.9 86.6 83.9 23 83.9 23l25 16.3s-46.7 75.1-108.3 18.3c-52.1 56.8-106.9-18.1-106.9-18.1l27.8-17.8z" fill="#FB759C" p-id="12096"></path>
            </svg>
          </a>
          <div class="social-text">
            <p class="social-name">@宁做她的Plan_B</p>
            <p class="social-desc">Bilibili</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <footer class="page-footer" style="width:100%;display:flex;justify-content:center;align-items:center;padding:2rem 0 1rem 0;">
    <a href="https://www.netlify.com/" target="_blank" rel="noopener">
      <img src="@/assets/netlify.svg" alt="Netlify Logo" style="height:40px;">
    </a>
  </footer>
</template>

<script>
import siliconSvg from '@/assets/硅基.svg?raw'
import bailianSvg from '@/assets/百炼.svg?raw'
import deepseekSvg from '@/assets/deepseek.svg?raw'  // 新增导入
import { inject, onMounted } from 'vue'
import '@/assets/styles/home.css'  // 导入样式文件

export default {
  data() {
    return {
      siliconSvg,
      bailianSvg,
      deepseekSvg  // 新增数据项
    }
  },
  setup() {
    const downloadModal = inject('downloadModal')

    onMounted(() => {
      // 创建Intersection Observer实例
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          // 当元素进入视口时添加可见类
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // 元素显示后，不再观察
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1 // 当10%的元素可见时触发
      });

      // 观察所有带有animate-element类的元素
      document.querySelectorAll('.animate-element').forEach(el => {
        observer.observe(el);
      });
    });

    return {
      openDownloadModal: downloadModal.open
    }
  }
}
</script>



