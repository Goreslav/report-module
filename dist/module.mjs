import { defineNuxtModule, createResolver, addImports, addComponent } from '@nuxt/kit';
export default defineNuxtModule({
    meta: {
        name: 'report-module',
        configKey: 'reportModule',
        compatibility: {
            nuxt: '^3.0.0'
        }
    },
    defaults: {
        apiUrl: '',
        debug: false
    },
    setup(options, nuxt) {
        const resolver = createResolver(import.meta.url);
        // KĽÚČOVÉ: Merge user options s defaults
        const moduleOptions = {
            apiUrl: options.apiUrl || '/api',
            debug: options.debug || false
        };
        // Debug: Pozri čo dostávame
        if (moduleOptions.debug) {
            console.log('🔧 Module setup - received options:', options);
            console.log('🔧 Module setup - final config:', moduleOptions);
        }
        // Pridáme konfiguráciu do runtime config
        nuxt.options.runtimeConfig.public.reportModule = moduleOptions;
        // Registrácia komponentov
        addComponent({
            name: 'ModalContent',
            filePath: resolver.resolve('./runtime/components/ModalContent.vue')
        });
        addComponent({
            name: 'ReportModal',
            filePath: resolver.resolve('./runtime/components/ReportModal.vue')
        });
        addComponent({
            name: 'FileUpload',
            filePath: resolver.resolve('./runtime/components/FileUpload.vue')
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
            console.log('Report Module Options:', options);
        }
    }
});
