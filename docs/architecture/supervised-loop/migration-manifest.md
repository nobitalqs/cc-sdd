# 监督循环/状态图迁移清单

> 发布状态：草案。提交到任何公开仓库前必须复核。

## 快照身份

来源是一套运行中的私有集成，而不是可重现的 release。它所在仓库的提交无法标识这套 harness，因为 harness 目录被 Git 忽略，并由多个本地 worktree 共享。以下文件摘要是本迁移档案所依据的权威来源快照：

| 逻辑来源 | SHA-256 |
| --- | --- |
| `kiro-supervise/SKILL.md` | `44c3feb624d9b50dbbb943229c1a69cac03cdbfbb3b4467e0633b9181878e757` |
| `kiro-supervise/references/orchestration-protocol.md` | `ef7ecbc3d830ce76aa91feab37cfbbf2a10593d76ea0ba3ed2282a249cd04e7e` |
| `kiro-supervise/scripts/claude_stage_review.py` | `6b0c91024100555b31bcb79eb61bd456890964f7d226a6b30b18b0e9f1024647` |
| `kiro-supervise/scripts/supervisor_state.py` | `ceb90f5dc80abd278baedbbc03612c38d350b57f890ac3404f8cd2649ec3cf7a` |
| `kiro-supervise/scripts/tests/test_claude_stage_review.py` | `3a6dc473b5308a80ac62f863ada69e1f3ca192f5198b5b2eeff3e97e0f8b7f0a` |
| `kiro-supervise/scripts/tests/test_supervisor_state.py` | `85c572757cee2f72f4d5f6305b51ef86befb7f335563d2654e6975ab8671b060` |

上游基线已于 2026-08-14 通过只读方式核验：

- 仓库：`gotalab/cc-sdd`；
- 默认分支：`main`；
- 基线提交：`29aee950f4addc36f9aeecb9881c46540e71ecc9`；
- 许可证：MIT；以及
- 架构：v3 Agent Skills，稳定支持 Codex 和 Claude Code，自主执行逐任务实现审查，并提供独立功能验证。

## 迁移对象

可复用的产品不是某个私有仓库的 skill，而是一个由策略驱动的协调层，具备以下能力：

- 明确授权和外部写入边界；
- 版本化的阶段有向图和合法转换；
- 隔离的工作者上下文和持久化监督者投影；
- 与 provider 无关的审查者和结构化结论；
- 有界共识/修复循环；
- 不可变证据溯源；
- 中断安全的恢复和显式连续性中断；
- 失效传播；
- 故障分类、预算、指标、回放和评估；以及
- 面向 cc-sdd、Codex Desktop、Claude Code CLI、Git 和项目特定测试选择的 adapter。

## 保留、重写、适配与排除

| 来源概念 | 处理方式 | 原因 |
| --- | --- | --- |
| 监督者/工作者/审查者权限分离 | 保留 | 核心安全和治理不变量 |
| 每阶段一个可见工作者上下文 | 适配 | 表达为执行 provider 的 capability；并非所有宿主都提供可见任务 |
| 外部审查前先运行原始 cc-sdd gate | 保留 | 避免取代上游方法论 |
| 修复时复用同一阶段的工作者/审查会话 | 保留 | 保持有界上下文和证据连续性 |
| 阶段之间使用全新上下文 | 适配 | 使用有界档案和可配置隔离策略 |
| 三轮共识/修复上限 | 策略化 | 作为实用默认值，而非引擎硬编码常量 |
| 本地 JSON 快照 | 重写 | 替换为追加式事件和可重建投影 |
| 产物/报告/提交证据 | 重写 | 类型化不可变证据引用；可变账本属于投影 |
| 硬编码阶段列表和结论名称 | 重写 | 加载版本化状态图/策略定义 |
| 硬编码 Codex/Claude 模型 | Adapter/策略 | 继承用户默认值或冻结运行策略，但不与引擎耦合 |
| Claude CLI 沙箱 wrapper | 适配 | 提供 capability 和隔离声明的 provider adapter |
| 私有 resolver、命名、测试布局和 lock 工作流 | 从内核排除 | 属于下游 adapter/plugin 的职责 |
| 真实运行状态、提示词、会话记录和报告 | 排除 | 属于私密内容且没有迁移必要；改用合成回放 fixture |

## 建议的仓库边界

以下结构用于讨论，不要求在第一个 PR 中完成 monorepo 重组。

```text
packages/
  loop-core/              # 事件类型、reducer、合法转换、投影
  loop-policy/            # 状态图 schema、节点契约、预算、失效规则
  evidence/               # 不可变引用、哈希、溯源、脱敏
  adapters/
    cc-sdd/               # 调用现有 skills 并映射结果
    codex/                # 任务/会话 capability
    claude-code/          # 只读对抗性审查者
    git/                  # workspace 身份、提交、diff、清洁度
  test-impact/            # 可选的受影响范围 provider 契约
schemas/                  # 版本化 event、graph、verdict、evidence schema
fixtures/replay/          # 完全合成的事件流和 adapter 结果
docs/architecture/        # 领域模型、ADR、威胁模型、运行文档
```

核心领域语言：

- **状态图定义**：不可变且版本化的节点、边、前置条件、失效规则和终态不变量。
- **运行**：一次状态图执行，具有冻结的策略和授权。
- **事件**：reducer 接受的不可变事实。
- **投影**：由事件派生、可以重建的当前状态。
- **节点尝试**：状态图某个节点的一次有界执行。
- **Gate 结果**：方法或审查者产生的结构化结果。
- **证据引用**：以摘要寻址、包含生产者和命令溯源的不可变证明。
- **连续性中断**：显式替换预期的执行或审查上下文。
- **Capability**：adapter 可以安全执行的能力，包括隔离和外部写入。
- **预算**：允许的 token、工具调用、耗时、重试和测试范围。

## 迁移顺序

### M0 — 固化语义与合成回放语料

- 提交决策图和领域词汇表。
- 为正常路径、审查修复、审查会话连续性中断、失效传播、实现受阻、验证打回和非法转换建立合成事件流。
- 将当前 v1 行为记录为兼容性断言，同时明确不应保留的已知缺陷。

### M1 — 版本化状态图内核

- 增加 graph/event/evidence schema。
- 实现纯函数、确定性的 reducer 和合法后续动作查询。
- 从证据不变量派生终态完成。
- 通过配置和 adapter 表达现有线性 cc-sdd 流程。
- 默认不改变当前已安装工作流的行为。

### M2 — 持久化运行能力

- 增加追加式存储、原子追加、投影重建、schema migration、lease 和崩溃恢复。
- 固定 graph、policy、adapter、prompt 和运行配置选择的元数据。
- 增加脱敏运行事件和稳定故障分类。

### M3 — 审查 provider 契约

- 将 Claude Code 调用抽取到审查者接口之后。
- 声明文件系统、网络和工具 capability，而不是隐式假设。
- 支持阶段档案、阶段内会话复用、连续性中断和可强制执行的预算。
- 除非运行策略显式覆盖，否则保留用户配置的 Claude 模型和思考默认值。

### M4 — 验证与 monorepo 测试影响

- 保留 `/kiro-validate-impl` 作为功能级收尾 gate。
- 增加 provider 契约，将修改文件映射到所属项目、反向依赖方和风险覆盖项。
- 表达 focused、affected 和 full-suite 三层证据。
- 在昂贵的审查/测试循环前检测过期的依赖 lock 生成物。

### M5 — 演进循环

- 记录节点耗时、审查用量、重试次数、故障类别、测试范围和误报裁决指标。
- 将脱敏失败运行转化为回放/eval 用例。
- 要求策略变更在发布前通过历史语料。

## 不可妥协的不变量

1. 上游 cc-sdd 继续负责规格生成和逐任务实现方法论。
2. 状态图引擎不得伪造方法结果或审查批准。
3. 阶段不得自我批准；审查输出不得直接推进状态图。
4. 历史证据不可变；可变批准/readiness 文档属于投影。
5. 非法转换和不完整终态必须由代码拒绝。
6. 恢复的上下文必须匹配已记录身份，否则必须产生连续性中断事件。
7. 模型和思考强度继承必须与工具、权限、plugin、hook 或 MCP 策略分离。
8. 除非运行授权明确允许目标和操作，否则拒绝外部写入。
9. 私有仓库事实不得进入公开 fixture、Issue、PR 或提示词。

## 需要管理的风险

- 上游 v3 已改变问题形态；大规模 fork 可能演变成昂贵的平行产品。应从薄内核和 adapter 开始。
- 将每个阶段都视为一次模型会话可能重复上游审查并增加成本。每个 gate 必须有且只有一个职责所有者。
- Provider 会话不是持久化事实。事件和证据必须足以让全新的 provider 上下文恢复运行。
- 在 monorepo 每一轮都执行完整测试集不可扩展。测试范围应由证据驱动，并有显式升级规则。
- Bypass permission 不等于隔离。仍需审查者 capability 声明和操作系统级约束。

## 发布检查清单

- [ ] 将所有仓库占位符替换为目标 fork 坐标。
- [ ] 创建分支前重新核验上游基线。
- [ ] 确认保留署名和 MIT 许可证。
- [ ] 运行私有名称和绝对路径扫描。
- [ ] 仅使用合成 fixture。
- [ ] 实现前先创建 Bootstrap Issue。
- [ ] 使用非默认分支，并在架构审查期间保持 draft PR。
- [ ] 在获得单独授权前，不得 push、创建 Issue 或创建 PR。
