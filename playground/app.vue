<template>
  <div class="container">
    <div class="content">
      <h1 class="title">Modal Test</h1>
      <button
        class="open-button"
        @click="openModal"
      >
        Otvoriť Modal
      </button>

      <!-- Debug info -->
      <div class="debug-info">
        <p>Klikni na tlačidlo pre otvorenie modalu</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Explicitný import ak je potrebný
import { useReportModal } from '#imports'

const { showModal } = useReportModal()

const openModal = () => {
  console.log('Otváram modal...') // Debug
  showModal()
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.content {
  text-align: center;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 32px;
  color: #1f2937;
}

.open-button {
  background-color: #059669;
  color: white;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.open-button:hover {
  background-color: #047857;
}

.debug-info {
  margin-top: 16px;
  font-size: 0.875rem;
  color: #6b7280;
}
</style>
