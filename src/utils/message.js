import { createApp, h } from "vue";
import MessageDialog from "../components/MessageDialog.vue";

let messageQueue = [];
let currentMessage = null;

function createMessage(options) {
  return new Promise((resolve) => {
    const messageInstance = {
      ...options,
      visible: true,
      closeOnClickOverlay: true,
      onClose: () => {
        resolve();
        removeMessage(messageInstance);
      },
    };

    addMessage(messageInstance);
  });
}

function addMessage(messageInstance) {
  messageQueue.push(messageInstance);
  if (!currentMessage) {
    showNextMessage();
  }
}

function removeMessage(messageInstance) {
  messageQueue = messageQueue.filter((item) => item !== messageInstance);
  if (messageInstance === currentMessage) {
    currentMessage = null;
    if (messageInstance.container && messageInstance.app) {
      messageInstance.app.unmount();
      document.body.removeChild(messageInstance.container);
      messageInstance.container = null;
      messageInstance.app = null;
    }
    showNextMessage();
  }
}

function showNextMessage() {
  if (messageQueue.length === 0) return;

  const messageInstance = messageQueue[0];
  currentMessage = messageInstance;

  const container = document.createElement("div");
  messageInstance.container = container;
  document.body.appendChild(container);

  const { container: _, app: __, ...messageProps } = messageInstance;

  const app = createApp({
    render() {
      return h(MessageDialog, {
        ...messageProps,
        "onUpdate:visible": (val) => {
          messageInstance.visible = val;
          if (!val) {
            messageInstance.onClose();
          }
        },
      });
    },
  });

  messageInstance.app = app;
  app.mount(container);
}

export const message = {
  success(message) {
    return createMessage({ type: "success", message });
  },
  warning(message) {
    return createMessage({ type: "warning", message });
  },
  alert(message) {
    return createMessage({ type: "alert", message });
  },
  error(message) {
    return createMessage({ type: "error", message });
  },
};
