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
pnpm add github:ovb-sk/pomoc-nuxt-module#v4.0.0
# or
npm install github:ovb-sk/pomoc-nuxt-module#v4.0.0
# or
yarn add github:ovb-sk/pomoc-nuxt-module#v4.0.0
```

### 2. Add module to your Nuxt config

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@ovb-sk/pomoc-nuxt-module'],
  reportModule: {
    apiKey: 'your-api-key-here',
    apiUrl: 'https://your-api-endpoint.com/api',
    user: {
      id: 123456,
      name: 'John Doe',
      level: 'admin'
    },
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
const { showModal, setUser } = useReportModal()

// Set user data
setUser({
  id: 123456,
  name: 'John Doe',
  level: 'admin'
})

const openReportModal = () => {
  showModal()
}
</script>
```

That's it! The modal will automatically handle the rest ✨

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | **required** | API key for authentication |
| `apiUrl` | `string` | **required** | Base URL for your API endpoint |
| `user` | `User` | `null` | Default user information |
| `debug` | `boolean` | `false` | Enable debug logging |

### Example configuration:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@ovb-sk/pomoc-nuxt-module'],
  reportModule: {
    apiKey: process.env.REPORT_API_KEY,
    apiUrl: 'https://api.example.com/tickets',
    user: {
      id: 123456,
      name: 'Default User',
      level: 'user'
    },
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
const { showModal, setUser } = useReportModal()

// Set user information before opening modal
setUser({
  id: 527852,
  name: 'Marek Mihok',
  level: 'FE2'
})

const openModal = () => {
  showModal()
}
</script>
```

### Dynamic User Management

```vue
<script setup>
const { showModal, setUser, getUser, clearUser } = useReportModal()

// Set user dynamically
const updateUser = (userData) => {
  setUser({
    id: userData.id,
    name: userData.name,
    level: userData.role
  })
}

// Get current user
const currentUser = getUser()

// Clear user data
const logout = () => {
  clearUser()
}
</script>
```

## Components

### ReportModal

The main modal component that handles the display and interaction logic.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `user: User` - User information for the report
- `capturedData: CapturedData` - Automatically captured page data

**Events:**
- `@close` - Emitted when modal should be closed

### ModalContent

The content component inside the modal with the reporting form.

**Props:**
- `user: User` - User information
- `capturedData: CapturedData` - Page data including screenshots and errors

**Events:**
- `@close` - Emitted when form is submitted or cancelled

## Composables

### useReportModal()

Returns an object with methods to control the modal:

```typescript
const { 
  showModal, 
  setUser, 
  getUser, 
  clearUser 
} = useReportModal()

// Methods
showModal()          // Opens the modal
setUser(user)        // Sets user information
getUser()            // Gets current user
clearUser()          // Clears user data
```

### useCaptureUtils()

Handles automatic error tracking and screenshot capture:

```typescript
const { 
  startErrorTracking,
  stopErrorTracking,
  captureScreenshot,
  getCapturedData,
  clearCapturedErrors 
} = useCaptureUtils()
```

## Types

The module includes comprehensive TypeScript definitions:

```typescript
interface User {
  id: number
  name: string
  level: string
}

interface ReportModuleOptions {
  apiKey: string
  apiUrl: string
  user?: User
  debug?: boolean
}

interface TicketPayload {
  text: string
  url: string
  screenshot?: string | null
  errors?: CapturedError[]
  userAgent?: string
  timestamp?: string
  source?: string
}

interface CapturedData {
  url: string
  userAgent: string
  errors: CapturedError[]
  viewport: { width: number; height: number } | null
  screenshot: string | null
  timestamp: number
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
   git clone https://github.com/ovb-sk/pomoc-nuxt-module.git
   cd pomoc-nuxt-module
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

# Type checking
pnpm run typecheck

# Run ESLint
pnpm run lint
pnpm run lint:fix

# Run tests
pnpm run test
pnpm run test:watch

# Release new version (manual)
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
│       │   ├── useReportModal.ts
│       │   ├── useCaptureUtils.ts
│       │   ├── useApi.ts
│       │   └── useTicketApi.ts
│       ├── plugins/           # Nuxt plugins
│       │   └── error-tracker.client.ts
│       ├── utils/             # Utility functions
│       │   └── debounce.ts
│       └── types/             # TypeScript definitions
│           └── index.ts
├── types/                     # Global type definitions
│   └── global.d.ts
├── playground/                # Development playground
│   ├── app.vue
│   ├── nuxt.config.ts
│   └── package.json
├── build.config.ts            # Build configuration
├── tsconfig.json              # TypeScript configuration
└── package.json
```

### Testing Changes

1. Make your changes in the `src/` directory
2. The playground automatically reloads with your changes
3. Test the functionality in `http://localhost:3000`
4. Run tests with `pnpm run test`
5. Check types with `pnpm run typecheck`

### Building for Production

```bash
pnpm run build
```

This creates the `dist/` folder with compiled module files.

</details>

## Release Process

### For Contributors

This section describes how to create and publish new versions of the module:

<details>
  <summary>📦 Release workflow</summary>

### Prerequisites

- Write access to the repository
- All changes committed and pushed to main branch
- Tests passing (`pnpm run test`)
- Build successful (`pnpm run build`)

### 1. 🏗️ Prepare Release

```bash
# Make sure you're on main branch with latest changes
git checkout main
git pull origin main

# Clean and build the module
pnpm run clean
pnpm run typecheck
pnpm run build

# Verify build output
ls -la dist/
```

### 2. 📝 Update Version

Choose appropriate version bump based on changes:

```bash
# For bug fixes and small improvements
pnpm version patch   # 4.0.0 → 4.0.1

# For new features (backwards compatible)
pnpm version minor   # 4.0.0 → 4.1.0

# For breaking changes
pnpm version major   # 4.0.0 → 5.0.0

# Or set specific version
pnpm version 4.2.5
```

This command will:
- ✅ Update `package.json` version
- ✅ Create a git commit
- ✅ Create a git tag (e.g., `v4.0.1`)

### 3. 🚀 Publish Release

```bash
# Push changes and tags to GitHub
git push origin main --follow-tags
```

### 4. 📋 Verify Release

1. **Check GitHub**: Go to [releases page](https://github.com/ovb-sk/pomoc-nuxt-module/releases)
2. **Verify tag**: New tag should be visible (e.g., `v4.0.1`)
3. **Test installation**: Try installing the new version in a test project

### 5. 🔄 Update Projects

In projects using the module, update to the new version:

```json
{
  "dependencies": {
    "@ovb-sk/pomoc-nuxt-module": "github:ovb-sk/pomoc-nuxt-module#v4.0.1"
  }
}
```

```bash
pnpm install
# or
pnpm update @ovb-sk/pomoc-nuxt-module
```

### Quick Release Script

Create a release script for faster releases:

```bash
#!/bin/bash
# release.sh

echo "🚀 Starting release process..."

# Validate environment
if [[ $(git symbolic-ref --short HEAD) != "main" ]]; then
    echo "❌ Not on main branch"
    exit 1
fi

if [[ -n $(git status --porcelain) ]]; then
    echo "❌ Working directory not clean"
    exit 1
fi

# Build and test
echo "🏗️ Building..."
pnpm run clean
pnpm run typecheck
pnpm run build

# Version bump
echo "📝 Bumping version..."
VERSION_TYPE=${1:-patch}
pnpm version $VERSION_TYPE

# Push
echo "🚀 Publishing..."
git push origin main --follow-tags

echo "✅ Release completed!"
echo "🔗 Check: https://github.com/ovb-sk/pomoc-nuxt-module/releases"
```

Usage:
```bash
chmod +x release.sh
./release.sh patch   # or minor, major
```

### 🚨 Troubleshooting

**Tag already exists:**
```bash
# Delete local tag
git tag -d v4.0.1

# Delete remote tag (if needed)
git push origin --delete v4.0.1

# Create new tag
pnpm version patch
```

**Build fails:**
```bash
# Debug build issues
pnpm run build --verbose
pnpm run typecheck
```

**Git issues:**
```bash
# Reset to last good state
git reset --hard HEAD~1
git tag -d v4.0.1  # if tag was created
```

</details>

## Support

For issues and questions:

1. 🐛 **Bug reports**: [Create an issue](https://github.com/ovb-sk/pomoc-nuxt-module/issues/new)
2. 💡 **Feature requests**: [Discussions](https://github.com/ovb-sk/pomoc-nuxt-module/discussions)
3. 📖 **Documentation**: Check this README and code comments

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@ovb-sk/pomoc-nuxt-module/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/@ovb-sk/pomoc-nuxt-module

[npm-downloads-src]: https://img.shields.io/npm/dm/@ovb-sk/pomoc-nuxt-module.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/@ovb-sk/pomoc-nuxt-module

[license-src]: https://img.shields.io/npm/l/@ovb-sk/pomoc-nuxt-module.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@ovb-sk/pomoc-nuxt-module

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
