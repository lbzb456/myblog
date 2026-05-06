import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  lang: 'zh-CN',
  title: '我的技术博客',
  description: '一个使用 VuePress 构建的现代化技术博客',
  
  base: '/myblog/',

  bundler: viteBundler(),
  
  cleanUrls: true,

  theme: defaultTheme({
    logo: 'https://vuejs.org/images/logo.png',
    navbar: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts.html' },
      { text: '关于', link: '/about.html' }
    ],
    sidebar: [
      {
        text: '欢迎',
        link: '/posts/welcome.html'
      },
      {
        text: '技术文章',
        children: [
          '/posts/vue3-reactivity.html',
          '/posts/python-decorators.html',
          '/posts/javascript-async.html'
        ]
      }
    ]
  }),

  head: [
    ['link', { rel: 'icon', href: 'https://vuejs.org/images/logo.png' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }]
  ]
})
