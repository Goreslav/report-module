<template>
  <!-- Loader -->
  <div
    v-if="isSubmitting"
    class="fixed inset-0 z-50 flex items-center justify-center bg-white/60"
  >
    <div
      class="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"
      role="status"
    >
      <span class="sr-only">Načítava sa...</span>
    </div>
  </div>

  <!-- Success Result -->
  <div v-if="isSuccessResult" class="p-6">
    <div class="flex flex-col items-center justify-center gap-4">
      <h1 class="text-xl font-bold tracking-tight">Žiadosť o pomoc</h1>
      <div
        class="flex w-full flex-col items-center justify-center gap-4 rounded-md bg-green-50 border border-green-200 py-8"
      >
        <div class="text-4xl">✅</div>
        <h2 class="max-w-[300px] text-center text-lg font-bold tracking-tight text-green-700">
          Vaša požiadavka bola odoslaná pod číslom ticketu #{{ ticketNumber }}
        </h2>
      </div>
    </div>
    <div class="mt-6 flex justify-end border-t border-gray-200 pt-4">
      <button
        class="rounded-lg bg-black px-6 py-2 font-bold text-white transition-colors duration-200 hover:bg-gray-700"
        @click="resetToForm"
      >
        Vytvoriť nový ticket
      </button>
    </div>
  </div>

  <!-- Form -->
  <div v-else class="p-6">
    <div class="flex flex-col gap-3 mb-6">
      <h1 class="text-xl font-bold tracking-tight">Žiadosť o pomoc</h1>
      <p class="text-sm leading-5 tracking-tight text-gray-600">
        Po zadaní popisu problému sa automaticky vytvorí ticket s informáciami o stránke.
      </p>
    </div>

    <div class="space-y-6">
      <!-- Text Description - POVINNÉ -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
          Popis problému *
        </label>
        <textarea
          id="description"
          v-model="formData.text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-vertical"
          placeholder="Popíšte čo sa stalo, aké kroky ste vykonali a aký je očakávaný výsledok..."
          @blur="validateDescription"
          :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': descriptionError }"
        ></textarea>
        <div v-if="descriptionError" class="text-red-500 mt-1 text-sm">
          {{ descriptionError }}
        </div>
        <div class="text-xs text-gray-500 mt-1">
          Minimálne 10 znakov ({{ formData.text.length }}/10)
        </div>
      </div>

      <!-- Auto-captured Info Preview -->
      <div class="bg-gray-50 p-4 rounded-md">
        <h3 class="text-sm font-medium text-gray-700 mb-2">Automaticky zachytené informácie:</h3>
        <div class="space-y-2 text-xs text-gray-600">
          <div><strong>URL:</strong> {{ capturedData?.url || 'Zachytáva sa...' }}</div>
          <div><strong>Screenshot:</strong> {{ capturedData?.screenshot ? '✅ Zachytený' : '⏳ Pripravuje sa...' }}</div>
          <div><strong>Console errors:</strong> {{ capturedData?.errors?.length || 0 }} nájdených</div>
          <div><strong>User agent:</strong> {{ capturedData?.userAgent?.substring(0, 50) || 'Unknown' }}...</div>
        </div>
      </div>
    </div>

    <!-- Form Buttons -->
    <div class="mt-8 flex justify-end border-t border-gray-200 pt-4 gap-3">
      <button
        class="text-sm font-medium px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
        @click="resetForm"
      >
        Zrušiť
      </button>
      <button
        class="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        :disabled="isSubmitting || !isFormValid"
        @click="handleSubmit"
      >
        {{ isSubmitting ? "Odosielam..." : "Odoslať" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRuntimeConfig } from '#app'
import { useTicketApi } from '../composables/useTicketApi'

// Props
const props = defineProps({
  user: {
    type: Object,
    default: null
  },
  capturedData: {
    type: Object,
    default: () => ({
      url: '',
      screenshot: null,
      errors: [],
      userAgent: ''
    })
  }
})

// Reactive data
const isSubmitting = ref(false)
const isSuccessResult = ref(false)
const ticketNumber = ref('')
const descriptionError = ref('')

const formData = ref({
  text: ''
})

// Get config
const config = useRuntimeConfig().public.reportModule
const { createTicket } = useTicketApi()

// Computed
const isFormValid = computed(() => {
  return formData.value.text.trim().length >= 10 && !descriptionError.value
})

// Methods
const validateDescription = () => {
  const desc = formData.value.text.trim()
  if (!desc) {
    descriptionError.value = 'Popis problému je povinný'
    return false
  }
  if (desc.length < 10) {
    descriptionError.value = 'Popis musí mať aspoň 10 znakov'
    return false
  }
  descriptionError.value = ''
  return true
}

const resetForm = () => {
  formData.value = {
    text: ''
  }
  descriptionError.value = ''
  isSuccessResult.value = false
}

const resetToForm = () => {
  resetForm()
}

const handleSubmit = async () => {
  // Validate before submit
  const isDescValid = validateDescription()

  if (!isDescValid) {
    return
  }

  isSubmitting.value = true

  try {
    // Získame user objekt z props
    const user = props.user

    if (config.debug) {
      console.log('🎫 Submitting ticket with data:', {
        user,
        text: formData.value.text,
        capturedData: props.capturedData
      })
    }

    // Vytvoríme kompletný payload BEZ timestampov
    const ticketPayload = {
      text: formData.value.text,
      url: props.capturedData.url,
      screenshot: props.capturedData.screenshot,
      errors: props.capturedData.errors,
      userAgent: props.capturedData.userAgent
    }

    // API volanie
    const result = await createTicket(ticketPayload, user)

    if (result.success) {
      ticketNumber.value = result.ticketNumber.toString()
      isSuccessResult.value = true

      if (config.debug) {
        console.log('✅ Ticket created successfully:', result)
      }
    } else {
      throw new Error(result.message || 'Nepodarilo sa vytvoriť ticket')
    }

  } catch (error) {
    console.error('❌ Error submitting ticket:', error)

    // User-friendly error message
    let errorMessage = 'Nastala chyba pri odosielaní.'
    if (error.message.includes('API key')) {
      errorMessage = 'Problém s konfiguráciou. Kontaktujte administrátora.'
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = 'Problém s pripojením. Skúste to znovu.'
    } else if (error.message) {
      errorMessage = error.message
    }

    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

// Initialize captured data preview
onMounted(() => {
  if (config.debug) {
    console.log('📋 ModalContent mounted with captured data:', props.capturedData)
  }
})
</script>
