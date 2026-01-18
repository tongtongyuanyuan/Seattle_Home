对，我们现在就在 **Step 4（FastAPI + Google Sheets）**，而且你现在要做的就是把 **Google Sheet 认证/权限/环境变量** 配好，让后端能 **读 open_house_picks + 写 leads**。

下面我按“照着做就行”的方式，把 Step 4 拆成 **8 个小步骤**（每步都能验证对不对）。

---

# Step 4 拆解：Google Sheet 配置（现在就做）

## 0) 你先确认：你已经有这个 Sheet 了

* Google Sheet 名字：`Seattle Home Picks`
* Tab：`open_house_picks` / `leads`
* `open_house_picks` 里已经有几行测试数据

✅ 有就继续，没有就先建（你前面已经建了）

---

## 1) 打开 Google Cloud Console

进入 Google Cloud Console（浏览器）
创建一个 Project（如果已有也行）：

* Project 名：`seattle-home-picks`（随便）

---

## 2) 启用 Google Sheets API（必须）

在 Cloud Console 里：

* APIs & Services → Library
* 搜索：**Google Sheets API**
* 点 **Enable**

> ✅ 这是最常见漏掉的一步，漏了后面会 403/404。

---

## 3) 创建 Service Account（你后端的“机器人账号”）

* IAM & Admin → Service Accounts
* Create Service Account

  * Name：`sheet-writer`（随便）

创建完后，你会得到一个类似邮箱：
`sheet-writer@xxxxx.iam.gserviceaccount.com`

把这个邮箱 **复制下来**（下一步要用）

---

## 4) 给 Service Account 生成 JSON Key（credentials）

在这个 Service Account 里：

* Keys → Add Key → Create new key
* 选择 **JSON**
* 下载得到一个 `xxxx.json` 文件

⚠️ **这个文件就是钥匙**

* ❌ 不要上传 GitHub
* ❌ 不要贴到聊天里
* ✅ 只放本地 + 环境变量

---

## 5) 把你的 Google Sheet 分享给这个 Service Account（最关键）

打开你的 Google Sheet → 右上角 Share：

* Add people: 粘贴 service account 邮箱
* 权限选：**Editor**
* Send

✅ 这一步做完，你后端就能读写这个 Sheet（无需公开）

> ❌ 不要把 Sheet 设成 public。
> leads 里会有姓名电话邮箱，公开是大坑。

---

## 6) 拿到 GOOGLE_SHEET_ID（从链接里抄）

你的 Sheet URL 类似：

`https://docs.google.com/spreadsheets/d/1AbCDefGHIJKlmnOPqrSTuv.../edit#gid=0`

中间那段就是 `GOOGLE_SHEET_ID`：

✅ `1AbCDefGHIJKlmnOPqrSTuv...`

---

## 7) 配后端环境变量（本地先跑通）

在 `backend/` 目录创建 `.env`（如果你用的是其他方式也行）：

```env
GOOGLE_SHEET_ID=你的sheet_id
GOOGLE_SERVICE_ACCOUNT_JSON=一整行的json字符串
```

### 怎么把 JSON 变成“一整行字符串”？

最简单办法（Mac）：

1. 打开你下载的 `xxxx.json`
2. 全选复制内容
3. 用工具把换行去掉（或让 Claude 帮你做）

你也可以直接对 Claude 说：

> “Convert this service account JSON to a single-line string for .env.”

⚠️ 但 **不要把 JSON 发到公共地方**；如果要给我看，务必打码（特别是 `private_key`）。

### 还要做一件事：把 `.env` 加进 `.gitignore`

确认 backend 的 `.gitignore` 里包含：

```
.env
```

---

## 8) 本地跑后端 + 验证读 Sheet

在 backend 里跑：

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 验证点 1：GET /open-houses

浏览器打开：

`http://localhost:8000/open-houses`

✅ 正常应该返回 JSON 列表（就是你 sheet 的几行）

### 验证点 2：POST /leads（用 curl）

```bash
curl -X POST http://localhost:8000/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "phone":"425-000-0000",
    "message":"Test lead submission",
    "source":"home"
  }'
```
