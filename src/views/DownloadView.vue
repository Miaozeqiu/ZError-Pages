<template>
  <div class="page">
    <h1 class="title">下载 ZError</h1>
    <p class="subtitle">开源的大学生AI题库</p>

    <div class="download-section">
      <div class="download-card">
        <h3>Windows 版本</h3>
        <div class="download-options">
          <a href="#" class="download-btn direct-download">
            <i class="icon-download"></i> 直接下载
          </a>
          <a href="#" class="download-btn cloud-download">
            <i class="icon-cloud"></i> 网盘下载
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 3rem;
}

.download-card {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.download-card h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.download-options {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.download-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.direct-download {
  background: #3498db;
  color: white;
}

.direct-download:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

.cloud-download {
  background: #f1c40f;
  color: #2c3e50;
}

.cloud-download:hover {
  background: #f39c12;
  transform: translateY(-2px);
}
</style>
