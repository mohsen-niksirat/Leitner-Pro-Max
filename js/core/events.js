export function on(target, event, handler, options) {
  target.addEventListener(event, handler, options);
  return () => target.removeEventListener(event, handler, options);
}

export function emit(name, detail) {
  window.dispatchEvent(new CustomEvent(name, {detail}));
}
