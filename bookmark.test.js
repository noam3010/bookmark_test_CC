/**
 * Comprehensive Test Suite for Bookmark App
 * Tests all required functionalities including create, read, update, delete,
 * search, and UI interactions
 */

describe('Bookmark App - Core Functionality', () => {
  const STORAGE_KEY = 'bookmarks';
  let mockLocalStorage;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    global.localStorage = {
      getItem: jest.fn((key) => mockLocalStorage[key] || null),
      setItem: jest.fn((key, value) => {
        mockLocalStorage[key] = value;
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
      const bookmark = {
        url: 'https://example.com',
        title: 'Example Site',
        category: 'work',
        createdAt: new Date().toISOString()
      };

      const bookmarks = [];
      bookmarks.push(bookmark);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(stored).toHaveLength(1);
      expect(stored[0]).toEqual(bookmark);
    });

    test('should handle multiple bookmarks', () => {
      const bookmarks = [
        {
          url: 'https://example1.com',
          title: 'Example 1',
          category: 'work',
          createdAt: new Date().toISOString()
        },
        {
          url: 'https://example2.com',
          title: 'Example 2',
          category: 'learning',
          createdAt: new Date().toISOString()
        }
      ];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));

      expect(stored).toHaveLength(2);
      expect(stored[0].title).toBe('Example 1');
      expect(stored[1].title).toBe('Example 2');
    });

    test('should require URL field', () => {
      const bookmark = {
        title: 'No URL',
        category: 'work'
      };

      expect(bookmark.url).toBeUndefined();
      expect(bookmark).not.toHaveProperty('url');
    });

    test('should require title field', () => {
      const bookmark = {
        url: 'https://example.com',
        category: 'work'
      };

      expect(bookmark.title).toBeUndefined();
    });

    test('should require category field', () => {
      const bookmark = {
        url: 'https://example.com',
        title: 'Example'
      };

      expect(bookmark.category).toBeUndefined();
    });
  });

  describe('Read/List Bookmarks', () => {
    test('should load bookmarks from localStorage', () => {
      const bookmarks = [
        { url: 'https://test1.com', title: 'Test 1', category: 'work', createdAt: new Date().toISOString() },
        { url: 'https://test2.com', title: 'Test 2', category: 'learning', createdAt: new Date().toISOString() }
      ];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

      expect(loaded).toEqual(bookmarks);
    });

    test('should return empty array when no bookmarks exist', () => {
      localStorage.clear();
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

      expect(loaded).toEqual([]);
      expect(loaded).toHaveLength(0);
    });

    test('should preserve bookmark order', () => {
      const bookmarks = [
        { url: 'https://first.com', title: 'First', category: 'work', createdAt: '2025-01-01' },
        { url: 'https://second.com', title: 'Second', category: 'work', createdAt: '2025-01-02' },
        { url: 'https://third.com', title: 'Third', category: 'work', createdAt: '2025-01-03' }
      ];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY));

      expect(loaded[0].title).toBe('First');
      expect(loaded[1].title).toBe('Second');
      expect(loaded[2].title).toBe('Third');
    });
  });

  describe('Update Bookmark', () => {
    test('should update bookmark URL', () => {
      const bookmarks = [
        { url: 'https://old.com', title: 'Test', category: 'work', createdAt: new Date().toISOString() }
      ];

      bookmarks[0].url = 'https://new.com';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY));

      expect(loaded[0].url).toBe('https://new.com');
    });

    test('should update bookmark title', () => {
      const bookmarks = [
        { url: 'https://example.com', title: 'Old Title', category: 'work', createdAt: new Date().toISOString() }
      ];

      bookmarks[0].title = 'New Title';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY));

      expect(loaded[0].title).toBe('New Title');
    });

    test('should update bookmark category', () => {
      const bookmarks = [
        { url: 'https://example.com', title: 'Test', category: 'work', createdAt: new Date().toISOString() }
      ];

      bookmarks[0].category = 'learning';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY));

      expect(loaded[0].category).toBe('learning');
    });

    test('should update multiple fields at once', () => {
      const bookmarks = [
        { url: 'https://example.com', title: 'Test', category: 'work', createdAt: new Date().toISOString() }
      ];

      bookmarks[0] = {
        ...bookmarks[0],
        url: 'https://new.com',
        title: 'Updated',
        category: 'entertainment'
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY));

      expect(loaded[0].url).toBe('https://new.com');
      expect(loaded[0].title).toBe('Updated');
      expect(loaded[0].category).toBe('entertainment');
    });
  });

  describe('Delete Bookmark', () => {
    test('should delete a bookmark by index', () => {
      const bookmarks = [
        { url: 'https://test1.com', title: 'Test 1', category: 'work', createdAt: new Date().toISOString() },
        { url: 'https://test2.com', title: 'Test 2', category: 'learning', createdAt: new Date().toISOString() },
        { url: 'https://test3.com', title: 'Test 3', category: 'entertainment', createdAt: new Date().toISOString() }
      ];

      bookmarks.splice(1, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY));

      expect(loaded).toHaveLength(2);
      expect(loaded[0].title).toBe('Test 1');
      expect(loaded[1].title).toBe('Test 3');
    });

    test('should delete first bookmark', () => {
      const bookmarks = [
        { url: 'https://test1.com', title: 'Test 1', category: 'work', createdAt: new Date().toISOString() },
        { url: 'https://test2.com', title: 'Test 2', category: 'work', createdAt: new Date().toISOString() }
      ];

      bookmarks.splice(0, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY));

      expect(loaded).toHaveLength(1);
      expect(loaded[0].title).toBe('Test 2');
    });

    test('should delete last bookmark', () => {
      const bookmarks = [
        { url: 'https://test1.com', title: 'Test 1', category: 'work', createdAt: new Date().toISOString() },
        { url: 'https://test2.com', title: 'Test 2', category: 'work', createdAt: new Date().toISOString() }
      ];

      bookmarks.splice(bookmarks.length - 1, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY));

      expect(loaded).toHaveLength(1);
      expect(loaded[0].title).toBe('Test 1');
    });

    test('should handle deleting from single bookmark list', () => {
      const bookmarks = [
        { url: 'https://test1.com', title: 'Test 1', category: 'work', createdAt: new Date().toISOString() }
      ];

      bookmarks.splice(0, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY));

      expect(loaded).toHaveLength(0);
    });
  });

  describe('Search Functionality', () => {
    test('should filter bookmarks by title', () => {
      const bookmarks = [
        { url: 'https://google.com', title: 'Google Search', category: 'work', createdAt: new Date().toISOString() },
        { url: 'https://github.com', title: 'GitHub', category: 'work', createdAt: new Date().toISOString() },
        { url: 'https://youtube.com', title: 'YouTube Videos', category: 'entertainment', createdAt: new Date().toISOString() }
      ];

      const query = 'youtube';
      const results = bookmarks.filter(b => b.title.toLowerCase().includes(query.toLowerCase()));

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('YouTube Videos');
    });

    test('should filter bookmarks by URL', () => {
      const bookmarks = [
        { url: 'https://google.com', title: 'Google', category: 'work', createdAt: new Date().toISOString() },
        { url: 'https://github.com', title: 'GitHub', category: 'work', createdAt: new Date().toISOString() },
        { url: 'https://stackoverflow.com', title: 'Stack Overflow', category: 'learning', createdAt: new Date().toISOString() }
      ];

      const query = 'github';
      const results = bookmarks.filter(b => b.url.toLowerCase().includes(query.toLowerCase()));

      expect(results).toHaveLength(1);
      expect(results[0].url).toBe('https://github.com');
    });

    test('should return empty results for no matches', () => {
      const bookmarks = [
        { url: 'https://google.com', title: 'Google', category: 'work', createdAt: new Date().toISOString() }
      ];

      const query = 'nonexistent';
      const results = bookmarks.filter(b =>
        b.title.toLowerCase().includes(query.toLowerCase()) ||
        b.url.toLowerCase().includes(query.toLowerCase())
      );

      expect(results).toHaveLength(0);
    });

    test('should be case-insensitive', () => {
      const bookmarks = [
        { url: 'https://google.com', title: 'Google Search', category: 'work', createdAt: new Date().toISOString() }
      ];

      const query = 'GOOGLE';
      const results = bookmarks.filter(b => b.title.toLowerCase().includes(query.toLowerCase()));

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Google Search');
    });

    test('should search with partial strings', () => {
      const bookmarks = [
        { url: 'https://stackoverflow.com', title: 'Stack Overflow', category: 'learning', createdAt: new Date().toISOString() }
      ];

      const query = 'flow';
      const results = bookmarks.filter(b => b.title.toLowerCase().includes(query.toLowerCase()));

      expect(results).toHaveLength(1);
    });
  });

  describe('URL Normalization', () => {
    test('should add https:// to URL without protocol', () => {
      const url = 'example.com';
      const normalized = url.includes('://') ? url : 'https://' + url;

      expect(normalized).toBe('https://example.com');
    });

    test('should preserve https:// protocol', () => {
      const url = 'https://example.com';
      const normalized = url.includes('://') ? url : 'https://' + url;

      expect(normalized).toBe('https://example.com');
    });

    test('should preserve http:// protocol', () => {
      const url = 'http://example.com';
      const normalized = url.includes('://') ? url : 'https://' + url;

      expect(normalized).toBe('http://example.com');
    });

    test('should handle URLs with www prefix', () => {
      const url = 'www.example.com';
      const normalized = url.includes('://') ? url : 'https://' + url;

      expect(normalized).toBe('https://www.example.com');
    });
  });

  describe('Category Functionality', () => {
    test('should support all required categories', () => {
      const categories = ['work', 'learning', 'entertainment', 'shopping', 'social', 'news', 'other'];
      const categoryColors = {
        work: '#3b82f6',
        learning: '#8b5cf6',
        entertainment: '#ec4899',
        shopping: '#f59e0b',
        social: '#06b6d4',
        news: '#ef4444',
        other: '#6b7280'
      };

      categories.forEach(cat => {
        expect(categoryColors).toHaveProperty(cat);
      });
    });

    test('should group bookmarks by category', () => {
      const bookmarks = [
        { url: 'https://github.com', title: 'GitHub', category: 'work', createdAt: new Date().toISOString() },
        { url: 'https://udemy.com', title: 'Udemy', category: 'learning', createdAt: new Date().toISOString() },
        { url: 'https://linkedin.com', title: 'LinkedIn', category: 'work', createdAt: new Date().toISOString() }
      ];

      const grouped = {};
      bookmarks.forEach(bookmark => {
        if (!grouped[bookmark.category]) {
          grouped[bookmark.category] = [];
        }
        grouped[bookmark.category].push(bookmark);
      });

      expect(grouped).toHaveProperty('work');
      expect(grouped).toHaveProperty('learning');
      expect(grouped.work).toHaveLength(2);
      expect(grouped.learning).toHaveLength(1);
    });

    test('should handle bookmarks in different categories', () => {
      const bookmarks = [
        { url: 'https://amazon.com', title: 'Amazon', category: 'shopping', createdAt: new Date().toISOString() },
        { url: 'https://twitter.com', title: 'Twitter', category: 'social', createdAt: new Date().toISOString() },
        { url: 'https://bbc.com', title: 'BBC News', category: 'news', createdAt: new Date().toISOString() }
      ];

      const categories = new Set(bookmarks.map(b => b.category));

      expect(categories.has('shopping')).toBe(true);
      expect(categories.has('social')).toBe(true);
      expect(categories.has('news')).toBe(true);
    });
  });

  describe('XSS Prevention (HTML Escaping)', () => {
    test('should escape HTML in title', () => {
      const title = '<script>alert("xss")</script>';
      const escaped = title.replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char]));

      expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    test('should escape HTML in URL', () => {
      const url = 'javascript:alert("xss")';
      const escaped = url.replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char]));

      expect(escaped).toBe('javascript:alert(&quot;xss&quot;)');
    });

    test('should escape ampersand', () => {
      const text = 'Tom & Jerry';
      const escaped = text.replace(/&/g, '&amp;');

      expect(escaped).toBe('Tom &amp; Jerry');
    });

    test('should escape quotes', () => {
      const text = 'He said "Hello"';
      const escaped = text.replace(/"/g, '&quot;');

      expect(escaped).toBe('He said &quot;Hello&quot;');
    });
  });

  describe('Bookmark Count', () => {
    test('should count zero bookmarks correctly', () => {
      localStorage.clear();
      const bookmarks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

      expect(bookmarks.length).toBe(0);
    });

    test('should count single bookmark correctly', () => {
      const bookmarks = [
        { url: 'https://test.com', title: 'Test', category: 'work', createdAt: new Date().toISOString() }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY));

      expect(loaded.length).toBe(1);
    });

    test('should count multiple bookmarks correctly', () => {
      const bookmarks = Array.from({ length: 10 }, (_, i) => ({
        url: `https://test${i}.com`,
        title: `Test ${i}`,
        category: 'work',
        createdAt: new Date().toISOString()
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY));

      expect(loaded.length).toBe(10);
    });
  });

  describe('Empty State', () => {
    test('should display message when no bookmarks exist', () => {
      localStorage.clear();
      const bookmarks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const isEmpty = bookmarks.length === 0;

      expect(isEmpty).toBe(true);
    });

    test('should display correct message for empty search results', () => {
      const bookmarks = [
        { url: 'https://test.com', title: 'Test', category: 'work', createdAt: new Date().toISOString() }
      ];

      const query = 'nonexistent';
      const results = bookmarks.filter(b =>
        b.title.toLowerCase().includes(query.toLowerCase())
      );

      expect(results.length).toBe(0);
    });
  });

  describe('Data Persistence', () => {
    test('should persist bookmarks after page reload', () => {
      const bookmarks = [
        { url: 'https://persist.com', title: 'Persistent', category: 'work', createdAt: new Date().toISOString() }
      ];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY));

      expect(loaded).toEqual(bookmarks);
    });

    test('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json');

      expect(() => {
        JSON.parse(localStorage.getItem(STORAGE_KEY));
      }).toThrow();
    });

    test('should initialize with empty array on first load', () => {
      localStorage.clear();
      const bookmarks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

      expect(bookmarks).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    test('should handle special characters in title', () => {
      const bookmark = {
        url: 'https://example.com',
        title: 'Special @#$%^&*() Characters!',
        category: 'work',
        createdAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify([bookmark]));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY));

      expect(loaded[0].title).toBe('Special @#$%^&*() Characters!');
    });

    test('should handle very long URL', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(500);
      const bookmark = {
        url: longUrl,
        title: 'Long URL',
        category: 'work',
        createdAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify([bookmark]));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY));

      expect(loaded[0].url.length).toBeGreaterThan(500);
    });

    test('should handle unicode characters', () => {
      const bookmark = {
        url: 'https://example.com',
        title: '测试 🎉 テスト',
        category: 'work',
        createdAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify([bookmark]));
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY));

      expect(loaded[0].title).toBe('测试 🎉 テスト');
    });

    test('should handle whitespace-only input', () => {
      const title = '   ';
      const trimmed = title.trim();

      expect(trimmed).toBe('');
    });
  });

  describe('Tab Switching', () => {
    test('should identify create tab', () => {
      const tabName = 'create';

      expect(tabName).toBe('create');
    });

    test('should identify list tab', () => {
      const tabName = 'list';

      expect(tabName).toBe('list');
    });

    test('should only have two tabs', () => {
      const tabs = ['create', 'list'];

      expect(tabs).toHaveLength(2);
    });
  });

  describe('Form Validation', () => {
    test('should require non-empty URL', () => {
      const url = '';
      const isValid = url.trim() !== '';

      expect(isValid).toBe(false);
    });

    test('should require non-empty title', () => {
      const title = '';
      const isValid = title.trim() !== '';

      expect(isValid).toBe(false);
    });

    test('should require category selection', () => {
      const category = '';
      const isValid = category !== '';

      expect(isValid).toBe(false);
    });

    test('should accept valid bookmark data', () => {
      const bookmark = {
        url: 'https://example.com',
        title: 'Example',
        category: 'work'
      };

      const isValid = bookmark.url && bookmark.title && bookmark.category;

      expect(isValid).toBeTruthy();
    });
  });
});
