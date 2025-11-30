<template>
  <div class="changelog-page">
    <div class="changelog-header">
      <h1>更新日志</h1>
      <p class="subtitle">ZError版本更新记录</p>
    </div>

    <div class="changelog-container">
      <div v-for="item in logs" :key="item.version" class="log-card">
        <div class="version-badge">{{ item.version }}</div>
        <div class="log-content">
          <div class="log-date">{{ item.date }}</div>
          <div class="log-description">{{ item.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      logs: [
        { version: '2.1.0', date: '2025-11-30', description: '1. 修复软件默认数据存储路径问题\n2. 添加导入与导出功能\n3. 修复文件夹无法拖动的问题\n4. 添加对题目选项的支持' },
        { version: '2.0.2', date: '2025-11-18', description: '1. 修复某些情况下需要管理员身份运行的问题\n2.修复一些默认模型的无法使用的问题\n3.优化题库页对图片的显示\n4.更好的AI请求错误处理' },
        { version: '2.0.1', date: '2025-11-8', description: '1. 修复更新后请求500错误的问题' },
        { version: '2.0.0', date: '2025-11-8', description: '1. 改为Tauri架构，更好的界面\n2. 支持自定义平台与AI模型\n3. 支持文本推理模型\n4. 修复服务器无法开启的bug' },
        { version: '1.4.0', date: '2025-06-25', description: '1. 截图搜题支持markdown以及latex语法显示\n2. 添加火山引擎以及FreeQwQ\n3. 优化软件启动与关闭' },
        { version: '1.3.1', date: '2025-06-19', description: '1.修复局域网开放功能\n2.修复再添加ai回答到数据库后，文件夹树题目统计不刷新的问题\n3.修复UI过大问题\n4.修复多选题目时，右键菜单问题' },
        { version: '1.3.0', date: '2025-05-18', description: '1.添加题库分类功能\n 2.添加图片url显示功能\n 3. 题库的精确匹配改为模糊匹配\n 4.可以设置服务端口，并且对局域网开放\n 5.美化界面' },
        { version: '1.2.0', date: '2025-05-2', description: '1. 添加截图搜题\n2. 修复题库无法修改的问题' },
        { version: '1.1.2', date: '2025-04-21', description: '1. 优化提示词\n2. 修复删除题目失败的问题' },
        { version: '1.1.1', date: '2025-03-21', description: '1. 修复密钥保存问题' },
        { version: '1.1.0', date: '2025-03-21', description: '1. 批量导入问题\n2. 修复文件权限问题' },
        { version: '1.0.0', date: '2025-03-20', description: '首次发布版本' }
      ]
    }
  }
}
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
  margin-right: 1.5rem;
  flex-shrink: 0;
}

.log-content {
  flex: 1;
}

.log-date {
  font-size: 1rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
}

.log-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #2c3e50;
}
</style>
