import { create } from "zustand";

type Store = {
  sidebarTrigger: boolean;
  sidebarOpen: () => void;
  sidebarClose: () => void;
  setSidebarToggle: () => void;
};

export const useSidebar = create<Store>()((set) => ({
  sidebarTrigger: false,
  sidebarOpen: () => set(() => ({ sidebarTrigger: true })),
  sidebarClose: () => set(() => ({ sidebarTrigger: false })),
  setSidebarToggle: () =>
    set((state) => ({ sidebarTrigger: !state.sidebarTrigger })),
}));
