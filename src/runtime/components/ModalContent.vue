<template>
  <div class="relative flex flex-col">
    <div
      v-if="isSubmitting"
      class="
        absolute inset-0 z-50
        flex items-center justify-center
        bg-white/60
      "
    >
      <div
        class="
          h-12 w-12 animate-spin
          rounded-full border-4 border-solid
          border-blue-500 border-t-transparent
        "
        role="status"
      />
    </div>

    <div class="flex flex-col gap-2.5 px-5 pt-5">
      <h1 class="text-xl font-bold tracking-tight">
        Žiadosť o pomoc
      </h1>
      <h2 class="text-md leading-5 tracking-tight text-[#8792A4]">
        Po zadaní popisu chyby sa pokúsime
        vyriešiť podľa veľkosti problému v čo najskoršom čase.
      </h2>
    </div>

    <div class="p-5">
      <div class="space-y-4">
        <div class="mb-2.5 text-md leading-[23px] tracking-tight">
          Popíšte čo sa stalo a aké kroky ste vykonali
        </div>
        <div class="relative">
          <div
            class="
              relative flex h-auto min-h-[100px] w-full items-start
              border border-[#D6D9E2] rounded-[10px] overflow-hidden
            "
            :class="[descriptionError ? 'border-red-500' : '']"
          >
            <textarea
              id="description"
              v-model="formData.text"
              class="
                peer w-full h-full bg-transparent placeholder-transparent
                px-2 text-lg focus:outline-none focus:border-black
                min-h-[100px] resize-none
              "
              placeholder="Popíšte čo sa stalo a aké kroky ste vykonali"
              :class="[formData.text ? 'pt-6' : '', 'focus:pt-6']"
              @blur="validateDescription"
            />
          </div>
          <div
            v-if="descriptionError"
            class="text-red-500 mt-1 text-sm"
          >
            {{ descriptionError }}
          </div>
        </div>
      </div>
    </div>

    <div class="border-gray mt-3 flex justify-end border-t p-3 gap-2.5">
      <button
        class="
          text-[15px] tracking-tight font-semibold rounded-[8px]
          px-2.5 py-2 text-[#8792A4]
          transition-colors duration-200 hover:bg-gray-100
        "
        @click="resetForm"
      >
        Zrušiť
      </button>
      <button
        class="
          rounded-[8px] tracking-tight text-[15px]
          bg-black px-2.5 py-2 font-semibold text-white
          transition-colors duration-200
          hover:bg-gray-600
          disabled:bg-gray-400 disabled:cursor-not-allowed
        "
        :disabled="isSubmitting || !isFormValid"
        @click="handleSubmit"
      >
        {{ isSubmitting ? "Odosielam..." : "Odoslať" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTicketApi } from '../composables/useTicketApi';
import { useRuntimeConfig } from '#app';
import { moduleLogger } from '../utils/logger';  // ✅ Import loggera

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
  capturedData: {
    type: Object,
    default: () => ({
      url: '',
      screenshot: null,
      errors: [],
      userAgent: '',
    }),
  },
});

const emit = defineEmits(['close']);

const isSubmitting = ref(false);
const descriptionError = ref('');

const formData = ref({
  text: '',
});

const config = useRuntimeConfig().public.reportModule;
const { createTicket } = useTicketApi();

const isFormValid = computed(() => {
  return formData.value.text.trim().length >= 10 && !descriptionError.value;
});

const validateDescription = () => {
  const desc = formData.value.text.trim();
  if (!desc) {
    descriptionError.value = 'Popis problému je povinný';
    return false;
  }
  if (desc.length < 10) {
    descriptionError.value = 'Popis musí mať aspoň 10 znakov';
    return false;
  }
  descriptionError.value = '';
  return true;
};

const resetForm = () => {
  formData.value = {
    text: '',
  };
  descriptionError.value = '';
};

const handleSubmit = async () => {
  const isDescValid = validateDescription();

  if (!isDescValid) {
    return;
  }

  isSubmitting.value = true;

  try {
    const user = props.user;

    if (config.debug) {
      moduleLogger.info('🎫 Submitting ticket with data:', {
        user,
        text: formData.value.text,
        capturedData: props.capturedData,
      });
    }

    const ticketPayload = {
      text: formData.value.text,
      url: props.capturedData?.url,
      screenshot: props.capturedData?.screenshot,
      errors: props.capturedData?.errors,
      userAgent: props.capturedData?.userAgent,
      viewport: props.capturedData?.viewport,
      timestamp: props.capturedData?.timestamp,
    };

    const result = await createTicket(ticketPayload, user);

    if (result.success) {
      moduleLogger.success('✅ Ticket created successfully');
      emit('close');
    }
    else {
      throw new Error('Nepodarilo sa vytvoriť ticket');
    }
  }
  catch (error) {
    const errorMessage = 'Nastala chyba pri odosielaní.';

    moduleLogger.error('❌ Ticket submission failed:', {
      error: error.message,
      user: props.user,
      textLength: formData.value.text.length
    });

    if (config.debug) {
      alert(errorMessage);
    }
  }
  finally {
    isSubmitting.value = false;
  }
};
</script>
