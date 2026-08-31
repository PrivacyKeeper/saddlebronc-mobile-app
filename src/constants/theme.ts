// src/constants/theme.ts
//
// Read from the live saddlebronc.pro stylesheet rather than from the spine
// document. Where the two disagree the shipped site wins: a user opening
// the app straight off the website should not feel a colour change.

export const colors = {
  background: '#0a0e1a',
  surface: '#121826',
  card: '#182031',
  border: '#28324a',
  text: '#d5dcea',
  muted: '#9aa8bf',
  accent: '#c9a227',
  accentAlt: '#7d8db0',
  cream: '#f0ead8',
  success: '#4ba36b',
  warning: '#d99a2b',
  danger: '#c8503f',
} as const;

/**
 * The events this app covers, EXACTLY as their codes appear in the
 * `reference_options` table.
 *
 * Deliberately separate from `app.eventType` below, which is the app's own
 * slug and does not match the database ("tiedown" vs "tie_down_roping").
 * Reusing the slug as a filter silently matched nothing: the query succeeded,
 * the screen said the producer was not running this event, and there was no
 * error anywhere to notice.
 *
 * A list because the mapping is genuinely one-to-many, and the entries are NOT
 * interchangeable. Heading and heeling are two ends of the same run and a
 * roper does one of them; steer wrestling and chute dogging are different
 * events with different rules; ranch rodeo is a whole card. Filing every run
 * under the first code turned a heeler into a header and collapsed ten ranch
 * events into one.
 *
 * `resultKind` is per event because it genuinely varies within a card:
 * roughstock is two judges marking the horse and the rider out of 25 each,
 * where the eight seconds is a pass/fail gate rather than the result, and
 * everything else is on the clock.
 */
export type AppEvent = {
  /** The `reference_options` code, not the app slug. */
  code: string;
  label: string;
  resultKind: 'time' | 'score';
};

const EVENTS = [
  { code: "saddle_bronc", label: "Saddle bronc", resultKind: "score" },
  { code: "ranch_bronc", label: "Ranch bronc", resultKind: "score" },
] as const;

/**
 * The event a run is filed under when nothing says otherwise.
 *
 * Separate from `app.events[0]` so callers get a value that is always there.
 * Indexing a list gives `AppEvent | undefined` under this tsconfig, and the
 * `?? something` that silences it is exactly the kind of quiet default that
 * put a heeler's run under the header's code in the first place.
 */
export const primaryEvent: AppEvent = EVENTS[0];

export const app = {
  name: "Saddle Bronc",
  short: "SaddleBronc",
  domain: "saddlebronc.pro",
  eventType: "saddlebronc",
  events: EVENTS as readonly AppEvent[],
  eventCodes: EVENTS.map((e) => e.code) as readonly string[],
  /**
   * What a run in this event is actually measured in.
   *
   * Roughstock is judged, not timed: a bronc ride is two judges marking the
   * horse and the rider out of 25 each, and the eight seconds is a pass/fail
   * gate rather than the result. Asking a bronc rider for "Time (seconds)" and
   * filing their 82-point ride in `final_time` records the wrong number in the
   * wrong column, and it reads back as an 82-second ride.
   *
   * "either" is for ranch rodeo, where the card is genuinely mixed — ranch
   * bronc is judged and every other event on it is timed.
   */
  resultKind: "score" as "time" | "score" | "either",
  eventLabel: "Saddle bronc riding",
  tagline: "Know the horse before you nod.",
  associations: ["PRCA","NIRA","NHSRA","IPRA"] as readonly string[],
} as const;

// Spacing follows the house rule from the BarrelConnect cursor rules:
// screens px-5 py-6 gap-y-6, cards p-4 rounded-2xl gap-y-2.
export const spacing = { screenX: 20, screenY: 24, gap: 24, cardPad: 16 } as const;
export const radius = { card: 16, pill: 999, control: 12 } as const;
