import { Type, type Static, type TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

export const PI_PROTOCOL_NAME = 'pi-protocol' as const;
export const PI_PROTOCOL_VERSION = '1.0.0' as const;

export const PI_PROVIDER_DISCOVERY_PATH = '/.well-known/pi-provider' as const;
export const PI_PROVIDER_PROFILE_PATH = '/provider/profile' as const;
export const PI_PROVIDER_HEALTH_PATH = '/health' as const;
export const PI_PROVIDER_RUNS_PATH = '/runs' as const;
export const PI_PROVIDER_SESSIONS_PATH = '/sessions' as const;
export const PI_PROVIDER_CONVERSATIONS_PATH = '/conversations' as const;

export function providerRunPath(runId: string): string {
  return `${PI_PROVIDER_RUNS_PATH}/${encodeURIComponent(runId)}`;
}

export function providerRunCancelPath(runId: string): string {
  return `${providerRunPath(runId)}/cancel`;
}

export function providerSessionPath(sessionId: string): string {
  return `${PI_PROVIDER_SESSIONS_PATH}/${encodeURIComponent(sessionId)}`;
}

export function providerSessionMessagesPath(sessionId: string): string {
  return `${providerSessionPath(sessionId)}/messages`;
}

export function providerSessionEventsPath(sessionId: string): string {
  return `${providerSessionPath(sessionId)}/events`;
}

export function providerSessionEventsStreamPath(sessionId: string): string {
  return `${providerSessionEventsPath(sessionId)}/stream`;
}

export function providerConversationPath(sessionId: string): string {
  return `${PI_PROVIDER_CONVERSATIONS_PATH}/${encodeURIComponent(sessionId)}`;
}

export function providerConversationMessagesPath(sessionId: string): string {
  return `${providerConversationPath(sessionId)}/messages`;
}

export function providerConversationStopPath(sessionId: string): string {
  return `${providerConversationPath(sessionId)}/stop`;
}

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

export const ProviderRunContextSchema = Type.Record(Type.String(), Type.Unknown());
export type ProviderRunContext = Static<typeof ProviderRunContextSchema>;

export const ProviderRunConstraintsSchema = Type.Record(Type.String(), Type.Unknown());
export type ProviderRunConstraints = Static<typeof ProviderRunConstraintsSchema>;

export const ProviderCreateRunRequestSchema = Type.Object({
  input: Type.String({ minLength: 1 }),
  context: Type.Optional(ProviderRunContextSchema),
  constraints: Type.Optional(ProviderRunConstraintsSchema),
});
export type ProviderCreateRunRequest = Static<typeof ProviderCreateRunRequestSchema>;

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

export const ProviderSessionListResponseSchema = Type.Object({
  sessions: Type.Array(ProviderSessionSchema),
  nextCursor: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
});
export type ProviderSessionListResponse = Static<typeof ProviderSessionListResponseSchema>;

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

export const ProviderSessionMessagesResponseSchema = Type.Object({
  messages: Type.Array(ProviderSessionMessageSchema),
  nextCursor: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
});
export type ProviderSessionMessagesResponse = Static<typeof ProviderSessionMessagesResponseSchema>;

export const ProviderSessionEventSchema = Type.Object({
  seq: Type.Number({ minimum: 0 }),
  sessionId: Type.String({ minLength: 1 }),
  type: Type.String({ minLength: 1 }),
  payload: Type.Unknown(),
  createdAt: Type.String({ minLength: 1 }),
});
export type ProviderSessionEvent = Static<typeof ProviderSessionEventSchema>;

export const ProviderSessionEventsResponseSchema = Type.Object({
  events: Type.Array(ProviderSessionEventSchema),
  nextSeq: Type.Union([Type.Number({ minimum: 0 }), Type.Null()]),
});
export type ProviderSessionEventsResponse = Static<typeof ProviderSessionEventsResponseSchema>;

export const ProviderConversationStatusSchema = Type.Union([
  Type.Literal('idle'),
  Type.Literal('queued'),
  Type.Literal('running'),
  Type.Literal('stopping'),
  Type.Literal('completed'),
  Type.Literal('failed'),
  Type.Literal('interrupted'),
]);
export type ProviderConversationStatus = Static<typeof ProviderConversationStatusSchema>;

export const ProviderConversationSchema = Type.Object({
  sessionId: Type.String({ minLength: 1 }),
  status: ProviderConversationStatusSchema,
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

export const ProviderConversationStopResponseSchema = Type.Object({
  ok: Type.Boolean(),
  stoppedCurrent: Type.Boolean(),
  cancelledQueued: Type.Number({ minimum: 0 }),
});
export type ProviderConversationStopResponse = Static<typeof ProviderConversationStopResponseSchema>;

export const ProviderSseEventNameSchema = Type.Union([
  Type.Literal('session.event'),
  Type.Literal('session.replay_complete'),
]);
export type ProviderSseEventName = Static<typeof ProviderSseEventNameSchema>;

export const ProviderSessionReplayCompleteEventSchema = Type.Object({
  seq: Type.Number({ minimum: 0 }),
  sessionId: Type.String({ minLength: 1 }),
  type: Type.Literal('session.replay_complete'),
  createdAt: Type.Optional(Type.String({ minLength: 1 })),
});
export type ProviderSessionReplayCompleteEvent = Static<typeof ProviderSessionReplayCompleteEventSchema>;

export const ProviderCompatibilityStatusSchema = Type.Union([
  Type.Literal('compatible'),
  Type.Literal('unsupported'),
  Type.Literal('unknown'),
  Type.Literal('unreachable'),
]);
export type ProviderCompatibilityStatus = Static<typeof ProviderCompatibilityStatusSchema>;

export type ProviderCompatibilityReport = {
  status: ProviderCompatibilityStatus;
  protocol: ProviderProtocol | null;
  checkedAt: string;
  reason: string | null;
};

export type SchemaValidationResult<T extends TSchema> =
  | { ok: true; value: Static<T> }
  | { ok: false; errors: string[] };

export type ProviderDiscoveryParseResult =
  | { ok: true; profile: ProviderProfile; compatibility: ProviderCompatibilityReport }
  | { ok: false; profile: null; compatibility: ProviderCompatibilityReport; errors: string[] };

export class PiProtocolValidationError extends Error {
  readonly errors: string[];

  constructor(errors: string[]) {
    super(`pi-protocol validation failed: ${errors.join('; ')}`);
    this.name = 'PiProtocolValidationError';
    this.errors = errors;
  }
}

export function getSchemaErrors<T extends TSchema>(schema: T, value: unknown): string[] {
  return [...Value.Errors(schema, value)].map((error) => {
    const path = error.path === '' ? '/' : error.path;
    return `${path}: ${error.message}`;
  });
}

export function checkSchema<T extends TSchema>(schema: T, value: unknown): value is Static<T> {
  return Value.Check(schema, value);
}

export function validateSchema<T extends TSchema>(schema: T, value: unknown): SchemaValidationResult<T> {
  if (Value.Check(schema, value)) {
    return { ok: true, value };
  }
  return { ok: false, errors: getSchemaErrors(schema, value) };
}

export function assertSchema<T extends TSchema>(schema: T, value: unknown): Static<T> {
  const result = validateSchema(schema, value);
  if (!result.ok) {
    throw new PiProtocolValidationError(result.errors);
  }
  return result.value;
}

export function createProviderProtocol(): ProviderProtocol {
  return { name: PI_PROTOCOL_NAME, version: PI_PROTOCOL_VERSION };
}

export function providerDiscoveryUrl(baseUrl: string | URL): URL {
  return providerUrl(baseUrl, PI_PROVIDER_DISCOVERY_PATH);
}

export function providerUrl(baseUrl: string | URL, path: string): URL {
  const url = new URL(baseUrl);
  const normalizedBase = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  url.pathname = `${normalizedBase}${normalizedPath}`;
  url.search = '';
  url.hash = '';
  return url;
}

export function classifyProviderProtocol(value: unknown, checkedAt = new Date().toISOString()): ProviderCompatibilityReport {
  const result = validateSchema(ProviderProtocolSchema, value);
  if (result.ok) {
    return { status: 'compatible', protocol: result.value, checkedAt, reason: null };
  }

  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>;
    const name = record.name;
    const version = record.version;
    if (name === PI_PROTOCOL_NAME && typeof version === 'string') {
      return {
        status: 'unsupported',
        protocol: null,
        checkedAt,
        reason: `unsupported protocol version: ${version}`,
      };
    }
    if (typeof name === 'string') {
      return { status: 'unsupported', protocol: null, checkedAt, reason: `unsupported protocol name: ${name}` };
    }
  }

  return { status: 'unknown', protocol: null, checkedAt, reason: result.errors.join('; ') };
}

export function classifyProviderProfile(value: unknown, checkedAt = new Date().toISOString()): ProviderCompatibilityReport {
  if (typeof value !== 'object' || value === null || !('protocol' in value)) {
    return { status: 'unknown', protocol: null, checkedAt, reason: 'missing protocol metadata' };
  }

  return classifyProviderProtocol((value as { protocol: unknown }).protocol, checkedAt);
}

export function unreachableProviderCompatibility(
  reason: string,
  checkedAt = new Date().toISOString(),
): ProviderCompatibilityReport {
  return { status: 'unreachable', protocol: null, checkedAt, reason };
}

export function parseProviderProfile(value: unknown, checkedAt = new Date().toISOString()): ProviderDiscoveryParseResult {
  const result = validateSchema(ProviderProfileSchema, value);
  if (result.ok) {
    return {
      ok: true,
      profile: result.value,
      compatibility: { status: 'compatible', protocol: result.value.protocol, checkedAt, reason: null },
    };
  }

  return {
    ok: false,
    profile: null,
    compatibility: classifyProviderProfile(value, checkedAt),
    errors: result.errors,
  };
}

export function parseProviderHealth(value: unknown): SchemaValidationResult<typeof ProviderHealthSchema> {
  return validateSchema(ProviderHealthSchema, value);
}

export function parseProviderErrorEnvelope(value: unknown): SchemaValidationResult<typeof ProviderErrorEnvelopeSchema> {
  return validateSchema(ProviderErrorEnvelopeSchema, value);
}

export function parseProviderRun(value: unknown): SchemaValidationResult<typeof ProviderRunSchema> {
  return validateSchema(ProviderRunSchema, value);
}

export function parseProviderSession(value: unknown): SchemaValidationResult<typeof ProviderSessionSchema> {
  return validateSchema(ProviderSessionSchema, value);
}

export function parseProviderConversation(value: unknown): SchemaValidationResult<typeof ProviderConversationSchema> {
  return validateSchema(ProviderConversationSchema, value);
}

export function createProviderProfile(input: {
  profile: ProviderProfileInfo;
  skills: ProviderSkill[];
}): ProviderProfile {
  return assertSchema(ProviderProfileSchema, {
    protocol: createProviderProtocol(),
    profile: input.profile,
    skills: input.skills,
  });
}

export function createProviderHealth(input: {
  service: string;
  version: string;
  status: ProviderHealthStatus;
  ok?: boolean;
}): ProviderHealth {
  return assertSchema(ProviderHealthSchema, {
    ok: input.ok ?? true,
    service: input.service,
    version: input.version,
    protocol: createProviderProtocol(),
    status: input.status,
  });
}

export function createProviderErrorEnvelope(input: {
  code: string;
  message: string;
  retryable?: boolean;
  details?: Record<string, unknown>;
}): ProviderErrorEnvelope {
  return assertSchema(ProviderErrorEnvelopeSchema, {
    error: {
      code: input.code,
      message: input.message,
      retryable: input.retryable ?? false,
      details: input.details ?? {},
    },
  });
}

export function createProviderRun(input: ProviderRun): ProviderRun {
  return assertSchema(ProviderRunSchema, input);
}

export function createProviderSession(input: ProviderSession): ProviderSession {
  return assertSchema(ProviderSessionSchema, input);
}

export function createProviderSessionListResponse(input: {
  sessions: ProviderSession[];
  nextCursor?: string | null;
}): ProviderSessionListResponse {
  return assertSchema(ProviderSessionListResponseSchema, {
    sessions: input.sessions,
    nextCursor: input.nextCursor ?? null,
  });
}

export function createProviderSessionMessage(input: ProviderSessionMessage): ProviderSessionMessage {
  return assertSchema(ProviderSessionMessageSchema, input);
}

export function createProviderSessionMessagesResponse(input: {
  messages: ProviderSessionMessage[];
  nextCursor?: string | null;
}): ProviderSessionMessagesResponse {
  return assertSchema(ProviderSessionMessagesResponseSchema, {
    messages: input.messages,
    nextCursor: input.nextCursor ?? null,
  });
}

export function createProviderSessionEvent(input: ProviderSessionEvent): ProviderSessionEvent {
  return assertSchema(ProviderSessionEventSchema, input);
}

export function createProviderSessionEventsResponse(input: {
  events: ProviderSessionEvent[];
  nextSeq?: number | null;
}): ProviderSessionEventsResponse {
  return assertSchema(ProviderSessionEventsResponseSchema, {
    events: input.events,
    nextSeq: input.nextSeq ?? null,
  });
}

export function createProviderSessionReplayCompleteEvent(
  input: ProviderSessionReplayCompleteEvent,
): ProviderSessionReplayCompleteEvent {
  return assertSchema(ProviderSessionReplayCompleteEventSchema, input);
}

export function createProviderConversation(input: ProviderConversation): ProviderConversation {
  return assertSchema(ProviderConversationSchema, input);
}

export function createProviderConversationSendResponse(
  input: ProviderConversationSendResponse,
): ProviderConversationSendResponse {
  return assertSchema(ProviderConversationSendResponseSchema, input);
}

export function createProviderConversationStopResponse(input: {
  stoppedCurrent: boolean;
  cancelledQueued: number;
  ok?: boolean;
}): ProviderConversationStopResponse {
  return assertSchema(ProviderConversationStopResponseSchema, {
    ok: input.ok ?? true,
    stoppedCurrent: input.stoppedCurrent,
    cancelledQueued: input.cancelledQueued,
  });
}

export function isProviderProtocol(value: unknown): value is ProviderProtocol {
  return checkSchema(ProviderProtocolSchema, value);
}

export function isProviderProfile(value: unknown): value is ProviderProfile {
  return checkSchema(ProviderProfileSchema, value);
}

export function isProviderHealth(value: unknown): value is ProviderHealth {
  return checkSchema(ProviderHealthSchema, value);
}

export function isProviderErrorEnvelope(value: unknown): value is ProviderErrorEnvelope {
  return checkSchema(ProviderErrorEnvelopeSchema, value);
}

export function isProviderRun(value: unknown): value is ProviderRun {
  return checkSchema(ProviderRunSchema, value);
}

export function isProviderSession(value: unknown): value is ProviderSession {
  return checkSchema(ProviderSessionSchema, value);
}

export function isProviderConversation(value: unknown): value is ProviderConversation {
  return checkSchema(ProviderConversationSchema, value);
}
