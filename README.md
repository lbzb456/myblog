# 行者小二的技术博客

一个使用 VuePress 构建的现代化技术博客。

**访问地址**: [https://lbzb456.github.io/myblog/](https://lbzb456.github.io/myblog/)

## 功能特性

- ✅ Markdown 支持
- ✅ 代码高亮显示
- ✅ 响应式设计
- ✅ 文章分类和标签
- ✅ 简洁美观的界面

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建生产版本
npm run build

# 部署到 GitHub Pages
npm run deploy
```

## 项目结构

- `docs/` - 文档和博客文章
- `docs/_posts/` - 博客文章（Markdown 格式）
- `docs/.vuepress/config.mjs` - VuePress 配置
- `docs/.vuepress/dist/` - 构建输出目录

## 写作指南

在 `docs/_posts/` 目录创建 Markdown 文件：

```markdown
---
title: 文章标题
date: 2026-05-06
categories:
  - 分类1
tags:
  - 标签1
---

文章内容...
```

## 部署

详细部署说明请参阅 [DEPLOY.md](DEPLOY.md)

## 技术栈

- VuePress 2.x
- Vue 3
- Vite
