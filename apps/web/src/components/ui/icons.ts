/** Inline SVG icon bodies from the design, drawn on a 24×24 grid with `currentColor` strokes. */
export const icons = {
  'arrow-right': '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  clipboard: '<path d="M9 3h6v3H9zM7 4.5H5V21h14V4.5h-2M8 11h8M8 15h5"/>',
  grid: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM9.5 10a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0"/>',
  bag: '<path d="M6 8h12l-1 12H7zM9 8a3 3 0 0 1 6 0"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="m14 7 3 3"/>',
  'pen-detailed': '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="m14 7 3 3"/><path d="M4 20l1-4"/>',
  highlighter: '<path d="m9 15-5 5h4l3-3"/><path d="M9 15 16 4l4 4-11 7Z"/>',
  tape: '<circle cx="11" cy="12" r="8"/><circle cx="11" cy="12" r="3"/><path d="M11 20h10v-4"/>',
  sticker: '<path d="M5 4h10l4 4v12H5z"/><path d="M15 4v4h4"/>',
  journal:
    '<rect x="6" y="3" width="14" height="18" rx="2"/><path d="M10 8h6"/><path d="M10 12h6"/><path d="M3 7h3"/><path d="M3 12h3"/><path d="M3 17h3"/>',
  organiser:
    '<path d="M6 10h12l-1 11H7z"/><path d="M9 10V3"/><path d="M12 10V5"/><path d="M15 10V2"/>',
} as const

export type IconName = keyof typeof icons
