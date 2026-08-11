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

export const app = {
  name: "Saddle Bronc",
  short: "SaddleBronc",
  domain: "saddlebronc.pro",
  eventType: "saddlebronc",
  eventLabel: "Saddle bronc riding",
  tagline: "Know the horse before you nod.",
  associations: ["PRCA","NIRA","NHSRA","IPRA"] as readonly string[],
} as const;

// Spacing follows the house rule from the BarrelConnect cursor rules:
// screens px-5 py-6 gap-y-6, cards p-4 rounded-2xl gap-y-2.
export const spacing = { screenX: 20, screenY: 24, gap: 24, cardPad: 16 } as const;
export const radius = { card: 16, pill: 999, control: 12 } as const;
