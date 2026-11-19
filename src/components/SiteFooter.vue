<template>
  <footer class="site-footer">
    <div class="footer-overview">
      <div class="footer-intro">
        <router-link to="/" class="footer-brand" aria-label="返回 ZError 官网首页">
          <img src="@/assets/zerror.svg" alt="" width="28" height="28" />
          <span>ZError<span class="footer-brand-dot">.</span></span>
        </router-link>
        <p class="footer-tagline">让学习，轻松一点。</p>
      </div>
      <div class="footer-signing">
        <a href="https://signpath.org/" target="_blank" rel="noopener noreferrer" class="footer-signing-logo">
          <img src="@/assets/signpath-logo.svg" alt="SignPath" width="112" height="23" />
        </a>
        <div class="footer-signing-copy">
          <p class="footer-thanks">感谢为开源项目提供免费代码签名支持</p>
          <p class="footer-attribution" lang="en">
            Free code signing provided by
            <a href="https://signpath.io/" target="_blank" rel="noopener noreferrer">SignPath.io</a>,
            certificate by
            <a href="https://signpath.org/" target="_blank" rel="noopener noreferrer">SignPath Foundation</a>.
          </p>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-record">
        <span>© {{ year }} ZError</span>
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">津ICP备2024025272号-3</a>
      </div>
      <div class="footer-links" role="navigation" aria-label="页脚链接">
        <router-link to="/privacy">隐私政策</router-link>
        <router-link to="/privacy/en" lang="en">Privacy Policy</router-link>
        <a href="https://www.netlify.com/" target="_blank" rel="noopener noreferrer" lang="en">Hosted on Netlify</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.site-footer {
  box-sizing: border-box;
  width: 100%;
  max-width: 1168px;
  margin: 3rem auto 0;
  padding: 0 24px 1.5rem;
  color: #879098;
  font-size: 0.75rem;
}

.site-footer a {
  color: inherit;
  text-decoration: none;
}

.site-footer a:focus-visible {
  outline: 2px solid #fcb334;
  outline-offset: 5px;
  border-radius: 3px;
}

.footer-overview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  padding: 2rem 0;
  border-top: 1px solid #edf0f2;
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #171b20 !important;
  font-size: 1.4rem;
  font-weight: 750;
  letter-spacing: -1px;
}

.footer-brand img,
.footer-signing-logo img {
  display: block;
}

.footer-brand-dot {
  color: #fcb334;
}

.footer-tagline {
  margin: 0.65rem 0 0;
  font-size: 0.875rem;
}

.footer-signing {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  max-width: 555px;
}

.footer-signing-logo {
  flex-shrink: 0;
}

.footer-signing-copy p {
  margin: 0;
  line-height: 1.8;
}

.footer-thanks {
  color: #65727d;
  font-size: 0.8125rem;
}

.footer-attribution {
  margin-top: 0.2rem !important;
  font-size: 0.6875rem;
}

.footer-attribution a {
  text-decoration: underline;
  text-decoration-color: #d9dfe3;
  text-underline-offset: 3px;
}

.footer-bottom,
.footer-record,
.footer-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.25rem;
}

.footer-bottom {
  justify-content: space-between;
  padding-top: 1.25rem;
  border-top: 1px solid #f0f2f4;
  line-height: 1.7;
}

@media (hover: hover) and (pointer: fine) {
  .site-footer a:hover {
    color: #b67516;
  }
}

@media (max-width: 760px) {
  .footer-overview {
    align-items: flex-start;
    flex-direction: column;
    gap: 1.75rem;
  }

  .footer-bottom {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .footer-signing {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.75rem;
  }

  .footer-links {
    gap: 0.5rem 1rem;
  }
}
</style>
