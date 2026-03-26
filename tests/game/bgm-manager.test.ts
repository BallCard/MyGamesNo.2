import { beforeEach, describe, expect, test, vi } from "vitest";

import { createBgmManager } from "../../src/lib/bgmManager";

type AudioMock = {
  loop: boolean;
  preload: string;
  volume: number;
  src: string;
  currentTime: number;
  paused: boolean;
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
};

function installAudioMock() {
  const audios: AudioMock[] = [];
  class MockAudio {
    loop = false;
    preload = "";
    volume = 1;
    src = "";
    currentTime = 0;
    paused = true;
    play = vi.fn(() => {
      this.paused = false;
      return Promise.resolve();
    });
    pause = vi.fn(() => {
      this.paused = true;
    });

    constructor() {
      audios.push(this as unknown as AudioMock);
    }
  }

  vi.stubGlobal("Audio", MockAudio as unknown as typeof Audio);
  return audios;
}

describe("createBgmManager", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  test("starts a round with a selected track after unlock", () => {
    const audios = installAudioMock();
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.1);
    const manager = createBgmManager({ playlist: ["/a.mp3", "/b.mp3"], documentRef: document, enabled: true });

    manager.unlock();
    manager.startRound();

    expect(audios).toHaveLength(1);
    expect(audios[0].src).toContain("/a.mp3");
    expect(audios[0].play).toHaveBeenCalledTimes(1);
    expect(audios[0].loop).toBe(true);

    randomSpy.mockRestore();
    manager.dispose();
  });

  test("disabling music pauses and re-enabling resumes when visible", () => {
    const audios = installAudioMock();
    const manager = createBgmManager({ playlist: ["/a.mp3"], documentRef: document, enabled: true });

    manager.unlock();
    manager.startRound();
    manager.setEnabled(false);
    manager.setEnabled(true);

    expect(audios[0].pause).toHaveBeenCalledTimes(1);
    expect(audios[0].play).toHaveBeenCalledTimes(2);

    manager.dispose();
  });

  test("visibility changes pause and resume active playback", () => {
    const audios = installAudioMock();
    const manager = createBgmManager({ playlist: ["/a.mp3"], documentRef: document, enabled: true });

    manager.unlock();
    manager.startRound();

    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));

    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => false,
    });
    document.dispatchEvent(new Event("visibilitychange"));

    expect(audios[0].pause).toHaveBeenCalledTimes(1);
    expect(audios[0].play).toHaveBeenCalledTimes(2);

    manager.dispose();
  });
});
