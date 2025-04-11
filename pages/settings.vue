<template>
  <Vueform ref="form$" :endpoint="false" @submit="saveSettings">
    <TextElement name="HOSTNAME" label="Hostname" />
    <TextElement name="AP_TIMEOUT" label="AP Timeout" input-type="number" />

    <ButtonElement name="button" submits>Submit</ButtonElement>
  </Vueform>
</template>

<script setup lang="ts">
const { $awtrixApi } = useNuxtApp()
const form$ = useTemplateRef('form$')

const saveSettings = async (form$: object, _: object) => {
  let formData = {}

  Object.values(form$.elements$).forEach((element) => {
    // We want to only save elements from forms if they have been changed
    // (or in form builder terminology: dirty).
    if (element.isStatic || !element.dirty) { return }

    formData = { ...formData, ...element.requestData}
  })

  // No changes present, so no need to do anything
  if (Object.keys(formData).length === 0) { return }

  await $awtrixApi.post('system', formData)
}

await onMounted(async () => {
  // Fetch the current settings from the Awtrix API
  const currentSettings = await $awtrixApi.get('system')

  // Set the values from the API and reset the dirty state
  await form$.value.load(currentSettings)
  form$.value.clean()
})
</script>
