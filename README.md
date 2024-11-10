# Pug-OS

A sleek and powerful web-based operating system with real-time app development capabilities and an integrated app store.

[live demo](https://pug-os.pages.dev)

## Features

- 🖥️ Modern Desktop Interface
- 📝 Built-in VS Code Editor
- 🚀 Real-time App Development
- 🔄 Drag & Drop Support
- 💾 Local Storage Integration
- 🎨 Custom App Creation
- 📦 App Store with GitHub Integration
- ⚡ Smooth Animations
- 🎯 Window Management System

## Getting Started

1. Clone the repository
2. Open `index.html` in your browser
3. Start creating and installing apps!

## Creating Apps

Create custom apps using the built-in VS Code editor with:
- HTML for structure
- CSS for styling
- JavaScript for functionality

## App Store

Install apps directly from GitHub repositories. Apps require an `app.json` manifest:

```json
{
    "name": "App Name",
    "version": "1.0.0",
    "icon": "fa-icon-name",
    "files": {
        "html": "app.html",
        "css": "app.css",
        "javascript": "app.js"
    },
    "description": "App description"
}
```
# Installing Apps

1. Go to the app store
2. Copy the app's Git URL from the app's GitHub page
3. Paste the URL in the app store and click "Install"

# Creating Custom Apps

1. Open the VS Code editor.
2. Use the built-in editor to create your app.
3. Click the save button.

# Publishing Custom Apps

1. Create a GitHub repository for your app.
2. Create an `app.json` manifest file.
```json
{
    "name": "App Name",
    "version": "1.0.0",
    "icon": "fa-icon-name",
    "files": {
        "html": "app.html",
        "css": "app.css",
        "javascript": "app.js"
    },
    "description": "App description"
}
```
3. make 3 files in the root directory of the repository:
- `appname.html`
- `appname.css`
- `appname.js`
4. in each file take the code you wrote in the editor and paste it into the files.
5. Commit your changes and share the repository URL to people to install your app.
6. In the app store, paste the URL and click "Install" to install your app.
7. Enjoy your app!

# Technologies Used

- Vanilla JavaScript
- Monaco Editor
- FontAwesome Icons
- GitHub API Integration

# Contributing

1. Fork the repository (make sure to credit me)
2. Create your feature branch
3. Submit a pull request
