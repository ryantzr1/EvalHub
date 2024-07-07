import React from 'react';
import Navbar from '@/components/Navbar';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;