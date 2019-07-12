export class I18nModuleOptions {
    constructor(
        public remote?: string,
        public local?: {
            i18n: any,
            langs: any
        },
        public storePrefix?: string
    ){ }
}
