# 监督 Loop 最小移植计划

> 发布状态：实现前计划。目标是忠实移植并稳定现有 loop，不从私有原型派生通用框架。

## 已核验事实

上游基线于 2026-08-14 重新核验：

- 仓库：`gotalab/cc-sdd`
- 默认分支：`main`
- 提交：`29aee950f4addc36f9aeecb9881c46540e71ecc9`
- 许可证：MIT
- 架构：cc-sdd v3 Agent Skills

当前 Codex Skills manifest 会把整个 `templates/agents/codex-skills/skills` 目录复制到 `.agents/skills`，因此增加一个 skill 不需要新的 CLI 子命令或根级 package。真实 manifest 测试目前明确断言安装 17 个 skill。

当前 Codex `/kiro-impl` 的 autonomous mode 在所有任务完成后自动执行 `/kiro-validate-impl`；这与现有监督 loop 的独立 Validation 任务重复。

## 私有来源快照

以下摘要只用于确认被审查的原型版本，不授权复制私有运行数据：

| 逻辑来源 | SHA-256 |
| --- | --- |
| `kiro-supervise/SKILL.md` | `44c3feb624d9b50dbbb943229c1a69cac03cdbfbb3b4467e0633b9181878e757` |
| `references/orchestration-protocol.md` | `ef7ecbc3d830ce76aa91feab37cfbbf2a10593d76ea0ba3ed2282a249cd04e7e` |
| `scripts/claude_stage_review.py` | `6b0c91024100555b31bcb79eb61bd456890964f7d226a6b30b18b0e9f1024647` |
| `scripts/supervisor_state.py` | `ceb90f5dc80abd278baedbbc03612c38d350b57f890ac3404f8cd2649ec3cf7a` |
| `scripts/tests/test_claude_stage_review.py` | `3a6dc473b5308a80ac62f863ada69e1f3ca192f5198b5b2eeff3e97e0f8b7f0a` |
| `scripts/tests/test_supervisor_state.py` | `85c572757cee2f72f4d5f6305b51ef86befb7f335563d2654e6975ab8671b060` |

公共实现可以迁移通用行为和经过脱敏的代码结构，但不得包含真实 trace、提示词结果、仓库名称、机器路径、任务/会话标识或凭证。

## 最小仓库边界

```text
tools/cc-sdd/
  templates/agents/codex-skills/skills/
    kiro-supervise/
      SKILL.md
      agents/openai.yaml
      references/orchestration-protocol.md
      scripts/claude_stage_review.py
      scripts/supervisor_state.py
      scripts/tests/
  templates/agents/codex-skills/skills/kiro-impl/SKILL.md
  test/realManifestCodexSkills.test.ts
```

必要时可在 `kiro-supervise` 内增加小型模板或 JSON schema，但不得建立 `packages/loop-*`、通用 adapter 目录或新的持久化层。

## 移植与修复清单

| 能力 | 处理方式 | 验证重点 |
| --- | --- | --- |
| 主监督者与阶段工作者分离 | 保留并脱敏 | 主任务不写阶段产物；工作者不能批准/推进 |
| 每阶段可见 Codex 任务 | 保留 | 新阶段新任务；返修恢复同一任务 |
| Kiro gate 后 Claude gate | 保留 | Claude 是 reviewer，不运行另一套 Kiro loop |
| Codex 独立复核 | 保留 | Claude 错误 finding 可由证据驳回 |
| 三轮返修上限 | 保留为当前合同 | 第 2/3 轮恢复同一 Codex/Claude 上下文 |
| Codex 模型策略 | 保留 | Spec/Validation 继承；Implementation Luna Max |
| Claude 用户默认配置 | 保留 | wrapper 不传模型/思考覆盖参数 |
| bypass + 文件系统隔离 | 保留 | 审查前后真实 worktree 摘要一致 |
| 重复最终 Validation | 修复 | 默认 `/kiro-impl` 不变；监督模式 deferred |
| 可变 `spec.json` 哈希 | 修复 | 历史提交快照与当前批准语义分开核验 |
| 阶段顺序 | 修复 | 非法前进、回退和跳阶段由代码拒绝 |
| Implementation 状态语义 | 修复 | 不要求额外 Claude phase approval |
| `complete` | 修复 | 终态证据不足时拒绝 |
| Claude 上下文成本 | 修复 | dossier、阶段 session 边界、预算、用量记录 |
| 私有 resolver/test/lock 逻辑 | 排除 | 只提供项目命令扩展点 |

## 实现顺序

### 提交 1：安装骨架

- 增加最小 `kiro-supervise` skill 目录和说明。
- 更新真实 manifest 测试，断言第 18 个 skill 被正确安装。
- 明确仅显式调用生效，缺少 Codex Desktop 任务能力、Claude CLI 或隔离能力时 fail closed。

### 提交 2：Validation 职责唯一化

- 在 Codex `/kiro-impl` 中增加 `--final-validation run|deferred`。
- 默认保持 `run`，补充默认兼容测试。
- `deferred` 只返回 `READY_FOR_VALIDATION`，由监督 skill 启动新的 Validation 任务。

### 提交 3：状态账本

- 迁移并脱敏 `supervisor_state.py`。
- 修复阶段前置条件、当前/历史 `spec.json` 语义、Implementation 表示和终态检查。
- 保留 schema 版本和原子写入；不实现事件账本。

### 提交 4：Claude reviewer

- 迁移并脱敏只读 wrapper。
- 保留用户默认模型/思考、bypass permission、编辑工具拒绝和操作系统级隔离。
- 增加有界 dossier、阶段内 session 恢复、连续性中断、预算、用量/耗时观测和敏感信息清理。
- 明确 Claude 不运行完整 Kiro 流程。

### 提交 5：端到端监督协议

- 完成 `SKILL.md` 和 orchestration protocol。
- 串联五阶段、三方审批、Validation 打回和恢复。
- 增加完全合成的端到端状态测试和安装验证。

## 测试矩阵

### 安装与兼容

- Codex Skills 安装从 17 个变为 18 个。
- 新 skill 的 `SKILL.md`、协议、脚本和配置均被复制。
- 不调用 `kiro-supervise` 时，原有 17 个 skill 行为不变。
- `/kiro-impl` 未指定新参数时仍自动执行最终 Validation。
- `--final-validation deferred` 不执行最终 Validation，并返回精确 handoff。

### 状态账本

- 正常五阶段顺序。
- 跳过前置阶段、重复批准、证据缺失和不完整完成均被拒绝。
- 后续更新 `spec.json` 不会破坏早期已提交阶段的恢复核验。
- Requirements、Design 或 Tasks 语义变更产生预期下游失效。
- Implementation 不要求 Claude phase approval。
- Validation GO/NO-GO、打回 Implementation、打回 Tasks 和三轮上限。
- 监督者接管和任务/session 连续性中断。

### Claude wrapper

- 不传 `--model` 或思考强度覆盖参数。
- bypass permission 与只读隔离同时存在。
- 编辑真实 worktree 的尝试失败，审查前后摘要一致。
- 第 2/3 轮必须恢复 session 或明确记录连续性中断。
- dossier 大小、轮次、耗时和工具/用量预算到达上限时返回 `BLOCKED`，不能误判 APPROVED。
- 输出 schema、session ID 和敏感信息清理失败时 fail closed。

### 端到端合成场景

- 一次通过。
- Requirements、Design、Tasks 各一轮返修。
- Claude finding 被 Codex 以源码/命令证据正确驳回。
- Implementation 受阻。
- Validation 发现实现缺陷并返回 Implementation。
- Validation 发现 Tasks 语义问题并使下游失效。
- 中断后恢复成功和恢复证据不足。

这些测试验证固定 loop，不要求事件回放或任意 graph 配置。

## 项目扩展点

公共 skill 只定义项目命令契约，例如：

- 预检命令；
- 阶段 focused checks；
- 最终 Validation 命令；
- 可选的工作区清洁度例外声明。

某个 monorepo 如何从变更文件计算 owning project、反向依赖和 full-suite 升级规则，应由该项目自己的配置或后续独立能力负责。类似 `uv.lock` 的私有依赖问题也应在消费方修复，不能成为 cc-sdd 内核逻辑。

## 明确延期

- graph/schema/reducer；
- event sourcing、replay 和 projection；
- provider-neutral adapter；
- SQLite/JSONL 运行存储、lease 和 migration 平台；
- 通用 affected-test 图；
- 遥测平台和历史 eval 系统；以及
- 可视化工作流编辑器。

若未来需要这些能力，应根据实际多个 loop 的重复证据创建新的 Issue，不能让它们阻塞当前稳定化工作。

## 发布检查

- [ ] 重新核验上游 HEAD 和 fork 分支基线。
- [ ] 保留 MIT 许可证和上游署名。
- [ ] 扫描私有名称、绝对路径、凭证形态和真实任务/session 标识。
- [ ] 只使用合成 fixture。
- [ ] 每个提交对应明确验收标准并通过相关测试。
- [ ] PR 保持 draft，直到实现和验证完成。
- [ ] 未经单独授权不 merge、不 release、不写上游、不修改默认分支设置。
