import { PrimaryDomainId } from '../types';

export interface BreadcrumbCrumb {
  label: string;
  domain?: PrimaryDomainId;
  tabId?: string;
  itemId?: string;
  isClickable: boolean;
}

export interface NavigationRouteState {
  domain: PrimaryDomainId;
  tab: string;
  itemId?: string;
  item?: string;
  view?: string;
}

class NavigationRouterService {
  private historyStack: NavigationRouteState[] = [];
  private historyIndex: number = -1;
  private listeners: ((state: NavigationRouteState) => void)[] = [];

  // Workspaces list
  public readonly workspaces = [
    { id: 'ws_eng_alpha', name: 'Engineering Alpha Sprints', org: 'Vinexsah Global Holdings', badge: 'Active' },
    { id: 'ws_vinexsah_matrix', name: 'Vinexsah Executive Matrix', org: 'Vinexsah Global Holdings', badge: 'Core' },
    { id: 'ws_comm_ops', name: 'Commercial Operations Hub', org: 'Vinexsah Global Holdings', badge: 'Finance' },
    { id: 'ws_planetary_lab', name: 'Planetary Intelligence Lab', org: 'Vinexsah Global Holdings', badge: 'R&D' }
  ];

  // Organizations list
  public readonly organizations = [
    { id: 'org_vinexsah_global', name: 'Vinexsah Global Holdings (Primary)', domain: 'vinexsah.io' },
    { id: 'org_partner_corp', name: 'Partner Collaborative Federation', domain: 'federation.org' },
    { id: 'org_sandbox_dev', name: 'Developer Sandbox Environment', domain: 'sandbox.dev' }
  ];

  private currentWorkspaceId: string = 'ws_eng_alpha';
  private currentOrgId: string = 'org_vinexsah_global';

  constructor() {
    this.loadInitialFromUrl();
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', (event) => {
        if (event.state && event.state.tab) {
          this.applyRoute(event.state, false);
        } else {
          this.loadInitialFromUrl();
        }
      });
    }
  }

  public getWorkspaces() {
    return this.workspaces;
  }

  public getCurrentWorkspaceId(): string {
    return this.currentWorkspaceId;
  }

  public setWorkspace(id: string) {
    this.setActiveWorkspace(id);
  }

  public getCurrentRoute(): NavigationRouteState {
    return this.historyStack[this.historyIndex] || { domain: 'home', tab: 'home' };
  }

  public onPopState(listener: (state: NavigationRouteState) => void): () => void {
    return this.subscribe(listener);
  }

  public getActiveWorkspace() {
    return this.workspaces.find(w => w.id === this.currentWorkspaceId) || this.workspaces[0];
  }

  public setActiveWorkspace(id: string) {
    this.currentWorkspaceId = id;
    try {
      localStorage.setItem('catalyx_v24_active_workspace', id);
    } catch {}
  }

  public getActiveOrganization() {
    return this.organizations.find(o => o.id === this.currentOrgId) || this.organizations[0];
  }

  public setActiveOrganization(id: string) {
    this.currentOrgId = id;
    try {
      localStorage.setItem('catalyx_v24_active_org', id);
    } catch {}
  }

  private loadInitialFromUrl(): NavigationRouteState {
    let domain: PrimaryDomainId = 'home';
    let tab = 'home';
    let itemId: string | undefined = undefined;
    let view: string | undefined = undefined;

    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tab');
      const urlDomain = params.get('domain') as PrimaryDomainId;
      const urlItem = params.get('item');
      const urlView = params.get('view');

      if (urlTab) tab = urlTab;
      if (urlDomain) domain = urlDomain;
      if (urlItem) itemId = urlItem;
      if (urlView) view = urlView;
    }

    const state: NavigationRouteState = { domain, tab, itemId, view };
    this.historyStack = [state];
    this.historyIndex = 0;
    return state;
  }

  public getInitialRoute(): NavigationRouteState {
    return this.historyStack[this.historyIndex] || { domain: 'home', tab: 'home' };
  }

  public pushRoute(state: NavigationRouteState) {
    // If state is identical to current, don't duplicate
    const current = this.historyStack[this.historyIndex];
    if (
      current &&
      current.domain === state.domain &&
      current.tab === state.tab &&
      current.itemId === state.itemId &&
      current.view === state.view
    ) {
      return;
    }

    // Truncate any forward history
    this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
    this.historyStack.push(state);
    this.historyIndex = this.historyStack.length - 1;

    // Synchronize browser history and URL query parameters
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('domain', state.domain);
        url.searchParams.set('tab', state.tab);
        if (state.itemId) {
          url.searchParams.set('item', state.itemId);
        } else {
          url.searchParams.delete('item');
        }
        if (state.view) {
          url.searchParams.set('view', state.view);
        } else {
          url.searchParams.delete('view');
        }
        window.history.pushState(state, '', url.toString());
      } catch (e) {
        console.warn('Could not update browser history URL', e);
      }
    }

    this.notifyListeners(state);
  }

  public canGoBack(): boolean {
    return this.historyIndex > 0;
  }

  public canGoForward(): boolean {
    return this.historyIndex < this.historyStack.length - 1;
  }

  public goBack(): NavigationRouteState | null {
    if (!this.canGoBack()) return null;
    this.historyIndex -= 1;
    const state = this.historyStack[this.historyIndex];
    this.applyRoute(state, true);
    return state;
  }

  public goForward(): NavigationRouteState | null {
    if (!this.canGoForward()) return null;
    this.historyIndex += 1;
    const state = this.historyStack[this.historyIndex];
    this.applyRoute(state, true);
    return state;
  }

  private applyRoute(state: NavigationRouteState, updateBrowserHistory: boolean) {
    if (updateBrowserHistory && typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('domain', state.domain);
        url.searchParams.set('tab', state.tab);
        if (state.itemId) {
          url.searchParams.set('item', state.itemId);
        } else {
          url.searchParams.delete('item');
        }
        window.history.replaceState(state, '', url.toString());
      } catch (e) {
        console.warn('Could not replace history state', e);
      }
    }
    this.notifyListeners(state);
  }

  public subscribe(listener: (state: NavigationRouteState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(state: NavigationRouteState) {
    this.listeners.forEach(l => {
      try {
        l(state);
      } catch (err) {
        console.error('Error in route listener', err);
      }
    });
  }
}

export const navigationRouterService = new NavigationRouterService();
