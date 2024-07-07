"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calculator } from 'lucide-react';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 ${className}`}>
            {children}
        </span>
    );
}

const Navbar = () => {
    const pathname = usePathname();

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <NavigationMenu className="h-16">
                    <NavigationMenuList className="flex items-center h-full space-x-4">
                        <NavigationMenuItem>
                            <Link href="/" legacyBehavior passHref>
                                <NavigationMenuLink className={`${navigationMenuTriggerStyle()} flex items-center`}>
                                    <Home className="w-4 h-4 mr-2" />
                                    Home
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link href="/tokenizer-calculator" legacyBehavior passHref>
                                <NavigationMenuLink className={`${navigationMenuTriggerStyle()} flex items-center`}>
                                    <Calculator className="w-4 h-4 mr-2" />
                                    Eval Cost Calculator
                                    <Badge className="ml-2">New!</Badge>
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </header>
    );
};

export default Navbar;