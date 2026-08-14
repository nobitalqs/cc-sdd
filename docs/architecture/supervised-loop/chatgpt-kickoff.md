# ChatGPT 网页版交接提示词

下面的提示词用于把后续工作交给连接了 GitHub 的 ChatGPT 网页会话。仓库文档和 GitHub 对象是事实来源；不要假设存在其他隐藏上下文。

---

你将接管 `nobitalqs/cc-sdd` 中一个范围受限的 cc-sdd fork 改进。预期上游为 `gotalab/cc-sdd`，预期基线为 `main` 提交 `29aee950f4addc36f9aeecb9881c46540e71ecc9`。开始前必须重新核验当前上游 HEAD。

请依次阅读：

1. Issue #1：`https://github.com/nobitalqs/cc-sdd/issues/1`
2. Draft PR #2：`https://github.com/nobitalqs/cc-sdd/pull/2`
3. `docs/architecture/supervised-loop/current-loop-contract.md`
4. `docs/architecture/supervised-loop/porting-plan.md`
5. `docs/architecture/supervised-loop/bootstrap-issue.md`
6. `docs/architecture/supervised-loop/handoff-current.md`
7. 当前 Codex 版 `/kiro-impl`、`/kiro-validate-impl`、Codex Skills manifest 和对应测试。

## 产品目标

将一套已经实际运行的 Codex—Claude 监督 loop 移植为 cc-sdd 中显式调用的 Codex 专用 `kiro-supervise` skill，并只修复运行中已经观察到的问题。它不是通用 graph、协议或 provider runtime 工程。

必须保留的行为：

- 主 Codex 任务只监督和批准；每个 Kiro 阶段使用新的可见 Codex 任务。
- 阶段任务复用 cc-sdd 已有 skill。
- Requirements、Design、Tasks 和最终 Validation 接受 Claude Code 只读对抗性审查。
- 主 Codex 独立核验 Claude 意见后才推进。
- Spec/Validation 继承监督者 Codex 配置；Implementation 使用 Luna Max 独立任务。
- Claude 继承用户默认模型和思考设置，保持 bypass permission，并以操作系统级隔离保护真实 worktree。
- 同阶段最多三轮并复用 Claude session；跨阶段使用新 session 和有界 dossier。

本轮只处理：

1. 增加可安装的 Codex `kiro-supervise` skill。
2. 用 `/kiro-impl --final-validation deferred` 消除监督模式下的重复功能验证，同时保持默认行为不变。
3. 修复可变 `spec.json` 历史哈希、阶段前置条件、Implementation 状态语义和终态检查。
4. 用阶段 dossier、会话边界、预算和用量观测控制 Claude 审查成本。
5. 提供项目声明验证命令的扩展点，不实现通用 monorepo 测试影响图。

明确禁止扩展到：graph/reducer、事件溯源、事件回放、provider adapter 平台、storage/lease、根级新 package、多工作流运行时、EAS 私有 lock/test 规则。

## 第一轮任务

第一轮保持只读：

1. 核验上游 HEAD、Issue、PR 和上述文件。
2. 对照当前 cc-sdd v3，确认计划没有重复已有能力。
3. 从第一性原理审查角色边界、验证唯一所有者、默认行为兼容性和验收标准。
4. 只报告会阻止这一最小移植的具体问题；不要以“未来更通用”为理由重新扩大范围。
5. 给出拟修改文件清单、测试矩阵和小步提交顺序。
6. 明确说明是否建议授权实现；在得到授权前不得创建提交、评论、Issue、PR 或修改仓库。

## 获得实现授权后

只在用户显式授权后开始实现：

- 使用现有非默认分支或用户批准的新分支；保持 PR 为 draft。
- 优先实现安装边界和兼容性测试，再移植 loop，最后处理稳定化修复。
- 每个提交只覆盖一个可审查目标，并报告提交 SHA、验收标准、测试和遗留风险。
- 不得 merge、release、修改默认分支设置、写入上游或扩大 Issue 范围。

---

此提示词有意把“未来可能的通用 graph 工程”排除在当前任务之外。若发现值得后续研究的抽象，只能记录为独立后续建议，不能成为当前实现的前置条件。
