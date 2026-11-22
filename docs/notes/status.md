# 当前状态

更新：2026-11-22

- M8 已通过 PR #15 合并，正式域名为 `https://junbeili.com`。
- M9 从含工厂工作簿的 main `fd6d242` 创建 `m9-product-import`。PR #16 已创建待审核。[M9 PR](https://github.com/pengshang01-cyber/dulizhan/pull/16)
- 354 条中纳入 342 条，导入 13 个分类、118 个产品及 339 个尺寸或选项。工厂工作簿移至 `data-import/junbeili-products.xlsx`，导入说明见 `docs/import/`。
- 六项检查与 312 项测试通过，重复导入得到相同文件。已从 Workers PR 预览截取 12 张审核截图并实测禁收录响应。[M9 审核报告](../reviews/M9.md)
- 待工厂按图片清单补实拍，核对报告列出的规格和缺型号项。工厂资料确认完成后按 `docs/LAUNCH.md` 操作，当前收录开关为 `false`。
