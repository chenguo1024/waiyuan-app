# 外交学院一站式服务平台

外交学院校内综合服务移动应用，覆盖跑腿任务、二手交易、学习资源共享、拼车出行、帮帮币系统、即时聊天等校园生活全场景。

## 功能一览

| 模块 | 功能 |
|------|------|
| **跑腿任务** | 发布任务、接单、确认完成、紧急任务加价 |
| **二手交易** | 商品发布、浏览、购买、按分类筛选 |
| **学习资源** | 资料/笔记/书籍共享、按类型分类 |
| **拼车出行** | 发布拼车、查看可用座位、联系方式 |
| **帮帮币** | 充值、消费、每日签到（+1 币）、交易记录 |
| **会员体系** | 月卡/季卡/年卡、免费紧急任务额度 |
| **聊天** | 会话列表、实时消息（3 秒轮询）、从任务/商品/好友页面发起 |
| **校园墙** | 发布帖子、点赞评论、删除帖子、时间线浏览 |
| **好友系统** | 搜索用户 ID 添加好友、接受/拒绝请求、好友列表、从好友列表发起聊天 |
| **点赞&评论** | 支持任务、商品、校园墙帖子的点赞切换与评论互动 |
| **个人主页** | 头像上传、信誉分、交易记录、通知中心 |
| **个人资料** | 昵称、性别、专业、QQ、出生年月编辑 |
| **信息流首页** | 跑腿+二手混排时间线、顶部广告轮播、搜索过滤 |
| **搜索功能** | 首页搜索栏呼出搜索遮罩，关键词过滤跑腿/商品 |
| **微信收款** | 支付方式选择微信支付时展示收款码图片 |
| **启动画面** | 校徽 + 校训（站稳立场·掌握政策·熟悉业务·严守纪律）渐变消失 |
| **自动更新** | 启动检测服务端版本 → 弹窗提示 → 原生下载安装 APK |

## 技术栈

### 前端

| 技术 | 用途 |
|------|------|
| **React 19** | UI 框架 |
| **TypeScript** | 类型安全 |
| **Vite 8** | 构建工具 |
| **React Router** | 页面路由 |
| **Capacitor 6** | 原生容器（Android） |

### 后端

| 技术 | 用途 |
|------|------|
| **Node.js** | 运行时 |
| **Express** | HTTP 框架 |
| **better-sqlite3** | 数据库（同步 SQLite） |
| **uuid** | 用户/任务 ID 生成 |

### 原生（Android）

| 文件 | 用途 |
|------|------|
| `ApkUpdaterPlugin.java` | 原生 APK 下载 + 安装（DownloadManager + FileProvider） |
| `AndroidManifest.xml` | 权限声明、Activity 配置 |

### 部署

| 平台 | 组件 |
|------|------|
| **Railway** | 后端 Express 服务（自动部署） |
| **GitHub Releases** | APK 分发（自动更新下载源） |

## 项目结构

```
D:\waiyuan-app\
├── src\                          # 前端源码
│   ├── api\                      # API 客户端
│   │   ├── client.ts             #   请求封装（fetch + token + 错误处理）
│   │   ├── auth.ts               #   注册、登录、验证码
│   │   ├── client.ts             #   请求封装（fetch + token + 错误处理 + delete 方法）
│   │   ├── auth.ts               #   注册、登录、验证码
│   │   ├── tasks.ts              #   跑腿任务 CRUD + 编辑/删除
│   │   ├── products.ts           #   二手商品 CRUD + 编辑/删除
│   │   ├── study.ts              #   学习资源 CRUD
│   │   ├── carpool.ts            #   拼车 CRUD
│   │   ├── user.ts               #   用户信息、签到、充值、会员、订单、通知
│   │   ├── chat.ts               #   会话、消息（含 getOrCreateConversation）
│   │   ├── orders.ts             #   订单
│   │   ├── likes.ts              #   点赞 toggle / 状态查询
│   │   ├── comments.ts           #   评论 CRUD
│   │   ├── wall.ts               #   校园墙帖子 CRUD
│   │   └── friends.ts            #   好友列表、请求、添加、接受、拒绝
│   ├── components\               # 通用组件
│   │   ├── Layout.tsx            #   全局布局（顶栏 + 广告 + 底部导航 + 更新提示）
│   │   ├── BottomNav.tsx         #   底部导航栏（发布按钮居中悬浮，含校园墙/好友入口）
│   │   ├── TaskCard.tsx          #   跑腿任务卡片（含编辑/删除按钮 + 点赞）
│   │   ├── ProductCard.tsx       #   二手商品卡片（含编辑/删除按钮 + 点赞）
│   │   ├── SplashScreen.tsx      #   启动画面组件
│   │   ├── UpdateChecker.tsx     #   版本检测 + 更新弹窗
│   │   ├── LikeButton.tsx        #   点赞按钮（❤️ 数与状态切换）
│   │   ├── CommentSection.tsx    #   评论列表 + 发表评论
│   │   └── PaymentModal.tsx      #   支付弹窗（微信/支付宝，微信展示收款码）
│   ├── pages\                    # 页面
│   │   ├── Home.tsx              #   首页（信息流 + 签到按钮）
│   │   ├── Login.tsx             #   手机号 + 密码登录
│   │   ├── Register.tsx          #   手机号 + 密码注册（姓名、学号、身份证）
│   │   ├── Errands.tsx           #   跑腿任务列表
│   │   ├── Market.tsx            #   二手集市
│   │   ├── Study.tsx             #   学习资源
│   │   ├── Carpool.tsx           #   拼车列表
│   │   ├── Publish.tsx           #   发布页面（任务/商品/学习/拼车）
│   │   ├── Profile.tsx           #   个人主页 + 资料编辑 + 设置入口
│   │   ├── Coins.tsx             #   帮帮币充值 + 会员购买
│   │   ├── Notifications.tsx     #   通知列表
│   │   ├── ChatList.tsx          #   会话列表
│   │   ├── ChatRoom.tsx          #   聊天室
│   │   ├── About.tsx             #   关于我们
│   │   ├── Orders.tsx            #   我的订单
│   │   ├── Wall.tsx              #   校园墙（发帖、删除、点赞评论）
│   │   └── Friends.tsx           #   好友（搜索添加、接受拒绝、发消息）
│   ├── plugins\                  # Capacitor 原生插件接口
│   │   └── apk-updater.ts        #   APK 更新 TypeScript 接口
│   ├── store.tsx                 # 全局状态（Context + Reducer）
│   ├── App.tsx                   # 根组件（路由）
│   └── main.tsx                  # 入口
├── server\                       # 后端源码
│   ├── routes\                   # 路由模块
│   │   ├── auth.js               #   注册、登录、验证码、绑卡
│   │   ├── tasks.js              #   跑腿任务 CRUD + 接单 + 编辑/删除
│   │   ├── products.js           #   二手商品 CRUD + 编辑/删除
│   │   ├── study.js              #   学习资源 CRUD
│   │   ├── carpool.js            #   拼车 CRUD
│   │   ├── user.js               #   用户信息、签到、充值、会员、订单、通知
│   │   ├── chat.js               #   会话列表、消息发送/拉取
│   │   ├── orders.js             #   订单创建/查询
│   │   ├── likes.js              #   点赞 toggle / 状态查询
│   │   ├── comments.js           #   评论 CRUD
│   │   ├── wall.js               #   校园墙帖子 CRUD
│   │   └── friends.js            #   好友列表、请求、添加、接受、拒绝
│   ├── db.js                     # SQLite 数据库初始化（所有表 DDL）
│   ├── index.js                  # Express 入口（CORS、路由挂载、version API）
│   ├── sms.js                    # 短信发送（阿里云 SMS SDK）
│   └── email.js                  # 邮件发送（预留，当前 DEBUG 模式）
├── android\                      # Capacitor Android 原生工程
│   ├── app\src\main\java\com\waiyuan\app\
│   │   ├── MainActivity.java     #   Android 入口 Activity
│   │   ├── ApkUpdaterPlugin.java #   APK 下载 + 安装插件
│   │   └── res\xml\file_paths.xml#   FileProvider 路径配置
│   ├── app\build.gradle          #   AGP 9.0.0 / versionName 2.4.0
│   ├── build.gradle              #   顶层（AGP + Google Services）
│   └── gradle\wrapper\           #   Gradle 9.6.1 wrapper
├── package.json                  # v2.4.0
└── vite.config.ts                # Vite 配置（SPA fallback）
```

## 本地开发

### 前置要求

- Node.js >= 18
- JDK 17+（Android 构建）
- Android SDK（构建 APK）

### 启动后端

```bash
cd server
npm install
node index.js
```

后端启动在 `http://localhost:3001`，API 基础路径 `/api`。

### 启动前端

```bash
npm install
npm run dev
```

前端开发服务器在 `http://localhost:5173`，通过 `VITE_API_URL` 环境变量指定后端地址（默认 `http://localhost:3001/api`）。

## 构建 APK

```bash
# 1. 构建前端产物
npm run build

# 2. 同步到 Android 工程
npx cap sync android

# 3. 编译 APK
cd android
./gradlew assembleDebug
```

APK 位于 `android/app/build/outputs/apk/debug/app-debug.apk`。

## 部署

### 后端（Railway）

1. 推送代码到 GitHub main 分支
2. Railway 自动检测 `server/package.json` 并部署
3. 数据库持久化（避免部署后数据丢失）：
   - 在 Railway 项目下创建 **Volume**，挂载路径 `/data`
   - 在服务 **Variables** 中添加：`DATA_DIR=/data`
4. 可选环境变量：
   - `PORT`：服务端口（默认 3001）
   - `ALIBABA_ACCESS_KEY_ID`：阿里云 SMS AccessKey
   - `ALIBABA_ACCESS_KEY_SECRET`：阿里云 SMS AccessSecret
   - `ALIBABA_SMS_SIGN_NAME`：短信签名

### Android 自动更新流程

1. 构建新版本 APK
2. 在 GitHub Releases 创建对应 tag（如 `v2.4.0`）并上传 APK
3. 更新 `server/index.js` 中 `/api/version` 返回的版本号和 APK 下载链接
4. 推送代码 → Railway 自动部署
5. 用户打开 App → UpdateChecker 检测到版本差异 → 弹出更新提示 → 点击更新 → 原生下载安装

### 版本号管理

需要同步更新的地方：

| 文件 | 字段 |
|------|------|
| `package.json` | `version` |
| `src/components/UpdateChecker.tsx` | `CURRENT_VERSION` |
| `server/index.js` | `/api/version` 返回的 `version` |
| `android/app/build.gradle` | `versionName` |

## API 参考

### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册（phone + password + name + studentId） |
| POST | `/api/auth/login` | 登录（phone + password） |
| GET | `/api/auth/user/:id` | 获取用户信息 |

### 任务

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/tasks` | 任务列表 |
| POST | `/api/tasks` | 发布任务 |
| PUT | `/api/tasks/:id` | 更新任务状态（接单、完成） |
| PUT | `/api/tasks/:id/edit` | 编辑任务（仅发布者） |
| DELETE | `/api/tasks/:id` | 删除任务（仅发布者） |

### 商品

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/products` | 商品列表 |
| POST | `/api/products` | 发布商品 |
| PUT | `/api/products/:id/edit` | 编辑商品（仅发布者） |
| DELETE | `/api/products/:id` | 删除商品（仅发布者） |

### 聊天

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/chat/conversations/:userId` | 会话列表 |
| POST | `/api/chat/conversations` | 创建/获取会话 |
| GET | `/api/chat/messages/:conversationId` | 消息列表 |
| POST | `/api/chat/messages` | 发送消息 |

### 校园墙

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/wall` | 帖子列表（按时间倒序） |
| POST | `/api/wall` | 发布帖子 |
| DELETE | `/api/wall/:id` | 删除帖子（仅发布者） |

### 好友

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/friends/list/:userId` | 好友列表 |
| GET | `/api/friends/requests/:userId` | 好友请求列表 |
| POST | `/api/friends/request` | 发送好友请求 |
| POST | `/api/friends/accept` | 接受好友请求 |
| POST | `/api/friends/reject` | 拒绝好友请求 |

### 点赞

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/likes/toggle` | 切换点赞状态 |
| GET | `/api/likes/status` | 查询点赞状态 |

### 评论

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/comments/:itemType/:itemId` | 获取评论列表 |
| POST | `/api/comments` | 发表评论 |
| DELETE | `/api/comments/:id` | 删除评论（仅作者） |

### 签到

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/user/checkin` | 每日签到 |
| GET | `/api/checkin/status/:userId` | 查询今日是否已签到 |

### 系统

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/version` | 版本信息（version + apkUrl + updateUrl） |
| GET | `/api/health` | 健康检查 |

## 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| **v2.4.0** | 2026-07-16 | 校园墙、好友系统、点赞评论、编辑/删除帖子、搜索功能、微信收款码、自适应屏幕、时间显示修复 |
| **v2.3.0** | 2026-07-16 | 每日签到、帮帮币充值、会员体系、拼车出行、学习资源共享、即时聊天 |
| **v2.2.0** | - | 跑腿任务、二手交易、信息流首页、自动更新 |

## 常见问题

**Q: 注册后登录显示"账号或密码错误"？**
A: Railway 部署会重置 SQLite 文件，需设置 Volume 持久化（参见部署章节）。

**Q: 自动更新不弹出？**
A: 检查 App 内版本号是否低于服务端 `/api/version` 返回的版本号。版本相同不会弹出。

**Q: APK 下载失败？**
A: GitHub Releases CDN 在国内可能不稳定，可尝试切换网络或使用代理。

## 关于

- 开发者：陈果（中国科学技术大学）
- 技术咨询：欢迎在 GitHub Issues 提问
