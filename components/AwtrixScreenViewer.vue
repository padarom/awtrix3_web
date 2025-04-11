<template>
  <div>
    <canvas
        ref="canvas"
        :width="PADDING * 2 + (BLOCK_SIZE + GAP) * 32"
        :height="PADDING * 2 + (BLOCK_SIZE + GAP) * 8"
        style="image-rendering: pixelated;"
    />
  </div>
</template>

<script setup lang="ts">
const PADDING = 32 // the padding around the display. Same in all directions
const BLOCK_SIZE = 29 // the size of each individual block
const GAP = 2 // pixels in between each block
const REFRESH_RATE = 20 // refreshes per second

const canvas = useTemplateRef('canvas')
const { $awtrixApi } = useNuxtApp()

let pollingInterval: number
let ctx: CanvasRenderingContext2D | null = null

type RGB = [number, number, number]

const fetchScreenPixels = async () => {
  const response = await $awtrixApi.get('screen')

  // Converts integer colors for each pixel into an array of three individual
  // colors R, G & B. These can then be drawn in a separate step
  const pixels: RGB[] = (response as number[]).map((color) => {
    const r = (color & 0xff0000) >> 16
    const g = (color & 0x00ff00) >> 8
    const b = (color & 0x0000ff)

    return [r, g, b]
  })

  drawScreen(pixels)
}

const drawScreen = (pixels: RGB[]) => {
  ctx!.fillStyle = 'black'
  ctx!.fillRect(0, 0, canvas.value!.width, canvas.value!.height)

  pixels.forEach((pixel, index) => {
    const x = index % 32
    const y = Math.floor(index / 32)

    ctx!.fillStyle = `rgb(${pixel.join(',')})`
    ctx!.fillRect(
      x * (BLOCK_SIZE + GAP) + PADDING,
      y * (BLOCK_SIZE + GAP) + PADDING,
      BLOCK_SIZE,
      BLOCK_SIZE
    )
  })
}

onMounted(() => {
  ctx = canvas.value!.getContext('2d')
  ctx!.imageSmoothingEnabled = true

  // TODO: In case the API takes too long to respond we need to skip some requests?
  pollingInterval = window.setInterval(() => fetchScreenPixels(), 1000 / REFRESH_RATE)
})

onUnmounted(() => {
  window.clearInterval(pollingInterval)
})
</script>