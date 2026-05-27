"use client";

import { useState, useCallback } from "react";

type ToastVariant = "default" | "destructive";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

let toastState: ToastState = { toasts: [] };
let listeners: Array<(state: ToastState) => void> = [];

function emit(state: ToastState) {
  toastState = state;
  listeners.forEach((l) => l(state));
}

export function toast({ title, description, variant = "default", duration = 4000 }: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2);
  emit({ toasts: [...toastState.toasts, { id, title, description, variant }] });
  setTimeout(() => {
    emit({ toasts: toastState.toasts.filter((t) => t.id !== id) });
  }, duration);
}

export function useToast() {
  const [state, setState] = useState<ToastState>(toastState);

  const subscribe = useCallback(() => {
    listeners.push(setState);
    return () => {
      listeners = listeners.filter((l) => l !== setState);
    };
  }, []);

  useState(subscribe);

  return { toasts: state.toasts, toast };
}
