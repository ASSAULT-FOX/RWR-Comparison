# RWR 参数查询器

这是一个给 Running With Rifles DLC 数据做浏览和对照用的纯前端页面。项目的核心目标很简单：把散落在 JSON、地图图片、图标和 `.vehicle` 文件里的参数整理成一个可以直接查、直接对比、直接生成地图设施图的网页。

整个项目没有后端，也没有构建流程。打开页面后，浏览器会通过 `fetch()` 读取 `data` 和 `maps` 目录中的 JSON 文件，再在前端完成列表渲染、排序、对比、地图弹窗和地图图标叠加。

推荐用本地静态服务运行：

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

然后访问：

```text
http://127.0.0.1:8765/index.html
```

页面本身是静态的，部署到任何能提供静态文件的地方都可以。只要目录结构保持不变，`index.html` 就能找到它需要的数据、图片和图标。

## 项目概览

项目现在主要由五类内容组成：

```text
.
├── index.html          页面入口，HTML、CSS、JavaScript 都在这里
├── ico.png             浏览器标签页图标
├── data/               三个主数据摘要文件
├── images/             地图叠加图标，按数字编号命名
├── maps/               每张地图的图片和 map-data.json
├── vehicles/           原始 .vehicle 文件，用来核对载具 key 和图标号
└── maps.rar            地图资源压缩包，作为资源包留在目录中
```

这个项目有一个很明显的特点：它把页面结构、样式和逻辑都集中在 `index.html` 里。这样做的好处是复制和运行都很直接，不需要安装依赖，也不需要先构建。代价是这个文件会比较长，读代码时最好按功能块来读，而不是从第一行一路看到最后一行。

页面分成三个主界面：

- `载具查询`
- `枪械查询`
- `地图查询`

载具和枪械界面主要是参数表和对比工具。地图界面负责展示地图列表，打开基础地图，以及按“阵营视角 + 占领状态”生成带设施图标的地图图片。

## 文件职责

### index.html

`index.html` 是项目的入口，也是唯一的前端代码文件。它包含三部分：

- HTML：页面结构、表格、弹窗、按钮、加载层等
- CSS：主界面布局、表格视觉、弹窗毛玻璃、地图视图、拖拽威胁点动画
- JavaScript：数据加载、搜索、排序、对比、地图渲染、Canvas 图片生成

前端没有使用框架。所有 DOM 节点都通过 `document.getElementById()` 或 `querySelectorAll()` 获取，事件也直接绑定在对应节点上。

页面加载后会做这些事情：

1. 显示加载层。
2. 并行读取 `data/vehicles.json`、`data/weapons.json`、`data/maps.json`。
3. 规范化载具数据，建立枪械和地图的查找表。
4. 默认渲染载具查询页。
5. 用户切换标签页、搜索、排序、点击行或按钮时，再进入对应功能。

### data/vehicles.json

这是载具参数主表。页面中的载具列表、载具详情、载具对比和索敌优先级入口都依赖它。

典型字段如下：

```json
{
  "阵营": "英军",
  "生命值": 26,
  "最大速度": 6,
  "加速度": 10,
  "炮塔转速": 2.86,
  "受击门槛": 1.02,
  "爆炸减伤": 0.9,
  "载具名": "丘吉尔Mk.VII步兵坦克",
  "武器名": "75mm 坦克炮",
  "装填速度": 4.4,
  "玩家视野修正": 1,
  "爆炸伤害": 4.8,
  "载具类型": "medium_armour"
}
```

页面里的 `normalizeVehicle()` 会把这些字段转换成内部使用的英文键，比如 `hp`、`speed`、`acceleration`、`name`、`weapon` 等。这样后面的排序和比较逻辑就不用反复处理中文字段名。

载具页主要用这些字段：

- 阵营
- 载具名
- 生命值
- 最大速度
- 加速度
- 炮塔转速
- 受击门槛
- 爆炸减伤
- 武器名
- 装填速度
- 玩家视野修正
- 爆炸伤害
- 载具类型

其中 `载具类型` 还会参与索敌优先级计算，例如 `medium_armour`、`light_vehicle`、`defensive_weapon` 等。

### data/weapons.json

这是枪械参数主表。枪械查询页会读取它并按字段渲染表格、详情和对比内容。

常见字段包括：

```json
{
  "id": 1,
  "阵营": "德军",
  "类型": "步枪",
  "枪械名称": "Kar98k",
  "文件名称": "kar98k.weapon",
  "基础精度": 0.98,
  "致死": 1,
  "射速": 0.9,
  "单发后坐力": 0.2,
  "衰减开始距离": 80
}
```

`weaponSections` 定义了枪械详情页的展示分组。不同类型的字段会被拆成不同区域，避免详情弹窗里变成一整张很长的无结构表。

枪械对比时，页面会用 `numericValue()` 尽量从字段中提取数字。如果某个字段不是普通数字，比如 `致死` 里出现爆炸类描述，代码会走单独的展示逻辑。

### data/maps.json

这是地图列表摘要。它不是地图设施点位的完整数据，完整点位在 `maps/<地图名>/map-data.json` 中。

`maps.json` 的职责是让地图主界面快速知道：

- 有哪些地图
- 地图属于哪个系列
- 地图列表里显示什么名字
- 基础地图优先用哪张 PNG
- 这张地图有哪些阵营视角
- 每个视角有哪些占领状态
- 详细数据文件在哪里

当前结构示例：

```json
{
  "id": "edelweiss1",
  "group": "雪绒花",
  "name": "edelweiss1",
  "baseImage": "map_axis.png",
  "factions": [
    {
      "id": "Allies",
      "label": "盟军",
      "image": "map_allies.png"
    },
    {
      "id": "Axis",
      "label": "德军",
      "image": "map_axis.png"
    }
  ],
  "viewStates": {
    "Allies": ["friendly_all", "enemy_all"],
    "Axis": ["friendly_all", "enemy_all"]
  },
  "data": "maps/edelweiss1/map-data.json"
}
```

旧版 `maps.json` 曾经保存过无线电干扰器、坦克、反坦克炮、重机枪数量。现在这些统计列已经从地图主界面移除，所以摘要里也不再保存 `counts`。地图页只关心地图列表和操作按钮，设施刷新明细全部以地图目录里的 `map-data.json` 为准。

### images/

`images` 目录保存地图上叠加的小图标。命名规则非常直接：图标编号就是文件名。

```text
images/
├── 0.png
├── 1.png
├── 2.png
├── ...
├── 59.png
├── 60.png
└── 73.png
```

地图 JSON 里的 `icon` 值对应这里的文件。例如：

```json
{
  "key": "vickers_hmg.vehicle",
  "icon": 7,
  "x": 1338.33,
  "y": 284.42
}
```

页面生成叠加图时会加载：

```text
images/7.png
```

如果需要知道某个载具应该用几号图标，可以去 `vehicles/<文件名>.vehicle` 中查 `map_view_atlas_index`。

例如：

```xml
<vehicle name="Vickers Mk I HMG" key="vickers_hmg.vehicle" map_view_atlas_index="7">
```

这个值和地图 JSON 里的 `icon` 应保持一致。

### maps/

`maps` 是地图功能最重要的目录。每张地图一个子文件夹，里面至少有一个 `map-data.json`，并且通常会有一张或多张地图图片。

示例：

```text
maps/
├── edelweiss1/
│   ├── map-data.json
│   ├── map_axis.png
│   └── map_allies.png
├── edelweiss7/
│   ├── map-data.json
│   ├── map.png
│   └── map_allies.png
└── island1/
    ├── map-data.json
    └── map.png
```

地图图片约定：

- `map.png` 是通用基础图。
- `map_axis.png` 是德军视角图。
- `map_allies.png` 是盟军视角图。
- `map_usmc.png` 是美军视角图。
- `map_ija.png` 是日军视角图。

点击地图页里的 `查看地图` 时，页面会优先显示该地图目录中的 `map.png`。如果没有 `map.png`，就用摘要里的 `baseImage` 或目录中可用的阵营图作为基础图。

点击视角按钮时，页面会根据按钮上的阵营和状态，选择对应视角图作为底图，再把设施图标绘制到 Canvas 上。

### vehicles/

`vehicles` 目录保存原始 `.vehicle` 文件。页面运行时不会直接请求这个目录，但它对理解数据来源很有用。

一个 `.vehicle` 文件通常能提供这些信息：

- 载具文件名，也就是地图 JSON 里的 `key`
- 地图图标编号，也就是 `map_view_atlas_index`
- 载具标签，比如 `tank`、`hmg`、`defensive_weapon`
- 载具继承关系，比如 `m4_firefly.vehicle` 继承 `m4_firefly_base.vehicle`

例如：

```xml
<vehicle file="vehicle_base.vehicle" name="Churchill Mk VII" key="churchill_mkvii.vehicle" map_view_atlas_index="73">
```

这说明丘吉尔 Mk VII 在地图上应使用 `images/73.png`。

## 页面结构

`index.html` 的 HTML 主体大致由这些区域组成：

- `loadingPanel`：初始数据加载时显示的加载层
- `.shell`：页面最外层布局容器
- `.main`：主界面面板
- `.topbar`：顶部标签和搜索框
- `.compare-bar`：对比按钮、索敌按钮和提示文字
- `.table-wrap`：三张主表格所在的滚动区域
- `compareModal`：载具/枪械对比弹窗
- `detailModal`：载具/枪械详情弹窗
- `targetModal`：载具索敌优先级弹窗
- `mapModal`：基础地图查看弹窗
- `toast`：短提示

三张主表格是并排写在 HTML 里的：

- `vehicleTable`
- `weaponTable`
- `mapTable`

切换标签页时，代码不会重新创建表格，只会给不需要显示的表格加上 `hidden` 类。

## 视觉和布局

页面的 CSS 使用了浅色、半透明面板和比较强的圆角阴影。整体不是传统后台表格那种很硬的风格，而是偏轻量工具页。

几个比较关键的样式点：

- `body` 禁止整体滚动，主表格区域内部滚动。
- `.main` 使用 CSS Grid，把顶部栏、操作栏、表格区固定成三行。
- 表头使用统一的 `thead` 背景，避免每个列名看起来像独立按钮。
- 弹窗遮罩使用 `backdrop-filter`，弹窗本体也有更强的毛玻璃效果。
- 表格行 hover、按钮 hover、弹窗进入、索敌排行移动都保留了动态效果。

地图图片弹窗和生成后的新标签页采用不同逻辑：

- `mapModal` 只负责显示基础地图图片。
- 视角按钮会打开新标签页，然后把 Canvas 生成的 PNG 放进去。
- 新标签页中的图片可以点击切换“适应窗口”和“原始尺寸”。

## 数据加载流程

页面启动时，`loadData()` 会并行请求三个文件：

```js
const [vehicleResponse, weaponResponse, mapResponse] = await Promise.all([
  fetch("data/vehicles.json"),
  fetch("data/weapons.json"),
  fetch("data/maps.json")
]);
```

读取完成后：

- `vehicles` 保存规范化后的载具数据。
- `weapons` 保存枪械数据。
- `maps` 保存地图摘要。
- `weaponLookup` 用枪械 `id` 做索引。
- `mapLookup` 用地图 `id` 做索引。
- `mapDataCache` 缓存已经读过的地图详情。

地图详情不是启动时全部加载。地图点位数据比较多，而且用户未必每张地图都会打开，所以页面只在需要时调用 `loadMapData(mapId)` 读取对应的 `maps/<地图名>/map-data.json`。

## 载具查询

载具页的数据来自 `data/vehicles.json`。

渲染入口是：

```js
renderTable(list)
```

每一行代表一个载具。点击行时会打开详情弹窗。如果处于对比模式，点击行会选择或取消选择该载具。如果处于索敌优选模式，点击行会打开索敌优先级弹窗。

载具页支持排序。排序状态保存在：

```js
let sortState = { key: null, mode: null };
```

点击同一个表头会在“优势排序 / 劣势排序 / 不排序”之间切换。不同字段对“好坏”的理解不同，例如生命值越高越好，装填速度通常越低越好。因此代码中有 `vehicleHigherBetter` 这样的集合，用来判断排序方向。

载具详情由这些函数组装：

- `openDetail(index)`
- `detailBaseRows(vehicle)`
- `detailAntiTankRows(vehicle)`
- `repairRows(vehicle)`
- `renderDetailSection(title, rows)`
- `renderDetailRow(row)`

详情弹窗里除了基本属性，还会计算反坦克武器命中后的伤害百分比和摧毁所需发数。

## 枪械查询

枪械页的数据来自 `data/weapons.json`。

渲染入口是：

```js
renderWeaponTable(list)
```

枪械表格显示阵营、类型、名称和几个常用战斗参数。点击枪械行会打开枪械详情弹窗。枪械详情字段由 `weaponSections` 控制，不同 section 会列出不同字段。

枪械页也支持对比，入口是：

- `openWeaponComparison(indexA, indexB)`
- `weaponCompareRows(a, b)`
- `weaponCompareRow(key, a, b)`

枪械对比里有些字段不是简单数字。例如 `致死` 可能是数字，也可能包含爆炸类语义。代码用 `weaponKillDisplay()`、`isExplosiveKill()` 和 `numericValue()` 处理这些显示差异。

## 对比系统

载具和枪械共用一套选择模式。点击顶部的对比按钮后，页面进入 `compareMode`。

相关状态：

```js
let compareMode = false;
let selectedIndices = [];
let selectedWeaponIndices = [];
```

载具和枪械分别使用不同的选择数组。确认选择两个对象后：

- 载具走 `openComparison(indexA, indexB)`
- 枪械走 `openWeaponComparison(indexA, indexB)`

对比弹窗不是一张普通表格，而是左右两侧对象卡片加中间指标列。箭头显示优势方向。对于“越低越好”的字段，会使用 `compareArrowLowerBetter()`。对于“越高越好”的字段，会使用 `compareArrow()`。

载具对比还会计算双方互相命中后的实际伤害。计算入口是：

```js
hitResult(attacker, defender)
```

它会考虑攻击方爆炸伤害、防御方爆炸减伤、防御方生命值，最后得出伤害百分比和摧毁需要的发数。

## 载具索敌优先级

索敌优先级是一个独立的小工具，用来观察某个载具面对不同威胁类型时的目标优先顺序。

入口按钮是 `载具索敌优选`。开启后，点击一个有武器的载具，会打开 `targetModal`。

主要函数：

- `openTargetOptimizer(index)`
- `getThreatFactors(vehicle)`
- `renderThreatButtons()`
- `toggleThreat(tag)`
- `placeThreat(item, x, y)`
- `threatScore(item, geometry)`
- `updateThreatScores()`
- `renderPriorityList(items, topTag, allowReorder)`

威胁优先级由几个因素共同决定：

- 距离
- 炮管朝向
- squad command 权重
- 基础威胁分

威胁点可以拖拽。拖动后，代码会重新计算分数，并用动画更新右侧排行。排行最高的威胁点会有红色高亮环。

这一块用了不少 `transform`、`requestAnimationFrame` 和 DOM 几何计算。它不是数据查询功能的一部分，但它和载具参数里的 `vehicleType`、武器名紧密相关。

## 地图查询

地图页现在只显示三列：

- 地图组
- 地图名
- 操作

每一行的按钮由 `renderMapTable()` 和 `mapPerspectiveButtons()` 生成。

操作按钮分两类：

```text
查看地图
查看某阵营视角(某阵营占领)
```

`查看地图` 会打开基础地图弹窗。它不叠加任何图标，只显示地图图片。

双阵营地图会生成四个视角按钮。以雪绒花地图为例：

```text
查看德军视角(德军占领)
查看德军视角(盟军占领)
查看盟军视角(盟军占领)
查看盟军视角(德军占领)
```

太平洋地图同理：

```text
查看美军视角(美军占领)
查看美军视角(日军占领)
查看日军视角(日军占领)
查看日军视角(美军占领)
```

`edelweiss7`、`edelweiss8` 是单阵营地图，因此只显示一个阵营视角按钮。

地图详情数据按需加载：

```js
loadMapData(mapId)
```

加载后会进入 `normalizeMapData(mapData, summary)`，把新旧字段整理成页面统一使用的结构。

## map-data.json

每张地图的详细刷新数据都在：

```text
maps/<地图名>/map-data.json
```

当前新格式以 `views` 为核心。它不仅记录阵营视角，还记录敌我占领情况。

简化示例：

```json
{
  "map": "edelweiss1",
  "source": "地图数据/edelweiss1.md",
  "spawn_ranges": {
    "Allies": [],
    "Axis": [
      {
        "from": [272, 610],
        "to": [479, 820]
      }
    ]
  },
  "views": {
    "Allies": {
      "friendly_all": [
        {
          "key": "willys_mb.vehicle",
          "icon": 10,
          "x": -1195.5,
          "y": 1603.7,
          "layer": "layer.allies"
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

- `map`：地图 id，一般和文件夹名一致。
- `source`：数据来源，常见值是原始 Markdown 或 SVG 文件路径。
- `spawn_ranges`：刷新区域记录，用阵营分组。当前页面主要展示点位，区域数据保留在 JSON 中。
- `views`：视角分组。第一层 key 是视角阵营，例如 `Allies`、`Axis`、`USMC`、`IJA`。
- `friendly_all`：该视角阵营全部占领时刷新的载具设施。
- `enemy_all`：敌方全部占领时刷新的载具设施。
- `key`：载具或设施文件名，对应 `vehicles` 目录里的 `.vehicle`。
- `icon`：图标编号，对应 `images/<编号>.png`。
- `x`：横向像素坐标。
- `y`：纵向坐标，绘制时会取反。
- `layer`：来源图层名，用于保留数据来源上下文。

这里的 `friendly_all` 和 `enemy_all` 是相对于“视角阵营”说的。

举例：

```text
views.Allies.friendly_all
```

表示“盟军视角下，盟军全部占领时”的刷新点。

```text
views.Allies.enemy_all
```

表示“盟军视角下，德军全部占领时”的刷新点。

太平洋地图同理：

```text
views.USMC.friendly_all  = 美军视角，美军占领
views.USMC.enemy_all     = 美军视角，日军占领
views.IJA.friendly_all   = 日军视角，日军占领
views.IJA.enemy_all      = 日军视角，美军占领
```

## 地图坐标和绘制

地图图标叠加由 `openProcessedMap()` 完成。它会：

1. 打开一个新标签页。
2. 读取对应阵营视角的地图 PNG。
3. 创建一个和原图同尺寸的 Canvas。
4. 把地图图片画到 Canvas。
5. 读取当前视角和占领状态下的点位。
6. 按 `icon` 加载 `images/<编号>.png`。
7. 把图标画到 JSON 坐标对应的位置。
8. 把 Canvas 转成 PNG Blob，在新标签页显示。

坐标转换在 `mapPointToCanvas()` 中：

```js
function mapPointToCanvas(item, canvas, mapData = currentMap) {
  const x = Number(item.x);
  const y = Number(item.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  if (mapData?.views) {
    return {
      x,
      y: -y
    };
  }
  return { x, y };
}
```

当前新地图格式的规则是：

- 原点按图片左上角理解。
- X 轴方向正常。
- JSON 中的 Y 轴和图片绘制方向相反，所以绘制时使用 `-y`。
- 图标会以坐标点为中心绘制，不是以左上角贴过去。

绘制图标的核心逻辑类似这样：

```js
ctx.drawImage(icon, point.x - width / 2, point.y - height / 2, width, height);
```

这意味着点位坐标代表图标中心。

## 地图图片选择规则

基础地图弹窗和阵营视角生成图使用的图片选择略有不同。

基础地图弹窗由 `overviewMapImageSources()` 决定：

1. 优先尝试 `baseImage`。
2. 再尝试 `map.png`。
3. 再尝试各阵营图片。

阵营视角图由 `mapImageSources(faction, mapData)` 决定。它会按以下顺序收集候选图片：

1. `factions[].image`
2. `map_<阵营id小写>.png`
3. 常见阵营命名：
   - `map_axis.png`
   - `map_allies.png`
   - `map_usmc.png`
   - `map_ija.png`
4. `map.png`

加载图片时使用 `setMapImageWithFallback()` 或 `loadFirstImageElement()`。前者用于页面内图片，后者用于 Canvas 生成。它们都会按候选列表逐个尝试，直到找到能加载的图片。

## 主要 JavaScript 状态

脚本中有几组全局状态，读代码时先认识它们会轻松很多。

```js
let vehicles = [];
let weapons = [];
let maps = [];
let currentMap = null;
const mapDataCache = new Map();
```

这些是主数据。

```js
let activeTab = "vehicles";
let compareMode = false;
let targetMode = false;
let selectedIndices = [];
let selectedWeaponIndices = [];
```

这些控制当前界面和选择模式。

```js
let weaponLookup = new Map();
let mapLookup = new Map();
let sortState = { key: null, mode: null };
let weaponSortState = { key: null, mode: null };
```

这些用于查找和排序。

```js
let targetVehicle = null;
let activeThreats = new Map();
let dragThreat = null;
let targetGeometry = null;
```

这些只服务于索敌优先级弹窗。

## 主要函数索引

下面按功能列一遍主要函数，方便接手时快速定位。

### 通用显示

- `escapeHtml(value)`：转义 HTML，防止数据直接插入时破坏页面结构。
- `safeDisplayHtml(value)`：允许少数特殊展示，其余走转义。
- `fmt(value)`：格式化数字，整数不显示小数。
- `displayValue(value)`：把空值、斜杠等显示成 `-`。
- `numericValue(value)`：从文本中提取数字，用于排序和对比。

### 数据加载

- `loadData()`：页面启动时加载三个主 JSON。
- `normalizeVehicle(vehicle)`：把载具中文字段整理成内部字段。
- `loadMapData(mapId)`：按需读取地图详情 JSON。
- `normalizeMapData(mapData, summary)`：把地图详情和摘要合并成页面可用结构。

### 筛选和渲染

- `getFilteredList()`：过滤载具。
- `getFilteredWeapons()`：过滤枪械。
- `getFilteredMaps()`：过滤地图。
- `applyView()`：根据当前标签渲染对应表格。
- `scheduleApplyView()`：用 `requestAnimationFrame` 合并渲染请求。
- `renderTable(list)`：渲染载具表。
- `renderWeaponTable(list)`：渲染枪械表。
- `renderMapTable(list)`：渲染地图表。

### 地图按钮

- `mapPerspectiveButtons(map)`：根据阵营和状态生成视角按钮。
- `mapPerspectiveButton(mapId, faction, state, ownerLabel)`：生成单个视角按钮。
- `primaryMapState(map, factionId)`：单阵营地图选择默认状态。
- `enemyFactionFor(factionId, factions)`：根据当前阵营推断敌方阵营。
- `factionMeta(factionId)`：提供 Axis、Allies、USMC、IJA 的中文标签和默认图片。

### 地图弹窗和生成图

- `openMapDetail(mapId)`：打开基础地图弹窗。
- `renderMapDetail()`：把基础地图图片放入弹窗。
- `overviewMapImageSources(mapData)`：生成基础地图候选图片列表。
- `mapImageNames(faction)`：生成某阵营视角的候选图片名。
- `mapImageSources(faction, mapData)`：生成某阵营视角的候选图片路径。
- `setMapImageWithFallback(imageElement, faction, sourceList)`：页面内图片加载失败时自动换候选。
- `loadFirstImageElement(srcList)`：Canvas 生成前按候选列表加载第一张可用图片。
- `openProcessedMap(factionId, mapData, popup, state)`：生成带图标的地图 PNG。
- `mapItemsForPerspective(mapData, factionId, state)`：从新格式中取出对应状态的设施点。
- `mapPointToCanvas(item, canvas, mapData)`：把 JSON 坐标转换成 Canvas 坐标。

### 详情和对比

- `openDetail(index)`：打开载具详情。
- `openWeaponDetail(index)`：打开枪械详情。
- `setCompareMode(enabled)`：开启或关闭对比模式。
- `toggleRowSelection(index)`：选择对比对象。
- `openComparison(indexA, indexB)`：打开载具对比。
- `openWeaponComparison(indexA, indexB)`：打开枪械对比。
- `buildCompareRows(a, b, aHitsB, bHitsA)`：生成载具对比指标。
- `weaponCompareRows(a, b)`：生成枪械对比指标。

### 索敌优先级

- `openTargetOptimizer(index)`：打开索敌弹窗。
- `getThreatFactors(vehicle)`：根据载具武器和类型生成威胁系数。
- `renderThreatButtons()`：渲染威胁类型按钮。
- `toggleThreat(tag)`：添加或移除威胁点。
- `placeThreat(item, x, y)`：放置威胁点，并避开坦克模型和其他威胁点。
- `threatScore(item, geometry)`：计算威胁分。
- `updateThreatScores(allowReorder)`：刷新排行。
- `renderPriorityList(items, topTag, allowReorder)`：渲染右侧优先级列表。

## 事件流

页面的事件绑定集中在脚本后半部分。

常见事件如下：

- 搜索框 `input`：调用 `scheduleApplyView()`。
- 标签按钮 `click`：调用 `setActiveTab()`。
- 表头 `click`：切换排序状态。
- 载具表行 `click`：根据当前模式打开详情、选择对比或打开索敌工具。
- 枪械表行 `click`：打开枪械详情或选择对比。
- 地图行按钮 `click`：打开基础地图弹窗或生成视角地图。
- 弹窗背景 `click`：点击遮罩关闭弹窗。
- `Escape`：关闭当前弹窗或退出当前模式。
- 索敌点 `pointerdown / pointermove / pointerup`：拖拽威胁点并重新计算优先级。

地图视角按钮的点击流程稍微特殊。浏览器通常只允许用户点击时直接打开新标签页，所以代码会先 `window.open()`，再异步读取地图 JSON、加载地图图片、生成 Canvas。这样生成过程慢一点也不会被浏览器拦截。

## 数据之间的关系

几类数据之间的关系可以这样理解：

```text
data/maps.json
  只负责地图列表和视角摘要
  指向 maps/<地图名>/map-data.json

maps/<地图名>/map-data.json
  保存某张地图的完整刷新点
  每个点用 key 指向 vehicles/*.vehicle
  每个点用 icon 指向 images/*.png

vehicles/*.vehicle
  保存原始载具定义
  map_view_atlas_index 可以核对 icon

images/*.png
  实际显示在地图上的小图标
```

地图生成图时，真正参与绘制的是：

```text
maps/<地图名>/<视角图片>.png
maps/<地图名>/map-data.json
images/<icon>.png
```

`vehicles` 目录更多是用来理解和核对，不参与页面运行时加载。

## 命名约定

阵营 id 当前使用这些值：

```text
Axis    德军
Allies  盟军
USMC    美军
IJA     日军
```

地图系列当前按 id 判断：

```text
edelweiss*  雪绒花
island*     太平洋
```

地图图片常见命名：

```text
map.png
map_axis.png
map_allies.png
map_usmc.png
map_ija.png
```

地图详情文件固定叫：

```text
map-data.json
```

图标文件固定用数字命名：

```text
images/<icon>.png
```

## 性能处理

这个页面虽然是单文件，但做了一些轻量处理来保证使用时不发涩。

数据加载方面：

- 三个主 JSON 用 `Promise.all()` 并行请求。
- 地图详情 JSON 按需加载，不在启动时一次性读完。
- 已加载过的地图详情会放入 `mapDataCache`。

渲染方面：

- 搜索输入通过 `scheduleApplyView()` 合并到下一帧。
- 表格只渲染当前标签页需要的内容。
- 弹窗内容打开时再生成。

地图生成方面：

- 同一张生成图里的图标会用 `iconCache` 缓存。
- Canvas 只创建一张和底图同尺寸的画布。
- 生成结果用 Blob URL 放到新标签页，不把大图直接塞进主页面。

索敌工具方面：

- 拖拽时用 `transform: translate3d(...)` 移动节点。
- 威胁分更新通过 `requestAnimationFrame` 节流。
- 排名变化使用已有 DOM 节点做动画，不是每次完全重建。

## 当前页面能力

这个项目现在能完成这些事情：

- 浏览载具参数。
- 按关键词过滤载具。
- 按关键字段排序载具。
- 打开载具详情。
- 对比两个载具。
- 计算反坦克武器对载具的命中效果。
- 浏览枪械参数。
- 按关键词过滤枪械。
- 按关键字段排序枪械。
- 打开枪械详情。
- 对比两个枪械。
- 选择某个载具，模拟不同威胁类型的索敌优先级。
- 浏览地图列表。
- 打开基础地图。
- 按阵营视角和占领状态生成带设施图标的地图。
- 在新标签页查看生成后的地图，并切换适应窗口/原始尺寸。

## 阅读代码的顺序

如果是第一次看这个项目，比较顺的阅读顺序是：

1. 先看 `data/maps.json`，理解地图摘要现在保留哪些东西。
2. 再看任意一个 `maps/<地图名>/map-data.json`，理解 `views` 的层级。
3. 打开 `index.html`，先看 HTML 里的三个表格和四个弹窗。
4. 看 CSS 里的 `.main`、`.table-wrap`、`.modal`、`.map-*`、`.target-*`。
5. 看脚本里的 `loadData()`，理解启动流程。
6. 看 `applyView()`，理解标签页怎么切换渲染。
7. 看 `renderMapTable()`、`openProcessedMap()` 和 `mapPointToCanvas()`，理解地图功能。
8. 最后再看载具对比和索敌工具，因为这两块逻辑更细。

这样读下来，不太容易被 `index.html` 的长度吓住。它虽然长，但大部分函数都是按功能顺序摆着的，真正跨模块耦合的地方并不多。

