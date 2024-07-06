import React from 'react';
import Navbar from '@/components/Navbar';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white  shadow">
                <div className="container mx-auto px-4 py-4">
                    <Navbar />
                </div>
            </header>
            <main className="flex-grow container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;