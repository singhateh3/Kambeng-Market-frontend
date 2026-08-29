// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Social accounts are not yet set up for Kambeng Market — no URLs exist
// anywhere in the project/config. Rather than invent handles, each entry's
// `href` stays null and the link renders as a disabled, clearly-labelled
// placeholder. Fill in a real URL here once an account exists and the icon
// becomes a live link automatically.
const SOCIAL_LINKS = [
    {
        name: 'Facebook',
        href: null,
        icon: (
            <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z" />
        ),
    },
    {
        name: 'Instagram',
        href: null,
        icon: (
            <path d="M12 2c2.72 0 3.06.01 4.12.06 1.07.05 1.79.22 2.43.46.66.26 1.21.6 1.76 1.15.5.5.87 1.04 1.15 1.76.24.64.41 1.36.46 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.07-.22 1.79-.46 2.43a4.9 4.9 0 01-1.15 1.76 4.9 4.9 0 01-1.76 1.15c-.64.24-1.36.41-2.43.46-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.07-.05-1.79-.22-2.43-.46a4.9 4.9 0 01-1.76-1.15 4.9 4.9 0 01-1.15-1.76c-.24-.64-.41-1.36-.46-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.07.22-1.79.46-2.43.26-.66.6-1.21 1.15-1.76A4.9 4.9 0 015.43 2.5c.64-.24 1.36-.41 2.43-.46C8.94 2.01 9.28 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zm5.2-8.4a1.17 1.17 0 100-2.33 1.17 1.17 0 000 2.33z" />
        ),
    },
    {
        name: 'X (Twitter)',
        href: null,
        icon: (
            <path d="M18.24 3H21l-6.55 7.49L22.2 21h-6.77l-5.3-6.94L4.02 21H1.25l7.02-8.03L1 3h6.94l4.79 6.34L18.24 3zm-1.19 16.2h1.5L7.02 4.72H5.4l11.65 14.48z" />
        ),
    },
];

const socialIconClass =
    'w-9 h-9 flex items-center justify-center rounded-lg transition ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900';

export const Footer = () => {
    const { isAuthenticated } = useAuth();

    const columns = [
        {
            title: 'Platform',
            links: [
                { label: 'Browse products', to: isAuthenticated ? '/app/browse' : '/login' },
            ],
        },
        {
            title: 'Farmers',
            links: [
                { label: 'Join as farmer', to: '/register' },
            ],
        },
    ];

    return (
        // Deliberately bg-slate-900 in both light and dark theme — a fixed
        // branded dark surface, same treatment as Home's CTA banner. No
        // dark: variants below since the surface itself never changes; the
        // text tones are picked for AA contrast against slate-900 specifically.
        <footer className="bg-slate-900 px-6 pt-12 pb-8">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-8 sm:gap-8 mb-10">
                    {/* Brand */}
                    <div className="col-span-2 sm:col-span-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">🌾</span>
                            <span className="font-extrabold text-white">Kambeng Market</span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed max-w-[200px] break-words">
                            Connecting Gambian farmers directly with hotels, restaurants, and caterers.
                        </p>
                    </div>

                    {/* Platform / Farmers link columns */}
                    {columns.map((col, i) => (
                        <div key={i} className="min-w-0">
                            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">{col.title}</h4>
                            <ul className="space-y-2.5 list-none p-0 m-0">
                                {col.links.map((l, j) => (
                                    <li key={j}>
                                        <Link
                                            to={l.to}
                                            className="text-slate-400 text-xs no-underline hover:text-slate-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded"
                                        >
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact */}
                    <div className="min-w-0">
                        <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Contact</h4>
                        <ul className="space-y-2.5 list-none p-0 m-0">
                            {['📧 info@kambeng.com', '📞 +220 700 0000', '📍 Banjul, The Gambia'].map((item, i) => (
                                <li key={i} className="text-slate-400 text-xs break-words">{item}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Social */}
                    <div className="min-w-0">
                        <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Social</h4>
                        <div className="flex flex-wrap gap-2">
                            {SOCIAL_LINKS.map((social) =>
                                social.href ? (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.name}
                                        title={social.name}
                                        className={`${socialIconClass} bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white`}
                                    >
                                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                                            {social.icon}
                                        </svg>
                                    </a>
                                ) : (
                                    <button
                                        key={social.name}
                                        type="button"
                                        disabled
                                        aria-label={`${social.name} — coming soon`}
                                        title={`${social.name} — coming soon`}
                                        className={`${socialIconClass} bg-slate-800/60 text-slate-600 cursor-not-allowed border-none`}
                                    >
                                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                                            {social.icon}
                                        </svg>
                                    </button>
                                )
                            )}
                        </div>
                        <p className="text-slate-500 text-[11px] mt-2 leading-relaxed">Coming soon</p>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-slate-400 text-xs">© {new Date().getFullYear()} Kambeng Market. All rights reserved.</p>
                    <p className="text-slate-400 text-xs">Made in 🇬🇲 The Gambia</p>
                </div>
            </div>
        </footer>
    );
};
