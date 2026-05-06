---
name: "vuepress-blog-creator"
description: "Creates a modern personal blog using VuePress with responsive design, code highlighting, and GitHub Pages deployment. Invoke when user wants to build a personal blog website."
---

# VuePress Blog Creator

This skill helps you create a modern personal blog website using VuePress framework.

## Features

- ✅ Responsive design (mobile-friendly)
- ✅ Code syntax highlighting
- ✅ Markdown support
- ✅ Article categories and tags
- ✅ Clean and beautiful theme
- ✅ Deployment to GitHub Pages

## Usage

### Step 1: Initialize Project

```bash
npm create vuepress@6.5.0 . -- --template vue
```

### Step 2: Configure Theme

Update `docs/.vuepress/config.mjs`:

```javascript
import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  lang: 'zh-CN',
  title: 'My Tech Blog',
  description: 'A modern blog built with VuePress',
  
  base: '/',
  
  bundler: viteBundler(),
  
  theme: defaultTheme({
    logo: 'https://vuejs.org/images/logo.png',
    navbar: [
      { text: 'Home', link: '/' },
      { text: 'Posts', link: '/posts.html' },
      { text: 'About', link: '/about.html' }
    ],
    sidebar: [
      {
        text: 'Welcome',
        link: '/posts/welcome.html'
      },
      {
        text: 'Articles',
        children: [
          '/posts/article1.html',
          '/posts/article2.html'
        ]
      }
    ]
  })
})
```

### Step 3: Create Articles

Create markdown files in `docs/_posts/`:

```markdown
# Article Title

Content goes here...

```javascript
// Code example
const hello = 'World';
```
```

### Step 4: Build and Deploy

```bash
# Build
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Project Structure

```
vuepress-blog/
├── docs/
│   ├── .vuepress/
│   │   ├── config.mjs     # Configuration
│   │   └── dist/          # Build output
│   ├── _posts/            # Articles
│   │   └── article.md
│   ├── index.md           # Homepage
│   ├── about.md           # About page
│   └── posts.md           # Posts list
├── package.json
└── README.md
```

## Deployment

### GitHub Pages Setup

1. Create GitHub repo: `username.github.io`
2. Run: `npm run deploy`
3. Configure GitHub Pages to use `gh-pages` branch
4. Access: `https://username.github.io/`

## Tips

- Use relative links in markdown files: `./_posts/article.md`
- Add `cleanUrls: true` for clean URLs without `.html` suffix
- For custom domain, add CNAME file to `docs/.vuepress/public/`
