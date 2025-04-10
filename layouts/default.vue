<template>
  <Sidebar fixed w="72" inset-y-0 />
  <main p="l-72">
    <div p="8">
      <div class="overflow-hidden rounded-lg bg-white shadow">
        <div class="px-4 py-5 sm:p-6">
          <slot />
        </div>
        <div class="bg-gray-50 px-4 py-4 sm:px-6" v-if="slots.bottom">
          <slot name="bottom" />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
const slots = useSlots()
</script>