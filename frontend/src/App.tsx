import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import AlertBar from './components/AlertBar';
import Login from './components/login';
import Register from './components/register';
import Dashboard from './components/dashboard';
import ProfilePage from './pages/ProfilePage';
import TransfersPage from './pages/TransfersPage';
import SettingsPage from './pages/SettingsPage';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';

function AppContent() {
    const { user } = useAuth();
    const location = useLocation();

    const showAlertBar = location.pathname !== '/login' && location.pathname !== '/register' && user;

    return (
        <>
            <Navbar />
            {showAlertBar && <AlertBar userBalance={user?.balance || 0} />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/transfers" element={<PrivateRoute><TransfersPage /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <AppContent />
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;