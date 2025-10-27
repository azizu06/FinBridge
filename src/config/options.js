export const LANGUAGE_OPTIONS = [
    { code: 'en', label: 'English', translatorCode: 'en', i18n: true },
    { code: 'es', label: 'Spanish', translatorCode: 'es', i18n: true },
    { code: 'fr', label: 'French', translatorCode: 'fr' },
    { code: 'de', label: 'German', translatorCode: 'de' },
    { code: 'it', label: 'Italian', translatorCode: 'it' },
    { code: 'pt', label: 'Portuguese', translatorCode: 'pt' },
    { code: 'ru', label: 'Russian', translatorCode: 'ru' },
    { code: 'ar', label: 'Arabic', translatorCode: 'ar' },
    { code: 'zh', label: 'Chinese', translatorCode: 'zh-CN' },
    { code: 'ja', label: 'Japanese', translatorCode: 'ja' },
    { code: 'ko', label: 'Korean', translatorCode: 'ko' },
    { code: 'hi', label: 'Hindi', translatorCode: 'hi' },
    { code: 'vi', label: 'Vietnamese', translatorCode: 'vi' },
    { code: 'id', label: 'Indonesian', translatorCode: 'id' },
    { code: 'tr', label: 'Turkish', translatorCode: 'tr' },
    { code: 'sw', label: 'Swahili', translatorCode: 'sw' },
];

export const CULTURE_OPTIONS = [
    { code: 'american', label: 'American', contextKey: 'American' },
    { code: 'spanish', label: 'Spanish', contextKey: 'Spanish' },
    { code: 'uzbek', label: 'Uzbek', contextKey: 'Uzbek' },
    { code: 'indian', label: 'Indian', contextKey: 'Indian' },
    { code: 'haitian', label: 'Haitian', contextKey: 'Haitian' },
    { code: 'chinese', label: 'Chinese', contextKey: 'Chinese' },
    { code: 'nigerian', label: 'Nigerian', contextKey: 'Nigerian' },
    { code: 'japanese', label: 'Japanese', contextKey: 'Japanese' },
    { code: 'brazilian', label: 'Brazilian', contextKey: 'Brazilian' },
    { code: 'german', label: 'German', contextKey: 'German' },
    { code: 'french', label: 'French', contextKey: 'French' },
    { code: 'filipino', label: 'Filipino', contextKey: 'Filipino' },
    { code: 'egyptian', label: 'Egyptian', contextKey: 'Egyptian' },
    { code: 'korean', label: 'Korean', contextKey: 'Korean' },
    { code: 'vietnamese', label: 'Vietnamese', contextKey: 'Vietnamese' },
    { code: 'russian', label: 'Russian', contextKey: 'Russian' },
    { code: 'pakistani', label: 'Pakistani', contextKey: 'Pakistani' },
    { code: 'ethiopian', label: 'Ethiopian', contextKey: 'Ethiopian' },
    { code: 'indonesian', label: 'Indonesian', contextKey: 'Indonesian' },
    { code: 'moroccan', label: 'Moroccan', contextKey: 'Moroccan' },
];

export const I18N_LANGUAGES = new Set(
    LANGUAGE_OPTIONS.filter((option) => option.i18n).map((option) => option.code)
);
