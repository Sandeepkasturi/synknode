# Shared memory, device sharing and phone Share menu

Done already: files now auto-delete 3 days after upload (downloaded or not).

## 1. User accounts + personal storage ("My Space")
- Sign up / sign in for senders (email + Google). Existing SRGEC receiver login stays as is.
- Each user gets a private file space: upload, list, preview, delete, see used storage (e.g. 2 GB cap per user).
- From My Space, pick files and "Send to SRGEC" (goes into the existing FIFO queue) — no re-upload.
- Receiver download still permanently deletes the delivered copy; the user's own copy in My Space stays until they delete it (or 3-day rule if you prefer — default: My Space files are kept).

## 2. Direct device-to-device sharing
- "Nearby / Direct" tab: device A shows a 6-character pairing code + QR; device B enters/scans it.
- Files stream straight between the two browsers (peer-to-peer, already-installed peerjs), progress bar on both sides, nothing stored on servers.
- Both devices must be online and the page open. If direct connection fails, offer "Send via cloud instead".
- Signed-in users see their own other devices listed for one-tap pairing.

## 3. Installable app + phone Share menu
- Make SynkNode installable (app icon, name, splash colors).
- Android: after install, SynkNode appears in the system Share sheet; shared files open a "Shared to SynkNode" screen with: Send to SRGEC, Save to My Space, or Send to a paired device.
- Deep links: `/share`, `/space`, `/direct?code=XXXXXX`, `/receive` open the right screen directly (pairing links can be sent over WhatsApp etc.).
- iPhone: install to home screen works; Share-menu entry is not possible for web apps (needs native app later).
- Note: the Share menu and install only work on the published site, not in the editor preview.

## Technical details
- Tables: `profiles`, `user_files` (owner_id, path, name, size, type) with owner-only RLS; private bucket `user-space` with per-user folder policies; `pending_transfers` gains nullable `owner_id`/`source_file_id` — sending from My Space copies the object into `pending-files`.
- Peer: peerjs DataChannel, 64KB chunks with backpressure, pairing code = peer id; `device_presence` table for "my devices".
- PWA: manifest with `share_target` (POST multipart). File share targets require a service worker to receive the POST, so use vite-plugin-pwa `injectManifest` with a minimal worker that only handles `/share-target` (stores files in IndexedDB, redirects to `/share`), registered via a guarded wrapper (never in preview/iframe, `?sw=off` kill switch), NetworkFirst navigations.
- Routes added to React Router; tests for the 3-day rule and quota.
