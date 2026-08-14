# Bootstrap Issue 草案

## 标题

`[Codex] 移植并稳定由 Claude 审批的 cc-sdd 监督循环`

## 正文

### 问题

cc-sdd v3 已经拥有 Requirements、Design、Tasks、逐任务 Implementation 审查/调试、完成性核验和功能级 Validation。需要补充的不是一套新的规格方法或通用工作流引擎，而是一项可选的 Codex 专用监督能力：让 Codex 主任务协调隔离的阶段任务，并在每个规格阶段和最终验收处引入 Claude Code 的只读对抗性审查。

一套私有下游 harness 已经实际运行了这条线性流程，证明了角色分离和阶段隔离的价值，也暴露了若干具体问题：最终 Validation 被重复执行、可变 `spec.json` 被错误地当作不可变历史产物、状态 helper 没有完整强制阶段顺序和完成条件，以及 Claude 审查因重复发现仓库上下文而产生异常高的额度消耗。

本 Issue 只负责将这套现有 loop 以最小方式移植到 cc-sdd fork，并修复这些已观察到的问题。

### 目标

在不改变 cc-sdd 默认工作流的前提下，增加一个显式调用的 `kiro-supervise` Codex skill，使其能够：

- 由 Codex 主任务持续监督一次完整规格任务；
- 为 Requirements、Design、Tasks、Implementation 和 Validation 分别使用新的可见 Codex 任务；
- 在规格阶段和最终 Validation 中调用 Claude Code 做只读对抗性审查；
- 由主 Codex 独立核验 Kiro gate 和 Claude 意见后批准并推进阶段；
- 在中断后从一个小型状态账本安全恢复；以及
- 保留现有模型、权限和会话约束。

### 固定工作流合同

1. 主 Codex 任务只调度、核验证据、批准和推进，不直接编写规格、实现任务或执行功能验收。
2. 每个阶段使用独立的 Codex Desktop 任务；阶段返修恢复原任务，不新建重复任务。
3. 阶段工作者调用 cc-sdd 已有 skill，不重新实现 Requirements、Design、Tasks 或 Implementation 方法。
4. Requirements、Design 和 Tasks 只有在原始 Kiro gate、Claude 审查和主 Codex 核验三者一致后才能批准。
5. Implementation 使用独立的 Luna Max 任务，并继续复用 cc-sdd 内置的逐任务实现者、审查者、调试者和完成性核验。
6. 最终 Validation 由新的 Codex 任务唯一负责；Claude 审查其证据，但不无条件重复完整测试。
7. Claude Code 继承用户级默认模型和思考配置，保持 bypass permission，并通过操作系统隔离防止写入真实 worktree。
8. Claude 会话只在同一阶段的最多三轮返修中复用；跨阶段使用新会话和有界阶段档案。
9. Claude 的结论不能直接批准阶段；主 Codex 必须逐项核验，错误意见应记录为已驳回并附证据。

### 本轮实现范围

#### 1. 可安装的 Codex skill

- 在 `tools/cc-sdd/templates/agents/codex-skills/skills/kiro-supervise/` 增加监督 skill、协议、状态 helper、Claude wrapper 和单元测试。
- 复用现有 Codex Skills manifest 的目录复制机制。
- 将真实 manifest 测试从 17 个 skill 更新为 18 个，并验证安装产物。
- 首个版本明确面向提供可见任务管理能力的 Codex Desktop 和 Linux 隔离环境；缺少必要能力时必须 fail closed。

#### 2. 消除重复 Validation

- 为 Codex 版 `/kiro-impl` 增加 `--final-validation run|deferred` 选项，默认值为 `run`。
- 独立使用 `/kiro-impl` 时保持当前行为不变。
- `kiro-supervise` 使用 `deferred`：Implementation 在全部任务完成并通过逐任务核验后返回 `READY_FOR_VALIDATION`，不执行功能级 Validation。
- 新的 Validation 任务成为唯一的 `/kiro-validate-impl` 执行者。

#### 3. 修复状态账本

- 状态中固定 harness schema 版本、目标仓库/worktree 身份、基线、阶段和运行配置。
- 由代码拒绝非法阶段顺序、缺失前置条件和证据不完整的完成请求。
- 历史阶段证据核验已提交快照；当前 `spec.json` 只核验其最新审批语义，不要求字节永远等于早期阶段版本。
- 明确 Implementation 没有额外 Claude 阶段审批，避免状态模型要求不存在的审批产物。
- `complete` 只能在最终 Codex Validation 为 GO、Claude 为 APPROVED 且主 Codex 核验通过后成立。
- 保持小型可变状态账本；本轮不引入事件溯源或通用 reducer。

#### 4. 控制 Claude 审查成本

- 每个阶段由 Codex 准备有界 dossier：目标、变更产物、必要基线、待核验声明和已有命令证据。
- 审查提示词明确 Claude 是独立 reviewer，不运行完整 Kiro 规格流程。
- 同阶段返修复用会话，跨阶段不共享无限增长的上下文。
- 记录每次调用的耗时、轮次、工具调用和 CLI 可提供的用量元数据，并设置明确停止预算。
- 保留用户模型/思考默认值、bypass permission 和必要的只读工具；不以全面禁用 skills、MCP、hooks 或 plugins 作为默认省额度方案。
- Validation 审查优先核验证据，只在证据不足时执行针对性检查。

#### 5. 项目验证扩展点

- 允许项目声明预检、focused test 和最终 validation 命令，并将结果作为阶段证据。
- 通用 skill 不实现 monorepo 依赖图，也不硬编码任何私有仓库的依赖、lock 文件、resolver 或测试布局。

### 非目标

- 通用状态图、graph schema 或可视化编辑器。
- 事件溯源、事件回放、projection、lease 或持久化平台。
- provider-neutral runtime、adapter 框架或多工作流引擎。
- 新建根级 package 或重组 cc-sdd monorepo。
- 重写 cc-sdd 的规格技能或逐任务 Implementation 审查。
- 在公共仓库修复某个下游项目的 `uv.lock` 或测试债务。
- 默认启用监督 loop，或改变现有 17 个 skill 的默认行为。
- merge、release、部署或写入上游仓库。

### 验收标准

- [ ] `--agent codex-skills` 可以安装第 18 个 `kiro-supervise` skill，原有安装测试继续通过。
- [ ] 未显式调用 `kiro-supervise` 时，cc-sdd 默认行为不变。
- [ ] 合成测试覆盖五阶段正常路径、规格返修、Validation 打回 Implementation、Tasks 语义失效、恢复、连续性中断和非法转换。
- [ ] 主任务与五类工作者的职责由协议和测试明确约束。
- [ ] Requirements、Design、Tasks 和 Validation 的 Claude gate 不能自行写批准或推进状态。
- [ ] autonomous `/kiro-impl` 默认仍自动 Validation；监督模式不会重复 Validation。
- [ ] 后续合法更新 `spec.json` 不会使早期已提交阶段产生错误哈希失败。
- [ ] 非法阶段推进和不完整 `complete` 被代码拒绝。
- [ ] Claude 同阶段会话可恢复，跨阶段使用新会话；缺少连续性证据时 fail closed。
- [ ] Claude 调用记录有界 dossier、轮次、耗时、工具/用量观测和停止原因。
- [ ] 真实 worktree 在 Claude 审查前后保持不变；结果不包含凭证、完整会话或思维链。
- [ ] 公共 fixture 不包含私有仓库名、源码、机器路径、真实任务/会话标识或运行记录。

### 贡献边界

- 基于 `gotalab/cc-sdd` 当前 `main` 的个人 fork 开展工作。
- 保留上游署名和 MIT 许可证。
- 使用非默认分支和 draft PR，小步提交并逐项关联验收标准。
- 本 Issue 不授权 merge、release、修改默认分支设置或写入上游。
