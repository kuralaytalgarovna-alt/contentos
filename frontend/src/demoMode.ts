// Set only for the GitHub Pages static build (see the VITE_DEMO_MODE build
// flag). Every api/*.ts function checks this and, when true, delegates to
// the in-memory mock backend in src/demo/mockApi.ts instead of making a
// real HTTP call — so the whole app is click-through-able with no backend.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
