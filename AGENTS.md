# Architecture rules

- Keep device-specific layouts in presentation components and shared CSS breakpoints; both layouts must use the same transfer and authentication hooks to preserve behavior.
- Route all receiver download controls through one delivery-and-cleanup service so individual, bulk, and preview downloads follow the same deletion ordering and error handling.