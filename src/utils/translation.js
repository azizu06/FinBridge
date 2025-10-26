const URL_REGEX = /^https?:\/\//i;

export function flattenTemplate(template) {
    const entries = [];
    function walk(node, path = []) {
        if (typeof node === 'string') {
            const translate =
                node.trim().length > 0 && !URL_REGEX.test(node.trim());
            entries.push({ path, value: node, translate });
            return;
        }
        if (Array.isArray(node)) {
            node.forEach((item, index) => walk(item, [...path, index]));
            return;
        }
        if (node && typeof node === 'object') {
            Object.entries(node).forEach(([key, value]) =>
                walk(value, [...path, key])
            );
        }
    }
    walk(template);
    return entries;
}

function cloneTemplate(template) {
    if (typeof structuredClone === 'function') {
        return structuredClone(template);
    }
    return JSON.parse(JSON.stringify(template));
}

function setPath(target, path, value) {
    if (!path.length) return;
    let current = target;
    for (let i = 0; i < path.length - 1; i += 1) {
        current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
}

export function applyTranslationsToTemplate(template, entries, translated) {
    const clone = cloneTemplate(template);
    let translatedIndex = 0;
    entries.forEach((entry) => {
        if (entry.translate) {
            const value =
                translated[translatedIndex] !== undefined
                    ? translated[translatedIndex]
                    : entry.value;
            translatedIndex += 1;
            setPath(clone, entry.path, value);
        } else {
            setPath(clone, entry.path, entry.value);
        }
    });
    return clone;
}

