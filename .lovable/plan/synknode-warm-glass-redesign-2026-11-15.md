# SynkNode Warm Glass Redesign

## Goal
Match the supplied four-screen SynkNode reference across the existing app while shifting its cool purple/blue look to warm, light glassmorphism. Preserve all transfer, authentication, queue, and install behavior.

## User-facing changes
- Rework the shared app shell and navigation to reflect the reference: compact brand/header, four main destinations, warm frosted surfaces, refined icons, and subtle motion.
- Restyle the Transfer view with the Send/Receive switch, sender and destination panels, drop area, selected files, and prominent gradient action.
- Restyle Activity with searchable queue/completed controls and scannable glass sender/file rows.
- Restyle Analytics with period controls and clear metric/chart panels, retaining existing live data.
- Restyle Settings with appearance and grouped preference/link rows, retaining current actions.
- Keep desktop navigation and mobile floating bottom navigation device-appropriate; adapt footer, dialogs, and install prompt to the same visual system.

## Technical approach
- Preserve existing React screens and business logic; change presentation markup/classes only where needed.
- Use semantic HSL theme tokens in `src/index.css` for warm white, peach, soft rose, and subtle lavender glass, plus orange/coral actions and accessible text contrast; keep dark theme functional.
- Use existing Lucide icons, shadcn controls, Framer Motion, and Recharts; avoid adding dependencies or embedding the reference image.
- Add restrained entrance/selection/hover motion and honor reduced-motion preferences.

## Verification
- Review desktop and mobile transfer, activity, analytics, and settings views in the running preview.
- Check for layout overflow, readable contrast, working existing controls, and browser/runtime/build diagnostics.
