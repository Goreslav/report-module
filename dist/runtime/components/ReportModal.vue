<template>
  <dialog
    ref="dialogRef"
    class="dialog-custom"
    @click="handleBackdropClick"
  >
    <div class="modal-content">
      <ModalContent />
      <!-- Tlačidlá -->
      <div class="button-container">
        <button
          @click="handleClick"
          class="btn btn-primary"
          type="button"
        >
          Klikni na mňa
        </button>

        <button
          @click="close"
          class="btn btn-secondary"
          type="button"
        >
          Zavrieť
        </button>
      </div>
    </div>
  </dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  apiUrl: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const dialogRef = ref(null)

const handleClick = () => {
  console.log('brm')
  console.log('API URL:', props.apiUrl)
}

const close = () => {
  emit('close')
}

// Zatvoríme modal ak klikneme na backdrop
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
}, { immediate: true })
</script>

<style scoped>
.dialog-custom {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  padding: 10px;
  border: none;
  border-radius: 25px;
  max-width: none;
  max-height: none;
  width: auto;
  height: auto;
}

.dialog-custom::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 24px;
  min-width: 400px;
}

.button-container {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.btn {
  flex: 1;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background-color: #4b5563;
}
</style>
