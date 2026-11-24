/**
 * Pure bookmark helpers, shared by create-bookmark.html and bookmark.test.js.
 *
 * This file is loaded two ways:
 *   - the browser, via <script src="bookmark-utils.js"> (functions become globals)
 *   - Jest, via require('./bookmark-utils')
 * Keep it free of DOM access so both work.
 */

const STORAGE_KEY = 'bookmarks';

// Load bookmarks from localStorage. Returns [] if there is nothing stored,
// or if what is stored is not valid JSON, so bad data can't break page load.
function loadBookmarks() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
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
        loadBookmarks,
        saveBookmarks,
        appendBookmark,
        updateBookmarkAt,
        deleteBookmarkAt,
        filterBookmarks,
        validateBookmarkInput,
        escapeHtml,
        normalizeUrl
    };
}
