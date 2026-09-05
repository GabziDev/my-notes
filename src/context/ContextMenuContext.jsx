"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import ContextMenu from "@/components/ui/ContextMenu/ContextMenu";

const ContextMenuCtx = createContext(null);

export function ContextMenuProvider({ children }) {
    const [menu, setMenu] = useState(null);

    const showMenu = useCallback((e, items) => {
        e.preventDefault();
        e.stopPropagation();
        setMenu({ x: e.clientX, y: e.clientY, items });
    }, []);

    const closeMenu = useCallback(() => setMenu(null), []);

    useEffect(() => {
        if (!menu) return;

        const handleKeyDown = (e) => e.key === "Escape" && closeMenu();
        window.addEventListener("click", closeMenu);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("click", closeMenu);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [menu, closeMenu]);

    return (
        <ContextMenuCtx.Provider value={{showMenu, closeMenu}}>
            {children}
            {menu && (
                <ContextMenu x={menu.x} y={menu.y} items={menu.items} />
            )}
        </ContextMenuCtx.Provider>
    );
}

export function useContextMenu() {
    return useContext(ContextMenuCtx);
}