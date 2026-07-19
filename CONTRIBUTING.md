# 贡献指南

AgentSkill 接受来自真实工作流的 Skill、脚本、测试和文档改进。开始写代码前，先把问题、使用者和完成标准说清楚。

## 可以贡献什么

- 一个已经在真实任务中跑通过的 Agent Skill。
- 现有 Skill 的错误修复、兼容性更新或安全改进。
- 能重复执行的验证脚本、测试或示例。
- README、安装说明和边界条件修正。

大型改动建议先创建 [Skill request](https://github.com/rfdiosuao/AgentSkill/issues/new?template=skill-request.yml)。

## 推荐目录

```text
my-skill/
├── SKILL.md
├── README.md              # 需要独立使用文档时添加
├── references/            # 深入资料和运行边界
├── scripts/               # 可重复执行的辅助脚本
├── tests/                 # 自动化验证
└── agents/openai.yaml     # 需要 Agent 元数据时添加
```

`SKILL.md` 是必需入口。不要为了看起来完整而创建空目录或空文档。

## 提交流程

1. Fork 仓库并从 `main` 创建短生命周期分支。
2. 在真实输入上运行 Skill，记录可复现的成功条件和失败边界。
3. 补齐必要的脚本、测试、参考资料和安装说明。
4. 检查仓库中没有密钥、Cookie、个人路径、内网地址和占位符。
5. 运行对应测试与 `git diff --check`。
6. 创建 PR，说明问题、改动、验证方式和剩余限制。

## README 变更

修改主 README 时运行：

```bash
python craft-repository-readme/scripts/validate_readme.py \
  --repo-root . \
  --readme README.md \
  --require-logo --require-badges --require-hero --require-license
```

## 发布包

- 不要把 `node_modules`、嵌套 `.git`、真实配置文件或构建缓存打进归档。
- 发布包必须能对应到明确的源码版本。
- ClawHub 发布项使用发布者前缀，避免与同名 Skill 混淆。
- 新版本先做安全检查，再更新下载入口与变更说明。

## PR 检查清单

- [ ] 名称、描述和触发场景清楚。
- [ ] 所有命令、链接和功能声明已核验。
- [ ] 权限、依赖、风险和停止条件已说明。
- [ ] 测试或人工验证步骤可以复现。
- [ ] 没有敏感凭据、个人路径和无关文件。
- [ ] README 与实际目录结构一致。
