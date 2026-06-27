// src/components/Layout.jsx
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from './NotificationBell';

export const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isFarmer = user?.role === 'farmer';
    const isBuyer = user?.role === 'buyer';
    const isAdmin = user?.role === 'admin';
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const navLink = (to, label) => (
        <Link
            to={to}
            style={{
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                color: isActive(to) ? '#16a34a' : '#475569',
                background: isActive(to) ? '#f0fdf4' : 'transparent',
                transition: 'all 0.15s ease',
            }}
        >
            {label}
        </Link>
    );

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", minHeight: '100vh', background: '#f8fafc' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                .nav-link:hover { color: #16a34a !important; background: #f0fdf4 !important; }
                .profile-menu-item:hover { background: #f0fdf4; color: #16a34a !important; }
                .logout-item:hover { background: #fef2f2; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            {/* Navbar */}
            <nav style={{
                background: '#fff',
                borderBottom: '1px solid #e2e8f0',
                position: 'sticky', top: 0, zIndex: 100,
            }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 24 }}>

                    {/* Logo */}
                    <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 20 }}>🌾</span>
                        <span style={{ fontWeight: 800, fontSize: 17, color: '#15803d', letterSpacing: '-0.5px' }}>Kambeng</span>
                        <span style={{ fontWeight: 400, fontSize: 17, color: '#94a3b8' }}>Market</span>
                    </Link>

                    {/* Nav links */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {navLink('/app/dashboard', 'Dashboard')}
                        {isFarmer && navLink('/app/products', 'My Products')}
                        {isBuyer && navLink('/app/browse', 'Browse')}
                        {navLink('/app/orders', 'Orders')}
                        {isAdmin && navLink('/app/admin/dashboard', 'Admin')}
                    </div>

                    {/* Right side */}
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Delivery badge */}
                        <span style={{
                            display: 'none',
                            fontSize: 12, color: '#64748b',
                            background: '#f8fafc', border: '1px solid #e2e8f0',
                            padding: '4px 10px', borderRadius: 20
                        }}>
                            🚚 Free delivery over GMD 500
                        </span>

                        <NotificationBell />

                        {/* Profile dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
                                    borderRadius: 8,
                                }}
                            >
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: '#dcfce7', color: '#16a34a',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 13, fontWeight: 700, flexShrink: 0
                                }}>
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
                                    {user?.name?.split(' ')[0] || 'Account'}
                                </span>
                                <svg style={{ width: 14, height: 14, color: '#94a3b8', transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {menuOpen && (
                                <div style={{
                                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                                    width: 220, background: '#fff',
                                    border: '1.5px solid #e2e8f0', borderRadius: 12,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 200,
                                    overflow: 'hidden'
                                }}>
                                    {/* User info */}
                                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                                        <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{user?.name}</p>
                                        <p style={{ fontSize: 12, color: '#94a3b8' }}>{user?.email}</p>
                                    </div>

                                    {/* Menu items */}
                                    {[
                                        { icon: '👤', label: 'My Profile', to: '/app/profile' },
                                        isFarmer && { icon: '🌾', label: 'My Products', to: '/app/products' },
                                        isBuyer && { icon: '🛒', label: 'My Orders', to: '/app/orders' },
                                        isAdmin && { icon: '📊', label: 'Admin Dashboard', to: '/app/admin/dashboard' },
                                    ].filter(Boolean).map((item, i) => (
                                        <Link
                                            key={i}
                                            to={item.to}
                                            className="profile-menu-item"
                                            onClick={() => setMenuOpen(false)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 10,
                                                padding: '10px 16px', textDecoration: 'none',
                                                color: '#374151', fontSize: 13, fontWeight: 500,
                                                transition: 'background 0.1s'
                                            }}
                                        >
                                            <span>{item.icon}</span>
                                            <span>{item.label}</span>
                                        </Link>
                                    ))}

                                    <div style={{ borderTop: '1px solid #f1f5f9' }}>
                                        <button
                                            className="logout-item"
                                            onClick={() => { setMenuOpen(false); handleLogout(); }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 10,
                                                width: '100%', padding: '10px 16px', background: 'none',
                                                border: 'none', cursor: 'pointer', color: '#dc2626',
                                                fontSize: 13, fontWeight: 500, textAlign: 'left',
                                                transition: 'background 0.1s'
                                            }}
                                        >
                                            <span>🚪</span>
                                            <span>Log out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page content */}
            <main style={{ maxWidth: 1100, margin: '0 auto', padding: '0' }}>
                <Outlet />
            </main>
        </div>
    );
};
