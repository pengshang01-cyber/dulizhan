# 审核流程：Codex 执行 → Claude 审核 → Codex 修改

## 一次性准备

1. 在 GitHub 新建一个仓库（私有即可），把本压缩包里的文件放到仓库根目录，提交到 `main`。
2. 在 Codex 里连接这个仓库。
3. （推荐）在 Cloudflare Pages 连接同一个仓库：构建命令 `npm run build`，输出目录 `dist`。之后每个 PR 都会自动生成预览网址，审核时可以直接打开看。

## 每个里程碑的循环

```
① 你把“启动指令”发给 Codex
② Codex 在新分支上开发 → 自检 → 写审核报告 → 开 PR
③ 你把 PR 链接发给 Claude
④ Claude 审核，回复“通过”或“需修改 + 一段可直接粘给 Codex 的修改指令”
⑤ 需修改：把修改指令粘给 Codex → Codex 在同一分支修改 → 回到 ③
   通过：你在 GitHub 合并 PR → 进入下一个里程碑
```

### ① 启动指令（每个里程碑复制一次，改编号）

```
阅读 AGENTS.md 和 docs/PLAN.md，执行里程碑 M2（首页）。
只做 M2 的范围。完成后：
1. 运行 npm run build、npm run check、npm run lint，全部通过；
2. 运行 npm run screenshots -- M2；
3. 按 docs/reviews/TEMPLATE.md 写 docs/reviews/M2.md；
4. 在分支 m2-homepage 上提交并向 main 开 PR，标题 "M2: Homepage"。
```

### ③ 发给 Claude 审核时

最好的方式：直接发 PR 链接，例如

```
审核 M2：https://github.com/<你的账号>/<仓库>/pull/3
预览：https://<预览地址>.pages.dev   （有就附上）
```

Claude 能直接读取仓库的代码、报告和截图。第一次需要你在对话里同意 Claude 访问这个仓库。

如果 Claude 访问不了仓库，就改为：

- 把 `docs/reviews/M2.md` 的全部内容粘贴过来
- 上传 `docs/reviews/M2/` 文件夹里的截图
- 附上预览网址（如果有）

### ④ Claude 的审核会检查什么

| 方面 | 检查内容 |
| --- | --- |
| 范围 | 是否完成 PLAN 中的每条任务，有没有超范围 |
| 验收 | 验收标准是否逐条有证据（命令输出、截图） |
| 事实 | 有没有编造的工厂信息、证书、数字 |
| 代码 | 结构是否符合 AGENTS.md，有没有密钥、硬编码的联系方式 |
| 外贸视角 | 文案是否像海外采购商会信任的工厂站，询盘入口是否足够显眼 |
| 移动端 | 375px 截图有没有溢出、错位 |

### ⑤ 审核结果格式

Claude 会这样回复：

```
结论：需修改（2 项必改，1 项建议）

【粘给 Codex 的修改指令】
在分支 m2-homepage 上按以下意见修改，提交信息以 review-fix: 开头，
完成后更新 docs/reviews/M2.md 的“修改记录”并推送：
1.（必改）……
2.（必改）……
3.（建议）……
```

“必改”全部解决后才合并；“建议”可以放到以后。

## 需要你本人回答的问题

Codex 报告里的“待确认问题”和“TODO 占位”需要工厂提供真实资料（产能、证书、联系方式、产品参数等）。可以随时把资料发给 Claude，Claude 会整理成一段指令让 Codex 填进 `site.ts` 和产品文件。
