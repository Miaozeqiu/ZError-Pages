export interface StudyGraphNode {
  id: string
  name: string
  mastery?: number
  importance?: number
  forgetting_stage?: number
  last_reviewed_at?: string | null
  stats: { progress: number }
  children: StudyGraphNode[]
  extraLinks?: { from: string; to: string }[]
}

export const flattenGraph = (root: StudyGraphNode) => {
  const nodes: StudyGraphNode[] = []
  const links = [...(root.extraLinks || [])]
  const walk = (node: StudyGraphNode) => {
    nodes.push(node)
    for (const child of node.children) {
      links.push({ from: node.id, to: child.id })
      walk(child)
    }
  }
  walk(root)
  return { nodes, links }
}

type Topic = string | { name: string; children: Topic[] }
const branch = (name: string, ...children: Topic[]): Topic => ({ name, children })

function createSubject(name: string, topics: Topic[]) {
  let count = 0
  const scores = [0.94, 0.82, 0.6, 0.35, 0, 0.72, 0.9]
  const makeNode = (topic: Topic, id: string): StudyGraphNode => {
    const index = count++
    const children = typeof topic === 'string' ? [] : topic.children.map((child, i) => makeNode(child, `${id}-${i}`))
    const progress = children.length
      ? children.reduce((sum, child) => sum + child.stats.progress, 0) / children.length
      : scores[index % scores.length]!
    return {
      id, name: typeof topic === 'string' ? topic : topic.name,
      mastery: progress === 0 ? 0 : Math.max(1, Math.round(progress * 3)),
      stats: { progress }, children,
    }
  }
  const graph = makeNode({ name, children: topics }, name)
  return { name, graph, nodes: count - 1, progress: Math.round(graph.stats.progress * 100) }
}

export const previewStudySubjects = [
  createSubject('高等数学', [
    branch('函数与极限',
      branch('函数', '定义域与值域', '复合函数'),
      branch('极限', '左右极限', '无穷小量', '等价替换'),
      branch('连续性', '连续的条件', '间断点分类')),
    branch('导数与微分',
      branch('求导法则', '复合函数求导', '隐函数求导'),
      branch('导数的应用', '单调性与极值', '洛必达法则'),
      branch('微分', '微分的概念', '近似计算')),
    branch('积分',
      branch('不定积分', '换元积分法', '分部积分法'),
      branch('定积分', '牛顿莱布尼茨公式', '定积分的性质'),
      branch('积分的应用', '平面图形面积', '旋转体体积')),
  ]),
  createSubject('大学英语', [
    branch('词汇', branch('词汇记忆', '词根词缀', '同义词辨析'), '常见搭配', '语境运用'),
    branch('语法', branch('时态与语态', '完成时', '被动语态'), '非谓语动词', '定语从句'),
    branch('阅读理解', '主旨大意', '细节定位', '推理判断'),
    branch('写作与翻译', '段落组织', '句式表达', '长难句分析'),
  ]),
  createSubject('计算机基础', [
    branch('数据结构', branch('线性结构', '数组与链表', '栈与队列'), '树与二叉树', '图的遍历'),
    branch('算法', branch('排序', '快速排序', '归并排序'), '查找', '时间复杂度'),
    branch('操作系统', '进程与线程', '内存管理', '文件系统'),
    branch('计算机网络', 'TCP / IP', 'HTTP 协议', '网络安全'),
  ]),
]
