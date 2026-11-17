<script setup lang="ts">
defineProps<{ english?: boolean }>()
</script>

<template>
  <article class="privacy-page">
    <header class="privacy-heading">
      <h1>{{ english ? 'ZError Privacy Policy' : 'ZError 隐私政策' }}</h1>
      <p>
        {{ english ? 'Effective ' : '生效日期 ' }}
        <time datetime="2026-11-17">{{ english ? 'November 17, 2026' : '2026 年 11 月 17 日' }}</time>
      </p>
      <router-link v-if="english" to="/privacy" lang="zh-CN">简体中文</router-link>
      <router-link v-else to="/privacy/en" lang="en">English</router-link>
    </header>

    <template v-if="english">
      <p>This policy applies to the ZError desktop application and the official website at app.zerrorai.com. The ZError project is maintained by <a href="https://github.com/Miaozeqiu">Miaozeqiu</a>. The data processed depends on the features and services you use.</p>

      <section>
        <h2>Data on your device</h2>
        <p>ZError stores local question banks, imported questions and images, application settings, query logs, and Agent conversations on your device. The embedded browser may also store browsing state and site cookies. If you save a website login or API key in the desktop app, ZError uses its local secure storage for supported credentials.</p>
      </section>

      <section>
        <h2>Data sent when you use connected features</h2>
        <ul>
          <li><strong>AI providers and search.</strong> When a feature calls a model, the configured provider receives the content needed for the request. This can include questions, prompts, relevant conversation history, images, extracted file content, and relevant web page or tool results. Web search sends the query to the configured search service. Model and search API keys are used to authenticate with the corresponding service.</li>
          <li><strong>ZError account and online question banks.</strong> Signing in processes a verification code, account ID, nickname, and session information to authenticate you. When you use the online or campus question bank, ZError processes the account details, questions, contributions, feedback, and usage information needed to provide that feature. Campus features may use school affiliation and enrollment year. If you apply for student verification, the service processes your name, student ID, the supporting images you submit, and the review status to verify eligibility. The embedded campus question bank uses the ZError session to keep you signed in.</li>
          <li><strong>Embedded browser.</strong> Websites receive normal browser requests and the information you enter or ask the Agent to enter on those sites. An Agent task may also send relevant page content to the configured model. The visited site and the model provider each apply their own privacy practices.</li>
          <li><strong>Updates and service resources.</strong> ZError connects to project services or their hosting providers to check for updates and retrieve resources such as model listings and website experience files. Requests can expose an IP address and standard network metadata. An update check can also include the platform and architecture.</li>
        </ul>
      </section>

      <section>
        <h2>Website and analytics</h2>
        <p>The website uses Tencent EdgeOne Pages for delivery. Standard connection data such as IP addresses, requested pages, and request times may be handled to deliver and protect the site. The website also uses Google Analytics to understand visits and page usage. It may use cookies or similar identifiers and process page views, referrals, and browser or device information. You can manage cookies in your browser or use Google’s analytics opt-out add-on. <a href="https://policies.google.com/privacy">Google Privacy Policy</a> · <a href="https://tools.google.com/dlpage/gaoptout">Google Analytics opt-out</a></p>
      </section>

      <section>
        <h2>Retention and recipients</h2>
        <p>Local files and browser data may remain on your device until you delete them or clear the relevant application data. ZError keeps online account, service, and support records for the time needed to provide the relevant feature, maintain security, resolve requests, and meet applicable legal obligations. Hosting, analytics, model, search, and visited website providers may process data in other countries or regions under their own privacy policies and retention practices.</p>
      </section>

      <section>
        <h2>Your choices and contact</h2>
        <p>You can use the local question bank without signing in, remove saved provider credentials or website accounts in Settings, delete questions or conversations, and clear query logs using the available controls. Signing out clears the active account session on that device. To request access, a copy, correction, deletion, or withdrawal of consent for personal data handled by ZError, contact the maintainers at <a href="mailto:2669624618@qq.com">2669624618@qq.com</a>. For data held by a provider you selected, use that provider’s privacy contact or controls.</p>
        <p>If you are under 14, use features that require personal information with the knowledge and consent of your parent or guardian. Guardians may use the same contact address to ask about a child’s data. We publish changes to this policy on this page with an updated effective date.</p>
      </section>
    </template>

    <template v-else>
      <p>本政策适用于 ZError 桌面软件及官网 app.zerrorai.com。ZError 由项目维护者 <a href="https://github.com/Miaozeqiu">Miaozeqiu</a> 维护。我们处理的信息取决于你使用的功能和服务。</p>

      <section>
        <h2>保存在设备上的数据</h2>
        <p>ZError 将本地题库、导入的题目和图片、软件设置、查询记录和 Agent 对话保存在你的设备上。内置浏览器也可能保存浏览状态和网站 Cookie。你在桌面端保存网站账号或 API 密钥时，软件通过本地安全存储保存受支持的凭据。</p>
      </section>

      <section>
        <h2>联网功能会发送哪些数据</h2>
        <ul>
          <li><strong>AI 模型和搜索。</strong> 调用模型时，所配置的供应商会收到完成请求所需的内容，例如题目、提示词、相关对话、图片、从文件提取的内容及相关网页或工具结果。联网搜索会把搜索词发送给所配置的搜索服务。模型和搜索的 API 密钥用于向相应服务验证身份。</li>
          <li><strong>ZError 账号和在线题库。</strong> 登录时会处理验证码、账号 ID、昵称和会话信息。使用在线题库或校园题库时，会处理提供相应功能所需的账号资料、查询题目、贡献内容、反馈和使用记录。校园功能可能使用学校和入学年份。申请学生认证时，服务会处理姓名、学号、你提交的证明图片和审核状态，以核验资格。桌面端嵌入的校园题库会使用 ZError 会话同步登录状态。</li>
          <li><strong>内置浏览器。</strong> 访问的网站会收到正常的网页请求，以及你输入或请 Agent 代为输入的信息。执行 Agent 任务时，相关页面内容也可能发送给所配置的模型。访问的网站和模型供应商分别按各自的规则处理数据。</li>
          <li><strong>检查更新及获取资源。</strong> 软件会连接项目服务或其托管服务，检查更新及获取模型目录、网站经验等资源。请求会带有 IP 地址等常规网络信息。更新检查也可能发送平台和处理器架构。</li>
        </ul>
      </section>

      <section>
        <h2>官网和访问统计</h2>
        <p>官网使用腾讯云 EdgeOne Pages 提供网站服务。为交付和保护网站，托管服务可能处理 IP 地址、访问页面和请求时间等常规连接信息。官网使用 Google Analytics 了解访问和页面使用情况，可能使用 Cookie 或类似标识，并处理页面访问、来源及浏览器或设备信息。你可以通过浏览器管理 Cookie，或使用 Google 的停用插件。<a href="https://policies.google.com/privacy">Google 隐私权政策</a> · <a href="https://tools.google.com/dlpage/gaoptout">停用 Google Analytics</a></p>
      </section>

      <section>
        <h2>保存期限及接收方</h2>
        <p>本地文件和浏览器数据可能保留在设备上，直至你删除文件或清除相应应用数据。在线账号、服务和支持记录在提供相关功能、维护安全、处理请求及履行适用法律义务所需期间保存。托管、统计、模型、搜索服务和访问的网站可能在其他国家或地区处理数据，并适用各自的隐私政策和保存规则。</p>
      </section>

      <section>
        <h2>你的选择与联系方式</h2>
        <p>你可以在不登录的情况下使用本地题库，在设置中移除已保存的供应商凭据或网站账号，也可用软件中的功能删除题目或对话、清空查询记录。退出登录会清除当前设备的账号会话。若希望查阅、复制、更正、删除由 ZError 处理的个人信息，或撤回同意，请联系维护者 <a href="mailto:2669624618@qq.com">2669624618@qq.com</a>。由你选择的第三方服务所保存的信息，可通过该服务的隐私设置或联系方式处理。</p>
        <p>未满十四周岁的用户应当在监护人知情并同意后使用涉及个人信息的功能。监护人可通过上述邮箱联系我们。政策变更会发布在本页，并更新生效日期。</p>
      </section>
    </template>
  </article>
</template>

<style scoped>
.privacy-page {
  box-sizing: border-box;
  width: min(100%, 760px);
  margin: 0 auto;
  padding: clamp(5.75rem, 10vw, 7rem) clamp(1.25rem, 5vw, 2.5rem) 3rem;
  color: #36444e;
  font: 1rem / 1.75 "Inter", system-ui, sans-serif;
  overflow-wrap: anywhere;
}

.privacy-heading h1 {
  margin: 0;
  color: #222f39;
  font-size: clamp(1.85rem, 4vw, 2.75rem);
  line-height: 1.2;
}

.privacy-heading p {
  margin: 0.75rem 0 0.25rem;
  color: #52606b;
  font-size: 0.9rem;
}

.privacy-page section {
  margin-top: 2.25rem;
}

.privacy-page h2 {
  margin: 0 0 0.5rem;
  color: #222f39;
  font-size: 1.25rem;
  line-height: 1.45;
}

.privacy-page p,
.privacy-page ul {
  margin: 0 0 0.9rem;
}

.privacy-page > p {
  margin-top: 1.75rem;
}

.privacy-page ul {
  padding-inline-start: 1.3rem;
}

.privacy-page li + li {
  margin-top: 0.75rem;
}

.privacy-page a {
  color: #18664b;
  text-decoration: underline;
  text-underline-offset: 0.18em;
}
</style>
