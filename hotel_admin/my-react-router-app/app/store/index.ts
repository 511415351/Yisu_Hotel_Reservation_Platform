import { create } from "zustand";

export const useStore = create<{
    collapsed: boolean;
    currentMenu: string;
    updateCollapsed: () => void;
}>((set) => ({
    collapsed: false,
    currentMenu: '/dashboard',
    setCurrentMenu: (menu: string) => set(() => ({ currentMenu: menu })),
    updateCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
}));