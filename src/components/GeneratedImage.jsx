export default function GeneratedImage({ prompt, url, loading, error }) {
    if (!prompt) return null;

    if (loading) {
        return (
            <div className="text-sm text-neutral-500">
                Creating illustration&hellip;
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-sm text-red-600">
                {error || 'Unable to create illustration.'}
            </div>
        );
    }

    if (!url) {
        return null;
    }

    return (
        <div>
            <img
                src={url}
                alt={prompt}
                className="w-full max-w-full rounded-xl border border-neutral-200 shadow-sm"
                loading="lazy"
            />
            <p className="mt-2 text-xs text-neutral-500">
                Illustration idea: {prompt}
            </p>
        </div>
    );
}

