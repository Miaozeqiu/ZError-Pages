<template>
  <div class="preview-scene" :data-preview-page="page">
    <template v-if="page === 'questions'">
      <div class="scene-sidebar question-folders">
        <div class="scene-pane-heading"><strong>题目管理器</strong><AppPreviewIcon name="plus" /></div>
        <div class="scene-tree-root"><AppPreviewIcon name="chevron-down" /><AppPreviewIcon name="folder" /><span>我的题库</span></div>
        <div v-for="(folder, i) in folders" :key="folder.name" class="scene-tree-item" :class="{ selected: i === 0 }">
          <AppPreviewIcon name="folder" /><span>{{ folder.name }}</span><small>{{ folder.count }}</small>
        </div>
      </div>
      <div class="scene-content question-content">
        <div class="scene-toolbar"><span>共 128 道题目</span><span class="scene-pagination">1 / 13</span><div class="scene-toolbar-icons"><AppPreviewIcon v-for="icon in ['upload', 'download', 'search', 'plus'] as const" :key="icon" :name="icon" /></div></div>
        <table class="scene-question-table">
          <colgroup><col style="width: 4%" /><col style="width: 38%" /><col style="width: 22%" /><col style="width: 12%" /><col style="width: 10%" /><col style="width: 14%" /></colgroup>
          <thead><tr><th><i class="scene-checkbox"></i></th><th>题目内容</th><th>选项</th><th>答案</th><th>类型</th><th>创建时间</th></tr></thead>
          <tbody><tr v-for="question in questions" :key="question.title"><td><i class="scene-checkbox"></i></td><td>{{ question.title }}</td><td class="scene-muted">{{ question.options }}</td><td>{{ question.answer }}</td><td><span class="scene-tag">{{ question.type }}</span></td><td class="scene-muted">11/20 14:32</td></tr></tbody>
        </table>
      </div>
    </template>

    <template v-else-if="page === 'study'">
      <div class="scene-sidebar study-subjects">
        <div class="scene-pane-heading"><strong>科目</strong><AppPreviewIcon name="plus" /></div>
        <button v-for="(subject, i) in subjects" :key="subject.name" type="button" class="scene-subject" :class="{ selected: i === selectedSubject }" :aria-pressed="i === selectedSubject" @click="selectSubject(i)">
          <span class="scene-progress-ring" :style="{ '--progress': subject.progress + '%' }"><span>{{ subject.progress }}</span></span>
          <div><strong>{{ subject.name }}</strong><small>{{ subject.nodes }} 个知识点</small></div>
        </button>
      </div>
      <div class="scene-content study-content">
        <div class="scene-toolbar scene-study-tools"><span>时间线</span><span>题库</span><span>数据</span><span class="scene-agent-draw">让 Agent 绘制</span></div>
        <PreviewKnowledgeGraph :key="currentSubject.name" class="scene-knowledge-graph" :graph="currentSubject.graph" :selected-name="selectedNodeName" @select="selectedNodeName = $event" />
      </div>
    </template>

    <template v-else-if="page === 'agent'">
      <div class="scene-sidebar scene-chat-sidebar">
        <div class="scene-new-chat"><AppPreviewIcon name="plus" />新对话</div>
        <div v-for="(chat, i) in chats" :key="chat" class="scene-chat-item" :class="{ selected: i === 0 }">{{ chat }}</div>
      </div>
      <div class="scene-content scene-chat">
        <div class="scene-chat-thread">
          <div class="scene-user-message">帮我整理高等数学的复习重点，并生成知识图谱。</div>
          <div class="scene-agent-message">
            <div class="scene-tool-result"><AppPreviewIcon name="check" /><span>已整理题库中的知识点</span><small>完成</small></div>
            <h3>我们从这三个部分开始复习</h3>
            <p>我已经结合题库内容，梳理出高等数学的核心知识结构：</p>
            <ol><li><strong>函数与极限</strong><span>理解极限、连续性与常见求极限方法。</span></li><li><strong>导数与微分</strong><span>掌握求导法则及导数的应用。</span></li><li><strong>积分</strong><span>联系原函数，整理积分方法与典型题目。</span></li></ol>
            <div class="scene-tool-result"><AppPreviewIcon name="check" /><span>已更新「高等数学」知识图谱</span><small>完成</small></div>
            <p>可以从「函数与极限」开始，我会结合题目逐步讲解。</p>
          </div>
        </div>
        <div class="scene-composer"><span class="scene-muted">继续提问，或添加文件、图片…</span><div class="scene-composer-bottom"><AppPreviewIcon name="plus" /><span>Qwen3.5-Plus <AppPreviewIcon name="chevron-down" /></span><i class="scene-send"><AppPreviewIcon name="arrow-up" /></i></div></div>
      </div>
    </template>

    <template v-else-if="page === 'models'">
      <div class="scene-sidebar scene-model-sidebar">
        <div class="scene-pane-heading"><strong>AI 平台管理</strong><AppPreviewIcon name="plus" /></div>
        <div v-for="(platform, i) in platforms" :key="platform.name" class="scene-platform" :class="{ selected: i === 0 }"><span class="scene-provider-icon" v-html="platform.icon"></span><strong>{{ platform.name }}</strong><small v-if="i === 0">2</small></div>
      </div>
      <div class="scene-content scene-model-config">
        <div class="scene-config-heading"><h3>硅基流动</h3><i class="scene-toggle"></i></div>
        <h4>API 配置</h4>
        <div class="scene-field"><span>API Key</span><small>如何获取 API Key？</small><div class="scene-fake-input">••••••••••••••••••••••••••••••••</div></div>
        <div class="scene-field"><span>Base URL</span><div class="scene-fake-input">https://api.siliconflow.cn/v1</div></div>
        <div class="scene-field"><span>接口协议</span><div class="scene-fake-input scene-protocol">OpenAI <AppPreviewIcon name="chevron-down" /></div></div>
        <div class="scene-config-heading scene-model-heading"><h4>模型管理</h4><div class="scene-model-categories"><b>答题</b><span>总结</span><span>Agent</span></div><AppPreviewIcon name="plus" /></div>
        <p class="scene-model-hint">已选 2/5 · 图片题使用首个支持视觉的已选模型</p>
        <div v-for="(model, i) in models" :key="model.name" class="scene-model-row"><div><strong>{{ model.name }}</strong><span class="scene-model-tags"><small>{{ model.type }}</small><small>文本</small></span></div><i class="scene-model-check" :class="{ checked: i < 2 }"><AppPreviewIcon v-if="i < 2" name="check" /></i></div>
      </div>
    </template>

    <template v-else-if="page === 'campus'">
      <div class="scene-campus">
        <div class="scene-campus-heading"><span class="scene-school-mark"><AppPreviewIcon name="campus" /></span><div><h3>我的校园 <small>2026 级</small></h3><p><strong>6</strong> 课程 <span>与同学共享学习资料</span></p></div></div>
        <div class="scene-campus-toolbar"><div><b>课程</b><span>我的收藏</span></div><span class="scene-campus-search"><AppPreviewIcon name="search" />搜索课程</span></div>
        <div class="scene-course-grid"><div v-for="(course, i) in courses" :key="course.name" class="scene-course"><div class="scene-course-cover" :class="'cover-' + i"><AppPreviewIcon name="book-open" /><span>{{ course.english }}</span></div><div class="scene-course-info"><strong>{{ course.name }}</strong><small>{{ course.count }} 道题目 · {{ course.folders }} 个文件夹</small></div></div></div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AppPreviewIcon from './AppPreviewIcon.vue'
import PreviewKnowledgeGraph from './PreviewKnowledgeGraph.vue'
import { previewStudySubjects as subjects } from './preview/studyGraphData'
import type { PreviewPage } from './appPreviewFeatures'
import siliconIcon from '@/assets/硅基.svg?raw'
import bailianIcon from '@/assets/百炼.svg?raw'
import deepseekIcon from '@/assets/deepseek.svg?raw'

defineProps<{ page: PreviewPage }>()
const folders = [{ name: '高等数学', count: 128 }, { name: '大学英语', count: 96 }, { name: '计算机基础', count: 84 }, { name: '生理学', count: 72 }, { name: '待修正题目', count: 3 }]
const questions = [
  { title: '函数在一点连续的充分必要条件是？', options: 'A. 极限存在 B. 极限等于函数值', answer: 'B', type: '单选题' },
  { title: '函数 f(x) = x² 的导数为多少？', options: 'A. x B. 2x C. x² D. 2', answer: 'B. 2x', type: '单选题' },
  { title: '导数存在的函数在该点一定连续。', options: '正确 / 错误', answer: '正确', type: '判断题' },
  { title: '下列哪些方法可以用于求极限？', options: 'A. 等价替换 B. 洛必达法则', answer: 'A、B', type: '多选题' },
  { title: '求不定积分 ∫ 2x dx。', options: '—', answer: 'x² + C', type: '填空题' },
  { title: '简述定积分的几何意义。', options: '—', answer: '曲边梯形面积的代数和', type: '简答题' },
]
const selectedSubject = ref(0)
const selectedNodeName = ref('')
const currentSubject = computed(() => subjects[selectedSubject.value]!)
function selectSubject(index: number) { selectedSubject.value = index; selectedNodeName.value = '' }
const chats = ['高等数学复习计划', '整理计算机基础题库', '解释这道极限题', '导入课程复习资料']
const platforms = [{ name: '硅基流动', icon: siliconIcon }, { name: '阿里百炼', icon: bailianIcon }, { name: 'DeepSeek', icon: deepseekIcon }]
const models = [{ name: 'DeepSeek-V3.2', type: '深度思考' }, { name: 'Qwen3-VL-32B-Instruct', type: '视觉' }, { name: 'Qwen3-8B', type: '对话' }]
const courses = [
  { name: '高等数学', english: 'MATHEMATICS', count: 128, folders: 6 }, { name: '大学英语', english: 'ENGLISH', count: 96, folders: 4 }, { name: '计算机基础', english: 'COMPUTER SCIENCE', count: 84, folders: 5 },
  { name: '生理学', english: 'PHYSIOLOGY', count: 72, folders: 4 }, { name: '大学物理', english: 'PHYSICS', count: 65, folders: 3 }, { name: '线性代数', english: 'LINEAR ALGEBRA', count: 58, folders: 3 },
]
</script>

<style scoped>
.preview-scene { display: flex; flex: 1; min-width: 0; margin: 0 0.3cqw 0.3cqw 0; overflow: hidden; border-radius: 0.4cqw; background: #fff; font-size: 1.3cqw; }
.preview-scene * { box-sizing: border-box; }
.preview-scene h3, .preview-scene h4, .preview-scene p { margin: 0; }
.preview-scene strong, .preview-scene b { font-weight: 600; }
.preview-scene .preview-icon { width: 1.7cqw; height: 1.7cqw; }
.scene-sidebar { flex-shrink: 0; width: 24cqw; border-right: 1px solid #ededf0; padding: 0.7cqw; }
.scene-content { flex: 1; min-width: 0; }
.scene-pane-heading { display: flex; align-items: center; justify-content: space-between; padding: 1.4cqw 1.2cqw 2cqw; font-size: 1.4cqw; }
.scene-muted { color: #96969c; }
.selected { background: #eeeef1; border-radius: 0.7cqw; }
.scene-tree-root, .scene-tree-item { display: flex; align-items: center; gap: 0.9cqw; padding: 1.1cqw 1.2cqw; }
.scene-tree-root .preview-icon { width: 1.5cqw; }
.scene-tree-item { margin-left: 2cqw; }
.scene-tree-item .preview-icon { color: #858589; }
.scene-tree-item small { margin-left: auto; color: #96969c; font-size: 1.1cqw; }
.scene-toolbar { display: flex; align-items: center; gap: 1.2cqw; padding: 1.8cqw 1.7cqw; height: 6cqw; border-bottom: 1px solid #ededf0; color: #6e6e73; font-size: 1.2cqw; }
.scene-pagination { font-size: 1.1cqw; color: #96969c; }
.scene-toolbar-icons { display: flex; gap: 1.7cqw; margin-left: auto; }
.scene-question-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 1.1cqw; }
.scene-question-table th, .scene-question-table td { overflow: hidden; padding: 1.9cqw 0.8cqw; border-bottom: 1px solid #ededf0; text-align: left; text-overflow: ellipsis; white-space: nowrap; }
.scene-question-table th { font-weight: 500; color: #86868b; padding-top: 1.3cqw; padding-bottom: 1.3cqw; }
.scene-checkbox { display: block; width: 1.1cqw; height: 1.1cqw; border: 1px solid #d1d1d6; border-radius: 0.2cqw; }
.scene-tag { padding: 0.3cqw 0.4cqw; border-radius: 0.4cqw; background: #f5f5f7; color: #6e6e73; font-size: 1cqw; }
.scene-subject { display: flex; align-items: center; gap: 1cqw; width: 100%; margin-bottom: 0.7cqw; padding: 1.2cqw 1cqw; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.scene-subject.selected { background: #eeeef1; }
.scene-subject:focus-visible { outline: 2px solid #edbd68; outline-offset: -2px; border-radius: 0.7cqw; }
.scene-subject strong { display: block; font-size: 1.3cqw; }
.scene-subject small { display: block; margin-top: 0.3cqw; color: #96969c; font-size: 1.1cqw; }
.scene-progress-ring { display: grid; place-items: center; flex-shrink: 0; width: 3.3cqw; height: 3.3cqw; border-radius: 50%; background: conic-gradient(#7caf8e var(--progress), #e6e8e8 0); }
.scene-progress-ring > span { display: grid; place-items: center; width: 2.8cqw; height: 2.8cqw; border-radius: 50%; background: #fff; font-size: 1cqw; }
.scene-study-tools { justify-content: flex-end; gap: 1.8cqw; }
.scene-agent-draw { padding: 0.45cqw 0.8cqw; border-radius: 0.5cqw; background: #f5f5f7; color: #5c5c62; }
.scene-knowledge-graph { height: calc(100% - 6cqw); }
.scene-chat-sidebar { width: 24cqw; }
.scene-new-chat { display: flex; align-items: center; gap: 0.8cqw; padding: 1.3cqw 1cqw 2cqw; }
.scene-chat-item { padding: 1.1cqw; margin-bottom: 0.4cqw; font-size: 1.25cqw; }
.scene-chat { position: relative; }
.scene-chat-thread { padding: 3cqw 3cqw 0; }
.scene-user-message { width: fit-content; max-width: 88%; margin: 0 0 2cqw auto; padding: 1cqw 1.3cqw; border-radius: 1.2cqw; background: #f1f1f3; font-size: 1.2cqw; }
.scene-agent-message { font-size: 1.2cqw; line-height: 1.8; }
.scene-agent-message h3 { margin: 1.5cqw 0 0.8cqw; font-size: 1.7cqw; font-weight: 600; }
.scene-agent-message p { margin: 0.8cqw 0; }
.scene-agent-message ol { margin: 1cqw 0 1.2cqw; padding-left: 1.8cqw; }
.scene-agent-message li { padding-left: 0.4cqw; margin: 0.8cqw 0; }
.scene-agent-message li strong { display: block; }
.scene-agent-message li span { color: #73737b; }
.scene-tool-result { display: flex; align-items: center; gap: 0.7cqw; padding: 0.65cqw 0.8cqw; border: 1px solid #eceef0; border-radius: 0.6cqw; color: #86868b; font-size: 1.05cqw; }
.scene-tool-result .preview-icon { width: 1.3cqw; height: 1.3cqw; color: #6c9c7b; }
.scene-tool-result small { margin-left: auto; color: #6c9c7b; font-size: 1cqw; }
.scene-composer { position: absolute; left: 3cqw; right: 3cqw; bottom: 2cqw; padding: 1.3cqw; border: 1px solid #dedee3; border-radius: 1.6cqw; background: #fff; box-shadow: 0 0.3cqw 1.5cqw rgb(0 0 0 / 3%); font-size: 1.2cqw; }
.scene-composer-bottom { display: flex; align-items: center; gap: 1.4cqw; margin-top: 2.1cqw; color: #86868b; }
.scene-composer-bottom > span { display: flex; align-items: center; gap: 0.4cqw; font-size: 1.05cqw; }
.scene-composer-bottom > span .preview-icon { width: 1cqw; height: 1cqw; }
.scene-send { display: grid; place-items: center; width: 2.7cqw; height: 2.7cqw; margin-left: auto; border-radius: 50%; background: #fcb334; color: #fff; }
.scene-model-sidebar { width: 24cqw; }
.scene-platform { display: flex; align-items: center; gap: 1.1cqw; margin-bottom: 0.7cqw; padding: 1.2cqw; }
.scene-provider-icon { width: 3cqw; height: 3cqw; display: grid; place-items: center; }
.scene-provider-icon :deep(svg) { width: 100%; height: 100%; }
.scene-platform strong { font-size: 1.3cqw; }.scene-platform > small { margin-left: auto; color: #939398; font-size: 1cqw; }
.scene-model-config { padding: 2cqw 3cqw; }
.scene-config-heading { display: flex; align-items: center; justify-content: space-between; }
.scene-config-heading h3 { font-size: 1.9cqw; font-weight: 600; }
.scene-toggle { position: relative; width: 3cqw; height: 1.7cqw; border-radius: 1cqw; background: #fcb334; }
.scene-toggle::after { content: ''; position: absolute; top: 0.2cqw; right: 0.2cqw; width: 1.3cqw; height: 1.3cqw; border-radius: 50%; background: #fff; }
.scene-model-config h4 { margin: 2cqw 0 1.1cqw; font-size: 1.3cqw; font-weight: 600; }
.scene-field { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6cqw; margin-bottom: 1.1cqw; font-size: 1.1cqw; color: #6e6e73; }
.scene-field > small { margin-left: auto; color: #939398; font-size: 1cqw; }
.scene-fake-input { width: 100%; padding: 0.85cqw 1cqw; border: 1px solid #e5e5e9; border-radius: 0.6cqw; background: #fafafa; color: #71717a; font-size: 1.1cqw; }
.scene-protocol { display: flex; align-items: center; justify-content: space-between; }
.scene-model-heading { margin-top: 2cqw; gap: 1.5cqw; }.scene-model-heading h4 { margin: 0; }
.scene-model-categories { display: flex; gap: 1.1cqw; margin-left: auto; padding: 0.4cqw; border-radius: 0.6cqw; background: #f3f3f5; color: #86868b; font-size: 1cqw; }
.scene-model-categories > * { padding: 0.3cqw 0.9cqw; }.scene-model-categories b { background: #fff; border-radius: 0.4cqw; color: #53535a; }
.scene-model-hint { margin: 0.8cqw 0 0.4cqw !important; color: #96969c; font-size: 1cqw; }
.scene-model-row { display: flex; align-items: center; justify-content: space-between; padding: 1.05cqw 0; border-bottom: 1px solid #efeff2; }
.scene-model-row strong { font-size: 1.15cqw; }.scene-model-tags { display: inline-flex; gap: 0.4cqw; margin-left: 0.7cqw; }
.scene-model-tags small { padding: 0.15cqw 0.45cqw; border-radius: 0.4cqw; background: #f2f2f5; color: #939398; font-size: 0.85cqw; }
.scene-model-check { display: grid; place-items: center; width: 1.7cqw; height: 1.7cqw; border: 1px solid #d5d5da; border-radius: 0.4cqw; }
.scene-model-check.checked { background: #fcb334; border-color: #fcb334; color: white; }.scene-model-check .preview-icon { width: 1.3cqw; height: 1.3cqw; }
.scene-campus { width: 100%; padding: 3cqw 4cqw; overflow: hidden; }
.scene-campus-heading { display: flex; align-items: center; gap: 1.5cqw; }
.scene-school-mark { display: grid; place-items: center; width: 5.5cqw; height: 5.5cqw; border-radius: 1.3cqw; background: #fff7e9; color: #bd893d; }.scene-school-mark .preview-icon { width: 3cqw; height: 3cqw; }
.scene-campus-heading h3 { font-size: 2cqw; }.scene-campus-heading h3 small { padding: 0.3cqw 0.6cqw; margin-left: 0.7cqw; border-radius: 0.5cqw; background: #f4f4f6; color: #939398; font-size: 1cqw; font-weight: 400; }
.scene-campus-heading p { margin-top: 0.5cqw; color: #939398; font-size: 1.1cqw; }.scene-campus-heading p strong { font-size: 1.6cqw; color: #55565c; }.scene-campus-heading p span { margin-left: 1.5cqw; }
.scene-campus-toolbar { display: flex; align-items: center; justify-content: space-between; margin: 2.5cqw 0 1.8cqw; border-bottom: 1px solid #efeff2; }
.scene-campus-toolbar > div { display: flex; gap: 2.5cqw; align-items: center; }.scene-campus-toolbar b { padding: 1cqw 0; border-bottom: 2px solid #fcb334; color: #b98224; }.scene-campus-toolbar span { color: #96969c; font-size: 1.1cqw; }
.scene-campus-search { display: flex; align-items: center; gap: 0.7cqw; padding: 0.7cqw 1.2cqw; border-radius: 0.7cqw; background: #f6f6f8; }
.scene-course-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.5cqw; }
.scene-course { overflow: hidden; border: 1px solid #ebecf0; border-radius: 1cqw; }
.scene-course-cover { position: relative; display: flex; align-items: center; justify-content: center; height: 10cqw; background: linear-gradient(135deg, #edf1ff, #d8e1fc); color: #8c9cc7; }
.scene-course-cover .preview-icon { width: 3.5cqw; height: 3.5cqw; }.scene-course-cover > span:not(.preview-icon) { position: absolute; bottom: 0.7cqw; left: 1.2cqw; font-size: 0.8cqw; letter-spacing: 0.08em; opacity: 0.8; }
.cover-1 { background: linear-gradient(135deg, #fff2df, #f6dfbb); color: #bc9c6f; }.cover-2 { background: linear-gradient(135deg, #e4f4ee, #cce7de); color: #7dada1; }.cover-3 { background: linear-gradient(135deg, #f7e9ed, #ebd6de); color: #b58e9c; }.cover-4 { background: linear-gradient(135deg, #e6eff7, #cddfea); color: #86a8bd; }.cover-5 { background: linear-gradient(135deg, #eeeafa, #dbd3ed); color: #a198c0; }
.scene-course-info { padding: 1cqw 1.2cqw; }.scene-course-info strong { display: block; font-size: 1.3cqw; }.scene-course-info small { display: block; margin-top: 0.4cqw; color: #96969c; font-size: 1cqw; }
</style>
