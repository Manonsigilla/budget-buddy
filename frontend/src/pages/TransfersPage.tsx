import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFilteredTransfers } from '../hooks/useFilteredTransfers';
import TransferFilter from '../components/TransferFilter';
import '../styles/pages/transfers.css';

export default function TransfersPage() {
    const { user } = useAuth();
    const { transfers, isLoading: transfersLoading, applyFilters, resetFilters } = useFilteredTransfers();

    useEffect(() => {
        resetFilters();
    }, [resetFilters]);

    if (!user) {
        return <div className="transfers-loading">Chargement...</div>;
    }

    return (
        <div className="transfers-page">
            <div className="transfers-container">
                <h1>Historique des Virements</h1>

                <TransferFilter
                    onApplyFilters={applyFilters}
                    onResetFilters={resetFilters}
                    isLoading={transfersLoading}
                />

                <div className="card card-glass transfers-card">
                    {transfersLoading ? (
                        <p className="empty-state">
                            <i className="fas fa-spinner fa-spin"></i>
                            Chargement des virements...
                        </p>
                    ) : transfers.length === 0 ? (
                        <p className="empty-state">
                            <i className="fas fa-inbox"></i>
                            Aucun virement pour le moment
                        </p>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Montant</th>
                                        <th>Statut</th>
                                        <th>Date</th>
                                        <th>De/Vers</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transfers.map((transfer: any, index: number) => (
                                        <tr key={index}>
                                            <td>#{transfer.id}</td>
                                            <td className={`amount ${transfer.sender_id === user.id ? 'sent' : 'received'}`}>
                                                {transfer.sender_id === user.id ? '-' : '+'}
                                                {parseFloat(transfer.amount).toFixed(2)} €
                                            </td>
                                            <td>
                                                <span className={`status-badge ${transfer.status}`}>
                                                    {transfer.status}
                                                </span>
                                            </td>
                                            <td>{new Date(transfer.created_at).toLocaleDateString('fr-FR')}</td>
                                            <td>
                                                {transfer.sender_id === user.id 
                                                    ? `vers ${transfer.receiver_first} ${transfer.receiver_last}`
                                                    : `de ${transfer.sender_first} ${transfer.sender_last}`
                                                }
                                            </td>
                                            <td>{transfer.description || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}