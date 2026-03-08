import type { KeyboardEvent } from "react";

type FormFieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const NATIVE_ARROW_INPUT_TYPES = new Set([
  "date",
  "datetime-local",
  "month",
  "number",
  "range",
  "time",
  "week",
]);

const TEXT_LIKE_INPUT_TYPES = new Set([
  "email",
  "password",
  "search",
  "tel",
  "text",
  "url",
]);

function getDirection(key: string): -1 | 1 | null {
  if (key === "ArrowUp" || key === "ArrowLeft") return -1;
  if (key === "ArrowDown" || key === "ArrowRight") return 1;
  return null;
}

function isFormField(element: Element): element is FormFieldElement {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  );
}

function isFocusableField(field: FormFieldElement): boolean {
  if (field.disabled || field.tabIndex === -1) return false;

  if (field instanceof HTMLInputElement) {
    const type = field.type.toLowerCase();
    if (type === "hidden") return false;
  }

  return true;
}

function isCaretAtBoundary(field: HTMLInputElement, key: "ArrowLeft" | "ArrowRight"): boolean {
  const selectionStart = field.selectionStart;
  const selectionEnd = field.selectionEnd;

  if (selectionStart === null || selectionEnd === null) {
    return true;
  }

  if (key === "ArrowLeft") {
    return selectionStart === 0 && selectionEnd === 0;
  }

  const length = field.value.length;
  return selectionStart === length && selectionEnd === length;
}

function shouldNavigate(key: string, field: FormFieldElement): boolean {
  if (field instanceof HTMLTextAreaElement) {
    return false;
  }

  if (field instanceof HTMLSelectElement) {
    return key === "ArrowLeft" || key === "ArrowRight";
  }

  const type = field.type.toLowerCase();

  if (type === "radio") return false;
  if (NATIVE_ARROW_INPUT_TYPES.has(type)) return false;

  if (field.hasAttribute("list") && (key === "ArrowUp" || key === "ArrowDown")) {
    return false;
  }

  if ((key === "ArrowLeft" || key === "ArrowRight") && TEXT_LIKE_INPUT_TYPES.has(type)) {
    return isCaretAtBoundary(field, key);
  }

  return true;
}

export function handleFormArrowNavigation(event: KeyboardEvent<HTMLElement>) {
  const direction = getDirection(event.key);
  if (!direction) return;
  if (event.defaultPrevented) return;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

  const target = event.target;
  if (!(target instanceof Element)) return;
  if (!isFormField(target)) return;

  const form = target.closest("form");
  if (!form) return;
  if (!shouldNavigate(event.key, target)) return;

  const fields = Array.from(form.querySelectorAll("input, select, textarea")).filter(
    (field): field is FormFieldElement => isFormField(field) && isFocusableField(field)
  );

  const currentIndex = fields.indexOf(target);
  if (currentIndex < 0) return;

  const nextIndex = currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= fields.length) return;

  event.preventDefault();
  fields[nextIndex].focus();
}
