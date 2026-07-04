import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "project";

/** List the current user's projects. */
export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("projects")
      .select("id, name, slug, description, created_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/** Create a project. Returns the new project row. */
export const createProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ name: z.string().min(1).max(80), description: z.string().max(500).optional() }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const base = slugify(data.name);
    // ensure unique slug per owner
    let slug = base;
    let attempt = 0;
    while (true) {
      const { data: existing } = await context.supabase
        .from("projects")
        .select("id")
        .eq("owner_id", context.userId)
        .eq("slug", slug)
        .maybeSingle();
      if (!existing) break;
      attempt += 1;
      slug = `${base}-${attempt}`;
    }
    const { data: created, error } = await context.supabase
      .from("projects")
      .insert({ owner_id: context.userId, name: data.name, slug, description: data.description ?? null })
      .select("id, name, slug")
      .single();
    if (error) throw new Error(error.message);
    return created;
  });

/** Delete a project. */
export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("projects").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Get one project by id. */
export const getProject = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { data: p, error } = await context.supabase
      .from("projects")
      .select("id, name, slug, description, created_at, updated_at")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return p;
  });

/** List a project's files. */
export const listProjectFiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ projectId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { data: files, error } = await context.supabase
      .from("project_files")
      .select("id, path, content, updated_at")
      .eq("project_id", data.projectId)
      .order("path");
    if (error) throw new Error(error.message);
    return files ?? [];
  });

/** Manually save a single file (from the code editor). */
export const saveProjectFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      projectId: z.string().uuid(),
      path: z.string().min(1).max(200),
      content: z.string(),
    }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("project_files")
      .upsert(
        { project_id: data.projectId, path: data.path, content: data.content, updated_at: new Date().toISOString() },
        { onConflict: "project_id,path" },
      );
    if (error) throw new Error(error.message);
    await context.supabase.from("projects").update({ updated_at: new Date().toISOString() }).eq("id", data.projectId);
    return { ok: true };
  });

/** List a project's chat messages. */
export const listChatMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ projectId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { data: msgs, error } = await context.supabase
      .from("chat_messages")
      .select("id, role, parts, created_at")
      .eq("project_id", data.projectId)
      .order("created_at");
    if (error) throw new Error(error.message);
    return msgs ?? [];
  });
