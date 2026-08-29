// src/components/ThemeToggle.jsx
//
// Two render modes sharing the same toggle logic:
//  - variant="icon" (default): a circular icon-only button, sized to match
//    Layout.jsx's other header icon buttons (hamburger, bell). For the
//    desktop navbar.
//  - variant="row": a full-width labelled row matching mobileNavLink()'s
//    styling in Layout.jsx. For the mobile stacked nav panel, where an
//    unlabelled icon button would be inconsistent with the rest of the menu.
import { useTheme } from '../context/ThemeContext';

const SunIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364l-1.414-1.414M7.05 7.05L5.636 5.636m12.728 0l-1.414 1.414M7.05 16.95l-1.414 1.414M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

export const ThemeToggle = ({ variant = 'icon', className = '' }) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

    if (variant === 'row') {
        return (
            <button
                type="button"
                onClick={toggleTheme}
                aria-pressed={isDark}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-bold tracking-tight text-slate-600 hover:text-green-700 hover:bg-green-50 transition-all duration-150 bg-transparent border-none cursor-pointer ${className}`}
            >
                {isDark ? <SunIcon className="w-4 h-4 flex-shrink-0" /> : <MoonIcon className="w-4 h-4 flex-shrink-0" />}
                {isDark ? 'Light mode' : 'Dark mode'}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={label}
            aria-pressed={isDark}
            title={label}
            className={`flex items-center justify-center w-9 h-9 rounded-full text-slate-600 hover:bg-slate-50 transition bg-transparent border-none cursor-pointer flex-shrink-0 ${className}`}
        >
            {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </button>
    );
};
