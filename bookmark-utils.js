/**
 * Pure bookmark helpers, shared by create-bookmark.html and bookmark.test.js.
 *
 * This file is loaded two ways:
 *   - the browser, via <script src="bookmark-utils.js"> (functions become globals)
 *   - Jest, via require('./bookmark-utils')
 * Keep it free of DOM access so both work.
 */

const STORAGE_KEY = 'bookmarks';
const BACKUP_KEY = 'bookmarks-corrupt-backup';

// Load bookmarks from localStorage. Returns [] if there is nothing stored.
// If what is stored is not a valid list, the raw value is copied to BACKUP_KEY
// first, so the next save cannot silently erase it. Bad data still can't break
// page load.
function loadBookmarks() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
    } catch (e) {
        // Not JSON at all. Fall through to the backup below.
    }
    backupCorruptValue(stored);
    return [];
}

// Copy a value we could not read into BACKUP_KEY. Skips the write when the
// backup already holds the same value, so reloading the page does not churn.
function backupCorruptValue(raw) {
    try {
        if (localStorage.getItem(BACKUP_KEY) !== raw) {
            localStorage.setItem(BACKUP_KEY, raw);
        }
    } catch (e) {
        // Storage is full or blocked. Nothing more can be done safely here.
    }
}

// Save bookmarks to localStorage
function saveBookmarks(bookmarks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

// The three list changes the app makes. Each returns a new list and leaves
// the one passed in untouched.

// Add a bookmark to the end of the list.
function appendBookmark(bookmarks, bookmark) {
    return [...bookmarks, bookmark];
}

// Merge `changes` into the bookmark at `index`.
function updateBookmarkAt(bookmarks, index, changes) {
    return bookmarks.map((bookmark, i) => (i === index ? { ...bookmark, ...changes } : bookmark));
}

// Remove the bookmark at `index`.
function deleteBookmarkAt(bookmarks, index) {
    return bookmarks.filter((_, i) => i !== index);
}

// Find where a bookmark sits now, by its contents. Positions shift when other
// bookmarks are deleted, so an index saved earlier can point at the wrong one.
// Returns -1 if the bookmark is no longer in the list.
function findBookmarkIndex(bookmarks, target) {
    const wanted = JSON.stringify(target);
    return bookmarks.findIndex(bookmark => JSON.stringify(bookmark) === wanted);
}

// Remove the bookmark that matches `target` by contents. If it is already gone
// (deleted in another tab, say), the list comes back unchanged.
function deleteMatchingBookmark(bookmarks, target) {
    const index = findBookmarkIndex(bookmarks, target);
    return index === -1 ? bookmarks : deleteBookmarkAt(bookmarks, index);
}

// Filter a list of bookmarks by title or URL. An empty query returns them all.
function filterBookmarks(bookmarks, searchQuery) {
    if (!searchQuery || !searchQuery.trim()) {
        return bookmarks;
    }

    const query = searchQuery.toLowerCase();
    return bookmarks.filter(bookmark =>
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query)
    );
}

// Check a bookmark the user is about to save.
// Returns null when it is valid, or the message to show when it is not.
// The HTML `required` attribute is not enough: it accepts "   " as a value.
function validateBookmarkInput({ url, title, category }) {
    if (!url || !url.trim()) return 'Please enter a URL';
    if (!title || !title.trim()) return 'Please enter a title';
    if (!category || !category.trim()) return 'Please choose a category';
    return null;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
}

// Normalize URL - add https:// unless the URL already starts with an
// allowed scheme (http://, https://, ftp://). Anything else, including
// javascript:, is prefixed too, so it can never become a live script link.
// A bare host:port like example.com:8080 has no '://', so it gets https://.
const ALLOWED_URL_SCHEMES = /^(https?|ftp):\/\//i;

function normalizeUrl(url) {
    if (!url) return url;
    if (ALLOWED_URL_SCHEMES.test(url)) {
        return url;
    }
    return 'https://' + url;
}

// Export for Jest; harmless in the browser, where `module` is undefined.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        STORAGE_KEY,
        BACKUP_KEY,
        loadBookmarks,
        saveBookmarks,
        appendBookmark,
        updateBookmarkAt,
        deleteBookmarkAt,
        findBookmarkIndex,
        deleteMatchingBookmark,
        filterBookmarks,
        validateBookmarkInput,
        escapeHtml,
        normalizeUrl
    };
}
