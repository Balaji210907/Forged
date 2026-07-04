import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Loader2, Sparkles, User, ChevronDown, FileCode2, Trash2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GradientBorder } from "@/components/brand/GradientBorder";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MODELS = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini", tag: "Fast" },
  { id: "gpt-4o", name: "GPT-4o", tag: "Balanced" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", tag: "Quality" },
];

export function ChatPane({
  projectId,
  initialMessages,
}: {
  projectId: string;
  initialMessages: UIMessage[];
}) {
  const files = useWorkspaceStore((s) => s.files);
  const writeFile = useWorkspaceStore((s) => s.writeFile);
  const deleteFile = useWorkspaceStore((s) => s.deleteFile);
  const [model, setModel] = useState(MODELS[0].id);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const backendApiUrl = import.meta.env.VITE_BACKEND_API_URL || "/api/generate";
  
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: backendApiUrl,
        prepareSendMessagesRequest: async ({ messages, id, body }) => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          const headers: Record<string, string> = {};
          if (token) headers.Authorization = `Bearer ${token}`;
          return {
            body: {
              id,
              messages,
              projectId,
              model,
              files: useWorkspaceStore.getState().files,
              ...body,
            },
            headers,
          };
        },
      }),
    [projectId, model, backendApiUrl],
  );

  const { messages, sendMessage, status, error } = useChat({
    id: projectId,
    messages: initialMessages,
    transport,
    onError: (e) => toast.error(e.message || "Generation failed"),
  });

  // Apply tool outputs to the local workspace store as they stream in.
  useEffect(() => {
    for (const m of messages) {
      if (m.role !== "assistant") continue;
      for (const part of m.parts) {
        if (part.type === "tool-write_file" && part.state === "output-available") {
          const inp = part.input as { path?: string; content?: string } | undefined;
          if (inp?.path && typeof inp.content === "string") writeFile(inp.path, inp.content);
        }
        if (part.type === "tool-delete_file" && part.state === "output-available") {
          const inp = part.input as { path?: string } | undefined;
          if (inp?.path) deleteFile(inp.path);
        }
      }
    }
  }, [messages, writeFile, deleteFile]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  // Focus input on mount + after stream
  useEffect(() => {
    if (status === "ready") inputRef.current?.focus();
  }, [status]);

  // Kick off a pending prompt (from landing/dashboard)
  useEffect(() => {
    const pending = sessionStorage.getItem("forge:pendingPrompt");
    if (pending && messages.length === 0 && status === "ready") {
      sessionStorage.removeItem("forge:pendingPrompt");
      sendMessage({ text: pending });
    }
     
  }, [status, messages.length]);

  const isLoading = status === "submitted" || status === "streaming";

  const submit = () => {
    const t = input.trim();
    if (!t || isLoading) return;
    setInput("");
    sendMessage({ text: t });
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between border-b border-glass-border/60 px-3 py-2">
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <MessageSquare className="size-3.5" />
          Chat
        </div>
        <ModelSelect value={model} onChange={setModel} />
      </div>

      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
        {messages.length === 0 && !isLoading && (
          <div className="mx-auto max-w-sm py-10 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">Describe what you want to build</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Forge will generate real HTML you can see and edit in the panes to the right.
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageBubble message={m} />
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin text-violet" />
            <span className="animate-pulse-glow">Forging your site…</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
            {error.message}
          </div>
        )}
      </div>

      <div className="border-t border-glass-border/60 p-3">
        <GradientBorder active={isLoading || input.length > 0} radius="rounded-xl">
          <div className="flex items-end gap-2 rounded-xl p-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={messages.length === 0 ? "Describe the site you want…" : "Ask for a change…"}
              rows={1}
              className="flex-1 max-h-40 resize-none bg-transparent px-2 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              onClick={submit}
              disabled={!input.trim() || isLoading}
              className={cn(
                "inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition",
                input.trim() && !isLoading ? "bg-gradient-brand text-primary-foreground hover:scale-[1.03]" : "bg-white/5 text-muted-foreground/60",
              )}
              aria-label="Send"
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
            </button>
          </div>
        </GradientBorder>
        <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">
          {files.length > 0 ? `${files.length} file${files.length === 1 ? "" : "s"} in project` : "Project is empty"}
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const textParts = message.parts.filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text");
  const toolParts = message.parts.filter((p) => p.type.startsWith("tool-"));

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "")}>
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-lg",
          isUser ? "bg-white/10" : "bg-gradient-brand",
        )}
      >
        {isUser ? <User className="size-3.5" /> : <Sparkles className="size-3.5" />}
      </div>
      <div className={cn("flex min-w-0 flex-1 flex-col gap-2", isUser ? "items-end" : "items-start")}>
        {textParts.length > 0 && (
          <div
            className={cn(
              "max-w-full whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm",
              isUser ? "bg-white/10 text-foreground" : "text-foreground",
            )}
          >
            {textParts.map((p, i) => (
              <span key={i}>{p.text}</span>
            ))}
          </div>
        )}
        {!isUser && toolParts.map((p, i) => <ToolCard key={i} part={p} />)}
      </div>
    </div>
  );
}

function ToolCard({ part }: { part: NonNullable<UIMessage["parts"]>[number] }) {
  const [open, setOpen] = useState(false);
  const type = (part as { type: string }).type.replace(/^tool-/, "");
  const state = (part as { state?: string }).state ?? "input-streaming";
  const input = (part as { input?: unknown }).input;
  const output = (part as { output?: unknown }).output;

  // chat_message renders inline as markdown-ish text, not a card
  if (type === "chat_message" && (state === "output-available" || state === "input-available")) {
    const md = (input as { markdown?: string })?.markdown ?? "";
    return md ? (
      <div className="max-w-full whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm">{md}</div>
    ) : null;
  }

  const icon =
    type === "write_file" ? <FileCode2 className="size-3.5 text-cyan" /> :
    type === "delete_file" ? <Trash2 className="size-3.5 text-destructive" /> :
    <Sparkles className="size-3.5 text-violet" />;

  const inp = input as { path?: string } | undefined;
  const label =
    type === "write_file" ? `Wrote ${inp?.path ?? ""}` :
    type === "delete_file" ? `Deleted ${inp?.path ?? ""}` :
    type;

  return (
    <div className="w-full max-w-full overflow-hidden rounded-xl border border-glass-border bg-surface/60">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs"
      >
        {icon}
        <span className="flex-1 truncate font-mono text-muted-foreground">{label}</span>
        {state !== "output-available" && state !== "input-available" && (
          <Loader2 className="size-3 animate-spin text-violet" />
        )}
        <ChevronDown className={cn("size-3 text-muted-foreground transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="border-t border-glass-border bg-background/60 p-3 font-mono text-[11px] text-muted-foreground">
          {typeof input === "object" && input !== null && (
            <details open>
              <summary className="cursor-pointer text-muted-foreground/80">input</summary>
              <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap">{JSON.stringify(input, null, 2).slice(0, 4000)}</pre>
            </details>
          )}
          {output !== undefined && (
            <details className="mt-2">
              <summary className="cursor-pointer text-muted-foreground/80">output</summary>
              <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap">{JSON.stringify(output, null, 2).slice(0, 1000)}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function ModelSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const current = MODELS.find((m) => m.id === value) ?? MODELS[0];
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-lg glass px-2.5 py-1 pr-7 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {MODELS.map((m) => (
          <option key={m.id} value={m.id} className="bg-background">
            {m.name} · {m.tag}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
      <span className="sr-only">Currently {current.name}</span>
    </div>
  );
}
