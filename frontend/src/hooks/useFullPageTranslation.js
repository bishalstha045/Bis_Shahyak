import { useEffect, useRef } from 'react';
import { translateText } from '../services/api';
import { UI_TRANSLATIONS } from '../utils/translations';

// WeakMaps for preserving pristine English texts and placeholders
const originalTextMap = new WeakMap();
const originalPlaceholderMap = new WeakMap();

// In-memory translation cache (keyed by `${lang}:${trimmedText}`)
const memoryCache = new Map();

// Load persisted cache from localStorage on startup
try {
  const saved = localStorage.getItem('bis_bhashini_cache_v2');
  if (saved) {
    const parsed = JSON.parse(saved);
    Object.entries(parsed).forEach(([k, v]) => memoryCache.set(k, v));
  }
} catch (e) {
  // Ignore storage errors
}

// Pre-populate memoryCache from static UI_TRANSLATIONS dictionaries (hi, kn, ur, ta, te)
if (UI_TRANSLATIONS.en) {
  Object.keys(UI_TRANSLATIONS).forEach((langCode) => {
    if (langCode === 'en') return;
    const langDict = UI_TRANSLATIONS[langCode];
    if (langDict) {
      Object.keys(UI_TRANSLATIONS.en).forEach((k) => {
        const enVal = UI_TRANSLATIONS.en[k];
        const translatedVal = langDict[k];
        if (enVal && translatedVal && typeof enVal === 'string' && typeof translatedVal === 'string') {
          memoryCache.set(`${langCode}:${enVal.trim()}`, translatedVal.trim());
        }
      });
    }
  });
}

function persistCache() {
  try {
    const obj = {};
    // Store only up to 2000 entries to keep localStorage compact
    let count = 0;
    for (const [k, v] of memoryCache.entries()) {
      obj[k] = v;
      count++;
      if (count > 2000) break;
    }
    localStorage.setItem('bis_bhashini_cache_v2', JSON.stringify(obj));
  } catch (e) {
    // Ignore quota errors
  }
}

// Check if string should be excluded from translation (numbers, IS codes, URLs, single letters, symbols)
function shouldSkipText(text) {
  if (!text) return true;
  const trimmed = text.trim();
  if (trimmed.length <= 1) return true;
  
  // Skip pure numbers, dates, times, currencies, phone numbers
  if (/^[\d\s.,:;+\-/%₹$€()]+$/.test(trimmed)) return true;
  
  // Skip standard Indian Standard IDs like IS 2347:2017 or IS 302
  if (/^IS\s+\d+/i.test(trimmed)) return true;
  
  // Skip URLs, emails, file extensions
  if (/(https?:\/\/|\.gov\.in|\.com|\.in|@|\.pdf|\.png|\.jpg)/i.test(trimmed)) return true;

  // Skip pure hex codes or hashes
  if (/^[0-9a-fA-F]{16,}$/.test(trimmed)) return true;

  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(trimmed)) return true;

  return false;
}

export function useFullPageTranslation(currentLanguage) {
  const isTranslatingRef = useRef(false);
  const debounceTimerRef = useRef(null);
  const currentLangRef = useRef(currentLanguage);
  currentLangRef.current = currentLanguage;

  useEffect(() => {
    const rootEl = document.getElementById('root');
    if (!rootEl) return;

    // If English or Auto, restore all original text nodes and placeholders
    if (currentLanguage === 'en' || currentLanguage === 'auto' || !currentLanguage) {
      restoreOriginalText(rootEl);
      return;
    }

    // Translate DOM for selected Bhashini language
    const triggerTranslation = (immediate = false) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (immediate) {
        translatePageDOM(rootEl, currentLanguage, isTranslatingRef);
      } else {
        debounceTimerRef.current = setTimeout(() => {
          translatePageDOM(rootEl, currentLanguage, isTranslatingRef);
        }, 80);
      }
    };

    // Initial translation run on language switch: instant zero-delay execution
    triggerTranslation(true);

    // Observe DOM changes (page/tab navigation, modal openings, chat messages)
    const observer = new MutationObserver((mutations) => {
      if (isTranslatingRef.current) return;
      if (currentLangRef.current === 'en' || currentLangRef.current === 'auto') return;

      let hasMeaningfulChange = false;
      for (const m of mutations) {
        if (m.type === 'childList' && m.addedNodes.length > 0) {
          for (const node of m.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
              hasMeaningfulChange = true;
              break;
            }
          }
        }
        if (hasMeaningfulChange) break;
      }

      if (hasMeaningfulChange) {
        triggerTranslation(false);
      }
    });

    observer.observe(rootEl, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [currentLanguage]);
}

/**
 * Restores original English text on all modified text nodes and inputs
 */
function restoreOriginalText(root) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    if (originalTextMap.has(node)) {
      const orig = originalTextMap.get(node);
      if (node.nodeValue !== orig) {
        node.nodeValue = orig;
      }
    }
  }

  // Restore input placeholders
  const inputs = root.querySelectorAll('input, textarea');
  inputs.forEach((input) => {
    if (originalPlaceholderMap.has(input)) {
      input.placeholder = originalPlaceholderMap.get(input);
    }
  });
}

/**
 * Traverses DOM text nodes, applies cached translations instantly,
 * and batches remaining untranslated strings through Bhashini NMT.
 */
async function translatePageDOM(root, targetLang, isTranslatingRef) {
  if (!root || !targetLang || targetLang === 'en') return;

  if (isTranslatingRef) isTranslatingRef.current = true;

  try {
    const pendingBatch = new Set();
    const textNodeQueue = [];
    const placeholderQueue = [];

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          const tagName = parent.tagName.toUpperCase();
          if (
            tagName === 'SCRIPT' ||
            tagName === 'STYLE' ||
            tagName === 'CODE' ||
            tagName === 'PRE' ||
            tagName === 'NOSCRIPT' ||
            tagName === 'SVG' ||
            tagName === 'PATH' ||
            parent.getAttribute('translate') === 'no' ||
            parent.classList?.contains('no-translate')
          ) {
            return NodeFilter.FILTER_REJECT;
          }

          const raw = node.nodeValue;
          if (shouldSkipText(raw)) return NodeFilter.FILTER_REJECT;

          return NodeFilter.FILTER_ACCEPT;
        }
      },
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      if (!originalTextMap.has(node)) {
        originalTextMap.set(node, node.nodeValue);
      }

      const orig = originalTextMap.get(node);
      const trimmed = orig.trim();
      if (shouldSkipText(trimmed)) continue;

      const cacheKey = `${targetLang}:${trimmed}`;
      if (memoryCache.has(cacheKey)) {
        // Instant in-memory replacement (zero latency)
        const translated = memoryCache.get(cacheKey);
        const replaced = orig.replace(trimmed, translated);
        if (node.nodeValue !== replaced) {
          node.nodeValue = replaced;
        }
      } else {
        pendingBatch.add(trimmed);
        textNodeQueue.push({ node, orig, trimmed });
      }
    }

    // Handle placeholders in input / textarea
    const inputs = root.querySelectorAll('input[placeholder], textarea[placeholder]');
    inputs.forEach((input) => {
      if (!originalPlaceholderMap.has(input)) {
        originalPlaceholderMap.set(input, input.placeholder);
      }
      const origPh = originalPlaceholderMap.get(input);
      const trimmed = origPh ? origPh.trim() : '';
      if (trimmed && !shouldSkipText(trimmed)) {
        const cacheKey = `${targetLang}:${trimmed}`;
        if (memoryCache.has(cacheKey)) {
          input.placeholder = memoryCache.get(cacheKey);
        } else {
          pendingBatch.add(trimmed);
          placeholderQueue.push({ input, origPh, trimmed });
        }
      }
    });

    if (pendingBatch.size === 0) return;

    // Batch translate uncached phrases via Bhashini in parallel
    const uniqueTexts = Array.from(pendingBatch);
    const CHUNK_SIZE = 35;
    const batches = [];
    for (let i = 0; i < uniqueTexts.length; i += CHUNK_SIZE) {
      batches.push(uniqueTexts.slice(i, i + CHUNK_SIZE));
    }

    await Promise.all(
      batches.map(async (batch) => {
        const joinedText = batch.join('\n');
        try {
          const res = await translateText({
            text: joinedText,
            source_language: 'en',
            target_language: targetLang
          });

          if (res) {
            const translatedLines = res.split('\n');
            batch.forEach((origText, idx) => {
              const trans = translatedLines[idx] || origText;
              if (trans && trans.trim()) {
                memoryCache.set(`${targetLang}:${origText}`, trans.trim());
              }
            });

            // Apply newly translated batch to active text nodes
            textNodeQueue.forEach(({ node, orig, trimmed }) => {
              const trans = memoryCache.get(`${targetLang}:${trimmed}`);
              if (trans) {
                const replaced = orig.replace(trimmed, trans);
                if (node.nodeValue !== replaced) {
                  node.nodeValue = replaced;
                }
              }
            });

            // Apply newly translated batch to placeholders
            placeholderQueue.forEach(({ input, trimmed }) => {
              const trans = memoryCache.get(`${targetLang}:${trimmed}`);
              if (trans) {
                input.placeholder = trans;
              }
            });

            persistCache();
          }
        } catch (err) {
          console.warn('[FullPageTranslation] Batch error:', err);
        }
      })
    );
  } finally {
    if (isTranslatingRef) isTranslatingRef.current = false;
  }
}
