export type AlertType =
  | "PRICE_ABOVE"
  | "PRICE_BELOW"
  | "RSI_ABOVE"
  | "RSI_BELOW"
  | "MACD_CROSSOVER_BULLISH"
  | "MACD_CROSSOVER_BEARISH"
  | "PRICE_PCT_CHANGE_24H";

export interface AlertRead {
  id: string;
  user_id: string;
  symbol: string;
  alert_type: AlertType;
  threshold: string;
  label: string | null;
  is_active: boolean;
  notify_via_ws: boolean;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlertCreate {
  symbol: string;
  alert_type: AlertType;
  threshold: string;
  label?: string;
  notify_via_ws?: boolean;
}

export interface AlertUpdate {
  label?: string;
  threshold?: string;
  is_active?: boolean;
  notify_via_ws?: boolean;
}

export interface AlertTriggerLogRead {
  id: string;
  alert_id: string;
  symbol: string;
  triggered_at: string;
  trigger_value: string | null;
  message: string | null;
}

export interface AlertTriggeredEvent {
  event: "alert_triggered";
  alert_id: string;
  symbol: string;
  alert_type: AlertType;
  threshold: string;
  trigger_value: string;
  message: string;
  triggered_at: string;
}
