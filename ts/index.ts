// @ts-nocheck
let vehicles = [];
let weapons = [];
let maps = [];
let models = [];
let players = [];
let playerRankings = {};
let currentMap = null;
const mapDataCache = new Map();

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const tagTabs = document.querySelectorAll(".tag-tab");
const tableWrap = document.querySelector(".table-wrap");
const vehicleTable = document.getElementById("vehicleTable");
const weaponTable = document.getElementById("weaponTable");
const playerTable = document.getElementById("playerTable");
const mapTable = document.getElementById("mapTable");
const modelTable = document.getElementById("modelTable");
const rowsEl = document.getElementById("vehicleRows");
const weaponRowsEl = document.getElementById("weaponRows");
const playerRowsEl = document.getElementById("playerRows");
const mapRowsEl = document.getElementById("mapRows");
const modelRowsEl = document.getElementById("modelRows");
const playerPaginationPanel = document.getElementById("playerPaginationPanel");
const playerPaginationEl = document.getElementById("playerPagination");
const loadingPanel = document.getElementById("loadingPanel");
const searchInput = document.getElementById("searchInput");
const compareBar = document.querySelector(".compare-bar");
const compareBtn = document.getElementById("compareBtn");
const confirmCompareBtn = document.getElementById("confirmCompareBtn");
const compareHint = document.getElementById("compareHint");
const modal = document.getElementById("compareModal");
const closeModal = document.getElementById("closeModal");
const compareCards = document.getElementById("compareCards");
const compareMetrics = document.getElementById("compareMetrics");
const detailModal = document.getElementById("detailModal");
const closeDetailModal = document.getElementById("closeDetailModal");
const detailTitle = document.getElementById("detailTitle");
const detailHero = document.getElementById("detailHero");
const detailRows = document.getElementById("detailRows");
const targetModeBtn = document.getElementById("targetModeBtn");
const targetHint = document.getElementById("targetHint");
const targetModal = document.getElementById("targetModal");
const closeTargetModal = document.getElementById("closeTargetModal");
const targetTitle = document.getElementById("targetTitle");
const targetStage = document.getElementById("targetStage");
const targetTank = document.getElementById("targetTank");
const targetTankLabel = document.getElementById("targetTankLabel");
const threatButtons = document.getElementById("threatButtons");
const priorityList = document.getElementById("priorityList");
const mapModal = document.getElementById("mapModal");
const closeMapModal = document.getElementById("closeMapModal");
const mapTitle = document.getElementById("mapTitle");
const mapStage = document.getElementById("mapStage");
const mapPerspectiveActions = document.getElementById("mapPerspectiveActions");
const mapLoadingSubtitle = document.getElementById("mapLoadingSubtitle");
const mapImage = document.getElementById("mapImage");
const toast = document.getElementById("toast");
const weaponSections = [
  {
    title: "基本信息",
    detailFields: ["类型", "致死", "射击间隔", "弹速", "射速", "弹容", "速度修正", "视野修正", "缩圈速率"],
    compareFields: ["致死", "弹速", "射速", "弹容", "速度修正", "视野修正", "缩圈速率"]
  },
  {
    title: "精度",
    fields: ["基础精度", "站立精度", "蹲伏精度", "趴下精度", "架枪精度"]
  },
  {
    title: "后坐力",
    fields: ["单发后坐力", "后坐力恢复", "持续射击一秒恢复时间"]
  },
  {
    title: "伤害衰减",
    fields: ["衰减开始距离", "衰减结束距离", "衰减开始时间", "衰减结束时间"]
  }
];
const vehicleHigherBetter = new Set(["hp", "speed", "acceleration", "turret", "threshold", "reduction", "vision", "blast"]);
const playerSortKeys = new Set(["xp", "kills", "deaths", "kd_ratio", "longest_kill_streak"]);
const playerRankFields = [
  { key: "xp", label: "XP" },
  { key: "kills", label: "击杀" },
  { key: "deaths", label: "死亡" },
  { key: "score", label: "分数" },
  { key: "kd_ratio", label: "KD" },
  { key: "time_played", label: "游戏时间" },
  { key: "longest_kill_streak", label: "最长连杀" },
  { key: "targets_destroyed", label: "摧毁目标" },
  { key: "vehicles_destroyed", label: "摧毁车辆" },
  { key: "soldiers_healed", label: "治疗士兵" },
  { key: "teamkills", label: "误伤" },
  { key: "distance_moved", label: "移动距离" },
  { key: "shots_fired", label: "开火次数" },
  { key: "throwables_thrown", label: "投掷物次数" }
];
const playerDetailSections = [
  {
    title: "战斗统计",
    rows: [
      { key: "xp", label: "XP", ranked: true },
      { key: "kills", label: "击杀", ranked: true },
      { key: "deaths", label: "死亡", ranked: true },
      { key: "score", label: "分数", ranked: true },
      { key: "kd_ratio", label: "KD", ranked: true },
      { key: "time_played", label: "游戏时间", ranked: true, formatter: "time" },
      { key: "longest_kill_streak", label: "最长连杀", ranked: true }
    ]
  },
  {
    title: "贡献统计",
    rows: [
      { key: "targets_destroyed", label: "摧毁目标", ranked: true },
      { key: "vehicles_destroyed", label: "摧毁车辆", ranked: true },
      { key: "soldiers_healed", label: "治疗士兵", ranked: true },
      { key: "teamkills", label: "误伤", ranked: true },
      { key: "distance_moved", label: "移动距离", ranked: true, formatter: "distance" },
      { key: "shots_fired", label: "开火次数", ranked: true },
      { key: "throwables_thrown", label: "投掷物次数", ranked: true }
    ]
  }
];
const modelFactionOrder = new Map([
  ["德军", 0],
  ["美军", 1],
  ["英军", 2],
  ["日军", 3],
  ["通用", 4],
  ["公用", 4],
  ["设施", 5]
]);
const weaponHigherBetter = new Set([
  "致死",
  "弹容",
  "精度",
  "基础精度",
  "姿态精度修正-站",
  "姿态精度修正-蹲",
  "姿态精度修正-趴",
  "姿态精度修正-架",
  "弹速",
  "速度修正",
  "后坐力恢复",
  "缩圈速率",
  "射速",
  "衰减开始时间",
  "衰减开始距离",
  "衰减结束时间",
  "衰减结束距离",
  "视野修正",
  "各姿态精度-站立",
  "各姿态精度-蹲伏",
  "各姿态精度-趴下",
  "各姿态精度-架枪",
  "站立精度",
  "蹲伏精度",
  "趴下精度",
  "架枪精度"
]);
let activeTab = "vehicles";
let compareMode = false;
let targetMode = false;
let selectedIndices = [];
let selectedWeaponIndices = [];
let currentList = [];
let filteredList = [];
let currentWeaponList = [];
let filteredWeaponList = [];
let currentPlayerList = [];
let filteredPlayerList = [];
let weaponLookup = new Map();
let mapLookup = new Map();
let sortState = { key: null, mode: null };
let weaponSortState = { key: null, mode: null };
let playerSortState = { key: null, mode: null };
let playerPage = 1;
let viewFrame = null;
let scoreFrame = null;
let pendingScoreUpdate = false;
let sortableHeaders = [];
let canUseCachedResources = false;
let assetManifestPaths = null;
const imagePromiseCache = new Map();
const idle = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 1));
const antiTankWeapons = [
  { label: "反坦克枪榴弹", file: "kar98k_rifle_grenade_at.weapon", blast: 2.3 },
  { label: "巴祖卡火箭筒", file: "m1_bazooka.weapon", blast: 4.4 },
  { label: "M18无后座力炮", file: "m18_recoilless_rifle.weapon", blast: 4.4 },
  { label: "四式火箭筒", file: "type4_rocket_launcher.weapon", blast: 4.4 },
  { label: "铁拳发射器", file: "panzerfaust.weapon", blast: 5.4 },
  { label: "PIAT发射器", file: "piat.weapon", blast: 5.4 },
  { label: "M1巴祖卡火箭筒", file: "m9a1_bazooka.weapon", blast: 4.7 },
  { label: "坦克杀手火箭筒", file: "panzerschreck.weapon", blast: 4.7 },
  { label: "固定式火炮", file: "at_gun.projectile", blast: 6.4 },
  { label: "固定式重型迫击炮", file: "heavy_mortar_shell.projectile", blast: 3.9 },
  { label: "堡垒化炮塔火炮", file: "at_gun_fortified_turret_cannon.projectile", blast: 4.7 },
  { label: "堡垒化炮塔迫击炮", file: "at_gun_fortified_turret_grenade_launcher.projectile", blast: 1.0 },
  { label: "轻型迫击炮", file: "mortar_shell.projectile", blast: 1.9 },
  { label: "航空火箭弹", file: "air_strike_rocket.projectile", blast: 4.4 },
  { label: "航空炸弹", file: "air_strike_bomb.projectile", blast: 8.0 },
  { label: "轻型舰炮", file: "artillery_shell.projectile", blast: 2.4 },
  { label: "喷烟者火箭炮", file: "rocket_mortar.projectile", blast: 6.9 },
  { label: "重型舰炮", file: "naval_artillery_shell.projectile", blast: 8.9 }
];
const threatNames = {
  "light_vehicle": "轻型载具",
  "ligh_vehicle": "轻型载具",
  "light_armour": "轻型装甲",
  "medium_armour": "中型装甲",
  "heavy_armour": "重型装甲",
  "at_gun": "反坦克炮",
  "light_at_gun": "防空炮",
  "defensive_weapon": "架设武器",
  "bazooka": "反坦克兵",
  "": "其他",
  "未定义": "未定义"
};
const threatShortNames = {
  "light_vehicle": "轻载",
  "light_armour": "轻甲",
  "medium_armour": "中甲",
  "heavy_armour": "重甲",
  "at_gun": "AT炮",
  "light_at_gun": "防空",
  "defensive_weapon": "架设",
  "bazooka": "AT兵",
  "": "其他"
};
const threatColors = {
  "light_vehicle": "#57b8ff",
  "light_armour": "#4fc3a1",
  "medium_armour": "#7c83ff",
  "heavy_armour": "#6b7a90",
  "at_gun": "#2f80ed",
  "light_at_gun": "#58a6a6",
  "defensive_weapon": "#8d7bd4",
  "bazooka": "#138a72",
  "": "#7d8a94"
};
const mediumCannonThreats = [["",1,0,1,0.5],["heavy_armour",1,0,1,3],["medium_armour",1,0,1,6],["light_armour",1,0,1,5.5],["at_gun",1,0,1,5.5],["light_at_gun",1,0,1,4],["bazooka",1,0,1,3.5],["light_vehicle",1,0,1,2.5],["defensive_weapon",1,0,1,2]];
const tankDestroyerThreats = [["",1,0,1,0.5],["heavy_armour",1,0,1,8],["medium_armour",1,0,1,6],["light_armour",1,0,1,5],["at_gun",1,0,1,5.5],["light_at_gun",1,0,1,4],["bazooka",1,0,1,3.5],["light_vehicle",1,0,1,2.5],["defensive_weapon",1,0,1,2]];
const heavyCannonThreats = [["",1,0,1,0.5],["heavy_armour",1,0,1,10],["medium_armour",1,0,1,7],["light_armour",1,0,1,5.5],["at_gun",1,0,1,7.5],["light_at_gun",1,0,1,4],["bazooka",1,0,1,3.5],["light_vehicle",1,0,1,2.5],["defensive_weapon",1,0,1,2]];
const lightCannonThreats = [["",1,0,1,0.5],["heavy_armour",1,0,1,1],["medium_armour",1,0,1,3],["light_armour",1,0,1,6],["at_gun",1,0,1,5.5],["light_at_gun",1,0,1,4],["bazooka",1,0,1,3.5],["light_vehicle",1,0,1,2.5],["defensive_weapon",1,0,1,2]];
const stuartCannonThreats = [["",1,0,1,0.5],["heavy_armour",1,0,1,1],["medium_armour",1,0,1,4],["light_armour",1,0,1,6],["at_gun",1,0,1,5.5],["light_at_gun",1,0,1,4],["bazooka",1,0,1,3.5],["light_vehicle",1,0,1,2.5],["defensive_weapon",1,0,1,2]];
const lightFlakThreats = [["",1,0,1,0.5],["heavy_armour",1,0,1,0],["medium_armour",1,0,1,0],["light_armour",1,0,1,8],["light_vehicle",1,0,1,6]];
const boforsThreats = [["",1,0,1,0.5],["heavy_armour",1,0,1,0],["medium_armour",1,0,1,2],["light_armour",1,0,1,8],["light_vehicle",1,0,1,6]];
const recoillessThreats = [["",1,0,1,0.5],["heavy_armour",1,0,1,5],["medium_armour",1,0,1,6],["light_armour",1,0,1,6],["at_gun",1,0,1,2],["light_at_gun",1,0,1,2],["light_vehicle",1,0,1,4],["defensive_weapon",1,0,1,2]];
const mgThreats = [["",1,0,1,0.5],["bazooka",1,0,1,2]];
const katsuMgThreats = [["",1,0,1,0.5],["defensive_weapon",1,0,1,2],["bazooka",1,0,1,3],["light_armour",1,0,1,4],["light_vehicle",1,0,1,4],["light_at_gun",1,0,1,5],["at_gun",1,0,1,6]];
let targetVehicle = null;
let activeThreats = new Map();
let dragThreat = null;
let targetGeometry = null;

function factors(rows) {
  return rows.map(([tag, distance, direction, squadCommand, baseScore]) => ({ tag, distance, direction, squadCommand, baseScore }));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));
}

function safeDisplayHtml(value) {
  return value === '<span class="bad-word">太硬了</span>' ? value : escapeHtml(value);
}

function normalizeVehicle(vehicle) {
  return {
    faction: vehicle["阵营"] ?? vehicle.faction ?? "",
    hp: vehicle["生命值"] ?? vehicle.hp ?? null,
    speed: vehicle["最大速度"] ?? vehicle.speed ?? null,
    acceleration: vehicle["加速度"] ?? vehicle.acceleration ?? null,
    turret: vehicle["炮塔转速"] ?? vehicle.turret ?? null,
    threshold: vehicle["受击门槛"] ?? vehicle.threshold ?? null,
    reduction: vehicle["爆炸减伤"] ?? vehicle.reduction ?? null,
    name: vehicle["载具名"] ?? vehicle.name ?? "",
    weapon: vehicle["武器名"] ?? vehicle.weapon ?? "—",
    icon: vehicle["图标号"] ?? vehicle.icon ?? null,
    reload: vehicle["装填速度"] ?? vehicle.reload ?? null,
    vision: vehicle["玩家视野修正"] ?? vehicle.vision ?? null,
    blast: vehicle["爆炸伤害"] ?? vehicle.blast ?? null,
    vehicleType: vehicle["载具类型"] ?? vehicle.vehicleType ?? ""
  };
}

function setLoading(loading, subtitle = "正在请求并解析载具、枪械、地图、模型和玩家数据") {
  if (!loadingPanel) return;
  loadingPanel.classList.remove("error");
  loadingPanel.classList.toggle("open", loading);
  const titleEl = loadingPanel.querySelector(".loading-title");
  if (titleEl) titleEl.textContent = "正在加载数据";
  const subtitleEl = loadingPanel.querySelector(".loading-subtitle");
  if (subtitleEl) subtitleEl.textContent = subtitle;
}

function showNetworkError(message) {
  if (!loadingPanel) return;
  loadingPanel.classList.add("open", "error");
  const titleEl = loadingPanel.querySelector(".loading-title");
  const subtitleEl = loadingPanel.querySelector(".loading-subtitle");
  if (titleEl) titleEl.textContent = "网络错误";
  if (subtitleEl) subtitleEl.textContent = message || "资源加载失败，请检查网络后刷新页面";
}

async function loadData() {
  setLoading(true);
  const cacheMode = canUseCachedResources ? "force-cache" : "no-cache";
  const [vehicleResponse, weaponResponse, mapResponse, modelResponse, playerResponse] = await Promise.all([
    fetchWithTimeout("data/vehicles.json", { cache: cacheMode }, 10000),
    fetchWithTimeout("data/weapons.json", { cache: cacheMode }, 10000),
    fetchWithTimeout("data/maps.json", { cache: cacheMode }, 10000),
    fetchWithTimeout("model/models.json", { cache: cacheMode }, 10000),
    fetchWithTimeout("data/rwr-players-pacific.json", { cache: cacheMode }, 10000)
  ]);
  if (!vehicleResponse.ok) throw new Error(`载具数据加载失败：${vehicleResponse.status}`);
  if (!weaponResponse.ok) throw new Error(`枪械数据加载失败：${weaponResponse.status}`);
  if (!mapResponse.ok) throw new Error(`地图数据加载失败：${mapResponse.status}`);
  if (!modelResponse.ok) throw new Error(`模型数据加载失败：${modelResponse.status}`);
  if (!playerResponse.ok) throw new Error(`玩家数据加载失败：${playerResponse.status}`);
  const vehicleData = await vehicleResponse.json();
  const weaponData = await weaponResponse.json();
  const mapData = await mapResponse.json();
  const modelData = await modelResponse.json();
  const playerData = await playerResponse.json();
  if (!Array.isArray(vehicleData)) throw new Error("载具数据格式错误：根节点必须是数组");
  if (!Array.isArray(weaponData)) throw new Error("枪械数据格式错误：根节点必须是数组");
  if (!Array.isArray(mapData)) throw new Error("地图数据格式错误：根节点必须是数组");
  if (!Array.isArray(modelData)) throw new Error("模型数据格式错误：根节点必须是数组");
  const playerList = Array.isArray(playerData) ? playerData : playerData.players;
  if (!Array.isArray(playerList)) throw new Error("玩家数据格式错误：根节点或 players 必须是数组");
  vehicles = vehicleData.map((vehicle, index) => {
    const normalized = normalizeVehicle(vehicle);
    return {
      ...normalized,
      index,
      searchText: [normalized.faction, normalized.name, normalized.weapon].join("\n").toLowerCase()
    };
  });
  weapons = weaponData.map((weapon) => ({
    ...weapon,
    searchText: ["阵营", "类型", "枪械名称", "文件名称", "文件类型"].map((key) => String(weapon[key] || "")).join("\n").toLowerCase(),
    numeric: Object.fromEntries(Array.from(weaponHigherBetter, (key) => [key, numericValue(weapon[key])]))
  }));
  maps = mapData.map((map) => ({
    ...map,
    searchText: [map.group, map.name, map.id].join("\n").toLowerCase(),
    actionsHtml: null
  }));
  models = modelData.map((model, index) => ({
    ...model,
    id: model.id || String(index),
    icon: model.icon ?? model["图标号"] ?? null,
    index,
    searchText: [model.name, model.id, model.model, model.icon, model["图标号"]].join("\n").toLowerCase()
  }));
  players = playerList.map((player, index) => ({
    ...player,
    index,
    searchText: [player.username, player.leaderboard_position, player.xp, player.kills, player.score].join("\n").toLowerCase()
  }));
  playerRankings = buildPlayerRankings(players);
  weaponLookup = new Map(weapons.map((weapon) => [weapon.id, weapon]));
  mapLookup = new Map(maps.map((map) => [map.id, map]));
  currentList = vehicles;
  filteredList = vehicles;
  currentWeaponList = weapons;
  filteredWeaponList = weapons;
  currentPlayerList = players;
  filteredPlayerList = players;
}

function fmt(value) {
  if (value === null || value === undefined) return "—";
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

function displayValue(value) {
  return value === null || value === undefined || value === "" || value === "/" ? "-" : value;
}

function formatInteger(value) {
  if (value === null || value === undefined || value === "") return "-";
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toLocaleString("zh-CN") : displayValue(value);
}

function formatPlayerValue(player, key, formatter) {
  const value = player?.[key];
  if (formatter === "time") return formatSeconds(value);
  if (formatter === "distance") return value === null || value === undefined ? "-" : `${fmt(Number(value))} km`;
  if (key === "kd_ratio") return value === null || value === undefined ? "-" : fmt(Number(value));
  if (typeof value === "number") return formatInteger(value);
  return displayValue(value);
}

function formatSeconds(value) {
  if (value === null || value === undefined) return "-";
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) return displayValue(value);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = Math.floor(seconds % 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${rest}s`;
  return `${rest}s`;
}

function buildPlayerRankings(list) {
  const rankings = {};
  playerRankFields.forEach(({ key }) => {
    rankings[key] = new Map();
    const sorted = list
      .filter((player) => player[key] !== null && player[key] !== undefined && Number.isFinite(Number(player[key])))
      .slice()
      .sort((a, b) => {
        const diff = Number(b[key]) - Number(a[key]);
        return diff || a.index - b.index;
      });
    let rank = 0;
    let previousValue = null;
    sorted.forEach((player, index) => {
      const value = Number(player[key]);
      if (previousValue === null || value !== previousValue) rank = index + 1;
      rankings[key].set(player.index, rank);
      previousValue = value;
    });
  });
  return rankings;
}

function playerRank(player, key) {
  const rank = playerRankings[key]?.get(player.index);
  return rank ? `#${formatInteger(rank)}` : "-";
}

function weaponFieldDisplay(weapon, key) {
  if (key === "致死") return weaponKillDisplay(weapon);
  if (key === "射击间隔") {
    const value = numericValue(weapon[key]);
    return value !== null && value < 0 ? "栓动" : displayValue(weapon[key]);
  }
  if (key === "视野修正") {
    const value = displayValue(weapon[key]);
    return value === "-" ? value : String(value).replace(/x$/i, "");
  }
  return displayValue(weapon[key]);
}

function numericValue(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text || text === "/" || text === "—") return null;
  if (/^-?\d+(\.\d+)?\s*\*\s*-?\d+(\.\d+)?$/.test(text)) {
    return text.split("*").map(Number).reduce((total, item) => total * item, 1);
  }
  const match = text.replace(/x$/i, "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function weaponKillDisplay(weapon) {
  const value = displayValue(weapon["致死"]);
  if (value === "-") return value;
  if (!String(value).includes("爆炸")) return value;
  const numeric = numericValue(value);
  return `${numeric === null ? value.replace("爆炸", "") : fmt(numeric)}（爆炸）`;
}

function isExplosiveKill(value) {
  return String(value || "").includes("爆炸");
}

function factionClass(faction) {
  if (faction === "德军") return "de";
  if (faction === "美军") return "us";
  if (faction === "日军") return "jp";
  if (faction === "英军") return "uk";
  if (faction === "通用" || faction === "公用") return "common";
  return "";
}

function factionBadge(vehicle) {
  return `<span class="faction ${escapeHtml(factionClass(vehicle.faction))}">${escapeHtml(vehicle.faction)}</span>`;
}

function mapGroupClass(group) {
  return group === "雪绒花" ? "map-edelweiss" : "map-island";
}

function mapGroupBadge(group) {
  return `<span class="faction ${escapeHtml(mapGroupClass(group))}">${escapeHtml(group)}</span>`;
}

function isUnarmedVehicle(vehicle) {
  return !vehicle.weapon || vehicle.weapon === "—";
}

function vehicleTypeLabel(type) {
  return threatNames[type] || type || "未定义";
}

function getFilteredList() {
  const keyword = searchInput.value.trim().toLowerCase();
  if (!keyword) return vehicles;
  return vehicles.filter((vehicle) => vehicle.searchText.includes(keyword));
}

function getFilteredWeapons() {
  const keyword = searchInput.value.trim().toLowerCase();
  if (!keyword) return weapons;
  return weapons.filter((weapon) => weapon.searchText.includes(keyword));
}

function getFilteredMaps() {
  const keyword = searchInput.value.trim().toLowerCase();
  if (!keyword) return maps;
  return maps.filter((map) => map.searchText.includes(keyword));
}

function getFilteredModels() {
  const keyword = searchInput.value.trim().toLowerCase();
  const list = keyword
    ? models.filter((model) => model.searchText.includes(keyword))
    : models;
  return getSortedModels(list);
}

function getFilteredPlayers() {
  const keyword = searchInput.value.trim().toLowerCase();
  if (!keyword) return players;
  return players.filter((player) => player.searchText.includes(keyword));
}

function countDisplay(value) {
  return value ? String(value) : "-";
}

function getSortedList(list) {
  if (!sortState.key || !sortState.mode) return list.slice();
  const higherBetter = vehicleHigherBetter.has(sortState.key);
  const multiplier = sortState.mode === "advantage"
    ? (higherBetter ? -1 : 1)
    : (higherBetter ? 1 : -1);
  return list.slice().sort((a, b) => {
    const left = a[sortState.key];
    const right = b[sortState.key];
    const leftMissing = left === null || left === undefined;
    const rightMissing = right === null || right === undefined;
    if (leftMissing && rightMissing) return a.index - b.index;
    if (leftMissing) return 1;
    if (rightMissing) return -1;
    if (left === right) return a.index - b.index;
    return (left - right) * multiplier;
  });
}

function getSortedWeapons(list) {
  if (!weaponSortState.key || !weaponSortState.mode) return list.slice();
  const higherBetter = weaponHigherBetter.has(weaponSortState.key);
  const multiplier = weaponSortState.mode === "advantage"
    ? (higherBetter ? -1 : 1)
    : (higherBetter ? 1 : -1);
  return list.slice().sort((a, b) => {
    const left = a.numeric?.[weaponSortState.key] ?? numericValue(a[weaponSortState.key]);
    const right = b.numeric?.[weaponSortState.key] ?? numericValue(b[weaponSortState.key]);
    const leftMissing = left === null;
    const rightMissing = right === null;
    if (leftMissing && rightMissing) return a.id - b.id;
    if (leftMissing) return 1;
    if (rightMissing) return -1;
    if (left === right) return a.id - b.id;
    return (left - right) * multiplier;
  });
}

function getSortedModels(list) {
  return list.slice().sort((a, b) => {
    const left = modelFactionOrder.get(a.faction) ?? 99;
    const right = modelFactionOrder.get(b.faction) ?? 99;
    if (left !== right) return left - right;
    return a.index - b.index;
  });
}

function getSortedPlayers(list) {
  if (!playerSortState.key || !playerSortState.mode) return list.slice();
  const multiplier = playerSortState.mode === "advantage" ? -1 : 1;
  return list.slice().sort((a, b) => {
    const left = Number(a[playerSortState.key]);
    const right = Number(b[playerSortState.key]);
    const leftMissing = !Number.isFinite(left);
    const rightMissing = !Number.isFinite(right);
    if (leftMissing && rightMissing) return a.index - b.index;
    if (leftMissing) return 1;
    if (rightMissing) return -1;
    if (left === right) return a.index - b.index;
    return (left - right) * multiplier;
  });
}

function updateSortHeaders() {
  sortableHeaders.forEach((header) => {
    const indicator = header.querySelector(".sort-indicator");
    const state = header.classList.contains("player-sort")
      ? playerSortState
      : (header.classList.contains("weapon-sort") ? weaponSortState : sortState);
    const active = header.dataset.sort === state.key && state.mode;
    header.classList.toggle("sorted", Boolean(active));
    header.classList.toggle("advantage-sort", Boolean(active && state.mode === "advantage"));
    header.classList.toggle("disadvantage-sort", Boolean(active && state.mode === "disadvantage"));
    indicator.textContent = "";
  });
}

function applyView() {
  viewFrame = null;
  if (activeTab === "maps") {
    renderMapTable(getFilteredMaps());
    updateSortHeaders();
    playerPaginationEl.classList.remove("show");
    playerPaginationPanel.classList.remove("show");
    return;
  }
  if (activeTab === "models") {
    renderModelTable(getFilteredModels());
    updateSortHeaders();
    playerPaginationEl.classList.remove("show");
    playerPaginationPanel.classList.remove("show");
    return;
  }
  if (activeTab === "players") {
    filteredPlayerList = getFilteredPlayers();
    renderPlayerTable(getSortedPlayers(filteredPlayerList));
    updateSortHeaders();
    return;
  }
  if (activeTab === "weapons") {
    filteredWeaponList = getFilteredWeapons();
    renderWeaponTable(getSortedWeapons(filteredWeaponList));
    updateSortHeaders();
    playerPaginationEl.classList.remove("show");
    playerPaginationPanel.classList.remove("show");
    return;
  }
  filteredList = getFilteredList();
  renderTable(getSortedList(filteredList));
  updateSortHeaders();
  playerPaginationEl.classList.remove("show");
  playerPaginationPanel.classList.remove("show");
}

function scheduleApplyView() {
  if (viewFrame !== null) return;
  viewFrame = window.requestAnimationFrame(applyView);
}

function renderTable(list) {
  currentList = list;
  const selectedSet = new Set(selectedIndices);
  rowsEl.innerHTML = list.map((vehicle) => {
    const index = vehicle.index;
    const rowClasses = [];
    if (selectedSet.has(index)) rowClasses.push("selected");
    if (targetMode && isUnarmedVehicle(vehicle)) rowClasses.push("no-target-weapon");
    const classAttr = rowClasses.length ? ` class="${rowClasses.join(" ")}"` : "";
    return `
    <tr data-index="${escapeHtml(index)}"${classAttr}>
      <td data-label="阵营">${factionBadge(vehicle)}</td>
      <td data-label="载具名" data-mobile-role="title">${escapeHtml(vehicle.name)}</td>
      <td class="table-icon-cell" data-label="图标">${assetIconHtml(vehicleIconSrc(vehicle), vehicle.name, "row-icon")}</td>
      <td class="num" data-label="生命值">${fmt(vehicle.hp)}</td>
      <td class="num" data-label="最大速度">${fmt(vehicle.speed)}</td>
      <td class="num" data-label="加速度">${fmt(vehicle.acceleration)}</td>
      <td class="num" data-label="炮塔转速">${fmt(vehicle.turret)}</td>
      <td class="num" data-label="受击门槛">${fmt(vehicle.threshold)}</td>
      <td class="num" data-label="爆炸减伤">${fmt(vehicle.reduction)}</td>
      <td class="num" data-label="装填速度">${fmt(vehicle.reload)}</td>
      <td class="num" data-label="玩家视野修正">${fmt(vehicle.vision)}</td>
      <td class="num" data-label="爆炸伤害">${fmt(vehicle.blast)}</td>
    </tr>
  `;
  }).join("");
}

function renderWeaponTable(list) {
  currentWeaponList = list;
  const selectedSet = new Set(selectedWeaponIndices);
  weaponRowsEl.innerHTML = list.map((weapon) => {
    const selected = selectedSet.has(weapon.id) ? " class=\"selected\"" : "";
    return `
    <tr data-index="${escapeHtml(weapon.id)}"${selected}>
      <td data-label="阵营">${factionBadge({ faction: weapon["阵营"] })}</td>
      <td data-label="类型">${escapeHtml(displayValue(weapon["类型"]))}</td>
      <td data-label="枪械名称" data-mobile-role="title">${escapeHtml(displayValue(weapon["枪械名称"]))}</td>
      <td class="table-icon-cell" data-label="图标">${assetIconHtml(weaponIconSrc(weapon), displayValue(weapon["枪械名称"]), "row-icon weapon-icon")}</td>
      <td class="num" data-label="致死">${escapeHtml(weaponKillDisplay(weapon))}</td>
      <td class="num" data-label="射速">${escapeHtml(displayValue(weapon["射速"]))}</td>
      <td class="num" data-label="单发后坐力">${escapeHtml(displayValue(weapon["单发后坐力"]))}</td>
      <td class="num" data-label="衰减开始距离">${escapeHtml(displayValue(weapon["衰减开始距离"]))}</td>
    </tr>
  `;
  }).join("");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function resetDialogScroll(dialogRoot) {
  const body = dialogRoot.querySelector(".dialog-body");
  if (body) body.scrollTop = 0;
}

function compareArrow(left, right) {
  if (left > right) return { left: "↑", right: "↓", leftClass: "up", rightClass: "down" };
  if (left < right) return { left: "↓", right: "↑", leftClass: "down", rightClass: "up" };
  return { left: "=", right: "=", leftClass: "", rightClass: "" };
}

function compareArrowLowerBetter(left, right) {
  if (left < right) return { left: "↑", right: "↓", leftClass: "up", rightClass: "down" };
  if (left > right) return { left: "↓", right: "↑", leftClass: "down", rightClass: "up" };
  return { left: "=", right: "=", leftClass: "", rightClass: "" };
}

function compareArrowLowerWorse(left, right) {
  if (left < right) return { left: "↓", right: "↑", leftClass: "down", rightClass: "up" };
  if (left > right) return { left: "↑", right: "↓", leftClass: "up", rightClass: "down" };
  return { left: "=", right: "=", leftClass: "", rightClass: "" };
}

function setCompareMode(enabled) {
  if (enabled && targetMode) setTargetMode(false);
  compareMode = enabled;
  selectedIndices = [];
  selectedWeaponIndices = [];
  document.body.classList.toggle("compare-mode", enabled);
  compareBtn.textContent = enabled ? "取消" : "比较";
  compareBtn.classList.toggle("danger", enabled);
  targetModeBtn.disabled = enabled || activeTab !== "vehicles";
  confirmCompareBtn.classList.remove("show");
  compareHint.textContent = enabled
    ? `点选两个${activeTab === "weapons" ? "枪械" : "载具"}进行比较`
    : `在列表中选两个${activeTab === "weapons" ? "枪械" : "载具"}进行对比`;
  applyView();
}

function updateConfirmState() {
  const count = activeTab === "weapons" ? selectedWeaponIndices.length : selectedIndices.length;
  confirmCompareBtn.classList.toggle("show", count === 2);
  compareHint.textContent = compareMode
    ? `已选择 ${count}/2 个${activeTab === "weapons" ? "枪械" : "载具"}${count === 2 ? "，是否确认比较" : "。"}`
    : `在列表中选两个${activeTab === "weapons" ? "枪械" : "载具"}进行对比`;
}

function toggleRowSelection(index) {
  if (!compareMode) return;

  if (activeTab === "weapons") {
    if (selectedWeaponIndices.includes(index)) {
      selectedWeaponIndices = selectedWeaponIndices.filter((item) => item !== index);
    } else {
      if (selectedWeaponIndices.length >= 2) selectedWeaponIndices.shift();
      selectedWeaponIndices.push(index);
    }

    applyView();
    updateConfirmState();
    return;
  }

  if (selectedIndices.includes(index)) {
    selectedIndices = selectedIndices.filter((item) => item !== index);
  } else {
    if (selectedIndices.length >= 2) selectedIndices.shift();
    selectedIndices.push(index);
  }

  applyView();
  updateConfirmState();
}

function hitResult(attacker, defender) {
  if (attacker.blast <= defender.threshold) {
    return { valid: false, label: '<span class="bad-word">太硬了</span>' };
  }

  const realDamage = attacker.blast - defender.reduction;
  if (realDamage <= 0) {
    return { valid: false, label: '<span class="bad-word">太硬了</span>' };
  }

  return {
    valid: true,
    realDamage,
    percent: (realDamage / defender.hp) * 100,
    shots: Math.ceil(defender.hp / realDamage)
  };
}

function weaponHitResult(blastDamage, defender) {
  if (blastDamage <= defender.threshold) {
    return { valid: false, label: '<span class="bad-word">太硬了</span>' };
  }

  const realDamage = blastDamage - defender.reduction;
  if (realDamage <= 0) {
    return { valid: false, label: '<span class="bad-word">太硬了</span>' };
  }

  return {
    valid: true,
    realDamage,
    percent: (realDamage / defender.hp) * 100,
    shots: Math.ceil(defender.hp / realDamage)
  };
}

function buildCompareRows(a, b, aHitsB, bHitsA) {
  const percentValue = (hit) => hit.valid ? hit.percent : -Infinity;
  const shotsValue = (hit) => hit.valid ? hit.shots : -Infinity;
  const reloadComparable = a.reload !== null && b.reload !== null;
  const duelComparable = aHitsB.valid && bHitsA.valid;
  const rows = [
    { type: "group", label: "基础信息" },
    { label: "生命值", leftDisplay: fmt(a.hp), leftCompare: a.hp, rightDisplay: fmt(b.hp), rightCompare: b.hp },
    { label: "最大速度", leftDisplay: fmt(a.speed), leftCompare: a.speed, rightDisplay: fmt(b.speed), rightCompare: b.speed },
    { label: "加速度", leftDisplay: fmt(a.acceleration), leftCompare: a.acceleration, rightDisplay: fmt(b.acceleration), rightCompare: b.acceleration },
    { label: "炮塔转速", leftDisplay: fmt(a.turret), leftCompare: a.turret, rightDisplay: fmt(b.turret), rightCompare: b.turret, comparable: a.turret !== null && b.turret !== null },
    { label: "受击门槛", leftDisplay: fmt(a.threshold), leftCompare: a.threshold, rightDisplay: fmt(b.threshold), rightCompare: b.threshold },
    { label: "爆炸减伤", leftDisplay: fmt(a.reduction), leftCompare: a.reduction, rightDisplay: fmt(b.reduction), rightCompare: b.reduction },
    { label: "装填速度", leftDisplay: fmt(a.reload), leftCompare: a.reload, rightDisplay: fmt(b.reload), rightCompare: b.reload, comparable: reloadComparable, lowerBetter: true },
    { label: "玩家视野修正", leftDisplay: fmt(a.vision), leftCompare: a.vision, rightDisplay: fmt(b.vision), rightCompare: b.vision },
    { label: "爆炸伤害", leftDisplay: fmt(a.blast), leftCompare: a.blast, rightDisplay: fmt(b.blast), rightCompare: b.blast, comparable: a.blast !== null && b.blast !== null },
    { type: "group", label: "互摧毁性" },
    {
      label: "单次射击给对方的伤害",
      leftDisplay: aHitsB.valid ? `${fmt(aHitsB.percent)}%` : '<span class="bad-word">太硬了</span>',
      leftCompare: percentValue(aHitsB),
      rightDisplay: bHitsA.valid ? `${fmt(bHitsA.percent)}%` : '<span class="bad-word">太硬了</span>',
      rightCompare: percentValue(bHitsA),
      comparable: duelComparable
    },
    {
      label: "摧毁对方需要的射击数",
      leftDisplay: aHitsB.valid ? `${aHitsB.shots} 发` : '<span class="bad-word">太硬了</span>',
      leftCompare: shotsValue(aHitsB),
      rightDisplay: bHitsA.valid ? `${bHitsA.shots} 发` : '<span class="bad-word">太硬了</span>',
      rightCompare: shotsValue(bHitsA),
      comparable: duelComparable,
      lowerBetter: true
    },
    { type: "group", label: "伤害抗性" }
  ];

  antiTankWeapons.forEach((weapon) => {
    const leftResult = weaponHitResult(weapon.blast, a);
    const rightResult = weaponHitResult(weapon.blast, b);
    const comparable = leftResult.valid && rightResult.valid;
    rows.push({
      label: weapon.label,
      subtitle: "需射击多少发摧毁",
      leftDisplay: leftResult.valid ? String(leftResult.shots) : leftResult.label,
      leftCompare: leftResult.valid ? leftResult.shots : Infinity,
      rightDisplay: rightResult.valid ? String(rightResult.shots) : rightResult.label,
      rightCompare: rightResult.valid ? rightResult.shots : Infinity,
      comparable,
      lowerWorse: true
    });
  });

  return rows;
}

function sideMetricRows(rows, side) {
  return rows.map((row) => {
    if (row.type === "group") {
      return `<div class="group-spacer"></div>`;
    }

    const comparable = row.comparable !== false;
    const arrow = comparable
      ? (row.lowerWorse ? compareArrowLowerWorse(row.leftCompare, row.rightCompare) : (row.lowerBetter ? compareArrowLowerBetter(row.leftCompare, row.rightCompare) : compareArrow(row.leftCompare, row.rightCompare)))
      : { left: "", right: "", leftClass: "hidden", rightClass: "hidden" };
    const symbol = comparable ? (side === "left" ? arrow.left : arrow.right) : "";
    const symbolClass = comparable ? (side === "left" ? arrow.leftClass : arrow.rightClass) : "hidden";
    const display = side === "left" ? row.leftDisplay : row.rightDisplay;
    return `
      <div class="side-value ${side}" data-label="${escapeHtml(row.label)}">
        <span class="value-text">${safeDisplayHtml(display)}</span>
        <span class="arrow ${symbolClass}">${symbol}</span>
      </div>
    `;
  }).join("");
}

function metricLabels(rows) {
  return rows.map((row) => {
    if (row.type === "group") {
      return `<div class="group-label">${escapeHtml(row.label)}</div>`;
    }

    if (row.subtitle) {
      return `
        <div class="metric-label">
          <div>
            <div class="metric-title">${escapeHtml(row.label)}</div>
            <div class="metric-subtitle">${escapeHtml(row.subtitle)}</div>
          </div>
        </div>
      `;
    }

    return `<div class="metric-label">${escapeHtml(row.label)}</div>`;
  }).join("");
}

function renderMapTable(list) {
  if (!list.length) {
    mapRowsEl.innerHTML = '<div class="model-empty">没有找到匹配的地图</div>';
    return;
  }
  const groups = [];
  list.forEach((map) => {
    let group = groups.find((item) => item.name === map.group);
    if (!group) {
      group = { name: map.group, maps: [] };
      groups.push(group);
    }
    group.maps.push(map);
  });
  mapRowsEl.innerHTML = groups.map((group) => `
    <section class="map-series" aria-label="${escapeHtml(group.name)}系列地图">
      <div class="map-series-head">
        <div class="map-series-title">${mapGroupBadge(group.name)}</div>
      </div>
      <div class="map-card-grid">
        ${group.maps.map((map) => `
          <button class="map-card map-open-button" data-map-id="${escapeHtml(map.id)}" type="button" title="${escapeHtml(map.name)}">
            <span class="map-card-thumbnail">
              ${mapThumbnailHtml(map)}
            </span>
            <span class="map-card-name">${escapeHtml(map.name)}</span>
          </button>
        `).join("")}
      </div>
    </section>
  `).join("");
}

function renderModelTable(list) {
  if (!list.length) {
    modelRowsEl.innerHTML = '<div class="model-empty">没有找到匹配的模型</div>';
    return;
  }
  modelRowsEl.innerHTML = list.map((model) => {
    const iconSrc = modelIconSrc(model);
    const iconHtml = iconSrc
      ? assetIconHtml(iconSrc, model.name, "model-card-icon")
      : '<span class="model-card-placeholder">无图标</span>';
    const factionHtml = model.faction ? factionBadge({ faction: model.faction }) : '<span class="faction">未知阵营</span>';
    const disabled = model.model ? "" : " disabled";
    return `
      <button class="model-card" data-model-id="${escapeHtml(model.id)}" type="button"${disabled} title="${escapeHtml(model.name)}">
        <span class="model-card-faction">${factionHtml}</span>
        <span class="model-card-art">${iconHtml}</span>
        <span class="model-card-name">${escapeHtml(model.name)}</span>
      </button>
    `;
  }).join("");
}

function renderPlayerTable(list) {
  currentPlayerList = list;
  const pageSize = 100;
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  if (playerPage > totalPages) playerPage = totalPages;
  if (playerPage < 1) playerPage = 1;
  const start = (playerPage - 1) * pageSize;
  const pageItems = list.slice(start, start + pageSize);
  playerRowsEl.innerHTML = pageItems.length ? pageItems.map((player) => `
    <tr data-index="${escapeHtml(player.index)}">
      <td data-label="ID" data-mobile-role="title"><span class="player-id-badge">${escapeHtml(displayValue(player.username))}</span></td>
      <td class="num" data-label="XP">${escapeHtml(formatInteger(player.xp))}</td>
      <td class="num" data-label="击杀数">${escapeHtml(formatInteger(player.kills))}</td>
      <td class="num" data-label="死亡数">${escapeHtml(formatInteger(player.deaths))}</td>
      <td class="num" data-label="K/D">${escapeHtml(formatPlayerValue(player, "kd_ratio"))}</td>
      <td class="num" data-label="最长连杀">${escapeHtml(formatInteger(player.longest_kill_streak))}</td>
    </tr>
  `).join("") : `
    <tr>
      <td colspan="6">没有找到匹配的玩家</td>
    </tr>
  `;
  renderPlayerPagination(totalPages);
}

function playerPageItems(totalPages) {
  if (totalPages <= 9) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const items = [1];
  const start = Math.max(2, playerPage - 2);
  const end = Math.min(totalPages - 1, playerPage + 2);
  if (start > 2) items.push("...");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < totalPages - 1) items.push("...");
  items.push(totalPages);
  return items;
}

function renderPlayerPagination(totalPages) {
  if (activeTab !== "players" || totalPages <= 1) {
    playerPaginationEl.classList.remove("show");
    playerPaginationPanel.classList.remove("show");
    playerPaginationEl.innerHTML = "";
    return;
  }
  const items = playerPageItems(totalPages);
  playerPaginationPanel.classList.add("show");
  playerPaginationEl.classList.add("show");
  playerPaginationEl.innerHTML = `
    <button class="page-button" data-page="${playerPage - 1}" type="button"${playerPage === 1 ? " disabled" : ""}>上一页</button>
    ${items.map((item) => item === "..."
      ? '<span class="page-ellipsis">...</span>'
      : `<button class="page-button ${item === playerPage ? "active" : ""}" data-page="${item}" type="button">${item}</button>`
    ).join("")}
    <button class="page-button" data-page="${playerPage + 1}" type="button"${playerPage === totalPages ? " disabled" : ""}>下一页</button>
  `;
}

function assetIconHtml(src, alt, className) {
  if (!src) return '<span class="muted">-</span>';
  return `<img class="${escapeHtml(className)}" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" fetchpriority="low">`;
}

function mapThumbnailHtml(map) {
  const src = overviewMapImageSources(map)[0];
  if (!src) return '<span class="map-card-placeholder">无地图图</span>';
  return `<img class="map-card-image" src="${escapeHtml(src)}" alt="${escapeHtml(map.name)}" loading="lazy" decoding="async" fetchpriority="low">`;
}

function vehicleIconSrc(vehicle) {
  const icon = vehicle?.icon ?? vehicle?.["图标号"];
  return icon === null || icon === undefined || icon === "" ? "" : `maps_textures/${encodeURIComponent(String(icon))}.webp`;
}

function modelIconSrc(model) {
  const icon = model?.icon ?? model?.["图标号"];
  if (icon !== null && icon !== undefined && icon !== "") {
    return `maps_textures/${encodeURIComponent(String(icon))}.webp`;
  }
  return "";
}

function weaponIconSrc(weapon) {
  const icon = weapon?.["图标"] ?? weapon?.icon;
  return icon ? `weapons_textures/${encodeURIComponent(String(icon))}` : "";
}

function detailIconPanel(src, alt, extraClass) {
  return `
    <section class="detail-icon-panel">
      ${assetIconHtml(src, alt, `detail-large-icon ${extraClass}`.trim())}
    </section>
  `;
}

function mapPerspectiveButtons(map) {
  const factions = map.factions || [];
  if (factions.length < 2) {
    return factions.flatMap((faction) => {
      const states = map.viewStates?.[faction.id] || ["friendly_all"];
      if (states.includes("friendly_all") && states.includes("enemy_all")) {
        return [
          mapPerspectiveButton(map.id, faction, "friendly_all", faction.label),
          mapPerspectiveButton(map.id, faction, "enemy_all", enemyFactionFor(faction.id, factions).label)
        ];
      }
      return [`
        <button class="map-action-button map-perspective-button" data-map-id="${escapeHtml(map.id)}" data-faction="${escapeHtml(faction.id)}" data-state="${escapeHtml(primaryMapState(map, faction.id))}" type="button">查看${escapeHtml(faction.label)}视角</button>
      `];
    }).join("");
  }

  const order = ["Axis", "Allies"];
  const viewFactions = factions.slice().sort((left, right) => {
    const leftIndex = order.indexOf(left.id);
    const rightIndex = order.indexOf(right.id);
    return (leftIndex === -1 ? 99 : leftIndex) - (rightIndex === -1 ? 99 : rightIndex);
  });
  return viewFactions.flatMap((faction) => {
    const enemy = enemyFactionFor(faction.id, factions);
    return [
      mapPerspectiveButton(map.id, faction, "friendly_all", faction.label),
      mapPerspectiveButton(map.id, faction, "enemy_all", enemy.label)
    ];
  }).join("");
}

function mapPerspectiveButton(mapId, faction, state, ownerLabel) {
  return `
    <button class="map-action-button map-perspective-button" data-map-id="${escapeHtml(mapId)}" data-faction="${escapeHtml(faction.id)}" data-state="${escapeHtml(state)}" type="button">查看${escapeHtml(faction.label)}视角(${escapeHtml(ownerLabel)}占领)</button>
  `;
}

function renderMapPerspectiveActions(map) {
  if (!mapPerspectiveActions) return;
  mapPerspectiveActions.innerHTML = map ? mapPerspectiveButtons(map) : "";
}

function primaryMapState(map, factionId) {
  const states = map.viewStates?.[factionId] || [];
  return states.includes("friendly_all") ? "friendly_all" : (states[0] || "friendly_all");
}

function enemyFactionFor(factionId, factions) {
  const enemyId = {
    Axis: "Allies",
    Allies: "Axis",
    USMC: "IJA",
    IJA: "USMC"
  }[factionId];
  return (factions || []).find((item) => item.id === enemyId)
    || (factions || []).find((item) => item.id !== factionId)
    || factionMeta(enemyId)
    || { id: enemyId || "", label: "敌方" };
}

function factionMeta(factionId) {
  return {
    Axis: { id: "Axis", label: "德军", image: "map_axis.webp" },
    Allies: { id: "Allies", label: "盟军", image: "map_allies.webp" },
    USMC: { id: "USMC", label: "美军", image: "map_usmc.webp" },
    IJA: { id: "IJA", label: "日军", image: "map_ija.webp" }
  }[factionId] || null;
}

function detailBaseRows(vehicle) {
  return [
    { name: "生命值", value: fmt(vehicle.hp) },
    { name: "最大速度", value: fmt(vehicle.speed) },
    { name: "加速度", value: fmt(vehicle.acceleration) },
    { name: "炮塔转速", value: fmt(vehicle.turret) },
    { name: "受击门槛", value: fmt(vehicle.threshold) },
    { name: "爆炸减伤", value: fmt(vehicle.reduction) },
    { name: "武器名", value: vehicle.weapon },
    { name: "装填速度", value: fmt(vehicle.reload) },
    { name: "玩家视野修正", value: fmt(vehicle.vision) },
    { name: "爆炸伤害", value: fmt(vehicle.blast) },
    { name: "载具类型", value: vehicleTypeLabel(vehicle.vehicleType) }
  ];
}

function detailAntiTankRows(vehicle) {
  return antiTankWeapons.map((weapon) => {
    const result = weaponHitResult(weapon.blast, vehicle);
    return {
      at: true,
      name: weapon.label,
      percent: result.valid ? `${fmt(result.percent)}%` : result.label,
      shots: result.valid ? `${result.shots}` : result.label
    };
  });
}

function repairRows(vehicle) {
  const repairPercent = (amount) => `${fmt((amount / vehicle.hp) * 100)}%`;
  return [
    { name: "小扳手单次维修量", value: repairPercent(1.5) },
    { name: "大扳手单次维修量", value: repairPercent(2.0) },
    { name: "维修坦克单次维修量", value: repairPercent(0.5) }
  ];
}

function renderDetailRow(row) {
  if (row.at) {
    return `
      <div class="detail-row at-row">
        <div class="detail-name">
          <div>
            <div class="detail-at-title">${escapeHtml(row.name)}</div>
            <div class="detail-at-subtitle">单发命中伤害百分比 / 摧毁需多少发</div>
          </div>
        </div>
        <div class="detail-value detail-percent">${safeDisplayHtml(row.percent)}</div>
        <div class="detail-value">${safeDisplayHtml(row.shots)}</div>
      </div>
    `;
  }

  if (row.rank) {
    return `
    <div class="detail-row with-rank">
      <div class="detail-name">${escapeHtml(row.name)}</div>
      <div class="detail-value">${safeDisplayHtml(row.value)}</div>
      <div class="detail-rank">${escapeHtml(row.rank)}</div>
    </div>
  `;
  }

  return `
    <div class="detail-row">
      <div class="detail-name">${escapeHtml(row.name)}</div>
      <div class="detail-value">${safeDisplayHtml(row.value)}</div>
    </div>
  `;
}

function renderDetailSection(title, rows) {
  return `
    <section class="detail-section">
      <div class="detail-section-title">${escapeHtml(title)}</div>
      ${rows.map(renderDetailRow).join("")}
    </section>
  `;
}

function openDetail(index) {
  const vehicle = vehicles[index];
  detailTitle.textContent = `载具详细参数`;
  detailHero.classList.remove("player-rank-hero");
  detailHero.classList.remove("player-hero");
  detailHero.innerHTML = `
    ${factionBadge(vehicle)}
    <h3>${escapeHtml(vehicle.name)}</h3>
  `;
  detailRows.innerHTML = detailIconPanel(vehicleIconSrc(vehicle), vehicle.name, "") + [
    renderDetailSection("基本信息", detailBaseRows(vehicle)),
    renderDetailSection("可维修性", repairRows(vehicle)),
    renderDetailSection("伤害抗性", detailAntiTankRows(vehicle))
  ].join("");
  detailModal.classList.add("open");
  resetDialogScroll(detailModal);
}

function getThreatFactors(vehicle) {
  const weapon = vehicle.weapon || "";
  if (weapon === "—") return factors([]);
  if (vehicle.name === "Sd.Kfz.251/17防空车" || vehicle.name.includes("山猫")) return factors(lightFlakThreats);
  if (vehicle.name === "鱼雷艇") return factors(boforsThreats);
  if (vehicle.name === "M3“斯图亚特”轻型坦克") return factors(stuartCannonThreats);
  if (vehicle.name === "九五式轻战车" || vehicle.name === "装甲艇") return factors(lightCannonThreats);
  if (vehicle.name === "特四式内火艇") return factors(katsuMgThreats);
  if (vehicle.name === "三号突击炮" || vehicle.name.includes("萤火虫") || vehicle.name.includes("TOG") || vehicle.name.includes("狼獾")) return factors(tankDestroyerThreats);
  if (weapon.includes("重机枪") || weapon.includes("机枪") || weapon.includes("喷火器")) return factors(mgThreats);
  if (weapon.includes("无后坐力")) return factors(recoillessThreats);
  if (weapon.includes("88mm") || weapon.includes("128mm")) return factors(heavyCannonThreats);
  return factors(mediumCannonThreats);
}

function setActiveTab(tab) {
  if (tab === activeTab) {
    setMobileNavOpen(false);
    return;
  }
  if (compareMode) setCompareMode(false);
  if (targetMode) setTargetMode(false);
  setMobileNavOpen(false);
  activeTab = tab;
  tagTabs.forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
  vehicleTable.classList.toggle("hidden", tab !== "vehicles");
  weaponTable.classList.toggle("hidden", tab !== "weapons");
  playerTable.classList.toggle("hidden", tab !== "players");
  mapTable.classList.toggle("hidden", tab !== "maps");
  modelTable.classList.toggle("hidden", tab !== "models");
  targetModeBtn.classList.toggle("hidden", tab !== "vehicles");
  targetHint.classList.toggle("hidden", tab !== "vehicles");
  targetModeBtn.disabled = tab !== "vehicles";
  const comparisonEnabled = tab === "vehicles" || tab === "weapons";
  compareBar.classList.toggle("hidden", !comparisonEnabled);
  compareBtn.disabled = !comparisonEnabled;
  compareBtn.classList.toggle("hidden", !comparisonEnabled);
  confirmCompareBtn.classList.toggle("hidden", !comparisonEnabled);
  compareHint.textContent = tab === "weapons"
    ? "在列表中选两个枪械进行对比"
    : (tab === "vehicles" ? "在列表中选两个载具进行对比" : "");
  searchInput.placeholder = tab === "maps"
    ? "在地图页中搜索"
    : (tab === "models" ? "在模型页中搜索" : (tab === "players" ? "在玩家列表中搜索" : (tab === "weapons" ? "在枪械页中搜索" : "在载具页中搜索")));
  if (tab === "players") playerPage = 1;
  applyView();
  if (tab === "maps" || tab === "models" || tab === "players") resetTablePosition();
  if (tab === "maps") warmMapAssets();
}

function setMobileNavOpen(open) {
  document.body.classList.toggle("mobile-nav-open", open);
  mobileMenuBtn.setAttribute("aria-expanded", open ? "true" : "false");
}

function resetTablePosition() {
  if (!tableWrap) return;
  tableWrap.scrollTop = 0;
  tableWrap.scrollLeft = 0;
  requestAnimationFrame(() => {
    tableWrap.scrollTop = 0;
    tableWrap.scrollLeft = 0;
  });
}

function setTargetMode(enabled) {
  targetMode = enabled;
  if (enabled && compareMode) setCompareMode(false);
  document.body.classList.toggle("target-mode", enabled);
  targetModeBtn.textContent = enabled ? "取消" : "载具索敌优选";
  targetModeBtn.classList.toggle("danger", enabled);
  compareBtn.disabled = enabled;
  targetHint.textContent = enabled ? "点选一个载具查看索敌优先级" : "查看载具索敌的优先级";
  applyView();
}

function openTargetOptimizer(index) {
  targetVehicle = vehicles[index];
  activeThreats = new Map();
  targetTitle.textContent = `${targetVehicle.name} 载具索敌优选`;
  targetTankLabel.textContent = "";
  invalidateTargetGeometry();
  targetStage.querySelectorAll(".threat-token").forEach((node) => node.remove());
  renderThreatButtons();
  priorityList.innerHTML = "";
  targetModal.classList.add("open");
  resetDialogScroll(targetModal);
  setTargetMode(false);
}

async function openMapDetail(mapId) {
  const summary = mapLookup.get(mapId);
  mapTitle.textContent = summary ? `${summary.group} / ${summary.name}` : "地图详情";
  renderMapPerspectiveActions(summary);
  mapModal.classList.add("open");
  showMapLoading("正在读取地图数据和图片");
  resetDialogScroll(mapModal);
  currentMap = await loadMapData(mapId);
  if (!currentMap) {
    showMapError("地图数据请求失败", "请检查网络连接后重新打开地图详情。");
    return;
  }
  mapTitle.textContent = `${currentMap.group} / ${currentMap.name}`;
  renderMapPerspectiveActions(currentMap);
  try {
    await renderMapDetail();
  } catch (error) {
    console.error(error);
    showMapError("地图图片请求失败", "请检查网络连接后重新打开地图详情。");
  }
}

async function loadMapData(mapId) {
  const summary = mapLookup.get(mapId);
  if (!summary) return null;
  if (mapDataCache.has(mapId)) return mapDataCache.get(mapId);
  const response = await fetchWithTimeout(summary.data, { cache: canUseCachedResources ? "force-cache" : "no-cache" }, 10000);
  if (!response.ok) {
    showToast(`网络错误：地图数据加载失败（${response.status}）`);
    return null;
  }
  const mapData = normalizeMapData(await response.json(), summary);
  mapDataCache.set(mapId, mapData);
  return mapData;
}

function warmMapAssets() {
  idle(() => {
    maps
      .flatMap((map) => overviewMapImageSources(map).slice(0, 1))
      .slice(0, 8)
      .forEach((src) => loadImageElement(src).catch(() => null));
  }, { timeout: 1600 });
}

function normalizeMapData(mapData, summary) {
  const normalized = { ...mapData };
  normalized.id = mapData.id || mapData.map || summary.id;
  normalized.group = mapData.group || summary.group;
  normalized.name = mapData.name || summary.name || normalized.id;
  normalized.baseImage = mapData.baseImage || summary.baseImage;
  normalized.viewStates = mapData.viewStates || summary.viewStates || {};
  const summaryFactions = summary.factions || [];
  if (Array.isArray(mapData.factions)) {
    normalized.factions = mapData.factions;
  } else if (mapData.views) {
    normalized.factions = Object.keys(mapData.views).map((id) => {
      return summaryFactions.find((item) => item.id === id) || factionMeta(id) || { id, label: id, image: `map_${String(id).toLowerCase()}.webp` };
    });
  } else {
    normalized.factions = summaryFactions;
  }
  return normalized;
}

function renderMapDetail() {
  if (!currentMap) return;
  mapImage.alt = `${currentMap.name} 原始地图`;
  return setMapImageWithFallback(mapImage, null, overviewMapImageSources(currentMap));
}

function showMapLoading(subtitle = "正在读取地图图片") {
  mapStage.classList.remove("error");
  mapStage.classList.add("loading");
  mapStage.removeAttribute("data-message");
  mapImage.hidden = false;
  const titleEl = mapStage.querySelector(".loading-title");
  if (titleEl) titleEl.textContent = "正在加载地图";
  if (mapLoadingSubtitle) mapLoadingSubtitle.textContent = subtitle;
}

function hideMapLoading() {
  mapStage.classList.remove("loading");
}

function showMapError(title, subtitle = "请检查网络连接后重试。") {
  mapStage.classList.add("loading", "error");
  mapImage.hidden = true;
  mapStage.removeAttribute("data-message");
  const titleEl = mapStage.querySelector(".loading-title");
  if (titleEl) titleEl.textContent = title;
  if (mapLoadingSubtitle) mapLoadingSubtitle.textContent = subtitle;
}

function overviewMapImageSources(mapData = currentMap) {
  if (!mapData?.id) return [];
  const names = [];
  const add = (name) => {
    if (name && !names.includes(name)) names.push(name);
  };
  add(mapData?.baseImage);
  add("map.webp");
  (mapData?.factions || []).forEach((faction) => {
    mapImageNames(faction).forEach(add);
  });
  return filterKnownAssetSources(names.map((name) => `maps/${mapData.id}/${name}`));
}

function mapImageNames(faction) {
  const names = [];
  const add = (name) => {
    if (name && !names.includes(name)) names.push(name);
  };
  add(faction?.image);
  if (faction?.id) add(`map_${String(faction.id).toLowerCase()}.webp`);
  if (faction?.id === "Axis") add("map_axis.webp");
  if (faction?.id === "Allies") add("map_allies.webp");
  if (faction?.id === "USMC") add("map_usmc.webp");
  if (faction?.id === "IJA") add("map_ija.webp");
  add("map_axis.webp");
  add("map_allies.webp");
  add("map_usmc.webp");
  add("map_ija.webp");
  add("map.webp");
  return names;
}

function mapImageSources(faction, mapData = currentMap) {
  return filterKnownAssetSources(mapImageNames(faction).map((name) => `maps/${mapData.id}/${name}`));
}

function filterKnownAssetSources(sources) {
  if (!assetManifestPaths) return sources;
  const knownSources = sources.filter((src) => assetManifestPaths.has(src.replace(/^\.?\//, "")));
  return knownSources.length ? knownSources : sources;
}

function setMapImageWithFallback(imageElement, faction, sourceList = null) {
  const sources = sourceList || mapImageSources(faction);
  if (!sources.length) {
    showMapError("地图图片请求失败", "没有可用的地图图片路径。");
    return Promise.reject(new Error("No map image source available"));
  }
  let index = 0;
  showMapLoading("正在读取地图图片");
  imageElement.hidden = false;
  imageElement.removeAttribute("src");
  return new Promise((resolve, reject) => {
    imageElement.onload = () => {
      imageElement.onerror = null;
      imageElement.onload = null;
      hideMapLoading();
      resolve(imageElement);
    };
    imageElement.onerror = () => {
      index += 1;
      if (index < sources.length) {
        imageElement.src = sources[index];
      } else {
        imageElement.onerror = null;
        imageElement.onload = null;
        const names = sources.map((src) => src.split("/").pop()).join(" / ");
        showMapError("地图图片请求失败", `没有成功加载的地图图片：${names}`);
        reject(new Error(`No available map image: ${names}`));
      }
    };
    imageElement.src = sources[index];
  });
}

function loadImageElement(src) {
  if (imagePromiseCache.has(src)) return imagePromiseCache.get(src);
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  }).catch((error) => {
    imagePromiseCache.delete(src);
    throw error;
  });
  imagePromiseCache.set(src, promise);
  return promise;
}

async function loadFirstImageElement(srcList) {
  let lastError = null;
  for (const src of srcList) {
    try {
      return await loadImageElement(src);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("No map image source available");
}

function showPopupMessage(popup, title, message) {
  popup.document.title = title;
  popup.document.body.innerHTML = "";
  popup.document.body.style.margin = "0";
  popup.document.body.style.background = "#101820";
  popup.document.body.style.color = "#dce8f4";
  popup.document.body.style.display = "grid";
  popup.document.body.style.placeItems = "center";
  popup.document.body.style.font = "16px Microsoft YaHei UI, Microsoft YaHei, sans-serif";
  popup.document.body.style.padding = "24px";
  popup.document.body.textContent = message;
}

function showPopupError(popup, title, message) {
  popup.document.title = title;
  popup.document.head.innerHTML = `
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        color: #182838;
        background: #101820;
        font-family: "Microsoft YaHei UI", "Microsoft YaHei", "Segoe UI", system-ui, sans-serif;
      }
      .loading-card {
        display: grid;
        justify-items: center;
        gap: 14px;
        min-width: min(300px, 84vw);
        max-width: min(520px, 88vw);
        padding: 26px 30px;
        border-radius: 14px;
        border: 1px solid rgba(221, 69, 96, 0.34);
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 18px 42px rgba(0, 0, 0, 0.24);
      }
      .loading-spinner {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 4px solid rgba(221, 69, 96, 0.18);
        border-top-color: #dd4560;
        border-right-color: #dd4560;
      }
      .loading-title {
        color: #c52f4e;
        font-weight: 900;
        line-height: 1.3;
      }
      .loading-subtitle {
        color: #66788d;
        font-size: 13px;
        line-height: 1.5;
        text-align: center;
      }
    </style>
  `;
  popup.document.body.innerHTML = `
    <div class="loading-card" role="alert" aria-live="assertive">
      <div class="loading-spinner" aria-hidden="true"></div>
      <div class="loading-title">${escapeHtml(title)}</div>
      <div class="loading-subtitle">${escapeHtml(message)}</div>
    </div>
  `;
}

function showPopupLoading(popup, title, subtitle = "正在读取地图图片和图标") {
  popup.document.title = title;
  popup.document.head.innerHTML = `
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        color: #182838;
        background: #101820;
        font-family: "Microsoft YaHei UI", "Microsoft YaHei", "Segoe UI", system-ui, sans-serif;
      }
      .loading-card {
        display: grid;
        justify-items: center;
        gap: 14px;
        min-width: min(280px, 82vw);
        padding: 26px 30px;
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.72);
        background: rgba(255, 255, 255, 0.86);
        box-shadow: 0 18px 42px rgba(0, 0, 0, 0.24);
      }
      .loading-spinner {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 4px solid rgba(63, 124, 255, 0.14);
        border-top-color: #3f7cff;
        border-right-color: #12b7c8;
        animation: loadingSpin 0.82s linear infinite;
      }
      .loading-title {
        font-weight: 900;
        line-height: 1.3;
      }
      .loading-subtitle {
        color: #66788d;
        font-size: 13px;
        line-height: 1.4;
        text-align: center;
      }
      @keyframes loadingSpin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;
  popup.document.body.innerHTML = `
    <div class="loading-card" role="status" aria-live="polite">
      <div class="loading-spinner" aria-hidden="true"></div>
      <div class="loading-title">正在生成地图图片</div>
      <div class="loading-subtitle">${escapeHtml(subtitle)}</div>
    </div>
  `;
}

async function openProcessedMap(factionId, mapData = currentMap, popup = null, state = "friendly_all") {
  if (!mapData) return;
  const factions = mapData.factions || [];
  const faction = factions.find((item) => item.id === factionId) || factions[0];
  if (!faction) return;
  const ownerLabel = mapData.views && factions.length > 1 ? ownerLabelForState(faction.id, state, factions) : "";
  popup = popup || window.open("", "_blank");
  if (!popup) {
    showToast("浏览器阻止了新窗口，请允许弹窗后重试");
    return;
  }
  const pageTitle = `${mapData.name} ${faction.label}视角${ownerLabel ? `(${ownerLabel}占领)` : ""}`;
  showPopupLoading(popup, pageTitle);

  try {
    const baseImage = await loadFirstImageElement(mapImageSources(faction, mapData));
    const canvas = document.createElement("canvas");
    canvas.width = baseImage.naturalWidth || baseImage.width;
    canvas.height = baseImage.naturalHeight || baseImage.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(baseImage, 0, 0);

    const items = mapItemsForPerspective(mapData, factionId, state);
    for (const item of items) {
      const iconSrc = `maps_textures/${item.atlasIndex ?? item.icon}.webp`;
      const icon = await loadImageElement(iconSrc).catch(() => null);
      if (!icon) continue;
      const naturalW = icon.naturalWidth || icon.width || 32;
      const naturalH = icon.naturalHeight || icon.height || 32;
      const scale = Math.min(1, 48 / Math.max(naturalW, naturalH));
      const width = naturalW * scale;
      const height = naturalH * scale;
      const point = mapPointToCanvas(item, canvas, mapData);
      if (!point) continue;
      ctx.drawImage(icon, point.x - width / 2, point.y - height / 2, width, height);
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        showPopupError(popup, "地图图片生成失败", "请关闭这个页面后，回到主页面重新点击阵营视角按钮生成一次。");
        showToast("地图图片生成失败");
        return;
      }
      const objectUrl = URL.createObjectURL(blob);
      popup.document.title = pageTitle;
      popup.document.body.innerHTML = "";
      popup.document.body.style.margin = "0";
      popup.document.body.style.background = "#101820";
      popup.document.body.style.display = "grid";
      popup.document.body.style.placeItems = "center";
      popup.document.body.style.overflow = "hidden";
      const image = popup.document.createElement("img");
      image.src = objectUrl;
      image.alt = pageTitle;
      image.style.display = "block";
      image.style.maxWidth = "100vw";
      image.style.maxHeight = "100vh";
      image.style.width = "auto";
      image.style.height = "auto";
      image.style.objectFit = "contain";
      image.style.cursor = "zoom-in";
      image.style.userSelect = "none";
      image.addEventListener("click", () => {
        const native = image.dataset.native !== "true";
        image.dataset.native = native ? "true" : "false";
        popup.document.body.style.display = native ? "block" : "grid";
        popup.document.body.style.placeItems = native ? "" : "center";
        popup.document.body.style.overflow = native ? "auto" : "hidden";
        image.style.maxWidth = native ? "none" : "100vw";
        image.style.maxHeight = native ? "none" : "100vh";
        image.style.cursor = native ? "zoom-out" : "zoom-in";
        if (!native) popup.scrollTo(0, 0);
      });
      popup.document.body.appendChild(image);
      popup.addEventListener("beforeunload", () => URL.revokeObjectURL(objectUrl), { once: true });
    }, "image/png");
  } catch (error) {
    console.error(error);
    showPopupError(popup, "地图图片生成失败", "请关闭这个页面后，回到主页面重新点击阵营视角按钮生成一次。");
    showToast("地图图片生成失败");
  }
}

function ownerLabelForState(factionId, state, factions) {
  if (state === "friendly_all") return (factions.find((item) => item.id === factionId) || factionMeta(factionId) || {}).label || factionId;
  if (state === "enemy_all") return enemyFactionFor(factionId, factions).label;
  return "";
}

function mapItemsForPerspective(mapData, factionId, state) {
  if (mapData.views) {
    const view = mapData.views[factionId] || {};
    return view[state] || view.friendly_all || [];
  }
  return (mapData.items || []).filter((item) => item.faction === factionId || item.faction === "公用");
}

function mapPointToCanvas(item, canvas, mapData = currentMap) {
  const x = Number(item.x);
  const y = Number(item.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x, y };
}

function renderThreatButtons() {
  const rows = getThreatFactors(targetVehicle);
  threatButtons.innerHTML = rows.map((row) => {
    const name = threatNames[row.tag] || row.tag;
    const title = `distance: ${fmt(row.distance)} / direction: ${fmt(row.direction)} / squad_command: ${fmt(row.squadCommand)} / base_score: ${fmt(row.baseScore)}`;
    return `<button class="threat-button" data-tag="${escapeHtml(row.tag)}" title="${escapeHtml(title)}">${escapeHtml(name)}</button>`;
  }).join("");
}

function toggleThreat(tag) {
  if (activeThreats.has(tag)) {
    activeThreats.get(tag).el.remove();
    activeThreats.delete(tag);
  } else {
    const factor = getThreatFactors(targetVehicle).find((item) => item.tag === tag);
    const pos = { x: 24 + activeThreats.size * 68, y: 24 };
    const el = document.createElement("div");
    el.className = "threat-token";
    el.dataset.tag = tag;
    el.style.background = threatColors[tag] || threatColors[""];
    el.textContent = threatShortNames[tag] || tag;
    targetStage.appendChild(el);
    const item = { tag, factor, x: pos.x, y: pos.y, el, score: 0 };
    activeThreats.set(tag, item);
    placeThreat(item, pos.x, pos.y);
  }
  syncThreatButtons();
  scheduleThreatScores();
}

function syncThreatButtons() {
  threatButtons.querySelectorAll(".threat-button").forEach((button) => {
    button.classList.toggle("active", activeThreats.has(button.dataset.tag));
  });
}

function tankRectInStage() {
  const stageRect = targetStage.getBoundingClientRect();
  const tankRect = targetTank.getBoundingClientRect();
  return { left: tankRect.left - stageRect.left, top: tankRect.top - stageRect.top, right: tankRect.right - stageRect.left, bottom: tankRect.bottom - stageRect.top };
}

function getTargetGeometry() {
  if (targetGeometry) return targetGeometry;
  const stageRect = targetStage.getBoundingClientRect();
  const tankRect = targetTank.getBoundingClientRect();
  const tank = {
    left: tankRect.left - stageRect.left,
    top: tankRect.top - stageRect.top,
    right: tankRect.right - stageRect.left,
    bottom: tankRect.bottom - stageRect.top
  };
  const barrel = {
    left: tank.left + 92,
    top: tank.top + 25,
    right: tank.left + 174,
    bottom: tank.top + 37
  };
  const blockedTank = {
    left: Math.min(tank.left, barrel.left),
    top: Math.min(tank.top, barrel.top),
    right: Math.max(tank.right, barrel.right),
    bottom: Math.max(tank.bottom, barrel.bottom)
  };
  targetGeometry = { stageRect, tank, barrel, blockedTank };
  return targetGeometry;
}

function invalidateTargetGeometry() {
  targetGeometry = null;
}

function barrelRectInStage() {
  return getTargetGeometry().barrel;
}

function blockedTankRectInStage() {
  return getTargetGeometry().blockedTank;
}

function overlapsRect(x, y, size, rect) {
  return x < rect.right && x + size > rect.left && y < rect.bottom && y + size > rect.top;
}

function overlapsTank(x, y, size = 54) {
  return overlapsRect(x, y, size, getTargetGeometry().tank);
}

function overlapsThreats(x, y, size = 54, ignoredItem = null) {
  const gap = 8;
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  return Array.from(activeThreats.values()).some((item) => {
    if (item === ignoredItem) return false;
    const otherCenterX = item.x + size / 2;
    const otherCenterY = item.y + size / 2;
    return Math.hypot(centerX - otherCenterX, centerY - otherCenterY) < size + gap;
  });
}

function isThreatPositionClear(x, y, size, item) {
  return !overlapsTank(x, y, size) && !overlapsThreats(x, y, size, item);
}

function placeThreat(item, x, y) {
  const stageRect = getTargetGeometry().stageRect;
  const size = 54;
  const padding = 8;
  const step = size + 8;
  const clampX = (value) => Math.max(padding, Math.min(value, stageRect.width - size - padding));
  const clampY = (value) => Math.max(padding, Math.min(value, stageRect.height - size - padding));
  const baseX = clampX(x);
  const baseY = clampY(y);
  let nextX = baseX;
  let nextY = baseY;

  if (!isThreatPositionClear(nextX, nextY, size, item)) {
    const tank = blockedTankRectInStage();
    const centerX = baseX + size / 2;
    const centerY = baseY + size / 2;
    const candidates = [
      { x: centerX < (tank.left + tank.right) / 2 ? tank.left - size - 10 : tank.right + 10, y: baseY },
      { x: baseX, y: centerY < (tank.top + tank.bottom) / 2 ? tank.top - size - 10 : tank.bottom + 10 },
      { x: tank.left - size - 10, y: tank.top - size - 10 },
      { x: tank.left - size - 10, y: tank.bottom + 10 },
      { x: tank.right + 10, y: tank.top - size - 10 },
      { x: tank.right + 10, y: tank.bottom + 10 }
    ];

    activeThreats.forEach((other) => {
      if (other === item) return;
      candidates.push(
        { x: other.x - step, y: other.y },
        { x: other.x + step, y: other.y },
        { x: other.x, y: other.y - step },
        { x: other.x, y: other.y + step },
        { x: other.x - step, y: other.y - step },
        { x: other.x + step, y: other.y - step },
        { x: other.x - step, y: other.y + step },
        { x: other.x + step, y: other.y + step }
      );
    });

    for (let ring = 1; ring <= 8; ring += 1) {
      const radius = ring * step;
      for (let dx = -radius; dx <= radius; dx += step) {
        candidates.push({ x: baseX + dx, y: baseY - radius });
        candidates.push({ x: baseX + dx, y: baseY + radius });
      }
      for (let dy = -radius + step; dy <= radius - step; dy += step) {
        candidates.push({ x: baseX - radius, y: baseY + dy });
        candidates.push({ x: baseX + radius, y: baseY + dy });
      }
    }

    const clearCandidate = candidates
      .map((candidate) => ({ x: clampX(candidate.x), y: clampY(candidate.y) }))
      .filter((candidate, index, list) => list.findIndex((item) => item.x === candidate.x && item.y === candidate.y) === index)
      .filter((candidate) => isThreatPositionClear(candidate.x, candidate.y, size, item))
      .sort((a, b) => Math.hypot(a.x - baseX, a.y - baseY) - Math.hypot(b.x - baseX, b.y - baseY))[0];

    if (clearCandidate) {
      nextX = clearCandidate.x;
      nextY = clearCandidate.y;
    } else if (isThreatPositionClear(item.x, item.y, size, item)) {
      nextX = item.x;
      nextY = item.y;
    }
  }
  item.x = nextX;
  item.y = nextY;
  item.el.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
}

function threatScore(item, geometry = getTargetGeometry()) {
  const stageRect = geometry.stageRect;
  const barrel = geometry.barrel;
  const barrelBase = { x: barrel.left, y: (barrel.top + barrel.bottom) / 2 };
  const barrelTip = { x: barrel.right, y: (barrel.top + barrel.bottom) / 2 };
  const threatCenter = { x: item.x + 27, y: item.y + 27 };
  const distance = Math.hypot(threatCenter.x - barrelTip.x, threatCenter.y - barrelTip.y);
  const maxDistance = Math.max(
    Math.hypot(barrelTip.x, barrelTip.y),
    Math.hypot(stageRect.width - barrelTip.x, barrelTip.y),
    Math.hypot(barrelTip.x, stageRect.height - barrelTip.y),
    Math.hypot(stageRect.width - barrelTip.x, stageRect.height - barrelTip.y)
  ) || 1;
  const distanceFactor = Math.max(0, 1 - distance / maxDistance);
  const barrelVector = { x: barrelTip.x - barrelBase.x, y: barrelTip.y - barrelBase.y };
  const targetVector = { x: threatCenter.x - barrelTip.x, y: threatCenter.y - barrelTip.y };
  const barrelLength = Math.hypot(barrelVector.x, barrelVector.y) || 1;
  const targetLength = Math.hypot(targetVector.x, targetVector.y) || 1;
  const directionFactor = Math.max(0, (barrelVector.x * targetVector.x + barrelVector.y * targetVector.y) / (barrelLength * targetLength));
  return item.factor.baseScore
    + item.factor.distance * distanceFactor
    + item.factor.direction * directionFactor;
}

function updateThreatScores(allowReorder = true) {
  const items = Array.from(activeThreats.values());
  const geometry = getTargetGeometry();
  items.forEach((item) => item.score = threatScore(item, geometry));
  items.sort((a, b) => b.score - a.score);
  const topTag = items.length ? items[0].tag : null;
  activeThreats.forEach((item) => item.el.classList.toggle("top-threat", item.tag === topTag));
  renderPriorityList(items, topTag, allowReorder);
}

function scheduleThreatScores() {
  pendingScoreUpdate = true;
  if (scoreFrame) return;
  scoreFrame = window.requestAnimationFrame(() => {
    scoreFrame = null;
    if (!pendingScoreUpdate) return;
    pendingScoreUpdate = false;
    updateThreatScores(!dragThreat);
  });
}

function renderPriorityList(items, topTag, allowReorder = true) {
  const firstRects = new Map();
  const previousRanks = new Map();
  if (allowReorder) {
    Array.from(priorityList.children).forEach((node, index) => {
      firstRects.set(node.dataset.tag, node.getBoundingClientRect());
      previousRanks.set(node.dataset.tag, index);
    });
  }

  items.forEach((item, index) => {
    let node = Array.from(priorityList.querySelectorAll(".priority-item")).find((itemNode) => itemNode.dataset.tag === item.tag);
    if (!node) {
      node = document.createElement("div");
      node.className = "priority-item";
      node.dataset.tag = item.tag;
      node.innerHTML = `
        <div class="priority-rank"></div>
        <div class="priority-name"></div>
        <div class="priority-score"></div>
      `;
    }

    node.classList.toggle("top", item.tag === topTag);
    node.querySelector(".priority-name").textContent = threatNames[item.tag] || item.tag;
    node.querySelector(".priority-score").textContent = fmt(item.score);
    if (priorityList.children[index] !== node) {
      priorityList.insertBefore(node, priorityList.children[index] || null);
    } else if (!node.parentNode) {
      priorityList.appendChild(node);
    }
  });

  priorityList.querySelectorAll(".priority-item").forEach((node) => {
    if (!activeThreats.has(node.dataset.tag)) node.remove();
  });

  Array.from(priorityList.children).forEach((node, index) => {
    node.querySelector(".priority-rank").textContent = index + 1;
  });

  if (!allowReorder) return;

  Array.from(priorityList.children).forEach((node, index) => {
    const firstRect = firstRects.get(node.dataset.tag);
    if (!firstRect || previousRanks.get(node.dataset.tag) === index) return;

    const lastRect = node.getBoundingClientRect();
    const deltaX = firstRect.left - lastRect.left;
    const deltaY = firstRect.top - lastRect.top;
    node.classList.add("rank-moving");
    node.style.transition = "none";
    node.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1)`;

    window.requestAnimationFrame(() => {
      node.style.transition = "transform 0.12s ease-out";
      node.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.1)`;
      window.setTimeout(() => {
        node.style.transition = "transform 0.34s cubic-bezier(0.18, 0.9, 0.22, 1)";
        node.style.transform = "";
        window.setTimeout(() => {
          node.classList.remove("rank-moving");
          node.style.transition = "";
        }, 360);
      }, 120);
    });
  });
}

function weaponById(id) {
  return weaponLookup.get(id);
}

function weaponSectionFields(section, mode) {
  if (mode === "compare" && section.compareFields) return section.compareFields;
  if (mode === "detail" && section.detailFields) return section.detailFields;
  return section.fields || [];
}

function weaponDetailRows(weapon, section) {
  return weaponSectionFields(section, "detail").map((key) => ({
    name: key,
    value: weaponFieldDisplay(weapon, key)
  }));
}

function openWeaponDetail(index) {
  const weapon = weaponById(index);
  if (!weapon) return;
  detailTitle.textContent = "枪械详细参数";
  detailHero.classList.remove("player-rank-hero");
  detailHero.classList.remove("player-hero");
  detailHero.innerHTML = `
    ${factionBadge({ faction: weapon["阵营"] })}
    <h3>${escapeHtml(displayValue(weapon["枪械名称"]))}</h3>
  `;
  detailRows.innerHTML = detailIconPanel(weaponIconSrc(weapon), displayValue(weapon["枪械名称"]), "weapon-icon") + weaponSections
    .map((section) => renderDetailSection(section.title, weaponDetailRows(weapon, section)))
    .join("");
  detailModal.classList.add("open");
  resetDialogScroll(detailModal);
}

function playerDetailRows(player, section) {
  return section.rows.map((row) => ({
    name: row.label,
    value: formatPlayerValue(player, row.key, row.formatter),
    rank: row.ranked ? playerRank(player, row.key) : ""
  }));
}

function openPlayerDetail(index) {
  const player = players[index];
  if (!player) return;
  detailTitle.textContent = "玩家详细参数";
  detailHero.classList.remove("player-rank-hero");
  detailHero.classList.add("player-hero");
  detailHero.innerHTML = `
    <section class="player-name-card">
      <div class="player-name-large">${escapeHtml(displayValue(player.username))}</div>
    </section>
    <section class="player-rank-card">
      <div class="player-rank-label">排名</div>
      <div class="player-rank-number">${escapeHtml(formatInteger(player.leaderboard_position))}</div>
    </section>
  `;
  detailRows.innerHTML = playerDetailSections
    .map((section) => renderDetailSection(section.title, playerDetailRows(player, section)))
    .join("");
  detailModal.classList.add("open");
  resetDialogScroll(detailModal);
}

function weaponCompareRow(key, a, b) {
  const leftValue = numericValue(a[key]);
  const rightValue = numericValue(b[key]);
  const leftExplosive = key === "致死" && isExplosiveKill(a[key]);
  const rightExplosive = key === "致死" && isExplosiveKill(b[key]);
  let comparable = leftValue !== null && rightValue !== null;
  let leftCompare = comparable ? leftValue : 0;
  let rightCompare = comparable ? rightValue : 0;

  if (key === "致死" && leftExplosive !== rightExplosive) {
    comparable = true;
    leftCompare = leftExplosive ? 1 : 0;
    rightCompare = rightExplosive ? 1 : 0;
  }

  if (key === "射击间隔" && (leftValue === null || rightValue === null || leftValue < 0 || rightValue < 0)) {
    comparable = false;
    leftCompare = 0;
    rightCompare = 0;
  }

  return {
    label: key,
    leftDisplay: weaponFieldDisplay(a, key),
    rightDisplay: weaponFieldDisplay(b, key),
    leftCompare,
    rightCompare,
    comparable,
    lowerBetter: !weaponHigherBetter.has(key)
  };
}

function weaponCompareRows(a, b) {
  const rows = [];
  weaponSections.forEach((section) => {
    rows.push({ type: "group", label: section.title });
    weaponSectionFields(section, "compare").forEach((key) => rows.push(weaponCompareRow(key, a, b)));
  });
  return rows;
}

function openWeaponComparison(indexA, indexB) {
  if (indexA === undefined || indexB === undefined) {
    showToast("需要先选择两个枪械");
    return;
  }

  if (indexA === indexB) {
    showToast("请选择两个不同的枪械");
    return;
  }

  const a = weaponById(indexA);
  const b = weaponById(indexB);
  if (!a || !b) return;
  const rows = weaponCompareRows(a, b);

  compareCards.innerHTML = `
    <section class="vehicle-card">
      <div class="vehicle-head">
        <div class="vehicle-head-text">
          ${factionBadge({ faction: a["阵营"] })}
          <h3>${escapeHtml(displayValue(a["枪械名称"]))}</h3>
          <div class="weapon">${escapeHtml(displayValue(a["类型"]))}</div>
        </div>
        ${assetIconHtml(weaponIconSrc(a), displayValue(a["枪械名称"]), "compare-icon weapon-icon")}
      </div>
      <div class="side-values">${sideMetricRows(rows, "left")}</div>
    </section>
    <section class="metric-labels">${metricLabels(rows)}</section>
    <section class="vehicle-card">
      <div class="vehicle-head">
        <div class="vehicle-head-text">
          ${factionBadge({ faction: b["阵营"] })}
          <h3>${escapeHtml(displayValue(b["枪械名称"]))}</h3>
          <div class="weapon">${escapeHtml(displayValue(b["类型"]))}</div>
        </div>
        ${assetIconHtml(weaponIconSrc(b), displayValue(b["枪械名称"]), "compare-icon weapon-icon")}
      </div>
      <div class="side-values">${sideMetricRows(rows, "right")}</div>
    </section>
  `;

  compareMetrics.innerHTML = "";
  document.getElementById("compareTitle").textContent = "枪械对比";
  modal.classList.add("open");
  resetDialogScroll(modal);
}

function openComparison(indexA, indexB) {
  if (indexA === undefined || indexB === undefined) {
    showToast("需要先选择两个载具");
    return;
  }

  if (indexA === indexB) {
    showToast("请选择两个不同的载具");
    return;
  }

  const a = vehicles[indexA];
  const b = vehicles[indexB];
  const aHitsB = hitResult(a, b);
  const bHitsA = hitResult(b, a);
  const rows = buildCompareRows(a, b, aHitsB, bHitsA);

  compareCards.innerHTML = `
    <section class="vehicle-card">
      <div class="vehicle-head">
        <div class="vehicle-head-text">
          ${factionBadge(a)}
          <h3>${escapeHtml(a.name)}</h3>
          <div class="weapon">${escapeHtml(a.weapon)}</div>
        </div>
        ${assetIconHtml(vehicleIconSrc(a), a.name, "compare-icon")}
      </div>
      <div class="side-values">${sideMetricRows(rows, "left")}</div>
    </section>
    <section class="metric-labels">${metricLabels(rows)}</section>
    <section class="vehicle-card">
      <div class="vehicle-head">
        <div class="vehicle-head-text">
          ${factionBadge(b)}
          <h3>${escapeHtml(b.name)}</h3>
          <div class="weapon">${escapeHtml(b.weapon)}</div>
        </div>
        ${assetIconHtml(vehicleIconSrc(b), b.name, "compare-icon")}
      </div>
      <div class="side-values">${sideMetricRows(rows, "right")}</div>
    </section>
  `;

  compareMetrics.innerHTML = "";

  document.getElementById("compareTitle").textContent = `斗 兽 棋 结 果`;
  modal.classList.add("open");
  resetDialogScroll(modal);
}

searchInput.addEventListener("input", () => {
  if (activeTab === "players") playerPage = 1;
  scheduleApplyView();
});

mobileMenuBtn.addEventListener("click", () => {
  setMobileNavOpen(!document.body.classList.contains("mobile-nav-open"));
});

tagTabs.forEach((button) => {
  button.addEventListener("click", () => setActiveTab(button.dataset.tab));
});

sortableHeaders = Array.from(document.querySelectorAll("th.sortable"));
sortableHeaders.forEach((header) => {
  header.addEventListener("click", () => {
    const key = header.dataset.sort;
    const isPlayerSort = header.classList.contains("player-sort");
    const isWeaponSort = header.classList.contains("weapon-sort");
    const state = isPlayerSort ? playerSortState : (isWeaponSort ? weaponSortState : sortState);
    let nextState;
    if (state.key !== key) {
      nextState = { key, mode: "advantage" };
    } else if (state.mode === "advantage") {
      nextState = { key, mode: "disadvantage" };
    } else {
      nextState = { key: null, mode: null };
    }
    if (isPlayerSort) {
      playerSortState = nextState;
      playerPage = 1;
    } else if (isWeaponSort) {
      weaponSortState = nextState;
    } else {
      sortState = nextState;
    }
    applyView();
  });
});

compareBtn.addEventListener("click", () => setCompareMode(!compareMode));
targetModeBtn.addEventListener("click", () => setTargetMode(!targetMode));
confirmCompareBtn.addEventListener("click", () => {
  if (activeTab === "weapons") {
    if (selectedWeaponIndices.length !== 2) {
      showToast("需要点选两个枪械");
      return;
    }
    openWeaponComparison(selectedWeaponIndices[0], selectedWeaponIndices[1]);
    setCompareMode(false);
    return;
  }

  if (selectedIndices.length !== 2) {
    showToast("需要点选两个载具");
    return;
  }
  openComparison(selectedIndices[0], selectedIndices[1]);
  setCompareMode(false);
});
rowsEl.addEventListener("click", (event) => {
  const row = event.target.closest("tr[data-index]");
  if (!row) return;
  const index = Number(row.dataset.index);
  if (compareMode) {
    toggleRowSelection(index);
    return;
  }
  if (targetMode) {
    if (isUnarmedVehicle(vehicles[index])) {
      showToast("该载具没有武器，无法查看索敌优先级");
      return;
    }
    openTargetOptimizer(index);
    return;
  }
  openDetail(index);
});
weaponRowsEl.addEventListener("click", (event) => {
  const row = event.target.closest("tr[data-index]");
  if (!row) return;
  const index = Number(row.dataset.index);
  if (compareMode) {
    toggleRowSelection(index);
    return;
  }
  openWeaponDetail(index);
});
playerRowsEl.addEventListener("click", (event) => {
  const row = event.target.closest("tr[data-index]");
  if (!row) return;
  openPlayerDetail(Number(row.dataset.index));
});
playerPaginationEl.addEventListener("click", (event) => {
  const button = event.target.closest(".page-button[data-page]");
  if (!button || button.disabled) return;
  const page = Number(button.dataset.page);
  if (!Number.isFinite(page)) return;
  playerPage = page;
  applyView();
  resetTablePosition();
});
function handleMapPerspectiveClick(perspectiveButton) {
  if (!perspectiveButton) return;
  const popup = window.open("", "_blank");
  if (!popup) {
    showToast("浏览器阻止了新窗口，请允许弹窗后重试");
    return;
  }
  showPopupLoading(popup, "正在生成地图图片");
  loadMapData(perspectiveButton.dataset.mapId).then((mapData) => {
    if (mapData) return openProcessedMap(perspectiveButton.dataset.faction, mapData, popup, perspectiveButton.dataset.state || "friendly_all");
    showPopupError(popup, "地图图片生成失败", "请关闭这个页面后，回到主页面重新点击阵营视角按钮生成一次。");
  }).catch((error) => {
    console.error(error);
    showPopupError(popup, "地图图片生成失败", "请关闭这个页面后，回到主页面重新点击阵营视角按钮生成一次。");
    showToast("地图图片生成失败");
  });
}

mapRowsEl.addEventListener("click", (event) => {
  const openButton = event.target.closest(".map-open-button");
  if (openButton) {
    openMapDetail(openButton.dataset.mapId).catch((error) => {
      console.error(error);
      showMapError("地图数据请求失败", "请检查网络连接后重新打开地图详情。");
      showToast("网络错误：地图数据请求失败");
    });
    return;
  }
  handleMapPerspectiveClick(event.target.closest(".map-perspective-button"));
});
mapPerspectiveActions.addEventListener("click", (event) => {
  handleMapPerspectiveClick(event.target.closest(".map-perspective-button"));
});
modelRowsEl.addEventListener("click", (event) => {
  const card = event.target.closest(".model-card");
  if (!card) return;
  const model = models.find((item) => item.id === card.dataset.modelId);
  if (!model?.model) {
    showToast("该模型资源不可用");
    return;
  }
  const url = `model-viewer.html?id=${encodeURIComponent(model.id)}`;
  const popup = window.open(url, "_blank");
  if (popup) {
    popup.opener = null;
  } else {
    showToast("浏览器阻止了新窗口，请允许弹窗后重试");
  }
});
threatButtons.addEventListener("click", (event) => {
  const button = event.target.closest(".threat-button");
  if (!button) return;
  toggleThreat(button.dataset.tag);
});
targetStage.addEventListener("pointerdown", (event) => {
  const token = event.target.closest(".threat-token");
  if (!token) return;
  const item = activeThreats.get(token.dataset.tag);
  if (!item) return;
  invalidateTargetGeometry();
  const rect = token.getBoundingClientRect();
  dragThreat = { item, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
  token.classList.add("dragging");
  token.setPointerCapture(event.pointerId);
});
targetStage.addEventListener("pointermove", (event) => {
  if (!dragThreat) return;
  event.preventDefault();
  const stageRect = getTargetGeometry().stageRect;
  placeThreat(dragThreat.item, event.clientX - stageRect.left - dragThreat.offsetX, event.clientY - stageRect.top - dragThreat.offsetY);
  scheduleThreatScores();
});
targetStage.addEventListener("pointerup", (event) => {
  if (!dragThreat) return;
  dragThreat.item.el.classList.remove("dragging");
  dragThreat = null;
  updateThreatScores();
});
targetStage.addEventListener("pointercancel", () => {
  if (dragThreat) dragThreat.item.el.classList.remove("dragging");
  dragThreat = null;
  updateThreatScores();
});
closeModal.addEventListener("click", () => modal.classList.remove("open"));
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.classList.remove("open");
});
closeDetailModal.addEventListener("click", () => detailModal.classList.remove("open"));
detailModal.addEventListener("click", (event) => {
  if (event.target === detailModal) detailModal.classList.remove("open");
});
closeTargetModal.addEventListener("click", () => targetModal.classList.remove("open"));
targetModal.addEventListener("click", (event) => {
  if (event.target === targetModal) targetModal.classList.remove("open");
});
closeMapModal.addEventListener("click", () => mapModal.classList.remove("open"));
mapModal.addEventListener("click", (event) => {
  if (event.target === mapModal) mapModal.classList.remove("open");
});
window.addEventListener("resize", () => {
  invalidateTargetGeometry();
  activeThreats.forEach((item) => placeThreat(item, item.x, item.y));
  if (targetModal.classList.contains("open")) updateThreatScores();
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    modal.classList.remove("open");
    detailModal.classList.remove("open");
    targetModal.classList.remove("open");
    mapModal.classList.remove("open");
  }
});

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || location.protocol !== "https:") return;
  idle(() => {
    navigator.serviceWorker.register("sw.js").then((registration) => {
      registration.update().catch(() => {});
    }).catch((error) => {
      console.warn("Service worker registration failed", error);
    });
  });
}

async function clearAppCaches() {
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith("rwr-cache-"))
      .map((key) => caches.delete(key)));
  }
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "CLEAR_RWR_CACHES" });
  }
}

async function checkAssetManifest() {
  if (!/^https?:$/.test(location.protocol)) return false;
  const response = await fetchWithTimeout("data/asset-manifest.json", { cache: "no-store" }, 8000);
  if (!response.ok) {
    throw new Error(`网络错误：资源清单加载失败（${response.status}）`);
  }
  const manifest = await response.json();
  if (!manifest.version) {
    throw new Error("网络错误：资源清单格式错误");
  }
  assetManifestPaths = manifest.files ? new Set(Object.keys(manifest.files)) : null;
  const key = "rwrAssetManifestVersion";
  const previous = localStorage.getItem(key);
  const refreshedKey = "rwrAssetManifestRefreshed";
  const refreshedVersion = sessionStorage.getItem(refreshedKey);
  localStorage.setItem(key, manifest.version);
  canUseCachedResources = Boolean(previous && previous === manifest.version && refreshedVersion !== manifest.version);
  if (refreshedVersion === manifest.version) sessionStorage.removeItem(refreshedKey);
  if (previous && previous !== manifest.version) {
    await clearAppCaches();
    sessionStorage.setItem(refreshedKey, manifest.version);
    location.reload();
    return true;
  }
  return false;
}

async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    throw new Error(error.name === "AbortError" ? "网络错误：请求超时" : "网络错误：请求失败");
  } finally {
    window.clearTimeout(timer);
  }
}

checkAssetManifest()
  .then((reloading) => {
    if (reloading) return null;
    return loadData();
  })
  .then(() => {
    if (vehicles.length === 0 && weapons.length === 0 && maps.length === 0 && players.length === 0) return;
    applyView();
    setLoading(false);
    registerServiceWorker();
  })
  .catch((error) => {
    console.error(error);
    const message = error.message && error.message.startsWith("网络错误") ? error.message : "网络错误：数据加载失败";
    showNetworkError(message);
    showToast(message);
  });
