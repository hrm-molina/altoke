"use client";

import { useEffect, useRef } from "react";

interface ModalStackItem {
  id: string;
  close: () => void;
}

const modalStack: ModalStackItem[] = [];
let isListening = false;
let isProgrammaticBack = false;

function initGlobalPopstateListener() {
  if (isListening || typeof window === "undefined") return;
  isListening = true;

  window.addEventListener("popstate", () => {
    // If popstate was triggered by our own programmatic window.history.back(), ignore it
    if (isProgrammaticBack) {
      isProgrammaticBack = false;
      return;
    }

    // Otherwise, it was triggered by user pressing phone/browser Back button
    if (modalStack.length > 0) {
      const topModal = modalStack.pop();
      if (topModal) {
        topModal.close();
      }
    }
  });
}

/**
 * Hook to allow mobile hardware/browser "Back" button to close modals
 * instead of navigating away to previous pages (like home page).
 */
export function useModalBackHandler(
  isOpen: boolean,
  onClose: () => void,
  modalId: string = "modal"
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const instanceIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

    initGlobalPopstateListener();

    const instanceId = `${modalId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    instanceIdRef.current = instanceId;

    // Push dummy history entry for this modal
    window.history.pushState({ altokeModal: instanceId }, "");

    modalStack.push({
      id: instanceId,
      close: () => {
        onCloseRef.current();
      },
    });

    return () => {
      // Find if this modal is still on the stack (closed via UI X button or background click)
      const idx = modalStack.findIndex((m) => m.id === instanceId);
      if (idx !== -1) {
        modalStack.splice(idx, 1);
        // Pop the dummy history entry so back button stack stays clean
        isProgrammaticBack = true;
        window.history.back();
      }
    };
  }, [isOpen, modalId]);
}
