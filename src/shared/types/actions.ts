export type RiskLevel = 'safe' | 'moderate' | 'dangerous';

export interface BrowserAction {
  type: ActionType;
  params: Record<string, unknown>;
  riskLevel: RiskLevel;
  description: string;
}

export type ActionType =
  | 'navigate'
  | 'click'
  | 'type_text'
  | 'scroll_page'
  | 'take_screenshot'
  | 'get_page_content'
  | 'extract_data'
  | 'select_option'
  | 'wait_for_element'
  | 'manage_tabs';

export interface ActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  screenshot?: string;
}

export const ACTION_RISK: Record<ActionType, RiskLevel> = {
  navigate: 'moderate',
  click: 'moderate',
  type_text: 'moderate',
  scroll_page: 'safe',
  take_screenshot: 'safe',
  get_page_content: 'safe',
  extract_data: 'safe',
  select_option: 'moderate',
  wait_for_element: 'safe',
  manage_tabs: 'moderate',
};
