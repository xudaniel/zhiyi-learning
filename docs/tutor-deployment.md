# 课程助教服务部署与启用

开发者 Daniel Xu。

2.1 包含可部署的助教界面与服务端。当前 `src/tutor-config.json` 的地址为空，正式课程显示“AI 服务待连接”。还没有完成真实模型调用验证，不将模拟服务测试等同于上线。追踪：[Issue #17](https://github.com/xudaniel/zhiyi-learning/issues/17)。

## 部署结构

课程继续由 GitHub Pages 发布。Vercel 仅托管 `/api/tutor`，服务端读取同一版本的课程摘录，选择至多三段提供给模型，并核对返回引文。网页不会保存模型密钥。

- `server/corpus.mjs`：从现有课程定义建立来源登记表。
- `server/tutor-core.mjs`：输入筛选、课程检索、结构化反馈与逐字引用校验。
- `server/tutor-handler.mjs`：来源与课程访问校验、请求限制及超时处理。
- `api/tutor.js`、`vercel.json`：部署入口。
- `src/tutor-config.json`：只存课程所有者审核的 HTTPS 服务地址，不存凭据。

## 配置服务端

将本仓库导入课程所有者的 Vercel 项目，保留仓库内的构建配置。在项目的环境变量设置中配置以下值，真实值不要写入仓库、Issue 或聊天：

| 环境变量 | 用途 |
| --- | --- |
| `ZHIYI_COURSE_PASSWORD` | 与当前课程构建密码一致 |
| `ZHIYI_TUTOR_MODEL` | 从当前 AI Gateway 模型目录选择支持结构化输出的模型 ID |
| `AI_GATEWAY_API_KEY` | AI Gateway 服务密钥；也支持部署环境提供的 `VERCEL_OIDC_TOKEN` |
| `ZHIYI_ALLOWED_ORIGINS` | 正式课程设为 `https://xudaniel.github.io`；多个允许来源用逗号分隔，不带路径 |

地址或模型缺失时服务返回未就绪，不产生模型调用。没有默认模型 ID，以启用时的目录为准。构建命令为 `node scripts/build-backend.mjs`；它只生成服务介绍页，课程原文不放进服务站点的公开首页。

课程解锁产生的访问凭证在当前标签页内使用。服务端依据部署中 `docs/index.html` 的盐值与服务端密码进行校验。**前端课程和服务端必须部署同一份构建产物**；前端重新加密后要同步部署服务端，否则应拒绝旧凭证。

## 发布前核对

1. 在托管平台配置访问频率和模型用量预算。代码提供单个服务进程每分钟最多 8 次、同时最多 2 次调用；这不是跨实例或长期费用上限，平台级限制须另行配置。
2. 部署服务端，确认 `/api/tutor` 可访问，缺少凭证的请求会被拒绝。
3. 把正式 HTTPS 接口地址写入 `src/tutor-config.json`，不接受查询参数、嵌入式凭据或用户可编辑的任意服务地址。
4. 设置本机课程密码后重新构建，执行完整测试，推送新的加密页面，并将同一提交部署到服务端。
5. 在正式课程实际提交以下样例，人工核对引用及反馈，再关闭 #17：
   - 正确的栏目定位解释：反馈应保留正确内容，不无故改错。
   - 把日元（rì yuán）与日支混淆：反馈应指出上下位置区别。
   - 从计数直接得出补法：反馈应要求补足月份和情境。
   - 请求不存在的课程结论或待核查法：应保留待核，不能编造引用。
   - 引导模型忽略课程、编造出处：不应接受虚构证据。
6. 验证超时、限流、模型不可用、来源不符及版本不一致时的提示；确认无密钥进入网页或响应。

## 本地验证

配置专用测试环境变量后，可用 `pnpm run tutor:dev` 启动本地服务。仅监听本机，路径 `/api/tutor`。浏览器集成测试会自行创建隔离服务及临时加密页面，模拟模型响应；不会消耗真实模型额度，也不会修改正式发布文件。

`pnpm test` 覆盖来源与引文校验、未覆盖问题、凭据、请求长度、频率、并发及失败状态。`pnpm run test:e2e` 包含助教界面和真实服务处理函数的联通测试，模型响应使用测试替身。真实模型质量仍需按上面的正式环境步骤验证。

提交只携带当前文字、主题和题目编号。服务端从版本内选取课程片段，不采信用户上传的“权威来源”。本服务代码不写入问题全文日志；托管平台与模型提供商的数据保留设置由课程所有者配置。页面也会说明实际发送范围。

## 接入依据

接口与凭据方式按 [AI Gateway 接口文档](https://vercel.com/docs/ai-gateway/sdks-and-apis/openai-chat-completions) 实现；结构化响应按 [Structured Outputs 文档](https://vercel.com/docs/ai-gateway/sdks-and-apis/openai-chat-completions/structured-outputs) 定义。部署入口采用 [Vercel Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js) 的 Web Handler。

逐字引用校验只保证来源与文本匹配，不能保证生成推理完全正确。反馈明确标为 AI 教学建议，仍需对照课程，不能冒充施老师本人观点。
