# RWR 鍙傛暟鏌ヨ鍣?
杩欐槸涓€涓粰 Running With Rifles DLC 鏁版嵁鍋氭祻瑙堝拰瀵圭収鐢ㄧ殑绾墠绔〉闈€傞」鐩殑鏍稿績鐩爣寰堢畝鍗曪細鎶婃暎钀藉湪 JSON銆佸湴鍥惧浘鐗囥€佸浘鏍囧拰 `.vehicle` 鏂囦欢閲岀殑鍙傛暟鏁寸悊鎴愪竴涓彲浠ョ洿鎺ユ煡銆佺洿鎺ュ姣斻€佺洿鎺ョ敓鎴愬湴鍥捐鏂藉浘鐨勭綉椤点€?
鏁翠釜椤圭洰娌℃湁鍚庣锛屼篃娌℃湁鏋勫缓娴佺▼銆傛墦寮€椤甸潰鍚庯紝娴忚鍣ㄤ細閫氳繃 `fetch()` 璇诲彇 `data` 鍜?`maps` 鐩綍涓殑 JSON 鏂囦欢锛屽啀鍦ㄥ墠绔畬鎴愬垪琛ㄦ覆鏌撱€佹帓搴忋€佸姣斻€佸湴鍥惧脊绐楀拰鍦板浘鍥炬爣鍙犲姞銆?
鎺ㄨ崘鐢ㄦ湰鍦伴潤鎬佹湇鍔¤繍琛岋細

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

鐒跺悗璁块棶锛?
```text
http://127.0.0.1:8765/index.html
```

椤甸潰鏈韩鏄潤鎬佺殑锛岄儴缃插埌浠讳綍鑳芥彁渚涢潤鎬佹枃浠剁殑鍦版柟閮藉彲浠ャ€傚彧瑕佺洰褰曠粨鏋勪繚鎸佷笉鍙橈紝`index.html` 灏辫兘鎵惧埌瀹冮渶瑕佺殑鏁版嵁銆佸浘鐗囧拰鍥炬爣銆?
## 椤圭洰姒傝

椤圭洰鐜板湪涓昏鐢卞嚑绫诲唴瀹圭粍鎴愶細

```text
.
鈹溾攢鈹€ index.html          椤甸潰鍏ュ彛锛孒TML銆丆SS銆丣avaScript 閮藉湪杩欓噷
鈹溾攢鈹€ ico.webp            娴忚鍣ㄦ爣绛鹃〉鍥炬爣
鈹溾攢鈹€ csv/                鍙紪杈戠殑鏋銆佽浇鍏锋簮鏁版嵁琛?鈹溾攢鈹€ data/               鍓嶇璇诲彇鐨?JSON 鏁版嵁鍜?asset-manifest.json
鈹溾攢鈹€ maps_textures/             鍦板浘鍙犲姞鍥炬爣锛屾寜鏁板瓧缂栧彿鍛藉悕
鈹溾攢鈹€ maps/               姣忓紶鍦板浘鐨勫浘鐗囧拰 map-data.json
鈹溾攢鈹€ scripts/            鏁版嵁鍚屾鍜岃祫婧愭竻鍗曠淮鎶よ剼鏈?鈹溾攢鈹€ vehicles_textures/  杞藉叿鍥炬爣璧勬簮
鈹溾攢鈹€ weapons_textures/   鏋鍥炬爣璧勬簮
鈹斺攢鈹€ update-assets-and-upload.bat
```

杩欎釜椤圭洰鏈変竴涓緢鏄庢樉鐨勭壒鐐癸細瀹冩妸椤甸潰缁撴瀯銆佹牱寮忓拰閫昏緫閮介泦涓湪 `index.html` 閲屻€傝繖鏍峰仛鐨勫ソ澶勬槸澶嶅埗鍜岃繍琛岄兘寰堢洿鎺ワ紝涓嶉渶瑕佸畨瑁呬緷璧栵紝涔熶笉闇€瑕佸厛鏋勫缓銆備唬浠锋槸杩欎釜鏂囦欢浼氭瘮杈冮暱锛岃浠ｇ爜鏃舵渶濂芥寜鍔熻兘鍧楁潵璇伙紝鑰屼笉鏄粠绗竴琛屼竴璺湅鍒版渶鍚庝竴琛屻€?
椤甸潰鍒嗘垚涓変釜涓荤晫闈細

- `杞藉叿鏌ヨ`
- `鏋鏌ヨ`
- `鍦板浘鏌ヨ`

杞藉叿鍜屾灙姊扮晫闈富瑕佹槸鍙傛暟琛ㄥ拰瀵规瘮宸ュ叿銆傚湴鍥剧晫闈㈣礋璐ｅ睍绀哄湴鍥惧垪琛紝鎵撳紑鍩虹鍦板浘锛屼互鍙婃寜鈥滈樀钀ヨ瑙?+ 鍗犻鐘舵€佲€濈敓鎴愬甫璁炬柦鍥炬爣鐨勫湴鍥惧浘鐗囥€?
## 鏂囦欢鑱岃矗

### csv/

`csv` 鐩綍鏄灙姊板拰杞藉叿鐨勪汉宸ョ紪杈戞簮鏁版嵁锛?
- `csv/weapons.csv`
- `csv/vehicles.csv`

寮€鍙戣€呴渶瑕佸鍒犳垨淇敼鏋銆佽浇鍏锋暟鎹椂锛屼紭鍏堢紪杈戣繖涓や釜 CSV銆備笂浼犲墠杩愯 `update-assets-and-upload.bat`锛岃剼鏈細鍏堟墽琛岋細

```bat
node scripts/sync-csv-json.js csv-to-json
```

杩欎竴姝ヤ細鎶?CSV 鍚屾鍥?`data/weapons.json` 鍜?`data/vehicles.json`銆傚鏋?CSV 鍐呭娌℃湁瀵艰嚧 JSON 鍙樺寲锛岃剼鏈笉浼氶噸鍐?JSON 鏂囦欢锛岃祫婧愬搱甯屼篃涓嶄細鍥犱负杩欎竴姝ユ敼鍙樸€?
### scripts/

`scripts` 鐩綍淇濆瓨椤圭洰缁存姢鑴氭湰锛?
- `sync-csv-json.js`锛氳礋璐?`data/*.json` 鍜?`csv/*.csv` 涔嬮棿鐨勮浆鎹€?- `build-asset-manifest.js`锛氭壂鎻忛潤鎬佽祫婧愬苟鐢熸垚 `data/asset-manifest.json`銆?
Service Worker 浣嶄簬鏍圭洰褰曠殑 `sw.js`銆傛祻瑙堝櫒瑕佹眰 Service Worker 鐨勬帶鍒惰寖鍥翠笉鑳介珮浜庡叆鍙ｈ剼鏈墍鍦ㄧ洰褰曪紝鎵€浠ユ牴鐩綍椤甸潰闇€瑕佺洿鎺ユ敞鍐屾牴鐩綍涓嬬殑 `sw.js`銆?
### index.html

`index.html` 鏄」鐩殑鍏ュ彛锛屼篃鏄敮涓€鐨勫墠绔唬鐮佹枃浠躲€傚畠鍖呭惈涓夐儴鍒嗭細

- HTML锛氶〉闈㈢粨鏋勩€佽〃鏍笺€佸脊绐椼€佹寜閽€佸姞杞藉眰绛?- CSS锛氫富鐣岄潰甯冨眬銆佽〃鏍艰瑙夈€佸脊绐楁瘺鐜荤拑銆佸湴鍥捐鍥俱€佹嫋鎷藉▉鑳佺偣鍔ㄧ敾
- JavaScript锛氭暟鎹姞杞姐€佹悳绱€佹帓搴忋€佸姣斻€佸湴鍥炬覆鏌撱€丆anvas 鍥剧墖鐢熸垚

鍓嶇娌℃湁浣跨敤妗嗘灦銆傛墍鏈?DOM 鑺傜偣閮介€氳繃 `document.getElementById()` 鎴?`querySelectorAll()` 鑾峰彇锛屼簨浠朵篃鐩存帴缁戝畾鍦ㄥ搴旇妭鐐逛笂銆?
椤甸潰鍔犺浇鍚庝細鍋氳繖浜涗簨鎯咃細

1. 鏄剧ず鍔犺浇灞傘€?2. 骞惰璇诲彇 `data/vehicles.json`銆乣data/weapons.json`銆乣data/maps.json`銆?3. 瑙勮寖鍖栬浇鍏锋暟鎹紝寤虹珛鏋鍜屽湴鍥剧殑鏌ユ壘琛ㄣ€?4. 榛樿娓叉煋杞藉叿鏌ヨ椤点€?5. 鐢ㄦ埛鍒囨崲鏍囩椤点€佹悳绱€佹帓搴忋€佺偣鍑昏鎴栨寜閽椂锛屽啀杩涘叆瀵瑰簲鍔熻兘銆?
### data/vehicles.json

杩欐槸杞藉叿鍙傛暟涓昏〃銆傞〉闈腑鐨勮浇鍏峰垪琛ㄣ€佽浇鍏疯鎯呫€佽浇鍏峰姣斿拰绱㈡晫浼樺厛绾у叆鍙ｉ兘渚濊禆瀹冦€?
鍏稿瀷瀛楁濡備笅锛?
```json
{
  "闃佃惀": "鑻卞啗",
  "鐢熷懡鍊?: 26,
  "鏈€澶ч€熷害": 6,
  "鍔犻€熷害": 10,
  "鐐杞€?: 2.86,
  "鍙楀嚮闂ㄦ": 1.02,
  "鐖嗙偢鍑忎激": 0.9,
  "杞藉叿鍚?: "涓樺悏灏擬k.VII姝ュ叺鍧﹀厠",
  "姝﹀櫒鍚?: "75mm 鍧﹀厠鐐?,
  "瑁呭～閫熷害": 4.4,
  "鐜╁瑙嗛噹淇": 1,
  "鐖嗙偢浼ゅ": 4.8,
  "杞藉叿绫诲瀷": "medium_armour"
}
```

椤甸潰閲岀殑 `normalizeVehicle()` 浼氭妸杩欎簺瀛楁杞崲鎴愬唴閮ㄤ娇鐢ㄧ殑鑻辨枃閿紝姣斿 `hp`銆乣speed`銆乣acceleration`銆乣name`銆乣weapon` 绛夈€傝繖鏍峰悗闈㈢殑鎺掑簭鍜屾瘮杈冮€昏緫灏变笉鐢ㄥ弽澶嶅鐞嗕腑鏂囧瓧娈靛悕銆?
杞藉叿椤典富瑕佺敤杩欎簺瀛楁锛?
- 闃佃惀
- 杞藉叿鍚?- 鐢熷懡鍊?- 鏈€澶ч€熷害
- 鍔犻€熷害
- 鐐杞€?- 鍙楀嚮闂ㄦ
- 鐖嗙偢鍑忎激
- 姝﹀櫒鍚?- 瑁呭～閫熷害
- 鐜╁瑙嗛噹淇
- 鐖嗙偢浼ゅ
- 杞藉叿绫诲瀷

鍏朵腑 `杞藉叿绫诲瀷` 杩樹細鍙備笌绱㈡晫浼樺厛绾ц绠楋紝渚嬪 `medium_armour`銆乣light_vehicle`銆乣defensive_weapon` 绛夈€?
### data/weapons.json

杩欐槸鏋鍙傛暟涓昏〃銆傛灙姊版煡璇㈤〉浼氳鍙栧畠骞舵寜瀛楁娓叉煋琛ㄦ牸銆佽鎯呭拰瀵规瘮鍐呭銆?
甯歌瀛楁鍖呮嫭锛?
```json
{
  "id": 1,
  "闃佃惀": "寰峰啗",
  "绫诲瀷": "姝ユ灙",
  "鏋鍚嶇О": "Kar98k",
  "鏂囦欢鍚嶇О": "kar98k.weapon",
  "鍩虹绮惧害": 0.98,
  "鑷存": 1,
  "灏勯€?: 0.9,
  "鍗曞彂鍚庡潗鍔?: 0.2,
  "琛板噺寮€濮嬭窛绂?: 80
}
```

`weaponSections` 瀹氫箟浜嗘灙姊拌鎯呴〉鐨勫睍绀哄垎缁勩€備笉鍚岀被鍨嬬殑瀛楁浼氳鎷嗘垚涓嶅悓鍖哄煙锛岄伩鍏嶈鎯呭脊绐楅噷鍙樻垚涓€鏁村紶寰堥暱鐨勬棤缁撴瀯琛ㄣ€?
鏋瀵规瘮鏃讹紝椤甸潰浼氱敤 `numericValue()` 灏介噺浠庡瓧娈典腑鎻愬彇鏁板瓧銆傚鏋滄煇涓瓧娈典笉鏄櫘閫氭暟瀛楋紝姣斿 `鑷存` 閲屽嚭鐜扮垎鐐哥被鎻忚堪锛屼唬鐮佷細璧板崟鐙殑灞曠ず閫昏緫銆?
### data/maps.json

杩欐槸鍦板浘鍒楄〃鎽樿銆傚畠涓嶆槸鍦板浘璁炬柦鐐逛綅鐨勫畬鏁存暟鎹紝瀹屾暣鐐逛綅鍦?`maps/<鍦板浘鍚?/map-data.json` 涓€?
`maps.json` 鐨勮亴璐ｆ槸璁╁湴鍥句富鐣岄潰蹇€熺煡閬擄細

- 鏈夊摢浜涘湴鍥?- 鍦板浘灞炰簬鍝釜绯诲垪
- 鍦板浘鍒楄〃閲屾樉绀轰粈涔堝悕瀛?- 鍩虹鍦板浘浼樺厛鐢ㄥ摢寮?PNG
- 杩欏紶鍦板浘鏈夊摢浜涢樀钀ヨ瑙?- 姣忎釜瑙嗚鏈夊摢浜涘崰棰嗙姸鎬?- 璇︾粏鏁版嵁鏂囦欢鍦ㄥ摢閲?
褰撳墠缁撴瀯绀轰緥锛?
```json
{
  "id": "edelweiss1",
  "group": "闆粧鑺?,
  "name": "edelweiss1",
  "baseImage": "map_axis.png",
  "factions": [
    {
      "id": "Allies",
      "label": "鐩熷啗",
      "image": "map_allies.png"
    },
    {
      "id": "Axis",
      "label": "寰峰啗",
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

鏃х増 `maps.json` 鏇剧粡淇濆瓨杩囨棤绾跨數骞叉壈鍣ㄣ€佸潶鍏嬨€佸弽鍧﹀厠鐐€侀噸鏈烘灙鏁伴噺銆傜幇鍦ㄨ繖浜涚粺璁″垪宸茬粡浠庡湴鍥句富鐣岄潰绉婚櫎锛屾墍浠ユ憳瑕侀噷涔熶笉鍐嶄繚瀛?`counts`銆傚湴鍥鹃〉鍙叧蹇冨湴鍥惧垪琛ㄥ拰鎿嶄綔鎸夐挳锛岃鏂藉埛鏂版槑缁嗗叏閮ㄤ互鍦板浘鐩綍閲岀殑 `map-data.json` 涓哄噯銆?
### data/asset-manifest.json

`asset-manifest.json` 淇濆瓨闈欐€佽祫婧愯矾寰勫拰瀵瑰簲鐨?SHA-256 鍝堝笇銆傞〉闈㈠拰 Service Worker 鐢ㄥ畠鍒ゆ柇璧勬簮鏄惁鐪熺殑鍙樺寲锛岄伩鍏嶇敤鎴锋祻瑙堝櫒閲嶅璇锋眰娌℃湁鍙樺寲鐨?JSON銆佸浘鐗囧拰鑴氭湰銆?
杩欎釜鏂囦欢鐢?`scripts/build-asset-manifest.js` 鐢熸垚锛屼笉闇€瑕佹墜宸ョ紪杈戙€傜敓鎴愯剼鏈細姣旇緝鐜版湁娓呭崟涓殑 `version` 鍜?`files`锛屽鏋滆祫婧愬唴瀹规病鏈夊彉鍖栵紝灏变笉浼氬彧鍥犱负鐢熸垚鏃堕棿涓嶅悓鑰岄噸鍐欐竻鍗曘€?
### maps_textures/

`maps_textures` 鐩綍淇濆瓨鍦板浘涓婂彔鍔犵殑灏忓浘鏍囥€傚懡鍚嶈鍒欓潪甯哥洿鎺ワ細鍥炬爣缂栧彿灏辨槸鏂囦欢鍚嶃€?
```text
maps_textures/
鈹溾攢鈹€ 0.png
鈹溾攢鈹€ 1.png
鈹溾攢鈹€ 2.png
鈹溾攢鈹€ ...
鈹溾攢鈹€ 59.png
鈹溾攢鈹€ 60.png
鈹斺攢鈹€ 73.png
```

鍦板浘 JSON 閲岀殑 `icon` 鍊煎搴旇繖閲岀殑鏂囦欢銆備緥濡傦細

```json
{
  "key": "vickers_hmg.vehicle",
  "icon": 7,
  "x": 1338.33,
  "y": 284.42
}
```

椤甸潰鐢熸垚鍙犲姞鍥炬椂浼氬姞杞斤細

```text
maps_textures/7.webp
```

濡傛灉闇€瑕佺煡閬撴煇涓浇鍏峰簲璇ョ敤鍑犲彿鍥炬爣锛屽彲浠ュ幓 `vehicles/<鏂囦欢鍚?.vehicle` 涓煡 `map_view_atlas_index`銆?
渚嬪锛?
```xml
<vehicle name="Vickers Mk I HMG" key="vickers_hmg.vehicle" map_view_atlas_index="7">
```

杩欎釜鍊煎拰鍦板浘 JSON 閲岀殑 `icon` 搴斾繚鎸佷竴鑷淬€?
### maps/

`maps` 鏄湴鍥惧姛鑳芥渶閲嶈鐨勭洰褰曘€傛瘡寮犲湴鍥句竴涓瓙鏂囦欢澶癸紝閲岄潰鑷冲皯鏈変竴涓?`map-data.json`锛屽苟涓旈€氬父浼氭湁涓€寮犳垨澶氬紶鍦板浘鍥剧墖銆?
绀轰緥锛?
```text
maps/
鈹溾攢鈹€ edelweiss1/
鈹?  鈹溾攢鈹€ map-data.json
鈹?  鈹溾攢鈹€ map_axis.png
鈹?  鈹斺攢鈹€ map_allies.png
鈹溾攢鈹€ edelweiss7/
鈹?  鈹溾攢鈹€ map-data.json
鈹?  鈹溾攢鈹€ map.png
鈹?  鈹斺攢鈹€ map_allies.png
鈹斺攢鈹€ island1/
    鈹溾攢鈹€ map-data.json
    鈹斺攢鈹€ map.png
```

鍦板浘鍥剧墖绾﹀畾锛?
- `map.png` 鏄€氱敤鍩虹鍥俱€?- `map_axis.png` 鏄痉鍐涜瑙掑浘銆?- `map_allies.png` 鏄洘鍐涜瑙掑浘銆?- `map_usmc.png` 鏄編鍐涜瑙掑浘銆?- `map_ija.png` 鏄棩鍐涜瑙掑浘銆?
鐐瑰嚮鍦板浘椤甸噷鐨?`鏌ョ湅鍦板浘` 鏃讹紝椤甸潰浼氫紭鍏堟樉绀鸿鍦板浘鐩綍涓殑 `map.png`銆傚鏋滄病鏈?`map.png`锛屽氨鐢ㄦ憳瑕侀噷鐨?`baseImage` 鎴栫洰褰曚腑鍙敤鐨勯樀钀ュ浘浣滀负鍩虹鍥俱€?
鐐瑰嚮瑙嗚鎸夐挳鏃讹紝椤甸潰浼氭牴鎹寜閽笂鐨勯樀钀ュ拰鐘舵€侊紝閫夋嫨瀵瑰簲瑙嗚鍥句綔涓哄簳鍥撅紝鍐嶆妸璁炬柦鍥炬爣缁樺埗鍒?Canvas 涓娿€?
### vehicles/

`vehicles` 鐩綍淇濆瓨鍘熷 `.vehicle` 鏂囦欢銆傞〉闈㈣繍琛屾椂涓嶄細鐩存帴璇锋眰杩欎釜鐩綍锛屼絾瀹冨鐞嗚В鏁版嵁鏉ユ簮寰堟湁鐢ㄣ€?
涓€涓?`.vehicle` 鏂囦欢閫氬父鑳芥彁渚涜繖浜涗俊鎭細

- 杞藉叿鏂囦欢鍚嶏紝涔熷氨鏄湴鍥?JSON 閲岀殑 `key`
- 鍦板浘鍥炬爣缂栧彿锛屼篃灏辨槸 `map_view_atlas_index`
- 杞藉叿鏍囩锛屾瘮濡?`tank`銆乣hmg`銆乣defensive_weapon`
- 杞藉叿缁ф壙鍏崇郴锛屾瘮濡?`m4_firefly.vehicle` 缁ф壙 `m4_firefly_base.vehicle`

渚嬪锛?
```xml
<vehicle file="vehicle_base.vehicle" name="Churchill Mk VII" key="churchill_mkvii.vehicle" map_view_atlas_index="73">
```

杩欒鏄庝笜鍚夊皵 Mk VII 鍦ㄥ湴鍥句笂搴斾娇鐢?`maps_textures/73.webp`銆?
## 椤甸潰缁撴瀯

`index.html` 鐨?HTML 涓讳綋澶ц嚧鐢辫繖浜涘尯鍩熺粍鎴愶細

- `loadingPanel`锛氬垵濮嬫暟鎹姞杞芥椂鏄剧ず鐨勫姞杞藉眰
- `.shell`锛氶〉闈㈡渶澶栧眰甯冨眬瀹瑰櫒
- `.main`锛氫富鐣岄潰闈㈡澘
- `.topbar`锛氶《閮ㄦ爣绛惧拰鎼滅储妗?- `.compare-bar`锛氬姣旀寜閽€佺储鏁屾寜閽拰鎻愮ず鏂囧瓧
- `.table-wrap`锛氫笁寮犱富琛ㄦ牸鎵€鍦ㄧ殑婊氬姩鍖哄煙
- `compareModal`锛氳浇鍏?鏋瀵规瘮寮圭獥
- `detailModal`锛氳浇鍏?鏋璇︽儏寮圭獥
- `targetModal`锛氳浇鍏风储鏁屼紭鍏堢骇寮圭獥
- `mapModal`锛氬熀纭€鍦板浘鏌ョ湅寮圭獥
- `toast`锛氱煭鎻愮ず

涓夊紶涓昏〃鏍兼槸骞舵帓鍐欏湪 HTML 閲岀殑锛?
- `vehicleTable`
- `weaponTable`
- `mapTable`

鍒囨崲鏍囩椤垫椂锛屼唬鐮佷笉浼氶噸鏂板垱寤鸿〃鏍硷紝鍙細缁欎笉闇€瑕佹樉绀虹殑琛ㄦ牸鍔犱笂 `hidden` 绫汇€?
## 瑙嗚鍜屽竷灞€

椤甸潰鐨?CSS 浣跨敤浜嗘祬鑹层€佸崐閫忔槑闈㈡澘鍜屾瘮杈冨己鐨勫渾瑙掗槾褰便€傛暣浣撲笉鏄紶缁熷悗鍙拌〃鏍奸偅绉嶅緢纭殑椋庢牸锛岃€屾槸鍋忚交閲忓伐鍏烽〉銆?
鍑犱釜姣旇緝鍏抽敭鐨勬牱寮忕偣锛?
- `body` 绂佹鏁翠綋婊氬姩锛屼富琛ㄦ牸鍖哄煙鍐呴儴婊氬姩銆?- `.main` 浣跨敤 CSS Grid锛屾妸椤堕儴鏍忋€佹搷浣滄爮銆佽〃鏍煎尯鍥哄畾鎴愪笁琛屻€?- 琛ㄥご浣跨敤缁熶竴鐨?`thead` 鑳屾櫙锛岄伩鍏嶆瘡涓垪鍚嶇湅璧锋潵鍍忕嫭绔嬫寜閽€?- 寮圭獥閬僵浣跨敤 `backdrop-filter`锛屽脊绐楁湰浣撲篃鏈夋洿寮虹殑姣涚幓鐠冩晥鏋溿€?- 琛ㄦ牸琛?hover銆佹寜閽?hover銆佸脊绐楄繘鍏ャ€佺储鏁屾帓琛岀Щ鍔ㄩ兘淇濈暀浜嗗姩鎬佹晥鏋溿€?
鍦板浘鍥剧墖寮圭獥鍜岀敓鎴愬悗鐨勬柊鏍囩椤甸噰鐢ㄤ笉鍚岄€昏緫锛?
- `mapModal` 鍙礋璐ｆ樉绀哄熀纭€鍦板浘鍥剧墖銆?- 瑙嗚鎸夐挳浼氭墦寮€鏂版爣绛鹃〉锛岀劧鍚庢妸 Canvas 鐢熸垚鐨?PNG 鏀捐繘鍘汇€?- 鏂版爣绛鹃〉涓殑鍥剧墖鍙互鐐瑰嚮鍒囨崲鈥滈€傚簲绐楀彛鈥濆拰鈥滃師濮嬪昂瀵糕€濄€?
## 鏁版嵁鍔犺浇娴佺▼

椤甸潰鍚姩鏃讹紝`loadData()` 浼氬苟琛岃姹備笁涓枃浠讹細

```js
const [vehicleResponse, weaponResponse, mapResponse] = await Promise.all([
  fetch("data/vehicles.json"),
  fetch("data/weapons.json"),
  fetch("data/maps.json")
]);
```

璇诲彇瀹屾垚鍚庯細

- `vehicles` 淇濆瓨瑙勮寖鍖栧悗鐨勮浇鍏锋暟鎹€?- `weapons` 淇濆瓨鏋鏁版嵁銆?- `maps` 淇濆瓨鍦板浘鎽樿銆?- `weaponLookup` 鐢ㄦ灙姊?`id` 鍋氱储寮曘€?- `mapLookup` 鐢ㄥ湴鍥?`id` 鍋氱储寮曘€?- `mapDataCache` 缂撳瓨宸茬粡璇昏繃鐨勫湴鍥捐鎯呫€?
鍦板浘璇︽儏涓嶆槸鍚姩鏃跺叏閮ㄥ姞杞姐€傚湴鍥剧偣浣嶆暟鎹瘮杈冨锛岃€屼笖鐢ㄦ埛鏈繀姣忓紶鍦板浘閮戒細鎵撳紑锛屾墍浠ラ〉闈㈠彧鍦ㄩ渶瑕佹椂璋冪敤 `loadMapData(mapId)` 璇诲彇瀵瑰簲鐨?`maps/<鍦板浘鍚?/map-data.json`銆?
## 杞藉叿鏌ヨ

杞藉叿椤电殑鏁版嵁鏉ヨ嚜 `data/vehicles.json`銆?
娓叉煋鍏ュ彛鏄細

```js
renderTable(list)
```

姣忎竴琛屼唬琛ㄤ竴涓浇鍏枫€傜偣鍑昏鏃朵細鎵撳紑璇︽儏寮圭獥銆傚鏋滃浜庡姣旀ā寮忥紝鐐瑰嚮琛屼細閫夋嫨鎴栧彇娑堥€夋嫨璇ヨ浇鍏枫€傚鏋滃浜庣储鏁屼紭閫夋ā寮忥紝鐐瑰嚮琛屼細鎵撳紑绱㈡晫浼樺厛绾у脊绐椼€?
杞藉叿椤垫敮鎸佹帓搴忋€傛帓搴忕姸鎬佷繚瀛樺湪锛?
```js
let sortState = { key: null, mode: null };
```

鐐瑰嚮鍚屼竴涓〃澶翠細鍦ㄢ€滀紭鍔挎帓搴?/ 鍔ｅ娍鎺掑簭 / 涓嶆帓搴忊€濅箣闂村垏鎹€備笉鍚屽瓧娈靛鈥滃ソ鍧忊€濈殑鐞嗚В涓嶅悓锛屼緥濡傜敓鍛藉€艰秺楂樿秺濂斤紝瑁呭～閫熷害閫氬父瓒婁綆瓒婂ソ銆傚洜姝や唬鐮佷腑鏈?`vehicleHigherBetter` 杩欐牱鐨勯泦鍚堬紝鐢ㄦ潵鍒ゆ柇鎺掑簭鏂瑰悜銆?
杞藉叿璇︽儏鐢辫繖浜涘嚱鏁扮粍瑁咃細

- `openDetail(index)`
- `detailBaseRows(vehicle)`
- `detailAntiTankRows(vehicle)`
- `repairRows(vehicle)`
- `renderDetailSection(title, rows)`
- `renderDetailRow(row)`

璇︽儏寮圭獥閲岄櫎浜嗗熀鏈睘鎬э紝杩樹細璁＄畻鍙嶅潶鍏嬫鍣ㄥ懡涓悗鐨勪激瀹崇櫨鍒嗘瘮鍜屾懅姣佹墍闇€鍙戞暟銆?
## 鏋鏌ヨ

鏋椤电殑鏁版嵁鏉ヨ嚜 `data/weapons.json`銆?
娓叉煋鍏ュ彛鏄細

```js
renderWeaponTable(list)
```

鏋琛ㄦ牸鏄剧ず闃佃惀銆佺被鍨嬨€佸悕绉板拰鍑犱釜甯哥敤鎴樻枟鍙傛暟銆傜偣鍑绘灙姊拌浼氭墦寮€鏋璇︽儏寮圭獥銆傛灙姊拌鎯呭瓧娈电敱 `weaponSections` 鎺у埗锛屼笉鍚?section 浼氬垪鍑轰笉鍚屽瓧娈点€?
鏋椤典篃鏀寔瀵规瘮锛屽叆鍙ｆ槸锛?
- `openWeaponComparison(indexA, indexB)`
- `weaponCompareRows(a, b)`
- `weaponCompareRow(key, a, b)`

鏋瀵规瘮閲屾湁浜涘瓧娈典笉鏄畝鍗曟暟瀛椼€備緥濡?`鑷存` 鍙兘鏄暟瀛楋紝涔熷彲鑳藉寘鍚垎鐐哥被璇箟銆備唬鐮佺敤 `weaponKillDisplay()`銆乣isExplosiveKill()` 鍜?`numericValue()` 澶勭悊杩欎簺鏄剧ず宸紓銆?
## 瀵规瘮绯荤粺

杞藉叿鍜屾灙姊板叡鐢ㄤ竴濂楅€夋嫨妯″紡銆傜偣鍑婚《閮ㄧ殑瀵规瘮鎸夐挳鍚庯紝椤甸潰杩涘叆 `compareMode`銆?
鐩稿叧鐘舵€侊細

```js
let compareMode = false;
let selectedIndices = [];
let selectedWeaponIndices = [];
```

杞藉叿鍜屾灙姊板垎鍒娇鐢ㄤ笉鍚岀殑閫夋嫨鏁扮粍銆傜‘璁ら€夋嫨涓や釜瀵硅薄鍚庯細

- 杞藉叿璧?`openComparison(indexA, indexB)`
- 鏋璧?`openWeaponComparison(indexA, indexB)`

瀵规瘮寮圭獥涓嶆槸涓€寮犳櫘閫氳〃鏍硷紝鑰屾槸宸﹀彸涓や晶瀵硅薄鍗＄墖鍔犱腑闂存寚鏍囧垪銆傜澶存樉绀轰紭鍔挎柟鍚戙€傚浜庘€滆秺浣庤秺濂解€濈殑瀛楁锛屼細浣跨敤 `compareArrowLowerBetter()`銆傚浜庘€滆秺楂樿秺濂解€濈殑瀛楁锛屼細浣跨敤 `compareArrow()`銆?
杞藉叿瀵规瘮杩樹細璁＄畻鍙屾柟浜掔浉鍛戒腑鍚庣殑瀹為檯浼ゅ銆傝绠楀叆鍙ｆ槸锛?
```js
hitResult(attacker, defender)
```

瀹冧細鑰冭檻鏀诲嚮鏂圭垎鐐镐激瀹炽€侀槻寰℃柟鐖嗙偢鍑忎激銆侀槻寰℃柟鐢熷懡鍊硷紝鏈€鍚庡緱鍑轰激瀹崇櫨鍒嗘瘮鍜屾懅姣侀渶瑕佺殑鍙戞暟銆?
## 杞藉叿绱㈡晫浼樺厛绾?
绱㈡晫浼樺厛绾ф槸涓€涓嫭绔嬬殑灏忓伐鍏凤紝鐢ㄦ潵瑙傚療鏌愪釜杞藉叿闈㈠涓嶅悓濞佽儊绫诲瀷鏃剁殑鐩爣浼樺厛椤哄簭銆?
鍏ュ彛鎸夐挳鏄?`杞藉叿绱㈡晫浼橀€塦銆傚紑鍚悗锛岀偣鍑讳竴涓湁姝﹀櫒鐨勮浇鍏凤紝浼氭墦寮€ `targetModal`銆?
涓昏鍑芥暟锛?
- `openTargetOptimizer(index)`
- `getThreatFactors(vehicle)`
- `renderThreatButtons()`
- `toggleThreat(tag)`
- `placeThreat(item, x, y)`
- `threatScore(item, geometry)`
- `updateThreatScores()`
- `renderPriorityList(items, topTag, allowReorder)`

濞佽儊浼樺厛绾х敱鍑犱釜鍥犵礌鍏卞悓鍐冲畾锛?
- 璺濈
- 鐐鏈濆悜
- squad command 鏉冮噸
- 鍩虹濞佽儊鍒?
濞佽儊鐐瑰彲浠ユ嫋鎷姐€傛嫋鍔ㄥ悗锛屼唬鐮佷細閲嶆柊璁＄畻鍒嗘暟锛屽苟鐢ㄥ姩鐢绘洿鏂板彸渚ф帓琛屻€傛帓琛屾渶楂樼殑濞佽儊鐐逛細鏈夌孩鑹查珮浜幆銆?
杩欎竴鍧楃敤浜嗕笉灏?`transform`銆乣requestAnimationFrame` 鍜?DOM 鍑犱綍璁＄畻銆傚畠涓嶆槸鏁版嵁鏌ヨ鍔熻兘鐨勪竴閮ㄥ垎锛屼絾瀹冨拰杞藉叿鍙傛暟閲岀殑 `vehicleType`銆佹鍣ㄥ悕绱у瘑鐩稿叧銆?
## 鍦板浘鏌ヨ

鍦板浘椤电幇鍦ㄥ彧鏄剧ず涓夊垪锛?
- 鍦板浘缁?- 鍦板浘鍚?- 鎿嶄綔

姣忎竴琛岀殑鎸夐挳鐢?`renderMapTable()` 鍜?`mapPerspectiveButtons()` 鐢熸垚銆?
鎿嶄綔鎸夐挳鍒嗕袱绫伙細

```text
鏌ョ湅鍦板浘
鏌ョ湅鏌愰樀钀ヨ瑙?鏌愰樀钀ュ崰棰?
```

`鏌ョ湅鍦板浘` 浼氭墦寮€鍩虹鍦板浘寮圭獥銆傚畠涓嶅彔鍔犱换浣曞浘鏍囷紝鍙樉绀哄湴鍥惧浘鐗囥€?
鍙岄樀钀ュ湴鍥句細鐢熸垚鍥涗釜瑙嗚鎸夐挳銆備互闆粧鑺卞湴鍥句负渚嬶細

```text
鏌ョ湅寰峰啗瑙嗚(寰峰啗鍗犻)
鏌ョ湅寰峰啗瑙嗚(鐩熷啗鍗犻)
鏌ョ湅鐩熷啗瑙嗚(鐩熷啗鍗犻)
鏌ョ湅鐩熷啗瑙嗚(寰峰啗鍗犻)
```

澶钩娲嬪湴鍥惧悓鐞嗭細

```text
鏌ョ湅缇庡啗瑙嗚(缇庡啗鍗犻)
鏌ョ湅缇庡啗瑙嗚(鏃ュ啗鍗犻)
鏌ョ湅鏃ュ啗瑙嗚(鏃ュ啗鍗犻)
鏌ョ湅鏃ュ啗瑙嗚(缇庡啗鍗犻)
```

`edelweiss7`銆乣edelweiss8` 鏄崟闃佃惀鍦板浘锛屽洜姝ゅ彧鏄剧ず涓€涓樀钀ヨ瑙掓寜閽€?
鍦板浘璇︽儏鏁版嵁鎸夐渶鍔犺浇锛?
```js
loadMapData(mapId)
```

鍔犺浇鍚庝細杩涘叆 `normalizeMapData(mapData, summary)`锛屾妸鏂版棫瀛楁鏁寸悊鎴愰〉闈㈢粺涓€浣跨敤鐨勭粨鏋勩€?
## map-data.json

姣忓紶鍦板浘鐨勮缁嗗埛鏂版暟鎹兘鍦細

```text
maps/<鍦板浘鍚?/map-data.json
```

褰撳墠鏂版牸寮忎互 `views` 涓烘牳蹇冦€傚畠涓嶄粎璁板綍闃佃惀瑙嗚锛岃繕璁板綍鏁屾垜鍗犻鎯呭喌銆?
绠€鍖栫ず渚嬶細

```json
{
  "map": "edelweiss1",
  "source": "鍦板浘鏁版嵁/edelweiss1.md",
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

瀛楁鍚箟锛?
- `map`锛氬湴鍥?id锛屼竴鑸拰鏂囦欢澶瑰悕涓€鑷淬€?- `source`锛氭暟鎹潵婧愶紝甯歌鍊兼槸鍘熷 Markdown 鎴?SVG 鏂囦欢璺緞銆?- `spawn_ranges`锛氬埛鏂板尯鍩熻褰曪紝鐢ㄩ樀钀ュ垎缁勩€傚綋鍓嶉〉闈富瑕佸睍绀虹偣浣嶏紝鍖哄煙鏁版嵁淇濈暀鍦?JSON 涓€?- `views`锛氳瑙掑垎缁勩€傜涓€灞?key 鏄瑙掗樀钀ワ紝渚嬪 `Allies`銆乣Axis`銆乣USMC`銆乣IJA`銆?- `friendly_all`锛氳瑙嗚闃佃惀鍏ㄩ儴鍗犻鏃跺埛鏂扮殑杞藉叿璁炬柦銆?- `enemy_all`锛氭晫鏂瑰叏閮ㄥ崰棰嗘椂鍒锋柊鐨勮浇鍏疯鏂姐€?- `key`锛氳浇鍏锋垨璁炬柦鏂囦欢鍚嶏紝瀵瑰簲 `vehicles` 鐩綍閲岀殑 `.vehicle`銆?- `icon`锛氬浘鏍囩紪鍙凤紝瀵瑰簲 `maps_textures/<缂栧彿>.webp`銆?- `x`锛氭í鍚戝儚绱犲潗鏍囥€?- `y`锛氱旱鍚戝潗鏍囷紝缁樺埗鏃朵細鍙栧弽銆?- `layer`锛氭潵婧愬浘灞傚悕锛岀敤浜庝繚鐣欐暟鎹潵婧愪笂涓嬫枃銆?
杩欓噷鐨?`friendly_all` 鍜?`enemy_all` 鏄浉瀵逛簬鈥滆瑙掗樀钀モ€濊鐨勩€?
涓句緥锛?
```text
views.Allies.friendly_all
```

琛ㄧず鈥滅洘鍐涜瑙掍笅锛岀洘鍐涘叏閮ㄥ崰棰嗘椂鈥濈殑鍒锋柊鐐广€?
```text
views.Allies.enemy_all
```

琛ㄧず鈥滅洘鍐涜瑙掍笅锛屽痉鍐涘叏閮ㄥ崰棰嗘椂鈥濈殑鍒锋柊鐐广€?
澶钩娲嬪湴鍥惧悓鐞嗭細

```text
views.USMC.friendly_all  = 缇庡啗瑙嗚锛岀編鍐涘崰棰?views.USMC.enemy_all     = 缇庡啗瑙嗚锛屾棩鍐涘崰棰?views.IJA.friendly_all   = 鏃ュ啗瑙嗚锛屾棩鍐涘崰棰?views.IJA.enemy_all      = 鏃ュ啗瑙嗚锛岀編鍐涘崰棰?```

## 鍦板浘鍧愭爣鍜岀粯鍒?
鍦板浘鍥炬爣鍙犲姞鐢?`openProcessedMap()` 瀹屾垚銆傚畠浼氾細

1. 鎵撳紑涓€涓柊鏍囩椤点€?2. 璇诲彇瀵瑰簲闃佃惀瑙嗚鐨勫湴鍥?PNG銆?3. 鍒涘缓涓€涓拰鍘熷浘鍚屽昂瀵哥殑 Canvas銆?4. 鎶婂湴鍥惧浘鐗囩敾鍒?Canvas銆?5. 璇诲彇褰撳墠瑙嗚鍜屽崰棰嗙姸鎬佷笅鐨勭偣浣嶃€?6. 鎸?`icon` 鍔犺浇 `maps_textures/<缂栧彿>.webp`銆?7. 鎶婂浘鏍囩敾鍒?JSON 鍧愭爣瀵瑰簲鐨勪綅缃€?8. 鎶?Canvas 杞垚 PNG Blob锛屽湪鏂版爣绛鹃〉鏄剧ず銆?
鍧愭爣杞崲鍦?`mapPointToCanvas()` 涓細

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

褰撳墠鏂板湴鍥炬牸寮忕殑瑙勫垯鏄細

- 鍘熺偣鎸夊浘鐗囧乏涓婅鐞嗚В銆?- X 杞存柟鍚戞甯搞€?- JSON 涓殑 Y 杞村拰鍥剧墖缁樺埗鏂瑰悜鐩稿弽锛屾墍浠ョ粯鍒舵椂浣跨敤 `-y`銆?- 鍥炬爣浼氫互鍧愭爣鐐逛负涓績缁樺埗锛屼笉鏄互宸︿笂瑙掕创杩囧幓銆?
缁樺埗鍥炬爣鐨勬牳蹇冮€昏緫绫讳技杩欐牱锛?
```js
ctx.drawImage(icon, point.x - width / 2, point.y - height / 2, width, height);
```

杩欐剰鍛崇潃鐐逛綅鍧愭爣浠ｈ〃鍥炬爣涓績銆?
## 鍦板浘鍥剧墖閫夋嫨瑙勫垯

鍩虹鍦板浘寮圭獥鍜岄樀钀ヨ瑙掔敓鎴愬浘浣跨敤鐨勫浘鐗囬€夋嫨鐣ユ湁涓嶅悓銆?
鍩虹鍦板浘寮圭獥鐢?`overviewMapImageSources()` 鍐冲畾锛?
1. 浼樺厛灏濊瘯 `baseImage`銆?2. 鍐嶅皾璇?`map.png`銆?3. 鍐嶅皾璇曞悇闃佃惀鍥剧墖銆?
闃佃惀瑙嗚鍥剧敱 `mapImageSources(faction, mapData)` 鍐冲畾銆傚畠浼氭寜浠ヤ笅椤哄簭鏀堕泦鍊欓€夊浘鐗囷細

1. `factions[].image`
2. `map_<闃佃惀id灏忓啓>.png`
3. 甯歌闃佃惀鍛藉悕锛?   - `map_axis.png`
   - `map_allies.png`
   - `map_usmc.png`
   - `map_ija.png`
4. `map.png`

鍔犺浇鍥剧墖鏃朵娇鐢?`setMapImageWithFallback()` 鎴?`loadFirstImageElement()`銆傚墠鑰呯敤浜庨〉闈㈠唴鍥剧墖锛屽悗鑰呯敤浜?Canvas 鐢熸垚銆傚畠浠兘浼氭寜鍊欓€夊垪琛ㄩ€愪釜灏濊瘯锛岀洿鍒版壘鍒拌兘鍔犺浇鐨勫浘鐗囥€?
## 涓昏 JavaScript 鐘舵€?
鑴氭湰涓湁鍑犵粍鍏ㄥ眬鐘舵€侊紝璇讳唬鐮佹椂鍏堣璇嗗畠浠細杞绘澗寰堝銆?
```js
let vehicles = [];
let weapons = [];
let maps = [];
let currentMap = null;
const mapDataCache = new Map();
```

杩欎簺鏄富鏁版嵁銆?
```js
let activeTab = "vehicles";
let compareMode = false;
let targetMode = false;
let selectedIndices = [];
let selectedWeaponIndices = [];
```

杩欎簺鎺у埗褰撳墠鐣岄潰鍜岄€夋嫨妯″紡銆?
```js
let weaponLookup = new Map();
let mapLookup = new Map();
let sortState = { key: null, mode: null };
let weaponSortState = { key: null, mode: null };
```

杩欎簺鐢ㄤ簬鏌ユ壘鍜屾帓搴忋€?
```js
let targetVehicle = null;
let activeThreats = new Map();
let dragThreat = null;
let targetGeometry = null;
```

杩欎簺鍙湇鍔′簬绱㈡晫浼樺厛绾у脊绐椼€?
## 涓昏鍑芥暟绱㈠紩

涓嬮潰鎸夊姛鑳藉垪涓€閬嶄富瑕佸嚱鏁帮紝鏂逛究鎺ユ墜鏃跺揩閫熷畾浣嶃€?
### 閫氱敤鏄剧ず

- `escapeHtml(value)`锛氳浆涔?HTML锛岄槻姝㈡暟鎹洿鎺ユ彃鍏ユ椂鐮村潖椤甸潰缁撴瀯銆?- `safeDisplayHtml(value)`锛氬厑璁稿皯鏁扮壒娈婂睍绀猴紝鍏朵綑璧拌浆涔夈€?- `fmt(value)`锛氭牸寮忓寲鏁板瓧锛屾暣鏁颁笉鏄剧ず灏忔暟銆?- `displayValue(value)`锛氭妸绌哄€笺€佹枩鏉犵瓑鏄剧ず鎴?`-`銆?- `numericValue(value)`锛氫粠鏂囨湰涓彁鍙栨暟瀛楋紝鐢ㄤ簬鎺掑簭鍜屽姣斻€?
### 鏁版嵁鍔犺浇

- `loadData()`锛氶〉闈㈠惎鍔ㄦ椂鍔犺浇涓変釜涓?JSON銆?- `normalizeVehicle(vehicle)`锛氭妸杞藉叿涓枃瀛楁鏁寸悊鎴愬唴閮ㄥ瓧娈点€?- `loadMapData(mapId)`锛氭寜闇€璇诲彇鍦板浘璇︽儏 JSON銆?- `normalizeMapData(mapData, summary)`锛氭妸鍦板浘璇︽儏鍜屾憳瑕佸悎骞舵垚椤甸潰鍙敤缁撴瀯銆?
### 绛涢€夊拰娓叉煋

- `getFilteredList()`锛氳繃婊よ浇鍏枫€?- `getFilteredWeapons()`锛氳繃婊ゆ灙姊般€?- `getFilteredMaps()`锛氳繃婊ゅ湴鍥俱€?- `applyView()`锛氭牴鎹綋鍓嶆爣绛炬覆鏌撳搴旇〃鏍笺€?- `scheduleApplyView()`锛氱敤 `requestAnimationFrame` 鍚堝苟娓叉煋璇锋眰銆?- `renderTable(list)`锛氭覆鏌撹浇鍏疯〃銆?- `renderWeaponTable(list)`锛氭覆鏌撴灙姊拌〃銆?- `renderMapTable(list)`锛氭覆鏌撳湴鍥捐〃銆?
### 鍦板浘鎸夐挳

- `mapPerspectiveButtons(map)`锛氭牴鎹樀钀ュ拰鐘舵€佺敓鎴愯瑙掓寜閽€?- `mapPerspectiveButton(mapId, faction, state, ownerLabel)`锛氱敓鎴愬崟涓瑙掓寜閽€?- `primaryMapState(map, factionId)`锛氬崟闃佃惀鍦板浘閫夋嫨榛樿鐘舵€併€?- `enemyFactionFor(factionId, factions)`锛氭牴鎹綋鍓嶉樀钀ユ帹鏂晫鏂归樀钀ャ€?- `factionMeta(factionId)`锛氭彁渚?Axis銆丄llies銆乁SMC銆両JA 鐨勪腑鏂囨爣绛惧拰榛樿鍥剧墖銆?
### 鍦板浘寮圭獥鍜岀敓鎴愬浘

- `openMapDetail(mapId)`锛氭墦寮€鍩虹鍦板浘寮圭獥銆?- `renderMapDetail()`锛氭妸鍩虹鍦板浘鍥剧墖鏀惧叆寮圭獥銆?- `overviewMapImageSources(mapData)`锛氱敓鎴愬熀纭€鍦板浘鍊欓€夊浘鐗囧垪琛ㄣ€?- `mapImageNames(faction)`锛氱敓鎴愭煇闃佃惀瑙嗚鐨勫€欓€夊浘鐗囧悕銆?- `mapImageSources(faction, mapData)`锛氱敓鎴愭煇闃佃惀瑙嗚鐨勫€欓€夊浘鐗囪矾寰勩€?- `setMapImageWithFallback(imageElement, faction, sourceList)`锛氶〉闈㈠唴鍥剧墖鍔犺浇澶辫触鏃惰嚜鍔ㄦ崲鍊欓€夈€?- `loadFirstImageElement(srcList)`锛欳anvas 鐢熸垚鍓嶆寜鍊欓€夊垪琛ㄥ姞杞界涓€寮犲彲鐢ㄥ浘鐗囥€?- `openProcessedMap(factionId, mapData, popup, state)`锛氱敓鎴愬甫鍥炬爣鐨勫湴鍥?PNG銆?- `mapItemsForPerspective(mapData, factionId, state)`锛氫粠鏂版牸寮忎腑鍙栧嚭瀵瑰簲鐘舵€佺殑璁炬柦鐐广€?- `mapPointToCanvas(item, canvas, mapData)`锛氭妸 JSON 鍧愭爣杞崲鎴?Canvas 鍧愭爣銆?
### 璇︽儏鍜屽姣?
- `openDetail(index)`锛氭墦寮€杞藉叿璇︽儏銆?- `openWeaponDetail(index)`锛氭墦寮€鏋璇︽儏銆?- `setCompareMode(enabled)`锛氬紑鍚垨鍏抽棴瀵规瘮妯″紡銆?- `toggleRowSelection(index)`锛氶€夋嫨瀵规瘮瀵硅薄銆?- `openComparison(indexA, indexB)`锛氭墦寮€杞藉叿瀵规瘮銆?- `openWeaponComparison(indexA, indexB)`锛氭墦寮€鏋瀵规瘮銆?- `buildCompareRows(a, b, aHitsB, bHitsA)`锛氱敓鎴愯浇鍏峰姣旀寚鏍囥€?- `weaponCompareRows(a, b)`锛氱敓鎴愭灙姊板姣旀寚鏍囥€?
### 绱㈡晫浼樺厛绾?
- `openTargetOptimizer(index)`锛氭墦寮€绱㈡晫寮圭獥銆?- `getThreatFactors(vehicle)`锛氭牴鎹浇鍏锋鍣ㄥ拰绫诲瀷鐢熸垚濞佽儊绯绘暟銆?- `renderThreatButtons()`锛氭覆鏌撳▉鑳佺被鍨嬫寜閽€?- `toggleThreat(tag)`锛氭坊鍔犳垨绉婚櫎濞佽儊鐐广€?- `placeThreat(item, x, y)`锛氭斁缃▉鑳佺偣锛屽苟閬垮紑鍧﹀厠妯″瀷鍜屽叾浠栧▉鑳佺偣銆?- `threatScore(item, geometry)`锛氳绠楀▉鑳佸垎銆?- `updateThreatScores(allowReorder)`锛氬埛鏂版帓琛屻€?- `renderPriorityList(items, topTag, allowReorder)`锛氭覆鏌撳彸渚т紭鍏堢骇鍒楄〃銆?
## 浜嬩欢娴?
椤甸潰鐨勪簨浠剁粦瀹氶泦涓湪鑴氭湰鍚庡崐閮ㄥ垎銆?
甯歌浜嬩欢濡備笅锛?
- 鎼滅储妗?`input`锛氳皟鐢?`scheduleApplyView()`銆?- 鏍囩鎸夐挳 `click`锛氳皟鐢?`setActiveTab()`銆?- 琛ㄥご `click`锛氬垏鎹㈡帓搴忕姸鎬併€?- 杞藉叿琛ㄨ `click`锛氭牴鎹綋鍓嶆ā寮忔墦寮€璇︽儏銆侀€夋嫨瀵规瘮鎴栨墦寮€绱㈡晫宸ュ叿銆?- 鏋琛ㄨ `click`锛氭墦寮€鏋璇︽儏鎴栭€夋嫨瀵规瘮銆?- 鍦板浘琛屾寜閽?`click`锛氭墦寮€鍩虹鍦板浘寮圭獥鎴栫敓鎴愯瑙掑湴鍥俱€?- 寮圭獥鑳屾櫙 `click`锛氱偣鍑婚伄缃╁叧闂脊绐椼€?- `Escape`锛氬叧闂綋鍓嶅脊绐楁垨閫€鍑哄綋鍓嶆ā寮忋€?- 绱㈡晫鐐?`pointerdown / pointermove / pointerup`锛氭嫋鎷藉▉鑳佺偣骞堕噸鏂拌绠椾紭鍏堢骇銆?
鍦板浘瑙嗚鎸夐挳鐨勭偣鍑绘祦绋嬬◢寰壒娈娿€傛祻瑙堝櫒閫氬父鍙厑璁哥敤鎴风偣鍑绘椂鐩存帴鎵撳紑鏂版爣绛鹃〉锛屾墍浠ヤ唬鐮佷細鍏?`window.open()`锛屽啀寮傛璇诲彇鍦板浘 JSON銆佸姞杞藉湴鍥惧浘鐗囥€佺敓鎴?Canvas銆傝繖鏍风敓鎴愯繃绋嬫參涓€鐐逛篃涓嶄細琚祻瑙堝櫒鎷︽埅銆?
## 鏁版嵁涔嬮棿鐨勫叧绯?
鍑犵被鏁版嵁涔嬮棿鐨勫叧绯诲彲浠ヨ繖鏍风悊瑙ｏ細

```text
data/maps.json
  鍙礋璐ｅ湴鍥惧垪琛ㄥ拰瑙嗚鎽樿
  鎸囧悜 maps/<鍦板浘鍚?/map-data.json

maps/<鍦板浘鍚?/map-data.json
  淇濆瓨鏌愬紶鍦板浘鐨勫畬鏁村埛鏂扮偣
  姣忎釜鐐圭敤 key 鎸囧悜 vehicles/*.vehicle
  姣忎釜鐐圭敤 icon 鎸囧悜 maps_textures/*.webp

vehicles/*.vehicle
  淇濆瓨鍘熷杞藉叿瀹氫箟
  map_view_atlas_index 鍙互鏍稿 icon

maps_textures/*.webp
  瀹為檯鏄剧ず鍦ㄥ湴鍥句笂鐨勫皬鍥炬爣
```

鍦板浘鐢熸垚鍥炬椂锛岀湡姝ｅ弬涓庣粯鍒剁殑鏄細

```text
maps/<鍦板浘鍚?/<瑙嗚鍥剧墖>.png
maps/<鍦板浘鍚?/map-data.json
maps_textures/<icon>.webp
```

`vehicles` 鐩綍鏇村鏄敤鏉ョ悊瑙ｅ拰鏍稿锛屼笉鍙備笌椤甸潰杩愯鏃跺姞杞姐€?
## 鍛藉悕绾﹀畾

闃佃惀 id 褰撳墠浣跨敤杩欎簺鍊硷細

```text
Axis    寰峰啗
Allies  鐩熷啗
USMC    缇庡啗
IJA     鏃ュ啗
```

鍦板浘绯诲垪褰撳墠鎸?id 鍒ゆ柇锛?
```text
edelweiss*  闆粧鑺?island*     澶钩娲?```

鍦板浘鍥剧墖甯歌鍛藉悕锛?
```text
map.png
map_axis.png
map_allies.png
map_usmc.png
map_ija.png
```

鍦板浘璇︽儏鏂囦欢鍥哄畾鍙細

```text
map-data.json
```

鍥炬爣鏂囦欢鍥哄畾鐢ㄦ暟瀛楀懡鍚嶏細

```text
maps_textures/<icon>.webp
```

## 鎬ц兘澶勭悊

杩欎釜椤甸潰铏界劧鏄崟鏂囦欢锛屼絾鍋氫簡涓€浜涜交閲忓鐞嗘潵淇濊瘉浣跨敤鏃朵笉鍙戞订銆?
鏁版嵁鍔犺浇鏂归潰锛?
- 涓変釜涓?JSON 鐢?`Promise.all()` 骞惰璇锋眰銆?- 鍦板浘璇︽儏 JSON 鎸夐渶鍔犺浇锛屼笉鍦ㄥ惎鍔ㄦ椂涓€娆℃€ц瀹屻€?- 宸插姞杞借繃鐨勫湴鍥捐鎯呬細鏀惧叆 `mapDataCache`銆?
娓叉煋鏂归潰锛?
- 鎼滅储杈撳叆閫氳繃 `scheduleApplyView()` 鍚堝苟鍒颁笅涓€甯с€?- 琛ㄦ牸鍙覆鏌撳綋鍓嶆爣绛鹃〉闇€瑕佺殑鍐呭銆?- 寮圭獥鍐呭鎵撳紑鏃跺啀鐢熸垚銆?
鍦板浘鐢熸垚鏂归潰锛?
- 鍚屼竴寮犵敓鎴愬浘閲岀殑鍥炬爣浼氱敤 `iconCache` 缂撳瓨銆?- Canvas 鍙垱寤轰竴寮犲拰搴曞浘鍚屽昂瀵哥殑鐢诲竷銆?- 鐢熸垚缁撴灉鐢?Blob URL 鏀惧埌鏂版爣绛鹃〉锛屼笉鎶婂ぇ鍥剧洿鎺ュ杩涗富椤甸潰銆?
绱㈡晫宸ュ叿鏂归潰锛?
- 鎷栨嫿鏃剁敤 `transform: translate3d(...)` 绉诲姩鑺傜偣銆?- 濞佽儊鍒嗘洿鏂伴€氳繃 `requestAnimationFrame` 鑺傛祦銆?- 鎺掑悕鍙樺寲浣跨敤宸叉湁 DOM 鑺傜偣鍋氬姩鐢伙紝涓嶆槸姣忔瀹屽叏閲嶅缓銆?
## 褰撳墠椤甸潰鑳藉姏

杩欎釜椤圭洰鐜板湪鑳藉畬鎴愯繖浜涗簨鎯咃細

- 娴忚杞藉叿鍙傛暟銆?- 鎸夊叧閿瘝杩囨护杞藉叿銆?- 鎸夊叧閿瓧娈垫帓搴忚浇鍏枫€?- 鎵撳紑杞藉叿璇︽儏銆?- 瀵规瘮涓や釜杞藉叿銆?- 璁＄畻鍙嶅潶鍏嬫鍣ㄥ杞藉叿鐨勫懡涓晥鏋溿€?- 娴忚鏋鍙傛暟銆?- 鎸夊叧閿瘝杩囨护鏋銆?- 鎸夊叧閿瓧娈垫帓搴忔灙姊般€?- 鎵撳紑鏋璇︽儏銆?- 瀵规瘮涓や釜鏋銆?- 閫夋嫨鏌愪釜杞藉叿锛屾ā鎷熶笉鍚屽▉鑳佺被鍨嬬殑绱㈡晫浼樺厛绾с€?- 娴忚鍦板浘鍒楄〃銆?- 鎵撳紑鍩虹鍦板浘銆?- 鎸夐樀钀ヨ瑙掑拰鍗犻鐘舵€佺敓鎴愬甫璁炬柦鍥炬爣鐨勫湴鍥俱€?- 鍦ㄦ柊鏍囩椤垫煡鐪嬬敓鎴愬悗鐨勫湴鍥撅紝骞跺垏鎹㈤€傚簲绐楀彛/鍘熷灏哄銆?
## 闃呰浠ｇ爜鐨勯『搴?
濡傛灉鏄涓€娆＄湅杩欎釜椤圭洰锛屾瘮杈冮『鐨勯槄璇婚『搴忔槸锛?
1. 鍏堢湅 `data/maps.json`锛岀悊瑙ｅ湴鍥炬憳瑕佺幇鍦ㄤ繚鐣欏摢浜涗笢瑗裤€?2. 鍐嶇湅浠绘剰涓€涓?`maps/<鍦板浘鍚?/map-data.json`锛岀悊瑙?`views` 鐨勫眰绾с€?3. 鎵撳紑 `index.html`锛屽厛鐪?HTML 閲岀殑涓変釜琛ㄦ牸鍜屽洓涓脊绐椼€?4. 鐪?CSS 閲岀殑 `.main`銆乣.table-wrap`銆乣.modal`銆乣.map-*`銆乣.target-*`銆?5. 鐪嬭剼鏈噷鐨?`loadData()`锛岀悊瑙ｅ惎鍔ㄦ祦绋嬨€?6. 鐪?`applyView()`锛岀悊瑙ｆ爣绛鹃〉鎬庝箞鍒囨崲娓叉煋銆?7. 鐪?`renderMapTable()`銆乣openProcessedMap()` 鍜?`mapPointToCanvas()`锛岀悊瑙ｅ湴鍥惧姛鑳姐€?8. 鏈€鍚庡啀鐪嬭浇鍏峰姣斿拰绱㈡晫宸ュ叿锛屽洜涓鸿繖涓ゅ潡閫昏緫鏇寸粏銆?
杩欐牱璇讳笅鏉ワ紝涓嶅お瀹规槗琚?`index.html` 鐨勯暱搴﹀悡浣忋€傚畠铏界劧闀匡紝浣嗗ぇ閮ㄥ垎鍑芥暟閮芥槸鎸夊姛鑳介『搴忔憜鐫€鐨勶紝鐪熸璺ㄦā鍧楄€﹀悎鐨勫湴鏂瑰苟涓嶅銆?

