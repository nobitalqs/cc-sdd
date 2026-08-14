# ChatGPT 网页版启动提示词

使用前替换尖括号中的占位符。第一轮有意限定为只读。

---

你将接管 `gotalab/cc-sdd` 某个 fork 的架构工作。使用已连接的 GitHub app 作为事实来源。本对话不存在具有权威性的隐藏上下文；下列仓库产物构成完整交接。

仓库：`nobitalqs/cc-sdd`
预期上游：`gotalab/cc-sdd`
预期基线分支：`main`
预期已审查上游提交：`29aee950f4addc36f9aeecb9881c46540e71ecc9`
Bootstrap Issue：`https://github.com/nobitalqs/cc-sdd/issues/1`
Draft PR：`https://github.com/nobitalqs/cc-sdd/pull/2`

按以下顺序阅读：

1. 上游和 fork 的仓库元数据、默认分支、当前 HEAD、许可证和贡献指南；
2. `harness-v1-decision-graph.md`；
3. `migration-manifest.md`；
4. `bootstrap-issue.md`；
5. `handoff-current.md`；
6. 当前 cc-sdd v3 skill reference，重点关注 `/kiro-impl`、`/kiro-verify-completion` 和 `/kiro-validate-impl`；以及
7. 上述链接指向的现有 Issue/PR 讨论。

目标：以最小规模为 cc-sdd 演进出通用、版本化的监督循环/状态图层。cc-sdd 继续负责 discovery、规格生成、逐任务实现/审查/调试、完成性核验和功能验证。新层负责跨代理协调、合法转换、持久事件/投影、独立外部审查 gate、不可变证据溯源、恢复/连续性、预算和回放/评估。

不可妥协的约束：

- 不得复制私有仓库源码、提示词、会话记录、标识、路径或真实运行数据。
- Fork 中仅使用脱敏文档和合成 fixture。
- 不得重复 `/kiro-impl` 已经包含的审查者。
- 保留 `/kiro-validate-impl` 作为功能级收尾。
- 核心 reducer 必须确定性运行，并与 provider 无关。
- 模型/思考强度继承必须与权限、工具、hook、plugin、MCP 和会话策略分离。
- 历史证据不可变；可变批准/readiness 视图属于投影。
- 非法转换和不完整终态必须由代码拒绝。
- 保留上游署名和 MIT 许可证。
- 不得修改上游、默认分支设置、release 或 merge 状态。
- 第一轮不得创建分支、提交、Issue、PR 或评论。

第一轮任务：

1. 核验预期上游提交是否仍为当前 HEAD，并报告任何漂移。
2. 将交接内容与当前 cc-sdd v3 对比，避免重新实现上游已有能力。
3. 从第一性原理对抗性审查 Bootstrap Issue：目标、职责边界、不变量、故障模式和里程碑 1 验收标准。
4. 指出已经过时、存在歧义、范围过大或与当前仓库不兼容的陈述。
5. 提出最小且完整的里程碑 1 文件/package 边界和合成回放测试矩阵。
6. 列出真正需要人类产品判断的决策；能够从仓库证据解决的技术问题应自行解决。
7. 以只读交接收尾，包含：实际仓库/基线 SHA、已读取文件、按严重度分类的发现、建议的 Issue 修改、建议的首个分支名，以及下一步希望获准执行的精确外部写入。

暂不实现任何内容。不得仅因文档内部一致就宣称批准。请质疑是否真的需要状态图引擎、它是否属于这个仓库，以及建议边界能否保持为薄扩展而不是 fork 专属的平行产品。

---

## 获得实现授权后的提示词

仅在第一轮审查被接受，且预期 GitHub 写入获得显式授权后使用：

> 应用已接受的 Bootstrap Issue 修改，创建或使用已批准的非默认分支，并且只实现里程碑 1。保持 PR 为 draft。仅使用合成 fixture，保留现有默认行为，并使用小而可审查的提交。每次提交后报告提交 SHA、覆盖的验收标准、执行的测试、未解决风险和下一项建议变更。在 merge、release、默认分支修改、上游写入或任何范围扩张前停止。
