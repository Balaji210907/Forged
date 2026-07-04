import { useEffect, useMemo, useRef } from "react";
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectFile } from "@/lib/workspace-store";

type Device = "desktop" | "tablet" | "mobile";
const DEVICES: Record<Device, { w: number | "100%"; label: string; icon: React.ComponentType<{ className?: string }> }> = {
  desktop: { w: "100%", label: "Desktop", icon: Monitor },
  tablet: { w: 768, label: "Tablet", icon: Tablet },
  mobile: { w: 390, label: "Mobile", icon: Smartphone },
};

export function PreviewPane({
  files,
  device,
  onDeviceChange,
  activePath,
}: {
  files: ProjectFile[];
  device: Device;
  onDeviceChange: (d: Device) => void;
  activePath: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeFile = useMemo(
    () => files.find((f) => f.path === activePath) ?? files.find((f) => f.path === "index.html") ?? files[0],
    [files, activePath],
  );

  const srcDoc = useMemo(() => {
    if (!activeFile) {
      return `<!doctype html><html><body style="background:#0A0A0F;color:#888;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><div style="text-align:center"><div style="font-size:14px;letter-spacing:.2em;text-transform:uppercase;opacity:.6">Empty project</div><div style="margin-top:8px">Send a prompt to generate your first page.</div></div></body></html>`;
    }
    // If the file references other project files (e.g. <a href="about.html">), we
    // leave them alone — same-origin srcdoc navigation stays inside the iframe.
    return activeFile.content;
  }, [activeFile]);

  const refresh = () => {
    if (iframeRef.current) {
      // Trigger reload by re-setting srcdoc
      const doc = iframeRef.current.srcdoc;
      iframeRef.current.srcdoc = "";
      requestAnimationFrame(() => {
        if (iframeRef.current) iframeRef.current.srcdoc = doc;
      });
    }
  };

  const openExternal = () => {
    const blob = new Blob([srcDoc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const frame = DEVICES[device];

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between border-b border-glass-border/60 px-3 py-2">
        <div className="inline-flex rounded-lg glass p-0.5">
          {(Object.keys(DEVICES) as Device[]).map((d) => {
            const I = DEVICES[d].icon;
            return (
              <button
                key={d}
                onClick={() => onDeviceChange(d)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition",
                  device === d ? "bg-gradient-brand text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
                aria-label={DEVICES[d].label}
              >
                <I className="size-3.5" />
              </button>
            );
          })}
        </div>
        <div className="truncate px-3 text-xs text-muted-foreground">
          <span className="font-mono">/{activeFile?.path ?? "index.html"}</span>
        </div>
        <div className="inline-flex items-center gap-1">
          <button onClick={refresh} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground" aria-label="Refresh">
            <RefreshCw className="size-3.5" />
          </button>
          <button onClick={openExternal} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground" aria-label="Open in new tab">
            <ExternalLink className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="flex flex-1 items-start justify-center overflow-auto bg-[radial-gradient(circle_at_50%_0%,_oklch(0.14_0.02_270),_var(--background))] p-4">
        <div
          className="h-full overflow-hidden rounded-xl border border-glass-border bg-white shadow-2xl transition-all"
          style={{
            width: frame.w,
            maxWidth: "100%",
            height: "100%",
          }}
        >
          <iframe
            ref={iframeRef}
            title="Preview"
            srcDoc={srcDoc}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
