# Restore Android file sharing and prompt visitors to install SynkNode

## Build
- Correct the service worker intake to accept files from the manifest's exact `files` field, preserve each original filename/type, validate empty, oversized, and excess files, and store the share before redirecting to the incoming-files page.
- Give failed, empty, and successful share arrivals clear outcomes on the incoming-files screen, without changing the existing SRGEC transfer pipeline.
- Add a dismissible app-wide install prompt: use the native install prompt when available, explain Android installation for Share Sheet support, and show iOS Add to Home Screen guidance without claiming iOS Share Sheet receiving works.
- Fix service-worker TypeScript typing and keep preview/dev registration guards intact.

## Verification
- Add focused tests for shared-file intake limits and run the relevant tests.
- Verify the preview's install prompt, incoming-shares screen, and current build diagnostics; report that native device Share Sheet testing requires an installed Android device.

## Technical details
- Keep temporary binary data in the existing IndexedDB inbox. Use the existing `useSenderPeer().sendFiles` path for delivery to SRGEC. Do not create another upload mechanism or alter receiver behavior.
