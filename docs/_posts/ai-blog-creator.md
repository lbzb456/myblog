# 使用 AI Agent 创建个人博客：完整指南

## 引言

在数字化时代，拥有一个个人博客是展示自己技术能力和分享经验的绝佳方式。本文将详细介绍如何利用 AI Agent 快速创建一个现代化的个人博客网站。

## 技术栈选择

我选择使用 **VuePress** 作为博客框架，原因如下：

| 框架     | 优点                                   | 缺点           |
| -------- | -------------------------------------- | -------------- |
| VuePress | Vue3 驱动，响应式设计，Markdown 支持好 | 需要一定的配置 |
| Hexo     | 轻量快速，主题丰富                     | 配置较复杂     |
| Hugo     | 极快的构建速度                         | 学习曲线较陡   |

## 创建过程

### 第一步：初始化项目

首先，我向 AI Agent 提出了创建博客的需求：

![向 AI Agent 提出创建博客需求](/images/ai-blog-creator/1778058672524.png)

![AI Agent 开始执行任务](/images/ai-blog-creator/1778058706159.png)

```
请帮我创建一个现代化的个人博客网站，具体需求如下：
- 使用 Hexo/Hugo/VuePress 框架
- 配置简洁美观的主题
- 支持响应式设计，适配移动端
- 首页展示博客文章列表
- 支持文章分类和标签
- 文章详情页展示
-- 代码高亮显示
- 支持 Markdown 格式
```

### 第二步：配置主题和插件

AI Agent 帮助我配置了 VuePress 的默认主题，并添加了必要的插件：

```javascript
import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'

export default defineUserConfig({
  lang: 'zh-CN',
  title: '行者小二的技术博客',
  description: '行者小二的技术博客 - 分享技术与生活',
  
  theme: defaultTheme({
    logo: 'https://vuejs.org/images/logo.png',
    navbar: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts.html' },
      { text: '关于', link: '/about.html' }
    ]
  })
})
```

### 第三步：创建示例文章

AI Agent 帮助我创建了多篇高质量的技术文章：

1. **Vue3 响应式原理深度解析** - 深入讲解 Vue3 的响应式系统
2. **Python 装饰器完全指南** - 详细介绍 Python 装饰器的使用
3. **JavaScript 异步编程详解** - 系统讲解异步编程的多种方式

### 第四步：代码高亮配置

VuePress 内置了代码高亮功能，支持多种编程语言：

```javascript
// JavaScript 代码示例
async function fetchData() {
  const response = await fetch('/api/data');
  return response.json();
}
```

```python
# Python 代码示例
def decorator(func):
    def wrapper(*args, **kwargs):
        print("Before")
        result = func(*args, **kwargs)
        print("After")
        return result
    return wrapper
```

### 第五步：构建和部署

AI Agent 帮助我配置了部署脚本：

```json
{
  "scripts": {
    "dev": "vuepress dev docs",
    "build": "vuepress build docs",
    "deploy": "gh-pages -d docs/.vuepress/dist"
  }
}
```

## 部署到 GitHub Pages

### 配置步骤

1. **创建 GitHub 仓库**：创建名为 `username.github.io` 的仓库
2. **配置远程仓库**：

```bash
git remote add origin https://github.com/username/username.github.io.git
```

3. **运行部署命令**：

```bash
npm run build
npm run deploy
```

4. **配置 GitHub Pages**：在仓库设置中选择 `gh-pages` 分支

## 遇到的问题及解决方案

### 问题 1：404 错误

**现象**：点击导航链接出现 404 错误

![404 错误页面](/images/ai-blog-creator/1778058787757.png)

![导航链接配置](/images/ai-blog-creator/1778058819760.png)

**原因**：VuePress 默认生成 `.html` 后缀的页面，但导航链接使用了不带后缀的路径

**解决方案**：确保导航链接与生成的页面路径一致

### 问题 2：GitHub Pages 显示 README

**现象**：访问网站时显示仓库的 README 文件

**原因**：GitHub Pages 配置指向了 `main` 分支而不是 `gh-pages` 分支

**解决方案**：在 GitHub 设置中选择 `gh-pages` 分支

![GitHub Pages 设置 - 选择 gh-pages 分支](/images/ai-blog-creator/1778058868389.png)

![GitHub Pages 配置成功](/images/ai-blog-creator/1778058896398.png)

### 问题 3：部署失败

**现象**：`npm run deploy` 提示认证失败

**原因**：需要使用 GitHub Personal Access Token 进行认证

**解决方案**：创建 Personal Access Token 并使用它进行认证

## 总结

通过 AI Agent 的帮助，我成功创建了一个现代化的个人博客网站。整个过程非常顺畅，AI Agent 帮助我：

1. ✅ 初始化项目并配置框架
2. ✅ 创建高质量的技术文章
3. ✅ 配置响应式主题
4. ✅ 实现代码高亮功能
5. ✅ 部署到 GitHub Pages

## 访问地址

您可以通过以下地址访问我的博客：

- **GitHub Pages**: https://lbzb456.github.io/myblog/

## 未来计划

- [ ] 添加评论功能
- [ ] 实现文章搜索功能
- [ ] 添加更多文章分类
- [ ] 自定义主题样式

---

*本文由 AI Agent 辅助创作*
