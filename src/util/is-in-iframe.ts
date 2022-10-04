export const isInIframe = () => {
  if (!document || !window) {
    throw new Error("isInIframe should be called only in browser");
  }

  try {
    return document.location !== window.parent.location;
  } catch (e) {
    return false;
  }
};
