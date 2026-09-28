"use client";

import { useActionState, useEffect, useRef } from "react";

type FormState = { error?: string; success?: string };

function snapshot(form: HTMLFormElement): string {
  return JSON.stringify(Array.from(new FormData(form), ([key, value]) => [
    key,
    typeof value === "string" ? value : value.name ? [value.name, value.size, value.lastModified] : null,
  ]).filter(([key]) => !(key as string).startsWith("$ACTION_")));
}

// Each form owns its saved baseline, so saving one section cannot clear
// unsaved changes in another section.
export function useProfileForm(action: (state: FormState, data: FormData) => Promise<FormState>) {
  const ref = useRef<HTMLFormElement>(null);
  const baseline = useRef<string | null>(null);
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    const form = ref.current;
    if (!form) return;
    form.dataset.pending = String(pending);
    if (baseline.current === null || (state.success && !pending)) {
      baseline.current = snapshot(form);
      delete form.dataset.unsaved;
    }
  }, [state, pending]);

  function onChange() {
    const form = ref.current;
    if (form) form.dataset.unsaved = String(snapshot(form) !== baseline.current);
  }

  return { ref, state, formAction, pending, onChange };
}
