import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";

import { ArrowLeft, Loader2 } from "lucide-react";
import type { UIMessage } from "ai";
import { Logo } from "@/components/brand/Logo";
import { ChatPane } from "@/components/workspace/ChatPane";
import { PreviewPane } from "@/components/workspace/PreviewPane";
import { CodePane } from "@/components/workspace/CodePane";
import { useWorkspaceStore } from "@/lib/workspace-store";
import {
  getProject,
  listProjectFiles,
  listChatMessages,
  saveProjectFile,
} from "@/lib/projects.functions";

export const Route = createFileRoute("/_authenticated/workspace/$projectId")({
  head: ({ params }) => ({
    meta: [{ title: `Workspace — Forge` }],
  }),
  component: Workspace,
});

function Workspace() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();

  const getP = useServerFn(getProject);
  const listF = useServerFn(listProjectFiles);
  const listM = useServerFn(listChatMessages);
  const saveF = useServerFn(saveProjectFile);

  const project = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getP({ data: { id: projectId } }),
  });

  const files = useQuery({
    queryKey: ["project-files", projectId],
    queryFn: () => listF({ data: { projectId } }),
  });

  const messages = useQuery({
    queryKey: ["chat-messages", projectId],
    queryFn: () => listM({ data: { projectId } }),
  });

  const setFiles = useWorkspaceStore((s) => s.setFiles);
  const wsFiles = useWorkspaceStore((s) => s.files);
  const activePath = useWorkspaceStore((s) => s.activePath);
  const setActivePath = useWorkspaceStore((s) => s.setActivePath);
  const device = useWorkspaceStore((s) => s.device);
  const setDevice = useWorkspaceStore((s) => s.setDevice);

  // Seed store from DB on load
  useEffect(() => {
    if (files.data) {
      setFiles(files.data.map((f) => ({ path: f.path, content: f.content })));
    }
  }, [files.data, setFiles]);

  const initialMessages: UIMessage[] = messagesToUI(messages.data);

  const isLoading = project.isLoading || files.isLoading || messages.isLoading;
  const err = project.error ?? files.error ?? messages.error;

  if (err) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-foreground">
        <p className="text-sm text-muted-foreground">{err.message}</p>
        <button onClick={() => navigate({ to: "/dashboard" })} className="rounded-lg glass px-4 py-2 text-sm">
          Back to dashboard
        </button>
      </div>
    );
  }

  if (isLoading || !project.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-glass-border/60 px-4 py-2">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="inline-flex items-center gap-1 rounded-md p-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
          </Link>
          <Logo size={22} />
          <span className="text-muted-foreground/40">/</span>
          <span className="text-sm font-medium">{project.data.name}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {wsFiles.length} file{wsFiles.length === 1 ? "" : "s"} · Updated {new Date(project.data.updated_at).toLocaleTimeString()}
        </div>
      </header>

      <div className="grid flex-1 grid-cols-[380px_1fr_420px] overflow-hidden">
        <div className="border-r border-glass-border/60 overflow-hidden">
          <ChatPane projectId={projectId} initialMessages={initialMessages} />
        </div>
        <div className="overflow-hidden">
          <PreviewPane
            files={wsFiles}
            device={device}
            onDeviceChange={setDevice}
            activePath={activePath}
          />
        </div>
        <div className="border-l border-glass-border/60 overflow-hidden">
          <CodePane
            files={wsFiles}
            activePath={activePath}
            onSelect={setActivePath}
            onSave={async (path, content) => {
              await saveF({ data: { projectId, path, content } });
              useWorkspaceStore.getState().writeFile(path, content);
            }}
          />
        </div>
      </div>
    </div>
  );
}

function messagesToUI(rows: Array<{ id: string; role: string; parts: unknown; created_at: string }> | undefined): UIMessage[] {
  if (!rows) return [];
  return rows.map((r) => ({
    id: r.id,
    role: r.role as UIMessage["role"],
    parts: Array.isArray(r.parts) ? (r.parts as UIMessage["parts"]) : [],
  }));
}
