/**
 * A2UI Studio - Split-Panel Chat Interface
 * Claude/Cursor inspired design
 */

import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { A2UIClient, A2UIMessage } from './client.js';
import { A2UIRenderer } from './renderer.js';

type LoadingPhase = 'analyzing' | 'generating' | 'rendering' | 'complete';

const LOADING_MESSAGES: Record<LoadingPhase, string> = {
  analyzing: 'Understanding your request...',
  generating: 'Crafting components...',
  rendering: 'Assembling the interface...',
  complete: 'Done!'
};

@customElement('a2ui-studio')
export class A2UIStudio extends LitElement {
  static styles = css`
    :host {
      display: flex;
      width: 100%;
      height: 100vh;
      background: var(--bg-primary);
    }

    /* ===== LEFT PANEL - CHAT ===== */
    .chat-panel {
      flex: 0 0 60%;
      display: flex;
      flex-direction: column;
      border-right: 1px solid var(--border);
      background: var(--surface);
    }

    .chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--border-light);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .brand-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--gradient-1), var(--gradient-2));
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 14px;
    }

    .brand-text {
      font-weight: 600;
      font-size: 15px;
      color: var(--text-primary);
    }

    .brand-tag {
      font-size: 11px;
      font-weight: 500;
      color: var(--accent);
      background: var(--accent-light);
      padding: 2px 8px;
      border-radius: 100px;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .message {
      display: flex;
      gap: var(--space-3);
      animation: fadeSlideIn 0.3s ease-out;
    }

    .message-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 14px;
    }

    .message.user .message-avatar {
      background: var(--bg-secondary);
      color: var(--text-secondary);
    }

    .message.assistant .message-avatar {
      background: linear-gradient(135deg, var(--gradient-1), var(--gradient-2));
      color: white;
    }

    .message-content {
      flex: 1;
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
      font-size: 14px;
      line-height: 1.6;
    }

    .message.user .message-content {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }

    .message.assistant .message-content {
      background: transparent;
      color: var(--text-secondary);
      padding-left: 0;
    }

    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--space-8);
    }

    .empty-icon {
      width: 64px;
      height: 64px;
      background: var(--bg-secondary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-5);
    }

    .empty-icon .g-icon {
      font-size: 28px;
      color: var(--text-tertiary);
    }

    .empty-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--space-2);
    }

    .empty-description {
      font-size: 14px;
      color: var(--text-secondary);
      max-width: 320px;
      line-height: 1.5;
    }

    .suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-top: var(--space-5);
      justify-content: center;
    }

    .suggestion {
      font-size: 13px;
      padding: var(--space-2) var(--space-3);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 100px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .suggestion:hover {
      border-color: var(--accent);
      color: var(--accent);
      background: var(--accent-light);
    }

    .chat-input-area {
      padding: var(--space-4) var(--space-6) var(--space-6);
      border-top: 1px solid var(--border-light);
    }

    .input-container {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-3) var(--space-4);
      transition: all var(--transition-fast);
    }

    .input-container:focus-within {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-light);
    }

    .chat-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 14px;
      font-family: inherit;
      color: var(--text-primary);
      outline: none;
    }

    .chat-input::placeholder {
      color: var(--text-tertiary);
    }

    .send-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: var(--accent);
      color: white;
      border-radius: var(--radius-md);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }

    .send-btn:hover:not(:disabled) {
      background: #c96a52;
      transform: translateY(-1px);
    }

    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* ===== RIGHT PANEL - PREVIEW ===== */
    .preview-panel {
      flex: 0 0 40%;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    .preview-gradient {
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(ellipse at 0% 0%, rgba(168, 85, 247, 0.4) 0%, transparent 50%),
        radial-gradient(ellipse at 100% 0%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
        radial-gradient(ellipse at 100% 100%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
        radial-gradient(ellipse at 0% 100%, rgba(20, 184, 166, 0.3) 0%, transparent 50%),
        linear-gradient(135deg, #1a1625 0%, #1e1b2e 50%, #151320 100%);
      animation: gradientShift 20s ease-in-out infinite;
    }

    @keyframes gradientShift {
      0%, 100% {
        background-position: 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%;
      }
      25% {
        background-position: 50% 0%, 100% 50%, 50% 100%, 0% 50%, 0% 0%;
      }
      50% {
        background-position: 100% 0%, 100% 100%, 0% 100%, 0% 0%, 0% 0%;
      }
      75% {
        background-position: 50% 50%, 50% 100%, 50% 50%, 50% 0%, 0% 0%;
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
      color: rgba(255, 255, 255, 0.7);
    }

    .theme-toggle {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 100px;
      padding: 4px;
    }

    .theme-btn {
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
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
    }

    .preview-card {
      width: 100%;
      max-width: 380px;
      max-height: 100%;
      overflow-y: auto;
      background: var(--surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg), 0 0 40px rgba(0, 0, 0, 0.2);
      animation: previewFadeIn 0.5s ease-out;
    }

    .preview-card.dark-mode {
      background: #1a1a1a;
      color: #f0f0f0;
    }

    .preview-card-inner {
      padding: var(--space-5);
    }

    @keyframes previewFadeIn {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .preview-empty {
      text-align: center;
      color: rgba(255, 255, 255, 0.5);
    }

    .preview-empty-icon {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--space-4);
    }

    .preview-empty-icon .g-icon {
      font-size: 32px;
      color: rgba(255, 255, 255, 0.3);
    }

    .preview-empty-text {
      font-size: 14px;
      line-height: 1.5;
    }

    /* ===== LOADING STATE ===== */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-5);
    }

    .loading-animation {
      position: relative;
      width: 60px;
      height: 60px;
    }

    .loading-orbit {
      position: absolute;
      inset: 0;
      animation: orbit 2s linear infinite;
    }

    .loading-dot {
      position: absolute;
      width: 10px;
      height: 10px;
      background: var(--accent);
      border-radius: 50%;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
    }

    .loading-orbit:nth-child(2) {
      animation-delay: -0.66s;
    }

    .loading-orbit:nth-child(2) .loading-dot {
      background: var(--gradient-1);
    }

    .loading-orbit:nth-child(3) {
      animation-delay: -1.33s;
    }

    .loading-orbit:nth-child(3) .loading-dot {
      background: var(--gradient-2);
    }

    @keyframes orbit {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .loading-text {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      font-weight: 500;
    }

    .loading-phase {
      display: flex;
      gap: var(--space-2);
      margin-top: var(--space-2);
    }

    .phase-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      transition: all var(--transition-normal);
    }

    .phase-dot.active {
      background: var(--accent);
    }

    .phase-dot.complete {
      background: #22c55e;
    }

    /* ===== A2UI COMPONENT STYLES ===== */
    .a2ui-row {
      display: flex;
      flex-direction: row;
      gap: 12px;
      flex-wrap: wrap;
    }

    .a2ui-column {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .a2ui-list--vertical {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .a2ui-list--horizontal {
      display: flex;
      flex-direction: row;
      gap: 12px;
      overflow-x: auto;
      padding-bottom: 8px;
    }

    .a2ui-card {
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      border: 1px solid var(--border-light);
    }

    .preview-card.dark-mode .a2ui-card {
      background: #252525;
      border-color: #333;
    }

    .a2ui-text {
      margin: 0;
    }

    .a2ui-text--h1 {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .a2ui-text--h2 {
      font-size: 20px;
      font-weight: 600;
    }

    .a2ui-text--h3 {
      font-size: 17px;
      font-weight: 600;
    }

    .a2ui-text--h4 {
      font-size: 15px;
      font-weight: 500;
    }

    .a2ui-text--h5 {
      font-size: 14px;
      font-weight: 500;
    }

    .a2ui-text--body {
      font-size: 14px;
      line-height: 1.6;
      color: var(--text-secondary);
    }

    .preview-card.dark-mode .a2ui-text--body {
      color: #aaa;
    }

    .a2ui-text--caption {
      font-size: 12px;
      color: var(--text-tertiary);
    }

    .preview-card.dark-mode .a2ui-text--caption {
      color: #888;
    }

    .a2ui-image {
      display: block;
      max-width: 100%;
      border-radius: var(--radius-md);
      background: var(--bg-secondary);
    }

    .a2ui-image--icon {
      width: 24px;
      height: 24px;
      border-radius: 4px;
    }

    .a2ui-image--avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }

    .a2ui-image--smallFeature {
      width: 100%;
      max-width: 120px;
      aspect-ratio: 1;
    }

    .a2ui-image--mediumFeature {
      width: 100%;
      aspect-ratio: 16/9;
    }

    .a2ui-image--largeFeature {
      width: 100%;
      aspect-ratio: 16/9;
    }

    .a2ui-image--header {
      width: calc(100% + var(--space-5) * 2);
      margin: calc(var(--space-5) * -1) calc(var(--space-5) * -1) var(--space-4);
      aspect-ratio: 21/9;
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    }

    .a2ui-icon {
      color: var(--accent);
    }

    .a2ui-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 20px;
      border: none;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: all var(--transition-fast);
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }

    .preview-card.dark-mode .a2ui-button {
      background: #333;
      color: #f0f0f0;
      border-color: #444;
    }

    .a2ui-button--primary {
      background: var(--accent);
      color: white;
      border: none;
    }

    .a2ui-button:hover {
      transform: translateY(-1px);
    }

    .a2ui-textfield {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .a2ui-textfield label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .a2ui-textfield input,
    .a2ui-textfield textarea {
      padding: 10px 14px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      font-size: 14px;
      font-family: inherit;
      background: var(--surface);
      color: var(--text-primary);
    }

    .preview-card.dark-mode .a2ui-textfield input,
    .preview-card.dark-mode .a2ui-textfield textarea {
      background: #252525;
      border-color: #444;
      color: #f0f0f0;
    }

    .a2ui-divider {
      border: none;
      height: 1px;
      background: var(--border-light);
      margin: 8px 0;
    }

    .preview-card.dark-mode .a2ui-divider {
      background: #333;
    }

    .a2ui-slider {
      width: 100%;
      accent-color: var(--accent);
    }

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
    @keyframes fadeSlideIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive */
    @media (max-width: 900px) {
      :host {
        flex-direction: column;
      }

      .chat-panel {
        flex: 1;
        border-right: none;
        border-bottom: 1px solid var(--border);
      }

      .preview-panel {
        flex: 0 0 50%;
      }
    }
  `;

  @state()
  private messages: Array<{ role: 'user' | 'assistant'; content: string; a2ui?: A2UIMessage[] }> = [];

  @state()
  private loading = false;

  @state()
  private loadingPhase: LoadingPhase = 'analyzing';

  @state()
  private error: string | null = null;

  @state()
  private inputValue = '';

  @state()
  private previewDarkMode = false;

  @state()
  private currentA2UI: A2UIMessage[] | null = null;

  private client = new A2UIClient();
  private phaseInterval: number | null = null;

  render() {
    return html`
      <div class="chat-panel">
        ${this.renderChatHeader()}
        ${this.messages.length === 0 ? this.renderEmptyState() : this.renderMessages()}
        ${this.renderInputArea()}
      </div>
      <div class="preview-panel">
        <div class="preview-gradient"></div>
        ${this.renderPreviewHeader()}
        <div class="preview-content">
          ${this.loading ? this.renderLoadingState() : this.renderPreview()}
        </div>
      </div>
    `;
  }

  private renderChatHeader() {
    return html`
      <header class="chat-header">
        <div class="brand">
          <div class="brand-icon">A</div>
          <span class="brand-text">A2UI Studio</span>
          <span class="brand-tag">Beta</span>
        </div>
      </header>
    `;
  }

  private renderEmptyState() {
    return html`
      <div class="empty-state">
        <div class="empty-icon">
          <span class="g-icon">auto_awesome</span>
        </div>
        <h2 class="empty-title">Create Beautiful UIs with AI</h2>
        <p class="empty-description">
          Describe what you want to build and watch as AI generates interactive interfaces in real-time.
        </p>
        <div class="suggestions">
          ${['Restaurant card', 'Contact form', 'Product gallery', 'User profile'].map(s => html`
            <button class="suggestion" @click=${() => this.handleSuggestion(s)}>${s}</button>
          `)}
        </div>
      </div>
    `;
  }

  private renderMessages() {
    return html`
      <div class="chat-messages">
        ${this.messages.map(msg => html`
          <div class="message ${msg.role}">
            <div class="message-avatar">
              ${msg.role === 'user' ? html`<span class="g-icon">person</span>` : 'A'}
            </div>
            <div class="message-content">
              ${msg.role === 'user' ? msg.content : (msg.a2ui ? 'Here\'s what I created for you.' : msg.content)}
            </div>
          </div>
        `)}
        ${this.error ? html`
          <div class="message assistant">
            <div class="message-avatar">A</div>
            <div class="message-content" style="color: var(--accent);">${this.error}</div>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private renderInputArea() {
    return html`
      <div class="chat-input-area">
        <form class="input-container" @submit=${this.handleSubmit}>
          <input
            class="chat-input"
            type="text"
            placeholder="Describe the UI you want to create..."
            .value=${this.inputValue}
            @input=${(e: Event) => this.inputValue = (e.target as HTMLInputElement).value}
            ?disabled=${this.loading}
          />
          <button class="send-btn" type="submit" ?disabled=${this.loading || !this.inputValue.trim()}>
            <span class="g-icon">send</span>
          </button>
        </form>
      </div>
    `;
  }

  private renderPreviewHeader() {
    return html`
      <header class="preview-header">
        <span class="preview-title">Preview</span>
        <div class="theme-toggle">
          <button 
            class="theme-btn ${!this.previewDarkMode ? 'active' : ''}"
            @click=${() => this.previewDarkMode = false}
          >
            <span class="g-icon">light_mode</span>
          </button>
          <button 
            class="theme-btn ${this.previewDarkMode ? 'active' : ''}"
            @click=${() => this.previewDarkMode = true}
          >
            <span class="g-icon">dark_mode</span>
          </button>
        </div>
      </header>
    `;
  }

  private renderLoadingState() {
    const phases: LoadingPhase[] = ['analyzing', 'generating', 'rendering'];
    const currentIndex = phases.indexOf(this.loadingPhase);

    return html`
      <div class="loading-state">
        <div class="loading-animation">
          <div class="loading-orbit"><div class="loading-dot"></div></div>
          <div class="loading-orbit"><div class="loading-dot"></div></div>
          <div class="loading-orbit"><div class="loading-dot"></div></div>
        </div>
        <span class="loading-text">${LOADING_MESSAGES[this.loadingPhase]}</span>
        <div class="loading-phase">
          ${phases.map((_, i) => html`
            <div class="phase-dot ${i < currentIndex ? 'complete' : i === currentIndex ? 'active' : ''}"></div>
          `)}
        </div>
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
          <p class="preview-empty-text">Your generated UI will appear here</p>
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
          <p class="preview-empty-text">No UI could be generated</p>
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
        <div class="preview-card-inner">
          ${results}
        </div>
      </div>
    `;
  }

  private handleSuggestion(text: string) {
    this.inputValue = `Create a ${text.toLowerCase()} with beautiful design`;
    this.handleSubmit(new Event('submit'));
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();

    const message = this.inputValue.trim();
    if (!message || this.loading) return;

    this.inputValue = '';
    this.error = null;
    this.loading = true;
    this.loadingPhase = 'analyzing';

    // Add user message
    this.messages = [...this.messages, { role: 'user', content: message }];

    // Start phase progression
    this.startPhaseProgression();

    try {
      const a2uiMessages = await this.client.send(message);
      
      this.loadingPhase = 'complete';
      this.currentA2UI = a2uiMessages;
      this.messages = [...this.messages, { role: 'assistant', content: '', a2ui: a2uiMessages }];
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
    } finally {
      this.stopPhaseProgression();
      this.loading = false;
    }
  }

  private startPhaseProgression() {
    const phases: LoadingPhase[] = ['analyzing', 'generating', 'rendering'];
    let currentIndex = 0;

    this.phaseInterval = window.setInterval(() => {
      currentIndex++;
      if (currentIndex < phases.length) {
        this.loadingPhase = phases[currentIndex];
      }
    }, 1500);
  }

  private stopPhaseProgression() {
    if (this.phaseInterval) {
      clearInterval(this.phaseInterval);
      this.phaseInterval = null;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'a2ui-studio': A2UIStudio;
  }
}
