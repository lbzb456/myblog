# 部署说明

## 项目结构

```
vuepress-blog/
├── docs/
│   ├── .vuepress/
│   │   ├── config.mjs     # VuePress 配置
│   │   └── dist/          # 构建输出目录
│   ├── _posts/            # 博客文章目录
│   │   ├── welcome.md
│   │   ├── vue3-reactivity.md
│   │   └── python-decorators.md
│   ├── index.md           # 首页
│   ├── about.md           # 关于页面
│   └── posts.md           # 文章列表页
├── package.json
└── README.md
```

## 本地开发

```bash
cd vuepress-blog
npm install
npm run dev
```

访问 http://localhost:8080 查看网站。

## 构建生产版本

```bash
npm run build
```

构建完成后，静态文件会输出到 `docs/.vuepress/dist/` 目录。

## 部署到 GitHub Pages

### 方法一：使用 GitHub Actions

1. 在 GitHub 上创建新仓库 `username.github.io`
2. 推送代码到仓库
3. 创建 `.github/workflows/deploy.yml` 文件：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/.vuepress/dist
          publish_branch: gh-pages
```

4. 推送代码后，GitHub Actions 会自动构建并部署

### 方法二：手动部署

1. 安装 `gh-pages` 包：
```bash
npm install -D gh-pages
```

2. 更新 `package.json` 中的 deploy 脚本：
```json
{
  "scripts": {
    "deploy": "gh-pages -d docs/.vuepress/dist"
  }
}
```

3. 运行部署命令：
```bash
npm run deploy
```

## 自定义域名（可选）

1. 在 `docs/.vuepress/dist/` 目录添加 `CNAME` 文件，内容为你的域名：
```
blog.example.com
```

2. 在域名提供商处添加 DNS 记录：
   - CNAME 记录：`blog` 指向 `username.github.io`

## 访问地址

部署完成后，网站可通过以下地址访问：
- 默认域名：`https://username.github.io/`
- 自定义域名：`https://blog.example.com/`
