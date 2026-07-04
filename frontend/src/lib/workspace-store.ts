import { create } from "zustand";

export type ProjectFile = {
  path: string;
  content: string;
};

type WorkspaceState = {
  files: ProjectFile[];
  activePath: string;
  device: "desktop" | "tablet" | "mobile";
  setFiles: (files: ProjectFile[]) => void;
  writeFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  setActivePath: (path: string) => void;
  setDevice: (d: "desktop" | "tablet" | "mobile") => void;
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  files: [],
  activePath: "index.html",
  device: "desktop",
  setFiles: (files) =>
    set((s) => ({
      files,
      activePath: files.some((f) => f.path === s.activePath)
        ? s.activePath
        : files.find((f) => f.path === "index.html")?.path ?? files[0]?.path ?? "index.html",
    })),
  writeFile: (path, content) =>
    set((s) => {
      const existing = s.files.find((f) => f.path === path);
      const files = existing
        ? s.files.map((f) => (f.path === path ? { ...f, content } : f))
        : [...s.files, { path, content }].sort((a, b) => a.path.localeCompare(b.path));
      const activePath = s.activePath || path;
      return { files, activePath: files.some((f) => f.path === activePath) ? activePath : path };
    }),
  deleteFile: (path) =>
    set((s) => {
      const files = s.files.filter((f) => f.path !== path);
      const activePath = s.activePath === path ? files[0]?.path ?? "index.html" : s.activePath;
      return { files, activePath };
    }),
  setActivePath: (path) => set({ activePath: path }),
  setDevice: (device) => set({ device }),
}));
