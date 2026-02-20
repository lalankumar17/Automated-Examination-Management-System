import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserRouter, Route, Routes, useLocation, Navigate } from 'react-router-dom';

// Components (Pages)
import DashboardPage from './Pages/Dashboard/DashboardPage'

import Menubar from './Components/Menubar';
import Alert from './Components/Alert';
import Confirm from './Components/Confirm';
import NotFound from './Pages/NotFound/NotFound';
import SettingsPage, { changeTheme, changeAccent } from './Pages/Settings/SettingsPage';
import ExamTimetablePage from './Pages/ExamTimetable/ExamTimetablePage';
import PublishedTimetablePage from './Pages/ExamTimetable/PublishedTimetablePage';
import AboutUsPage from './Pages/AboutUs/AboutUsPage';
import LoginPage from './Pages/Login/LoginPage';
import ForgotPasswordPage from './Pages/Login/ForgotPasswordPage';
import RegisterPage from './Pages/Login/RegisterPage';

import ProfilePage from './Pages/Profile/ProfilePage';
import DocsPage from './Pages/Docs/DocsPage';

// Styles
import './App.css'
import "./Style/BasicComponents.css"
import "./Style/UnifiedPages.css"



// Contexts
import { AlertProvider } from './Components/AlertContextProvider';
import { ConfirmProvider } from './Components/ConfirmContextProvider';
import { AuthProvider, useAuth } from './Components/AuthContext';
import { NotificationProvider } from './Components/NotificationContext';

function ProtectedRoute({ children }) {
	const { user, loading } = useAuth();

	if (loading) return null; // Wait for auth check

	if (!user) {
		return <Navigate to="/login" replace />;
	}
	return children;
}

function App() {
	return (
		<AlertProvider>
			<ConfirmProvider>
				<AuthProvider>
					<NotificationProvider>
						<BrowserRouter>
							<MainApp />
						</BrowserRouter>
					</NotificationProvider>
				</AuthProvider>
			</ConfirmProvider>
		</AlertProvider>
	)
}

function MainApp() {
	const app = useRef(null)
	const location = useLocation();
	const { user, loading } = useAuth();
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

	const isPublicPage = location.pathname === '/login' || location.pathname === '/forgot-password';
	const shouldShowLayout = user && !isPublicPage;


	const restorePageFocus = useCallback(() => {
		// Delay focus until after React re-renders and overlay is removed
		setTimeout(() => {
			if (document.activeElement) {
				document.activeElement.blur();
			}

			const mainContainer = document.querySelector('.main-container');
			const isMobile = window.innerWidth <= 800;

			if (isMobile) {
				// Focus body for native scrolling on mobile
				document.body.focus();
			} else if (mainContainer) {
				mainContainer.focus({ preventScroll: true });
			}
		}, 300);
	}, []);

	useEffect(() => {
		function autoToggleInResize() {
			if (window.innerWidth <= 1250) {
				if (app.current)
					app.current.classList.add("active");
			} else {
				if (app.current)
					app.current.classList.remove("active");
			}
			// Close mobile sidebar when resizing to desktop
			if (window.innerWidth > 800) {
				setMobileSidebarOpen(false);
			}
		}

		if (shouldShowLayout) {
			autoToggleInResize();
			window.addEventListener("resize", () => {
				autoToggleInResize()
			})
		}

		// Initialize Theme from LocalStorage
		const savedTheme = localStorage.getItem('theme') || 'Light';
		changeTheme(savedTheme);

		// Initialize Accent Color from LocalStorage
		const savedAccent = localStorage.getItem('accentColor') || '#2563eb';
		changeAccent(savedAccent);

		return () => {
			if (shouldShowLayout) {
				window.removeEventListener("resize", () => {
					autoToggleInResize()
				})
			}
		}
	}, [shouldShowLayout]);



	function openMobileSidebar() {
		setMobileSidebarOpen(true);
		if (app.current) {
			app.current.classList.remove("active");
		}
		// Add CSS class to lock body scroll (works on all mobile browsers)
		document.body.classList.add('sidebar-open');
	}

	function closeMobileSidebar() {
		setMobileSidebarOpen(false);
		if (app.current) {
			app.current.classList.add("active");
		}
		// Remove scroll lock
		document.body.classList.remove('sidebar-open');
		restorePageFocus();
	}



	function handleMenuToggle() {
		// If on mobile and sidebar is open, sync state to close it properly (remove overlay)
		if (mobileSidebarOpen) {
			setMobileSidebarOpen(false);
			document.body.classList.remove('sidebar-open'); // Ensure scroll lock is removed
			restorePageFocus();
		}
	}

	if (loading) return null;

	return (
		<div className={`app light ${!shouldShowLayout ? 'login-layout' : ''}`} ref={app} style={!shouldShowLayout ? { display: 'block' } : {}}>
			<Alert />
			<Confirm />
			{shouldShowLayout && <Menubar onMenuToggleClick={handleMenuToggle} />}

			{/* Mobile sidebar overlay */}
			{shouldShowLayout && mobileSidebarOpen && (
				<div className="mobile-sidebar-overlay" onClick={closeMobileSidebar} />
			)}

			{/* Hamburger button for mobile */}
			{shouldShowLayout && (
				<button
					className="hamburger-btn"
					onClick={openMobileSidebar}
					aria-label="Open sidebar"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<line x1="3" y1="6" x2="21" y2="6"></line>
						<line x1="3" y1="12" x2="21" y2="12"></line>
						<line x1="3" y1="18" x2="21" y2="18"></line>
					</svg>
				</button>
			)}

			<div className={shouldShowLayout ? 'main-container' : ''} tabIndex="-1" style={shouldShowLayout ? { outline: 'none' } : {}}>
				<Routes>
					<Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/forgot-password" element={<ForgotPasswordPage />} />

					<Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
					<Route path="/ExamTimetable" element={<ProtectedRoute><ExamTimetablePage /></ProtectedRoute>} />
					<Route path="/ViewTimetable" element={<ProtectedRoute><PublishedTimetablePage /></ProtectedRoute>} />
					<Route path="/Settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
					<Route path="/Profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
					<Route path="/Docs" element={<ProtectedRoute><DocsPage /></ProtectedRoute>} />
					<Route path="/AboutUs" element={<ProtectedRoute><AboutUsPage /></ProtectedRoute>} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</div>
		</div>
	)
}

export default App
