import axios from "axios";
import API from "../API";
import Auth from "../Auth";

declare const BASEPATH: string;

// Define types for better type safety
interface WorkflowStep {
  code: string;
  module_actions_control?: Array<{
    id: string;
    selected: string;
    assignedRoles?: string[];
    assignedJobs?: string[];
  }>;
}

interface DocumentRow {
  step_code: string;
  created_by: string;
  owner_id: string;
  reviewer_id: string;
  stakeholder_ids?: string | string[];
  team_ids?: string | string[];
}

interface PermissionChecker {
  canPerformAction: (actionId: string) => boolean;
  userRelations: string[];
  actions: any[];
}

// Add types for framework and control
interface Control {
  id: string;
  short_name: string;
  framework_id: string;
}

interface Framework {
  id: string;
  title?: string;
  control?: Control[];
}

interface FilterControlsResult {
  filteredControls: Control[];
  validControlIds: string[];
}

// Add types for clause context menu
interface ContextMenuData {
  activeMenu: HTMLElement | null;
  handleContextMenu: ((event: MouseEvent) => void) | null;
  handleClick: (() => void) | null;
  handleMouseDown: ((event: MouseEvent) => void) | null;
}

interface ClauseContextMenuCleanup {
  cleanup: () => void;
}

interface AddTextToClausesResult {
  clauses: string[];
  targetIndex: number;
}

export default class Document extends API {
  constructor() {
    super("document");
  }

  async updateTransationnVersionDocument(params: any) {
    axios.defaults.baseURL = BASEPATH;

    try {
      const response = await axios.post(`/document-version-update`, params, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createNewDocumentVersion(params: any) {
    axios.defaults.baseURL = BASEPATH;

    try {
      const response = await axios.post(`/create/version`, params, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async activeVersionOrDeactivate(params: any) {
    axios.defaults.baseURL = BASEPATH;

    try {
      const response = await axios.post(`/active-deactivate-version`, params, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getUserPermissionChecker(
    row: DocumentRow,
    workflowSteps: WorkflowStep[]
  ): PermissionChecker {
    // Get current step and actions
    const currentStep = workflowSteps.find(
      (step) => step.code === row.step_code
    );
    const actions = currentStep?.["module_actions_control"] ?? [];

    // Get user info
    const userId = Auth.USER.id;
    const userTeamIds = Auth.USER.team_ids ?? [];
    const userJobId = Auth.USER.job_id ?? null;

    // Check relations
    const isCreator = row.created_by === userId;
    const isOwner = row.owner_id === userId;
    const isReviewer = row.reviewer_id === userId;

    // Handle stakeholder_ids safely
    const stakeholderIds = Array.isArray(row.stakeholder_ids)
      ? row.stakeholder_ids
      : row.stakeholder_ids
      ? row.stakeholder_ids.split(",").map((id) => id.trim())
      : [];
    const isStakeholder = stakeholderIds.includes(userId);

    // Handle team_ids safely
    const rowTeamIds = Array.isArray(row.team_ids)
      ? row.team_ids
      : row.team_ids
      ? row.team_ids.split(",").map((id) => id.trim())
      : [];
    const isInTeam = userTeamIds.some((teamId: any) =>
      rowTeamIds.includes(teamId)
    );

    // Build user relations array
    const userRelations: string[] = [];
    if (isCreator) userRelations.push("creator");
    if (isOwner) userRelations.push("owner");
    if (isReviewer) userRelations.push("reviewer");
    if (isStakeholder) userRelations.push("stakeholders");
    if (isInTeam) userRelations.push("teams");

    // Return permission checker
    return {
      canPerformAction: (actionId: string) => {
        const action = actions.find(
          (a) => a && a.id === actionId && a.selected === "true"
        );
        if (!action) return false;

        // Normalize arrays (avoid nulls)
        const assignedRoles = (action.assignedRoles || []).filter(Boolean);
        const assignedJobs = (action.assignedJobs || []).filter(Boolean);

        // Check if user has any matching role or job
        const roleMatch = assignedRoles.some((role) =>
          userRelations.includes(role)
        );

        const jobMatch =
          userJobId &&
          assignedJobs.some((jobId) => jobId && jobId === userJobId);

        return roleMatch || jobMatch;
      },
      userRelations,
      actions,
    };
  }

  userPosation(row: DocumentRow, workflowSteps: WorkflowStep[]): boolean {
    const userId = Auth.USER.id;
    const userTeamIds = Auth.USER.team_ids ?? [];
    
    // Role checks
    const isCreator = row.created_by === userId;
    const isOwner = row.owner_id === userId;
    const isReviewer = row.reviewer_id === userId;
    
    // Handle stakeholder_ids safely
    const stakeholderIds = Array.isArray(row.stakeholder_ids)
      ? row.stakeholder_ids
      : row.stakeholder_ids
      ? row.stakeholder_ids.split(",").map((id) => id.trim())
      : [];
    const isStakeholder = stakeholderIds.includes(userId);
    
    // Handle team_ids safely
    const rowTeamIds = Array.isArray(row.team_ids)
      ? row.team_ids
      : row.team_ids
      ? row.team_ids.split(",").map((id) => id.trim())
      : [];
    const isInTeam = userTeamIds.some((teamId: any) =>
      rowTeamIds.includes(teamId)
    );
    
    // Return true if ANY condition applies
    return isCreator || isOwner || isReviewer || isStakeholder || isInTeam;
  }

  /**
   * Filter controls by selected frameworks
   * @param frameworkIds - Array of selected framework IDs
   * @param frameworkList - Complete list of frameworks with controls
   * @param currentControlIds - Currently selected control IDs
   * @returns Object containing filtered controls and valid control IDs
   */
  filterControlsByFrameworksBase(
    frameworkIds: string[],
    frameworkList: Framework[],
    currentControlIds: string[] = []
  ): FilterControlsResult {
    try {
      // If no frameworks selected, return empty arrays
      if (!frameworkIds || frameworkIds.length === 0) {
        return {
          filteredControls: [],
          validControlIds: []
        };
      }

      // Filter frameworks based on selected IDs
      const selectedFrameworks = frameworkList.filter(framework =>
        frameworkIds.includes(framework.id)
      );

      // Extract all unique controls from selected frameworks
      const allControls: Control[] = [];
      
      selectedFrameworks.forEach(framework => {
        if (framework.control && Array.isArray(framework.control)) {
          framework.control.forEach(control => {
            // Only add if not already in the list (avoid duplicates)
            if (!allControls.some(existing => existing.id === control.id)) {
              allControls.push({
                id: control.id,
                short_name: control.short_name,
                framework_id: control.framework_id,
              });
            }
          });
        }
      });

      // Filter out controls that don't belong to selected frameworks
      const validControlIds = currentControlIds.filter(controlId =>
        allControls.some(control => control.id === controlId)
      );

      return {
        filteredControls: allControls,
        validControlIds: validControlIds
      };

    } catch (error) {
      console.error('Error filtering controls by frameworks:', error);
      return {
        filteredControls: [],
        validControlIds: []
      };
    }
  }

  // ==================== CLAUSE CONTEXT MENU METHODS ====================

  /**
   * Initialize context menu for adding clauses from selected text
   * @param addClauseCallback - Callback function to handle clause addition
   * @param isInEditableAreaCallback - Optional callback to check if target is in editable area
   * @returns Object with cleanup method
   */
  initializeClauseContextMenu(
    addClauseCallback: (selectedText: string) => void,
    isInEditableAreaCallback?: (target: EventTarget | null) => boolean
  ): ClauseContextMenuCleanup {
    const contextMenuData: ContextMenuData = {
      activeMenu: null,
      handleContextMenu: null,
      handleClick: null,
      handleMouseDown: null,
    };

    // Default check for editable area
    const defaultIsInEditableArea = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof HTMLElement)) return false;
      
      const ckEditorElement = target.closest('.ck-editor__editable');
      if (!ckEditorElement) return false;

      const contentEditor = ckEditorElement.closest('.clauses-container');
      const isContentOrNotes = ckEditorElement.closest('[class*="content"]') || 
                               ckEditorElement.closest('[class*="notes"]');
      
      return !!(contentEditor || isContentOrNotes);
    };

    const isInEditableArea = isInEditableAreaCallback || defaultIsInEditableArea;

    // Handle context menu event
    contextMenuData.handleContextMenu = (event: MouseEvent): void => {
      const selectedText = window.getSelection()?.toString().trim() || '';
      
      if (selectedText && isInEditableArea(event.target)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        this.showClauseContextMenu(event, selectedText, addClauseCallback, contextMenuData);
      }
    };

    // Handle click to hide menu
    contextMenuData.handleClick = (): void => {
      this.hideClauseContextMenu(contextMenuData);
    };

    // Handle mouse down to hide menu when clicking elsewhere
    contextMenuData.handleMouseDown = (event: MouseEvent): void => {
      if (contextMenuData.activeMenu && !contextMenuData.activeMenu.contains(event.target as Node)) {
        this.hideClauseContextMenu(contextMenuData);
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', contextMenuData.handleContextMenu as EventListener, true);
    document.addEventListener('click', contextMenuData.handleClick as EventListener);
    document.addEventListener('mousedown', contextMenuData.handleMouseDown as EventListener);

    // Also add listener to CKEditor elements after delay
    setTimeout(() => {
      const ckEditors = document.querySelectorAll('.ck-editor__editable');
      ckEditors.forEach(editor => {
        editor.addEventListener('contextmenu', contextMenuData.handleContextMenu as EventListener, true);
      });
    }, 1000);

    // Return cleanup function
    return {
      cleanup: () => this.removeClauseContextMenu(contextMenuData)
    };
  }

  /**
   * Show custom context menu for adding clauses
   * @param event - Mouse event
   * @param selectedText - Selected text to add
   * @param callback - Callback to handle clause addition
   * @param contextMenuData - Context menu data object
   */
  showClauseContextMenu(
    event: MouseEvent,
    selectedText: string,
    callback: (selectedText: string) => void,
    contextMenuData: ContextMenuData
  ): void {
    this.hideClauseContextMenu(contextMenuData);

    const contextMenu = document.createElement('div');
    contextMenu.id = 'clause-context-menu';
    contextMenu.className = 'custom-context-menu';
    
    // Adjust position to ensure it's visible on screen
    const x = event.clientX;
    const y = event.clientY;
    const menuWidth = 200;
    const menuHeight = 50;
    
    const adjustedX = (x + menuWidth > window.innerWidth) ? x - menuWidth : x;
    const adjustedY = (y + menuHeight > window.innerHeight) ? y - menuHeight : y;
    
    contextMenu.style.cssText = `
      position: fixed;
      top: ${adjustedY}px;
      left: ${adjustedX}px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 6px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      z-index: 999999;
      min-width: 200px;
      padding: 6px 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const menuItem = document.createElement('div');
    menuItem.className = 'context-menu-item';
    menuItem.innerHTML = `
      <i class="fas fa-plus-circle" style="margin-right: 10px; color: #17a2b8;"></i>
      <span>Add to Clauses</span>
    `;
    menuItem.style.cssText = `
      padding: 12px 16px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      transition: background-color 0.15s ease;
      color: #333;
    `;

    menuItem.addEventListener('mouseenter', () => {
      menuItem.style.backgroundColor = '#f0f7ff';
    });
    menuItem.addEventListener('mouseleave', () => {
      menuItem.style.backgroundColor = 'transparent';
    });

    menuItem.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      callback(selectedText);
      this.hideClauseContextMenu(contextMenuData);
    });

    contextMenu.appendChild(menuItem);
    document.body.appendChild(contextMenu);

    contextMenuData.activeMenu = contextMenu;
    
    // Prevent default context menu on our custom menu
    contextMenu.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  /**
   * Hide clause context menu
   * @param contextMenuData - Context menu data object
   */
  hideClauseContextMenu(contextMenuData: ContextMenuData): void {
    if (contextMenuData.activeMenu) {
      contextMenuData.activeMenu.remove();
      contextMenuData.activeMenu = null;
    }
  }

  /**
   * Remove clause context menu listeners
   * @param contextMenuData - Context menu data object
   */
  removeClauseContextMenu(contextMenuData: ContextMenuData): void {
    if (contextMenuData.handleContextMenu) {
      document.removeEventListener('contextmenu', contextMenuData.handleContextMenu as EventListener, true);
    }
    if (contextMenuData.handleClick) {
      document.removeEventListener('click', contextMenuData.handleClick as EventListener);
    }
    if (contextMenuData.handleMouseDown) {
      document.removeEventListener('mousedown', contextMenuData.handleMouseDown as EventListener);
    }
    
    // Remove from CKEditor elements
    const ckEditors = document.querySelectorAll('.ck-editor__editable');
    ckEditors.forEach(editor => {
      if (contextMenuData.handleContextMenu) {
        editor.removeEventListener('contextmenu', contextMenuData.handleContextMenu as EventListener, true);
      }
    });
    
    this.hideClauseContextMenu(contextMenuData);
  }

  /**
   * Add selected text to clauses array
   * @param selectedText - Text to add to clauses
   * @param clausesArray - Current clauses array
   * @returns Object with updated clauses array and target index
   */
  addTextToClausesArray(
    selectedText: string,
    clausesArray: string[] = []
  ): AddTextToClausesResult {
    if (!clausesArray || !Array.isArray(clausesArray)) {
      clausesArray = [''];
    }

    // Find empty clause
    const emptyClauseIndex = clausesArray.findIndex((clause) => !clause || clause.trim() === '');
    
    if (emptyClauseIndex !== -1) {
      clausesArray[emptyClauseIndex] = selectedText;
      return {
        clauses: clausesArray,
        targetIndex: emptyClauseIndex
      };
    } else {
      clausesArray.push(selectedText);
      return {
        clauses: clausesArray,
        targetIndex: clausesArray.length - 1
      };
    }
  }

  /**
   * Focus on specific clause editor
   * @param clauseEditors - Array of clause editor refs
   * @param index - Index of editor to focus
   */
  focusClauseEditor(clauseEditors: any[], index: number): void {
    try {
      if (clauseEditors && clauseEditors[index]) {
        const editor = clauseEditors[index].instance;
        if (editor && editor.editing && editor.editing.view) {
          editor.editing.view.focus();
        }
      }
    } catch (error) {
      console.log('Could not focus clause editor:', error);
    }
  }

  // ==================== END CLAUSE CONTEXT MENU METHODS ====================
}