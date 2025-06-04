<template>
  <dialog
    ref="dialogRef"
    class="fixed inset-0 w-full h-full top-0 left-0 bg-transparent rounded-none transform-none [&::backdrop]:bg-black/50 [&::backdrop]:backdrop-blur-sm sm:top-1/2 sm:left-1/2 sm:w-auto sm:h-auto sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
    @click="handleBackdropClick">
    <div
      class="bg-white w-full h-full m-5 rounded-none overflow-auto sm:mx-0 sm:my-0 sm:w-auto sm:h-auto sm:min-w-[500px] sm:max-w-[90vw] sm:max-h-[90vh] sm:rounded-2xl sm:shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
    >
      <ModalContent :user="user" :capturedData="capturedData" />
    </div>
  </dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  user: {
    type: Object,
    default: null
  },
  capturedData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const dialogRef = ref(null)

const close = () => {
  emit('close')
}

const handleBackdropClick = (event) => {
  if (event.target === dialogRef.value) {
    close()
  }
}

watch(
  () => props.isOpen,
  async (newValue) => {
    await nextTick()
    if (newValue && dialogRef.value) {
      dialogRef.value.showModal()
    } else if (dialogRef.value) {
      dialogRef.value.close()
    }
  },
  { immediate: true }
)
</script>
