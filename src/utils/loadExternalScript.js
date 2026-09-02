// src/utils/loadExternalScript.js
//
// Loads an external <script> tag exactly once (cached by src), returning a
// promise that resolves once it's loaded. Used by GoogleSignInButton and
// AppleSignInButton to pull in each provider's own SDK only when that
// provider is actually configured — never bundled, never loaded
// unconditionally.
const loaded = new Map();

export const loadExternalScript = (src) => {
    if (loaded.has(src)) return loaded.get(src);

    const promise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });

    loaded.set(src, promise);
    return promise;
};
