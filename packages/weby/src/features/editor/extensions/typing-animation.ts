import { Extension } from "@tiptap/core";

export const TypingAnimation = Extension.create({
  addOptions() {
    return {
      duration: 280,
    };
  },

  addStorage() {
    return {
      timeout: null as ReturnType<typeof setTimeout> | null,
    };
  },

  name: "typingAnimation",

  onDestroy() {
    if (this.storage.timeout) {
      clearTimeout(this.storage.timeout);
    }
    this.editor.view.dom.classList.remove("is-typing");
  },

  onTransaction({ transaction }) {
    if (!transaction.docChanged || !this.editor.isFocused) {
      return;
    }

    if (transaction.getMeta("addToHistory") === false) {
      return;
    }

    const { view } = this.editor;
    const { duration } = this.options;

    view.dom.classList.add("is-typing");

    if (this.storage.timeout) {
      clearTimeout(this.storage.timeout);
    }

    this.storage.timeout = setTimeout(() => {
      view.dom.classList.remove("is-typing");
    }, duration);
  },
});
