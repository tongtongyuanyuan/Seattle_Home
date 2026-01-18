<img
  src="https://maps.googleapis.com/maps/api/streetview
    ?size=600x300
    &location=721+S+20th+St+Renton+WA
    &key=YOUR_API_KEY"
  alt="Street View"
/>
懂你要的效果了：**卡片一出来就直接显示街景缩略图**（不用点 “View on Google Maps” 才看到）。这个就用你现在的 **Street View Static API + API key** 就能实现 ✅

下面给你一套“最省事、最像你截图那样”的做法（前端直接渲染图；可选加一个 metadata 检测，避免灰图）。

---

## 1) 直接用 Street View Static API 生成图片 URL（最简单）

Street View Static API 的图片 URL 长这样：

```txt
https://maps.googleapis.com/maps/api/streetview
  ?size=640x360
  &location=ADDRESS_OR_LATLNG
  &fov=90
  &pitch=0
  &key=YOUR_API_KEY
```

✅ 关键点：

* `location=` 可以直接放 **address**（比如 `"12637 SE 161st St, Renton, WA 98058"`）
* 或放 `lat,lng`（更稳）

---

## 2) 你的页面里“每个卡片”直接放一张 `<img>`（React 示例）

```jsx
const streetViewUrl = (address) => {
  const encoded = encodeURIComponent(address);
  return `https://maps.googleapis.com/maps/api/streetview?size=800x450&location=${encoded}&fov=90&pitch=0&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`;
};

function HouseCard({ house }) {
  return (
    <div className="card">
      <img
        src={streetViewUrl(house.address)}
        alt="Street View"
        style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 12 }}
        loading="lazy"
      />
      {/* 下面继续你的地址/价格/按钮 */}
    </div>
  );
}
```

这样你就能得到你截图那种：**卡片顶部直接一张街景图**。

---

## 3) 为啥你有的会出现 “Sorry, we have no imagery here.”（灰图）

原因通常是：

* 那个点确实没有街景覆盖
* 或 address 解析到的位置不准（比如解析到小区入口/邮编中心）
* 或者 `size` 太大、key 限制/权限不对（但你现在大概率是覆盖问题）

### ✅ 最稳的处理：先用 “Street View Metadata” 检查有没有图（可选但推荐）

先请求：

```txt
https://maps.googleapis.com/maps/api/streetview/metadata?location=ADDRESS&key=KEY
```

返回里有 `status`：

* `OK` → 再显示图片
* `ZERO_RESULTS` → 用 fallback（比如 Google map embed 或 placeholder）

前端写法（简版）：

```js
async function hasStreetView(address) {
  const url = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.status === "OK";
}
```

---

## 4) 你需要 enable 哪些 API（为了“只要街景图”最精简）

只做“街景图片”你只需要：

✅ **Street View Static API**
（可选但推荐）
✅ **Street View Static API – metadata 也是同一个 API（通常不需要额外 enable）**

**不需要** Maps JavaScript API（除非你要嵌入交互地图）
**不需要** Places API（除非你要拉 review）

---

## 5) “极简 review（1–2 行）”怎么加（你说也行）

最简单的“极简 review”其实不是真正逐条 review，而是显示：

* ⭐ rating
* （1234 reviews）

这个要用 **Places API**，流程会复杂一点（Find Place → Place Details）。
如果你只想“看起来像 review”，我建议先用这个最省事版本：

✅ 在你的 Google Sheet 里加两列（人工/半自动都行）：

* `rating`（比如 4.6）
* `reviews_count`（比如 328）
* 或直接一列 `review_summary`（比如 “4.6⭐ (328 reviews)”）

然后页面直接展示即可，0 API 成本。

---

## 6) 你现在这套 key / 限制方式对不对？

你截图那个设置（HTTP referrers + localhost:3000/*）是对的 ✅
上线后记得再加：

* `https://yourdomain.com/*`
* `https://www.yourdomain.com/*`

---


