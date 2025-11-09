// 顶部与侧栏按钮
const statusBox = document.getElementById('statusBox');
const reloadBtn = document.getElementById('reloadBtn');
const saveBtn = document.getElementById('saveBtn');
const validateBtn = document.getElementById('validateBtn');
const addPlatformBtn = document.getElementById('addPlatformBtn');
const deletePlatformBtn = document.getElementById('deletePlatformBtn');
const addModelBtn = document.getElementById('addModelBtn');
const deleteModelBtn = document.getElementById('deleteModelBtn');

// 列表容器
const platformList = document.getElementById('platformList');
const modelList = document.getElementById('modelList');

// 平台表单元素
const platformForm = document.getElementById('platformForm');
const platform_id = document.getElementById('platform_id');
const platform_name = document.getElementById('platform_name');
const platform_displayName = document.getElementById('platform_displayName');
const platform_baseUrl = document.getElementById('platform_baseUrl');
const platform_icon = document.getElementById('platform_icon');
const platform_description = document.getElementById('platform_description');

// 模型表单元素
const modelForm = document.getElementById('modelForm');
const model_id = document.getElementById('model_id');
const model_name = document.getElementById('model_name');
const model_displayName = document.getElementById('model_displayName');
const model_platformId = document.getElementById('model_platformId');
const model_maxTokens = document.getElementById('model_maxTokens');
const model_temperature = document.getElementById('model_temperature');
const model_topP = document.getElementById('model_topP');
const model_enabled = document.getElementById('model_enabled');
const model_category = document.getElementById('model_category');
const model_inputTokens = document.getElementById('model_inputTokens');
const model_outputTokens = document.getElementById('model_outputTokens');
const model_description = document.getElementById('model_description');
const model_jsCode = document.getElementById('model_jsCode');

let state = [];
let selectedPlatformIndex = 0;
let selectedModelIndex = 0;

function setStatus(msg, type = 'info') {
  statusBox.textContent = msg;
  statusBox.style.color = type === 'error' ? '#f87171' : type === 'success' ? '#34d399' : '#a8b0c2';
}

function platformTemplate() {
  return {
    id: 'new-platform',
    name: 'new-platform',
    displayName: '新平台',
    baseUrl: '',
    icon: '',
    models: [],
    description: ''
  };
}

function modelTemplate(platformId) {
  return {
    id: 'new-model',
    name: '',
    displayName: '新模型',
    platformId: platformId,
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    enabled: true,
    category: 'text',
    description: '',
    pricing: { inputTokens: 0, outputTokens: 0 },
    jsCode: 'async function processModel(input, config, abortSignal) {\n  // TODO: 实现模型的 API 请求逻辑\n  return \'未实现\';\n}'
  };
}

async function loadModels() {
  setStatus('正在加载 models.json ...');
  const res = await fetch('/api/models');
  if (!res.ok) {
    setStatus('加载失败: ' + (await res.text()), 'error');
    return;
  }
  state = await res.json();
  if (!Array.isArray(state)) state = [];
  selectedPlatformIndex = Math.min(selectedPlatformIndex, Math.max(0, state.length - 1));
  const currentPlatform = state[selectedPlatformIndex];
  selectedModelIndex = currentPlatform && Array.isArray(currentPlatform.models) ? Math.min(selectedModelIndex, Math.max(0, currentPlatform.models.length - 1)) : 0;
  renderAll();
  setStatus('已加载');
}

async function saveModels() {
  try {
    const res = await fetch('/api/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    const out = await res.json();
    if (!res.ok || !out.ok) {
      const msg = out.errors ? out.errors.join('\n') : (out.error || '未知错误');
      setStatus('保存失败: ' + msg, 'error');
      return;
    }
    setStatus('保存成功（已创建备份）', 'success');
  } catch (e) {
    setStatus('保存异常: ' + e.message, 'error');
  }
}

function validateStructure() {
  const errors = [];
  if (!Array.isArray(state)) {
    errors.push('根结构必须是数组');
  } else {
    state.forEach((p, idx) => {
      ['id', 'name', 'displayName', 'models'].forEach(k => {
        if (!(k in p)) errors.push(`平台[${idx}]缺少字段: ${k}`);
      });
      if (p.models && !Array.isArray(p.models)) {
        errors.push(`平台[${idx}].models 必须是数组`);
      }
      if (Array.isArray(p.models)) {
        p.models.forEach((m, midx) => {
          ['id', 'displayName', 'platformId'].forEach(k => {
            if (!(k in m)) errors.push(`平台[${idx}].models[${midx}] 缺少字段: ${k}`);
          });
        });
      }
    });
  }
  if (errors.length) {
    setStatus('校验失败:\n' + errors.join('\n'), 'error');
  } else {
    setStatus('结构校验通过', 'success');
  }
}

function renderAll() {
  renderPlatformList();
  renderPlatformForm();
  renderModelList();
  renderModelForm();
}

function renderPlatformList() {
  platformList.innerHTML = '';
  if (!Array.isArray(state) || !state.length) {
    const empty = document.createElement('div');
    empty.className = 'hint';
    empty.textContent = '暂无平台，点击“新增平台”创建';
    platformList.appendChild(empty);
    return;
  }
  state.forEach((p, idx) => {
    const li = document.createElement('li');
    li.className = 'item' + (idx === selectedPlatformIndex ? ' selected' : '');
    li.textContent = `${p.displayName || p.name || p.id || '平台'} (${p.id || idx})`;
    li.addEventListener('click', () => {
      selectedPlatformIndex = idx;
      selectedModelIndex = 0;
      renderAll();
    });
    platformList.appendChild(li);
  });
}

function renderPlatformForm() {
  const p = state[selectedPlatformIndex];
  const disabled = !p;
  [platform_id, platform_name, platform_displayName, platform_baseUrl, platform_icon, platform_description]
    .forEach(el => { el.disabled = disabled; });
  if (!p) {
    platform_id.value = platform_name.value = platform_displayName.value = platform_baseUrl.value = platform_icon.value = '';
    platform_description.value = '';
    return;
  }
  platform_id.value = p.id || '';
  platform_name.value = p.name || '';
  platform_displayName.value = p.displayName || '';
  platform_baseUrl.value = p.baseUrl || '';
  platform_icon.value = p.icon || '';
  platform_description.value = p.description || '';

  platform_id.oninput = () => { p.id = platform_id.value; renderPlatformList(); renderModelForm(); };
  platform_name.oninput = () => { p.name = platform_name.value; renderPlatformList(); };
  platform_displayName.oninput = () => { p.displayName = platform_displayName.value; renderPlatformList(); };
  platform_baseUrl.oninput = () => { p.baseUrl = platform_baseUrl.value; };
  platform_icon.oninput = () => { p.icon = platform_icon.value; };
  platform_description.oninput = () => { p.description = platform_description.value; };
}

function renderModelList() {
  modelList.innerHTML = '';
  const p = state[selectedPlatformIndex];
  if (!p || !Array.isArray(p.models) || !p.models.length) {
    const empty = document.createElement('div');
    empty.className = 'hint';
    empty.textContent = '暂无模型，点击“新增模型”创建';
    modelList.appendChild(empty);
    return;
  }
  p.models.forEach((m, idx) => {
    const li = document.createElement('li');
    li.className = 'item' + (idx === selectedModelIndex ? ' selected' : '');
    li.textContent = `${m.displayName || m.name || m.id || '模型'} (${m.id || idx})`;
    li.addEventListener('click', () => {
      selectedModelIndex = idx;
      renderModelForm();
      renderModelList();
    });
    modelList.appendChild(li);
  });
}

function renderModelForm() {
  const p = state[selectedPlatformIndex];
  const m = p && Array.isArray(p.models) ? p.models[selectedModelIndex] : null;
  const disabled = !m;
  [model_id, model_name, model_displayName, model_platformId, model_maxTokens, model_temperature, model_topP, model_enabled, model_category, model_inputTokens, model_outputTokens, model_description, model_jsCode]
    .forEach(el => { el.disabled = disabled; });
  if (!m) {
    model_id.value = model_name.value = model_displayName.value = model_platformId.value = '';
    model_maxTokens.value = model_temperature.value = model_topP.value = '';
    model_enabled.checked = false;
    model_category.value = 'text';
    model_inputTokens.value = model_outputTokens.value = '';
    model_description.value = model_jsCode.value = '';
    return;
  }
  model_id.value = m.id || '';
  model_name.value = m.name || '';
  model_displayName.value = m.displayName || '';
  model_platformId.value = m.platformId || (p ? p.id : '');
  model_maxTokens.value = m.maxTokens ?? '';
  model_temperature.value = m.temperature ?? '';
  model_topP.value = m.topP ?? '';
  model_enabled.checked = !!m.enabled;
  model_category.value = m.category || 'text';
  model_inputTokens.value = m.pricing && typeof m.pricing.inputTokens !== 'undefined' ? m.pricing.inputTokens : '';
  model_outputTokens.value = m.pricing && typeof m.pricing.outputTokens !== 'undefined' ? m.pricing.outputTokens : '';
  model_description.value = m.description || '';
  model_jsCode.value = m.jsCode || '';

  model_id.oninput = () => { m.id = model_id.value; renderModelList(); };
  model_name.oninput = () => { m.name = model_name.value; renderModelList(); };
  model_displayName.oninput = () => { m.displayName = model_displayName.value; renderModelList(); };
  model_maxTokens.oninput = () => { const v = parseInt(model_maxTokens.value, 10); m.maxTokens = isNaN(v) ? undefined : v; };
  model_temperature.oninput = () => { const v = parseFloat(model_temperature.value); m.temperature = isNaN(v) ? undefined : v; };
  model_topP.oninput = () => { const v = parseFloat(model_topP.value); m.topP = isNaN(v) ? undefined : v; };
  model_enabled.onchange = () => { m.enabled = !!model_enabled.checked; };
  model_category.onchange = () => { m.category = model_category.value; };
  model_inputTokens.oninput = () => { const v = parseFloat(model_inputTokens.value); m.pricing = m.pricing || {}; m.pricing.inputTokens = isNaN(v) ? undefined : v; };
  model_outputTokens.oninput = () => { const v = parseFloat(model_outputTokens.value); m.pricing = m.pricing || {}; m.pricing.outputTokens = isNaN(v) ? undefined : v; };
  model_description.oninput = () => { m.description = model_description.value; };
  model_jsCode.oninput = () => { m.jsCode = model_jsCode.value; };
}

function addPlatform() {
  if (!Array.isArray(state)) state = [];
  const p = platformTemplate();
  let base = p.id; let i = 1;
  const ids = new Set(state.map(x => x.id));
  while (ids.has(p.id)) { p.id = `${base}-${i++}`; }
  state.push(p);
  selectedPlatformIndex = state.length - 1;
  selectedModelIndex = 0;
  renderAll();
  setStatus(`已新增平台: ${p.id}`, 'success');
}

function deletePlatform() {
  if (!Array.isArray(state) || !state.length) { setStatus('无平台可删除', 'error'); return; }
  const removed = state.splice(selectedPlatformIndex, 1);
  selectedPlatformIndex = Math.max(0, selectedPlatformIndex - 1);
  selectedModelIndex = 0;
  renderAll();
  setStatus(`已删除平台: ${removed[0]?.id || ''}`, 'success');
}

function addModel() {
  const p = state[selectedPlatformIndex];
  if (!p) { setStatus('请先选择或新增平台', 'error'); return; }
  p.models = Array.isArray(p.models) ? p.models : [];
  const m = modelTemplate(p.id);
  let base = m.id; let i = 1;
  const mids = new Set(p.models.map(x => x.id));
  while (mids.has(m.id)) { m.id = `${base}-${i++}`; }
  p.models.push(m);
  selectedModelIndex = p.models.length - 1;
  renderModelList();
  renderModelForm();
  setStatus(`已在平台 ${p.id} 新增模型: ${m.id}`, 'success');
}

function deleteModel() {
  const p = state[selectedPlatformIndex];
  if (!p || !Array.isArray(p.models) || !p.models.length) { setStatus('无模型可删除', 'error'); return; }
  const removed = p.models.splice(selectedModelIndex, 1);
  selectedModelIndex = Math.max(0, selectedModelIndex - 1);
  renderModelList();
  renderModelForm();
  setStatus(`已删除模型: ${removed[0]?.id || ''}`, 'success');
}

reloadBtn.addEventListener('click', loadModels);
saveBtn.addEventListener('click', saveModels);
validateBtn.addEventListener('click', validateStructure);
addPlatformBtn.addEventListener('click', addPlatform);
deletePlatformBtn.addEventListener('click', deletePlatform);
addModelBtn.addEventListener('click', addModel);
deleteModelBtn.addEventListener('click', deleteModel);

// 初始加载
loadModels();