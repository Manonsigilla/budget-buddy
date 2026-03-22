import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/components/navbar.css';

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        navigate('/login');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setIsUserMenuOpen(false);
    };

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    💰 BudgetBuddy
                </Link>

                <ul className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
                    {!isAuthenticated && (
                        <>
                            <li>
                                <Link to="/" onClick={closeMobileMenu}>
                                    Accueil
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" onClick={closeMobileMenu}>
                                    Connexion
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" onClick={closeMobileMenu}>
                                    Inscription
                                </Link>
                            </li>
                        </>
                    )}

                    {isAuthenticated && (
                        <>
                            <li>
                                <Link to="/dashboard" onClick={closeMobileMenu}>
                                    Tableau de bord
                                </Link>
                            </li>
                            <li>
                                <Link to="/transfers" onClick={closeMobileMenu}>
                                    Virements
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile" onClick={closeMobileMenu}>
                                    Profil
                                </Link>
                            </li>
                        </>
                    )}
                </ul>

                <ul className="navbar-actions">
                    <li>
                        <ThemeToggle />
                    </li>

                    {isAuthenticated && (
                        <li className="user-profile" onClick={toggleUserMenu}>
                            <div className="user-avatar">
                                {user?.first_name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="hide-mobile">{user?.first_name}</span>

                            <ul className={`user-menu ${isUserMenuOpen ? 'active' : ''}`}>
                                <li>
                                    <Link to="/profile" onClick={() => setIsUserMenuOpen(false)}>
                                        Mon profil
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/settings" onClick={() => setIsUserMenuOpen(false)}>
                                        Paramètres
                                    </Link>
                                </li>
                                <li>
                                    <a href="#" className="danger" onClick={(e) => {
                                        e.preventDefault();
                                        handleLogout();
                                    }}>
                                        Déconnexion
                                    </a>
                                </li>
                            </ul>
                        </li>
                    )}
                </ul>

                <button
                    className={`burger-menu ${isMobileMenuOpen ? 'active' : ''}`}
                    onClick={toggleMobileMenu}
                    aria-label="Menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    );
}