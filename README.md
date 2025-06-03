# Report Module

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A powerful Nuxt 3 module for creating ticket reporting modals with ease. Perfect for bug reports, feature requests, and user feedback collection.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-username/report-module?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

- 📝 &nbsp;Easy-to-use modal component for ticket reporting
- 🎨 &nbsp;Customizable modal content and styling
- ⚙️ &nbsp;Configurable API endpoints
- 🚀 &nbsp;Simple composable API (`useReportModal`)
- 💡 &nbsp;TypeScript support out of the box
- 🔧 &nbsp;Auto-imports for seamless development

## Quick Setup

### 1. Install the module

```bash
pnpm add report-module
# or
npm install report-module
# or
yarn add report-module
```

### 2. Add module to your Nuxt config

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['report-module'],
  reportModule: {
    apiUrl: 'https://your-api-endpoint.com/api',
    debug: false // set to true for development
  }
})
```

### 3. Use in your components

```vue
<template>
  <div>
    <button @click="openReportModal">
      Report Issue
    </button>
  </div>
</template>

<script setup>
const { showModal } = useReportModal()

const openReportModal = () => {
  showModal()
}
</script>
```

That's it! The modal will automatically handle the rest ✨

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiUrl` | `string` | `'/api'` | Base URL for your API endpoint |
| `debug` | `boolean` | `false` | Enable debug logging |

### Example configuration:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['report-module'],
  reportModule: {
    apiUrl: 'https://api.example.com/tickets',
    debug: process.env.NODE_ENV === 'development'
  }
})
```

## Usage Examples

### Basic Usage

```vue
<template>
  <button @click="openModal" class="report-btn">
    Report a Bug
  </button>
</template>

<script setup>
const { showModal } = useReportModal()

const openModal = () => {
  showModal()
}
</script>
```

### Custom Content

You can customize the modal content by creating your own `ModalContent.vue` component:

```vue
<!-- components/CustomModalContent.vue -->
<template>
  <div>
    <h2>Custom Report Form</h2>
    <form @submit.prevent="submitReport">
      <textarea v-model="description" placeholder="Describe the issue..."></textarea>
      <button type="submit">Submit Report</button>
    </form>
  </div>
</template>

<script setup>
const description = ref('')

const submitReport = () => {
  // Handle form submission
  console.log('Report:', description.value)
}
</script>
```

## Components

### ReportModal

The main modal component that handles the display and interaction logic.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `apiUrl: string` - API endpoint for submission

**Events:**
- `@close` - Emitted when modal should be closed

### ModalContent

The content component inside the modal. You can override this component to customize the form.

## Composables

### useReportModal()

Returns an object with methods to control the modal:

```typescript
const { showModal } = useReportModal()

// Methods
showModal() // Opens the modal
```

## Types

The module includes TypeScript definitions for better development experience:

```typescript
interface ReportModuleOptions {
  apiUrl?: string
  debug?: boolean
}

interface TicketPayload {
  formType: string
  description: string
  linkToPage: string
  reporterMa?: string
  contractNumber?: string
  protocolNumber?: string
  desiredState?: string
  fileIds?: string[]
}
```

## Development

Want to contribute or modify the module? Here's how to set up local development:

<details>
  <summary>Local development setup</summary>

### Prerequisites

- Node.js (v16 or higher)
- pnpm (recommended), npm, or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/report-module.git
   cd report-module
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Prepare development environment**
   ```bash
   pnpm run dev:prepare
   ```

4. **Start development server**
   ```bash
   pnpm run dev
   ```
   This will start the playground at `http://localhost:3000`

### Available Scripts

```bash
# Install dependencies
pnpm install

# Generate type stubs
pnpm run dev:prepare

# Develop with the playground
pnpm run dev

# Build the playground
pnpm run dev:build

# Build the module
pnpm run build

# Run ESLint
pnpm run lint

# Run tests
pnpm run test
pnpm run test:watch

# Release new version
pnpm run release
```

### Project Structure

```
├── src/
│   ├── module.ts              # Main module file
│   └── runtime/
│       ├── components/        # Vue components
│       │   ├── ModalContent.vue
│       │   └── ReportModal.vue
│       ├── composables/       # Vue composables
│       │   └── useReportModal.ts
│       └── types.ts           # TypeScript definitions
├── playground/                # Development playground
│   ├── app.vue
│   ├── nuxt.config.ts
│   └── package.json
├── build.config.ts            # Build configuration
└── package.json
```

### Testing Changes

1. Make your changes in the `src/` directory
2. The playground automatically reloads with your changes
3. Test the functionality in `http://localhost:3000`
4. Run tests with `pnpm run test`

### Building for Production

```bash
pnpm run build
```

This creates the `dist/` folder with compiled module files.

</details>

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/report-module/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/report-module

[npm-downloads-src]: https://img.shields.io/npm/dm/report-module.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/report-module

[license-src]: https://img.shields.io/npm/l/report-module.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/report-module

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
