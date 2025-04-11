<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// Load the awtrix API at this point (even though it is unused) as that would
// cause an error to be thrown in case no communication is possible. We want to
// catch that error as soon as possible.
const { $awtrixApi: _awtrixApi } = useNuxtApp()
</script>
