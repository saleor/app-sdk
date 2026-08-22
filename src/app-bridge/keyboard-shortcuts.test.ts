import { fireEvent } from "@testing-library/dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppBridge } from "./app-bridge";
import type { DashboardShortcut } from "./events";
import {
  createShortcutForwarder,
  matchDashboardShortcut,
  parseDashboardShortcuts,
} from "./keyboard-shortcuts";

const commandPalette: DashboardShortcut = {
  id: "commandPalette.open",
  key: "k",
  metaKey: true,
};

const keyEvent = (
  init: Pick<KeyboardEvent, "key"> &
    Partial<Pick<KeyboardEvent, "metaKey" | "ctrlKey" | "altKey" | "shiftKey">>,
) => ({
  key: init.key,
  metaKey: init.metaKey ?? false,
  ctrlKey: init.ctrlKey ?? false,
  altKey: init.altKey ?? false,
  shiftKey: init.shiftKey ?? false,
});

describe("matchDashboardShortcut", () => {
  it.each([
    {
      label: "Cmd+K",
      event: keyEvent({ key: "k", metaKey: true }),
      shortcuts: [commandPalette],
      expectedId: "commandPalette.open",
    },
    {
      label: "case-insensitive key",
      event: keyEvent({ key: "K", metaKey: true }),
      shortcuts: [commandPalette],
      expectedId: "commandPalette.open",
    },
    {
      label: "Ctrl+B",
      event: keyEvent({ key: "b", ctrlKey: true }),
      shortcuts: [{ id: "sidebar.toggle", key: "b", ctrlKey: true }],
      expectedId: "sidebar.toggle",
    },
  ])("matches $label", ({ event, shortcuts, expectedId }) => {
    expect(matchDashboardShortcut(event, shortcuts)?.id).toBe(expectedId);
  });

  it.each([
    {
      label: "plain k without meta",
      event: keyEvent({ key: "k" }),
    },
    {
      label: "Cmd+Shift+K when only Cmd+K is registered",
      event: keyEvent({ key: "k", metaKey: true, shiftKey: true }),
    },
    {
      label: "Ctrl+K when Cmd+K is registered",
      event: keyEvent({ key: "k", ctrlKey: true }),
    },
    {
      label: "unrelated key",
      event: keyEvent({ key: "j", metaKey: true }),
    },
  ])("does not match $label", ({ event }) => {
    expect(matchDashboardShortcut(event, [commandPalette])).toBeUndefined();
  });

  it("returns undefined for an empty registry", () => {
    expect(matchDashboardShortcut(keyEvent({ key: "k", metaKey: true }), [])).toBeUndefined();
  });
});

describe("parseDashboardShortcuts", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps well-formed shortcuts", () => {
    expect(parseDashboardShortcuts([commandPalette])).toEqual([commandPalette]);
  });

  it.each([
    { label: "undefined", value: undefined },
    { label: "null", value: null },
    { label: "an object", value: { commandPalette } },
    { label: "a string", value: "commandPalette.open" },
  ])("returns an empty list when the payload is $label", ({ value }) => {
    expect(parseDashboardShortcuts(value)).toEqual([]);
  });

  it.each([
    { label: "missing id", value: { key: "k", metaKey: true } },
    { label: "empty id", value: { id: "", key: "k" } },
    { label: "missing key", value: { id: "commandPalette.open", metaKey: true } },
    { label: "empty key", value: { id: "commandPalette.open", key: "" } },
    { label: "non-string key", value: { id: "commandPalette.open", key: 75 } },
    { label: "null entry", value: null },
  ])("drops an entry with $label", ({ value }) => {
    expect(parseDashboardShortcuts([commandPalette, value])).toEqual([commandPalette]);
  });
});

describe("createShortcutForwarder", () => {
  let dispatchSpy: ReturnType<typeof vi.fn>;
  let getStateSpy: ReturnType<typeof vi.fn>;
  let appBridge: AppBridge;
  let stop: () => void;

  beforeEach(() => {
    dispatchSpy = vi.fn().mockResolvedValue(undefined);
    getStateSpy = vi.fn().mockReturnValue({ dashboardShortcuts: [] });
    appBridge = {
      dispatch: dispatchSpy,
      getState: getStateSpy,
    } as unknown as AppBridge;
    stop = createShortcutForwarder(appBridge);
  });

  afterEach(() => {
    stop();
    vi.restoreAllMocks();
  });

  it("does not dispatch when the registry is empty", () => {
    fireEvent.keyDown(window, { key: "k", metaKey: true });

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it("dispatches TriggerShortcut for a registered chord and prevents default", () => {
    getStateSpy.mockReturnValue({ dashboardShortcuts: [commandPalette] });

    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "triggerShortcut",
        payload: expect.objectContaining({
          shortcutId: "commandPalette.open",
          key: "k",
          metaKey: true,
          ctrlKey: false,
          altKey: false,
          shiftKey: false,
        }),
      }),
    );
  });

  it("skips repeat keydowns", () => {
    getStateSpy.mockReturnValue({ dashboardShortcuts: [commandPalette] });

    fireEvent.keyDown(window, { key: "k", metaKey: true, repeat: true });

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it("skips composing keydowns", () => {
    getStateSpy.mockReturnValue({ dashboardShortcuts: [commandPalette] });

    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, "isComposing", { value: true });

    window.dispatchEvent(event);

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it("skips IME keyCode 229", () => {
    getStateSpy.mockReturnValue({ dashboardShortcuts: [commandPalette] });

    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, "keyCode", { value: 229 });

    window.dispatchEvent(event);

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it("does not forward when shouldForward returns false", () => {
    stop();
    stop = createShortcutForwarder(appBridge, { shouldForward: () => false });
    getStateSpy.mockReturnValue({ dashboardShortcuts: [commandPalette] });

    fireEvent.keyDown(window, { key: "k", metaKey: true });

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it("warns when dispatch rejects", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = new Error("timeout");
    dispatchSpy.mockRejectedValue(error);
    getStateSpy.mockReturnValue({ dashboardShortcuts: [commandPalette] });

    fireEvent.keyDown(window, { key: "k", metaKey: true });

    await vi.waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith("TriggerShortcut dispatch failed:", error);
    });
  });

  it("tolerates state without a registry", () => {
    getStateSpy.mockReturnValue({});

    expect(() => fireEvent.keyDown(window, { key: "k", metaKey: true })).not.toThrow();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it("reads the registry at keypress time", () => {
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(dispatchSpy).not.toHaveBeenCalled();

    getStateSpy.mockReturnValue({ dashboardShortcuts: [commandPalette] });

    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(dispatchSpy).toHaveBeenCalledOnce();
  });
});
