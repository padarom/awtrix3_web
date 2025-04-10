<template>
  <div>
    <i v-for="pixel in pixels" :key="pixel">{{ pixel }}</i>
  </div>
</template>

<script setup lang="ts">
import type { Reactive } from 'vue'

const REFRESH_RATE = 5

let pollingInterval: number
let pixels: Reactive<number[]> = reactive([] as number[])

const fetchScreenPixels = async () => {
  pixels.push(1)
}

onMounted(() => {
  // TODO: In case the API takes too long to respond we need to skip some requests?
  pollingInterval = window.setInterval(() => fetchScreenPixels(), 1000 / REFRESH_RATE)
})

onUnmounted(() => {
  console.log('unmounted')
  window.clearInterval(pollingInterval)
})
</script>