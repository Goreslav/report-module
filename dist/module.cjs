const { defineNuxtModule, createResolver, addImports, addComponent, addPlugin  } = require("@nuxt/kit");
module.exports = defineNuxtModule({
    meta: {
        name: 'report-module',
        configKey: 'reportModule',
        compatibility: {
            nuxt: '^3.0.0'
        }
    },
    setup(options, nuxt) {
        const resolver = createResolver(import.meta.url);
        // Validácia povinných options
        if (!options.apiKey) {
            throw new Error('Report Module: apiKey is required. Please configure it in nuxt.config.ts');
        }
        if (!options.apiUrl) {
            throw new Error('Report Module: apiUrl is required. Please configure it in nuxt.config.ts');
        }
        if (options.debug) {
            console.log('=== REPORT MODULE SETUP DEBUG ===');
            console.log('🔧 API URL:', options.apiUrl);
            console.log('🔧 Has API Key:', !!options.apiKey);
            console.log('🔧 Default User:', options.user || 'Not configured');
            console.log('🔧 Debug Mode:', options.debug);
            console.log('==================================');
        }
        // Pridáme konfiguráciu do runtime config
        nuxt.options.runtimeConfig.public.reportModule = {
            apiUrl: options.apiUrl,
            apiKey: options.apiKey,
            user: options.user || null,
            debug: options.debug || false
        };
        // Registrácia error tracking pluginu
        addPlugin(resolver.resolve('./runtime/plugins/error-tracker.client.js'));
        // Registrácia komponentov
        addComponent({
            name: 'ModalContent',
            filePath: resolver.resolve('./runtime/components/ModalContent.vue')
        });
        addComponent({
            name: 'ReportModal',
            filePath: resolver.resolve('./runtime/components/ReportModal.vue')
        });
        // Registrácia composables
        addImports([
            {
                name: 'useReportModal',
                as: 'useReportModal',
                from: resolver.resolve('./runtime/composables/useReportModal')
            }
        ]);
        if (options.debug) {
            console.log('✅ Report Module initialized successfully');
        }
    }
});
