# RWR 参数查询器

这是一个用于浏览和对比 Running With Rifles DLC 数据的纯前端静态工具。页面可以查询枪械参数、载具参数、地图信息、地图设施点位和载具模型，并支持排序、搜索、详情弹窗、双对象对比、索敌优先级计算、生成带设施图标的地图视图，以及在独立页面中查看 GLB 模型。

项目没有后端，也没有前端打包流程。浏览器加载 `index.html` 后，通过 `fetch()` 读取 `data/`、`maps/` 和 `model/` 目录中的 JSON 文件，再在前端完成渲染和交互。

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
枪械数据      144 条，来源 csv/weapons.csv，发布到 data/weapons.json
载具数据       34 条，来源 csv/vehicles.csv，发布到 data/vehicles.json
地图摘要       20 条，保存在 data/maps.json
地图点位文件   20 个，保存在 maps/<地图名>/map-data.json
地图点位     3054 个，按阵营和视图状态分组
模型数据       71 条，保存在 model/models.json，模型文件保存在 model/<安全英文id>/
```

## 项目结构

```text
.
├── index.html                    页面入口，HTML、CSS、JavaScript 都在这里
├── sw.js                         Service Worker，负责静态资源缓存和哈希校验
├── ico.webp                      网页图标
├── splash.webp                   首页顶部操作容器左侧的品牌图
├── update-assets-and-upload.bat  更新数据、刷新资源清单并上传的脚本
├── convert_png_to_webp.py        PNG 转 WebP 的辅助脚本
├── README.md                     当前说明文档，UTF-8 with BOM 编码
├── scripts/
│   ├── sync-csv-json.js          CSV 和 JSON 同步脚本
│   └── build-asset-manifest.js   生成 data/asset-manifest.json 的脚本
├── csv/
│   ├── weapons.csv               枪械源数据，开发时主要编辑它
│   └── vehicles.csv              载具源数据，开发时主要编辑它
├── data/
│   ├── weapons.json              枪械发布数据，由 csv/weapons.csv 生成
│   ├── vehicles.json             载具发布数据，由 csv/vehicles.csv 生成
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
├── maps_textures/                地图叠加视图、载具表格和模型查询共用的设施/载具图标
└── weapons_textures/             枪械表格和详情使用的图标
```

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
model/models.json
maps/<地图名>/map-data.json
```

这样做的原因是：CSV 更适合人工增删改查，Excel 或表格编辑器可以直接筛选、排序、批量编辑；JSON 更适合网页读取，结构稳定，浏览器可以直接解析。

不建议手工编辑 `data/weapons.json` 和 `data/vehicles.json`，因为下次执行 CSV 同步时会用 CSV 重新生成它们。

## 上传脚本流程

点击 `update-assets-and-upload.bat` 时，当前流程是：

```text
1. node scripts/sync-csv-json.js csv-to-json
2. node scripts/build-asset-manifest.js
3. git upup
```

第一步会读取：

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

第二步会扫描静态资源并生成 `data/asset-manifest.json`。如果所有参与清单的文件哈希都没有变化，脚本不会仅因为 `generatedAt` 不同而重写清单。

第三步执行 `git upup`，用于把当前变更上传到 Git。

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

CSV 文件使用 UTF-8 with BOM 编码，Excel 通常可以正常识别中文。保存时建议继续使用 CSV UTF-8。

## JSON 数据说明

### data/weapons.json

这是网页运行时读取的枪械发布数据，由 `csv/weapons.csv` 生成。枪械页会用它渲染：

```text
枪械列表
枪械详情
枪械对比
搜索
排序
```

### data/vehicles.json

这是网页运行时读取的载具发布数据，由 `csv/vehicles.csv` 生成。载具页会用它渲染：

```text
载具列表
载具详情
载具对比
索敌优先级工具
搜索
排序
```

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

这是模型查询页运行时读取的模型清单。清单中的 `name` 是模型查询页显示的中文载具名，建议对应 `data/vehicles.json` 中的 `载具名`，这样可以精确匹配载具图标。

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

`icon` 对应 `maps_textures/<编号>.webp`。模型查询页会优先使用模型清单里的 `icon`，没有写明时再尝试按 `name` 匹配 `data/vehicles.json` 中的 `图标号`。

## 前端功能

`index.html` 包含页面结构、样式和全部前端逻辑。页面主要分为四个功能区：

```text
载具查询
枪械查询
地图查询
模型查询
```

载具查询支持列表、搜索、排序、详情、对比和索敌优先级工具。

枪械查询支持列表、搜索、排序、详情和对比。

地图查询使用和模型查询一致的卡片式布局，按雪绒花和太平洋分组显示，分组标题只保留放大的系列徽标文字，不再显示“系列”或地图数量；桌面端系列徽标约为普通阵营徽标的 2 倍，并保留适中的容器顶部留白；每张卡片展示地图缩略图和地图名，悬停时有卡片抬升动效。点击地图卡片后打开基础地图预览，弹窗右侧提供按阵营和占领状态生成带设施图标地图视图的按钮，按钮宽度按文字内容收缩并保留左右留白，外层使用和地图图片区一致的圆角容器；手机端这些按钮会移动到地图下方。

模型查询支持从 `model/models.json` 列出模型、优先使用模型清单中的 `icon` 显示 `maps_textures/<图标号>.webp`，没有 `icon` 时再按载具名匹配 `data/vehicles.json` 中的 `图标号`。点击“查看模型”会打开 `model-viewer.html`，使用 Three.js、GLTFLoader 和 OrbitControls 加载 GLB，支持旋转、平移、滚轮缩放和部件显示/隐藏。模型查看页右侧的部件显示控制为单列纵向列表，按钮列宽按最长部件名收缩，部件较多时在面板内上下滚动；渲染器会在低 DPR 屏幕上使用轻量超采样，并保留贴图原始分辨率和各向异性过滤。

页面包含移动端适配：`860px` 以下顶部操作栏纵向排列并保持在表格滚动层上方，主查询表格保留完整列宽并限制在 `.table-wrap` 内上下和左右滚动，避免页面主体被宽表格撑出横向滚动，同时保证手机端可以继续纵向浏览更多行；载具对比和枪械对比弹窗在手机端也保留完整三栏对比结构，并在弹窗内容区内左右滑动查看。`640px` 以下主导航折叠为“菜单”按钮，详情、地图和索敌优先级弹窗贴合手机视口显示，按钮和输入框保持触控友好的高度与间距。桌面端从其他分类切换到地图查询或模型查询时，列表滚动位置会回到顶部，避免沿用上一分类停留的行位置。

主页面视觉结构分为两个独立容器：上方操作容器左侧放大显示 `splash.webp` 并进一步向左对齐，图片放大时不增加顶栏高度而是压缩上下留白；中间居中显示查询分类 TAG，右侧显示搜索框并向右对齐；下方内容容器承载比较工具条、索敌入口和各查询结果，中间保留间距以分隔导航和数据内容。顶部三个控件区域使用较大的固定高度和宽度，内容容器不再使用外层阴影遮罩；地图查询和模型查询页会隐藏无操作意义的提示条。页面保留卡片动效和毛玻璃模糊效果，同时通过较轻的模糊半径、较小阴影、GPU 友好的 transform 动画、滚动容器隔离和卡片分组内容可见性控制降低重绘压力。`splash.webp` 由 `convert_png_to_webp.py` 从原始 PNG 转换生成并裁掉透明边距，原始 PNG 不再保留。

模型查看页在 `720px` 以下会显示“操作说明”按钮，点击后展开手势说明抽屉；光照滑动条固定在页面底栏，避免占用模型主要显示区域；模块显示入口放在操作说明下方，点击“模块显示”后从右侧滑出窄侧栏，侧栏中的模块按钮使用 `1`、`2`、`3` 这样的数字标识以节省空间，并以单列纵向排列，模块数量超出侧栏高度时可在侧栏内上下滑动。手机端说明使用触控逻辑和手机图标：单指滑动屏幕查看模型，双指张合缩放模型，双指同时拖动移动视角。`420px` 以下会进一步压缩标题、光照控件和部件按钮宽度，适配更窄屏幕。

移动端验证方式：临时使用 Playwright 打开主站四个查询页、移动端菜单展开、载具详情、枪械详情、载具对比、枪械对比、索敌优先级弹窗、地图弹窗、独立模型查看页、模型操作说明和模块侧栏，并分别在 `360x800`、`390x844`、`414x896`、`430x932`、`768x1024`、`1920x1080` 视口截图检查。后续回归还验证了手机端主表可同时左右和上下滚动、表格内容不会绘制到顶部操作栏上、手机端模型说明不显示桌面鼠标操作文案或桌面图标、手机端光照栏位于底栏、模块按钮使用数字侧栏、桌面端切换到地图查询和模型查询会重置到列表顶部。验证用 Playwright 依赖、脚本和截图临时目录已在验证后删除，不保留在项目中。

页面启动时会先检查资源清单，再并行读取四个主 JSON：

```js
fetch("data/vehicles.json")
fetch("data/weapons.json")
fetch("data/maps.json")
fetch("model/models.json")
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
```

`README.md`、`csv/` 和 `scripts/` 不参与网页运行时加载，因此不写入资源清单。

页面启动时会使用 `cache: "no-store"` 请求：

```text
data/asset-manifest.json
```

如果清单请求失败，页面应当失败并显示网络错误，不允许使用旧缓存降级运行。原因是：清单是判断所有资源是否过期的根依据，请求失败时无法证明本地缓存仍然是最新版本。

如果清单版本和上次记录一致，页面可以继续使用缓存资源。

如果清单版本变化，页面会清理 `rwr-cache-*` 缓存，记录本次刷新版本，然后刷新一次页面，确保用户看到的是新资源。

Service Worker 处理普通静态资源时，也会先请求最新清单，并按清单中的 SHA-256 校验缓存内容：

```text
缓存文件存在，且内容哈希等于最新清单哈希      使用缓存
缓存文件不存在，或内容哈希不一致              请求网络资源
网络资源内容哈希等于最新清单哈希              写入缓存并返回
网络资源内容哈希不等于最新清单哈希            失败，不写入缓存
旧清单存在但新清单中已删除该文件              删除缓存并返回 410
清单请求失败                                  失败，不使用旧缓存降级
```

`data/asset-manifest.json` 本身使用 network-only 策略。请求失败就是失败，不从缓存返回旧清单。

## Service Worker 注意事项

`sw.js` 只在 HTTPS 环境注册。GitHub Pages 符合这个条件，本地 `http://127.0.0.1` 调试时不会注册 Service Worker。

Service Worker 的缓存名以 `rwr-cache-` 开头。页面检测到资源清单版本变化时，会删除这些缓存。

如果修改了 `sw.js` 自身，记得运行上传脚本生成新的 `data/asset-manifest.json`，因为 `sw.js` 也在资源清单中。

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

本地启动静态服务器：

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

执行完整上传流程：

```powershell
.\update-assets-and-upload.bat
```

## 维护建议

- 修改枪械和载具数据时，优先编辑 `csv/` 目录下的 CSV。
- 不建议直接编辑 `data/weapons.json` 和 `data/vehicles.json`。
- 新增枪械后，检查 `weapons_textures/` 中是否存在对应图标。
- 新增载具后，检查 `maps_textures/` 中是否存在对应编号图标。
- 新增模型时，在 `model/` 下创建安全英文 id 子目录，放入同一模型对应的 `.glb` 和可选 `.blend`，然后手动在 `model/models.json` 中增加对应条目。
- 模型查询页的图标优先来自 `model/models.json` 的 `icon`，缺失时会尝试按 `name` 匹配 `data/vehicles.json` 中的 `图标号`；精确显示建议直接维护 `icon`。
- 修改地图点位后，检查 `map-data.json` 中的 `icon` 是否能在 `maps_textures/` 中找到。
- 上传前运行 `update-assets-and-upload.bat`，让 CSV、JSON、资源清单和 Git 上传保持同一流程。
- 如果数据和资源没有变化，JSON 和资源清单都不会被重写，用户浏览器也不会因为无意义哈希变化重新请求资源。
