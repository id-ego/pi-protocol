import { Type, type Static, type TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

export const PI_PROVIDER_PROTOCOL_NAME = 'pi-provider' as const;
export const PI_PROVIDER_PROTOCOL_VERSION = '2026-05' as const;
export const PI_PROVIDER_AGENT_BASELINE = 'pi-provider-agent-v0' as const;

export const ProviderProtocolSchema = Type.Object({
  name: Type.Literal(PI_PROVIDER_PROTOCOL_NAME),
  version: Type.String({ minLength: 1 }),
  baseline: Type.Literal(PI_PROVIDER_AGENT_BASELINE),
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
