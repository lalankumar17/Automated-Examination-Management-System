import { memo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Components/AuthContext';
import '../../Style/UnifiedPages.css';
import '../../Style/Pages/Settings.css';

// Function to handle global theme changes
export function changeTheme(theme) {
    if (theme === 'Dark') {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
    } else if (theme === 'Light') {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
    } else if (theme === 'System') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.classList.add('dark');
            document.body.classList.remove('light');
        } else {
            document.body.classList.add('light');
            document.body.classList.remove('dark');
        }
    }
    localStorage.setItem('theme', theme);
}

// Function to handle global accent color changes
export function changeAccent(color) {
    document.documentElement.style.setProperty('--userAccentColor', color);
    localStorage.setItem('accentColor', color);
}

function SettingsPage() {
    const { user } = useAuth();
    const [currentTheme, setCurrentTheme] = useState('Light');
    const [currentAccent, setCurrentAccent] = useState('#2563eb');

    const accents = [
        { name: 'Blue', color: '#2563eb' },
        { name: 'Purple', color: '#9333ea' },
        { name: 'Emerald', color: '#10b981' },
        { name: 'Rose', color: '#f43f5e' },
        { name: 'Amber', color: '#f59e0b' }
    ];

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'Light';
        const savedAccent = localStorage.getItem('accentColor') || '#2563eb';
        setCurrentTheme(savedTheme);
        setCurrentAccent(savedAccent);
        changeTheme(savedTheme);
        changeAccent(savedAccent);
    }, []);

    const handleThemeChange = (theme) => {
        setCurrentTheme(theme);
        changeTheme(theme);
    };

    const handleAccentChange = (color) => {
        setCurrentAccent(color);
        changeAccent(color);
    };

    return (
        <div className='page settings-page'>
            <div className='settings-container'>
                <div className='settings-card appearance-card'>
                    <div className='card-header'>
                        <div className='card-header-icon'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                        </div>
                        <div>
                            <h2>Appearance</h2>
                            <p className='card-desc'>Customize the look and feel</p>
                        </div>
                    </div>
                    <div className='theme-switcher'>
                        <button
                            className={`theme-btn ${currentTheme === 'Light' ? 'active' : ''}`}
                            onClick={() => handleThemeChange('Light')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2" />
                                <path d="M12 20v2" />
                                <path d="m4.93 4.93 1.41 1.41" />
                                <path d="m17.66 17.66 1.41 1.41" />
                                <path d="M2 12h2" />
                                <path d="M20 12h2" />
                                <path d="m6.34 17.66-1.41 1.41" />
                                <path d="m19.07 4.93-1.41 1.41" />
                            </svg>
                            <span>Light</span>
                        </button>
                        <button
                            className={`theme-btn ${currentTheme === 'Dark' ? 'active' : ''}`}
                            onClick={() => handleThemeChange('Dark')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                <circle cx="18" cy="5" r="1" fill="currentColor" stroke="none" />
                                <circle cx="20" cy="9" r="0.5" fill="currentColor" stroke="none" />
                            </svg>
                            <span>Dark</span>
                        </button>
                        <button
                            className={`theme-btn ${currentTheme === 'System' ? 'active' : ''}`}
                            onClick={() => handleThemeChange('System')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="3" width="20" height="14" rx="2" />
                                <path d="M8 21h8" />
                                <path d="M12 17v4" />
                                <path d="m7 10 2 2 4-4" />
                            </svg>
                            <span>System</span>
                        </button>
                    </div>
                    <p className='theme-hint'>
                        {currentTheme === 'System' ? (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                    <line x1="8" y1="21" x2="16" y2="21"></line>
                                    <line x1="12" y1="17" x2="12" y2="21"></line>
                                </svg>
                                <span>Syncing with system appearance</span>
                            </>
                        ) : currentTheme === 'Dark' ? (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                                </svg>
                                <span>Dark appearance enabled</span>
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="5"></circle>
                                    <line x1="12" y1="1" x2="12" y2="3"></line>
                                    <line x1="12" y1="21" x2="12" y2="23"></line>
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                    <line x1="1" y1="12" x2="3" y2="12"></line>
                                    <line x1="21" y1="12" x2="23" y2="12"></line>
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                                </svg>
                                <span>Light appearance enabled</span>
                            </>
                        )}
                    </p>
                </div>

                <div className='settings-card combined-card'>
                    <div className='settings-section'>
                        <div className='card-header'>
                            <div className='card-header-icon accent-icon'>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                            </div>
                            <div>
                                <h2>Accent Color</h2>
                                <p className='card-desc'>Select your preferred accent color</p>
                            </div>
                        </div>
                        <div className='accent-picker'>
                            {accents.map((accent) => (
                                <button
                                    key={accent.name}
                                    className={`accent-btn ${currentAccent === accent.color ? 'active' : ''}`}
                                    style={{ '--bg-accent': accent.color }}
                                    onClick={() => handleAccentChange(accent.color)}
                                    title={accent.name}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='settings-divider'></div>

                    <Link to="/AboutUs" className='settings-section about-section-link'>
                        <div className='card-header'>
                            <div className='card-header-icon aboutus-link-icon'>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 16v-4" />
                                    <path d="M12 8h.01" />
                                </svg>
                            </div>
                            <div style={{ flex: 1 }}>
                                <h2>About Us</h2>
                                <p className='card-desc'>Development Team & Contributors</p>
                            </div>
                            <svg className='aboutus-arrow' width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </div>
                    </Link>
                </div>


            </div>
        </div>
    );
}

export default memo(SettingsPage);
