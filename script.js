class WebOS {
    constructor() {
        this.apps = new Map();
        this.initializeOS();
        this.setupTaskbar();
        this.updateClock();
        this.zIndex = 1000;
    }

    initializeOS() {
        require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' }});
        require(['vs/editor/editor.main'], () => {
            this.monacoLoaded = true;
        });
    }

    setupTaskbar() {
        const taskbar = document.getElementById('taskbar');
        const vsCodeBtn = this.createTaskbarButton('VS Code', 'fa-code', () => this.openVSCode());
        const myAppsBtn = this.createTaskbarButton('My Apps', 'fa-th-large', () => this.openAppGallery());
        const appStoreBtn = this.createTaskbarButton('App Store', 'fa-store', () => this.openAppStore());

        taskbar.insertBefore(vsCodeBtn, taskbar.firstChild);
        taskbar.insertBefore(myAppsBtn, taskbar.firstChild);
        taskbar.insertBefore(appStoreBtn, taskbar.firstChild);

    }

    createTaskbarButton(title, icon, onClick) {
        const button = document.createElement('div');
        button.className = 'taskbar-app';
        button.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${title}</span>
        `;
        button.onclick = onClick;
        return button;
    }

    updateClock() {
        const clock = document.getElementById('clock');
        setInterval(() => {
            clock.textContent = new Date().toLocaleTimeString();
        }, 1000);
    }

    createWindow(title, content, width = '800px', height = '600px') {
        const window = document.createElement('div');
        window.className = 'window';
        window.style.width = width;
        window.style.height = height;
        
        window.innerHTML = `
            <div class="window-header">
                <span>${title}</span>
                <div class="window-controls">
                    <button class="minimize"></button>
                    <button class="maximize"></button>
                    <button class="close"></button>
                </div>
            </div>
            <div class="window-content"></div>
        `;

        window.querySelector('.window-content').appendChild(content);
        document.getElementById('desktop').appendChild(window);
        
        const taskbarItem = this.createTaskbarItem(window, title);
        
        window.onclick = () => this.focusWindow(window);
        window.querySelector('.close').onclick = () => {
            window.remove();
            taskbarItem.remove();
        };
        window.querySelector('.minimize').onclick = () => this.minimizeWindow(window);
        window.querySelector('.maximize').onclick = () => {
            window.classList.toggle('maximized');
        };

        this.makeWindowDraggable(window);
        this.focusWindow(window);

        return window;
    }

    makeWindowDraggable(window) {
        const header = window.querySelector('.window-header');
        let offsetX, offsetY;

        header.addEventListener('mousedown', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                offsetX = e.clientX - window.offsetLeft;
                offsetY = e.clientY - window.offsetTop;
                
                function mouseMoveHandler(e) {
                    window.style.left = (e.clientX - offsetX) + 'px';
                    window.style.top = (e.clientY - offsetY) + 'px';
                }
                
                function mouseUpHandler() {
                    document.removeEventListener('mousemove', mouseMoveHandler);
                    document.removeEventListener('mouseup', mouseUpHandler);
                }

                document.addEventListener('mousemove', mouseMoveHandler);
                document.addEventListener('mouseup', mouseUpHandler);
            }
        });
    }

    focusWindow(window) {
        this.zIndex += 1;
        window.style.zIndex = this.zIndex;
    }

    minimizeWindow(window) {
        window.style.transform = 'translate(-50%, 100vh)';
        window.style.opacity = '0';
        setTimeout(() => {
            window.classList.add('minimized');
        }, 300);
    }

    restoreWindow(window) {
        window.classList.remove('minimized');
        window.style.transform = 'translate(-50%, -50%)';
        window.style.opacity = '1';
    }

    createTaskbarItem(window, title) {
        const item = document.createElement('div');
        item.className = 'taskbar-item';
        item.innerHTML = `<i class="fas fa-window-maximize"></i> ${title}`;
        
        item.onclick = () => {
            if (window.classList.contains('minimized')) {
                this.restoreWindow(window);
            } else {
                this.minimizeWindow(window);
            }
        };

        document.getElementById('running-apps').appendChild(item);
        return item;
    }

    openVSCode() {
        const container = document.createElement('div');
        container.className = 'vscode-container';

        let currentEditor = 'html';
        const codeContent = {
            html: '<!-- Create your HTML here -->\n',
            css: '/* Style your app here */\n',
            javascript: '// Write your JavaScript here\n'
        };

        const toolbar = document.createElement('div');
        toolbar.className = 'vscode-toolbar';
        toolbar.innerHTML = `
            <button id="new-app">New App</button>
            <button id="save-app">Save App</button>
            <button id="run-app">Run App</button>
        `;

        const tabs = document.createElement('div');
        tabs.className = 'editor-tabs';
        tabs.innerHTML = `
            <div class="tab active" data-lang="html">HTML</div>
            <div class="tab" data-lang="css">CSS</div>
            <div class="tab" data-lang="javascript">JavaScript</div>
        `;

        const editorContainer = document.createElement('div');
        editorContainer.className = 'editor-container';

        container.appendChild(toolbar);
        container.appendChild(tabs);
        container.appendChild(editorContainer);

        const window = this.createWindow('VS Code', container);

        if (this.monacoLoaded) {
            const editor = monaco.editor.create(editorContainer, {
                value: codeContent[currentEditor],
                language: currentEditor,
                theme: 'vs-dark',
                automaticLayout: true
            });

            tabs.addEventListener('click', (e) => {
                if (e.target.classList.contains('tab')) {
                    codeContent[currentEditor] = editor.getValue();
                    tabs.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
                    e.target.classList.add('active');
                    currentEditor = e.target.dataset.lang;
                    editor.setValue(codeContent[currentEditor]);
                    monaco.editor.setModelLanguage(editor.getModel(), currentEditor);
                }
            });

            toolbar.querySelector('#new-app').onclick = () => {
                Object.keys(codeContent).forEach(key => {
                    codeContent[key] = '';
                });
                editor.setValue(codeContent[currentEditor]);
            };

            toolbar.querySelector('#save-app').onclick = () => {
                codeContent[currentEditor] = editor.getValue();
                const appName = prompt('Enter app name:');
                if (appName) {
                    localStorage.setItem(`app_${appName}`, JSON.stringify(codeContent));
                    this.createAppIcon(appName, 'fa-window-maximize', () => this.runCustomApp(codeContent));
                }
            };

            toolbar.querySelector('#run-app').onclick = () => {
                codeContent[currentEditor] = editor.getValue();
                this.runCustomApp(codeContent);
            };
        }
    }

    runCustomApp(codeContent) {
        const appContainer = document.createElement('div');
        appContainer.className = 'custom-app';
        
        if (typeof codeContent === 'string') {
            codeContent = JSON.parse(codeContent);
        }

        appContainer.innerHTML = codeContent.html;

        const styleElement = document.createElement('style');
        styleElement.textContent = codeContent.css;
        appContainer.appendChild(styleElement);

        const window = this.createWindow('Custom App', appContainer);

        try {
            const scriptElement = document.createElement('script');
            scriptElement.textContent = codeContent.javascript;
            appContainer.appendChild(scriptElement);
        } catch (error) {
            console.log('Error running JavaScript:', error);
        }
    }

    openAppGallery() {
        const container = document.createElement('div');
        container.className = 'app-gallery';
        
        const savedApps = Object.keys(localStorage)
            .filter(key => key.startsWith('app_'))
            .map(key => key.replace('app_', ''));

        savedApps.forEach(appName => {
            const appCard = document.createElement('div');
            appCard.className = 'app-card';
            appCard.innerHTML = `
                <i class="fas fa-window-maximize"></i>
                <span>${appName}</span>
                <div class="app-controls">
                    <button onclick="os.runSavedApp('${appName}')">Run</button>
                    <button onclick="os.deleteApp('${appName}')">Delete</button>
                </div>
            `;
            container.appendChild(appCard);
        });

        this.createWindow('My Apps', container, '600px', '400px');
    }

    runSavedApp(appName) {
        const code = localStorage.getItem(`app_${appName}`);
        if (code) this.runCustomApp(code);
    }

    deleteApp(appName) {
        if (confirm(`Delete ${appName}?`)) {
            localStorage.removeItem(`app_${appName}`);
            document.querySelectorAll('.desktop-icon').forEach(icon => {
                if (icon.querySelector('.icon-name').textContent === appName) {
                    icon.remove();
                }
            });
        }
    }

    openAppStore() {
        const container = document.createElement('div');
        container.className = 'app-store';
        
        const searchBar = document.createElement('div');
        searchBar.className = 'app-store-search';
        searchBar.innerHTML = `
            <input type="text" placeholder="Enter GitHub repository URL">
            <button><i class="fas fa-download"></i> Install</button>
        `;
    
        const featuredApps = document.createElement('div');
        featuredApps.className = 'featured-apps';
        const apps = [
            {
                name: 'Calculator',
                repo: 'https://github.com/Fluffythebunny/Calculator-App',
                description: 'Simple calculator web app',
                icon: 'fa-calculator'
            },
            {
                name: 'Notes',
                repo: 'https://github.com/user/notes-app',
                description: 'Markdown note taking app',
                icon: 'fa-sticky-note'
            }
        ];
    
        apps.forEach(app => {
            const appCard = document.createElement('div');
            appCard.className = 'store-app-card';
            appCard.innerHTML = `
                <i class="fas ${app.icon}"></i>
                <div class="app-info">
                    <h3>${app.name}</h3>
                    <p>${app.description}</p>
                </div>
                <button class="install-btn" data-repo="${app.repo}">
                    <i class="fas fa-download"></i>
                </button>
            `;
            featuredApps.appendChild(appCard);
        });
    
        container.appendChild(searchBar);
        container.appendChild(featuredApps);
    
        const window = this.createWindow('App Store', container, '800px', '600px');
    
        // Handle app installation
        searchBar.querySelector('button').onclick = async () => {
            const repoUrl = searchBar.querySelector('input').value;
            await this.installGitHubApp(repoUrl);
        };
    
        featuredApps.querySelectorAll('.install-btn').forEach(btn => {
            btn.onclick = async () => {
                await this.installGitHubApp(btn.dataset.repo);
            };
        });
    }
    
    async installGitHubApp(repoUrl) {
        try {
            const cleanUrl = repoUrl.replace('.git', '').replace('https://github.com/', '');
            const [owner, repo] = cleanUrl.split('/');
            
            const manifestResponse = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/main/app.json`);
            const manifest = await manifestResponse.json();

            const appFiles = {
                html: '',
                css: '',
                javascript: ''
            };

            for (const [type, filename] of Object.entries(manifest.files)) {
                const fileResponse = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/main/${filename}`);
                const content = await fileResponse.text();
                appFiles[type] = content;
            }

            localStorage.setItem(`app_${manifest.name}`, JSON.stringify(appFiles));
            this.createAppIcon(manifest.name, manifest.icon, () => this.runCustomApp(appFiles));
            
            alert(`${manifest.name} installed successfully!`);
        } catch (error) {
            console.error(error);
            alert('Failed to install app. Make sure the repository contains a valid app.json manifest.');
        }
    }}

document.addEventListener('DOMContentLoaded', () => {
    window.os = new WebOS();
});
