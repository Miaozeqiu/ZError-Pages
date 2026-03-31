import{_ as a,c as s,a as n,F as d,r as c,o,t as i}from"./index-HonyP5pd.js";const l={data(){return{logs:[{version:"2.2.0",date:"2026-3-30",description:`1. 添加图片题目的答案直接返回支持
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
2. 修复文件权限问题`},{version:"1.0.0",date:"2025-03-20",description:"首次发布版本"}]}}},p={class:"changelog-page"},v={class:"changelog-container"},_={class:"version-badge"},g={class:"log-content"},u={class:"log-date"},h={class:"log-description"};function f(k,t,x,I,r,b){return o(),s("div",p,[t[0]||(t[0]=n("div",{class:"changelog-header"},[n("h1",null,"更新日志"),n("p",{class:"subtitle"},"ZError版本更新记录")],-1)),n("div",v,[(o(!0),s(d,null,c(r.logs,e=>(o(),s("div",{key:e.version,class:"log-card"},[n("div",_,i(e.version),1),n("div",g,[n("div",u,i(e.date),1),n("div",h,i(e.description),1)])]))),128))])])}const w=a(l,[["render",f],["__scopeId","data-v-f905f12c"]]);export{w as default};
