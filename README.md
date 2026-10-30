📝 Note App

A fast, offline-first Progressive Web App for creating, organizing, and managing notes — built entirely with vanilla HTML, CSS, and JavaScript. No frameworks, no build tools, no dependencies.

![PWA](https://img.shields.io/badge/PWA-installable-blue)
![Offline First](https://img.shields.io/badge/offline-first-success)
![No Frameworks](https://img.shields.io/badge/stack-vanilla%20JS-yellow)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## ✨ Features

- **📱 Installable PWA** — Works offline, installs to your home screen like a native app, with custom app icons for all device sizes.
- **📝 Create & Edit Notes** — Tap any note to open it in a full, comfortable editing view (near full-screen on mobile).
- **📁 Folders** — Organize notes into custom folders. Create, rename, delete folders, and assign/unassign notes via a simple checklist picker.
- **⭐ Favorites** — Mark important notes as favorites for quick access.
- **🗑️ Trash** — Soft-delete notes with Restore and permanent Delete Forever options, so nothing is lost by accident.
- **📄 Export Notes** — Export individual notes or your entire note collection as PDF or Microsoft Word (.doc) files.
- **🌙 Dark Mode** — Full dark theme support across every page, dialog, and input field.
- **🔍 Search** — Instantly filter notes by title or content from the Home or Notes page.
- **🎨 Custom Dialogs** — Every confirmation, prompt, and alert uses custom in-app UI — zero native browser popups.
- **⚡ Optimized Rendering** — Single notes update in-place instead of re-rendering the entire list, keeping the app fast as your note collection grows.
- **🛡️ Storage Safety** — Graceful error handling for storage failures (e.g. full storage quota), with clear user-facing warnings instead of silent data loss.

---

## 🛠️ Tech Stack

- **HTML5** — Semantic, modular markup
- **CSS3** — Custom properties (CSS variables) for theming, no preprocessor
- **Vanilla JavaScript (ES6+)** — No frameworks, no libraries, no build step
- **Service Worker** — Full offline caching (app shell + assets)
- **localStorage** — Client-side data persistence

---

## 📂 Project Structure
> 
---

## 🚀 Getting Started

This app requires no build step or package installation — just a local web server (service workers require HTTP, not `file://`).

### Option 1: Python

```bash
cd note-app
python3 -m http.server 8000
> 