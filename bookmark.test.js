/**
 * Test Suite for Bookmark App
 *
 * These tests import the app's real helpers from bookmark-utils.js — the same
 * file create-bookmark.html loads in the browser. A bug in one of those helpers
 * therefore turns a test here red.
 *
 * Not covered: rendering (displayBookmarks) and DOM event handlers. Jest runs
 * in a node environment with no DOM, so those need jsdom or a browser runner.
 */

const {
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
} = require('./bookmark-utils');

const CATEGORIES = ['work', 'learning', 'entertainment', 'shopping', 'social', 'news', 'other'];

const sample = () => [
  { url: 'https://github.com', title: 'GitHub', category: 'work' },
  { url: 'https://developer.mozilla.org', title: 'MDN Web Docs', category: 'learning' },
  { url: 'https://news.ycombinator.com', title: 'Hacker News', category: 'news' }
];

describe('Bookmark App - Core Functionality', () => {
  let mockLocalStorage;

  beforeEach(() => {
    mockLocalStorage = {};
    global.localStorage = {
      getItem: jest.fn((key) => (key in mockLocalStorage ? mockLocalStorage[key] : null)),
      setItem: jest.fn((key, value) => {
        mockLocalStorage[key] = String(value);
      }),
      removeItem: jest.fn((key) => {
        delete mockLocalStorage[key];
      }),
      clear: jest.fn(() => {
        mockLocalStorage = {};
      })
    };
  });

  describe('Create Bookmark', () => {
    test('should create a new bookmark with valid data', () => {
      const bookmark = { url: 'https://example.com', title: 'Example', category: 'work' };

      saveBookmarks([bookmark]);

      expect(loadBookmarks()).toEqual([bookmark]);
    });

    test('should handle multiple bookmarks', () => {
      saveBookmarks(sample());

      const loaded = loadBookmarks();
      expect(loaded).toHaveLength(3);
      expect(loaded.map((b) => b.title)).toEqual(['GitHub', 'MDN Web Docs', 'Hacker News']);
    });

    test('should append to an existing list', () => {
      const added = { url: 'https://example.com', title: 'Example', category: 'other' };

      const result = appendBookmark(sample(), added);

      expect(result).toHaveLength(4);
      expect(result[3]).toEqual(added);
    });

    test('should not change the list it was given when appending', () => {
      const original = sample();

      appendBookmark(original, { url: 'https://example.com', title: 'Example', category: 'other' });

      expect(original).toHaveLength(3);
    });

    test('should write to the key the app reads from', () => {
      saveBookmarks(sample());

      expect(STORAGE_KEY).toBe('bookmarks');
      expect(JSON.parse(mockLocalStorage[STORAGE_KEY])).toHaveLength(3);
    });
  });

  describe('Read/List Bookmarks', () => {
    test('should load bookmarks from localStorage', () => {
      mockLocalStorage[STORAGE_KEY] = JSON.stringify(sample());

      expect(loadBookmarks()).toHaveLength(3);
    });

    test('should return empty array when no bookmarks exist', () => {
      expect(loadBookmarks()).toEqual([]);
    });

    test('should return empty array when the stored value is an empty string', () => {
      mockLocalStorage[STORAGE_KEY] = '';

      expect(loadBookmarks()).toEqual([]);
    });

    test('should preserve bookmark order', () => {
      const bookmarks = sample();
      saveBookmarks(bookmarks);

      expect(loadBookmarks().map((b) => b.url)).toEqual(bookmarks.map((b) => b.url));
    });
  });

  describe('Update Bookmark', () => {
    test('should update bookmark URL', () => {
      const result = updateBookmarkAt(sample(), 0, { url: 'https://github.com/noam3010' });

      expect(result[0].url).toBe('https://github.com/noam3010');
    });

    test('should update bookmark title', () => {
      const result = updateBookmarkAt(sample(), 1, { title: 'MDN' });

      expect(result[1].title).toBe('MDN');
    });

    test('should update bookmark category', () => {
      const result = updateBookmarkAt(sample(), 2, { category: 'social' });

      expect(result[2].category).toBe('social');
    });

    test('should update multiple fields at once', () => {
      const result = updateBookmarkAt(sample(), 0, {
        url: 'https://gitlab.com',
        title: 'GitLab',
        category: 'other'
      });

      expect(result[0]).toEqual({ url: 'https://gitlab.com', title: 'GitLab', category: 'other' });
    });

    test('should leave other bookmarks untouched', () => {
      const result = updateBookmarkAt(sample(), 0, { title: 'Changed' });

      expect(result[1]).toEqual(sample()[1]);
      expect(result[2]).toEqual(sample()[2]);
    });

    test('should not change the list it was given', () => {
      const original = sample();

      updateBookmarkAt(original, 0, { title: 'Changed' });

      expect(original[0].title).toBe('GitHub');
    });

    test('should leave the list unchanged for an index that does not exist', () => {
      expect(updateBookmarkAt(sample(), 99, { title: 'Nope' })).toEqual(sample());
    });
  });

  describe('Delete Bookmark', () => {
    test('should delete a bookmark by index', () => {
      const remaining = deleteBookmarkAt(sample(), 1);

      expect(remaining).toHaveLength(2);
      expect(remaining.map((b) => b.title)).toEqual(['GitHub', 'Hacker News']);
    });

    test('should delete first bookmark', () => {
      expect(deleteBookmarkAt(sample(), 0).map((b) => b.title)).toEqual(['MDN Web Docs', 'Hacker News']);
    });

    test('should delete last bookmark', () => {
      expect(deleteBookmarkAt(sample(), 2).map((b) => b.title)).toEqual(['GitHub', 'MDN Web Docs']);
    });

    test('should handle deleting from single bookmark list', () => {
      const only = [{ url: 'https://only.com', title: 'Only', category: 'other' }];

      expect(deleteBookmarkAt(only, 0)).toEqual([]);
    });

    test('should not change the list it was given', () => {
      const original = sample();

      deleteBookmarkAt(original, 0);

      expect(original).toHaveLength(3);
    });
  });

  describe('Search Functionality', () => {
    const bookmarks = sample();

    test('should filter bookmarks by title', () => {
      const results = filterBookmarks(bookmarks, 'hacker');

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Hacker News');
    });

    test('should filter bookmarks by URL', () => {
      const results = filterBookmarks(bookmarks, 'mozilla');

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('MDN Web Docs');
    });

    test('should return empty results for no matches', () => {
      expect(filterBookmarks(bookmarks, 'nothing-matches-this')).toEqual([]);
    });

    test('should be case-insensitive', () => {
      expect(filterBookmarks(bookmarks, 'GITHUB')).toHaveLength(1);
      expect(filterBookmarks(bookmarks, 'github')).toHaveLength(1);
    });

    test('should search with partial strings', () => {
      expect(filterBookmarks(bookmarks, 'git')).toHaveLength(1);
      expect(filterBookmarks(bookmarks, 'news')).toHaveLength(1);
    });

    test('should return every bookmark for an empty query', () => {
      expect(filterBookmarks(bookmarks, '')).toHaveLength(3);
    });

    test('should return every bookmark for a whitespace-only query', () => {
      expect(filterBookmarks(bookmarks, '   ')).toHaveLength(3);
    });

    test('should match on either title or URL', () => {
      // 'news' appears in one title and one URL, on different bookmarks.
      const results = filterBookmarks(
        [
          { url: 'https://example.com', title: 'News Daily', category: 'news' },
          { url: 'https://news.example.com', title: 'Example', category: 'news' }
        ],
        'news'
      );

      expect(results).toHaveLength(2);
    });

    test('should not mutate the list it filters', () => {
      const original = sample();
      filterBookmarks(original, 'github');

      expect(original).toHaveLength(3);
    });
  });

  describe('URL Normalization', () => {
    test('should add https:// to URL without protocol', () => {
      expect(normalizeUrl('example.com')).toBe('https://example.com');
    });

    test('should preserve https:// protocol', () => {
      expect(normalizeUrl('https://example.com')).toBe('https://example.com');
    });

    test('should preserve http:// protocol', () => {
      expect(normalizeUrl('http://example.com')).toBe('http://example.com');
    });

    test('should handle URLs with www prefix', () => {
      expect(normalizeUrl('www.example.com')).toBe('https://www.example.com');
    });

    test('should preserve a non-web scheme instead of double-prefixing it', () => {
      // Regression: the old check only looked for http/https, so ftp:// became
      // 'https://ftp://example.com'.
      expect(normalizeUrl('ftp://example.com')).toBe('ftp://example.com');
    });

    test('should not let a javascript: URL through as a live link', () => {
      // Regression: the old check let any '://' pass, so this stayed a javascript: link.
      expect(normalizeUrl('javascript://%0aalert(document.domain)'))
        .toBe('https://javascript://%0aalert(document.domain)');
    });

    test('should not let a data: URL through either', () => {
      expect(normalizeUrl('data://text/html,<script>alert(1)</script>'))
        .toBe('https://data://text/html,<script>alert(1)</script>');
    });

    test('should still add https:// to a bare host:port', () => {
      // A colon alone is not a scheme — only '://' is.
      expect(normalizeUrl('example.com:8080')).toBe('https://example.com:8080');
    });

    test('should return falsy input unchanged', () => {
      expect(normalizeUrl('')).toBe('');
      expect(normalizeUrl(undefined)).toBeUndefined();
    });

    test('should be case-insensitive about the scheme', () => {
      expect(normalizeUrl('HTTPS://example.com')).toBe('HTTPS://example.com');
    });
  });

  describe('XSS Prevention (HTML Escaping)', () => {
    test('should escape HTML in title', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    test('should escape HTML in URL', () => {
      expect(escapeHtml('https://x.com/?a=<b>')).toBe('https://x.com/?a=&lt;b&gt;');
    });

    test('should escape ampersand', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    test('should escape quotes', () => {
      expect(escapeHtml('He said "hi"')).toBe('He said &quot;hi&quot;');
    });

    test('should escape single quotes', () => {
      // Titles and URLs are inserted into HTML attributes, so apostrophes matter.
      expect(escapeHtml("O'Brien")).toBe('O&#039;Brien');
    });

    test('should escape every occurrence, not just the first', () => {
      expect(escapeHtml('<<>>')).toBe('&lt;&lt;&gt;&gt;');
    });

    test('should leave safe text untouched', () => {
      expect(escapeHtml('Hello world 123')).toBe('Hello world 123');
    });
  });

  describe('Data Persistence', () => {
    test('should persist bookmarks after page reload', () => {
      saveBookmarks(sample());

      // A reload is just another loadBookmarks() against the same store.
      expect(loadBookmarks()).toHaveLength(3);
    });

    test('should handle corrupted localStorage data gracefully', () => {
      // Regression: loadBookmarks used to call JSON.parse with no try/catch,
      // so bad data threw and broke the page on load.
      mockLocalStorage[STORAGE_KEY] = 'not valid json {{{';

      expect(() => loadBookmarks()).not.toThrow();
      expect(loadBookmarks()).toEqual([]);
    });

    test('should return empty array when the stored JSON is not an array', () => {
      mockLocalStorage[STORAGE_KEY] = JSON.stringify({ oops: true });

      expect(loadBookmarks()).toEqual([]);
    });

    test('should initialize with empty array on first load', () => {
      expect(loadBookmarks()).toEqual([]);
      expect(loadBookmarks()).toHaveLength(0);
    });

    test('should survive a save/load round trip without changing data', () => {
      const bookmarks = sample();
      saveBookmarks(bookmarks);

      expect(loadBookmarks()).toEqual(bookmarks);
    });
  });

  describe('Edge Cases', () => {
    test('should handle special characters in title', () => {
      const bookmark = { url: 'https://x.com', title: 'C++ & C# <tips>', category: 'learning' };
      saveBookmarks([bookmark]);

      expect(loadBookmarks()[0].title).toBe('C++ & C# <tips>');
      expect(escapeHtml(loadBookmarks()[0].title)).toBe('C++ &amp; C# &lt;tips&gt;');
    });

    test('should handle very long URL', () => {
      const url = 'https://example.com/' + 'a'.repeat(2000);
      saveBookmarks([{ url, title: 'Long', category: 'other' }]);

      expect(loadBookmarks()[0].url).toHaveLength(url.length);
    });

    test('should handle unicode characters', () => {
      const bookmark = { url: 'https://x.com', title: 'עברית 日本語 🔖', category: 'other' };
      saveBookmarks([bookmark]);

      expect(loadBookmarks()[0].title).toBe('עברית 日本語 🔖');
    });

    test('should find a unicode title by search', () => {
      expect(filterBookmarks([{ url: 'https://x.com', title: '🔖 Bookmark', category: 'other' }], '🔖'))
        .toHaveLength(1);
    });

    test('should treat a whitespace-only search as no search', () => {
      expect(filterBookmarks(sample(), '\t\n ')).toHaveLength(3);
    });
  });

  describe('Category Functionality', () => {
    test('should support all required categories', () => {
      saveBookmarks(CATEGORIES.map((category, i) => ({
        url: `https://example${i}.com`,
        title: `Site ${i}`,
        category
      })));

      expect(loadBookmarks().map((b) => b.category)).toEqual(CATEGORIES);
    });

    test('should handle bookmarks in different categories', () => {
      saveBookmarks(sample());

      const categories = loadBookmarks().map((b) => b.category);
      expect(new Set(categories).size).toBe(3);
    });

    test('should find bookmarks of one category after a save', () => {
      saveBookmarks(sample());

      expect(loadBookmarks().filter((b) => b.category === 'work')).toHaveLength(1);
    });
  });

  describe('Bookmark Count', () => {
    test('should count zero bookmarks correctly', () => {
      expect(loadBookmarks()).toHaveLength(0);
    });

    test('should count single bookmark correctly', () => {
      saveBookmarks([{ url: 'https://x.com', title: 'X', category: 'other' }]);

      expect(loadBookmarks()).toHaveLength(1);
    });

    test('should count multiple bookmarks correctly', () => {
      saveBookmarks(sample());

      expect(loadBookmarks()).toHaveLength(3);
    });

    test('should count filtered bookmarks, not all of them', () => {
      saveBookmarks(sample());

      expect(filterBookmarks(loadBookmarks(), 'github')).toHaveLength(1);
    });
  });

  describe('Form Validation', () => {
    const valid = { url: 'example.com', title: 'Example', category: 'work' };

    test('should accept valid bookmark data', () => {
      expect(validateBookmarkInput(valid)).toBeNull();
    });

    test('should reject an empty URL', () => {
      expect(validateBookmarkInput({ ...valid, url: '' })).toBe('Please enter a URL');
    });

    test('should reject a whitespace-only URL', () => {
      expect(validateBookmarkInput({ ...valid, url: '   ' })).toBe('Please enter a URL');
    });

    test('should reject an empty title', () => {
      expect(validateBookmarkInput({ ...valid, title: '' })).toBe('Please enter a title');
    });

    test('should reject a whitespace-only title', () => {
      // The HTML `required` attribute accepts "   ", so the JS has to catch it.
      expect(validateBookmarkInput({ ...valid, title: '   ' })).toBe('Please enter a title');
    });

    test('should reject a missing category', () => {
      expect(validateBookmarkInput({ ...valid, category: '' })).toBe('Please choose a category');
    });

    test('should report the URL first when several fields are empty', () => {
      expect(validateBookmarkInput({ url: '', title: '', category: '' })).toBe('Please enter a URL');
    });

    test('should handle missing fields entirely', () => {
      expect(validateBookmarkInput({})).toBe('Please enter a URL');
    });
  });
});
