# 当前状态

更新：2026-11-17

- M7 已实现，当前分支 m7-blog-perf；基线为 PR #10 合并后的 main 0b3d0af。
- 六项检查全通过：35 页；271 项测试；SEO 0 错误 / 0 警告；1352 个内部链接、108 个锚点均通过。20 张 M7 截图完成；临时发布、9+1 分页、中文无正文、有效 GA 回归通过，原数据恢复。
- Lighthouse 移动端：英文首页 / 中文首页 / 联系页 P=100，产品详情 P=99；A11y / Best Practices 均 100。SEO 因 noindex 为 66–69。
- 上线清单自动扫描 22 个 JSON：95 个待补字段、20 处占位图引用、3 个空图片位、3 个示例产品；保留人工 M8 检查。
- M7 已提交 613fc7f，PR #11 已创建并待用户审核：https://github.com/pengshang01-cyber/dulizhan/pull/11 。代码 CI / Workers Builds 成功，预览 https://m7-blog-perf-dulizhan.pengshang01.workers.dev 已核验十个地址：中英页面200、四个草稿地址404，Cookie界面隐藏、noindex保留。文档回填后以 PR 最新 Checks 为准。
- 两篇文章最终 draft=true，allowIndexing=false，domain 及真实联系方式保持 TODO；真实发信与工厂资料待 M8 验收。
