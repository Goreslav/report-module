<template>
  <div class="w-full">
    <label :for="id" class="mb-1 block text-sm font-medium">{{ label }}</label>
    <span
      class="relative flex h-[145px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-[10px] transition-colors "
      :class="[
        isDraggingOver
          ? 'border-2 border-dashed border-blue-500 bg-[#F0F2F6]'
          : 'border border-dashed border-[#D6D9E2] bg-[#F0F2F6]',
      ]"
      @click="triggerFileInput"
      @drop.prevent="handleFileDrop"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
    >
      <div class="flex flex-col items-center justify-center">
        <!-- Cloud Icon -->
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          :class="[isDraggingOver ? 'text-blue-500' : '', 'h-[36px] w-[32px]']"
        >
          <g id="cloud-upload--cloud-server-internet-upload-up-arrow-network">
            <path id="Subtract" d="M6.44456 21.409C3.4231 20.1302 1 17.8563 1 13.817C1 9.10688 3.64946 6.45742 8.35962 6.45742L8.45103 6.45774C9.48294 2.93158 12.3542 1 16.7278 1C22.0585 1 25.1574 3.86936 25.4142 8.99788C28.9916 9.06031 31 11.1243 31 14.7503C31 18.6103 28.6238 20.6761 25.7087 21.7806" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            <path id="Vector" d="M11.418 22.9857C13.0651 20.9754 14.0695 19.9709 16.0001 18.4037C17.9308 19.9709 18.9352 20.9754 20.5823 22.9857" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            <path id="Vector_2" d="M16.0039 30.631V18.428" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            <path id="Vector 2591" d="M8.28906 6.46118C11.0066 6.46118 13.4371 8.25241 14.2038 9.88891" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
        </svg>

        <span
          class="max-w-[296px] text-center text-[#8792A4] text-[15px] tracking-tight"
          :class="[isDraggingOver ? 'text-blue-500' : '']"
        >
          <span
            class="text-black font-semibold"
            :class="[isDraggingOver ? 'text-blue-500' : '']"
          >
            {{ isDraggingOver ? "Pustite súbory" : "Nahrajte" }}
          </span>
          {{
            isDraggingOver
              ? "pre nahranie"
              : "snímku obrazovky s problémom alebo problémové súbory"
          }}
        </span>
      </div>

      <input
        :id="id"
        ref="fileInputRef"
        type="file"
        multiple
        class="hidden"
        :accept="acceptAttribute"
        @change="handleFileUpload"
      />
    </span>

    <!-- File Errors -->
    <div v-if="fileErrors.length" class="mt-2">
      <div
        v-for="(err, i) in fileErrors"
        :key="i"
        class="text-sm text-red-500 mb-1"
      >
        {{ err }}
      </div>
    </div>

    <!-- Uploading Files -->
    <div v-if="uploadingFiles.length" class="mt-2">
      <div
        v-for="item in uploadingFiles"
        :key="item.internalId"
        class="mb-1 flex items-center justify-between rounded-md bg-blue-50 p-2"
      >
        <div class="flex flex-col">
          <span class="max-w-[200px] truncate text-sm">{{ item.file.name }}</span>
          <span class="text-xs text-blue-500">Nahrávanie...</span>
        </div>
        <div class="spinner h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>

    <!-- Uploaded Files -->
    <div v-if="uploadedFiles.length" class="mt-2">
      <div
        v-for="(file, idx) in uploadedFiles"
        :key="file.fileId"
        class="mb-1 flex items-center justify-between rounded-md bg-gray-50 p-2"
      >
        <span class="max-w-[200px] truncate text-sm">{{ file.fileName }}</span>
        <button
          type="button"
          class="text-red-500 hover:text-red-700 ml-2"
          @click="removeFile(idx)"
          :disabled="isDeleting[file.fileId]"
        >
          <span v-if="isDeleting[file.fileId]">Odstraňujem...</span>
          <span v-else>✕</span>
        </button>
      </div>
    </div>

    <!-- Invalid Files -->
    <div v-if="invalidFiles.length" class="mt-2">
      <div
        v-for="item in invalidFiles"
        :key="item.internalId"
        class="mb-1 flex items-center justify-between rounded-md border-2 border-red-500 bg-red-50 p-2"
      >
        <div class="flex flex-col">
          <span class="max-w-[200px] truncate text-sm">{{ item.file.name }}</span>
          <span class="text-xs text-red-500">{{ item.errorMessage }}</span>
        </div>
        <button
          type="button"
          class="text-red-500 hover:text-red-700 ml-2"
          @click="removeInvalidFile(item.internalId)"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { debounce } from '../utils/debounce'
import { useTicketApi } from '../composables/useTicketApi'

// Interfaces
interface InvalidFileInternal {
  internalId: string;
  file: File;
  errorMessage: string;
}

interface UploadedFile {
  fileId: string;
  fileName: string;
  filePath: string;
  id: number;
}

interface UploadingFileInternal {
  internalId: string;
  file: File;
}

// Props
const props = withDefaults(
  defineProps<{
    id: string
    label?: string
    maxFilesCount?: number
    maxFileSize?: number
    disabled?: boolean
    allowedExtensions?: string[]
  }>(),
  {
    label: "Prílohy",
    maxFilesCount: 6,
    maxFileSize: 10 * 1024 * 1024,
    disabled: false,
    allowedExtensions: () => [
      "jpg", "jpeg", "gif", "png", "pdf", "heic", "heif", "docx", "doc", "xlsx", "xls"
    ]
  }
);

// Model
const model = defineModel<string[]>("modelValue", { default: () => [] });

// State
const uploadedFiles = ref<UploadedFile[]>([]);
const uploadingFiles = ref<UploadingFileInternal[]>([]);
const invalidFiles = ref<InvalidFileInternal[]>([]);
const fileErrors = ref<string[]>([]);
const isDeleting = ref<Record<string, boolean>>({});
const isDraggingOver = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Composables
const { uploadFile, deleteTempFile } = useTicketApi();

// Computed
const acceptAttribute = computed(() => props.allowedExtensions.map(ext => `.${ext}`).join(","));

// Methods
const triggerFileInput = () => {
  if (props.disabled) return;
  fileInputRef.value?.click();
};

const onDragOver = () => {
  isDraggingOver.value = true;
};

const onDragLeave = debounce(() => {
  isDraggingOver.value = false;
}, 200);

const validateFileType = (file: File) => {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return props.allowedExtensions.includes(ext);
};

const getFileErrorMessage = (file: File): string | null => {
  if (!validateFileType(file)) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    return `Nepodporovaný formát súboru (${ext})`;
  }
  if (file.size > props.maxFileSize) {
    return `Súbor je príliš veľký (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
  }
  return null;
};

const uploadFileInternal = async (file: File, internalId: string) => {
  try {
    const result = await uploadFile(file, internalId);
    if (result.success) {
      uploadedFiles.value.push(result.data);
      model.value = [...model.value, result.data.fileId];
    } else {
      invalidFiles.value.push({ internalId, file, errorMessage: result.message || "Chyba pri nahrávaní súboru" });
    }
  } catch (err: any) {
    invalidFiles.value.push({ internalId, file, errorMessage: err.message || "Chyba pri nahrávaní súboru" });
  } finally {
    const idx = uploadingFiles.value.findIndex(u => u.internalId === internalId);
    if (idx !== -1) uploadingFiles.value.splice(idx, 1);
  }
};

const validateAndUploadFiles = async (filesList: File[]) => {
  fileErrors.value = [];
  const validFiles: File[] = [];
  const newInvalid: InvalidFileInternal[] = [];

  for (const file of filesList) {
    const err = getFileErrorMessage(file);
    if (err) {
      newInvalid.push({ internalId: crypto.randomUUID(), file, errorMessage: err });
    } else validFiles.push(file);
  }
  invalidFiles.value.push(...newInvalid);

  const slots = props.maxFilesCount - uploadedFiles.value.length;
  const toUpload = validFiles.slice(0, slots);

  if (validFiles.length > slots) {
    validFiles.slice(slots).forEach(f => invalidFiles.value.push({
      internalId: crypto.randomUUID(),
      file: f,
      errorMessage: `Prekročený maximálny počet súborov (${props.maxFilesCount})`
    }));
    fileErrors.value.push(
      `Môžete pridať maximálne ${slots} ďalších súborov. Celkový limit je ${props.maxFilesCount}.`
    );
  }

  await Promise.all(toUpload.map(async (file) => {
    const internalId = crypto.randomUUID();
    uploadingFiles.value.push({ internalId, file });
    await uploadFileInternal(file, internalId);
  }));

  if (newInvalid.some(i => i.errorMessage.includes("Nepodporovaný formát"))) {
    fileErrors.value.push(
      `Niektoré súbory majú nepodporovaný formát. Povolené typy sú: ${props.allowedExtensions.join(", ")}.`
    );
  }
  if (newInvalid.some(i => i.errorMessage.includes("príliš veľký"))) {
    fileErrors.value.push(
      `Niektoré súbory sú príliš veľké. Maximálna povolená veľkosť je ${props.maxFileSize / (1024 * 1024)}MB.`
    );
  }

  return toUpload.length > 0;
};

const handleFileUpload = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (!input.files?.length) return;
  await validateAndUploadFiles(Array.from(input.files));
  input.value = "";
};

const handleFileDrop = async (e: DragEvent) => {
  isDraggingOver.value = false;
  if (props.disabled) return;
  if (!e.dataTransfer?.files.length) return;
  await validateAndUploadFiles(Array.from(e.dataTransfer.files));
};

const removeFile = async (idx: number) => {
  const file = uploadedFiles.value[idx];
  isDeleting.value[file.fileId] = true;
  try {
    await deleteTempFile(file.fileId);
    const pos = model.value.indexOf(file.fileId);
    if (pos !== -1) model.value.splice(pos, 1);
    uploadedFiles.value.splice(idx, 1);
  } catch (err: any) {
    fileErrors.value.push(`Nepodarilo sa odstrániť ${file.fileName}: ${err.message}`);
  } finally {
    delete isDeleting.value[file.fileId];
  }
};

const removeInvalidFile = (internalId: string) => {
  const idx = invalidFiles.value.findIndex(i => i.internalId === internalId);
  if (idx !== -1) invalidFiles.value.splice(idx, 1);
};
</script>

<style scoped>
.spinner {
  border-top-color: transparent;
}
</style>
