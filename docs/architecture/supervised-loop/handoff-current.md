# 当前交接：cc-sdd Codex—Claude 监督循环

> 快照日期：2026-08-14（Asia/Tokyo）
>
> 状态：已完成网页版第一轮只读审查；产品范围已重新收缩，等待按 Bootstrap Issue 授权实现。

## 当前结论

目标不是构建通用状态图或跨 provider 协议，而是将已经实际运行的线性监督 loop 移植为 cc-sdd fork 中可安装、显式调用的 Codex skill，并修复运行中已经确认的问题。

cc-sdd v3 继续拥有 Requirements、Design、Tasks、逐任务 Implementation 审查/调试、完成性核验和功能级 Validation。新增 `kiro-supervise` 只负责：

- 主 Codex 监督与阶段推进；
- 隔离的阶段任务；
- Claude Code 第二模型审查 gate；
- 主 Codex 独立复核；
- 有界返修、恢复和运行证据；以及
- 监督模式下 Validation 的唯一职责分配。

通用 graph/reducer、事件溯源、provider adapter、storage/lease 和 monorepo 测试影响引擎全部延期，且不构成本轮前置条件。

## 已确认的关键决策

1. `kiro-supervise` 作为第 18 个 Codex skill 通过现有 manifest 安装，不建立根级新 package。
2. 主 Codex 不直接生成规格或实现；每阶段使用新的可见 Codex Desktop 任务。
3. Requirements、Design、Tasks 和 Validation 接受 Claude 只读对抗性审查；Implementation 继续使用 cc-sdd 内置逐任务审查，不增加重复阶段 reviewer。
4. 主 Codex 对 Claude finding 逐项核验，并拥有唯一阶段批准权。
5. Spec 和 Validation 工作者继承监督者的 Codex 模型/思考配置；Implementation 使用 Luna Max 独立任务。
6. Claude 继承用户级默认模型和思考配置，保持 bypass permission；真实 worktree 由操作系统级只读隔离保护。
7. 同阶段最多三轮并复用 Claude session；跨阶段使用新 session 和有界 dossier。
8. Codex 版 `/kiro-impl` 增加默认兼容的 `--final-validation run|deferred`；监督 loop 使用 `deferred`，由新 Validation 任务唯一执行 `/kiro-validate-impl`。
9. 状态只采用小型可恢复账本；修复已知语义缺陷，但不升级为事件系统。

## 实时核验

| 项目 | 值 |
| --- | --- |
| 上游仓库 | `gotalab/cc-sdd` |
| 上游默认分支 | `main` |
| 已核验基线 | `29aee950f4addc36f9aeecb9881c46540e71ecc9` |
| 基线核验日期 | 2026-08-14 |
| Fork | `nobitalqs/cc-sdd` |
| 当前工作分支 | `agent/supervised-loop-graph-bootstrap` |
| Bootstrap Issue | `https://github.com/nobitalqs/cc-sdd/issues/1` |
| Draft PR | `https://github.com/nobitalqs/cc-sdd/pull/2` |
| 默认分支保护 | `protect-main` ruleset 已启用；禁止删除和 force push，并要求通过 PR 合入 |
| 上游写入 | 无 |

当前分支名保留了早期 `graph` 探索字样，仅作为已有 draft PR 的历史分支名；它不再定义产品范围。后续实现提交不得据此恢复 graph 工程。

## 已确认的问题

- autonomous `/kiro-impl` 会自动运行 `/kiro-validate-impl`，而现有 harness 随后又启动新的 Validation 任务，造成重复验证。
- 多个阶段将持续变化的 `spec.json` 记录为不可变当前产物，后续合法批准会造成早期阶段恢复核验误报。
- 状态 helper 的阶段顺序主要依赖文档，`complete` 没有完整派生终态条件。
- Implementation 的协议语义是“无额外阶段审批”，但状态表示仍可能要求与其他阶段相同的审批产物。
- Claude reviewer 没有有界 dossier 和强制预算，且加载较宽的仓库/工具上下文，容易重复发现并消耗额度。
- 下游 `uv.lock` 和受影响测试选择属于消费方配置/债务，不能硬编码进公共 cc-sdd skill。

## 文档索引

1. `current-loop-contract.md`：现有 loop 的角色、阶段、gate、会话和模型合同。
2. `porting-plan.md`：最小仓库落点、修复项、测试矩阵和提交顺序。
3. `bootstrap-issue.md`：Issue #1 的中文产品与验收合同。
4. `chatgpt-kickoff.md`：网页版 ChatGPT 的下一轮只读/实现交接提示词。
5. 本文：当前外部状态、结论和权限边界。

## 下一步

1. 使用更新后的 Issue #1 和 draft PR #2 重新进行一次范围核验。
2. 明确授权实现后，先增加第 18 个 skill 的安装骨架和失败测试。
3. 按 `porting-plan.md` 的小步提交顺序移植 loop 并修复已知问题。
4. 保持 PR 为 draft；每个提交报告测试、验收标准和剩余风险。

## 权限边界

当前文档更新不授权：

- 修改私有消费方仓库或运行中 harness；
- merge、release 或部署；
- 修改默认分支或 ruleset；
- 写入 `gotalab/cc-sdd` 上游；
- 将任务扩展为 graph/reducer、事件平台或 provider runtime；以及
- 公开真实运行 trace、提示词、仓库源码、机器路径、任务/会话标识或凭证。

任何实现性提交都需要单独的明确授权。
