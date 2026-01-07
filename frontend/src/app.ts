/**
 * A2UI Studio - Claude-Style Interface
 * Split-panel with resizable divider
 */

import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { A2UIClient, A2UIMessage } from './client.js';
import { A2UIRenderer } from './renderer.js';

type LoadingPhase = 'thinking' | 'crafting' | 'assembling' | 'complete';

const LOADING_MESSAGES: Record<LoadingPhase, string> = {
  thinking: 'Thinking...',
  crafting: 'Crafting your UI...',
  assembling: 'Putting it together...',
  complete: 'Done!'
};

@customElement('a2ui-studio')
export class A2UIStudio extends LitElement {
  static styles = css`
    :host {
      display: flex;
      width: 100%;
      height: 100vh;
      background: var(--bg-0);
      font-family: var(--font-sans);
    }

    /* ===== CHAT PANEL ===== */
    .chat-panel {
      display: flex;
      flex-direction: column;
      background: var(--bg-0);
      min-width: 320px;
      overflow: hidden;
    }

    .chat-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    /* Empty State - Centered greeting */
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-8);
      text-align: center;
    }

    .logo {
      width: 80px;
      height: 80px;
      margin-bottom: var(--space-6);
    }

    .logo svg {
      width: 100%;
      height: 100%;
    }

    .greeting {
      font-family: var(--font-serif);
      font-size: 32px;
      font-weight: 400;
      color: var(--text-200);
      margin-bottom: var(--space-3);
      letter-spacing: -0.5px;
    }

    .greeting-name {
      position: relative;
      display: inline-block;
    }

    .greeting-underline {
      position: absolute;
      bottom: -4px;
      left: -5%;
      width: 110%;
      height: 12px;
      color: var(--accent);
    }

    /* Messages */
    .messages {
      flex: 1;
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      overflow-y: auto;
    }

    .message {
      display: flex;
      gap: var(--space-3);
      animation: fadeIn 0.3s ease-out;
    }

    .message-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 12px;
      font-weight: 600;
    }

    .message.user .message-avatar {
      background: var(--bg-200);
      color: var(--text-300);
    }

    .message.assistant .message-avatar {
      background: var(--accent);
      color: white;
    }

    .message-body {
      flex: 1;
      padding-top: 4px;
    }

    .message.user .message-body {
      background: var(--bg-200);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
      color: var(--text-100);
      font-size: 14px;
    }

    .message.assistant .message-body {
      color: var(--text-300);
      font-size: 14px;
    }

    /* Input Area */
    .input-area {
      padding: var(--space-4) var(--space-6) var(--space-8);
    }

    .input-container {
      background: var(--bg-100);
      border: 1px solid var(--bg-300);
      border-radius: var(--radius-xl);
      padding: var(--space-3) var(--space-4);
      box-shadow: var(--shadow-input);
      transition: all 0.2s ease;
    }

    .input-container:focus-within {
      box-shadow: var(--shadow-input-focus);
      border-color: transparent;
    }

    .input-row {
      display: flex;
      align-items: flex-end;
      gap: var(--space-2);
    }

    .chat-textarea {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 15px;
      font-family: inherit;
      color: var(--text-100);
      resize: none;
      outline: none;
      min-height: 24px;
      max-height: 200px;
      line-height: 1.5;
    }

    .chat-textarea::placeholder {
      color: var(--text-400);
    }

    .input-actions {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: var(--text-400);
      border-radius: var(--radius-md);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .action-btn:hover {
      background: var(--bg-200);
      color: var(--text-200);
    }

    .action-btn .g-icon {
      font-size: 20px;
    }

    .send-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: var(--accent);
      color: white;
      border-radius: var(--radius-md);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .send-btn:hover:not(:disabled) {
      background: var(--accent-hover);
    }

    .send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .send-btn .g-icon {
      font-size: 18px;
    }

    .disclaimer {
      text-align: center;
      font-size: 11px;
      color: var(--text-500);
      margin-top: var(--space-3);
    }

    /* Suggestions */
    .suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      justify-content: center;
      margin-top: var(--space-5);
    }

    .suggestion {
      font-size: 13px;
      padding: var(--space-2) var(--space-3);
      background: transparent;
      border: 1px solid var(--bg-300);
      border-radius: 100px;
      color: var(--text-300);
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .suggestion:hover {
      border-color: var(--accent);
      color: var(--accent);
      background: var(--accent-light);
    }

    /* ===== RESIZER ===== */
    .resizer {
      width: 8px;
      background: transparent;
      cursor: col-resize;
      position: relative;
      flex-shrink: 0;
      z-index: 10;
    }

    .resizer::after {
      content: '';
      position: absolute;
      top: 0;
      left: 3px;
      width: 2px;
      height: 100%;
      background: var(--bg-300);
      transition: background 0.15s ease;
    }

    .resizer:hover::after,
    .resizer.active::after {
      background: var(--accent);
    }

    /* ===== PREVIEW PANEL ===== */
    .preview-panel {
      display: flex;
      flex-direction: column;
      min-width: 300px;
      position: relative;
      overflow: hidden;
    }

    .preview-gradient {
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(ellipse at 0% 0%, rgba(168, 85, 247, 0.35) 0%, transparent 50%),
        radial-gradient(ellipse at 100% 0%, rgba(99, 102, 241, 0.25) 0%, transparent 50%),
        radial-gradient(ellipse at 100% 100%, rgba(59, 130, 246, 0.25) 0%, transparent 50%),
        radial-gradient(ellipse at 0% 100%, rgba(20, 184, 166, 0.25) 0%, transparent 50%),
        linear-gradient(135deg, #1a1625 0%, #1e1b2e 50%, #151320 100%);
      animation: gradientPulse 15s ease-in-out infinite alternate;
    }

    @keyframes gradientPulse {
      0% {
        opacity: 1;
        filter: hue-rotate(0deg);
      }
      100% {
        opacity: 0.9;
        filter: hue-rotate(15deg);
      }
    }

    .preview-header {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4) var(--space-5);
    }

    .preview-title {
      font-size: 13px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.6);
    }

    .theme-toggle {
      display: flex;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 100px;
      padding: 3px;
    }

    .theme-btn {
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .theme-btn.active {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .theme-btn .g-icon {
      font-size: 16px;
    }

    .preview-content {
      position: relative;
      z-index: 1;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-6);
      overflow-y: auto;
    }

    .preview-card {
      width: 100%;
      max-width: 400px;
      max-height: 100%;
      overflow-y: auto;
      background: var(--bg-100);
      border-radius: var(--radius-xl);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
      animation: cardAppear 0.4s ease-out;
    }

    .preview-card.dark-mode {
      --bg-0: #212121;
      --bg-100: #262624;
      --bg-200: #30302E;
      --bg-300: #454540;
      --text-100: #ECECEC;
      --text-200: #E1E1E0;
      --text-300: #B4B4B4;
      --text-400: #8A8A88;
      background: #262624;
      color: #ECECEC;
    }

    .preview-inner {
      padding: var(--space-5);
    }

    @keyframes cardAppear {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .preview-empty {
      text-align: center;
      color: rgba(255, 255, 255, 0.4);
    }

    .preview-empty-icon {
      width: 72px;
      height: 72px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--space-4);
    }

    .preview-empty-icon .g-icon {
      font-size: 28px;
      color: rgba(255, 255, 255, 0.25);
    }

    .preview-empty-text {
      font-size: 14px;
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-5);
    }

    .loading-spinner {
      width: 48px;
      height: 48px;
      position: relative;
    }

    .loading-dot {
      position: absolute;
      width: 10px;
      height: 10px;
      background: var(--accent);
      border-radius: 50%;
      animation: orbit 1.5s linear infinite;
    }

    .loading-dot:nth-child(1) { animation-delay: 0s; }
    .loading-dot:nth-child(2) { animation-delay: 0.5s; background: rgba(168, 85, 247, 0.8); }
    .loading-dot:nth-child(3) { animation-delay: 1s; background: rgba(99, 102, 241, 0.8); }

    @keyframes orbit {
      0% { transform: rotate(0deg) translateX(20px) rotate(0deg); }
      100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
    }

    .loading-text {
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      font-weight: 500;
    }

    /* ===== A2UI COMPONENTS ===== */
    .a2ui-row {
      display: flex;
      flex-direction: row;
      gap: 12px;
      flex-wrap: wrap;
    }

    .a2ui-column {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .a2ui-list--vertical {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .a2ui-list--horizontal {
      display: flex;
      flex-direction: row;
      gap: 10px;
      overflow-x: auto;
    }

    .a2ui-card {
      background: var(--bg-200);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
    }

    .a2ui-text {
      margin: 0;
      color: var(--text-100);
    }

    .a2ui-text--h1 { font-size: 22px; font-weight: 600; letter-spacing: -0.3px; }
    .a2ui-text--h2 { font-size: 18px; font-weight: 600; }
    .a2ui-text--h3 { font-size: 16px; font-weight: 600; }
    .a2ui-text--h4 { font-size: 14px; font-weight: 500; }
    .a2ui-text--h5 { font-size: 13px; font-weight: 500; }
    .a2ui-text--body { font-size: 14px; line-height: 1.5; color: var(--text-300); }
    .a2ui-text--caption { font-size: 12px; color: var(--text-400); }

    .a2ui-image {
      display: block;
      max-width: 100%;
      border-radius: var(--radius-md);
      background: var(--bg-200);
    }

    .a2ui-image--icon { width: 24px; height: 24px; border-radius: 4px; }
    .a2ui-image--avatar { width: 44px; height: 44px; border-radius: 50%; }
    .a2ui-image--smallFeature { width: 100%; max-width: 100px; aspect-ratio: 1; }
    .a2ui-image--mediumFeature { width: 100%; aspect-ratio: 16/9; }
    .a2ui-image--largeFeature { width: 100%; aspect-ratio: 16/9; }
    .a2ui-image--header {
      width: calc(100% + var(--space-5) * 2);
      margin: calc(var(--space-5) * -1) calc(var(--space-5) * -1) var(--space-4);
      aspect-ratio: 2/1;
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    }

    .a2ui-icon { color: var(--accent); }

    .a2ui-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 18px;
      border: 1px solid var(--bg-300);
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.15s ease;
      background: var(--bg-100);
      color: var(--text-100);
    }

    .a2ui-button--primary {
      background: var(--accent);
      color: white;
      border: none;
    }

    .a2ui-button:hover { transform: translateY(-1px); }

    .a2ui-textfield {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .a2ui-textfield label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-300);
    }

    .a2ui-textfield input,
    .a2ui-textfield textarea {
      padding: 10px 12px;
      border: 1px solid var(--bg-300);
      border-radius: var(--radius-md);
      font-size: 14px;
      font-family: inherit;
      background: var(--bg-100);
      color: var(--text-100);
    }

    .a2ui-divider {
      border: none;
      height: 1px;
      background: var(--bg-300);
      margin: 8px 0;
    }

    .a2ui-slider { width: 100%; accent-color: var(--accent); }

    .a2ui-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 14px;
    }

    .a2ui-checkbox input {
      width: 18px;
      height: 18px;
      accent-color: var(--accent);
    }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      :host { flex-direction: column; }
      .chat-panel { min-width: 100%; height: 50%; }
      .resizer { display: none; }
      .preview-panel { min-width: 100%; height: 50%; }
    }
  `;

  @state() private messages: Array<{ role: 'user' | 'assistant'; content: string; a2ui?: A2UIMessage[] }> = [];
  @state() private loading = false;
  @state() private loadingPhase: LoadingPhase = 'thinking';
  @state() private inputValue = '';
  @state() private previewDarkMode = false;
  @state() private currentA2UI: A2UIMessage[] | null = null;
  @state() private chatWidth = 55; // percentage

  private client = new A2UIClient();
  private phaseInterval: number | null = null;
  private isResizing = false;

  render() {
    return html`
      <div class="chat-panel" style="flex: 0 0 ${this.chatWidth}%">
        <div class="chat-content">
          ${this.messages.length === 0 ? this.renderEmptyState() : this.renderMessages()}
        </div>
        ${this.renderInputArea()}
      </div>
      <div 
        class="resizer ${this.isResizing ? 'active' : ''}"
        @mousedown=${this.startResize}
      ></div>
      <div class="preview-panel" style="flex: 1">
        <div class="preview-gradient"></div>
        ${this.renderPreviewHeader()}
        <div class="preview-content">
          ${this.loading ? this.renderLoadingState() : this.renderPreview()}
        </div>
      </div>
    `;
  }

  private renderEmptyState() {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return html`
      <div class="empty-state">
        <div class="logo">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <ellipse id="petal" cx="100" cy="100" rx="85" ry="20" />
            </defs>
            <g fill="#D97757">
              <use href="#petal" transform="rotate(0 100 100)" />
              <use href="#petal" transform="rotate(45 100 100)" />
              <use href="#petal" transform="rotate(90 100 100)" />
              <use href="#petal" transform="rotate(135 100 100)" />
            </g>
          </svg>
        </div>
        <h1 class="greeting">
          ${greeting}, <span class="greeting-name">
            friend
            <svg class="greeting-underline" viewBox="0 0 140 24" fill="none" preserveAspectRatio="none">
              <path d="M6 16 Q 70 24, 134 14" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/>
            </svg>
          </span>
        </h1>
        <div class="suggestions">
          ${['Restaurant card', 'Contact form', 'Product gallery', 'Flight tracker'].map(s => html`
            <button class="suggestion" @click=${() => this.handleSuggestion(s)}>${s}</button>
          `)}
        </div>
      </div>
    `;
  }

  private renderMessages() {
    return html`
      <div class="messages">
        ${this.messages.map(msg => html`
          <div class="message ${msg.role}">
            <div class="message-avatar">
              ${msg.role === 'user' ? html`<span class="g-icon" style="font-size: 16px;">person</span>` : 'A'}
            </div>
            <div class="message-body">
              ${msg.role === 'user' ? msg.content : (msg.a2ui ? 'Here\'s what I created.' : msg.content)}
            </div>
          </div>
        `)}
      </div>
    `;
  }

  private renderInputArea() {
    return html`
      <div class="input-area">
        <div class="input-container">
          <div class="input-row">
            <textarea
              class="chat-textarea"
              placeholder="What would you like me to create?"
              .value=${this.inputValue}
              @input=${this.handleInput}
              @keydown=${this.handleKeyDown}
              ?disabled=${this.loading}
              rows="1"
            ></textarea>
            <div class="input-actions">
              <button class="send-btn" @click=${this.handleSend} ?disabled=${this.loading || !this.inputValue.trim()}>
                <span class="g-icon">arrow_upward</span>
              </button>
            </div>
          </div>
        </div>
        <p class="disclaimer">AI can make mistakes. Please verify important info.</p>
      </div>
    `;
  }

  private renderPreviewHeader() {
    return html`
      <header class="preview-header">
        <span class="preview-title">Preview</span>
        <div class="theme-toggle">
          <button class="theme-btn ${!this.previewDarkMode ? 'active' : ''}" @click=${() => this.previewDarkMode = false}>
            <span class="g-icon">light_mode</span>
          </button>
          <button class="theme-btn ${this.previewDarkMode ? 'active' : ''}" @click=${() => this.previewDarkMode = true}>
            <span class="g-icon">dark_mode</span>
          </button>
        </div>
      </header>
    `;
  }

  private renderLoadingState() {
    return html`
      <div class="loading-state">
        <div class="loading-spinner">
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
        </div>
        <span class="loading-text">${LOADING_MESSAGES[this.loadingPhase]}</span>
      </div>
    `;
  }

  private renderPreview() {
    if (!this.currentA2UI) {
      return html`
        <div class="preview-empty">
          <div class="preview-empty-icon">
            <span class="g-icon">widgets</span>
          </div>
          <p class="preview-empty-text">Your UI will appear here</p>
        </div>
      `;
    }

    const renderer = new A2UIRenderer();
    renderer.processMessages(this.currentA2UI);

    const surfaces = renderer.getSurfaces();
    if (surfaces.size === 0) {
      return html`
        <div class="preview-empty">
          <div class="preview-empty-icon">
            <span class="g-icon">error</span>
          </div>
          <p class="preview-empty-text">Could not render UI</p>
        </div>
      `;
    }

    const results = [];
    for (const [surfaceId] of surfaces) {
      const rendered = renderer.renderSurface(surfaceId);
      if (rendered !== nothing) {
        results.push(rendered);
      }
    }

    return html`
      <div class="preview-card ${this.previewDarkMode ? 'dark-mode' : ''}">
        <div class="preview-inner">${results}</div>
      </div>
    `;
  }

  private handleInput(e: Event) {
    const textarea = e.target as HTMLTextAreaElement;
    this.inputValue = textarea.value;
    // Auto-resize
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.handleSend();
    }
  }

  private handleSuggestion(text: string) {
    this.inputValue = `Create a ${text.toLowerCase()} with a modern, clean design`;
    this.handleSend();
  }

  private async handleSend() {
    const message = this.inputValue.trim();
    if (!message || this.loading) return;

    this.inputValue = '';
    this.loading = true;
    this.loadingPhase = 'thinking';

    this.messages = [...this.messages, { role: 'user', content: message }];
    this.startPhaseProgression();

    try {
      const a2uiMessages = await this.client.send(message);
      this.loadingPhase = 'complete';
      this.currentA2UI = a2uiMessages;
      this.messages = [...this.messages, { role: 'assistant', content: '', a2ui: a2uiMessages }];
    } catch (err) {
      this.messages = [...this.messages, { 
        role: 'assistant', 
        content: err instanceof Error ? err.message : 'Something went wrong.' 
      }];
    } finally {
      this.stopPhaseProgression();
      this.loading = false;
    }
  }

  private startPhaseProgression() {
    const phases: LoadingPhase[] = ['thinking', 'crafting', 'assembling'];
    let idx = 0;
    this.phaseInterval = window.setInterval(() => {
      idx++;
      if (idx < phases.length) this.loadingPhase = phases[idx];
    }, 1200);
  }

  private stopPhaseProgression() {
    if (this.phaseInterval) {
      clearInterval(this.phaseInterval);
      this.phaseInterval = null;
    }
  }

  private startResize = (e: MouseEvent) => {
    e.preventDefault();
    this.isResizing = true;
    document.body.classList.add('resizing');
    
    const onMouseMove = (e: MouseEvent) => {
      const containerWidth = this.offsetWidth;
      const newWidth = (e.clientX / containerWidth) * 100;
      this.chatWidth = Math.max(25, Math.min(75, newWidth));
    };

    const onMouseUp = () => {
      this.isResizing = false;
      document.body.classList.remove('resizing');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'a2ui-studio': A2UIStudio;
  }
}
