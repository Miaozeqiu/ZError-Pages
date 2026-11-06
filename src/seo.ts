export const siteOrigin = 'https://app.zerror.cc'

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
} as const

export const publicPaths = Object.keys(publicPages)

export function getPageSeo(path: string) {
  const normalized = path.replace(/\/$/, '') || '/'
  const page = publicPages[normalized as keyof typeof publicPages] || publicPages['/']
  return { ...page, url: new URL(normalized, siteOrigin).href }
}
