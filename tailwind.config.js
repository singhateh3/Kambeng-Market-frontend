/** @type {import('tailwindcss').Config} */
export default {
    // Theme is toggled explicitly (see src/context/ThemeContext.jsx) rather
    // than following the OS's prefers-color-scheme, so dark mode only
    // activates when a `dark` class is present on <html>.
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            // Design-system note: the app has historically mixed the `slate`
            // and `gray` neutral scales page-to-page. `slate` is the standard
            // going forward — it's what Layout.jsx, Modal.jsx, and most of
            // the Orders/Products pages already use, and it's a closer match
            // to the app's cool-toned surfaces than `gray`. New shared
            // components (Button, Alert, Input, Spinner, Skeleton) have been
            // updated to `slate` as of the dark-mode foundation work; existing
            // page-specific `gray-*` usage is untouched for now — that sweep
            // is a separate, later pass, not part of this phase.
            colors: {
                primary: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                    950: '#052e16',
                },
            },
        },
    },
    plugins: [],
}