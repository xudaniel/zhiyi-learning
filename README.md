# 知易 · 施老师方法 · 拼音入门

零基础互动学习 App。按施老师既有课程组织：背熟干支 → 读四柱找日元 → 清点五行 → 比较月份 → 分清命局、大运、流年 → 查关系 → 查口诀 → 复述案例。

- 8 步方法练习、12 节短课、错题本、记忆翻卡、笔记与备份恢复。
- 天干地支和课程难字每次出现都显示带声调拼音；输入保留汉字，附同步读音预览。
- 文昌诀附原页及可注音转写，按日元为主、年干为辅练习起点与命中柱位。
- 公开课程资料为学习摘录，不含原口述稿中的个人家庭、婚姻和具体命盘案例。

**用户故事先于实现记录：** [Stories](docs/user-stories.md) · [Issues](https://github.com/xudaniel/zhiyi-learning/issues)

## 使用

[在线学习](https://xudaniel.github.io/zhiyi-learning/)。也可下载 `docs/index.html` 后双击打开，离线使用。

学习记录存储在当前浏览器。此前 localhost 版本的记录不会自动跨域同步：在旧版「我的笔记」导出学习记录，再在新版恢复即可。导入采取合并方式，当前已有的非空笔记优先保留。笔记从不上传服务器。

## 开发与验证

Node.js 22+。

```sh
pnpm install --frozen-lockfile
pnpm run build
pnpm test
pnpm exec playwright install chromium
pnpm run test:e2e
```

若使用已安装 Chrome，可设置 `PLAYWRIGHT_CHANNEL=chrome`。`APP_URL` 可指定实际线上地址运行相同浏览器检查。测试使用独立浏览器环境，不接触用户真实学习记录。

`src/index.html`、`src/style.css` 是页面与样式；`src/app.js`、`src/method.js` 为课程和教法交互；`src/pinyin.js` 为展示层注音与词语读音表；`src/lessons.json` 与 `src/sources.json` 为课程与经过整理的学习摘录。运行构建生成可直接发布的单文件页面。

## 发布

GitHub Pages 使用 `main` 分支的 `/docs` 目录。通过测试后提交源码和生成页面；Pages 部署成功后验证线上地址。回滚时回退对应发布提交并重建；不要清除浏览器学习记录。

## 内容与范围

短课是依据施老师《易学讲座·实战篇（上）》总结及第二节口述课重新组织的学习讲解，8步编号是 App 的教学组织。讲义第77页文昌诀已核对原图，其他页码沿用既有总结。传统命理解释作为课程观点呈现。

风水目前覆盖五行方位与文昌查法，不含住宅布局判断。教学四柱不对应个人出生时间，也未实现出生日期自动排盘。

发音来源与语境处理见 [pronunciation.md](docs/pronunciation.md)。源课程及讲义图片的权利属于原权利人；本仓库没有授予课程材料再分发许可。新增程序代码保留权利，未另行指定开源许可证。
