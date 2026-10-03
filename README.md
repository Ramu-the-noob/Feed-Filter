Instagram Reels Algorithm Trainer

A Tampermonkey userscript that automates your Instagram Reels feed by watching and liking content tagged with your target interests while quickly skipping unmatched reels.
Key Features

    Targeted Engagement: Automatically likes Reels containing specific hashtags defined in your watch list.

    Smart Skipping: Automatically scrolls past unwanted or untagged Reels after a configurable delay.

    Humanlike Delays: Includes randomized timing jitter for watching and scrolling to avoid triggering automated bot detection mechanisms.

    Robust UI Selectors: Leverages viewport centering, parent container climbing, and keyboard fallbacks to maintain compatibility with dynamic Instagram UI updates.

Installation
Prerequisites

    A Chromium-based browser (Chrome, Brave, Edge) or Firefox.

    A userscript manager extension installed:

        Tampermonkey (Recommended)

        Violentmonkey

Setup Steps

    Open your userscript manager extension and select Create a new script.

    Clear any default template code in the editor.

    Paste the contents of instagram_trainer.user.js into the editor.

    Save the script (Ctrl + S or Cmd + S).

    Navigate to instagram.com/reels to run the script.

Configuration

You can customize the script parameters at the top of the file:
JavaScript

// --- CONFIGURATION ---
const TARGET_TAGS = [
  'coding', 'tech', 'linux', 'cybersecurity', 'ai',
  'food', 'foodporn', 'instafood', 'foodie',
  'travel', 'sunset', 'travelgram', 'vacation', 'wanderlust',
  'art', 'streetphotography', 'instaart', 'artoftheday', 'nature',
  'cat', 'skit', 'minecraft', 'gaming'
].map((t) => t.toLowerCase());

const MATCHED_WATCH_TIME_MS = 1200; // Base watch time before liking matched reels
const SKIP_DELAY_MS = 400;         // Delay before scrolling past non-matching reels
const DEBUG = true;                // Enables logs in the browser console ([IG Trainer])

How It Works

    Active Container Detection: Identifies the <video> element closest to the vertical center of your screen and locates its parent card containing interaction elements.

    Tag Extraction: Scans the Reel caption for hashtag links (a[href*="/explore/tags/"]) and inline raw text matches (#hashtag).

    Evaluation:

        Match Found: Pauses for the configured watch duration (MATCHED_WATCH_TIME_MS + jitter), triggers a Like action, and scrolls to the next Reel.

        No Match: Briefly pauses (SKIP_DELAY_MS + jitter) and triggers a scroll.

        Already Liked: Immediately skips to prevent duplicate interaction loops.

Browser Console Logging

When DEBUG is set to true, open your browser developer console (F12 or Ctrl + Shift + I / Cmd + Option + I) to inspect real-time log outputs prefixed with [IG Trainer]:
Plaintext

[IG Trainer] MATCH DETECTED. Tags: ["coding", "linux"]
[IG Trainer] Liked.
[IG Trainer] No match. Tags: ["fashion"] -> skipping.

Troubleshooting & Maintenance

    Reel auto-scrolling too fast or missing tags: Instagram occasionally lazy-loads video captions. If tags are missed on slower connections, increase the initial element render delay inside evaluateReel() (e.g., from 300ms to 600ms).

    Scroll stuck: If Instagram changes its button ARIA labels, the script relies on container smooth scrolling or the ArrowDown key event fallback.

Disclaimer

This script is for personal automation and algorithm training experiments. Excessive automated interactions on Instagram may trigger temporary rate limits or action blocks on your account. Use realistic watch times and conservative delay parameters.

Note : this was made on 03/10/26 , later versions of Instagram may not support it.
Works only on Desktop
