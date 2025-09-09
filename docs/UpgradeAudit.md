# Sallie 1.0 Upgrade Audit

Opinionated protocol for safely evolving Sallie without silent personality, capability, or aesthetic drift.

## Objectives

1. Preserve user‑aligned persona & tone across releases.
2. Prevent un‑consented capability addition/removal.
3. Guarantee reversible upgrades with forensic trace.
4. Surface meaningful deltas (ignore noise like build timestamps).

## Fingerprint (Deterministic Composite Hash)

Concatenate normalized JSON of each segment → SHA256 → `releaseFingerprint`.

Segments:

| Segment | Source | Normalization | Rationale |
|---------|--------|---------------|-----------|
| personaToneHash | Core persona + tone config | Sorted keys; strip volatile fields | Detect behavioral drift |
| moduleListHash | Declared feature/module registry (names + required=true flags + versions) | Alphabetical list | Catch missing/added core modules |
| styleConfigHash | Theme tokens (colors, typography scales) | Lowercase hex; sorted | Prevent silent visual shifts |
| featureFlagsHash | Stable flag set (id + default) | Sorted by id | Avoid stealth enabling experimental flags |
| migrationPlanHash | DB / storage migrations manifest | Ordered by version | Ensure migration continuity |
| securityPolicyHash | Consent + data retention policy versions | Canonical JSON | Block downgrades weakening policy |
| dependencyHash | Locked dependency name@version (prod only) | Sorted, exclude devDeps | Alert on critical lib jumps |

`releaseFingerprint = sha256( personaToneHash + moduleListHash + styleConfigHash + featureFlagsHash + migrationPlanHash + securityPolicyHash + dependencyHash )`

Store prior fingerprints in an append‑only signed log (`upgrade_log.jsonl`), one line per release:

{ "version":"0.1.0", "fingerprint":"…", "ts": 1712345678, "signature":"ed25519:…" }

{ "version":"0.1.0", "fingerprint":"…", "ts": 1712345678, "signature":"ed25519:…" }

## Upgrade Flow

1. Preflight: build candidate ➜ generate all segment hashes.
2. Compare against last accepted release.
3. Classify deltas (see Decision Matrix).
4. If any user‑sensitive class (Persona, Style, Security) changed ➜ queue consent dialog before activation.
5. Run integrity checks (signatures, schema migrations dry‑run, hash reproducibility >=2 runs).
6. If passes & (consent not required OR granted) ➜ apply migrations atomically (transaction / snapshot).
7. Write new signed log entry; retain previous assets for rollback.
8. Emit analytics event `upgrade_applied` with summarized diff categories only (no PII).

## Decision Matrix

| Delta Category | Examples | Action |
|----------------|----------|--------|
| NONE (hash equal) | Bugfix code only | Auto accept |
| MODULE_ADD (non‑required) | New optional feature | Soft notify (changelog badge) |
| MODULE_REMOVE or REQUIRED_MODULE_MISSING | Removed GoalAligner | Reject build |
| PERSONA_TONE_DRIFT | personaToneHash change | Require explicit user consent |
| STYLE_VARIATION | styleConfigHash change | Inline preview + consent |
| SECURITY_POLICY_CHANGE | Retention reduced, new consent scope | Block until re‑consented |
| FEATURE_FLAGS_CHANGE | New flag default=on | Show toggle diff, allow opt‑out before continue |
| DEPENDENCY_MAJOR_BUMP | lib X 1.x → 2.x | Elevated warning; require maintainer sign‑off |
| MIGRATION_PLAN_GAP | Missing prior version step | Reject (force rebase) |

## Rejection Criteria (Hard Fail)

- Any required module removed or renamed.
- Persona/tone or style change denied by user.
- Security policy hash change without consent.
- Migration plan non‑continuous (missing intermediate).
- Dependency major bump lacking maintainer approval flag.
- Fingerprint non‑deterministic across two consecutive generation runs.

## Rollback Strategy

Capture before/after snapshots:

- Data: export critical stores (encrypted) before migrations.
- Code/Assets: keep previous bundle & integrity hash.
Trigger rollback if:
- Post‑upgrade health checks fail (crash loop, migration error, checksum mismatch).
- User selects "Revert" within grace window (e.g., 24h) and no irreversible schema change.

Rollback Procedure:

1. Disable new modules (flag override).
2. Restore previous data snapshot.
3. Reinstate prior releaseFingerprint as active.
4. Log `rollback` entry with cause + diagnostics hash.

## Logging & Forensics

Each upgrade emits structured events:

upgrade_attempt { version, classification[], requiresConsent, ts }
upgrade_consent { version, granted:bool, ts }
upgrade_applied { version, fingerprint, segmentsChanged:[...], ts }
rollback { fromVersion, toVersion, cause, ts }

Persist minimal diff metadata only (never raw persona text).

## Tooling Hooks

- Gradle task `:auditFingerprint` (future) outputs segment hashes JSON.
- Node script `npm run audit:web` (future) ensures style & dependency segments align.
- CI gate: compares fingerprint vs main; blocks PR if unauthorized category delta.

## Consent UX Principles

Show concise diff chips (e.g., Tone: "supportive → direct", Style: 2 colors changed). Provide preview toggle. Deny leaves current version untouched.

## Future Enhancements

- Supply chain: include SLSA provenance attestation hash.
- Multi‑signature: maintainer + automated policy signer.
- Drift telemetry: anonymized aggregate of denied upgrade reasons.

## Minimal Implementation Now

1. Implement fingerprint generation script (personality, modules, style).
2. Store previous fingerprint locally.
3. Block activation if persona/style diff without confirmation.
4. Append signed log entry when accepted.
5. Add CI check comparing PR fingerprint vs main baseline.

This staged path delivers immediate protection while allowing incremental hardening.
