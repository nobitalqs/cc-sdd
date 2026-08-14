# 当前交接：cc-sdd 监督循环/状态图

> 快照日期：2026-08-14（Asia/Tokyo）
> 状态：已完成中文化并进入 GitHub 交接阶段；以“GitHub 发布状态”一节为准。

## 已确认方向

- 在 `gotalab/cc-sdd` 的 fork 中构建可复用工程，不放入私有消费方仓库。
- 将当前 cc-sdd v3 视为方法所有者，不重新实现其规格 skills、逐任务 Implementation 审查者、调试者或完成性核验器。
- 增加通用监督层：版本化状态图、事件账本、隔离阶段工作者、外部对抗性审查者、证据溯源、合法转换、回放、预算和 adapter。
- 保持面向用户的 Codex 主任务为监督者；每个阶段运行在独立的工作任务/上下文中。
- Spec 和 Validation 工作者继承监督者的 Codex 模型和思考设置。Implementation 可以通过策略选择显式指定的高能力运行配置，但不得作为引擎硬编码常量。
- Claude Code 继承用户配置的模型和思考默认值。工具/权限/会话策略是独立关注点。
- 在配置的修复轮次上限内保持同阶段 Claude 会话连续性；新阶段使用新上下文和有界档案。
- Implementation 完成后必须执行全新的功能验证。成功需要 cc-sdd 验证结果、独立审查批准和监督者核验。
- GitHub 是 ChatGPT 网页端工作的持久协作事实来源：Issue、分支、提交、draft PR 和审查评论。

## 上游实时核验

GitHub 只读检查确认：

| 项目 | 值 |
| --- | --- |
| 仓库 | `gotalab/cc-sdd` |
| 可见性 | 公开 |
| 默认分支 | `main` |
| 基线提交 | `29aee950f4addc36f9aeecb9881c46540e71ecc9` |
| 基线提交日期 | 2026-04-26 |
| 许可证 | MIT |
| 当前架构 | v3 Agent Skills；稳定支持 Claude Code 和 Codex |

这否定了此前“项目已长期停止更新”的假设。创建 fork 分支前应立即重新核验基线。

## GitHub 发布状态

- Fork：`nobitalqs/cc-sdd`
- 工作分支：`agent/supervised-loop-graph-bootstrap`
- Bootstrap Issue：`https://github.com/nobitalqs/cc-sdd/issues/1`
- Draft PR：尚未创建。
- 上游写入：无。

## 私有原型保留的脱敏事实

- 原型是一套运行中的、被 Git 忽略的本地 harness，因此识别已审查快照的是其文件摘要，而不是消费方仓库提交。
- 原型包含状态 helper 和 Claude 审查 wrapper 的单元测试。
- 仅为验证恢复和终态确实存在，检查过一条已完成 trace 和一条在 Implementation 阶段受阻的 trace。
- 本交接不包含任何真实 trace、提示词、结果、会话/任务标识、功能名称、源码片段或本地路径。
- 原型的主要结构缺陷记录在 `harness-v1-decision-graph.md`。

## 已为下一环境准备的文档

1. `harness-v1-decision-graph.md` — 重建的行为、权限、转换、失效和已知缺陷。
2. `migration-manifest.md` — 快照摘要、范围边界、目标模块、迁移顺序、风险和发布检查清单。
3. `bootstrap-issue.md` — 面向架构讨论和里程碑 1 的脱敏 Issue 草案。
4. `chatgpt-kickoff.md` — 面向具有 GitHub 访问能力的 ChatGPT 网页会话的首轮提示词。
5. 本交接文档 — 当前决策和外部写入边界。

## 建议的下一步

1. 人工复核这五份文件的产品意图和公开披露范围。
2. 重新核验上游 `main` 和已认证 GitHub 账号。
3. 仅在明确获得外部写入授权后：fork `gotalab/cc-sdd`、保留 upstream 关联，并创建非默认 bootstrap 分支。
4. 提交脱敏档案，创建 Bootstrap Issue，并创建仅包含架构/回放脚手架的 draft PR。
5. 使用 `chatgpt-kickoff.md` 启动 ChatGPT 网页会话；要求它在提出代码变更前读取 Issue 和 draft PR。

## 外部写入边界

当前已授权：

- 本地只读调查；
- 本地创建和验证脱敏档案；
- 创建或复用 `gotalab/cc-sdd` 的个人 fork；
- 在 fork 建立非默认分支并提交本档案；
- 创建一个中文 Bootstrap Issue 和一个 draft PR。

仍未授权：

- 修改上游；
- 合并或发布；
- 更改默认分支、分支保护或仓库设置；
- 向授权范围外创建评论、标签、release 或其他 GitHub 对象；以及
- 修改私有消费方仓库或其运行中 harness。

## 恢复检查清单

新会话接管时应报告：

- 实际观察到的 upstream HEAD；
- 目标 fork/仓库和活动分支；
- 已存在的 Issue 和 draft PR 链接；
- 正在讨论的 graph/policy/schema 版本；
- 最近一次验收证据摘要；
- 当前里程碑、阻塞项和下一合法动作；以及
- 未有私有标识进入公开历史的确认。
