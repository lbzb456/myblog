import { defineClientConfig } from '@vuepress/client'
import GiscusComment from './components/GiscusComment.vue'

export default defineClientConfig({
  enhance({ app, router, siteData }) {
    app.component('GiscusComment', GiscusComment)
  },
})
