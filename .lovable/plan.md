# Warm responsive UI repair

## Goal
Fix the scattered desktop presentation and bring desktop and mobile into one coherent, warm, light SynkNode design based on the supplied reference.

## Scope
- Remove the root-level width, padding, and centered text constraints that can distort the entire application.
- Refine the shared app frame, navigation, transfer workspace, activity, analytics, and settings spacing so desktop content is aligned and usable.
- Preserve the mobile navigation and compact layouts while applying the same warm palette and visual hierarchy.
- Keep existing transfer, queue, receiver, authentication, and download behavior unchanged.

## Technical approach
- Keep responsive presentation in existing layout components and shared CSS breakpoints.
- Use semantic theme tokens for warm orange, soft peach, and restrained complementary accents; retain the existing theme switch.
- Check the live page at desktop and mobile dimensions, review diagnostics, and update the task roadmap.