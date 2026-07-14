# 外交学院一站式服务平台

外交学院校内综合服务移动应用，提供跑腿任务、二手交易、学习资源共享、拼车出行等功能。

## 技术栈

- **前端**: React 19 + TypeScript + Vite 8
- **后端**: Node.js + Express + SQLite
- **原生打包**: Capacitor (Android)
- **部署**: Railway (后端)

## 功能

- 手机号 + 短信验证码注册/登录
- 跑腿任务发布、接单、确认完成
- 二手商品发布、购买
- 学习资源共享
- 拼车出行
- 帮帮币充值、会员购买
- 每日签到
- 个人主页（头像上传、信誉分、交易记录）

## 构建 APK

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

APK 位于 `android/app/build/outputs/apk/debug/app-debug.apk`。
