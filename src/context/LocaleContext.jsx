import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import i18n from '../i18n.js';
import {
    LANGUAGE_OPTIONS,
    CULTURE_OPTIONS,
    I18N_LANGUAGES,
} from '../config/options.js';
import {
    flattenTemplate,
    applyTranslationsToTemplate,
} from '../utils/translation.js';
import enTranslation from '../locales/en/translation.json';
import enHeader from '../locales/en/header.json';
import enAbout from '../locales/en/about.json';
import enChatbot from '../locales/en/chatbot.json';

const NAMESPACE_TEMPLATES = {
    translation: enTranslation,
    header: enHeader,
    about: enAbout,
    chatbot: enChatbot,
};

const LocaleContext = createContext();

const LANGUAGE_MAP = LANGUAGE_OPTIONS.reduce((acc, option) => {
    acc[option.code] = option;
    return acc;
}, {});

function getInitialValue(key, fallback) {
    if (typeof window === 'undefined') return fallback;
    const stored = window.localStorage.getItem(key);
    return stored ?? fallback;
}

async function translateNamespace(namespace, template, targetLang) {
    const entries = flattenTemplate(template);
    const toTranslate = entries
        .filter((entry) => entry.translate)
        .map((entry) => entry.value);

    if (!toTranslate.length) {
        return template;
    }

    const response = await fetch(
        `${
            (import.meta.env.VITE_BACKEND_URL &&
                import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')) ||
            'http://localhost:5001/api'
        }/translate`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texts: toTranslate, targetLang }),
        }
    );

    if (!response.ok) {
        throw new Error(`Translation failed (${response.status})`);
    }

    const data = await response.json();
    const translated = Array.isArray(data?.translated)
        ? data.translated
        : [];

    return applyTranslationsToTemplate(template, entries, translated);
}

export function LocaleProvider({ children }) {
    const [language, setLanguageState] = useState(() => {
        const stored = getInitialValue('finbridge-language', 'en');
        return LANGUAGE_MAP[stored] ? stored : 'en';
    });
    const [culture, setCultureState] = useState(() => {
        const stored = getInitialValue('finbridge-culture', 'american');
        return CULTURE_OPTIONS.find((option) => option.code === stored)
            ? stored
            : 'american';
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const loadedLanguagesRef = useRef(new Set(['en', 'es']));
    const loadingLanguageRef = useRef(null);

    const setLanguage = (next) => {
        if (!LANGUAGE_MAP[next]) return;
        setLanguageState(next);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('finbridge-language', next);
        }
    };

    const setCulture = (next) => {
        if (!CULTURE_OPTIONS.find((option) => option.code === next)) return;
        setCultureState(next);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('finbridge-culture', next);
        }
    };

    useEffect(() => {
        const loadLanguage = async (lang) => {
            const option = LANGUAGE_MAP[lang] || LANGUAGE_MAP.en;
            const translatorCode = option.translatorCode || option.code;

            if (I18N_LANGUAGES.has(lang)) {
                await i18n.changeLanguage(lang);
                setError(null);
                return;
            }

            if (loadedLanguagesRef.current.has(lang)) {
                await i18n.changeLanguage(lang);
                setError(null);
                return;
            }

            if (loadingLanguageRef.current === lang) return;

            loadingLanguageRef.current = lang;
            setLoading(true);
            try {
                for (const [namespace, template] of Object.entries(
                    NAMESPACE_TEMPLATES
                )) {
                    const bundle = await translateNamespace(
                        namespace,
                        template,
                        translatorCode
                    );
                    i18n.addResourceBundle(lang, namespace, bundle, true, true);
                }
                loadedLanguagesRef.current.add(lang);
                await i18n.changeLanguage(lang);
                setError(null);
            } catch (err) {
                console.warn(
                    'Failed to translate resources:',
                    err?.message || err
                );
                setError(err?.message || 'Translation failed');
                await i18n.changeLanguage('en');
                setLanguageState('en');
            } finally {
                loadingLanguageRef.current = null;
                setLoading(false);
            }
        };

        loadLanguage(language);
    }, [language]);

    const value = useMemo(
        () => ({
            language,
            setLanguage,
            culture,
            setCulture,
            languageOption: LANGUAGE_MAP[language] || LANGUAGE_MAP.en,
            cultureOption:
                CULTURE_OPTIONS.find((option) => option.code === culture) ||
                CULTURE_OPTIONS[0],
            loading,
            error,
        }),
        [language, culture, loading, error]
    );

    return (
        <LocaleContext.Provider value={value}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return context;
}
