// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export const Home = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchHomeData();
    }, []);

    const fetchHomeData = async () => {
        try {
            setLoading(true);
            const [productsRes, categoriesRes, statsRes] = await Promise.all([
                api.get('/products?limit=8&sort_by=created_at&sort_order=desc'),
                api.get('/products/categories'),
                api.get('/public/statistics').catch(() => ({ data: { data: null } })),
            ]);
            setFeaturedProducts(productsRes.data?.data || []);
            setCategories(categoriesRes.data?.data || []);
            setStats(statsRes.data?.data || null);
        } catch (error) {
            console.error('Error fetching home data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(isAuthenticated ? `/browse?search=${encodeURIComponent(searchQuery)}` : '/login');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 48, height: 48, border: '3px solid #e2e8f0',
                        borderTop: '3px solid #16a34a', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
                    }} />
                    <p style={{ color: '#64748b', fontSize: 14 }}>Loading fresh produce...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                .product-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.10) !important; }
                .product-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
                .cat-pill:hover { background: #dcfce7 !important; border-color: #16a34a !important; color: #15803d !important; }
                .cat-pill { transition: all 0.15s ease; }
                .order-btn:hover { background: #15803d !important; }
                .order-btn { transition: background 0.15s ease; }
                .search-btn:hover { background: #15803d !important; }
                .nav-link:hover { color: #16a34a !important; }
                ::-webkit-scrollbar { height: 4px; } 
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            `}</style>

            {/* Topbar */}
            <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 24 }}>
                    {/* Logo */}
                    <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 22 }}>🌾</span>
                        <span style={{ fontWeight: 800, fontSize: 18, color: '#15803d', letterSpacing: '-0.5px' }}>Kambeng</span>
                        <span style={{ fontWeight: 400, fontSize: 18, color: '#64748b' }}>Market</span>
                    </Link>

                    {/* Search bar inline */}
                    <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480 }}>
                        <div style={{ position: 'relative' }}>
                            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search produce, farmers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%', padding: '8px 12px 8px 36px',
                                    border: '1.5px solid #e2e8f0', borderRadius: 8,
                                    fontSize: 14, outline: 'none', background: '#f8fafc',
                                    color: '#1e293b'
                                }}
                            />
                        </div>
                    </form>

                    {/* Nav */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto', flexShrink: 0 }}>
                        {!isAuthenticated ? (
                            <>
                                <Link to="/login" className="nav-link" style={{ textDecoration: 'none', color: '#475569', fontSize: 14, fontWeight: 500 }}>Sign in</Link>
                                <Link to="/register" style={{
                                    textDecoration: 'none', background: '#16a34a', color: '#fff',
                                    padding: '7px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600
                                }}>Get started</Link>
                            </>
                        ) : (
                            <Link to="/dashboard" style={{
                                textDecoration: 'none', background: '#f0fdf4', color: '#16a34a',
                                padding: '7px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                                border: '1.5px solid #bbf7d0'
                            }}>Dashboard</Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Hero */}
            <section style={{ background: '#fff', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
                    <div style={{ animation: 'fadeUp 0.5s ease both' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: '#f0fdf4', color: '#16a34a', padding: '4px 12px',
                            borderRadius: 20, fontSize: 12, fontWeight: 600,
                            marginBottom: 20, border: '1px solid #bbf7d0'
                        }}>
                            <span style={{ width: 6, height: 6, background: '#16a34a', borderRadius: '50%', display: 'inline-block' }} />
                            Fresh from Gambian farms
                        </div>
                        <h1 style={{ fontSize: 44, fontWeight: 800, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-1.5px', marginBottom: 16 }}>
                            Farm-fresh produce,<br />
                            <span style={{ color: '#16a34a' }}>no middlemen.</span>
                        </h1>
                        <p style={{ fontSize: 17, color: '#64748b', lineHeight: 1.65, marginBottom: 32, maxWidth: 420 }}>
                            Order directly from verified Gambian farmers. Fair prices for buyers, fair pay for farmers.
                        </p>

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {!isAuthenticated ? (
                                <>
                                    <button onClick={() => navigate('/register')} style={{
                                        background: '#16a34a', color: '#fff', border: 'none',
                                        padding: '12px 28px', borderRadius: 8, fontSize: 15,
                                        fontWeight: 700, cursor: 'pointer'
                                    }}>
                                        Start buying
                                    </button>
                                    <button onClick={() => navigate('/login')} style={{
                                        background: '#f8fafc', color: '#374151', border: '1.5px solid #e2e8f0',
                                        padding: '12px 28px', borderRadius: 8, fontSize: 15,
                                        fontWeight: 600, cursor: 'pointer'
                                    }}>
                                        Sign in
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => navigate('/dashboard')} style={{
                                    background: '#16a34a', color: '#fff', border: 'none',
                                    padding: '12px 28px', borderRadius: 8, fontSize: 15,
                                    fontWeight: 700, cursor: 'pointer'
                                }}>
                                    Go to dashboard
                                </button>
                            )}
                        </div>

                        {/* Delivery badge */}
                        <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13 }}>
                            <span>🚚</span>
                            <span>Free delivery on orders over <strong style={{ color: '#0f172a' }}>GMD 500</strong></span>
                        </div>
                    </div>

                    {/* Stats panel */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, animation: 'fadeUp 0.5s 0.1s ease both', opacity: 0, animationFillMode: 'forwards' }}>
                        {[
                            { emoji: '🥬', label: 'Fresh products', value: stats?.products?.active ?? '50+' },
                            { emoji: '👨‍🌾', label: 'Verified farmers', value: stats?.users?.farmers ?? '20+' },
                            { emoji: '📦', label: 'Orders placed', value: stats?.orders?.total ?? '100+' },
                            { emoji: '⭐', label: 'Avg. rating', value: stats?.reviews?.average_rating ? `${Number(stats.reviews.average_rating).toFixed(1)}` : '4.8' },
                        ].map((s, i) => (
                            <div key={i} style={{
                                background: '#f8fafc', border: '1.5px solid #e2e8f0',
                                borderRadius: 12, padding: '20px 20px',
                            }}>
                                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.emoji}</div>
                                <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>{s.value}</div>
                                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            {categories.length > 0 && (
                <section style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '28px 0' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Shop by category</h2>
                            <Link to={isAuthenticated ? '/browse' : '/login'} style={{ fontSize: 13, color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>
                                All categories →
                            </Link>
                        </div>
                        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                            {categories.slice(0, 14).map((cat, i) => (
                                <Link
                                    key={i}
                                    to={isAuthenticated ? `/browse?category=${cat}` : '/login'}
                                    className="cat-pill"
                                    style={{
                                        textDecoration: 'none', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '7px 14px', borderRadius: 20,
                                        border: '1.5px solid #e2e8f0', background: '#f8fafc',
                                        fontSize: 13, fontWeight: 500, color: '#374151'
                                    }}
                                >
                                    <span>{getCategoryIcon(cat)}</span>
                                    <span>{cat}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Products */}
            <section style={{ padding: '40px 0' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>Featured products</h2>
                            <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Freshly listed by farmers near you</p>
                        </div>
                        <Link to={isAuthenticated ? '/browse' : '/login'} style={{ fontSize: 13, color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>
                            View all →
                        </Link>
                    </div>

                    {featuredProducts.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 12, border: '1.5px dashed #e2e8f0' }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>🌾</div>
                            <p style={{ color: '#64748b', fontSize: 15 }}>No products listed yet.</p>
                            {isAuthenticated && user?.role === 'farmer' && (
                                <Link to="/products/create" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600, fontSize: 14, marginTop: 8, display: 'inline-block' }}>
                                    List your first product →
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Why Kambeng */}
            <section style={{ background: '#fff', padding: '56px 0', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 36, letterSpacing: '-0.5px' }}>
                        Why Kambeng Market?
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                        {[
                            { icon: '🌱', title: 'Straight from the farm', desc: 'No cold storage, no middlemen. Produce moves from farm to you within 24 hours.' },
                            { icon: '💰', title: 'Farmers earn more', desc: 'Farmers set their own prices and keep the majority of every sale.' },
                            { icon: '✅', title: 'Verified listings', desc: 'Every farmer is verified. Every product listing is reviewed before going live.' },
                        ].map((item, i) => (
                            <div key={i} style={{ padding: '24px', background: '#f8fafc', borderRadius: 12, border: '1.5px solid #e2e8f0' }}>
                                <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{item.title}</h3>
                                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section style={{ background: '#16a34a', padding: '56px 24px' }}>
                <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
                    {!isAuthenticated ? (
                        <>
                            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 12 }}>
                                Ready to buy fresh?
                            </h2>
                            <p style={{ color: '#bbf7d0', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
                                Create a free account and start ordering directly from Gambian farmers today.
                            </p>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button onClick={() => navigate('/register')} style={{
                                    background: '#fff', color: '#16a34a', border: 'none',
                                    padding: '12px 28px', borderRadius: 8, fontSize: 15,
                                    fontWeight: 700, cursor: 'pointer'
                                }}>Create account</button>
                                <button onClick={() => navigate('/login')} style={{
                                    background: 'transparent', color: '#fff',
                                    border: '1.5px solid rgba(255,255,255,0.4)',
                                    padding: '12px 28px', borderRadius: 8, fontSize: 15,
                                    fontWeight: 600, cursor: 'pointer'
                                }}>Sign in</button>
                            </div>
                        </>
                    ) : user?.role === 'farmer' ? (
                        <>
                            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 12 }}>List your produce</h2>
                            <p style={{ color: '#bbf7d0', fontSize: 15, marginBottom: 28 }}>Reach hotels, restaurants and caterers across The Gambia.</p>
                            <button onClick={() => navigate('/products/create')} style={{
                                background: '#fff', color: '#16a34a', border: 'none',
                                padding: '12px 28px', borderRadius: 8, fontSize: 15,
                                fontWeight: 700, cursor: 'pointer'
                            }}>Add a product</button>
                        </>
                    ) : (
                        <>
                            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 12 }}>Browse today's listings</h2>
                            <p style={{ color: '#bbf7d0', fontSize: 15, marginBottom: 28 }}>Fresh produce added daily by farmers across The Gambia.</p>
                            <button onClick={() => navigate('/browse')} style={{
                                background: '#fff', color: '#16a34a', border: 'none',
                                padding: '12px 28px', borderRadius: 8, fontSize: 15,
                                fontWeight: 700, cursor: 'pointer'
                            }}>Browse products</button>
                        </>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: '#0f172a', padding: '48px 24px 32px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <span style={{ fontSize: 20 }}>🌾</span>
                                <span style={{ fontWeight: 800, color: '#fff', fontSize: 16 }}>Kambeng Market</span>
                            </div>
                            <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.7, maxWidth: 240 }}>
                                Connecting Gambian farmers directly with hotels, restaurants, and caterers.
                            </p>
                        </div>
                        {[
                            { title: 'Platform', links: [{ label: 'Browse products', to: isAuthenticated ? '/browse' : '/login' }, { label: 'About us', to: '/about' }, { label: 'Contact', to: '/contact' }] },
                            { title: 'Farmers', links: [{ label: 'Join as farmer', to: '/register' }, { label: 'Farmer guide', to: '/help/farmer' }, { label: 'Pricing', to: '/help/pricing' }] },
                        ].map((col, i) => (
                            <div key={i}>
                                <h4 style={{ color: '#fff', fontWeight: 600, fontSize: 13, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{col.title}</h4>
                                <ul style={{ listStyle: 'none' }}>
                                    {col.links.map((l, j) => (
                                        <li key={j} style={{ marginBottom: 10 }}>
                                            <Link to={l.to} style={{ color: '#64748b', textDecoration: 'none', fontSize: 13 }}>{l.label}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        <div>
                            <h4 style={{ color: '#fff', fontWeight: 600, fontSize: 13, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</h4>
                            <ul style={{ listStyle: 'none' }}>
                                {['📧 info@kambeng.com', '📞 +220 700 0000', '📍 Banjul, The Gambia'].map((item, i) => (
                                    <li key={i} style={{ color: '#64748b', fontSize: 13, marginBottom: 10 }}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid #1e293b', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ color: '#475569', fontSize: 12 }}>© {new Date().getFullYear()} Kambeng Market. All rights reserved.</p>
                        <p style={{ color: '#475569', fontSize: 12 }}>Made in 🇬🇲 The Gambia</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Product Card
const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleClick = () => navigate(isAuthenticated ? `/app/products/${product.id}` : '/login');
    const handleOrder = (e) => {
        e.stopPropagation();
        navigate(isAuthenticated ? `/app/place-order/${product.id}` : '/login');
    };

    return (
        <div className="product-card" onClick={handleClick} style={{
            background: '#fff', borderRadius: 12, border: '1.5px solid #e2e8f0',
            overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
        }}>
            {/* Image */}
            <div style={{ position: 'relative', height: 148, background: '#f1f5f9' }}>
                {product.photos?.length > 0 ? (
                    <img
                        src={product.photos[0]}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
                        {getCategoryIcon(product.category)}
                    </div>
                )}
                {product.is_available && (
                    <span style={{
                        position: 'absolute', top: 8, left: 8,
                        background: '#16a34a', color: '#fff',
                        fontSize: 10, fontWeight: 700, padding: '2px 8px',
                        borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>Fresh</span>
                )}
            </div>

            {/* Info */}
            <div style={{ padding: '12px' }}>
                <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginBottom: 2 }}>
                    {product.farmer?.name || 'Unknown Farmer'}
                </p>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {product.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>{product.price_formatted}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{product.quantity} {product.unit}</span>
                </div>
                <button
                    className="order-btn"
                    onClick={handleOrder}
                    style={{
                        width: '100%', background: '#16a34a', color: '#fff',
                        border: 'none', padding: '8px', borderRadius: 8,
                        fontSize: 13, fontWeight: 600, cursor: 'pointer'
                    }}
                >
                    Place order
                </button>
            </div>
        </div>
    );
};

const getCategoryIcon = (category) => {
    const icons = {
        'Vegetables': '🥬', 'Fruits': '🍎', 'Grains': '🌾',
        'Herbs': '🌿', 'Spices': '🌶️', 'Dairy': '🥛',
        'Meat': '🥩', 'Fish': '🐟', 'Poultry': '🐔',
        'Eggs': '🥚', 'Rice': '🍚', 'Groundnuts': '🥜',
        'Cereals': '🌾', 'Legumes': '🫘', 'Roots': '🥔', 'Tubers': '🍠',
    };
    return icons[category] || '📦';
};
