# 外交学院一站式服务平台

外交学院校内综合服务移动应用，提供跑腿任务、二手交易、学习资源共享、拼车出行、帮帮币、聊天等功能。

## 技术栈

- **前端**: React 19 + TypeScript + Vite 8
- **后端**: Node.js + Express + SQLite (better-sqlite3)
- **原生打包**: Capacitor 6 (Android)
- **部署**: Railway (后端自动部署)

## 功能

- 手机号 + 密码注册/登录（无验证码）
- 信息流首页（跑腿 + 二手混排）
- 跑腿任务发布、接单、确认
- 二手商品发布、购买
- 学习资源共享
- 拼车出行
- 帮帮币充值、会员购买
- 每日签到（+1 帮帮币）
- 聊天（会话列表 + 实时消息，3秒轮询）
- 个人主页（头像上传、性别、专业、QQ、生日编辑）
- 顶部广告轮播
- 启动画面（校徽 + 校训）
- 原生 APK 自动更新（检测版本 → 下载 → 安装）

## 本地开发

```bash
# 安装依赖
npm install
cd server && npm install

# 启动后端（端口 3001）
cd server && node index.js

# 启动前端（端口 5173）
npm run dev
```

## 构建 APK

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

APK 位于 `android/app/build/outputs/apk/debug/app-debug.apk`。

## 部署

### 后端（Railway）

1. 推送代码到 GitHub main 分支，Railway 自动部署
2. 数据库使用 SQLite，需设置 Railway Volume 持久化：
   - 创建 Volume，挂载路径 `/data`
   - 添加环境变量 `DATA_DIR=/data`
3. 前端 API 地址通过 `VITE_API_URL` 环境变量配置

### Android 更新

- 服务端 `/api/version` 返回最新版本号和 APK 下载链接
- App 启动时自动检测版本差异，弹出更新提示
- 支持原生 DownloadManager 下载 + FileProvider 安装

## 项目结构

```
waiyuan-app/
├── src/              # 前端 React 源码
│   ├── pages/        # 页面组件
│   ├── components/   # 通用组件
│   ├── api/          # API 客户端
│   ├── plugins/      # Capacitor 插件接口
│   └── store.tsx     # 全局状态
├── server/           # 后端 Express 服务
│   ├── routes/       # 路由
│   ├── db.js         # SQLite 数据库
│   └── index.js      # 入口
├── android/          # Capacitor Android 工程
│   └── app/src/main/java/com/waiyuan/app/
│       └── ApkUpdaterPlugin.java  # 原生 APK 更新插件
└── package.json      # v2.3.0
```
