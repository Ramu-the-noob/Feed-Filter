// ==UserScript==
// @name         Instagram Reels Algorithm Trainer
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Auto-skips unwanted reels and auto-likes matching tagged reels.
// @match        https://www.instagram.com/reels/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // --- CONFIGURATION ---
  //replace target tags with whatever you want to show up
  const TARGET_TAGS = [
    'coding', 'tech', 'linux', 'cybersecurity', 'ai',
    'food', 'foodporn', 'instafood', 'foodie',
    'travel', 'sunset', 'travelgram', 'vacation', 'wanderlust',
    'art', 'streetphotography', 'instaart', 'artoftheday', 'nature',
    'cat', 'skit', 'minecraft', 'gaming'
  ].map((t) => t.toLowerCase());

  const MATCHED_WATCH_TIME_MS = 1200;
  const SKIP_DELAY_MS = 400; 
  const DEBUG = true;

  let isProcessing = false;

  function log(...args) {
    if (DEBUG) console.log('[IG Trainer]', ...args);
  }

  // --- CONTAINER DETECTION ---
  function getActiveReelContainer() {
    const videos = Array.from(document.querySelectorAll('video'));
    const viewportCenter = window.innerHeight / 2;
    let best = null;
    let bestDist = Infinity;

    for (const v of videos) {
      const r = v.getBoundingClientRect();
      if (r.height === 0) continue;
      const d = Math.abs(r.top + r.height / 2 - viewportCenter);
      if (d < bestDist) {
        bestDist = d;
        best = v;
      }
    }
    if (!best) return null;

    let node = best;
    for (let i = 0; i < 15 && node.parentElement; i++) {
      node = node.parentElement;
      if (node.querySelector('svg[aria-label="Like"], svg[aria-label="Unlike"]')) {
        return node;
      }
    }
    return best.parentElement;
  }

  // --- TAG EXTRACTION ---
  function extractTags(container) {
    if (!container) return [];

    const tagElements = container.querySelectorAll(
      'a[href*="/explore/tags/"], a[href*="%23"], a[href*="/explore/search/keyword"]'
    );
    const linkedTags = Array.from(tagElements).map((el) =>
      el.textContent.toLowerCase().replace('#', '').trim()
    );

    const fullText = container.textContent.toLowerCase();
    const rawMatches = fullText.match(/#[^\s#]+/g) || [];
    const inlineTags = rawMatches.map((t) => t.replace('#', ''));

    return [...new Set([...linkedTags, ...inlineTags])];
  }

  // --- LIKE BUTTON ---
  function clickLike(container) {
    if (container.querySelector('svg[aria-label="Unlike"]')) return true;

    const likeSvg = container.querySelector('svg[aria-label="Like"]');
    if (likeSvg) {
      const btn =
        likeSvg.closest('div[role="button"]') ||
        likeSvg.closest('button') ||
        likeSvg.parentElement;
      btn.click();
      return true;
    }

    const video = container.querySelector('video');
    if (video) {
      video.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window }));
      return true;
    }
    return false;
  }

  // --- SCROLL TO NEXT REEL ---
  function getScrollParent(el) {
    while (el) {
      const s = getComputedStyle(el);
      if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight) return el;
      el = el.parentElement;
    }
    return null;
  }

  function scrollNext(currentContainer) {
    const arrow = document.querySelector(
      'svg[aria-label="Navigate to next Reel"], svg[aria-label="Next"], svg[aria-label="Down"], ' +
      'button[aria-label*="next" i], div[role="button"][aria-label*="next" i]'
    );
    const arrowBtn = arrow && (arrow.closest('button, div[role="button"]') || arrow);
    if (arrowBtn) {
      arrowBtn.click();
      log('Scrolled via arrow button.');
      return;
    }

    const scroller = getScrollParent(currentContainer);
    if (scroller) {
      scroller.scrollBy({ top: scroller.clientHeight, behavior: 'smooth' });
      log('Scrolled via scroll container.');
      return;
    }

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, bubbles: true })
    );
    log('Fallback: ArrowDown key.');
  }

  // --- MAIN LOOP ---
  async function evaluateReel() {
    if (isProcessing) return;
    isProcessing = true;

    const container = getActiveReelContainer();
    if (!container) {
      isProcessing = false;
      return;
    }

    // Brief delay to allow caption elements to render in the DOM
    await new Promise((res) => setTimeout(res, 300));

    // Skip reels that are already liked
    if (container.querySelector('svg[aria-label="Unlike"]')) {
      log('Already liked -> skipping.');
      scrollNext(container);
      setTimeout(() => { isProcessing = false; }, 1500);
      return;
    }

    const currentTags = extractTags(container);
    const hasMatch = currentTags.some((tag) => TARGET_TAGS.includes(tag));

    if (hasMatch) {
      log('MATCH DETECTED. Tags:', currentTags);

      const watchJitter = MATCHED_WATCH_TIME_MS + Math.random() * 2000;
      await new Promise((res) => setTimeout(res, watchJitter));

      const liked = clickLike(container);
      log(liked ? 'Liked.' : 'Like attempt failed.');

      await new Promise((res) => setTimeout(res, 1200 + Math.random() * 500));
      scrollNext(container);
    } else {
      log('No match. Tags:', currentTags, '-> skipping.');
      await new Promise((res) => setTimeout(res, SKIP_DELAY_MS + Math.random() * 200));
      scrollNext(container);
    }

    setTimeout(() => {
      isProcessing = false;
    }, 1500);
  }

  setInterval(() => {
    if (!isProcessing) evaluateReel();
  }, 1000);
})();
