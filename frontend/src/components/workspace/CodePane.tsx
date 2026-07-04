import Editor from "@monaco-editor/react";
import { FileCode2, FileText, Save, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProjectFile } from "@/lib/workspace-store";

export function CodePane({
  files,
  activePath,
  onSelect,
  onSave,
}: {
  files: ProjectFile[];
  activePath: string;
  onSelect: (path: string) => void;
  onSave: (path: string, content: string) => Promise<void>;
}) {
  const active = files.find((f) => f.path === activePath);
  const [draft, setDraft] = useState<string | undefined>(active?.content);
  const [saving, setSaving] = useState(false);
  const [savedPath, setSavedPath] = useState<string | null>(null);

  // Reset draft when file changes or content updates from stream
  const currentContent = active?.content ?? "";
  const dirty = draft !== undefined && draft !== currentContent;

  const language = getLanguage(activePath);

  const handleSave = async () => {
    if (!active || draft === undefined) return;
    setSaving(true);
    try {
      await onSave(active.path, draft);
      setSavedPath(active.path);
      setTimeout(() => setSavedPath(null), 1500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-full">
        <aside className="flex w-48 shrink-0 flex-col border-r border-glass-border/60 bg-background/40">
          <div className="border-b border-glass-border/60 px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground">
            Files
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {files.length === 0 ? (
              <div className="px-3 py-4 text-xs text-muted-foreground">No files yet</div>
            ) : (
              files.map((f) => (
                <button
                  key={f.path}
                  onClick={() => {
                    onSelect(f.path);
                    setDraft(undefined);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 truncate px-3 py-1.5 text-left text-xs font-mono transition",
                    activePath === f.path ? "bg-gradient-brand text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.path.endsWith(".html") || f.path.endsWith(".css") || f.path.endsWith(".js") ? (
                    <FileCode2 className="size-3.5 shrink-0" />
                  ) : (
                    <FileText className="size-3.5 shrink-0" />
                  )}
                  <span className="truncate">{f.path}</span>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-glass-border/60 px-3 py-2 text-xs">
            <span className="font-mono text-muted-foreground">{active?.path ?? "—"}</span>
            <button
              onClick={handleSave}
              disabled={!dirty || saving}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-1 transition",
                dirty ? "bg-gradient-brand text-primary-foreground" : "text-muted-foreground/50",
              )}
            >
              {saving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
              {savedPath === active?.path ? "Saved" : dirty ? "Save" : "Saved"}
            </button>
          </div>
          <div className="flex-1">
            {active ? (
              <Editor
                key={active.path}
                height="100%"
                theme="vs-dark"
                language={language}
                value={draft ?? currentContent}
                onChange={(v) => setDraft(v ?? "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'Geist Mono Variable', ui-monospace, monospace",
                  fontLigatures: true,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  padding: { top: 12 },
                  smoothScrolling: true,
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Select a file to view its code
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getLanguage(path: string) {
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".js")) return "javascript";
  if (path.endsWith(".ts") || path.endsWith(".tsx")) return "typescript";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".md")) return "markdown";
  return "plaintext";
}
