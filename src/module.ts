import { defineNuxtModule, createResolver, addImports, addComponent, addPlugin } from '@nuxt/kit';
import { moduleLogger } from './runtime/utils/logger';
import type { ReportModuleOptions } from './runtime/types';

export default defineNuxtModule<ReportModuleOptions>({
  meta: {
    name: '@ovb-sk/pomoc-nuxt-module',
    configKey: 'reportModule',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  defaults: {
    debug: false,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    if (!options.apiKey) {
      throw new Error('[Report Module] apiKey is required. Please configure it in nuxt.config.ts');
    }

    if (!options.apiUrl) {
      throw new Error('[Report Module] apiUrl is required. Please configure it in nuxt.config.ts');
    }

    try {
      new URL(options.apiUrl);
    } catch {
      throw new Error('[Report Module] apiUrl must be a valid URL');
    }

    if (options.user) {
      if (!options.user.name || typeof options.user.name !== 'string') {
        throw new Error('[Report Module] user.name must be a non-empty string');
      }
      if (!options.user.ma || typeof options.user.ma !== 'number') {
        throw new Error('[Report Module] user.ma must be a number');
      }
      if (!options.user.level || typeof options.user.level !== 'string') {
        throw new Error('[Report Module] user.level must be a non-empty string');
      }
    }

    if (options.debug) {
      moduleLogger.info('🔧 Report Module Setup Debug Info:', {
        apiUrl: options.apiUrl,
        hasApiKey: !!options.apiKey,
        apiKeyPreview: options.apiKey.substring(0, 8) + '...',
        defaultUser: options.user ? `${options.user.name} (${options.user.ma})` : 'Not configured',
        debugMode: options.debug,
      });
    }

    nuxt.options.runtimeConfig.reportModule = {
      apiKey: options.apiKey, // Server-side only
    };

    nuxt.options.runtimeConfig.public.reportModule = {
      apiUrl: options.apiUrl,
      user: options.user || null,
      debug: options.debug || false,
    };

    // Add plugin
    addPlugin(resolver.resolve('./runtime/plugins/error-tracker.client'));

    // Add components
    addComponent({
      name: 'ModalContent',
      filePath: resolver.resolve('./runtime/components/ModalContent.vue'),
    });

    addComponent({
      name: 'ReportModal',
      filePath: resolver.resolve('./runtime/components/ReportModal.vue'),
    });

    // Add composables
    addImports([
      {
        name: 'useReportModal',
        as: 'useReportModal',
        from: resolver.resolve('./runtime/composables/useReportModal'),
      },
    ]);

    if (options.debug) {
      moduleLogger.success('✅ Report Module initialized successfully');
    }
  },
});

export type { ReportModuleOptions, User, TicketPayload, TicketResponse, CapturedData, CapturedError } from './runtime/types';
