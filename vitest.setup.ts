import '@testing-library/jest-dom/vitest';

// jsdom não implementa ResizeObserver (confirmado na versão usada aqui) —
// sem isso, qualquer componente que o use (ServiceSongUnitView.tsx,
// BlockEditor/BlockShell.tsx) quebra ao montar em teste. Stub mínimo: não
// precisa disparar o callback, só não lançar.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverStub,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
