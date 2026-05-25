# DockMark ⚓

**DockMark** is a powerful Chrome extension that transforms your "New Tab" page into a high-productivity dashboard and a sophisticated bookmark management hub.

## 🚀 Features

### 🛠 Productivity Dock
A customizable dashboard featuring essential widgets to keep you focused and organized:
- **Clock & Calendar**: Stay on top of your schedule.
- **Google Search**: Quick access to the web.
- **Pomodoro Timer**: Boost focus with 25-minute work intervals.
- **TODO List**: Manage tasks with persistent storage.
- **Sticky Notes**: Jot down quick thoughts and reminders.
- **Weather**: Real-time local weather updates via Geolocation.
- **RSS Feed (Alpha)**: Keep up with your favorite news sources.

### 🔖 Advanced Bookmark Management
DockMark goes beyond simple lists, offering four distinct ways to visualize and interact with your browser bookmarks:
- **Buttons View**: Alphabetically sorted and color-coded by folder for quick access.
- **Cards View**: Rich visual cards featuring site thumbnails for easy recognition.
- **Icons View**: A compact, minimalist grid for a clean look.
- **Tables View**: A structured, high-density list optimized for managing large collections without horizontal clutter.

### ✨ Power Tools
- **Markdown Export**: Fetch the content of any bookmarked page and save it as a clean Markdown file for archival or note-taking.
- **Sync with Chrome**: Seamlessly integrates with your browser's native bookmarks API.
- **Theme Support**: Choose from 20+ DaisyUI themes (Light, Dark, Cyberpunk, etc.) to match your style.

## 🛠 Tech Stack
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + DaisyUI v5
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Storage**: Chrome Storage API + LocalStorage
- **Content Parsing**: Turndown

## 📦 Installation (Developer Mode)
1. Clone this repository.
2. Run `npm install` to install dependencies.
3. Run `npm run build` to generate the production build in the `dist` directory.
4. Open Chrome and navigate to `chrome://extensions/`.
5. Enable **Developer mode** in the top right.
6. Click **Load unpacked** and select the `dist` folder.

## 📄 License
MIT
