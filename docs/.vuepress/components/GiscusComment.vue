<template>
  <div v-if="isProd" class="giscus-container">
    <Giscus
      repo="lbzb456/myblog"
      repo-id="R_kgDOJfQ66A"
      category="Comments"
      category-id="DIC_kwDOJfQ66M4Cei8f"
      mapping="pathname"
      reactions-enabled="1"
      emit-metadata="0"
      input-position="top"
      theme="preferred_color_scheme"
      lang="zh-CN"
    />
  </div>
  <div v-else class="giscus-placeholder">
    <p>💡 评论功能需要在 GitHub 配置 Giscus 后才能使用</p>
    <p>本地开发环境暂不显示评论</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Giscus from '@giscus/vue'

const isProd = computed(() => {
  return typeof window !== 'undefined' && window.location.hostname !== 'localhost'
})
</script>

<style scoped>
.giscus-container {
  margin-top: 2rem;
}
.giscus-placeholder {
  margin-top: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  text-align: center;
  color: #666;
}
</style>
