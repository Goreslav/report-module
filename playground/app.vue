<template>
  <div class="container mx-auto p-8 max-w-4xl">
    <h1 class="text-3xl font-bold mb-6">
      Report Module Playground
    </h1>

    <div class="grid md:grid-cols-2 gap-8">
      <!-- Test Controls -->
      <div class="space-y-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">
            Test Modal
          </h2>
          <button
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            @click="openReportModal"
          >
            Open Report Modal
          </button>
        </div>

        <!-- User Configuration -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-3">
            Current User
          </h3>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700">Meno</label>
              <input
                v-model="testUser.meno"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">MA (číslo)</label>
              <input
                v-model.number="testUser.ma"
                type="number"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Level</label>
              <select
                v-model="testUser.level"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="developer">
                  Developer
                </option>
                <option value="admin">
                  Admin
                </option>
                <option value="user">
                  User
                </option>
                <option value="manager">
                  Manager
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Debug Info -->
      <div class="space-y-6">
        <div class="bg-gray-50 p-6 rounded-lg">
          <h3 class="text-lg font-semibold mb-3">
            Debug Info
          </h3>

          <div class="space-y-3">
            <div>
              <strong>API URL:</strong>
              <code class="bg-gray-200 px-2 py-1 rounded text-sm">{{ config.apiUrl }}</code>
            </div>
            <div>
              <strong>API Key:</strong>
              <code class="bg-gray-200 px-2 py-1 rounded text-sm">{{ config.apiKey ? '✅ Configured' : '❌ Missing' }}</code>
            </div>
            <div>
              <strong>Debug Mode:</strong>
              <span :class="config.debug ? 'text-green-600' : 'text-red-600'">
                {{ config.debug ? '✅ Enabled' : '❌ Disabled' }}
              </span>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 p-6 rounded-lg">
          <h3 class="text-lg font-semibold mb-3">
            Test User Object
          </h3>
          <pre class="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-auto max-h-64">{{ JSON.stringify(testUser, null, 2) }}</pre>
        </div>

        <div class="bg-gray-50 p-6 rounded-lg">
          <h3 class="text-lg font-semibold mb-3">
            Instructions
          </h3>
          <ol class="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Upravte user informácie vyššie (meno, ma, level)</li>
            <li>Kliknite "Open Report Modal"</li>
            <li>Počkajte kým sa zachytí screenshot a errors</li>
            <li>Vyplňte text popis (min. 10 znakov)</li>
            <li>Skontrolujte network tab v dev tools</li>
            <li>API call ide na <code class="bg-gray-200 px-1">{{ config.apiUrl }}/tickets</code></li>
            <li>Payload obsahuje: text, url, screenshot, errors, user</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRuntimeConfig } from '#app';

const { showModal, setUser, getUser } = useReportModal();
const config = useRuntimeConfig().public.reportModule;

setUser({
  name: 'John Doe',
  id: 12345,
  level: 'developer',
});

const openReportModal = () => {
  setUser(testUser.value);
  showModal();
};

const setErrors = () => {
  console.log('🎮 Playground: Setting user and opening modal');
  console.log('👤 User object:', testUser.value);

  console.error('Test error for report module');
  console.warn('Test warning for report module');
};
onMounted(() => {
  setErrors();
  console.log('🎮 Playground mounted');
  console.log('🔧 Config:', config);
  console.log('📋 Available methods:', { showModal, setUser, getUser });
});
</script>

<style scoped>
code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>
