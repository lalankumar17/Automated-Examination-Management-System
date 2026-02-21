import { memo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

import '../Style/Menubar.css';
import logo from '../../images/logo.png';


const menuData = [
    {
        name: "Home",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
        link: "/"
    },
    {
        name: "Exam Timetable",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
        link: "/ExamTimetable"
    },
    {
        name: "View Timetable",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
        link: "/ViewTimetable"
    },
    {
        name: "Profile",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3" /><circle cx="12" cy="10" r="3" /><circle cx="12" cy="12" r="10" /></svg>,
        link: "/Profile"
    },
    {
        name: "Settings",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
        link: "/Settings"
    },
    {
        name: "Docs",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>,
        link: "/Docs"
    }
]

import { useConfirm } from './ConfirmContextProvider';

const Menubar = ({ onMenuToggleClick = () => { } }) => {
    const route = useLocation()
    const { user, logout } = useAuth()
    const { showConfirm } = useConfirm();


    const [sidebarOpen, setSidebarOpen] = useState(true);

    function toggleMenubar() {
        let activeApp = document.querySelector(".app.active");
        let app = document.querySelector(".app")
        if (app) app.classList.toggle("active")
        if (activeApp) activeApp.classList.remove("active")
        setSidebarOpen(prev => !prev);
        onMenuToggleClick()
    }

    const handleLogout = () => {
        // Close sidebar on mobile before showing confirmation
        if (window.innerWidth <= 800) {
            let app = document.querySelector(".app")
            if (app && !app.classList.contains("active")) {
                app.classList.add("active")
            }
            setSidebarOpen(false);
            onMenuToggleClick();
        }

        showConfirm(
            `Sign out of '${user?.name || user?.username || 'User'}'?`,
            {
                // theme: 'dark', // Removed to use standard VS Code style
                confirmText: 'Sign Out',
                cancelText: 'Cancel',
                onApprove: logout
            }
        );
    };

    return (
        <nav className='menubar-container'>
            <div className='menu-header' style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '1rem' }}>
                <div className='title' style={{ marginBottom: '1.5rem', width: '100%', textAlign: 'center' }}>
                    <Link to="/">
                        <img src={logo} alt="AEMS" className="logo-img" style={{ margin: '1.5rem auto 0.5rem', cursor: 'pointer' }} />
                    </Link>
                </div>
                <div className='toggle-menu' style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 5.5rem 0 1.5rem', width: '100%' }}>
                    <span className="toggle-icon-wrapper" onClick={toggleMenubar} data-tooltip={sidebarOpen ? 'Close sidebar' : 'Open sidebar'} style={{ position: 'relative', display: 'inline-flex', cursor: 'pointer' }}>
                        <svg className='icon' xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                    </span>
                </div>
            </div>

            <div className='menu-list' style={{ width: '100%' }}>

                {menuData.map((menu, index) => {
                    const isActive = route.pathname === menu.link || (menu.link === '/Settings' && route.pathname === '/AboutUs')

                    return (
                        <Link to={menu.link} className={`menu-container ${isActive ? "active" : ""}`} key={index} data-tooltip={menu.name}>
                            <div className='icon-container'>
                                <div className='icon'>{menu.icon}</div>
                            </div>
                            <li className='hide-able'>{menu.name}</li>
                        </Link>
                    )
                })}

                <div className="menubar-footer">
                    <div className="menu-container logout-btn" onClick={handleLogout} data-tooltip="Logout">
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        <li className='hide-able'>Logout</li>
                    </div>
                </div>
            </div>
        </nav >
    )
}

export default memo(Menubar);
