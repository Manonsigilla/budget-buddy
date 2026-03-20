import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/components/theme-toggle.css';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Basculer le mode sombre/clair"
            title={`Passer en mode ${theme === 'light' ? 'sombre' : 'clair'}`}
        >
            <FontAwesomeIcon icon={faSun} className="sun-icon" />
            <FontAwesomeIcon icon={faMoon} className="moon-icon" />
        </button>
    );
}