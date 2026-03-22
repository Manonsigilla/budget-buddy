import React, { useEffect, useState } from 'react';
import '../styles/components/alert-bar.css';

interface AlertBarProps {
    userBalance: number;
    warningThreshold?: number;
}

type AlertType = 'normal' | 'warning' | 'danger';

export default function AlertBar({ userBalance, warningThreshold = 100 }: AlertBarProps) {
    const [alertType, setAlertType] = useState<AlertType>('normal');
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    useEffect(() => {
        if (userBalance < 0) {
            setAlertType('danger');
            setAlertMessage(`Compte en découvert : ${Math.abs(userBalance).toFixed(2)} €`);
        } else if (userBalance < warningThreshold) {
            setAlertType('warning');
            setAlertMessage(`Solde faible : ${userBalance.toFixed(2)} € restant`);
        } else {
            setAlertType('normal');
            setAlertMessage(null);
        }
    }, [userBalance, warningThreshold]);

    if (!alertMessage) {
        return null;
    }

    return (
        <div className={`alert-bar alert-${alertType}`}>
            <div className="alert-content">
                <i className={`fas fa-${alertType === 'danger' ? 'exclamation-circle' : 'exclamation-triangle'}`}></i>
                <span className="alert-message">{alertMessage}</span>
            </div>
        </div>
    );
}