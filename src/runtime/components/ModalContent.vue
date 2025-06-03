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
  <div v-if="isSuccessResult">
    <div class="flex flex-col items-center justify-center gap-2.5">
      <h1 class="text-xl font-bold tracking-tight">Žiadosť o pomoc</h1>
      <div
        class="flex w-full flex-col items-center justify-center gap-2.5 rounded-md bg-[#5fca711f] py-[30px]"
      >
        <div class="mt-5 h-[36px] w-[32px] text-center text-2xl">⭐</div>
        <h1
          class="max-w-[255px] text-center text-xl font-bold tracking-tight text-[#5FCA71]"
        >
          Vaša požiadavka bola odoslaná pod číslom ticketu #{{ ticketNumber }}
        </h1>
      </div>
    </div>
    <div class="mt-[20px] flex justify-end space-x-4 border-t border-gray-200 pt-3">
      <button
        class="rounded-lg bg-black px-6 py-2 font-bold text-white transition-colors duration-200 hover:bg-gray-600"
        @click="resetToForm"
      >
        Vytvoriť nový ticket
      </button>
    </div>
  </div>

  <!-- Form -->
  <div v-else>
    <div class="flex flex-col gap-2.5 mb-4">
      <h1 class="text-xl font-bold tracking-tight">Žiadosť o pomoc</h1>
      <h2 class="text-md leading-5 tracking-tight text-[#8792A4]">
        Po zadaní popisu chyby sa automaticky vytvorí ticket ktorý sa pokúsme
        vyriešiť podľa veľkosti problému v čo najskoršom čase.
      </h2>
    </div>

    <div class="space-y-4">
      <!-- Link to Page -->
      <div class="relative">
        <div
          class="relative flex h-[60px] w-full items-center justify-between gap-1 overflow-hidden px-2 border border-[#D6D9E2] rounded-[10px]"
          :class="[linkError ? 'border-red-500' : '']"
        >
          <div class="flex w-full items-center gap-sm">
            <div :class="[formData.linkToPage ? 'mt-4' : 'mt-0']" class="flex w-full items-center">
              <input
                id="linkToPage"
                v-model="formData.linkToPage"
                type="text"
                class="peer h-full w-full bg-transparent placeholder-transparent focus:outline-none text-lg font-normal"
                placeholder="Zadajte URL adresu kde sa problém vyskytuje"
                @blur="validateLink"
              />
            </div>
          </div>
          <span
            class="placeholder pointer-events-none absolute left-2 text-nowrap text-gray-500 transition-all"
            :class="[formData.linkToPage ? 'top-1 text-sm' : 'bottom-auto top-auto text-lg']"
          >
            URL adresa problému
          </span>
        </div>
        <div v-if="linkError" class="text-red-500 mt-1 text-sm">
          {{ linkError }}
        </div>
      </div>

      <!-- Description -->
      <div class="mb-2.5 text-md leading-[23px] tracking-tight">
        Detail chyby
      </div>
      <div class="relative">
        <div
          class="relative flex h-auto min-h-[100px] w-full items-start border border-[#D6D9E2] rounded-[10px] overflow-hidden"
          :class="[descriptionError ? 'border-red-500' : '']"
        >
          <textarea
            id="description"
            v-model="formData.description"
            class="peer w-full h-full bg-transparent placeholder-transparent px-2 text-lg focus:outline-none focus:border-black min-h-[100px] resize-none"
            placeholder="Popíšte čo sa stalo a aké kroky ste vykonali"
            :class="[formData.description ? 'pt-6' : '', 'focus:pt-6']"
            @blur="validateDescription"
          ></textarea>
          <label
            class="pointer-events-none absolute left-2 text-nowrap text-gray-500 transition-all"
            :class="[formData.description ? 'top-1 text-sm' : 'top-[18px] text-lg', 'peer-focus:top-1 peer-focus:text-sm']"
          >
            Popis problému
          </label>
        </div>
        <div v-if="descriptionError" class="text-red-500 mt-1 text-sm">
          {{ descriptionError }}
        </div>
      </div>

      <!-- File Upload -->
      <div class="w-full">
        <label class="mb-1 block text-sm font-medium">Prílohy</label>
        <div
          class="relative flex h-[145px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-[10px] transition-colors border border-dashed border-[#D6D9E2] bg-[#F0F2F6]"
          @click="triggerFileInput"
        >
          <div class="flex flex-col items-center justify-center">
            <div class="h-[36px] w-[32px] text-center text-2xl">☁️</div>
            <span class="max-w-[296px] text-center text-[#8792A4] text-[15px] tracking-tight">
              <span class="text-black font-semibold">Nahrajte</span>
              snímku obrazovky s problémom alebo problémové súbory
            </span>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            multiple
            class="hidden"
            accept=".jpg,.jpeg,.gif,.png,.pdf"
            @change="handleFileUpload"
          />
        </div>

        <!-- Uploaded Files -->
        <div v-if="uploadedFiles.length" class="mt-2">
          <div
            v-for="(file, idx) in uploadedFiles"
            :key="idx"
            class="mb-1 flex items-center justify-between rounded-md bg-gray-50 p-2"
          >
            <span class="max-w-[200px] truncate text-sm">{{ file.name }}</span>
            <button
              type="button"
              class="text-red-500 hover:text-red-700 ml-2"
              @click="removeFile(idx)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Buttons -->
    <div class="mt-4 flex justify-end border-t border-gray-200 pt-3 gap-2.5">
      <button
        class="text-[15px] tracking-tight font-semibold rounded-[8px] px-2.5 py-2 text-[#8792A4] transition-colors duration-200 hover:bg-gray-100"
        @click="resetForm"
      >
        Zrušiť
      </button>
      <button
        class="rounded-[8px] tracking-tight text-[15px] bg-black px-2.5 py-2 font-semibold text-white transition-colors duration-200 hover:bg-gray-600"
        :disabled="isSubmitting || !isFormValid"
        @click="handleSubmit"
      >
        {{ isSubmitting ? "Odosielam..." : "Odoslať" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRuntimeConfig } from '#app'

// Reactive data
const isSubmitting = ref(false)
const isSuccessResult = ref(false)
const ticketNumber = ref('')
const linkError = ref('')
const descriptionError = ref('')
const uploadedFiles = ref([])
const fileInputRef = ref(null)

const formData = ref({
  linkToPage: '',
  description: ''
})

// Get config
const config = useRuntimeConfig().public.reportModule

// Computed
const isFormValid = computed(() => {
  return formData.value.description.trim().length > 0 &&
    formData.value.linkToPage.trim().length > 0 &&
    !linkError.value &&
    !descriptionError.value
})

// Methods
const validateLink = () => {
  const url = formData.value.linkToPage.trim()
  if (!url) {
    linkError.value = 'URL adresa je povinná'
    return false
  }

  try {
    new URL(url)
    linkError.value = ''
    return true
  } catch {
    linkError.value = 'Zadajte platnú URL adresu v tvare https://...'
    return false
  }
}

const validateDescription = () => {
  const desc = formData.value.description.trim()
  if (!desc) {
    descriptionError.value = 'Popis problému je povinný'
    return false
  }
  descriptionError.value = ''
  return true
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files || [])
  uploadedFiles.value.push(...files)
  event.target.value = '' // Reset input
}

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1)
}

const resetForm = () => {
  formData.value = {
    linkToPage: '',
    description: ''
  }
  uploadedFiles.value = []
  linkError.value = ''
  descriptionError.value = ''
  isSuccessResult.value = false
}

const resetToForm = () => {
  resetForm()
}

const handleSubmit = async () => {
  // Validate before submit
  const isLinkValid = validateLink()
  const isDescValid = validateDescription()

  if (!isLinkValid || !isDescValid) {
    return
  }

  isSubmitting.value = true

  try {
    // Simulate API call
    console.log('Submitting ticket:', {
      linkToPage: formData.value.linkToPage,
      description: formData.value.description,
      files: uploadedFiles.value,
      apiUrl: config.apiUrl
    })

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simulate success
    ticketNumber.value = Math.floor(Math.random() * 10000).toString()
    isSuccessResult.value = true

  } catch (error) {
    console.error('Error submitting ticket:', error)
    alert('Chyba pri odosielaní. Skúste to znovu.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
