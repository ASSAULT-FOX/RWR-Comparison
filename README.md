# RWR 参数查询器

这是一个用于浏览和对比 Running With Rifles DLC 数据的纯前端工具。项目把枪械、载具、地图和地图设施点位整理成静态网页，打开后可以查询参数、排序、对比，并生成带设施图标的地图视图。

项目没有后端，也没有前端构建流程。浏览器直接打开 `index.html`，然后通过 `fetch()` 读取 `data/` 和 `maps/` 目录中的 JSON 文件。

推荐本地运行方式：

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

然后访问：

```text
http://127.0.0.1:8765/index.html
```

## 项目结构

```text
.
├── index.html                    页面入口，HTML、CSS、JavaScript 都在这里
├── sw.js                         Service Worker，用于缓存静态资源
├── ico.webp                      网页图标
├── asset-manifest.json           静态资源哈希清单，由脚本生成
├── build-asset-manifest.js       生成 asset-manifest.json 的脚本
├── update-assets-and-upload.bat  更新数据、刷新资源清单并上传的脚本
├── scripts/
│   └── sync-csv-json.js          CSV 和 JSON 同步脚本
├── csv/
│   ├── weapons.csv               枪械源数据，开发时主要编辑它
│   └── vehicles.csv              载具源数据，开发时主要编辑它
├── data/
│   ├── weapons.json              枪械发布数据，由 CSV 生成
│   ├── vehicles.json             载具发布数据，由 CSV 生成
│   └── maps.json                 地图摘要数据
├── maps/                         每张地图的图片和 map-data.json
├── images/                       地图叠加用的小图标
├── weapons_textures/             枪械图标
└── vehicles_textures/            载具图标
```

## 数据维护流程

当前项目采用“CSV 作为源数据，JSON 作为发布数据”的方式。

开发时主要修改：

```text
csv/weapons.csv
csv/vehicles.csv
```

网页运行时读取：

```text
data/weapons.json
data/vehicles.json
data/maps.json
maps/<地图名>/map-data.json
```

也就是说，开发者不需要手工维护大量 JSON。修改枪械或载具数据时，直接编辑 CSV 文件即可。上传前点击 `update-assets-and-upload.bat`，脚本会自动把 CSV 内容更新到对应 JSON 中。

## 上传脚本流程

`update-assets-and-upload.bat` 当前流程如下：

```text
1. node scripts/sync-csv-json.js csv-to-json
2. node build-asset-manifest.js
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

如果 CSV 转换后的 JSON 内容和现有 JSON 完全一致，脚本不会重写 JSON 文件。这样资源哈希不会无意义变化，也就不会让用户浏览器因为哈希变化而重新请求没有变化的数据资源。

第二步会更新 `asset-manifest.json`。如果所有资源文件的哈希都没有变化，`asset-manifest.json` 也不会仅因为生成时间不同而重写。

第三步执行 `git upup`，用于上传当前变更。

## CSV 编辑说明

### weapons.csv

`csv/weapons.csv` 是枪械数据源。常见字段包括：

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

新增枪械时，在 CSV 中增加一行即可。建议保持 `id` 唯一，并确认 `图标` 对应 `weapons_textures/` 中存在的文件。

### vehicles.csv

`csv/vehicles.csv` 是载具数据源。常见字段包括：

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

新增载具时，在 CSV 中增加一行即可。`图标号` 对应 `vehicles_textures/` 中的图标编号。

### 空值规则

CSV 中留空的单元格会转换成 JSON 的 `null`。

例如：

```csv
炮塔转速,装填速度
,
```

会生成：

```json
{
  "炮塔转速": null,
  "装填速度": null
}
```

数字字段会按现有 JSON 的字段类型转换成数字。文本字段保持文本。比如 `视野修正` 中的 `1x` 会保留为字符串。

建议使用支持 UTF-8 CSV 的编辑器或 Excel 打开。当前 CSV 文件带 UTF-8 BOM，正常情况下 Excel 可以识别中文。

## JSON 数据说明

### data/weapons.json

这是网页运行时读取的枪械数据。它由 `csv/weapons.csv` 生成，不建议手工编辑。

网页中的枪械页会用它渲染：

```text
枪械列表
枪械详情
枪械对比
搜索和排序
```

### data/vehicles.json

这是网页运行时读取的载具数据。它由 `csv/vehicles.csv` 生成，不建议手工编辑。

网页中的载具页会用它渲染：

```text
载具列表
载具详情
载具对比
索敌优先级工具
搜索和排序
```

### data/maps.json

这是地图摘要数据。它负责告诉页面有哪些地图、地图属于哪个系列、每张地图有哪些阵营视角，以及详细点位 JSON 在哪里。

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

这是某张地图的完整设施点位数据。地图详情不是启动时全部加载，而是在用户打开某张地图时按需读取。

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

字段说明：

```text
map           地图 id
source        点位来源文件记录
spawn_ranges  阵营刷新区域
views         按阵营和视图状态分组的点位
key           设施或载具 key
icon          地图图标编号，对应 images/<编号>.webp
x, y          地图坐标
layer         原始图层信息
```

## 前端加载流程

页面启动时会并行读取三个主 JSON：

```js
fetch("data/vehicles.json")
fetch("data/weapons.json")
fetch("data/maps.json")
```

然后执行数据规范化，建立搜索文本、排序字段和查找表。

地图详情数据不会启动时全部读取。用户打开地图或生成某个阵营视角时，页面才读取：

```text
maps/<地图名>/map-data.json
```

这样可以避免首次加载过重。

## 缓存和资源哈希

`asset-manifest.json` 保存静态资源的 SHA-256 哈希和整体版本号。Service Worker 会使用它判断资源是否变化。

生成规则：

```text
data/
images/
maps/
vehicles_textures/
weapons_textures/
index.html
sw.js
ico.webp
```

如果文件内容没变，对应哈希不变。现在 `build-asset-manifest.js` 会在资源哈希完全一致时保持 `asset-manifest.json` 不变，避免无意义刷新版本。

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
node build-asset-manifest.js
```

本地启动静态服务器：

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

完整上传流程：

```powershell
.\update-assets-and-upload.bat
```

## 维护建议

- 修改枪械和载具数据时，优先编辑 `csv/` 目录下的 CSV。
- 不建议直接编辑 `data/weapons.json` 和 `data/vehicles.json`，因为下次从 CSV 生成时会覆盖它们。
- 新增枪械或载具后，检查图标文件是否存在。
- 修改地图点位时，确认 `map-data.json` 中的 `icon` 能在 `images/` 中找到对应图标。
- 上传前运行 BAT，让 CSV、JSON 和资源清单保持一致。
- 如果只是重新运行脚本但数据没有变化，JSON 和资源清单不会被重写，用户浏览器也不会因为哈希变化而重新请求资源。
