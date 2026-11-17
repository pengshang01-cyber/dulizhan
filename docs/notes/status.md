# 当前状态

更新：2026-11-17

- PR #11 已合并；基线 main 5043737，当前 m7b-images，完成 M7.5 图片全部后台化。
- 网站设置统一上传 Logo、默认分享图、首页主图、车间图库、视频封面；CMS 指南与 todo:report 已更新。
- 六项检查全通过：35 页、140 个文件类型检查、278 项测试；SEO 0 错误 / 警告，1352 内部链接和 108 锚点通过。
- 16 张截图及 CMS 格式测试通过，默认首页四张与 M7 逐像素相同；正式新增图片字段为空，临时图片已删除。
- 删除 9 个 M7 Lighthouse 原始报告，只保留分数表；今后原始目录忽略。
- 22 个 JSON 的资料清单：95 个待补字段、20 处占位图引用、7 个空图片位、3 个示例产品。
- 代码提交 af8148e，PR #12 已创建并待审核：https://github.com/pengshang01-cyber/dulizhan/pull/12 。代码 CI / Workers Builds 均成功，预览 https://m7b-images-dulizhan.pengshang01.workers.dev 四个中英文页面实测 HTTP 200、默认图和 noindex 正确；文档回填后以 PR 最新 Checks 为准。
- allowIndexing=false、示例博客草稿、既有 domain 保持不变；正式图片待工厂在 CMS 上传。
