# RWR 参数查询器

这是一个用于浏览和对比 Running With Rifles DLC 数据的纯前端静态工具。页面可以查询枪械参数、载具参数、地图信息、地图设施点位、载具模型和太平洋玩家统计，并支持卡片浏览、搜索、详情弹窗、双对象对比、对比结果图片分享、索敌优先级计算、玩家统计排序、生成带设施图标的地图视图，以及在独立页面中查看 GLB 模型。

项目没有后端，GitHub Pages 直接发布静态文件。浏览器加载 `index.html` 后引用 `scripts/index.js`，再通过 `fetch()` 读取 `data/`、`maps/` 和 `model/` 目录中的 JSON/JSONL 文件，并在前端完成渲染和交互。`scripts/index.js` 由 `ts/index.ts` 编译生成，开发时优先修改 TypeScript 源文件。

本地推荐运行方式：

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

然后访问：

```text
http://127.0.0.1:8765/index.html
```

## 当前数据规模

当前数据大致为：

```text
枪械数据      161 条，来源 csv/weapons.csv，发布到 data/weapons.json
载具数据       34 条，来源 csv/vehicles.csv，发布到 data/vehicles.json
地图摘要       20 条，保存在 data/maps.json
地图点位文件   20 个，保存在 maps/<地图名>/map-data.json
地图点位     3054 个，按阵营和视图状态分组
模型数据       70 条，保存在 model/models.json，模型文件保存在 model/<安全英文id>/
玩家数据        由 GitHub Actions 每 12 小时从 RWR 官方统计页更新到 data/rwr-players-pacific.json
玩家哈希元数据  由 GitHub Actions 同步生成 data/rwr-players-pacific.meta.json
```

## 项目结构

```text
.
├── index.html                    页面入口，保留 HTML、CSS，并引用 scripts/index.js
├── sw.js                         Service Worker，负责静态资源缓存和哈希校验
├── ico.webp                      网页图标
├── splash.webp                   首页顶部操作容器左侧的品牌图
├── update-assets-and-upload.bat  编译 TypeScript、更新数据、刷新资源清单并上传的脚本
├── README.md                     当前说明文档，UTF-8 no BOM 编码
├── ts/
│   ├── index.ts                  主页面前端逻辑源码
│   ├── package.json              TypeScript 构建脚本和开发依赖
│   ├── package-lock.json         TypeScript 依赖锁定文件
│   └── tsconfig.json             TypeScript 编译配置，输出到 scripts/
├── scripts/
│   ├── index.js                  由 ts/index.ts 编译生成的浏览器运行时代码
│   ├── sync-csv-json.js          CSV 和 JSON 同步脚本
│   ├── build-asset-manifest.js   生成 data/asset-manifest.json 的脚本
│   ├── convert_png_to_webp.py    PNG 转 WebP 的辅助脚本
│   └── fetch-rwr-players.py      抓取太平洋玩家统计并生成静态 JSONL
├── .github/workflows/
│   └── fetch-rwr-players.yml     每 12 小时更新玩家统计的 GitHub Actions 工作流
├── csv/
│   ├── weapons.csv               枪械源数据，开发时主要编辑它
│   └── vehicles.csv              载具源数据，开发时主要编辑它
├── data/
│   ├── weapons.json              枪械发布数据，由 csv/weapons.csv 生成
│   ├── vehicles.json             载具发布数据，由 csv/vehicles.csv 生成
│   ├── rwr-players-pacific.json  太平洋玩家统计快照，由 GitHub Actions 更新
│   ├── rwr-players-pacific.meta.json  玩家统计快照哈希元数据，由 GitHub Actions 更新
│   ├── maps.json                 地图摘要数据
│   └── asset-manifest.json       静态资源 SHA-256 哈希清单，由脚本生成
├── maps/
│   └── <地图名>/
│       ├── map-data.json         单张地图的设施点位数据
│       └── map*.webp             地图图片，可能按阵营区分
├── model/
│   ├── models.json               模型查询清单，网页运行时读取它
│   └── <安全英文id>/
│       ├── *.glb                 网页实际加载的 GLB 模型
│       └── *.blend               源文件归档，网页不直接渲染
├── maps_textures/                地图叠加视图、载具卡片和模型查询共用的设施/载具图标
└── weapons_textures/             枪械卡片和详情使用的图标
```

根目录保留 `.gitignore` 和 `sw.js`：`.gitignore` 需要在仓库根目录生效，`sw.js` 需要留在根目录以保持 Service Worker 作用域覆盖整站。编码和换行约定记录在 `AGENTS.md`。TypeScript 相关的 npm 配置集中放在 `ts/`，避免根目录继续堆放构建配置文件。

## 数据维护方式

项目现在采用“CSV 是源数据，JSON 是发布产物”的流程。

开发者修改枪械和载具数据时，主要编辑：

```text
csv/weapons.csv
csv/vehicles.csv
```

网页运行时读取：

```text
data/weapons.json
data/vehicles.json
data/maps.json
data/rwr-players-pacific.json
data/rwr-players-pacific.meta.json
model/models.json
maps/<地图名>/map-data.json
```

这样做的原因是：CSV 更适合人工增删改查，Excel 或表格编辑器可以直接筛选、排序、批量编辑；JSON 更适合网页读取，结构稳定，浏览器可以直接解析。

不建议手工编辑 `data/weapons.json` 和 `data/vehicles.json`，因为下次执行 CSV 同步时会用 CSV 重新生成它们。

## 上传脚本流程

点击 `update-assets-and-upload.bat` 时，当前流程是：

```text
1. 如缺少依赖，执行 cmd /c npm --prefix ts install
2. cmd /c npm --prefix ts run build:ts
3. node scripts/sync-csv-json.js csv-to-json
4. node scripts/build-asset-manifest.js
5. git add .
6. git fetch origin main，用远端状态判断提交类型
7. git commit（如暂存文件包含远端不存在的路径，提交信息为“新增文件”；否则为“功能增加或修复”）
8. 再次 git fetch origin main
9. 如果远端 `origin/main` 已经包含在本地历史中，直接进入推送前重建
10. 如果远端有新提交，执行 `git merge --no-ff --no-commit origin/main`，先把远端历史和文件合并到本地
11. 如果只遇到已知生成物冲突，自动处理：`data/asset-manifest.json` 保留本地并稍后重建，玩家 JSONL 和玩家元数据采用远端 GitHub Actions 版本
12. 再次编译 TypeScript 并刷新 data/asset-manifest.json
13. 提交远端合并或重建后的变化，提交信息同样按远端是否已有文件判断
14. git push
```

CSV 同步步骤会读取：

```text
csv/weapons.csv
csv/vehicles.csv
```

并生成：

```text
data/weapons.json
data/vehicles.json
```

如果 CSV 转换后的 JSON 内容和现有 JSON 完全一致，脚本会输出 `Unchanged`，不会重写 JSON 文件。因此对应文件的 SHA-256 哈希不会变化，也不会让用户浏览器重新请求没有变化的数据资源。

TypeScript 编译步骤会读取 `ts/index.ts`，使用 `ts/tsconfig.json` 生成 `scripts/index.js`，GitHub Pages 实际加载的是这个编译产物。

资源清单步骤会扫描静态资源并生成 `data/asset-manifest.json`。如果所有参与清单的文件哈希都没有变化，脚本不会仅因为 `generatedAt` 不同而重写清单。

上传脚本会先获取远端 `main`，用 `origin/main` 判断暂存文件在远端是否已经存在：只要本次暂存文件里有任意路径在远端不存在，提交信息就是“新增文件”；否则提交信息是“功能增加或修复”。提交本地构建结果后，脚本会再次拉取远端状态。如果远端有 GitHub Actions 刚更新的玩家数据，脚本会正常合并远端提交；只有遇到已知生成物冲突时才自动处理。`data/asset-manifest.json` 是本地重建产物，冲突时先保留本地版本，随后再次生成；`data/rwr-players-pacific.json` 和 `data/rwr-players-pacific.meta.json` 是 Actions 自动更新的玩家 JSONL 及其哈希元数据，冲突时采用远端版本。处理完成后脚本会再次编译 TypeScript、刷新资源清单，提交合并结果并推送到 Git。脚本输出使用中文提示，并用不同颜色区分步骤、信息、成功、注意和错误。脚本开头保留两行 `@echo off` 是为了兼容 UTF-8 BOM 批处理文件，避免 Windows `cmd.exe` 回显批处理命令本身。

## CSV 编辑说明

### weapons.csv

`csv/weapons.csv` 是枪械数据源。当前字段包括：

```text
id
阵营
类型
枪械名称
致死
射击间隔
弹容
总装填时间
单次装填时间
基础精度
姿态精度修正-站
姿态精度修正-蹲
姿态精度修正-趴
姿态精度修正-架
单发后坐力
后坐力恢复
弹速
衰减开始时间
衰减结束时间
速度修正
视野修正
缩圈速率
射速
持续射击一秒恢复时间
衰减开始距离
衰减结束距离
站立精度
蹲伏精度
趴下精度
架枪精度
文件名称
图标
```

新增枪械时，在 CSV 中增加一行即可。建议保持 `id` 唯一，并确认 `图标` 对应 `weapons_textures/` 中存在的 WebP 文件。

### vehicles.csv

`csv/vehicles.csv` 是载具数据源。当前字段包括：

```text
阵营
生命值
最大速度
加速度
炮塔转速
受击门槛
爆炸减伤
载具名
武器名
装填速度
玩家视野修正
爆炸伤害
载具类型
图标号
```

新增载具时，在 CSV 中增加一行即可。`图标号` 对应 `maps_textures/<编号>.webp`。

### 空值和类型规则

CSV 中留空的单元格会转换成 JSON 的 `null`。

数字字段会根据现有 JSON 中的字段类型转换成数字。比如 `生命值`、`最大速度`、`弹容` 会生成数字。

文本字段保持文本。比如 `视野修正` 里的 `1x` 会保留为字符串，不会被转换成数字。

CSV 文件使用 UTF-8 no BOM 编码和 LF 换行。用表格软件编辑后保存时，需要确认没有被转换成 ANSI、GBK、UTF-16 或 UTF-8 BOM。

## JSON 数据说明

### data/weapons.json

这是网页运行时读取的枪械发布数据，由 `csv/weapons.csv` 生成。枪械页会用它渲染：

```text
枪械卡片列表
枪械详情
枪械对比
枪械对比结果图片下载和复制
搜索
```

### data/vehicles.json

这是网页运行时读取的载具发布数据，由 `csv/vehicles.csv` 生成。载具页会用它渲染：

```text
载具卡片列表
载具详情
载具对比
载具对比结果图片下载和复制
索敌优先级工具
搜索
```

### data/rwr-players-pacific.json

这是网页运行时读取的太平洋玩家统计快照，由 `.github/workflows/fetch-rwr-players.yml` 每 12 小时运行 `scripts/fetch-rwr-players.py` 生成。数据来源为：

```text
http://rwr.runningwithrifles.com/rwr_stats/view_players.php?db=pacific
```

文件采用 JSON Lines 流式结构。第一行是快照元数据，后续每一行是一个玩家对象：

```json
{"format":"rwr-player-stream-v1","version":"...","generatedAt":"2026-05-20T03:27:54+00:00","source":"http://rwr.runningwithrifles.com/rwr_stats/view_players.php?db=pacific","database":"pacific","count":25002}
{"leaderboard_position":1,"username":"KMSCT","kills":1310953,"deaths":6451,"score":1304502,"kd_ratio":203.22,"time_played":8288280,"longest_kill_streak":2319,"targets_destroyed":23985,"vehicles_destroyed":18031,"soldiers_healed":3020,"teamkills":3931,"distance_moved":2127.1,"shots_fired":6778048,"throwables_thrown":38495,"xp":13777880}
```

每个玩家保存和 RWRS `Player.load()` 一致的字段：

```text
leaderboard_position
username
kills
deaths
score
kd_ratio
time_played
longest_kill_streak
targets_destroyed
vehicles_destroyed
soldiers_healed
teamkills
distance_moved
shots_fired
throwables_thrown
xp
```

抓取脚本会按 RWRS 的解析方式处理玩家名编码：页面内容先按 `iso-8859-1` 读取，玩家名再转换为 UTF-8。若个别玩家名包含非法 UTF-8 字节，脚本会用替换字符保留该玩家并继续抓取，同时在 Actions 日志中输出 warning，避免单个异常名字导致整次更新失败。脚本会先根据稳定字段计算哈希；如果抓取结果和当前快照一致，会直接跳过写入，GitHub Actions 因而不会产生空的数据更新提交。玩家更新工作流只提交 `data/rwr-players-pacific.json` 和 `data/rwr-players-pacific.meta.json`，不会刷新主静态资源清单 `data/asset-manifest.json`。

玩家列表页会流式读取 `data/rwr-players-pacific.json`，边下载边解析玩家行并分批刷新列表。列表显示 `ID - XP - 击杀数 - 死亡数 - K/D - 最长连杀`，ID 以浅蓝色药丸徽章显示，支持按数值列全量升降排序，每页显示 100 个玩家。列表下方有独立分页容器，容器中左侧显示 `第 X / Y 页 · 共 N 名玩家`，上一页、页码和下一页控件作为一组居中放置在分页容器中；该容器不属于表格滚动层，会固定作为内容容器的底部区域。手机端分页会隐藏数字页码，并将上一页和下一页按钮压缩为左右三角图标，页数信息控件会缩小左右内边距，并与三角按钮保持在同一行，避免控件换行或挤出分页容器。点击玩家行会打开详情弹窗，顶部先显示大号玩家名卡片，再显示排名卡片，并显示 XP、击杀、死亡、分数、KD、游戏时间、最长连杀、摧毁目标、摧毁车辆、治疗士兵、误伤、移动距离、开火次数、投掷物次数在当前快照所有玩家中的排名。

### data/rwr-players-pacific.meta.json

这是玩家统计快照的哈希元数据文件，页面和 Service Worker 用它判断 `data/rwr-players-pacific.json` 是否可以复用缓存。`version` 是玩家内容的稳定 SHA-256，只根据 `source`、`database`、`count` 和玩家稳定字段计算，`generatedAt` 只表示这份元数据写入时间，不参与缓存判断。

### data/maps.json

这是地图摘要数据，负责告诉页面：

```text
有哪些地图
地图属于哪个系列
地图列表显示什么名称
基础地图图片优先使用哪个文件
每张地图有哪些阵营视角
每个阵营视角有哪些状态
详细点位 JSON 在哪里
```

典型结构：

```json
{
  "id": "edelweiss1",
  "group": "雪绒花",
  "name": "edelweiss1",
  "baseImage": "map_axis.webp",
  "factions": [
    {
      "id": "Allies",
      "label": "盟军",
      "image": "map_allies.webp"
    },
    {
      "id": "Axis",
      "label": "德军",
      "image": "map_axis.webp"
    }
  ],
  "viewStates": {
    "Allies": ["friendly_all", "enemy_all"],
    "Axis": ["friendly_all", "enemy_all"]
  },
  "data": "maps/edelweiss1/map-data.json"
}
```

### maps/<地图名>/map-data.json

这是某张地图的完整设施点位数据。地图详情不是启动时全部加载，只有用户打开地图或生成阵营视角时才会按需读取。

典型结构：

```json
{
  "map": "edelweiss1",
  "source": "maps/edelweiss1/objects.svg",
  "spawn_ranges": {
    "Allies": [],
    "Axis": []
  },
  "views": {
    "Allies": {
      "friendly_all": [
        {
          "key": "willys_mb.vehicle",
          "icon": 10,
          "x": 2374.89,
          "y": 3.16,
          "layer": "unlayered"
        }
      ],
      "enemy_all": []
    },
    "Axis": {
      "friendly_all": [],
      "enemy_all": []
    }
  }
}
```

字段含义：

```text
map           地图 id
source        点位来源记录
spawn_ranges  阵营刷新区域
views         按阵营和视图状态分组的设施点位
key           设施或载具 key
icon          地图图标编号，对应 maps_textures/<编号>.webp
x, y          地图坐标
layer         原始图层信息
```

### model/models.json

这是模型查询页运行时读取的模型清单。清单中的 `name` 只用于模型查询页显示和搜索，不需要对应 `data/vehicles.json` 中的 `载具名`。模型卡片图标只读取本条目的 `icon` 字段，阵营徽标读取本条目的 `faction` 字段。

典型结构：

```json
[
  {
    "id": "maus_boss",
    "name": "鼠式超重型坦克",
    "model": "model/maus_boss/maus_boss.glb",
    "sourceBlend": "model/maus_boss/maus_boss.blend",
    "icon": 5,
    "faction": "德军"
  }
]
```

网页查看器通过 `model-viewer.html?id=<id>` 打开，并实际加载 `model` 指向的 `.glb`。浏览器不能直接渲染 `.blend`，`sourceBlend` 只用于源文件归档。

`icon` 对应 `maps_textures/<编号>.webp`，是模型查询页图标的唯一来源。若某个模型没有维护 `icon`，模型卡片会显示“无图标”占位，不会再按 `name` 去 `data/vehicles.json` 中兜底匹配。

## 前端功能

`index.html` 包含页面结构和样式，主页面交互逻辑在 `ts/index.ts` 中维护，并编译为 `scripts/index.js` 供浏览器加载。页面主要分为五个功能区：

```text
载具查询
枪械查询
地图查询
模型查询
玩家列表
```

载具查询使用和模型查询一致的卡片式布局。每张卡片显示阵营徽章、载具图标和载具名，支持搜索、详情、对比和索敌优先级工具；点击卡片会打开载具详细参数，比较模式下点击卡片会选择两个载具进行对比，索敌优先级模式下点击有武器的载具会打开索敌优先级弹窗。载具对比弹窗右上角提供分享按钮，点击后会关闭当前对比弹窗，并打开对比图片预览弹窗；预览图由前端 canvas 根据当前对比数据重新绘制，支持下载 PNG 图片或复制 PNG 图片到剪贴板。

枪械查询使用和模型查询一致的卡片式布局。每张卡片显示阵营徽章、顺时针旋转 90 度后的枪械图标和枪械名称，支持搜索、详情和对比；点击卡片会打开枪械详细参数，比较模式下点击卡片会选择两个枪械进行对比。枪械对比弹窗同样提供分享按钮，对比结果可以生成完整 PNG 预览图，并支持下载或复制到剪贴板。枪械查询页不提供排序控件。

地图查询使用和模型查询一致的卡片式布局，按雪绒花和太平洋分组显示，分组标题只保留放大的系列徽标文字，不再显示“系列”或地图数量；桌面端系列徽标使用统一高度和上下内边距，避免雪绒花、太平洋两个徽标的视觉间距不一致；每张卡片展示地图缩略图和地图名，悬停时有卡片抬升动效。点击地图卡片后打开基础地图预览，弹窗右侧提供按阵营和占领状态生成带设施图标地图视图的按钮，按钮宽度按文字内容收缩并保留左右留白，外层使用和地图图片区一致的圆角容器；手机端这些按钮会移动到地图下方。

模型查询支持从 `model/models.json` 列出模型，并直接使用模型清单中的 `icon` 显示 `maps_textures/<图标号>.webp`；没有 `icon` 时显示“无图标”占位，不再按载具名匹配 `data/vehicles.json`。点击“查看模型”会打开 `model-viewer.html`，使用 Three.js、GLTFLoader 和 OrbitControls 加载 GLB，支持旋转、平移、滚轮缩放和部件显示/隐藏。模型查看页右侧的部件显示控制为单列纵向列表，按钮列宽按最长部件名收缩，部件较多时在面板内上下滚动；渲染器会在低 DPR 屏幕上使用轻量超采样，并保留贴图原始分辨率和各向异性过滤。

玩家列表读取 `data/rwr-players-pacific.json`，展示太平洋数据库的玩家统计快照。列表页按 100 个玩家分页，玩家 ID 使用和地图分组标题相近的浅蓝色药丸徽章；分页栏是内容容器底部的独立容器，不属于表格滚动层，左侧显示当前页、总页数和玩家总数，分页按钮组水平居中并垂直居中于分页容器，手机端会隐藏数字页码并将上一页和下一页改为左右三角图标按钮，页数信息和三角按钮保持同一行；数值列点击表头后会对全部已加载玩家排序，而不是只排序当前页。玩家详情弹窗顶部先显示大号玩家名，再显示大号排名数字，下方列出全部玩家统计字段，并在可排名字段右侧显示该玩家在当前快照中的全量排名。

页面包含移动端适配：`860px` 以下顶部操作栏纵向排列并保持在结果滚动层上方，载具查询、枪械查询、地图查询和模型查询都使用响应式卡片网格；枪械卡片图标在移动端同样保持顺时针 90 度旋转。玩家列表在手机端改为卡片式行布局，保留纵向浏览效率。主查询结果限制在 `.table-wrap` 内上下滚动，避免页面主体被结果内容撑出横向滚动；载具对比和枪械对比弹窗在手机端保留完整三栏对比结构，并在弹窗内容区内左右滑动查看。对比结果分享弹窗在手机端使用单列按钮布局，预览图在弹窗内容区内自适应缩放。`640px` 以下主导航折叠为“菜单”按钮，详情、地图和索敌优先级弹窗贴合手机视口显示，按钮和输入框保持触控友好的高度与间距。桌面端从其他分类切换到地图查询、模型查询或玩家列表时，列表滚动位置会回到顶部，避免沿用上一分类停留的行位置。

主页面视觉结构分为两个独立容器：上方操作容器左侧放大显示 `splash.webp` 并进一步向左对齐，图片放大时不增加顶栏高度而是压缩上下留白；中间居中显示查询分类 TAG，右侧显示搜索框并向右对齐；下方内容容器承载比较工具条、索敌入口和各查询结果，中间保留间距以分隔导航和数据内容。顶部三个控件区域使用较大的固定高度和宽度，内容容器不再使用外层阴影遮罩；地图查询和模型查询页会隐藏无操作意义的提示条。页面保留卡片动效和毛玻璃模糊效果，同时通过较轻的模糊半径、较小阴影、GPU 友好的 transform 动画、滚动容器隔离、玩家卡片渲染隔离和卡片分组内容可见性控制降低重绘压力。`splash.webp` 由 `scripts/convert_png_to_webp.py` 从原始 PNG 转换生成并裁掉透明边距，原始 PNG 不再保留。

模型查看页在 `720px` 以下会显示“操作说明”按钮，点击后展开手势说明抽屉；光照滑动条固定在页面底栏，避免占用模型主要显示区域；模块显示入口放在操作说明下方，点击“模块显示”后从右侧滑出窄侧栏，侧栏中的模块按钮使用 `1`、`2`、`3` 这样的数字标识以节省空间，并以单列纵向排列，模块数量超出侧栏高度时可在侧栏内上下滑动。手机端说明使用触控逻辑和手机图标：单指滑动屏幕查看模型，双指张合缩放模型，双指同时拖动移动视角。`420px` 以下会进一步压缩标题、光照控件和部件按钮宽度，适配更窄屏幕。

移动端验证方式：临时使用 Playwright 打开主站五个查询页、移动端菜单展开、载具详情、枪械详情、载具对比、枪械对比、对比结果分享弹窗、索敌优先级弹窗、地图弹窗、独立模型查看页、模型操作说明和模块侧栏，并分别在 `360x800`、`390x844`、`414x896`、`430x932`、`768x1024`、`1920x1080` 视口截图检查。后续回归还验证了载具和枪械卡片网格在手机端没有横向溢出、枪械卡片图标保持旋转、载具和枪械对比结果可以生成 PNG 预览图、玩家分页按钮组在桌面端水平和垂直居中、手机端模型说明不显示桌面鼠标操作文案或桌面图标、手机端光照栏位于底栏、模块按钮使用数字侧栏、桌面端切换到地图查询和模型查询会重置到列表顶部。验证用 Playwright 依赖、脚本和截图临时目录已在验证后删除，不保留在项目中。

页面启动时会先检查资源清单，再并行读取主 JSON。清单检查会记录整体 `version`，同时记录入口文件签名，入口文件签名由 `index.html`、`scripts/index.js` 和 `sw.js` 在清单中的哈希组成：

```js
fetch("data/vehicles.json")                 // 按清单和入口文件签名决定是否可用缓存
fetch("data/weapons.json")                  // 按清单和入口文件签名决定是否可用缓存
fetch("data/maps.json")                     // 按清单和入口文件签名决定是否可用缓存
fetch("model/models.json")                  // 按清单和入口文件签名决定是否可用缓存
fetch("data/rwr-players-pacific.meta.json")  // 判断玩家 JSON 的缓存版本
fetch("data/rwr-players-pacific.json")       // 版本命中时可复用缓存，否则请求网络
```

地图详情数据按需读取：

```text
maps/<地图名>/map-data.json
```

这样可以避免首次加载一次性请求所有地图点位。

## 资源清单和缓存策略

`data/asset-manifest.json` 是静态资源哈希清单。它保存每个参与缓存管理的文件路径和 SHA-256 哈希，并根据所有文件路径和哈希生成整体 `version`。

当前参与清单的资源包括：

```text
data/
model/
maps_textures/
maps/
weapons_textures/
index.html
model-viewer.html
sw.js
ico.webp
splash.webp
scripts/index.js
```

`data/rwr-players-pacific.json` 和 `data/rwr-players-pacific.meta.json` 不写入主资源清单。前者保存玩家快照流，后者保存对应的 SHA-256 元数据。Service Worker 会先读取 `meta.json`，哈希命中时直接复用玩家 JSONL 缓存，哈希缺失或不一致时才请求网络文件。

`README.md`、`csv/`、`ts/` 和辅助脚本不参与网页运行时加载，因此不写入资源清单；`scripts/index.js` 是浏览器运行时代码，会写入资源清单。

页面启动时会使用 `cache: "no-store"` 请求：

```text
data/asset-manifest.json
```

如果清单请求失败，页面应当失败并显示网络错误，不允许使用旧缓存降级运行。原因是：清单是判断所有资源是否过期的根依据，请求失败时无法证明本地缓存仍然是最新版本。

如果清单版本和上次记录一致，页面可以继续使用缓存资源。

如果清单版本变化，但入口文件签名没有变化，页面不会刷新，也不会清理 `rwr-cache-*` 缓存。普通资源由 Service Worker 按单文件哈希判断：哈希没变的资源继续复用缓存，哈希变化或缓存不存在的资源才请求网络并写回缓存。

如果清单版本变化，且入口文件签名也变化，页面会记录本次入口文件签名并刷新一次页面，确保用户加载新的 `index.html`、`scripts/index.js` 或 `sw.js` 行为。刷新时不清理 `rwr-cache-*` 缓存；刷新后的资源请求仍由 Service Worker 按单文件哈希校验，避免因为小范围前端改动重新下载未变化的地图、模型、贴图和数据文件。

Service Worker 处理普通静态资源时，也会先请求最新清单，并按清单中的 SHA-256 校验缓存内容：

```text
缓存文件存在，且内容哈希等于最新清单哈希      使用缓存
缓存文件不存在，或内容哈希不一致              请求网络资源
网络资源内容哈希等于最新清单哈希              写入缓存并返回
网络资源内容哈希不等于最新清单哈希            失败，不写入缓存
旧清单存在但新清单中已删除该文件              删除缓存并返回 410
清单请求失败                                  失败，不使用旧缓存降级
```

`data/rwr-players-pacific.json` 由独立的玩家元数据哈希驱动缓存判断。`meta.json` 能正常加载时，哈希命中就复用缓存；哈希缺失、读取失败或哈希不一致时，再请求网络文件并更新缓存。页面和 Service Worker 只接受新的 JSON Lines 流式格式，不再兼容旧的大 JSON 对象格式。

`data/asset-manifest.json` 本身使用 network-only 策略。请求失败就是失败，不从缓存返回旧清单。

## Service Worker 注意事项

`sw.js` 只在 HTTPS 环境注册。GitHub Pages 符合这个条件，本地 `http://127.0.0.1` 调试时不会注册 Service Worker。

Service Worker 的缓存名以 `rwr-cache-` 开头。页面检测到资源清单版本变化时不会再全量删除这些缓存；缓存淘汰以单文件哈希为准。只有 Service Worker 自身 `CACHE_VERSION` 变化并触发 `activate` 时，旧版本缓存才会被清理。

如果修改了 `sw.js` 自身，记得运行上传脚本生成新的 `data/asset-manifest.json`，因为 `sw.js` 也在资源清单中，并且属于入口文件签名的一部分。`sw.js`、`index.html` 或 `scripts/index.js` 的哈希变化会触发一次页面刷新；仅数据、地图、模型或贴图资源变化不会触发页面刷新。

## 常用命令

从当前 JSON 重新生成 CSV：

```powershell
node scripts/sync-csv-json.js json-to-csv
```

从 CSV 更新 JSON：

```powershell
node scripts/sync-csv-json.js csv-to-json
```

更新资源清单：

```powershell
node scripts/build-asset-manifest.js
```

编译 TypeScript 前端逻辑：

```powershell
cmd /c npm --prefix ts run build:ts
```

手动抓取太平洋玩家统计：

```powershell
python scripts/fetch-rwr-players.py
```

本地只测试第一页解析：

```powershell
python scripts/fetch-rwr-players.py --max-pages 1 --output data/rwr-players-pacific.json
```

本地启动静态服务器：

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

执行完整上传流程：

```powershell
.\update-assets-and-upload.bat
```

## 界面风格维护

主页面参考 [sn0w.fyi](https://sn0w.fyi/) 的暖纸张风格：米色纸面背景为纯色（不再叠加点阵或杂色纹理），深墨色正文，便笺浅蓝色作为操作按钮和批注块底色，便利贴浅黄色（土黄底 `#fbf1a4` + 深黄字 `#6a6320`）作为当前选中标签和悬停高亮，红色 `#d75a48` 作为危险/强调色，绿色 `#4f9d69` 作为正向反馈。整体使用低饱和、低阴影、薄边框的视觉语言，不混入高饱和渐变、玻璃拟态、印章硬阴影或卡片旋转效果。

核心 CSS 变量集中在 `index.html` 末尾的覆盖样式块中维护：

```text
--bg          #f4efe4   页面纯色背景
--paper       #f8f4ec   面板/卡片基础米纸底
--paper-strong #fffaf1  hover 或对话框等更亮的米纸底
--text        #26221c   主要墨色文字
--muted       #6f685c   次要文字
--line        #e7e0d2   薄边框
--line-strong #c9c0ad   选中或强调时的边框
--note        #dde8fb   便笺浅蓝（按钮/徽章底色）
--note-ink    #3a5ba0   便笺浅蓝上的文字色
--sticky      #fbf1a4   便利贴土黄（当前 tab、悬停反馈）
--sticky-ink  #6a6320   便利贴上的文字色
--accent      #d75a48   红色强调
--accent-2    #4f6fc0   蓝色强调
--good        #4f9d69   正向（升序、正向对比）
--bad         #d75a48   负向（降序、危险按钮）
```

阵营徽标需要保留明确区分：美军和雪绒花/海岛地图标签使用便笺蓝、德军浅棕、英军浅绿、日军浅红、通用便利贴黄。载具和枪械比较模式中，被选中的卡片或行只使用绿色描边和绿色淡底；玩家列表 hover 只做轻微浅黄底反馈，不使用红色横向或侧向描边。

## 维护建议

- 修改枪械和载具数据时，优先编辑 `csv/` 目录下的 CSV。
- 不建议直接编辑 `data/weapons.json` 和 `data/vehicles.json`。
- 新增枪械后，检查 `weapons_textures/` 中是否存在对应图标。
- 新增载具后，检查 `maps_textures/` 中是否存在对应编号图标。
- 新增模型时，在 `model/` 下创建安全英文 id 子目录，放入同一模型对应的 `.glb` 和可选 `.blend`，然后手动在 `model/models.json` 中增加对应条目。
- 模型查询页的图标只来自 `model/models.json` 的 `icon`；新增或调整模型时必须直接维护 `icon`，不要依赖 `data/vehicles.json` 的载具名或图标号兜底。
- 修改地图点位后，检查 `map-data.json` 中的 `icon` 是否能在 `maps_textures/` 中找到。
- 上传前运行 `update-assets-and-upload.bat`，让 CSV、JSON、资源清单和 Git 上传保持同一流程。
- 如果数据和资源没有变化，JSON 和资源清单都不会被重写，用户浏览器也不会因为无意义哈希变化重新请求资源。
