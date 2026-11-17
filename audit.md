# Accessibility audit — Championship Day

Target: WCAG 2.1 level AA. The event, the athlete names, and the available views are unchanged.
Some visible text did change, where the information was otherwise only in colour or in a control
name that did not match the control: the result status, the details control, and the athlete column
header. Those changes are listed under "Visual changes kept on purpose". Activating a control with
the mouse still does what it did before. Layout was checked at 320 px (phone) and 1060 px (desktop,
above the 64 rem breakpoint).

## Use of AI

Companies use AI to save time, and it was used here for that reason, including to draft the
implementation and parts of this audit. The decisions were made by a person, and that person
checked the AI output against the rendered page and against the wording of WCAG 2.1. 

## How the page was audited

- Code review of every component in `src/components` and `src/App.tsx`.
- Keyboard-only walkthrough (Tab, Shift+Tab, Enter, Space, arrow keys, Escape) in Chromium.
- Accessibility tree inspection (names, roles, states) in Chromium.
- Contrast ratios calculated from the colour tokens in `panda.config.ts`.
- Automated scan with axe-core, now part of the test suite (`src/App.test.tsx`).

## Summary

Failures of WCAG 2.1 AA. The original finding numbers are kept so the sections below still match.

| # | Area | Issue | WCAG 2.1 | Severity |
|---|------|-------|----------|----------|
| 1 | Session filters | Filters 2 and 3 not reachable, and none operable by keyboard | 2.1.1 | Critical |
| 2 | Session filters | Selected filter not exposed; the selection was colour only | 4.1.2, 1.4.1 | Serious |
| 4 | Results table | Qualified / Eliminated conveyed by colour only | 1.4.1 | Critical |
| 5 | Results table | "Bib" sort button named "Sort by rank" | 2.5.3, 2.4.6 | Serious |
| 7 | Results table | Athlete column has an empty header | 1.3.1 | Serious |
| 8 | Results table | Hidden duplicate table exposed to screen readers | 1.3.1 | Moderate |
| 9 | Results table | Horizontally scrolling table not keyboard scrollable at narrow widths | 2.1.1 | Moderate |
| 10 | Alerts dialog | Dialog has no name; focus leaves it and is not restored | 4.1.2, 2.4.3 | Critical |
| 11 | Header | Star button has no name and no state | 4.1.2 | Serious |
| 12 | Header | Share button named "Menu" | 2.4.6 | Serious |
| 14 | Header | Banner image with information has empty `alt` | 1.1.1 | Serious |
| 17 | View switcher | Tab role without the tab keyboard model or panels | 4.1.2, 1.3.1 | Serious |
| 18 | Global | Light-palette text on a dark canvas, because the page background token does not exist | 1.4.3 | Serious |
| 19 | Global | Borders below 3:1 against the surface they sit on | 1.4.11 | Moderate |

Changed, but not a WCAG 2.1 AA failure:

| # | Change | Why it is not a failure |
|---|--------|-------------------------|
| 3 | Hidden "N sessions shown" after a filter | 4.1.3 does not require a status message that the page was not already showing |
| 6 | `aria-sort` and a sort arrow | Not required by 1.3.1. It follows the ARIA table pattern |
| 13 | Status region kept mounted, so "Link copied" is more reliably announced and the buttons do not move | `role="status"` was already present. Layout shift is not a 2.1 AA criterion |
| 15 | "Show details" / "Hide details" and a chevron | 2.4.6 does not require unique names. 2.4.4 applies to links, not buttons |
| 16 | `aria-controls` on Details | Not required by any AA criterion |
| 20 | `min-height` instead of a fixed height | 200% browser zoom scales `rem` with the text, so clipping was not shown. This is a precaution for 1.4.12 |
| 21 | `<header>` moved out of `<main>` | That nesting is valid HTML. It is not a 1.3.1 failure |

## Findings and fixes

### 1. Session filters are not keyboard operable (reported by a colleague)

- **Problem:** filters were `<div role="button">`. Only the first had `tabIndex=0`; "All sessions"
and "Finished" had `tabIndex=-1`, so Tab skipped them. A `div` does not fire `click` on Enter or
Space, so even the first filter could not be activated.
- **User impact:** keyboard and switch users cannot filter sessions at all. Screen reader users
hear "button" but pressing it does nothing.
- **WCAG:** 2.1.1 Keyboard (A). 4.1.2 was considered and not used: the control had a name and a
role. What failed was operating it from the keyboard.
- **Fix:** native `<button type="button">` for every filter. Native buttons are focusable and
respond to Enter and Space, with no custom key handling.
- **Where:** `src/components/SessionFilters.tsx`.

### 2. Selected filter is not exposed

- **Problem:** the active filter was shown only by a filled background.
- **User impact:** screen reader users cannot tell which filter is applied.
- **WCAG:** 4.1.2 Name, Role, Value (A) for the missing pressed state, and 1.4.1 Use of Color (A)
because the selected chip was distinguished by fill colour alone. 1.3.1 is not the right citation:
the failure is a control state and a use of colour, not a missing structure.
- **Fix:** `aria-pressed` on each filter button (toggle-button pattern), grouped with
`role="group"` and `aria-label="Filter sessions"`. The selected chip is also marked visually by
bold text and a 2 px border, so the state does not depend on colour alone (1.4.1). The colour
change remains as an extra cue when the palette is active.

### 3. Filter result is not announced

- **Problem:** after choosing a filter the list changes silently.
- **User impact:** screen reader users do not know whether the filter worked or how many sessions
remain.
- **WCAG:** not a failure. 4.1.3 Status Messages (AA) applies only when a status message is already
presented. It does not require one to be added. The list changing on screen is the result of the
action, and it was already visible.
- **What was added anyway:** a visually hidden `role="status"` region in the schedule panel says
"3 sessions shown" or "1 session shown", so a screen reader user does not have to re-read the
list to learn whether the filter worked.
- **Where:** `src/App.tsx`.

### 4. Result status is conveyed by colour only (reported by a colleague)

- **Problem:** the Status cell contained only "—" with a green or pink background. Screen readers
read "dash". Both standings used the same text, so colour was the only thing that differed.
The backgrounds are also faint (about 1.2:1 against white), and in the dark tokens both were the
same colour (`#282d3a`). Comparing the two backgrounds with each other is not how WCAG measures
this; the failure is that colour was the only carrier of the information.
- **User impact:** people who cannot use the colour, including screen reader users, cannot tell who
qualified.
- **WCAG:** 1.4.1 Use of Color (A). 1.1.1 does not apply: "—" is text, not non-text content. 1.3.1
does not apply: the missing information is not a structure or a relationship expressed by layout.
- **Fix:** the cell now shows the standing as text ("Qualified" / "Eliminated"). The colour stays
as a secondary cue. Dark-theme tokens were also made distinct.
- **Where:** `src/components/ResultsTable.tsx`, `panda.config.ts`.

### 5. "Bib" sort button is named "Sort by rank"

- **Problem:** both sort buttons had `aria-label="Sort by rank"`; the Bib one is a copy-paste error.
- **User impact:** screen reader users hear two identical buttons and sort by the wrong column.
Voice-control users who say "click Bib" get no match because the name does not contain the
visible label.
- **WCAG:** 2.5.3 Label in Name (A), because the visible word "Bib" was not in the accessible name,
and 2.4.6 Headings and Labels (AA), because "Sort by rank" does not describe that button. 4.1.2
was not failed: the button had a name, the name was the wrong one.
- **Fix:** removed both `aria-label`s; the visible text is the accessible name.

### 6. Sort order is not exposed

- **Problem:** nothing on the column header said which column was sorted, or in which direction.
- **User impact:** the new row order is visible, so a sighted user can see the sequence. A screen
reader user is not told which header the sort belongs to, and nobody is told the direction
without comparing rows.
- **WCAG:** not a failure of 1.3.1. The row order already shows the sequence. `aria-sort` is part of
the ARIA table pattern, not a WCAG 2.1 requirement.
- **What was added anyway:** `aria-sort="ascending"` or `"descending"` on the active `<th>`, plus a
visible ▲ or ▼ on the active sort button. The icon is `aria-hidden`; `aria-sort` is what
assistive technology reads.
Existing click behaviour, including direction toggling per column, is unchanged. The button also
underlines and gains a background on hover (see Hover).

### 7. Athlete column has an empty header

- **Problem:** `<th />` with no text.
- **User impact:** when moving through cells, screen readers announce athlete names without a
column header, and the table structure is incomplete.
- **WCAG:** 1.3.1 (A).
- **Fix:** header text "Athlete" and `scope="col"` on all column headers.

### 8. Hidden duplicate table

- **Problem:** a second, visually hidden table with the same caption "Heat results" and a single
"—" cell.
- **User impact:** screen readers announce two tables with the same name; the second is noise.
- **WCAG:** 1.3.1 (A).
- **Fix:** removed.

### 9. Scrolling table is not keyboard scrollable

- **Problem:** at a 320 px viewport the table is wider than its `overflow-x: auto` container. An
earlier measurement, taken before the status text changed from "—" to "Qualified", was 342 px
inside 288 px. The text is longer now, so the overflow is at least that large. The container was
not focusable, and the only focusable cells (the sort buttons) are in the first columns.
- **User impact:** keyboard users cannot reach the Status column on narrow screens.
- **WCAG:** 2.1.1 (A); supports 1.4.10 Reflow (AA), where data tables are an allowed exception.
- **Fix:** the container is `role="region"`, `tabIndex={0}`, labelled by the table caption, with a
visible focus ring.

### 10. Alert preferences dialog is not accessible

- **Problem:** `<div role="dialog">` with no accessible name and no `aria-modal`. Tab moved focus
out to the page behind the scrim. On close, focus fell back to `<body>`.
- **User impact:** screen reader users hear "dialog" with no title and can wander into the hidden
page. Keyboard users lose their place after closing.
- **WCAG:** 4.1.2 Name, Role, Value (A) for the missing name, and 2.4.3 Focus Order (A) for focus
leaving the dialog and not returning. 1.3.1 is not cited: the dialog role was already present.
A missing `aria-modal` is not itself a failure once the element is a real modal dialog.
- **Fix:** native `<dialog>` opened with `showModal()`. This gives a real modal: the rest of the page
is inert, focus is contained, and it sits in the top layer. `aria-labelledby` points to the
heading. Escape (keydown and the native `cancel` event) calls `onClose`. On unmount, focus returns
to the element that opened it ("Manage alerts"). Initial focus stays on the first checkbox.
The scrim moved to `::backdrop`.
- **Follow-up, after checking it on a dark system theme:** the dialog fill (`surface.elevated`)
never resolved, because the palette class was missing (finding 18). The dialog was therefore
transparent: its text sat on top of "Manage alerts" and the page showed through the box. It now
has an opaque fill, a `border.primary` edge, a shadow, and `max-height` with scrolling so the
Close button stays reachable when text spacing or a large font wraps the content. The edge is
3.35:1 against the light dialog surface (`#757a86` on `#e2e3e8`) and 3.54:1 in dark
(`#949aa6` on `#3d4251`). An earlier note of 3.2:1 was the previous token measured against white,

which is not the surface this border sits on. The dialog opens in `useLayoutEffect`, so it does
not paint in the page flow for a frame before `showModal()`.

- **Where:** `src/components/AlertsModal.tsx`.

### 11. Star (favourite) button has no name or state

- **Problem:** icon-only button with an `aria-hidden` SVG and no label.
- **User impact:** screen readers announce just "button"; nobody can tell what it does or whether it
is on.
- **WCAG:** 4.1.2 (A).
- **Fix:** `aria-label="Favourite"` and `aria-pressed` reflecting the filled star.

### 12. Share button is named "Menu"

- **Problem:** `aria-label="Menu"` on a button that copies the page link.
- **User impact:** screen reader users expect a menu to open; the label misdescribes the action.
- **WCAG:** 2.4.6 Headings and Labels (AA). The label "Menu" does not describe the purpose, which
is to copy the page link. 4.1.2 was not failed: the button had a name.
- **Fix:** `aria-label="Copy link"`, which matches the "Link copied" confirmation.

### 13. "Link copied" confirmation

- **Problem:** the `role="status"` element was inserted together with its text. Many screen readers
only announce changes to live regions that already exist. On desktop, the new line also grew the
header, and because it is vertically centred the buttons jumped up.
- **User impact:** screen reader users may get no confirmation. Pointer users see the target move
right after clicking.
- **WCAG:** not a 4.1.3 failure. The confirmation already had `role="status"`, so a status message
that existed was programmatically determinable. Some screen readers do not announce a live region
that is inserted in the same moment as its text; keeping the region mounted is a robustness
improvement, not a repair of a failed criterion. The buttons moving is a separate problem, and
WCAG 2.1 AA has no criterion for layout shift.
- **What was changed anyway:** the status region is always rendered with reserved height; only its
text changes. Verified in Chromium that the buttons and tabs no longer move.
- **Where:** `src/components/SiteHeader.tsx`.

### 14. Banner image has empty alt text

- **Problem:** the banner image contains "Alpine skiing" and "Course: 58 gates, 180 m vertical
drop". The course information is not available anywhere else, but `alt=""` hid it.
- **User impact:** screen reader users miss the course details.
- **WCAG:** 1.1.1 Non-text Content (A).
- **Fix:** `alt="Alpine skiing. Course: 58 gates, 180 m vertical drop"`. A `<title>` was added to the
SVG asset as well.
- **Still open:** this is an image of text (1.4.5, AA). The proper fix is to render it as HTML text
styled the same way. I left the image as is because the visual layout is intentional; this is the
first follow-up I would make.

### 15. All "Details" buttons share the same name

- **Problem:** three buttons all named "Details".
- **User impact:** in a screen reader's list of buttons (or with voice control) they cannot be told
apart.
- **WCAG:** not a failure. 2.4.6 requires a label to describe the purpose. "Details" does that, and
each button is inside the heat it affects, so context disambiguates it. 2.4.6 does not require
unique names. 2.4.4 does not apply, because these are buttons, not links. A screen reader's list
of controls, and voice control, are still easier when the names differ. That is a usability
improvement.
- **What was changed anyway:** the visible label is "Show details" or "Hide details", with visually
hidden "for Heat 1" and so on. The visible words start the accessible name ("Show details for
Heat 1"), so 2.5.3 Label in Name still holds. A chevron rotates with the state. The paragraph
appearing was already a visible open state, so this is not a 1.4.1 fix. The rotation animates
only when `prefers-reduced-motion: no-preference` (2.3.3 is AAA and was not a failure here).

### 16. Details button is not linked to its content

- **Problem:** `aria-expanded` was correct, but there was no programmatic link from the button to
the revealed paragraph.
- **User impact:** assistive technology cannot jump from the control to the content it shows.
- **WCAG:** not a failure. `aria-controls` is not required at AA. It is a useful extra so assistive
technology can move from the button to the paragraph while the paragraph is shown.
- **What was added anyway:** `aria-controls` pointing at the detail paragraph while it is in the
DOM. The paragraph is not rendered when collapsed, so the attribute is omitted then rather than
pointing at an id that does not exist.

### 17. View switcher claims to be tabs but does not behave like tabs

- **Problem:** `<a href role="tab">` elements in a `role="tablist"`, with no `role="tabpanel"`, no
`aria-controls`, every tab in the Tab order, no arrow-key support, and Space did nothing on the
anchors.
- **User impact:** screen readers announce "tab, 1 of 3", and users then try arrow keys, which do
nothing. Panels are not associated with their tab.
- **WCAG:** 4.1.2 Name, Role, Value (A), because `role="tab"` claims the tab pattern and the
keyboard model and the panel relationship were not there, and 1.3.1 Info and Relationships (A),
because the shown view was not programmatically tied to the selected tab. 2.1.1 was not failed:
Tab reached every link and Enter activated it. Arrow keys and Space belong to the tab role, which
is 4.1.2, not proof that the control was impossible to use from the keyboard.
- **Fix:** `<button role="tab">` elements for the three views.
  - Every view stays in the Tab order. A roving `tabindex` was tried first and removed: it left only
  the selected view reachable with Tab. Selecting a view on focus was tried next and removed too:
  Tab landed on the next view and switched to it, so the open panel was never reached.
  - Tab moves from Schedule to Results to Medals without changing the open view. Enter, Space, or a
  click selects the focused view. After the three view buttons, Tab enters the open view:
  the filters on Schedule, the table on Results, the text on Medals. ArrowLeft/Right (and Up/Down
  for the stacked phone layout), Home and End select and move immediately.
  - `aria-controls` from the selected tab to its panel, and `role="tabpanel"` labelled by the tab,
  - the Medals panel has no focusable content, so it gets `tabIndex=0`, as the pattern recommends.

  Mouse behaviour and the three views are unchanged.
- **Where:** `src/components/ViewSwitcher.tsx`, `src/App.tsx`.

### 18. Design palette was not applied

- **What** `class="light"` **is:** Panda puts every colour token inside a `.light` or `.dark` class
(see `.panda/styles.css`). The class on `<html>` is the switch that defines those variables.
Without it, `var(--colors-surface-brand)` and the rest are unset, so those declarations are
dropped. Text then uses the browser's canvas colour, which on a dark colour scheme is light, not
dark. The 1.4.3 failure is the next step: `.light` sets the text to `#161923`, but the page
background was still invalid (the second bug below), so that dark text sat on the operating
system's dark canvas. The same missing variables made the alerts dialog transparent (finding 10).
- **Second bug:** `src/styles.css` painted the page with `--colors-background-base`, and no such
token exists. The body background was invalid even after the class was added.
- **Fix:** `class="light"` on `<html>`, `color-scheme: light` so the canvas stays light, and the
body background changed to the real token `--colors-surface-base` (`#ffffff`).
- **Dark theme:** the `.dark` tokens are corrected and `html.dark` sets `color-scheme: dark`. The page
ships on `.light`. Checked failures, now fixed: selected and hover tab text `#6e49ff` was 3.39:1 on
the page and 1.94:1 on `surface.subtle` (now `#b5a2ff`, 8.0:1 and 4.57:1); white text on the brand
hover `#a18afc` was 2.78:1, so the dark hover fill stays `#6e49ff` (5.17:1) and the hover cue is a
2 px ring; the checkbox accent uses the same `#b5a2ff`.
- **Where:** `index.html`, `src/styles.css`, `panda.config.ts`.

### 19. Low contrast of control borders

- **Problem:** `border.primary` (`#d7d9de`) was 1.4:1 against white, and `border.secondary`
(`rgba(215, 217, 225, 0.4)`) composites to `#eff0f3`, 1.14:1. In dark mode the secondary border
was 2.51:1 on the page and the primary border was 2.64:1 on the dialog surface.
- **User impact:** low-vision users cannot see control edges, card edges, table rows, or the line
under the tabs.
- **WCAG:** 1.4.11 Non-text Contrast (AA), which requires 3:1 against the surface the line sits on.
- **Fix:** both borders were re-picked so every place they are used clears 3:1.
  - Light: primary `#757a86` (3.35:1 on the dialog, 4.30:1 on white), secondary `#7c818d`
  (3.61:1 on the table hover, 3.90:1 on white).
  - Dark: primary `#949aa6` (3.54:1 on the dialog), secondary `#7d8391` (3.62:1 on the row hover,
  4.62:1 on the page).
  Session cards use `border.primary`, because their fill matches the page and the border is the
  only edge.

### 20. Fixed heights on text buttons

- **Problem:** `h: 10` (2.5 rem) on buttons with text.
- **Note:** the layout of these buttons is otherwise unchanged.
- **User impact:** if a label wraps, a fixed height can clip it. That was not reproduced. Browser
zoom at 200% scales `rem` together with the text, so 1.4.4 was not shown to fail.
- **WCAG:** not a confirmed failure. 1.4.12 Text Spacing (AA) is the plausible one: user spacing
styles can wrap a label inside a fixed height. `min-height` removes that risk. It is a precaution,
not a demonstrated repair.
- **Change:** `minH: 10` on filters, Details, Close and Manage alerts. Icon-only buttons keep their
fixed 40 × 40 px.

### 21. Landmark structure

- **Problem:** `<header>` sat inside `<main>`, so it was not exposed as the page banner, and the
views were bare `<section>`s with no names.
- **User impact:** landmark navigation does not offer a banner. That is poorer navigation, not a
broken relationship in the content.
- **WCAG:** not a 1.3.1 failure. A `header` inside `main` is valid HTML. It is simply not exposed as
a banner landmark. An unnamed `section` is also not a failure: without an accessible name it is
not mapped to a region at all.
- **What was changed anyway:** the header is now a sibling before `<main>` (wrapped in the same
layout container, so there is no visual change) and is exposed as a banner. The views are named
tab panels because of the tabs pattern in finding 17.

## Things checked that already passed

- `lang="en"` and a descriptive `<title>`.
- Visible focus indicators on all interactive elements. The light focus colour `#0078d0` is 4.57:1
against white. The ring is offset by 0.125 rem, so it sits on the page or dialog surface behind
the control, not on the purple fill. Against the dark page `#72baef` is 8.34:1, and against the
dark dialog surface it is 4.76:1.
- Text contrast in the light palette: primary `#161923` on white is 17.54:1; secondary `#5f6573`
on white is 5.84:1; white on brand `#5329ff` is 6.71:1.
- The dark brand button `#6e49ff` on the page `#161923` is 3.39:1. That passes 1.4.11 for the
button boundary, with little margin. White text on that fill is 5.17:1.
- Checkboxes in the dialog are native and labelled by wrapping `<label>` elements. The checked
accent in dark mode is `#b5a2ff`, 4.57:1 on the dialog surface. The unchecked box is painted by
the browser, not by `accent-color`, and its pixels were not measured. It is not claimed as a pass
of 1.4.11.
- Heading order: one `h1`; heat names and the dialog title are `h2`.

## Not changed, with reasoning

- **Target size 44 × 44 px (a Siteimprove rule):** this is WCAG 2.1 SC 2.5.5, level AAA. All targets
are 40 px high or more, which is well above the WCAG 2.2 AA minimum of 24 × 24 px (2.5.8).
Increasing them would change the intentional layout.
- **Image of text in the banner (1.4.5):** see finding 14.
- **Dark theme:** see finding 18.

## Tests

`src/App.test.tsx` now locks in the repaired behaviour (28 tests):

- the filters are reachable with Tab and work with Enter and Space; `aria-pressed` follows the
selection; the session count is announced,
- Tab moves from Schedule to Results to Medals without switching the view, then enters the open
view; Enter selects the focused view; arrow, Home and End keys select and move; the selected tab
controls a labelled panel,
- Details buttons read "Show details for Heat N", switch to "Hide details" when open, and
`aria-expanded` and `aria-controls` update,
- the dialog has a name, is open as a modal, takes focus, closes with Escape or Close, and returns
focus to the trigger,
- header buttons have names and state; the status region stays mounted,
- the results table shows status as text, has one table with all headers, sort buttons are named by
their visible labels, `aria-sort` updates, and the scroll region is focusable,
- an axe-core scan of each view and of the open dialog finds no violations. Colour contrast is
excluded because happy-dom does not compute styles; contrast was checked by hand above.

## Visual changes kept on purpose

The brief says the visual layout is intentional. Some of these changes are what a criterion
requires. The others are listed because they make a state visible or a name specific, and the
finding they belong to says they are not themselves an AA failure:

- Result status shown as text instead of "—" (1.4.1). Colour remains as a secondary cue.
- "Athlete" column header (1.3.1). The column already existed without a header.
- Selected filter marked by bold text and a 2 px border (1.4.1).
- Control border colour darkened (1.4.11, finding 19).
- Fixed heights changed to minimum heights. Not a confirmed 1.4.4 failure; it avoids clipping if
1.4.12 spacing wraps a label (finding 20).
- "Show details" / "Hide details" plus a rotating chevron, so the button's own label says whether
it is open. Not a 2.4.6 or 1.4.1 failure (finding 15).
- ▲ / ▼ on the active sort column, with `aria-sort`. Not a 1.3.1 failure (finding 6).
- `class="light"` and the page background, because without them the palette and the dialog fill do
not render (finding 18).

## Hover

Hover is an extra cue. It never reveals content, so 1.4.13 Content on Hover or Focus does not
apply: nothing appears on hover that is not already on the page, and the pointer can move away
without anything persisting. Every control that gains a hover background already has a
`:focus-visible` outline, so keyboard users are not left without a state.

| Element | Hover | Notes |
|---|---|---|
| Filter chips, Details, Close, icon buttons | `surface.subtle` background | already present |
| Selected filter, Manage alerts | lighter brand fill in light mode, plus a 2 px ring in `text.primary` | white on `#6e49ff` is 5.17:1. In dark mode the fill cannot move: lighter fails the text, darker fails the button against the page, so only the ring changes |
| Tabs | `surface.subtle` background, text shifts to `text.link_hover` | selected tab keeps `text.selected` |
| Sort buttons | `surface.subtle` background and an underline | |
| Result rows | `surface.base_alt` on every cell except Status | the Qualified / Eliminated colour stays put |
| Alert option labels | `surface.subtle` background | |

`surface.subtle` (`#eff0f3`) against the text (`#161923`) stays well above 4.5:1, so the hover
does not drop text below 1.4.3.

## Tooling fixes needed to run the checks

- **Node version:** Vite 8 / Rolldown need Node ≥ 22.12 (`node:util.styleText`). Added `.nvmrc`
(24) and `engines` in `package.json`.
- `**pnpm check`:** failed on `toBeInTheDocument` types. Added the `@testing-library/jest-dom/vitest`
types to `tsconfig.json`.
- `**pnpm lint`:** there was no Biome config, so defaults (double quotes, tabs) flagged every file.
Added `biome.json` matching the existing style (single quotes, 2 spaces, 100 columns). Import
sorting is off to match the existing import order. Line endings were normalised to LF.

`pnpm test`, `pnpm check` and `pnpm lint` all pass.
