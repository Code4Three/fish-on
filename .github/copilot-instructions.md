# Coding Style Preferences & Guidelines

## 1. Code Structure & Abstraction
- Favor flat, linear, and explicit code over abstract helper functions or multi-file indirection.
- Keep JSX markup inline within the main component's `return` statement.
- Do not split render logic into sub-render functions (e.g., `renderHeader()`, `renderCards()`) unless explicitly requested.
- Avoid creating custom React hooks for local logic used in only a single component.

## 2. Naming & Variables
- Use fully descriptive, explicit names for variables, parameters, and functions (e.g., `isCustomizationModalOpen` instead of `open` or `s`).
- Prefix all boolean variables with `is`, `has`, `should`, or `can`.
- Name component event handlers explicitly using `handle` + `[Target]` + `[Event]` (e.g., `handleDockPointerDown`).
- Avoid single-letter variable names outside standard loop indices (`i`) or basic array maps (`item => ...`).

## 3. React & State
- Group all `useState` and `useRef` declarations together at the top of the component.
- Do not wrap event handlers or calculated values in `useCallback` or `useMemo` unless performance optimization is explicitly requested.
- Perform array transformations or lookup filtering directly above the `return` block rather than inline deep inside JSX loops.

## 4. HTML & JSX Formatting
- Use semantic HTML elements (`<header>`, `<main>`, `<section>`, `<nav>`, `<table>`, `<button>`) instead of generic `<div>` elements wherever appropriate.
- Keep conditional markup rendering directly inline inside the JSX `return` block using short-circuit (`&&`) or ternary operators.
- Organize large JSX returns with standard section comments (e.g., `{/* ================= SECTION NAME ================= */}`).

## 5. Tailwind CSS & Styling
- Apply Tailwind CSS classes directly to `className` strings rather than extracting class strings into external objects, maps, or helper functions.
- Use simple template literals or ternary conditionals directly in `className` for dynamic styles.
- Maintain a consistent ordering for Tailwind utilities: Layout/Positioning -> Spacing/Sizing -> Typography -> Visual Colors/Borders.
- Prefer standard Tailwind spacing/sizing scale classes over arbitrary custom values (e.g., `p-4` over `p-[15px]`).