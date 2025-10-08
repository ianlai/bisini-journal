// make this file a module so `declare global` works properly
export {};

declare global {
  interface HTMLInputElement {
    // some browsers implement it, some don't
    showPicker?: () => void;
  }
}