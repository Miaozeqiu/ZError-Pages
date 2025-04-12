<template>
  <div class="home-page">
    <div class="hero-section">
      <div class="hero-content">
        <p class="title">开源免费的大学生的AI题库</p>
        <p class="subtitle">支持OCS网课助手</p>
        <div class="button-group">
          <a href="#" @click.prevent="openDownloadModal" class="cta-button">立即下载</a>
          <router-link to="/question-bank" class="cta-button bank-button">在线题库</router-link>
        </div>
      </div>
      <img src="@/assets/ZError首页.png" alt="ZError首页" class="hero-image">
    </div>

    <div class="platform-section">
      <h3 class="platform-title">支持的AI平台</h3>
      <div class="platform-grid">

        <div class="platform-item">
          <div class="platform-icon" v-html="siliconSvg"></div>
          <span>硅基</span>
        </div>

        <div class="platform-item">
          <div class="platform-icon" v-html="bailianSvg"></div>
          <span>阿里百炼</span>
        </div>

        <div class="platform-item">
          <div class="platform-icon" v-html="deepseekSvg"></div>
          <span>DeepSeek</span>
        </div>

      </div>
    </div>
    
    <!-- 移动社交媒体区域到平台区域之后 -->
    <div class="social-media-section">
      <div class="social-header">
        <h3 class="social-title">关注我们</h3>
        <p class="social-subtitle">了解开发者动态</p>
      </div>
      <div class="social-icons">
        <div class="social-item">
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

        <div class="social-item">
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
</template>

<script>
import siliconSvg from '@/assets/硅基.svg?raw'
import bailianSvg from '@/assets/百炼.svg?raw'
import deepseekSvg from '@/assets/deepseek.svg?raw'  // 新增导入
import { inject } from 'vue'

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
    
    return {
      openDownloadModal: downloadModal.open
    }
  }
}
</script>

<style scoped>
/* 完全重置硅基图标样式 */

.platform-item{
  background: #fffefc;
  width: 100px;
  padding: 10px;
  margin-left: 100px;
  margin-right: 100px;
  border-radius: 10px;
  box-shadow:0 5px 20px #ffe5b0;
}

.platform-item span {
  font-size: 1.2rem;
  margin-top: 0.8rem;
}


.platform-item:nth-child(1) .platform-icon {
  width: 80px;
  height: 80px;
}
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.platform-section {
  display: flex;
  flex-direction: column;
  padding-bottom: 50px;
  background-color: #fff8ea;
  width: 100%;
  margin: 2rem auto;
}

.platform-title {
  text-align: center;
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.platform-grid {
  display: flex;
  justify-content: center;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.platform-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.platform-icon {
  width: 80px;  /* 从60px增大到80px */
  height: 80px;  /* 从60px增大到80px */
  display: flex;
  align-items: center;
  justify-content: center;
}

.platform-item span {
  font-size: 1.2rem;  /* 新增：调整文字大小 */
}


.home-page {
  margin: 0 auto;
  display: flex;
  justify-content: center;
  min-width: 100%;
}

.hero-section {
  height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  /* background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%); */
  border-radius: 16px;
  margin: 3rem auto;
  /* box-shadow: 0 10px 20px rgba(0,0,0,0.05); */
  width: 100%;
  max-width: 1600px;
}

.hero-content {
  flex: 0 1 auto;
  padding-right: 3rem;
  text-align: left;
}

.title {
  font-size: 50px;
  /* 从3rem增大到3.5rem */
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-weight: 400;
  line-height: 1.2;
}

.subtitle {
  font-size: 1.5rem;
  /* 从1.3rem增大到1.5rem */
  color: #4a5568;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  font-weight: 150;
}

.cta-button {
  display: inline-block;
  margin-left: 0;
  /* 确保按钮左对齐 */
  padding: 1rem 2.5rem;
  background: #FCB334;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 300;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(225, 150, 52, 0.3);
}

.cta-button:hover {
  background: #ffb83e;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(220, 177, 121, 0.3);
}

.hero-image {
  width: 60%;
  /* 减小图片宽度比例 */
  max-width: 800px;
  /* 减小最大宽度 */
  height: auto;
  border-radius: 12px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

/* 修改社交媒体区域样式 */
.social-media-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
}



.social-icons {
  display: flex;
  flex-direction: row;
  gap: 20px; /* 增加间距 */
  justify-content: center;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 8px;
  color: white;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.social-icon:hover {
  transform: scale(1.1);
}

.social-icon svg {
  width: 40px;
  height: 40px;
}

.wechat { background-color: #e7ffe0; }
.weibo { background-color: #E6162D; }
.bilibili { background-color: #ffebf1; }


/* 新增社交头部样式 */
.social-header {
  width: 100%; /* 改为100%自适应 */
  max-width: 400px; /* 添加最大宽度限制 */
  text-align: left;
  margin-bottom: 1rem;
}





.social-title {
  margin-bottom: 0.2rem; /* 减小与副标题的间距 */
}

.social-subtitle {
  font-size: 1rem;
  color: #666;
  margin-bottom: 0;
}



/* 新增社交媒体项样式 */
.social-item {
  width: 200px;
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.social-text {
  text-align: left;
}

.social-name {
  font-size: 1rem;
  color: #333;
  margin-bottom: 2px;
}

.social-desc {
  font-size: 0.8rem;
  color: #666;
}

.bank-button{
  margin-left: 20px;
  background-color: white;
  color:#FCB334;
  border: 1px solid #FCB334;
}

.bank-button:hover{
  background-color: #fffbf4;
  
}


</style>


