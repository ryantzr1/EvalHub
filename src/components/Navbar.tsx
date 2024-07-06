"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Badge({ children, className }: { children: React.ReactNode, className: string }) {
    return (
        <span className={`inline-block text-xs font-bold ${className}`}>
            {children}
        </span>
    );
}

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const Navbar = () => {
    const pathname = usePathname();

    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <Link href="/" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Home
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/tokenizer-calculator" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Eval Cost Calculator
                            <Badge className="ml-2 bg-blue-500 text-white px-2 py-1 rounded-full">
                                New!
                            </Badge>
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
};

export default Navbar;