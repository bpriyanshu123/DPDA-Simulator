# DPDA Simulator PWA

This package keeps the existing DPDA simulator logic and styling unchanged.
Only the PWA integration was added.

## Files
- index.html — your existing page with only PWA references added
- script.js — your existing JavaScript, unchanged
- style.css — your existing CSS, unchanged
- manifest.json — PWA app manifest
- sw.js — offline/cache service worker
- pwa.js — registers the service worker
- icons/ — PWA icons

## GitHub Pages setup
Upload these files to the same folder/repository:
index.html
script.js
style.css
manifest.json
sw.js
pwa.js
icons/icon-192.png
icons/icon-512.png

Then open the GitHub Pages HTTPS URL.

On Chrome/Edge desktop or Android Chrome, use the install icon in the address bar or browser menu.
