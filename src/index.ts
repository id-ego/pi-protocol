import { Type, type Static, type TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

export const PI_PROTOCOL_NAME = 'pi-protocol' as const;
export const PI_PROTOCOL_VERSION = '1.0.0' as const;
export const PI_PROVIDER_DISCOVERY_PATH = '/.well-known/pi-provider' as const;

export const ProviderProtocolSchema = Type.Object({
  name: Type.Literal(PI_PROTOCOL_NAME),
  version: Type.Literal(PI_PROTOCOL_VERSION),
});
export type ProviderProtocol = Static<typeof ProviderProtocolSchema>;

export const ProviderLinkSchema = Type.Object({
  label: Type.String({ minLength: 1 }),
  url: Type.String({ minLength: 1 }),
});
export type ProviderLink = Static<typeof ProviderLinkSchema>;

export const ProviderOperatorSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  contact: Type.Optional(Type.String({ minLength: 1 })),
});
export type ProviderOperator = Static<typeof ProviderOperatorSchema>;

export const ProviderProfileInfoSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
  displayName: Type.String({ minLength: 1 }),
  headline: Type.Optional(Type.String()),
  summary: Type.String(),
  operator: Type.Optional(ProviderOperatorSchema),
  links: Type.Array(ProviderLinkSchema),
});
export type ProviderProfileInfo = Static<typeof ProviderProfileInfoSchema>;

export const ProviderSkillSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
});
export type ProviderSkill = Static<typeof ProviderSkillSchema>;

export const ProviderProfileSchema = Type.Object({
  protocol: ProviderProtocolSchema,
  profile: ProviderProfileInfoSchema,
  skills: Type.Array(ProviderSkillSchema),
});
export type ProviderProfile = Static<typeof ProviderProfileSchema>;

export const ProviderReadinessSchema = Type.Union([
  Type.Literal('ready'),
  Type.Literal('degraded'),
  Type.Literal('not_ready'),
]);
export type ProviderReadiness = Static<typeof ProviderReadinessSchema>;

export const ProviderHealthStatusSchema = Type.Object({
  readiness: ProviderReadinessSchema,
  activeRuns: Type.Number({ minimum: 0 }),
  queuedRuns: Type.Number({ minimum: 0 }),
  maxConcurrentRuns: Type.Number({ minimum: 0 }),
});
export type ProviderHealthStatus = Static<typeof ProviderHealthStatusSchema>;

export const ProviderHealthSchema = Type.Object({
  ok: Type.Boolean(),
  service: Type.String({ minLength: 1 }),
  version: Type.String({ minLength: 1 }),
  protocol: ProviderProtocolSchema,
  status: ProviderHealthStatusSchema,
});
export type ProviderHealth = Static<typeof ProviderHealthSchema>;

export const ProviderErrorEnvelopeSchema = Type.Object({
  error: Type.Object({
    code: Type.String({ minLength: 1 }),
    message: Type.String({ minLength: 1 }),
    retryable: Type.Boolean(),
    details: Type.Record(Type.String(), Type.Unknown()),
  }),
});
export type ProviderErrorEnvelope = Static<typeof ProviderErrorEnvelopeSchema>;

export const ProviderRunStatusSchema = Type.Union([
  Type.Literal('queued'),
  Type.Literal('running'),
  Type.Literal('completed'),
  Type.Literal('failed'),
  Type.Literal('cancelled'),
  Type.Literal('interrupted'),
]);
export type ProviderRunStatus = Static<typeof ProviderRunStatusSchema>;

export const ProviderRunSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
  status: ProviderRunStatusSchema,
  sessionId: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
  createdAt: Type.String({ minLength: 1 }),
});
export type ProviderRun = Static<typeof ProviderRunSchema>;

export const ProviderSessionStatusSchema = Type.Union([
  Type.Literal('queued'),
  Type.Literal('running'),
  Type.Literal('completed'),
  Type.Literal('failed'),
  Type.Literal('cancelled'),
  Type.Literal('interrupted'),
]);
export type ProviderSessionStatus = Static<typeof ProviderSessionStatusSchema>;

export const ProviderSessionActivitySchema = Type.Union([
  Type.Literal('queued'),
  Type.Literal('active'),
  Type.Literal('idle'),
]);
export type ProviderSessionActivity = Static<typeof ProviderSessionActivitySchema>;

export const ProviderSessionSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
  runId: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
  status: ProviderSessionStatusSchema,
  activity: ProviderSessionActivitySchema,
  lastEventSeq: Type.Number({ minimum: 0 }),
  createdAt: Type.String({ minLength: 1 }),
  updatedAt: Type.String({ minLength: 1 }),
});
export type ProviderSession = Static<typeof ProviderSessionSchema>;

export const ProviderMessageRoleSchema = Type.Union([
  Type.Literal('user'),
  Type.Literal('assistant'),
  Type.Literal('system'),
]);
export type ProviderMessageRole = Static<typeof ProviderMessageRoleSchema>;

export const ProviderSessionMessageSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
  sessionId: Type.String({ minLength: 1 }),
  role: ProviderMessageRoleSchema,
  content: Type.String(),
  createdAt: Type.String({ minLength: 1 }),
});
export type ProviderSessionMessage = Static<typeof ProviderSessionMessageSchema>;

export const ProviderSessionEventSchema = Type.Object({
  seq: Type.Number({ minimum: 0 }),
  sessionId: Type.String({ minLength: 1 }),
  type: Type.String({ minLength: 1 }),
  payload: Type.Unknown(),
  createdAt: Type.String({ minLength: 1 }),
});
export type ProviderSessionEvent = Static<typeof ProviderSessionEventSchema>;

export const ProviderConversationSchema = Type.Object({
  sessionId: Type.String({ minLength: 1 }),
  status: Type.Union([
    Type.Literal('idle'),
    Type.Literal('queued'),
    Type.Literal('running'),
    Type.Literal('stopping'),
    Type.Literal('completed'),
    Type.Literal('failed'),
    Type.Literal('interrupted'),
  ]),
  messages: Type.Array(ProviderSessionMessageSchema),
  lastEventSeq: Type.Number({ minimum: 0 }),
});
export type ProviderConversation = Static<typeof ProviderConversationSchema>;

export const ProviderConversationSendRequestSchema = Type.Object({
  content: Type.String({ minLength: 1 }),
});
export type ProviderConversationSendRequest = Static<typeof ProviderConversationSendRequestSchema>;

export const ProviderConversationSendResponseSchema = Type.Object({
  accepted: Type.Boolean(),
  sessionId: Type.String({ minLength: 1 }),
  messageId: Type.String({ minLength: 1 }),
  turnId: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
  status: Type.Union([Type.Literal('queued'), Type.Literal('started')]),
});
export type ProviderConversationSendResponse = Static<typeof ProviderConversationSendResponseSchema>;

export const ProviderSseEventNameSchema = Type.Union([
  Type.Literal('session.event'),
  Type.Literal('session.replay_complete'),
]);
export type ProviderSseEventName = Static<typeof ProviderSseEventNameSchema>;

export const ProviderCompatibilityStatusSchema = Type.Union([
  Type.Literal('compatible'),
  Type.Literal('unsupported'),
  Type.Literal('unknown'),
  Type.Literal('unreachable'),
]);
export type ProviderCompatibilityStatus = Static<typeof ProviderCompatibilityStatusSchema>;

export function isProviderProtocol(value: unknown): value is ProviderProtocol {
  return Value.Check(ProviderProtocolSchema, value);
}

export function isProviderProfile(value: unknown): value is ProviderProfile {
  return Value.Check(ProviderProfileSchema, value);
}

export function isProviderHealth(value: unknown): value is ProviderHealth {
  return Value.Check(ProviderHealthSchema, value);
}

export function isProviderErrorEnvelope(value: unknown): value is ProviderErrorEnvelope {
  return Value.Check(ProviderErrorEnvelopeSchema, value);
}

export function checkSchema<T extends TSchema>(schema: T, value: unknown): value is Static<T> {
  return Value.Check(schema, value);
}

// Transitional Work Plane and pi-works BFF contract types.
// These are kept in pi-protocol so pi-os and pi-works can split without a legacy shared package.
export type PiApiHealth = { ok: true };

export type PiApiNode = {
  id: string;
  name: string;
  baseUrl: string;
};

export type PiApiNodeCredentialSummary = {
  configured: true;
  providerApiKeyFingerprint: string;
  keyVersion: string;
  rotatedAt?: string | Date | null;
};

export type PiApiNodeProviderSummary = {
  compatibility: ProviderCompatibilityStatus;
  checkedAt?: string | Date | null;
  error?: string | null;
  health?: ProviderHealth | null;
  profile?: ProviderProfile | null;
};

export type PiApiNodeDiagnostic = PiApiNode & {
  credentialConfigured: boolean;
  credentialAvailable: boolean | null;
  credential: PiApiNodeCredentialSummary | null;
  configSource: 'db';
  capabilities: string[];
  managementMode: 'read-only' | 'read-write';
  diagnostics: string[];
  health?: {
    status: 'unknown' | 'healthy' | 'unhealthy';
    checkedAt?: string | Date | null;
    error?: string | null;
  };
  provider?: PiApiNodeProviderSummary;
};

export type PiApiError = {
  error: string;
};

export type SessionStatus = 'queued' | 'active' | 'completed' | 'failed' | 'cancelled' | 'interrupted';

export type TurnStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled' | 'interrupted';

export type MessageRole = 'user' | 'assistant';

export type ConversationMessageRole = MessageRole | 'system';

export type MessageStatus = 'streaming' | 'complete';

export type ConversationMessageStatus = MessageStatus | 'pending' | 'error';

export type ConversationStatus = 'idle' | 'running' | 'stopping' | 'completed' | 'failed' | 'interrupted';

export type ConversationQueuePosition = 'started' | 'queued';

export type ConversationInputDurability = 'memory';

export type SessionListQuery = {
  status?: SessionStatus | string;
  limit?: number;
};

export type SessionEventsQuery = {
  afterSeq?: number;
  limit?: number;
};

export type Session = {
  id: string;
  status: SessionStatus;
  title: string | null;
  cwd: string;
  agentDir: string;
  sessionFile: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
};

export type SessionListResponse = {
  sessions: Session[];
  nextCursor: string | null;
};

export type SessionMessage = {
  id: string;
  sessionId: string;
  turnId: string | null;
  role: MessageRole;
  status: MessageStatus;
  content: string;
  sourceEventSeq: number | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type SessionMessagesResponse = {
  messages: SessionMessage[];
};

export type SessionTurn = {
  id: string;
  sessionId: string;
  status: TurnStatus;
  kind: string;
  input: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
};

export type SessionTurnsResponse = {
  turns: SessionTurn[];
};

export type SessionEvent = {
  id: number;
  sessionId: string;
  turnId: string | null;
  seq: number;
  type: string;
  payload: unknown;
  payloadBytes: number;
  createdAt: string;
};

export type SessionEventsResponse = {
  events: SessionEvent[];
  nextSeq: number | null;
};

export type SessionLease = {
  leaseId: string;
  sessionId: string;
  holder: string | null;
  status: 'active' | 'released' | 'expired';
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  releasedAt: string | null;
};

export type SessionLeaseStatusResponse = {
  lease: SessionLease | null;
};

export type SessionLeaseConflictError = PiApiError & {
  lease: SessionLease;
};

export type SessionLeaseAcquireRequest = {
  holder?: string;
  ttlMs?: number;
};

export type SessionLeaseRenewRequest = {
  ttlMs?: number;
};

export type CreateRunRequest = {
  input: string;
  prefix?: string;
  metadata?: Record<string, unknown>;
};

export type SessionWriteRequest = {
  input: string;
  leaseId?: string;
  prefix?: string;
  metadata?: Record<string, unknown>;
};

export type SessionControlRequest = {
  input: string;
  leaseId?: string;
};

export type SessionAbortRequest = {
  leaseId?: string;
};

export type SessionControlOk = { ok: true };

export type ConversationRuntimeState = {
  attached: boolean;
  streaming: boolean;
  canSend: boolean;
  canStop: boolean;
  queueDepth: number;
};

export type Conversation = {
  id: string;
  status: ConversationStatus;
  title: string | null;
  cwd: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  runtime: ConversationRuntimeState;
};

export type ConversationMessage = {
  id: string;
  sessionId: string;
  role: ConversationMessageRole;
  status: ConversationMessageStatus;
  content: string;
  clientMessageId?: string;
  sourceEventSeq: number | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  error: string | null;
};

export type ConversationMessagesResponse = {
  messages: ConversationMessage[];
};

export type SendConversationMessageRequest = {
  content: string;
  clientMessageId?: string;
};

export type SendConversationMessageResponse = {
  accepted: true;
  clientMessageId?: string;
  position: ConversationQueuePosition;
  queueDepth: number;
  durability: ConversationInputDurability;
};

export type StopConversationResponse = {
  ok: true;
  stoppedCurrent: boolean;
  cancelledQueued: number;
};

export type ConversationReadyEvent = {
  type: 'ready';
  sessionId: string;
  seq: number;
  status: ConversationStatus;
  queueDepth: number;
};

export type ConversationInputAcceptedEvent = {
  type: 'input.accepted';
  clientMessageId?: string;
  queueDepth: number;
  durability: ConversationInputDurability;
};

export type ConversationMessageConfirmedEvent = {
  type: 'message.confirmed';
  seq: number;
  clientMessageId?: string;
  message: ConversationMessage;
};

export type ConversationMessageDeltaEvent = {
  type: 'message.delta';
  seq: number;
  messageId: string;
  delta: string;
};

export type ConversationMessageCompletedEvent = {
  type: 'message.completed';
  seq: number;
  message: ConversationMessage;
};

export type ConversationInputFailedEvent = {
  type: 'input.failed';
  clientMessageId?: string;
  error: string;
};

export type ConversationStatusChangedEvent = {
  type: 'status.changed';
  seq: number;
  status: ConversationStatus;
};

export type ConversationQueueChangedEvent = {
  type: 'queue.changed';
  queueDepth: number;
};

export type ConversationErrorEvent = {
  type: 'error';
  seq?: number;
  error: string;
};

export type ConversationReplayCompleteEvent = {
  type: 'replay.complete';
  sessionId: string;
  afterSeq: number | null;
};

export type ConversationServerEvent =
  | ConversationReadyEvent
  | ConversationInputAcceptedEvent
  | ConversationMessageConfirmedEvent
  | ConversationMessageDeltaEvent
  | ConversationMessageCompletedEvent
  | ConversationInputFailedEvent
  | ConversationStatusChangedEvent
  | ConversationQueueChangedEvent
  | ConversationErrorEvent
  | ConversationReplayCompleteEvent;

export type AgentFileSummary = {
  path: string;
  hash: string | null;
  size: number;
  updatedAt: string | null;
};

export type AgentFileListResponse = {
  files: AgentFileSummary[];
};

export type AgentFileDirectoryEntry = {
  path: string;
  name: string;
  type: 'file' | 'directory';
  hash: string | null;
  size: number;
  updatedAt: string | null;
};

export type AgentFileDirectoryResponse = {
  path: string;
  entries: AgentFileDirectoryEntry[];
};

export type AgentFile = {
  path: string;
  content: string;
  hash: string;
  size: number;
  updatedAt: string | null;
};

export type AgentFileWriteRequest = {
  path: string;
  content: string;
  expectedHash: string | null;
};

export type AgentFileWriteResult = {
  path: string;
  hash: string;
  previousHash: string | null;
};

export type AgentFileAuditEntry = {
  id: string;
  path: string;
  operation: string;
  previousHash: string | null;
  nextHash: string | null;
  createdAt: string;
};

export type AgentFileAuditResponse = {
  audits: AgentFileAuditEntry[];
};

export type RunStatus = {
  id: string;
  status: TurnStatus;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  sessionId: string | null;
  sessionFile: string | null;
  error: string | null;
};

export type ProjectionStreamKind = 'projection';

export type SessionStatusProjectionEvent = {
  type: 'session.status';
  sessionId: string;
  status: SessionStatus;
  seq?: number;
};

export type TurnStatusProjectionEvent = {
  type: 'turn.status';
  sessionId: string;
  turnId: string;
  status: TurnStatus;
  seq?: number;
};

export type MessageUpsertProjectionEvent = {
  type: 'message.upsert';
  sessionId: string;
  turnId: string;
  seq: number;
  message: SessionMessage;
};

export type MessageCompleteProjectionEvent = {
  type: 'message.complete';
  sessionId: string;
  turnId: string;
  seq: number;
  message: SessionMessage;
};

export type SessionProjectionReplayCompleteEvent = {
  type: 'session.replay_complete';
  sessionId: string;
  stream: ProjectionStreamKind;
};

export type SessionProjectionErrorEvent = {
  type: 'error';
  error: string;
  sessionId?: string;
};

export type SessionProjectionEvent =
  | SessionStatusProjectionEvent
  | TurnStatusProjectionEvent
  | MessageUpsertProjectionEvent
  | MessageCompleteProjectionEvent
  | SessionProjectionReplayCompleteEvent
  | SessionProjectionErrorEvent;

export type SessionDashboardSummary = Session & {
  latestTurnStatus: TurnStatus | null;
  lastMessagePreview: string | null;
  turnCount: number | null;
  messageCount: number | null;
  activity: 'queued' | 'active' | 'idle';
};

export type SessionDashboardListResponse = {
  sessions: SessionDashboardSummary[];
  nextCursor: string | null;
};
