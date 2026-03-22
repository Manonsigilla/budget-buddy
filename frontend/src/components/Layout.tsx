import React from 'react';
import Navbar from './Navbar';
import AlertBar from './AlertBar';

interface LayoutProps {
    children: React.ReactNode;
    userBalance?: number;
}

export default function Layout({ children, userBalance = 0 }: LayoutProps) {
    return (
        <>
            <Navbar />
            {userBalance !== undefined && <AlertBar userBalance={userBalance} />}
            {children}
        </>
    );
}