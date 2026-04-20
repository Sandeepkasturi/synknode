// ─── Supabase client — DEPRECATED ────────────────────────────────────────────
// SynkDrop has fully migrated to Firebase. This stub prevents legacy components
// that still import `supabase` from crashing the app at startup.
// These components (ManageReceiversDialog, SenderQueue, FilePreview) are no
// longer used anywhere in the new codebase and can be safely deleted.

export const supabase = {
  from: () => ({ select: async () => ({ data: [], error: null }), insert: async () => ({ error: null }), delete: () => ({ eq: async () => ({ error: null }) }) }),
  storage: { from: () => ({ download: async () => ({ data: null, error: new Error("Supabase removed") }) }) },
  channel: () => ({ on: () => ({ subscribe: () => {} }) }),
  removeChannel: () => {},
  auth: { getUser: async () => ({ data: { user: null }, error: null }) },
} as any;