import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  lang: 'zh-CN',
  title: '行者小二的技术博客',
  description: '行者小二的技术博客 - 分享技术与生活',
  
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
        text: '前端技术',
        children: [
          '/posts/vue3-reactivity.html',
          '/posts/javascript-async.html'
        ]
      },
      {
        text: '后端开发',
        children: [
          '/posts/python-decorators.html'
        ]
      },
      {
        text: '无人船技术',
        children: [
          '/posts/sshconnection.html',
          '/posts/ros-reading-notes.html',
          '/posts/usv-classification-rules.html',
          '/posts/ship-software-guideline.html'
        ]
      },
      {
        text: '研发实战',
        children: [
          '/posts/ai-blog-creator.html',
          '/posts/linux_disk_part.html'
        ]
      }
    ],
    contributors: false,
    // 启用搜索功能
    search: true,
    // 搜索占位符文本
    searchMaxSuggestions: 10
  }),

  head: [
    ['link', { rel: 'icon', href: 'https://vuejs.org/images/logo.png' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }]
  ]
})
