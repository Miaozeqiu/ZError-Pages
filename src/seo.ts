export const siteOrigin = 'https://app.zerrorai.com'

const publicPages = {
  '/': {
    title: 'ZError - 开源的本地 AI 题库软件',
    description: 'ZError 是支持 OCS 网课助手的开源本地 AI 题库软件，提供本地题库管理、多模型查询和题目导入。查看官方下载、使用文档和更新日志。',
  },
  '/download': {
    title: '下载 ZError | Windows 安装包与版本说明',
    description: '下载 ZError 官方 Windows x64 安装包，查看系统支持、当前版本和更新记录。',
  },
  '/changelog': {
    title: 'ZError 更新日志 | 版本发布记录',
    description: '查看 ZError 的版本更新记录，了解题库导入、Agent 对话、模型配置和安装更新的变化。',
  },
  '/privacy': {
    title: 'ZError 隐私政策',
    description: '了解 ZError 桌面软件和官网处理哪些数据、使用哪些第三方服务，以及如何联系项目维护者。',
  },
  '/privacy/en': {
    title: 'ZError Privacy Policy',
    description: 'Learn what data ZError desktop and its official website process, what services receive data, and how to contact the project.',
  },
} as const

export const publicPaths = Object.keys(publicPages)

export function getPageSeo(path: string) {
  const normalized = path.replace(/\/$/, '') || '/'
  const page = publicPages[normalized as keyof typeof publicPages] || publicPages['/']
  return {
    ...page,
    url: new URL(normalized, siteOrigin).href,
    lang: normalized === '/privacy/en' ? 'en' : 'zh-CN',
  }
}
