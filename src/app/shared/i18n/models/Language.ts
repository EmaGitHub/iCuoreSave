
export class Language {
    public code: string;
    public label: string;
    public url: string;
    public isDefault: boolean;
    public lastModified?: string | null;
    public translations?: any | null;
    public isAutomatic?: boolean;

    constructor(
        language: Language
    ) {
        this.code = language.code;
        this.label = language.label;
        this.url = language.url;
        this.isDefault = language.isDefault;
        this.lastModified = language.lastModified || null;
        this.translations = language.translations || null;
        this.isAutomatic = language.isAutomatic || true;
    }
}
