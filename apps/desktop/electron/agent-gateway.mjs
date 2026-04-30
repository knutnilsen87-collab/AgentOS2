import { promises as fs } from 'node:fs';
import path from 'node:path';

const DEFAULT_PRIMARY_MODEL = 'gpt-5.4';
const DEFAULT_SUPPORT_MODEL = 'gpt-5.4-mini';

const CHAT_RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['reply', 'kind', 'risk', 'nextActions'],
  properties: {
    reply: {
      type: 'string',
      description: 'Concise operator-facing answer for the active AgentOS thread.'
    },
    kind: {
      type: 'string',
      enum: ['message', 'plan', 'review', 'verification']
    },
    risk: {
      type: 'string',
      enum: ['low', 'medium', 'high']
    },
    nextActions: {
      type: 'array',
      maxItems: 3,
      items: { type: 'string' }
    }
  }
};

export async function loadDotEnv(cwd = process.cwd()) {
  const envPath = path.resolve(cwd, '.env');
  try {
    await fs.access(envPath);
  } catch {
    return;
  }

  const raw = await fs.readFile(envPath, 'utf-8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function selectModel(taskType = 'chat') {
  if (process.env.OPENAI_MODEL) return process.env.OPENAI_MODEL;
  if (taskType === 'support') {
    return process.env.OPENAI_SUPPORT_MODEL || DEFAULT_SUPPORT_MODEL;
  }

  return process.env.OPENAI_PRIMARY_MODEL || DEFAULT_PRIMARY_MODEL;
}

function recentThreadMessages(thread) {
  if (!Array.isArray(thread?.messages)) return 'No prior thread messages.';

  return thread.messages
    .slice(-8)
    .map((message) => `${message.role}: ${message.text}`)
    .join('\n');
}

function buildOpenAiContext(payload) {
  const project = payload?.projectSummary;
  const thread = payload?.thread;

  return [
    `Project: ${project?.rootPath ?? 'No project connected'}`,
    `Phase: ${payload?.phase ?? thread?.phase ?? 'unknown'}`,
    `Approval mode: ${payload?.approvalMode ?? 'unknown'}`,
    `Thread title: ${thread?.title ?? 'No active thread'}`,
    `Thread status: ${thread?.status ?? 'unknown'}`,
    `Thread risk: ${thread?.risk ?? 'unknown'}`,
    `Detected manifests: ${(project?.manifests ?? []).slice(0, 8).join(', ') || 'none'}`,
    `Detected languages: ${(project?.languages ?? []).slice(0, 12).join(', ') || 'none'}`,
    '',
    'Recent thread messages:',
    recentThreadMessages(thread)
  ].join('\n');
}

function outputTextFromResponse(data) {
  if (typeof data.output_text === 'string') return data.output_text;
  if (!Array.isArray(data.output)) return '';

  return data.output
    .flatMap((item) => Array.isArray(item.content) ? item.content : [])
    .filter((item) => item.type === 'output_text' && typeof item.text === 'string')
    .map((item) => item.text)
    .join('\n');
}

function parseStructuredChat(rawText) {
  try {
    const parsed = JSON.parse(rawText);
    return {
      reply: typeof parsed.reply === 'string' ? parsed.reply : rawText,
      kind: ['message', 'plan', 'review', 'verification'].includes(parsed.kind) ? parsed.kind : 'message',
      risk: ['low', 'medium', 'high'].includes(parsed.risk) ? parsed.risk : 'low',
      nextActions: Array.isArray(parsed.nextActions)
        ? parsed.nextActions.filter((item) => typeof item === 'string').slice(0, 3)
        : []
    };
  } catch {
    return {
      reply: rawText,
      kind: 'message',
      risk: 'low',
      nextActions: []
    };
  }
}

export async function chatWithOpenAi(payload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set. Add it to .env or the process environment.');
  }

  const message = String(payload?.message ?? '').trim();
  if (!message) {
    throw new Error('Chat message is required.');
  }

  const model = selectModel(payload?.taskType);
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      instructions: [
        'You are AgentOS inside a local desktop app.',
        'Help the operator plan, review, and verify software work.',
        'Be concise, concrete, and safety-aware.',
        'Return JSON that matches the supplied schema.',
        'Do not claim you changed files or ran commands unless the app context explicitly says so.',
        'When asked to perform implementation, respond with the next safe AgentOS action rather than pretending to execute it.'
      ].join(' '),
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `${buildOpenAiContext(payload)}\n\nOperator message:\n${message}`
            }
          ]
        }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'agentos_chat_response',
          strict: true,
          schema: CHAT_RESPONSE_SCHEMA
        }
      },
      max_output_tokens: 700,
      store: false
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.error?.message ?? `OpenAI request failed with ${response.status}`;
    throw new Error(detail);
  }

  const rawText = outputTextFromResponse(data).trim();
  const structured = parseStructuredChat(rawText || '{}');

  return {
    text: structured.reply || 'OpenAI returned an empty response.',
    kind: structured.kind,
    risk: structured.risk,
    nextActions: structured.nextActions,
    model,
    responseId: data.id ?? null
  };
}
