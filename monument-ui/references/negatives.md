# 禁止词尾巴：固定挂在每次图像提示词末尾

不写尾巴，AI 生成味会立刻回来——它默认会给你霓虹、渐变、玻璃卡、HUD、满屏装饰。

## A. 给图像模型（英文，原样追加）

```
no clutter, no excessive neon, no generic dashboard, no random floating glass
cards, no excessive gradients, no cheap cyberpunk aesthetic, no visual noise,
no meaningless decorative elements, no overloaded HUD, no stock photography
feeling, no template website feeling
```

## 每条为什么在那

| 尾巴 | 挡掉的东西 | 少了它会怎样 |
|---|---|---|
| no clutter | 满屏装饰 | 画面被填满，没有停顿 |
| no excessive neon | 霓虹堆料 | 变成廉价赛博 |
| no generic dashboard | 仪表盘味 | 十二个卡片自己长出来 |
| no random floating glass cards | 玻璃拟态卡片 | 最典型的 AI UI 味 |
| no excessive gradients | 多层渐变 | 一眼就是模板 |
| no cheap cyberpunk aesthetic | 紫蓝霓虹 + 故障 | 高级感直接归零 |
| no visual noise | 粒子、描边、噪点堆叠 | 视觉没有焦点 |
| no meaningless decorative elements | 无意义装饰 | 每个元素都在抢戏 |
| no overloaded HUD | 数据条、刻度线泛滥 | 主角被信息淹没 |
| no stock photography feeling | 图库感 | 像买来的素材，不像作品 |
| no template website feeling | 模板感 | 一眼看穿是套版 |

## 追加一条（按项目挑）

- 要更冷：`no warm color, no golden hour`
- 要更静：`no motion blur, no dynamic action`
- 要更贵：`no plastic, no toy-like material, no CGI look`
- 要更空：`no secondary objects, no background props`

## B. 给代码实现的等价禁令

图像模型的尾巴在代码里没有意义，用这张表：

| 禁止 | 原因 |
|---|---|
| 三层以上 linear-gradient 叠背景 | 模板感的第一来源 |
| `backdrop-filter: blur` 玻璃卡 | AI 生成 UI 味 |
| 彩色大光晕 `box-shadow: 0 0 80px #a0f` | 到处发光 |
| 图标瀑布 / 等宽卡片网格 | 满屏 Dashboard |
| 每个元素都 fade-up 入场 | 动作太多，没有主角 |
| 大圆角 + 模糊 + 描边 三件套 | 2019 年作品集 |
| 同时 >2 种渐变方向 | 视觉噪音 |
| 无意义的装饰性数字 / 刻度线 | 假装专业 |
| 每个区块都顶一行 `letter-spacing: .2em` 的小号大写标签 | 最常见的 AI 落地页结构 |
| 标题里用 `<em>` 斜体衬线强调一个词 | 同上，已经被用烂了 |
| 常驻 `animation: pulse infinite` 的发光 | 强调色失去"激活态"的含义 |
| 状态切换只换 `background-color` | 没有材质和光的变化，开关像色块 |

## C. 判定方法

把页面截图缩到 200px 宽再看。

- 还认得出主体 → 通过
- 只剩一片发光/渐变/卡片 → 装饰在替主体说话，回去改构图

这条比任何审美争论都好用，因为不需要品味，只需要眯眼。
