export const previewFeatures = [
  { id: 'home', label: '自动答题', icon: 'home', description: '学习通经 OCS 发送题目，ZError 优先检索本地题库，按需调用模型并返回答案' },
  { id: 'questions', label: '题库管理', icon: 'questions', description: '按文件夹整理题目，查看答案、导入和导出题库' },
  { id: 'campus', label: '校园题库', icon: 'campus', description: '与同学分享课程题库，按课程查找学习资料' },
  { id: 'study', label: '知识图谱', icon: 'study', description: '按科目梳理知识点，追踪学习进度' },
  { id: 'agent', label: 'AI 助手', icon: 'agent', description: '通过对话讲解题目、整理题库和规划学习' },
  { id: 'models', label: '模型配置', icon: 'model', description: '接入 AI 平台，为答题、总结和 Agent 选择模型' },
] as const

export type PreviewPage = typeof previewFeatures[number]['id']
