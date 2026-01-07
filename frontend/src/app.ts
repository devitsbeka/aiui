/**
 * A2UI Chat Application
 * Main entry point for the chat shell
 */

import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { A2UIClient, A2UIMessage } from './client.js';
import { A2UIRenderer } from './renderer.js';

@customElement('a2ui-chat')
export class A2UIChat extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      box-sizing: border-box;
    }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
      margin-bottom: 24px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--p-40) 0%, var(--p-60) 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(81, 84, 179, 0.3);
    }

    .logo-text {
      font-size: 24px;
      font-weight: 600;
      color: light-dark(var(--n-10), var(--n-95));
      letter-spacing: -0.5px;
    }

    .theme-toggle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      background: light-dark(var(--n-100), var(--n-20));
      color: light-dark(var(--p-40), var(--p-70));
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .theme-toggle:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    /* Hero Section */
    .hero {
      text-align: center;
      padding: 48px 24px;
      animation: fadeInUp 0.6s ease-out;
    }

    .hero h1 {
      font-size: 42px;
      font-weight: 700;
      color: light-dark(var(--n-10), var(--n-95));
      margin: 0 0 16px 0;
      letter-spacing: -1px;
      line-height: 1.2;
    }

    .hero h1 span {
      background: linear-gradient(135deg, var(--p-40) 0%, var(--p-60) 50%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero p {
      font-size: 18px;
      color: light-dark(var(--n-40), var(--n-70));
      margin: 0;
      max-width: 500px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* Chat Container */
    .chat-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: light-dark(rgba(255, 255, 255, 0.7), rgba(26, 19, 51, 0.7));
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 24px;
      border: 1px solid light-dark(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.1));
      box-shadow: 
        0 4px 24px rgba(0, 0, 0, 0.06),
        0 1px 2px rgba(0, 0, 0, 0.04);
      overflow: hidden;
    }

    /* Messages Area */
    .messages {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      min-height: 300px;
    }

    .message {
      margin-bottom: 20px;
      animation: fadeInUp 0.3s ease-out;
    }

    .message.user {
      display: flex;
      justify-content: flex-end;
    }

    .message.user .message-content {
      background: linear-gradient(135deg, var(--p-40) 0%, var(--p-50) 100%);
      color: white;
      border-radius: 20px 20px 4px 20px;
      padding: 12px 18px;
      max-width: 80%;
      box-shadow: 0 2px 8px rgba(81, 84, 179, 0.3);
    }

    .message.assistant .message-content {
      background: light-dark(var(--n-98), var(--n-15));
      border-radius: 20px 20px 20px 4px;
      padding: 16px;
      max-width: 100%;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 200px;
      color: light-dark(var(--n-50), var(--n-60));
      text-align: center;
      padding: 40px;
    }

    .empty-state .icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0;
      font-size: 16px;
    }

    /* Input Area */
    .input-area {
      padding: 16px 20px 20px;
      border-top: 1px solid light-dark(rgba(0, 0, 0, 0.06), rgba(255, 255, 255, 0.06));
    }

    .input-container {
      display: flex;
      gap: 12px;
      align-items: flex-end;
    }

    .input-wrapper {
      flex: 1;
      position: relative;
    }

    input[type="text"] {
      width: 100%;
      padding: 14px 20px;
      border: 2px solid light-dark(var(--n-90), var(--n-25));
      border-radius: 16px;
      font-size: 16px;
      font-family: inherit;
      background: light-dark(var(--n-100), var(--n-10));
      color: light-dark(var(--n-10), var(--n-95));
      transition: all 0.2s ease;
      outline: none;
    }

    input[type="text"]:focus {
      border-color: var(--p-60);
      box-shadow: 0 0 0 3px light-dark(rgba(132, 135, 234, 0.2), rgba(132, 135, 234, 0.15));
    }

    input[type="text"]::placeholder {
      color: light-dark(var(--n-60), var(--n-50));
    }

    .send-button {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      border: none;
      background: linear-gradient(135deg, var(--p-40) 0%, var(--p-50) 100%);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(81, 84, 179, 0.3);
    }

    .send-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(81, 84, 179, 0.4);
    }

    .send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Loading State */
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      gap: 16px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid light-dark(var(--n-90), var(--n-25));
      border-top-color: var(--p-60);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-text {
      color: light-dark(var(--n-50), var(--n-60));
      font-size: 14px;
    }

    /* Error State */
    .error {
      background: light-dark(var(--e-95), rgba(186, 26, 26, 0.15));
      color: light-dark(var(--e-40), var(--e-80));
      padding: 12px 16px;
      border-radius: 12px;
      margin: 16px;
      font-size: 14px;
    }

    /* A2UI Component Styles */
    .a2ui-surface {
      animation: fadeInUp 0.4s ease-out;
    }

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
      background: light-dark(var(--n-100), var(--n-20));
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      border: 1px solid light-dark(var(--n-95), var(--n-25));
      overflow: hidden;
    }

    .a2ui-text {
      margin: 0;
      color: light-dark(var(--n-10), var(--n-95));
    }

    .a2ui-text--h1 {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .a2ui-text--h2 {
      font-size: 24px;
      font-weight: 600;
    }

    .a2ui-text--h3 {
      font-size: 20px;
      font-weight: 600;
    }

    .a2ui-text--h4 {
      font-size: 18px;
      font-weight: 500;
    }

    .a2ui-text--h5 {
      font-size: 16px;
      font-weight: 500;
    }

    .a2ui-text--body {
      font-size: 16px;
      line-height: 1.6;
      color: light-dark(var(--n-30), var(--n-80));
    }

    .a2ui-text--caption {
      font-size: 14px;
      color: light-dark(var(--n-50), var(--n-60));
    }

    .a2ui-image {
      display: block;
      max-width: 100%;
      border-radius: 12px;
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
      max-width: 240px;
      aspect-ratio: 16/9;
    }

    .a2ui-image--largeFeature {
      width: 100%;
      aspect-ratio: 16/9;
    }

    .a2ui-image--header {
      width: 100%;
      aspect-ratio: 21/9;
      border-radius: 16px 16px 0 0;
      margin: -16px -16px 16px -16px;
      width: calc(100% + 32px);
    }

    .a2ui-icon {
      color: light-dark(var(--p-40), var(--p-70));
    }

    .a2ui-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 24px;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s ease;
      background: light-dark(var(--n-95), var(--n-25));
      color: light-dark(var(--n-20), var(--n-90));
    }

    .a2ui-button--primary {
      background: linear-gradient(135deg, var(--p-40) 0%, var(--p-50) 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(81, 84, 179, 0.3);
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
      font-size: 14px;
      font-weight: 500;
      color: light-dark(var(--n-30), var(--n-80));
    }

    .a2ui-textfield input,
    .a2ui-textfield textarea {
      padding: 12px 16px;
      border: 2px solid light-dark(var(--n-90), var(--n-25));
      border-radius: 10px;
      font-size: 16px;
      font-family: inherit;
      background: light-dark(var(--n-100), var(--n-10));
      color: light-dark(var(--n-10), var(--n-95));
    }

    .a2ui-divider {
      border: none;
      height: 1px;
      background: light-dark(var(--n-90), var(--n-25));
      margin: 8px 0;
    }

    .a2ui-divider--vertical {
      width: 1px;
      height: auto;
      min-height: 20px;
    }

    .a2ui-slider {
      width: 100%;
      accent-color: var(--p-50);
    }

    .a2ui-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 16px;
      color: light-dark(var(--n-20), var(--n-90));
    }

    .a2ui-checkbox input {
      width: 20px;
      height: 20px;
      accent-color: var(--p-50);
    }

    /* Animations */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* Responsive */
    @media (max-width: 640px) {
      :host {
        padding: 12px;
      }

      .hero h1 {
        font-size: 32px;
      }

      .hero p {
        font-size: 16px;
      }

      .chat-container {
        border-radius: 20px;
      }
    }
  `;

  @state()
  private messages: Array<{ role: 'user' | 'assistant'; content: string | A2UIMessage[] }> = [];

  @state()
  private loading = false;

  @state()
  private error: string | null = null;

  @state()
  private inputValue = '';

  private client = new A2UIClient();

  render() {
    return html`
      ${this.renderHeader()}
      ${this.messages.length === 0 ? this.renderHero() : nothing}
      ${this.renderChatContainer()}
    `;
  }

  private renderHeader() {
    return html`
      <header class="header">
        <div class="logo">
          <div class="logo-icon">A</div>
          <span class="logo-text">A2UI Chat</span>
        </div>
        <button class="theme-toggle" @click=${this.toggleTheme}>
          <span class="g-icon filled-heavy theme-icon">dark_mode</span>
        </button>
      </header>
    `;
  }

  private renderHero() {
    return html`
      <div class="hero">
        <h1>Generate <span>Rich UIs</span> with AI</h1>
        <p>Describe what you want to see and watch as AI creates beautiful, interactive interfaces using the A2UI protocol.</p>
      </div>
    `;
  }

  private renderChatContainer() {
    return html`
      <div class="chat-container">
        <div class="messages">
          ${this.messages.length === 0 && !this.loading 
            ? this.renderEmptyState() 
            : this.renderMessages()}
          ${this.loading ? this.renderLoading() : nothing}
          ${this.error ? this.renderError() : nothing}
        </div>
        ${this.renderInputArea()}
      </div>
    `;
  }

  private renderEmptyState() {
    return html`
      <div class="empty-state">
        <span class="g-icon icon">chat_bubble</span>
        <p>Try asking for a restaurant card, a contact form, or a product gallery!</p>
      </div>
    `;
  }

  private renderMessages() {
    return this.messages.map(msg => html`
      <div class="message ${msg.role}">
        <div class="message-content">
          ${msg.role === 'user' 
            ? msg.content 
            : this.renderA2UIContent(msg.content as A2UIMessage[])}
        </div>
      </div>
    `);
  }

  private renderA2UIContent(messages: A2UIMessage[]) {
    // Process messages into a fresh renderer
    const a2uiRenderer = new A2UIRenderer();
    a2uiRenderer.processMessages(messages);
    
    const surfaces = a2uiRenderer.getSurfaces();
    if (surfaces.size === 0) {
      return html`<p>No UI generated</p>`;
    }

    const results: ReturnType<typeof html>[] = [];
    for (const [surfaceId] of surfaces) {
      results.push(html`
        <div class="a2ui-surface">
          ${a2uiRenderer.renderSurface(surfaceId)}
        </div>
      `);
    }
    return results;
  }

  private renderLoading() {
    return html`
      <div class="loading">
        <div class="spinner"></div>
        <span class="loading-text">Generating UI...</span>
      </div>
    `;
  }

  private renderError() {
    return html`
      <div class="error">
        ${this.error}
      </div>
    `;
  }

  private renderInputArea() {
    return html`
      <div class="input-area">
        <form class="input-container" @submit=${this.handleSubmit}>
          <div class="input-wrapper">
            <input
              type="text"
              placeholder="Describe the UI you want to create..."
              .value=${this.inputValue}
              @input=${(e: Event) => this.inputValue = (e.target as HTMLInputElement).value}
              ?disabled=${this.loading}
            />
          </div>
          <button 
            type="submit" 
            class="send-button"
            ?disabled=${this.loading || !this.inputValue.trim()}
          >
            <span class="g-icon filled-heavy">send</span>
          </button>
        </form>
      </div>
    `;
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    
    const message = this.inputValue.trim();
    if (!message || this.loading) return;

    this.inputValue = '';
    this.error = null;
    this.loading = true;

    // Add user message
    this.messages = [...this.messages, { role: 'user', content: message }];

    try {
      const a2uiMessages = await this.client.send(message);
      this.messages = [...this.messages, { role: 'assistant', content: a2uiMessages }];
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      this.loading = false;
    }
  }

  private toggleTheme() {
    const isDark = document.body.classList.contains('dark') || 
      (!document.body.classList.contains('light') && 
       window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.body.classList.remove('light');
      document.body.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }

    // Update theme icon
    const icon = this.shadowRoot?.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = isDark ? 'dark_mode' : 'light_mode';
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'a2ui-chat': A2UIChat;
  }
}

