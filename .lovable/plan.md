# SynkNode interface redesign

## Goal
Rebuild the application around the selected refined workspace direction while preserving every existing transfer, queue, preview, login, analytics, and security workflow.

## Design
- Apply the locked Charcoal & Ember palette throughout with high-contrast accessible surfaces.
- Use Syne for headings and Plus Jakarta Sans for body text and controls.
- Create a new geometric SynkNode mark based on two connected transfer nodes, with subtle animated packet flow.
- Replace the floating marketing layout with a compact application shell and responsive bento workspace.
- Use restrained entrances, transfer sweeps, status pulses, and tactile control feedback with reduced-motion support.

## Interface changes
- Rebuild the navigation into a compact desktop rail and mobile top bar using the real Home, Features, and About destinations.
- Recompose the home screen into bento areas for the transfer workspace, live analytics, receiver code, and system status.
- Restyle send/receive controls, file selection, progress, receiver access, queue cards, previews, and footer for one coherent system.
- Keep SKAV TECH details and all legal/public links visible in a cleaner footer.

## Technical details
- Add semantic color, shadow, motion, and typography tokens in the global theme.
- Build the logo as lightweight source markup so it loads reliably in production.
- Preserve all existing data handling and backend behavior; this update changes presentation only.
- Verify the result at desktop and mobile sizes, including queue interactions and upload controls.
