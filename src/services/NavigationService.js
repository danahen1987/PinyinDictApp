import { DEFAULTS } from '../constants/AppConstants';

// Navigation service for managing app navigation state
export class NavigationService {
  constructor() {
    this.currentView = DEFAULTS.currentView;
    this.navigationHistory = [];
    this.listeners = new Set();
  }

  // Navigate to a specific view
  navigateTo(view, params = {}) {
    try {
      // Validate view
      if (!this.isValidView(view)) {
        throw new Error(`Invalid view: ${view}`);
      }

      // Add current view to history
      if (this.currentView !== view) {
        this.navigationHistory.push({
          view: this.currentView,
          timestamp: Date.now(),
          params: this.currentParams || {},
        });
      }

      // Update current view
      this.currentView = view;
      this.currentParams = params;

      // Notify listeners
      this.notifyListeners({
        type: 'navigation',
        view,
        params,
        timestamp: Date.now(),
      });

      return {
        success: true,
        view,
        params,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Go back to previous view
  goBack() {
    try {
      if (this.navigationHistory.length === 0) {
        throw new Error('No previous view to go back to');
      }

      const previousView = this.navigationHistory.pop();
      this.currentView = previousView.view;
      this.currentParams = previousView.params;

      // Notify listeners
      this.notifyListeners({
        type: 'back',
        view: this.currentView,
        params: this.currentParams,
        timestamp: Date.now(),
      });

      return {
        success: true,
        view: this.currentView,
        params: this.currentParams,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get current view
  getCurrentView() {
    return this.currentView;
  }

  // Get current params
  getCurrentParams() {
    return this.currentParams || {};
  }

  // Get navigation history
  getNavigationHistory() {
    return [...this.navigationHistory];
  }

  // Clear navigation history
  clearHistory() {
    this.navigationHistory = [];
  }

  // Check if can go back
  canGoBack() {
    return this.navigationHistory.length > 0;
  }

  // Add navigation listener
  addListener(listener) {
    if (typeof listener === 'function') {
      this.listeners.add(listener);
    }
  }

  // Remove navigation listener
  removeListener(listener) {
    this.listeners.delete(listener);
  }

  // Notify all listeners
  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in navigation listener:', error);
      }
    });
  }

  // Validate view
  isValidView(view) {
    const validViews = ['landing', 'cards', 'stroke-practice', 'sentence-popup'];
    return validViews.includes(view);
  }

  // Navigate to landing page
  navigateToLanding() {
    return this.navigateTo('landing');
  }

  // Navigate to cards view
  navigateToCards(params = {}) {
    return this.navigateTo('cards', params);
  }

  // Navigate to stroke practice
  navigateToStrokePractice(character) {
    return this.navigateTo('stroke-practice', { character });
  }

  // Navigate to sentence popup
  navigateToSentencePopup(sentence) {
    return this.navigateTo('sentence-popup', { sentence });
  }

  // Get navigation state
  getNavigationState() {
    return {
      currentView: this.currentView,
      currentParams: this.currentParams,
      historyLength: this.navigationHistory.length,
      canGoBack: this.canGoBack(),
    };
  }

  // Reset navigation to initial state
  reset() {
    this.currentView = DEFAULTS.currentView;
    this.currentParams = {};
    this.navigationHistory = [];
    
    // Notify listeners
    this.notifyListeners({
      type: 'reset',
      view: this.currentView,
      timestamp: Date.now(),
    });
  }

  // Navigate with animation
  navigateWithAnimation(view, params = {}, animationType = 'slide') {
    const result = this.navigateTo(view, params);
    
    if (result.success) {
      // Notify listeners about animation
      this.notifyListeners({
        type: 'animation',
        animationType,
        view,
        params,
        timestamp: Date.now(),
      });
    }
    
    return result;
  }

  // Get breadcrumb trail
  getBreadcrumbTrail() {
    const trail = [];
    
    // Add history items
    this.navigationHistory.forEach(item => {
      trail.push({
        view: item.view,
        label: this.getViewLabel(item.view),
        timestamp: item.timestamp,
      });
    });
    
    // Add current view
    trail.push({
      view: this.currentView,
      label: this.getViewLabel(this.currentView),
      timestamp: Date.now(),
      isCurrent: true,
    });
    
    return trail;
  }

  // Get view label for display
  getViewLabel(view) {
    const labels = {
      'landing': 'Home',
      'cards': 'Character Cards',
      'stroke-practice': 'Stroke Practice',
      'sentence-popup': 'Sentence',
    };
    
    return labels[view] || view;
  }

  // Check if view is accessible
  isViewAccessible(view) {
    // All views are accessible by default
    // This could be extended with permission checks
    return this.isValidView(view);
  }

  // Get navigation statistics
  getNavigationStats() {
    return {
      totalNavigations: this.navigationHistory.length,
      currentView: this.currentView,
      historySize: this.navigationHistory.length,
      listenersCount: this.listeners.size,
    };
  }
}
