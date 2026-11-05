# Bookmark app

A single-page bookmark manager. No build step, no framework, no server:
open `create-bookmark.html` in a browser and it works. Data lives in
`localStorage` under the key `bookmarks`.

## Layout

| File | What it is |
|---|---|
| `create-bookmark.html` | The whole app: markup, CSS, and the DOM/rendering code |
| `bookmark-utils.js` | Pure helpers shared by the app and the tests |
| `bookmark.test.js` | Jest suite (`testEnvironment: 'node'`, no DOM) |

## The one rule that matters

**Logic the tests need goes in `bookmark-utils.js`. Tests import it; they never
re-implement it.**

That file is loaded twice — by the browser via `<script src>`, and by Jest via
`require`, through the `typeof module` guard at the bottom. One copy of the
logic, used by both.

This exists because the original suite re-wrote each function inline and
asserted on the copy: 51 tests passed while covering 0% of the app, and two of
those copies had silently drifted from the real code. If a test writes its own
version of app logic, it is testing itself.

Keep `bookmark-utils.js` free of DOM access, or Jest can't load it.

## Commands

```
npm test                 # 69 tests
npm run test:coverage    # expect 100% statements, ~96% branches
```

Coverage only counts code reached through `require`, so the DOM code in
`create-bookmark.html` is invisible to it. That is a known gap, not a bug —
rendering, the modal and the event handlers have no tests.

## Checking the tests are honest

`.claude/agents/test-gap-auditor.md` is a read-only subagent that compares the
app's functions against the suite and reports which are really covered, which
are inline copies, and which are untested. Ask "are my tests real?" and it runs.
Worth running after changing logic in `create-bookmark.html`.

## Notes

- Validation lives in `validateBookmarkInput` and is shared by the create form
  and the edit modal. The HTML `required` attribute is not sufficient: it
  accepts `"   "` as a value.
- Validation messages render in the page, not via `alert()`, which the browser
  prefixes with the page origin (`file://`).
- Deleting a bookmark still uses `confirm()`, deliberately.
- There is no CI. Tests only run where someone runs them.
