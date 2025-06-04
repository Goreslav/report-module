<template>
  <dialog
    ref="dialogRef"
    class="
      fixed inset-0
      flex items-center justify-center
      p-0 m-0 border-none rounded-none
      [&::backdrop]:bg-black/50
    "
    @click="handleBackdropClick"
  >
    <div
      class="
        bg-white
        w-full max-w-[500px] max-h-[500px]
        rounded-2xl
        overflow-auto
        m-4 sm:m-0
      "
    >
      <ModalContent @close="close" />
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
