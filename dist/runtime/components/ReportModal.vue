<template>
  <dialog
    ref="dialogRef"
    class="dialog-custom"
    @click="handleBackdropClick"
  >
    <div class="modal-content">
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

// Sledujeme zmeny isOpen a otvárame/zatvárame dialog
watch(() => props.isOpen, async (newValue) => {
  await nextTick()
  if (newValue && dialogRef.value) {
    dialogRef.value.showModal()
  } else if (dialogRef.value) {
    dialogRef.value.close()
  }
}, {immediate: true})
</script>

<style scoped>
.dialog-custom {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 16px;
  max-width: none;
  max-height: none;
  width: auto;
  height: auto;
  background: transparent;
}

.dialog-custom::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  padding: 0;
  min-width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .modal-content {
    min-width: 300px;
    max-width: 95vw;
    margin: 20px;
  }

  .dialog-custom {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    transform: none;
    border-radius: 0;
  }

  .modal-content {
    border-radius: 0;
    height: 100%;
  }
}
</style>
