import{_ as a,c as s,a as n,F as d,g as c,o as i,t as o}from"./index-CQaaChNY.js";const p={data(){return{logs:[{version:"2.2.8",date:"2026-8-15",description:`相对 2.2.7 主要更新：
1. 新增 Agent：可以对话讲解，也能识别本地文件并把题目写入题库
2. 支持 CSV、Excel、Word、PDF、文本导入；题库文件夹可一键整理
3. 对话可附带图片和文件，视觉模型可直接看图识题
4. 远程模型的 API 协议改到平台上统一配置
5. 其他体验优化

说明：macOS 版仍暂时下架，签名公证完成后重新开放。
近期功能迭代较快，更新可能会比较频繁，给大家带来不便请见谅。`},{version:"2.2.7",date:"2026-8-9",description:`相对 2.2.6 主要更新：
1. 应用内自动更新：Mac 原地替换、Windows 安装更新，完成后可自动重启
2. 默认窗口尺寸按屏幕自适应（1080p 更合适）
3. 远程模型的 API 协议与思考开关由管理员统一下发并锁定
4. 平台/模型图标改为从官方 webapi 加载
5. 修复返回箭头在 Mac 与 Windows 上朝向不一致
6. Windows 安装包默认简体中文，图标与打包体验优化
7. 右键菜单互斥动画、题目列表更紧凑；未选模型时错误提示更明确

若 Mac 提示「已损坏，无法打开」，在终端执行：
xattr -cr /Applications/ZError.app`},{version:"2.2.6",date:"2026-5-16",description:"1. 小更新，防止题目完全相同，但在api调用时不匹配"},{version:"2.2.5",date:"2026-5-16",description:`1. 将选项加入匹配
2. 修复多选题目删除的二次确认弹窗无效问题；
3. 修复8080端口占用问题；
4. 修复ai模型调用报错却存储为答案的问题`},{version:"2.2.4",date:"2026-3-30",description:`1. 修复模型无法打开修改窗外问题 
 2. 优化模型输出显示
 3. 添加操作引导`},{version:"2.2.3",date:"2025-11-30",description:`1. 修复模型供应商列列表无法滑动的问题
2. 停止服务与关闭测试时，会停止请求
3. 优化图片颜色反转逻辑`},{version:"2.2.1",date:"2025-11-30",description:`1. 优化图片链接识别算法，如再遇到图片链接识别问题，可以联系作者
2.优化请求数量的日志记录`},{version:"2.2.0",date:"2026-3-30",description:`1. 添加图片题目的答案直接返回支持
2.添加多模型并发，并最终由总结模型总结答案
3. 优化平台与模型添加
4. 优化界面
5.添加题目反馈功能
6. 添加请求记录
7. 防止空答案存入
8.优化包含'以下'，'下列'等关键字的题目的查询
9.优化软件内查询，改为全文匹配`},{version:"2.1.0",date:"2025-11-30",description:`1. 修复软件默认数据存储路径问题
2. 添加导入与导出功能
3. 修复文件夹无法拖动的问题
4. 添加对题目选项的支持`},{version:"2.0.2",date:"2025-11-18",description:`1. 修复某些情况下需要管理员身份运行的问题
2.修复一些默认模型的无法使用的问题
3.优化题库页对图片的显示
4.更好的AI请求错误处理`},{version:"2.0.1",date:"2025-11-8",description:"1. 修复更新后请求500错误的问题"},{version:"2.0.0",date:"2025-11-8",description:`1. 改为Tauri架构，更好的界面
2. 支持自定义平台与AI模型
3. 支持文本推理模型
4. 修复服务器无法开启的bug`},{version:"1.4.0",date:"2025-06-25",description:`1. 截图搜题支持markdown以及latex语法显示
2. 添加火山引擎以及FreeQwQ
3. 优化软件启动与关闭`},{version:"1.3.1",date:"2025-06-19",description:`1.修复局域网开放功能
2.修复再添加ai回答到数据库后，文件夹树题目统计不刷新的问题
3.修复UI过大问题
4.修复多选题目时，右键菜单问题`},{version:"1.3.0",date:"2025-05-18",description:`1.添加题库分类功能
 2.添加图片url显示功能
 3. 题库的精确匹配改为模糊匹配
 4.可以设置服务端口，并且对局域网开放
 5.美化界面`},{version:"1.2.0",date:"2025-05-2",description:`1. 添加截图搜题
2. 修复题库无法修改的问题`},{version:"1.1.2",date:"2025-04-21",description:`1. 优化提示词
2. 修复删除题目失败的问题`},{version:"1.1.1",date:"2025-03-21",description:"1. 修复密钥保存问题"},{version:"1.1.0",date:"2025-03-21",description:`1. 批量导入问题
2. 修复文件权限问题`},{version:"1.0.0",date:"2025-03-20",description:"首次发布版本"}]}}},l={class:"changelog-page"},v={class:"changelog-container"},g={class:"version-badge"},_={class:"log-content"},u={class:"log-date"},h={class:"log-description"};function w(f,t,x,A,r,I){return i(),s("div",l,[t[0]||(t[0]=n("div",{class:"changelog-header"},[n("h1",null,"更新日志"),n("p",{class:"subtitle"},"ZError版本更新记录")],-1)),n("div",v,[(i(!0),s(d,null,c(r.logs,e=>(i(),s("div",{key:e.version,class:"log-card"},[n("div",g,o(e.version),1),n("div",_,[n("div",u,o(e.date),1),n("div",h,o(e.description),1)])]))),128))])])}const k=a(p,[["render",w],["__scopeId","data-v-2a6cda3e"]]);export{k as default};
