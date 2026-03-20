# 《下一阶段优化地图与 Agent 快速接手指南》

## 0. 文档目的

本文解决两个实际问题：

1. 下一阶段还能优化什么，尽可能发散地列出来，避免团队只盯着眼前 bug。
2. 下一次换一个 Agent 接手时，如何让它快速抓住项目本质，而不是傻扫全仓、重走老路。

本文面向当前项目 `ZJU Cat Merge`，但其中大部分方法同样适用于其他移动端 2D Web 游戏。

---

## 1. 下一阶段可优化项总表

下面不是优先级列表，而是尽可能完整的“可优化空间地图”。真正执行时，应再从中挑选一个迭代批次。

### 1.1 核心玩法与手感

- 掉落冷却的具体手感再调
- 瞄准虚线长度与透明度再调
- 生成点高度与红线相对关系微调
- 小球到大球的尺寸梯度再打磨
- 高等级球的重力感 / 存在感再平衡
- 落地弹性、摩擦、空气阻力数值再统一
- 球体相互挤压时的“稳定性阈值”再优化
- 红线危险累计的起始条件再精细化
- 红线衰减速度再调
- 单局平均时长再校准
- 前中后期难度曲线再拉开
- 高分局节奏是否过长需要验证
- 极端盘面是否仍有意外卡死点，需要再做压力回归

### 1.2 生成系统与等级曲线

- 分数解锁阈值是否过快或过慢
- 低端双峰权重是否足够“低级为主、高级偶现”
- 高等级 variant 出现频率是否足够有惊喜
- 同等级去重策略是否还要更强
- `Lv.8` 直出上限是否需要更晚解锁
- `Lv.9-Lv.12` 的达成难度是否过陡
- 合成得分曲线是否能更体现高等级价值
- 是否需要“高等级首次合成奖励”
- 是否要加入“当前局最高猫达成纪录提示”

### 1.3 道具系统

- `Refresh` 的刷新反馈还可以更明显
- `Shake` 的强度是否需要按盘面高度自适应
- `Hammer` 选中态是否还可更清晰
- `Bomb` 外圈击飞与内圈删除半径是否要继续调
- 道具按钮的按压反馈可再增强
- 道具数量展示能否更有层级
- 道具使用后的红线豁免是否要做显式提示
- 道具是否要加入冷却或防误触保护
- 道具之间的策略差异是否足够明显
- 后续是否增加稀有局外道具或活动道具

### 1.4 Combo 与爽感反馈

- Combo 系统目前可进一步正式化
- Combo 文案分段可更鲜明
- 中屏浮字可做主题化版本
- 高连击时的边缘暖闪可继续调强弱
- 分数大跳变时的视觉反馈可更明显
- Header 中分数变化可以做更自然的“加热感”
- 高等级合成可补专属高光反馈
- 连续合成时的音阶系统可更明确
- 失败前压力感和成功时爽感之间的对比还可加强
- 结算页对“本局高光时刻”的表达还不够强

### 1.5 失败机制与结算体验

- 红线危险提示的视觉表现还可更精细
- Game Over 瞬间的节奏可更完整
- 结算页层级还可更清楚
- 结算页字段可补 `Highest Cat / Best Combo / Tools Used`
- 结算页 CTA 可以更传播导向
- 结算页按钮区还可统一视觉语言
- Restart 的结算页交互可再压测
- 失败后是否保留背景盘面模糊层可评估

### 1.6 首页与信息架构

- 首页品牌感还能继续加强
- 首页猫咪主视觉可更有记忆点
- 首页滚动排行榜可更真实、更动态
- 首页说明区可补一句更有传播感的 hook
- 改昵称入口视觉还可更统一
- 设置入口可以从简单弹层升级为完整面板
- 首页到游戏页的切换动效可补
- 首页和游戏页的视觉过渡目前还偏硬切

### 1.7 排行榜、昵称与联网

- 当前排行榜还可从 mock 过渡到真实接口
- 匿名 ID 初始化与昵称持久化可标准化
- 总榜 / 周榜接口结构可提前定型
- 成绩提交时机与字段可继续收敛
- 基础防作弊逻辑需要真正落到服务端
- 排行榜空态、加载态、错误态可继续补完
- 排行榜中的“我的位置”显示可考虑加入
- 结算页和排行榜之间的链路还可以更顺
- 周榜重置策略与服务端时间源要提前定

### 1.8 分享与传播

- 截图分享卡还没有完整落地
- 分享图模板需要正式设计
- 分享图字段优先级要再验证
- 不同战绩档位是否需要不同分享文案
- 分享图背景是否保留当前盘面需要测试
- 分享动线应从结算页一键导出，而不是手动截屏
- 是否要追加“终极大猫达成图”单独模板
- 是否要加入活动期榜单传播图

### 1.9 UI 视觉系统

- DOM HUD 的玻璃质感还可继续统一
- Header 的材质、光晕、渐变还可更细腻
- Tool chip 的阴影和层级可继续优化
- 主色和强调色可以进一步形成稳定体系
- 字体层级可继续统一
- 游戏区与 HUD 的边界感可继续柔化
- 页面整体的“高级独立游戏”气质还可进一步提升
- 图标风格还不完全统一，可做一轮替换
- 移动端小屏设备上的留白需要专项审视

### 1.10 音频与振动

- 音效目前仍可继续系统化
- 不同合成层级的音效层次要补
- Combo 音阶反馈可补全
- 道具音效需要更有辨识度
- Game Over 音效需要更完整
- BGM 与页面氛围的匹配还可继续打磨
- 震动反馈需要分事件等级控制
- 设置中的音频开关应真正接到系统层

### 1.11 移动端体验与兼容

- iPhone 刘海屏安全区适配可继续验证
- Safari 下触摸行为仍需长时回归
- Android 机型的字体与布局适配要专项测试
- 页面恢复前台 / 后台切换后的状态要测
- 低性能手机下的帧率和发热要测
- 超长局时的内存占用要测
- 浏览器缩放、系统字体大小对布局的影响要测

### 1.12 代码架构与工程整理

- Scene 文件仍可能继续拆分
- HUD bridge / DOM HUD / input policy 的边界还可进一步清晰
- Game Over、结果层、排行榜层未来可抽成独立 UI 模块
- 工具系统未来可抽成更完整的 command layer
- 常量和阈值可以集中配置
- 生成权重、等级阈值、半径曲线可以转为数据表
- 当前测试覆盖不错，但仍可补更完整的 UI 状态回归
- 文案层可继续做编码安全治理，避免再出现乱码链路

### 1.13 内容扩展与版本化

- 新猫图 variant 扩展
- 动态资源版本
- 节日皮肤 / 活动主题
- 新道具或限时模式
- 每周挑战
- 主题排行榜赛季化
- 战绩页 / 分享页版本
- 更强的浙大本地化内容

---

## 2. 下一轮建议优先级模型

不要把上面所有点同时做。建议以后都按 4 档分：

### P0：会破坏完整可玩性的

- 卡死
- 输入失效
- 规则错位
- 数据错位
- 关键页面乱码
- Restart / 道具 / 生成链路失效

### P1：直接影响手感和传播的

- 难度曲线
- 红线压力感
- 分数和 Combo 反馈
- 结算页完整度
- 分享链路

### P2：提升完成度和高级感的

- Header 视觉
- 道具视觉
- 首页品牌感
- 排行榜真实联网
- 音频层次

### P3：扩展性和内容丰富度

- 赛季榜
- 新模式
- 皮肤主题
- 活动玩法
- 动态猫资源

---

## 3. 新 Agent 快速接手 SOP

### 3.1 目标

新 Agent 接手时，不应该做的是：

- 全仓无差别扫描
- 从 README 没有结构地乱读到代码
- 不知道项目核心问题就开始修改
- 不知道哪些坑已经踩过又重蹈覆辙

新 Agent 应该在 `10-20 分钟` 内完成上下文建立，并知道：

- 这个项目是什么
- 现在完成到了哪一步
- 当前最脆弱的边界是什么
- 哪些文件是真正核心
- 哪些文档先读，哪些暂时不用碰

### 3.2 推荐阅读顺序

#### 第 1 层：先读项目本质，不读细枝末节

1. [PRD.md](/d:/projects/zjucatmerge/docs/PRD.md)
2. [2026-03-20-zju-cat-merge-design.md](/d:/projects/zjucatmerge/docs/superpowers/specs/2026-03-20-zju-cat-merge-design.md)
3. [2D-Web-Game-VibeCoding-Architecture-and-Debugging-Guide.md](/d:/projects/zjucatmerge/docs/playbook/guides/2D-Web-Game-VibeCoding-Architecture-and-Debugging-Guide.md)

目的：

- 先理解产品目标
- 再理解当前架构原则
- 再理解哪些坑绝不能重犯

#### 第 2 层：再读当前项目的实现边界

4. [TECH_STACK.md](/d:/projects/zjucatmerge/docs/TECH_STACK.md)
5. [FRONTEND_GUIDELINES.md](/d:/projects/zjucatmerge/docs/FRONTEND_GUIDELINES.md)
6. [HUD_AND_TOOLBAR_GUIDELINES.md](/d:/projects/zjucatmerge/docs/HUD_AND_TOOLBAR_GUIDELINES.md)
7. [ASSET_GUIDELINES.md](/d:/projects/zjucatmerge/docs/ASSET_GUIDELINES.md)

目的：

- 知道栈是什么
- 知道 UI 和资源边界是什么
- 避免把项目重新做回错误方向

#### 第 3 层：最后才看 backlog 和模板

8. [VibeCoding-Game-Requirements-Testing-and-Subagent-Workflow.md](/d:/projects/zjucatmerge/docs/playbook/guides/VibeCoding-Game-Requirements-Testing-and-Subagent-Workflow.md)
9. 本文档
10. `docs/playbook/templates/*`

目的：

- 知道未来该怎么继续做
- 知道 debug 和 subagent 协作方法

### 3.3 推荐代码阅读顺序

不要先扫所有文件。建议直接按下面顺序：

1. `src/main.ts`
2. `src/game/bootstrap.ts`
3. `src/game/scenes/GameScene.ts`
4. `src/game/config/cats.ts`
5. `src/game/systems/runState.ts`
6. `src/game/systems/mergeSystem.ts`
7. `src/game/systems/dangerSystem.ts`
8. `src/game/systems/inputPolicy.ts`
9. `src/game/systems/hudActionQueue.ts`
10. `src/game/hud/bridge.ts`
11. `src/game/hud/domHud.ts`

这样读完，项目主脉络基本就清楚了：

- 页面如何挂载
- Scene 如何工作
- 生成规则如何定
- 合成如何定
- 红线怎么定
- 输入怎么流转
- DOM HUD 与 Phaser 怎么通信

### 3.4 推荐测试阅读顺序

如果要快速知道“哪里最容易坏”，先看测试而不是乱猜。

推荐顺序：

1. `tests/game/run-state.test.ts`
2. `tests/game/merge-system.test.ts`
3. `tests/game/danger-system.test.ts`
4. `tests/game/input-policy.test.ts`
5. `tests/game/hud-action-queue.test.ts`
6. `tests/game/dom-hud.test.ts`
7. `tests/smoke/app-start.test.ts`

这组测试基本就把项目最脆的边界暴露出来了。

### 3.5 新 Agent 的第一轮动作，不应该是什么

不应该：

- 一上来就全局搜索所有字符串
- 一上来就大改 UI
- 一上来就重构 Scene
- 一上来就加新功能
- 一上来就把多个问题一起修

应该：

1. 先建立项目心智模型
2. 先问当前任务属于哪一层
3. 先确认相关测试有哪些
4. 先缩小影响面
5. 只改一条边界

### 3.6 新 Agent 接手时必须知道的“项目本质”

这个项目不是“任意一个 Phaser 小游戏”。它有几个本质：

- 玩法本体是 `Suika-like` 的掉落合成
- 物理层必须稳定，表现层必须与物理解耦
- DOM HUD 是为了高级 UI 质感，不是为了替代游戏逻辑
- 当前最危险的耦合点永远是：`输入链、合成事务、DOM HUD -> Scene 命令桥`
- 任何修改都要先问：会不会重新引入卡死、误触、重复消费、编码污染

---

## 4. 下一次交接时建议直接给新 Agent 的“最小包”

建议以后直接给下一位 Agent 这样一份最小输入：

### A. 项目状态摘要

- 当前版本：
- 当前完成度：
- 当前最想做的目标：
- 当前已知问题：
- 本轮绝不能动的边界：

### B. 必读文档

- `docs/PRD.md`
- `docs/superpowers/specs/2026-03-20-zju-cat-merge-design.md`
- `docs/playbook/guides/2D-Web-Game-VibeCoding-Architecture-and-Debugging-Guide.md`
- `docs/playbook/guides/下一阶段优化地图与 Agent 快速接手指南`（即本文）

### C. 必看代码

- `src/game/scenes/GameScene.ts`
- `src/game/systems/runState.ts`
- `src/game/systems/inputPolicy.ts`
- `src/game/hud/domHud.ts`
- `src/game/hud/bridge.ts`

### D. 必跑测试

- `npm test -- tests/game/run-state.test.ts`
- `npm test -- tests/game/merge-system.test.ts`
- `npm test -- tests/game/input-policy.test.ts`
- `npm test -- tests/smoke/app-start.test.ts`
- `npm run build`

这比让它自己扫描全仓高效得多。

---

## 5. 最终原则

未来继续做这个项目时，应遵守下面几条：

1. 先判断当前任务属于哪一层，再动代码
2. 优先读核心文档和核心系统，不要全仓漫游
3. 先看相关测试，再改逻辑
4. 一次只修一个边界，不把多个问题混修
5. 新增跨项目知识，不要继续堆在 `docs/` 根目录，统一沉淀进 `docs/playbook/`

只有这样，这个项目和后续项目才会越做越稳，而不是文档越来越多、上下文越来越乱。
