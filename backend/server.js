import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { convertToModelMessages, streamText, stepCountIs, tool } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Create Lovable AI Gateway provider
function createLovableAiGatewayProvider(lovableApiKey) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

// System prompt for Forge
const FORGE_SYSTEM_PROMPT = `You are Forge, an expert full-stack engineer and AI coding assistant. Your role is to help users build, modify, and debug web applications.

Key capabilities:
- Write clean, modern HTML, CSS, and JavaScript
- Create responsive designs with Tailwind CSS
- Implement React components with proper state management
- Debug and fix issues in existing code
- Follow best practices for web development

When editing files:
- Only rewrite files you actually change
- Preserve existing functionality unless explicitly asked to change it
- Add comments for complex logic
- Follow the project's existing code style

Be concise, helpful, and focus on delivering working solutions.`;

// POST /api/generate - Main AI generation endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { messages, projectId, files, model } = req.body;

    if (!Array.isArray(messages) || !projectId) {
      return res.status(400).json({ error: 'messages and projectId required' });
    }

    const auth = req.headers.get('authorization') ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return res.status(500).json({ error: 'Missing LOVABLE_API_KEY' });
    }

    // Verify caller + get an authenticated Supabase client scoped to that user.
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_PUBLISHABLE_KEY,
      {
        global: {
          headers: { Authorization: `Bearer ${token}`, apikey: process.env.SUPABASE_PUBLISHABLE_KEY },
        },
        auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      },
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Confirm the project belongs to the user (RLS also enforces).
    const { data: proj } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .maybeSingle();
    if (!proj) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Persist the latest user message.
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser) {
      await supabase.from('chat_messages').insert({
        project_id: projectId,
        role: 'user',
        parts: lastUser.parts,
      });
    }

    const fileList = (files ?? []).map((f) => `- ${f.path} (${f.content.length} chars)`).join('\n') || '(empty project)';
    const contextSystem = `Current virtual filesystem for project ${projectId}:\n${fileList}\n\nWhen editing, only rewrite files you actually change.`;

    const gateway = createLovableAiGatewayProvider(key);
    const modelName = model || 'google/gemini-3-flash-preview';
    const aiModel = gateway(modelName);

    const tools = {
      write_file: tool({
        description: 'Create or overwrite a file in the project\'s virtual filesystem. Use for all HTML/CSS/JS content.',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', minLength: 1, maxLength: 200, description: 'File path, e.g. \'index.html\'' },
            content: { type: 'string', description: 'Full file contents'},
          },
          required: ['path', 'content'],
        },
        execute: async ({ path, content }) => {
          const { error } = await supabase.from('project_files').upsert(
            { project_id: projectId, path, content, updated_at: new Date().toISOString() },
            { onConflict: 'project_id,path' },
          );
          if (error) return { ok: false, path, error: error.message };
          return { ok: true, path, bytes: content.length };
        },
      }),
      delete_file: tool({
        description: 'Delete a file from the project.',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', minLength: 1, maxLength: 200 },
          },
          required: ['path'],
        },
        execute: async ({ path }) => {
          const { error } = await supabase
            .from('project_files')
            .delete()
            .eq('project_id', projectId)
            .eq('path', path);
          if (error) return { ok: false, path, error: error.message };
          return { ok: true, path };
        },
      }),
      chat_message: tool({
        description: 'Send a short markdown message to the user summarising what you built or changed. Call at most once per turn, at the end.',
        inputSchema: {
          type: 'object',
          properties: {
            markdown: { type: 'string', minLength: 1, maxLength: 2000 },
          },
          required: ['markdown'],
        },
        execute: async ({ markdown }) => ({ ok: true, markdown }),
      }),
    };

    const result = streamText({
      model: aiModel,
      system: `${FORGE_SYSTEM_PROMPT}\n\n${contextSystem}`,
      messages: convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(50),
      onFinish: async ({ response }) => {
        // Persist the assistant message for durable history.
        try {
          const lastAssistant = response.messages.filter((m) => m.role === 'assistant').pop();
          if (lastAssistant) {
            await supabase.from('chat_messages').insert({
              project_id: projectId,
              role: 'assistant',
              parts: lastAssistant.content,
            });
          }
          await supabase.from('projects').update({ updated_at: new Date().toISOString() }).eq('id', projectId);

          // Snapshot checkpoint
          const { data: filesData } = await supabase
            .from('project_files')
            .select('path, content')
            .eq('project_id', projectId);
          await supabase.from('checkpoints').insert({
            project_id: projectId,
            summary: null,
            files_snapshot: filesData ?? [],
          });
        } catch (e) {
          console.error('[generate] persist failed', e);
        }
      },
    });

    return result.toUIMessageStreamResponse({ originalMessages: messages });
  } catch (error) {
    console.error('Error in /api/generate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
