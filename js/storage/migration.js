export const CURRENT_SCHEMA_VERSION = 3;
export const LEGACY_STATE_KEY = 'leitner_v2';

export function needsMigration(snapshot) {
  const version = Number(snapshot?._version ?? snapshot?.version ?? CURRENT_SCHEMA_VERSION);
  return Number.isFinite(version) && version < CURRENT_SCHEMA_VERSION;
}

export function migrate(snapshot) {
  return snapshot && typeof snapshot === 'object' ? { ...snapshot, _version: CURRENT_SCHEMA_VERSION } : null;
}
