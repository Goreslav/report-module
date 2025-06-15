import { defineNuxtModule, createResolver, addImports, addComponent, addPlugin } from '@nuxt/kit';
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
    }
    catch {
      throw new Error('[Report Module] apiUrl must be a valid URL');
    }

    if (options.user) {
      if (!options.user.name || typeof options.user.name !== 'string') {
        throw new Error('[Report Module] user.name must be a non-empty string');
      }
      if (!options.user.id || typeof options.user.id !== 'number') {
        throw new Error('[Report Module] user.id must be a number');
      }
      if (!options.user.level || typeof options.user.level !== 'string') {
        throw new Error('[Report Module] user.level must be a non-empty string');
      }
    }

    if (options.debug) {
      const logMessage = '🔧 [Report Module] Setup Debug Info:';
      const logData = {
        apiUrl: options.apiUrl,
        hasApiKey: !!options.apiKey,
        apiKeyPreview: options.apiKey.substring(0, 8) + '...',
        hasUser: !!options.user,
        hasLogger: !!options.logger,
      };

      if (options.logger) {
        options.logger.log(logMessage, logData);
      } else {
        console.log(logMessage, logData);
      }
    }

    nuxt.options.runtimeConfig.reportModule = {
      apiKey: options.apiKey,
    };

    nuxt.options.runtimeConfig.public.reportModule = {
      apiUrl: options.apiUrl,
      user: options.user || null,
      debug: options.debug || false,
      // apiKey: options.apiKey || null,
    };

    addPlugin(resolver.resolve('./runtime/plugins/error-tracker.client'));

    addComponent({
      name: 'ModalContent',
      filePath: resolver.resolve('./runtime/components/ModalContent.vue'),
    });

    addComponent({
      name: 'ReportModal',
      filePath: resolver.resolve('./runtime/components/ReportModal.vue'),
    });

    addImports([
      {
        name: 'useReportModal',
        as: 'useReportModal',
        from: resolver.resolve('./runtime/composables/useReportModal'),
      },
      {
        name: 'useCaptureUtils',
        as: 'useCaptureUtils',
        from: resolver.resolve('./runtime/composables/useCaptureUtils'),
      },
    ]);

    if (options.debug) {
      const successMsg = '✅ [Report Module] Initialized successfully';
      if (options.logger) {
        options.logger.log(successMsg);
      } else {
        console.log(successMsg);
      }
    }
  },
});

export type { ReportModuleOptions, User, TicketPayload, TicketResponse, CapturedData, CapturedError } from './runtime/types';
