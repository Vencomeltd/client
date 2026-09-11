// Whole-page dynamic translation: walks the currently rendered DOM and
// swaps visible text for a cached (or freshly-fetched) translation, rather
// than maintaining per-string translation files or per-language routes.
// A MutationObserver in TranslationContext re-runs this after SPA
// navigation/re-renders so newly rendered text gets caught too.

const CACHE_PREFIX = "vencome_translate_";
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SELECT", "OPTION"]);

// True original text per DOM text node, so switching back to English (or
// to a different language) always translates from the real source text
// instead of re-translating an already-translated string.
const originalText = new WeakMap();

function getCache(lang) {
  try {
    return JSON.parse(localStorage.getItem(CACHE_PREFIX + lang) || "{}");
  } catch {
    return {};
  }
}

function setCache(lang, cache) {
  try {
    localStorage.setItem(CACHE_PREFIX + lang, JSON.stringify(cache));
  } catch {
    // Storage full/unavailable -- translations still work this session,
    // just re-fetch next time instead of reading from cache.
  }
}

function collectTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.nodeValue.trim();
      if (!text) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent || SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-no-translate]")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) nodes.push(node);
  return nodes;
}

export async function translatePage(targetLang, apiBase) {
  if (!targetLang || targetLang.startsWith("en")) {
    restorePage();
    return;
  }

  const nodes = collectTextNodes(document.body);
  nodes.forEach((node) => {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
  });

  const cache = getCache(targetLang);
  const toFetch = Array.from(
    new Set(nodes.map((n) => originalText.get(n)).filter((text) => !cache[text]))
  );

  for (let i = 0; i < toFetch.length; i += 50) {
    const batch = toFetch.slice(i, i + 50);
    try {
      const res = await fetch(`${apiBase}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: batch, target: targetLang }),
      });
      const data = await res.json();
      batch.forEach((text, idx) => {
        cache[text] = data.translations?.[idx] || text;
      });
    } catch {
      batch.forEach((text) => {
        cache[text] = text;
      });
    }
  }
  setCache(targetLang, cache);

  nodes.forEach((node) => {
    const translated = cache[originalText.get(node)];
    if (translated && node.nodeValue !== translated) node.nodeValue = translated;
  });
}

export function restorePage() {
  collectTextNodes(document.body).forEach((node) => {
    const original = originalText.get(node);
    if (original !== undefined && node.nodeValue !== original) node.nodeValue = original;
  });
}
