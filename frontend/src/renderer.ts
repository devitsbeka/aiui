/**
 * A2UI Simple Renderer
 * Renders A2UI components to HTML
 */

import { html, TemplateResult, nothing } from 'lit';
import type { A2UIMessage, Component } from './client.js';

export interface Surface {
  surfaceId: string;
  catalogId: string;
  components: Map<string, Component>;
  dataModel: Record<string, unknown>;
}

export class A2UIRenderer {
  private surfaces: Map<string, Surface> = new Map();

  processMessages(messages: A2UIMessage[]): void {
    for (const message of messages) {
      if (message.createSurface) {
        this.surfaces.set(message.createSurface.surfaceId, {
          surfaceId: message.createSurface.surfaceId,
          catalogId: message.createSurface.catalogId,
          components: new Map(),
          dataModel: {},
        });
      } else if (message.updateComponents) {
        const surface = this.surfaces.get(message.updateComponents.surfaceId);
        if (surface) {
          for (const component of message.updateComponents.components) {
            surface.components.set(component.id, component);
          }
        }
      } else if (message.updateDataModel) {
        const surface = this.surfaces.get(message.updateDataModel.surfaceId);
        if (surface && message.updateDataModel.value !== undefined) {
          const path = message.updateDataModel.path || '/';
          if (path === '/' || path === '') {
            surface.dataModel = message.updateDataModel.value as Record<string, unknown>;
          } else {
            this.setValueAtPath(surface.dataModel, path, message.updateDataModel.value);
          }
        }
      } else if (message.deleteSurface) {
        this.surfaces.delete(message.deleteSurface.surfaceId);
      }
    }
  }

  private setValueAtPath(obj: Record<string, unknown>, path: string, value: unknown): void {
    const parts = path.split('/').filter(p => p);
    let current: Record<string, unknown> = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) {
        current[parts[i]] = {};
      }
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  }

  private getValueAtPath(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('/').filter(p => p);
    let current: unknown = obj;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (typeof current === 'object' && current !== null) {
        current = (current as Record<string, unknown>)[part];
      } else if (Array.isArray(current)) {
        current = current[parseInt(part)];
      } else {
        return undefined;
      }
    }
    return current;
  }

  private resolveValue(value: unknown, dataModel: Record<string, unknown>): unknown {
    if (value && typeof value === 'object') {
      const v = value as Record<string, unknown>;
      if ('literalString' in v) return v.literalString;
      if ('literalNumber' in v) return v.literalNumber;
      if ('literalBoolean' in v) return v.literalBoolean;
      if ('literalArray' in v) return v.literalArray;
      if ('path' in v && typeof v.path === 'string') {
        return this.getValueAtPath(dataModel, v.path);
      }
    }
    return value;
  }

  getSurfaces(): Map<string, Surface> {
    return this.surfaces;
  }

  clearSurfaces(): void {
    this.surfaces.clear();
  }

  renderSurface(surfaceId: string): TemplateResult | typeof nothing {
    const surface = this.surfaces.get(surfaceId);
    if (!surface) return nothing;

    const rootComponent = surface.components.get('root');
    if (!rootComponent) return nothing;

    return this.renderComponent(rootComponent, surface);
  }

  private renderComponent(component: Component, surface: Surface, dataContextPath: string = ''): TemplateResult | typeof nothing {
    const dataModel = surface.dataModel;

    switch (component.type) {
      case 'Text':
        return this.renderText(component, dataModel, dataContextPath);
      case 'Image':
        return this.renderImage(component, dataModel, dataContextPath);
      case 'Icon':
        return this.renderIcon(component, dataModel);
      case 'Row':
        return this.renderRow(component, surface, dataContextPath);
      case 'Column':
        return this.renderColumn(component, surface, dataContextPath);
      case 'List':
        return this.renderList(component, surface, dataContextPath);
      case 'Card':
        return this.renderCard(component, surface, dataContextPath);
      case 'Button':
        return this.renderButton(component, surface, dataContextPath);
      case 'TextField':
        return this.renderTextField(component, dataModel);
      case 'Divider':
        return this.renderDivider(component);
      case 'Slider':
        return this.renderSlider(component, dataModel);
      case 'CheckBox':
        return this.renderCheckBox(component, dataModel);
      default:
        return html`<div class="unknown-component">[Unknown: ${component.type}]</div>`;
    }
  }

  private renderText(component: Component, dataModel: Record<string, unknown>, dataContextPath: string): TemplateResult {
    let textValue = component.text;
    if (textValue && typeof textValue === 'object') {
      const tv = textValue as Record<string, unknown>;
      if ('path' in tv && typeof tv.path === 'string') {
        // Handle relative paths
        let fullPath = tv.path;
        if (tv.path.startsWith('./') && dataContextPath) {
          fullPath = dataContextPath + tv.path.slice(1);
        }
        textValue = this.getValueAtPath(dataModel, fullPath);
      } else if ('literalString' in tv) {
        textValue = tv.literalString;
      }
    }
    
    const text = String(textValue ?? '');
    const usageHint = component.usageHint as string || 'body';
    
    const tagMap: Record<string, string> = {
      h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5',
      caption: 'span', body: 'p'
    };
    
    const tag = tagMap[usageHint] || 'p';
    const className = `a2ui-text a2ui-text--${usageHint}`;
    
    if (tag === 'h1') return html`<h1 class="${className}">${text}</h1>`;
    if (tag === 'h2') return html`<h2 class="${className}">${text}</h2>`;
    if (tag === 'h3') return html`<h3 class="${className}">${text}</h3>`;
    if (tag === 'h4') return html`<h4 class="${className}">${text}</h4>`;
    if (tag === 'h5') return html`<h5 class="${className}">${text}</h5>`;
    if (tag === 'span') return html`<span class="${className}">${text}</span>`;
    return html`<p class="${className}">${text}</p>`;
  }

  private renderImage(component: Component, dataModel: Record<string, unknown>, dataContextPath: string): TemplateResult {
    let urlValue = component.url;
    if (urlValue && typeof urlValue === 'object') {
      const uv = urlValue as Record<string, unknown>;
      if ('path' in uv && typeof uv.path === 'string') {
        let fullPath = uv.path;
        if (uv.path.startsWith('./') && dataContextPath) {
          fullPath = dataContextPath + uv.path.slice(1);
        }
        urlValue = this.getValueAtPath(dataModel, fullPath);
      } else if ('literalString' in uv) {
        urlValue = uv.literalString;
      }
    }
    
    const url = String(urlValue ?? '');
    const usageHint = component.usageHint as string || 'mediumFeature';
    const fit = component.fit as string || 'cover';
    
    return html`
      <img 
        class="a2ui-image a2ui-image--${usageHint}" 
        src="${url}" 
        alt=""
        style="object-fit: ${fit}"
        loading="lazy"
      />
    `;
  }

  private renderIcon(component: Component, dataModel: Record<string, unknown>): TemplateResult {
    const nameValue = this.resolveValue(component.name, dataModel);
    const iconName = this.camelToSnake(String(nameValue ?? 'help'));
    
    return html`<span class="g-icon a2ui-icon">${iconName}</span>`;
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  private renderRow(component: Component, surface: Surface, dataContextPath: string): TemplateResult {
    const children = this.resolveChildren(component.children, surface, dataContextPath);
    const distribution = component.distribution as string || 'start';
    const alignment = component.alignment as string || 'center';
    
    return html`
      <div class="a2ui-row" style="justify-content: ${this.mapDistribution(distribution)}; align-items: ${alignment}">
        ${children}
      </div>
    `;
  }

  private renderColumn(component: Component, surface: Surface, dataContextPath: string): TemplateResult {
    const children = this.resolveChildren(component.children, surface, dataContextPath);
    const distribution = component.distribution as string || 'start';
    const alignment = component.alignment as string || 'stretch';
    
    return html`
      <div class="a2ui-column" style="justify-content: ${this.mapDistribution(distribution)}; align-items: ${alignment}">
        ${children}
      </div>
    `;
  }

  private renderList(component: Component, surface: Surface, dataContextPath: string): TemplateResult {
    const children = this.resolveChildren(component.children, surface, dataContextPath);
    const direction = component.direction as string || 'vertical';
    const alignment = component.alignment as string || 'stretch';
    
    return html`
      <div class="a2ui-list a2ui-list--${direction}" style="align-items: ${alignment}">
        ${children}
      </div>
    `;
  }

  private resolveChildren(children: unknown, surface: Surface, dataContextPath: string): (TemplateResult | typeof nothing)[] {
    if (!children || typeof children !== 'object') return [];
    
    const c = children as Record<string, unknown>;
    
    if ('explicitList' in c && Array.isArray(c.explicitList)) {
      const results: (TemplateResult | typeof nothing)[] = [];
      for (const id of c.explicitList) {
        const comp = surface.components.get(id as string);
        if (comp) {
          results.push(this.renderComponent(comp, surface, dataContextPath));
        }
      }
      return results;
    }
    
    if ('template' in c && c.template && typeof c.template === 'object') {
      const template = c.template as Record<string, unknown>;
      const componentId = template.componentId as string;
      const dataBinding = template.dataBinding as string;
      
      if (componentId && dataBinding) {
        const templateComp = surface.components.get(componentId);
        const data = this.getValueAtPath(surface.dataModel, dataBinding);
        
        if (templateComp && data) {
          const results: (TemplateResult | typeof nothing)[] = [];
          if (Array.isArray(data)) {
            for (let index = 0; index < data.length; index++) {
              const contextPath = `${dataBinding}/${index}`;
              results.push(this.renderComponent(templateComp, surface, contextPath));
            }
          } else if (typeof data === 'object') {
            for (const key of Object.keys(data as object)) {
              const contextPath = `${dataBinding}/${key}`;
              results.push(this.renderComponent(templateComp, surface, contextPath));
            }
          }
          return results;
        }
      }
    }
    
    return [];
  }

  private mapDistribution(distribution: string): string {
    const map: Record<string, string> = {
      start: 'flex-start',
      end: 'flex-end',
      center: 'center',
      spaceBetween: 'space-between',
      spaceAround: 'space-around',
      spaceEvenly: 'space-evenly',
    };
    return map[distribution] || 'flex-start';
  }

  private renderCard(component: Component, surface: Surface, dataContextPath: string): TemplateResult {
    const childId = component.child as string;
    const childComp = childId ? surface.components.get(childId) : null;
    
    return html`
      <div class="a2ui-card">
        ${childComp ? this.renderComponent(childComp, surface, dataContextPath) : nothing}
      </div>
    `;
  }

  private renderButton(component: Component, surface: Surface, dataContextPath: string): TemplateResult {
    const childId = component.child as string;
    const childComp = childId ? surface.components.get(childId) : null;
    const primary = component.primary as boolean ?? false;
    
    return html`
      <button class="a2ui-button ${primary ? 'a2ui-button--primary' : ''}">
        ${childComp ? this.renderComponent(childComp, surface, dataContextPath) : nothing}
      </button>
    `;
  }

  private renderTextField(component: Component, dataModel: Record<string, unknown>): TemplateResult {
    const label = this.resolveValue(component.label, dataModel) as string ?? '';
    const text = this.resolveValue(component.text, dataModel) as string ?? '';
    const type = component.textFieldType as string || 'shortText';
    
    const inputType = type === 'number' ? 'number' : 
                      type === 'date' ? 'date' :
                      type === 'obscured' ? 'password' : 'text';
    
    if (type === 'longText') {
      return html`
        <div class="a2ui-textfield">
          <label>${label}</label>
          <textarea .value="${text}"></textarea>
        </div>
      `;
    }
    
    return html`
      <div class="a2ui-textfield">
        <label>${label}</label>
        <input type="${inputType}" .value="${text}" />
      </div>
    `;
  }

  private renderDivider(component: Component): TemplateResult {
    const axis = component.axis as string || 'horizontal';
    return html`<hr class="a2ui-divider a2ui-divider--${axis}" />`;
  }

  private renderSlider(component: Component, dataModel: Record<string, unknown>): TemplateResult {
    const value = this.resolveValue(component.value, dataModel) as number ?? 50;
    const min = component.minValue as number ?? 0;
    const max = component.maxValue as number ?? 100;
    
    return html`
      <input type="range" class="a2ui-slider" .value="${value}" min="${min}" max="${max}" />
    `;
  }

  private renderCheckBox(component: Component, dataModel: Record<string, unknown>): TemplateResult {
    const label = this.resolveValue(component.label, dataModel) as string ?? '';
    const checked = this.resolveValue(component.value, dataModel) as boolean ?? false;
    
    return html`
      <label class="a2ui-checkbox">
        <input type="checkbox" ?checked="${checked}" />
        <span>${label}</span>
      </label>
    `;
  }
}

