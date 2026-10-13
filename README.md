# Note or Not

> Write it. Keep it. Find it.

A simple, fast note-taking app that works offline and can be installed on your phone or computer like a normal app. Built with plain HTML, CSS and JavaScript, with no frameworks.

## Features

- Create, edit and delete notes
- Notes and To-Do lists
- Favorites
- Trash with restore and "delete forever"
- Search across titles and text
- Filter by All, Notes, To-Do, Favorites or Trash
- Sort by Latest, Oldest or Title
- Dark theme, designed for phones
- Works offline
- Installable as a PWA (Progressive Web App)
- Notes are saved on your own device with IndexedDB

## Tech used

- HTML5, CSS3, vanilla JavaScript
- IndexedDB for storage
- Service Worker for offline support
- Web App Manifest for installing the app

## Project structure

```
note-app/
├── index.html      # page structure
├── style.css       # dark theme and layout
├── app.js          # app logic and storage
├── sw.js           # service worker (offline cache)
├── manifest.json   # PWA settings
├── icons/          # app icons
└── README.md
```

## Run it locally

Service workers only run on `localhost` or `https`, so open the app through a small server instead of double-clicking `index.html`.

```bash
git clone https://github.com/thankyougood-lgtm/note-app.git
cd note-app
python3 -m http.server 8000
```

Then open <http://localhost:8000> in your browser.

## Install as an app

1. Open the app in Chrome or Edge.
2. Click the install icon in the address bar.
3. On a phone: open the browser menu and choose **Add to Home screen**.

Phone installing needs the app to be served over `https`, for example with GitHub Pages.

## Updating the offline cache

After you change any app file, edit the version name in `sw.js` so users get the new files:

```js
const CACHE = "note-or-not-v2"; // was v1
```

## Privacy

Everything stays on your device. There is no account, no server and no tracking.