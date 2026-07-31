/**
 * Encodes/decodes the arbitrary JSON payload passed alongside the `openPopup`
 * App Bridge action.
 *
 * When a WIDGET dispatches `actions.OpenPopup({ extensionIdentifier, params })`,
 * the Dashboard serializes `params` with this class and appends it to the popup
 * iframe URL under {@link OpenPopupParams.urlKey}. The opened app reads it back
 * with the same class - this is why both sides share a single implementation.
 *
 * The payload is JSON-stringified, encoded as UTF-8 and stored as base64, so it
 * survives the trip through the URL regardless of the characters it contains.
 *
 * All members are static - the class is a namespace, it's never instantiated.
 */
export class OpenPopupParams {
  /**
   * Name of the URL search param the serialized payload is stored under.
   */
  static urlKey = "appParams";

  /**
   * Upper bound on the serialized JSON payload length (chars). Keeps the
   * resulting iframe `src` well under the ~8 KB browser URL ceiling, leaving
   * room for the Dashboard context params (saleorApiUrl, theme, mount ids, ...).
   */
  static maxParamsLength = 2048;

  /**
   * Serializes a JSON-serializable value into a base64 string ready to be put
   * in the popup URL. Throws if the serialized JSON exceeds
   * {@link OpenPopupParams.maxParamsLength}.
   */
  static serialize(json: unknown): string {
    const stringified = JSON.stringify(json);

    if (stringified.length > OpenPopupParams.maxParamsLength) {
      throw new Error(
        `OpenPopup params too large: ${stringified.length} chars (max ${OpenPopupParams.maxParamsLength})`,
      );
    }

    const bytes = new TextEncoder().encode(stringified);

    let binary = "";

    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    return btoa(binary);
  }

  /**
   * Parses a base64 string produced by {@link serialize} back into the original
   * value. Throws if the input is not valid base64 / JSON.
   */
  static parse(value: string): unknown {
    const binary = atob(value);

    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

    const stringified = new TextDecoder().decode(bytes);

    return JSON.parse(stringified);
  }
}
