import "./styles.css";

import { createHudBridge, type HudBridge } from "./game/hud/bridge";
import { mountGameHud } from "./game/hud/domHud";
import { getCatDefinition, getCatRadius } from "./game/config/cats";
import { buildShareCardModel } from "./game/share/shareCardPolicy";
import { resolveShareCardAssets } from "./game/share/shareCardAssets";
import { renderShareCardSurface } from "./game/share/shareCardPreview";

type CreateGameImpl = (target: HTMLElement, bridge?: HudBridge) => unknown;
type ModalType = "nickname" | "settings" | "leaderboard" | null;
type LeaderboardTab = "allTime" | "weekly";

type AppOptions = {
  startGame?: boolean;
  createGameImpl?: CreateGameImpl;
};

type AppSettings = {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  vibrationEnabled: boolean;
};

type LeaderboardEntry = {
  rank: number;
  nickname: string;
  score: number;
  highestLevel: number;
};

type ShareLabScenario = {
  title: string;
  score: number;
  peakLevel: number;
};


type ShareLabVariant = {
  id: string;
  title: string;
  subtitle: string;
  surfaceClassName: string;
};

const SHARE_LAB_VARIANTS: ShareLabVariant[] = [
  {
    id: "sticker",
    title: "Sticker Poster",
    subtitle: "Overlaps, shadows, cutout energy.",
    surfaceClassName: "share-card--sticker",
  },
  {
    id: "editorial",
    title: "Editorial Poster",
    subtitle: "Sharper hierarchy and cleaner space.",
    surfaceClassName: "share-card--editorial",
  },
  {
    id: "arcade",
    title: "Arcade Heat",
    subtitle: "Hotter glow, bolder score drama.",
    surfaceClassName: "share-card--arcade",
  },
];
const SHARE_LAB_BAND_SCENARIOS: ShareLabScenario[] = [
  { title: "Below 100K", score: 68000, peakLevel: 8 },
  { title: "100K+", score: 138000, peakLevel: 12 },
];

const SHARE_LAB_CAT_SCENARIOS: ShareLabScenario[] = Array.from({ length: 12 }, (_, index) => ({
  title: `Cat ${index + 1}`,
  score: 68000,
  peakLevel: index + 1,
}));

const LATE_LAB_LEVELS = [13, 14, 15, 16, 17, 18] as const;

type AppState = {
  nickname: string;
  settings: AppSettings;
  modal: ModalType;
  leaderboardTab: LeaderboardTab;
};
const NICKNAME_KEY = "zju-cat-merge:nickname";
const SETTINGS_KEY = "zju-cat-merge:settings";
const DEFAULT_NICKNAME = "\u533f\u540d\u540c\u5b66";
const DEFAULT_SETTINGS: AppSettings = {
  musicEnabled: true,
  sfxEnabled: true,
  vibrationEnabled: true,
};

const LEADERBOARDS: Record<LeaderboardTab, LeaderboardEntry[]> = {
  allTime: [
    { rank: 1, nickname: "\u8004\u800b\u732b\u7687", score: 12880, highestLevel: 11 },
    { rank: 2, nickname: "DDL \u5e78\u5b58\u8005", score: 11240, highestLevel: 10 },
    { rank: 3, nickname: "\u7389\u6cc9\u732b\u8584\u8377", score: 9860, highestLevel: 10 },
    { rank: 4, nickname: "\u897f\u6eaa\u56e2\u5b50", score: 8450, highestLevel: 9 },
    { rank: 5, nickname: "\u7d2b\u91d1\u6e2f\u8e72\u5b88", score: 7920, highestLevel: 9 },
  ],
  weekly: [
    { rank: 1, nickname: "\u4eca\u5929\u4e5f\u665a\u8bfe", score: 6680, highestLevel: 8 },
    { rank: 2, nickname: "\u6885\u56ed\u51b2\u5206", score: 6410, highestLevel: 8 },
    { rank: 3, nickname: "\u56fe\u4e66\u9986\u6478\u9c7c", score: 6180, highestLevel: 8 },
    { rank: 4, nickname: "\u8004\u800b\u4ee3\u6253", score: 5870, highestLevel: 7 },
    { rank: 5, nickname: "\u518d\u6765\u4e00\u628a", score: 5520, highestLevel: 7 },
  ],
};

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }
    return window.localStorage;
  } catch {
    return null;
  }
}

function readNickname(): string {
  const storage = getStorage();
  return storage?.getItem(NICKNAME_KEY)?.trim() || DEFAULT_NICKNAME;
}

function writeNickname(nickname: string): void {
  getStorage()?.setItem(NICKNAME_KEY, nickname);
}

function readSettings(): AppSettings {
  const raw = getStorage()?.getItem(SETTINGS_KEY);
  if (!raw) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function writeSettings(settings: AppSettings): void {
  getStorage()?.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function setScrollLock(locked: boolean): void {
  document.documentElement.classList.toggle("app-locked", locked);
  document.body.classList.toggle("app-locked", locked);
}

function formatScore(score: number): string {
  return score.toLocaleString("zh-CN");
}

function renderLeaderboardRows(tab: LeaderboardTab, nickname: string): string {
  return LEADERBOARDS[tab]
    .map((entry) => {
      const isSelf = entry.nickname === nickname;
      return `
        <div class="leaderboard-row${isSelf ? " is-self" : ""}">
          <span class="leaderboard-rank">#${entry.rank}</span>
          <span class="leaderboard-name">${entry.nickname}</span>
          <span class="leaderboard-meta">Lv.${entry.highestLevel}</span>
          <strong class="leaderboard-score">${formatScore(entry.score)}</strong>
        </div>
      `;
    })
    .join("");
}

function renderLeaderboardPreview(state: AppState): string {
  return `
    <section class="leaderboard-preview" aria-label="leaderboard-preview">
      <div class="section-heading">
        <div>
          <strong>\u6eda\u52a8\u6392\u884c\u699c</strong>
          <p>\u9996\u9875\u4e0b\u65b9\u76f4\u63a5\u770b\u9ad8\u5206\uff0c\u70b9\u8fdb\u53bb\u518d\u770b\u5b8c\u6574\u699c\u5355</p>
        </div>
        <div class="preview-tabs">
          <span class="preview-tab is-active">\u603b\u699c</span>
          <span class="preview-tab">\u5468\u699c</span>
        </div>
      </div>
      <div class="leaderboard-scroll">
        ${renderLeaderboardRows("allTime", state.nickname)}
        ${renderLeaderboardRows("weekly", state.nickname)}
      </div>
    </section>
  `;
}

function renderModal(state: AppState): string {
  if (state.modal === "nickname") {
    return `
      <div class="modal-backdrop" data-action="close-modal">
        <section class="modal-card" aria-label="nickname-modal" onclick="event.stopPropagation()">
          <header class="modal-header">
            <strong>\u6539\u6635\u79f0</strong>
            <button class="icon-button" type="button" data-action="close-modal">\u5173\u95ed</button>
          </header>
          <label class="field-stack">
            <span>\u5c55\u793a\u6635\u79f0</span>
            <input class="text-input" name="nickname" maxlength="12" value="${state.nickname}" placeholder="\u8f93\u5165\u4f60\u7684\u732b\u732b\u540d" />
          </label>
          <div class="modal-actions">
            <button class="secondary-button" type="button" data-action="close-modal">\u53d6\u6d88</button>
            <button class="primary-button" type="button" data-action="save-nickname">\u4fdd\u5b58</button>
          </div>
        </section>
      </div>
    `;
  }

  if (state.modal === "settings") {
    return `
      <div class="modal-backdrop" data-action="close-settings">
        <section class="modal-card" aria-label="settings-modal" onclick="event.stopPropagation()">
          <header class="modal-header">
            <strong>\u8bbe\u7f6e</strong>
            <button class="icon-button" type="button" data-action="close-settings">\u5173\u95ed</button>
          </header>
          <label class="toggle-row">
            <span>\u80cc\u666f\u97f3\u4e50</span>
            <input type="checkbox" name="musicEnabled" ${state.settings.musicEnabled ? "checked" : ""} />
          </label>
          <label class="toggle-row">
            <span>\u97f3\u6548\u53cd\u9988</span>
            <input type="checkbox" name="sfxEnabled" ${state.settings.sfxEnabled ? "checked" : ""} />
          </label>
          <label class="toggle-row">
            <span>\u9707\u52a8\u53cd\u9988</span>
            <input type="checkbox" name="vibrationEnabled" ${state.settings.vibrationEnabled ? "checked" : ""} />
          </label>
          <div class="modal-actions">
            <button class="primary-button" type="button" data-action="close-settings">\u5b8c\u6210</button>
          </div>
        </section>
      </div>
    `;
  }

  if (state.modal === "leaderboard") {
    const activeTab = state.leaderboardTab;
    return `
      <div class="modal-backdrop" data-action="close-modal">
        <section class="modal-card modal-card-wide" aria-label="leaderboard-modal" onclick="event.stopPropagation()">
          <header class="modal-header">
            <strong>\u6392\u884c\u699c</strong>
            <button class="icon-button" type="button" data-action="close-modal">\u5173\u95ed</button>
          </header>
          <div class="leaderboard-tabs">
            <button class="secondary-button ${activeTab === "allTime" ? "is-active" : ""}" type="button" data-tab="allTime">\u603b\u699c</button>
            <button class="secondary-button ${activeTab === "weekly" ? "is-active" : ""}" type="button" data-tab="weekly">\u5468\u699c</button>
          </div>
          <div class="leaderboard-panel">
            ${renderLeaderboardRows(activeTab, state.nickname)}
          </div>
        </section>
      </div>
    `;
  }

  return "";
}


function shouldOpenShareLab(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("shareLab") === "1";
}

function shouldOpenLateLab(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("lateLab") === "1";
}

function renderShareLabCard(scenario: ShareLabScenario, surfaceClassName = ""): string {
  return `
    <section class="share-lab-card-shell">
      <div class="share-lab-card-header">
        <strong>${scenario.title}</strong>
        <span>${scenario.score.toLocaleString("zh-CN")} �� Lv.${scenario.peakLevel}</span>
      </div>
      ${renderShareCardSurface({
        model: buildShareCardModel({ score: scenario.score, peakLevel: scenario.peakLevel, isNewBest: false }),
        score: scenario.score,
        peakLevel: scenario.peakLevel,
        isNewBest: false,
        assets: resolveShareCardAssets(scenario.peakLevel),
        surfaceClassName,
      })}
    </section>
  `;
}

function renderShareLabVariant(variant: ShareLabVariant): string {
  return `
    <section class="share-lab-variant" aria-label="share-lab-variant-${variant.id}">
      <div class="share-lab-variant-header">
        <strong>${variant.title}</strong>
        <span>${variant.subtitle}</span>
      </div>
      <div class="share-lab-variant-grid">
        ${SHARE_LAB_BAND_SCENARIOS.map((scenario) => renderShareLabCard(scenario, variant.surfaceClassName)).join("")}
      </div>
    </section>
  `;
}

function renderLateLabLevelCard(level: number): string {
  const definition = getCatDefinition(level);
  const radius = getCatRadius(level);

  return `
    <section class="late-lab-level-card">
      <div class="late-lab-level-top">
        <strong>Lv.${level}</strong>
        <span>r ${radius}px</span>
      </div>
      <div class="late-lab-ball-wrap">
        <div class="late-lab-ball" style="width:${radius * 2}px;height:${radius * 2}px;">
          <img src="/assets/cats/${definition?.assetKey ?? "cat-12-v3"}.png" alt="Level ${level}" />
        </div>
      </div>
      <div class="late-lab-meta">
        <span>asset</span>
        <strong>${definition?.assetKey ?? "missing"}</strong>
      </div>
    </section>
  `;
}

function renderLateLabCrowding(): string {
  const nodes = [13, 14, 15, 16, 17, 18]
    .map((level, index) => {
      const definition = getCatDefinition(level);
      const radius = getCatRadius(level);
      const size = radius * 2;
      const left = [8, 40, 63, 14, 52, 27][index];
      const top = [58, 14, 46, 132, 116, 184][index];
      return `<div class="late-lab-crowd-ball" style="width:${size}px;height:${size}px;left:${left}%;top:${top}px;"><img src="/assets/cats/${definition?.assetKey ?? "cat-12-v3"}.png" alt="" /></div>`;
    })
    .join("");

  return `
    <section class="late-lab-scene-card">
      <div class="late-lab-scene-head">
        <strong>Crowding Test</strong>
        <span>13-18 overlap and breathing room</span>
      </div>
      <div class="late-lab-scene late-lab-scene-crowd">
        ${nodes}
      </div>
    </section>
  `;
}

function renderLateLabLadder(): string {
  return `
    <section class="late-lab-scene-card">
      <div class="late-lab-scene-head">
        <strong>Late Ladder</strong>
        <span>13-18 visual gradient and size readout</span>
      </div>
      <div class="late-lab-level-grid">
        ${LATE_LAB_LEVELS.map((level) => renderLateLabLevelCard(level)).join("")}
      </div>
    </section>
  `;
}

function renderLateLabMergeTargets(): string {
  const focusLevels = [16, 17, 18];
  return `
    <section class="late-lab-scene-card">
      <div class="late-lab-scene-head">
        <strong>Merge Target Read</strong>
        <span>16-18 should feel like meaningful upgrades, not just scale inflation</span>
      </div>
      <div class="late-lab-focus-row">
        ${focusLevels.map((level) => {
          const definition = getCatDefinition(level);
          const radius = getCatRadius(level);
          return `
            <div class="late-lab-focus-card">
              <div class="late-lab-focus-ball" style="width:${radius * 2}px;height:${radius * 2}px;">
                <img src="/assets/cats/${definition?.assetKey ?? "cat-12-v3"}.png" alt="Level ${level}" />
              </div>
              <strong>Lv.${level}</strong>
              <span>radius ${radius}px</span>
              <code>${definition?.assetKey ?? "missing"}</code>
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderLateLab(root: HTMLElement): void {
  root.innerHTML = `
    <main class="late-lab-screen">
      <section class="late-lab-panel">
        <header class="late-lab-header">
          <div>
            <h1 class="late-lab-title">Late Game Lab</h1>
            <p class="late-lab-subtitle">Fast QA for levels 13-18: size curve, asset gradient, and crowding pressure.</p>
          </div>
          <a class="secondary-button late-lab-exit" href="/">Back Home</a>
        </header>
        ${renderLateLabLadder()}
        ${renderLateLabMergeTargets()}
        ${renderLateLabCrowding()}
      </section>
    </main>
  `;
}

function renderShareLab(root: HTMLElement): void {
  root.innerHTML = `
    <main class="share-lab-screen">
      <section class="share-lab-panel">
        <header class="share-lab-header">
          <div>
            <h1 class="share-lab-title">Share Card Lab</h1>
            <p class="share-lab-subtitle">Dev check for bands, cat assets, GIF preview, and static export mapping.</p>
          </div>
          <a class="secondary-button share-lab-exit" href="/">Back Home</a>
        </header>
        <section class="share-lab-section" aria-label="share-lab-bands">
          <div class="share-lab-section-heading">
            <strong>Band Check</strong>
            <span>Below 100K / 100K+ layout split</span>
          </div>
          <div class="share-lab-grid share-lab-grid-bands">
            ${SHARE_LAB_BAND_SCENARIOS.map((scenario) => renderShareLabCard(scenario)).join("")}
          </div>
        </section>
        <section class="share-lab-section" aria-label="share-lab-cats">
          <div class="share-lab-section-heading">
            <strong>Cat Check</strong>
            <span>Cat 1-12 GIF and asset stability</span>
          </div>
          <div class="share-lab-grid share-lab-grid-cats">
            ${SHARE_LAB_CAT_SCENARIOS.map((scenario) => renderShareLabCard(scenario, "share-card--editorial")).join("")}
          </div>
        </section>
      </section>
    </main>
  `;
}
function renderHomeScreen(root: HTMLElement, state: AppState): void {
  root.innerHTML = `
    <main class="home-screen">
      <section class="home-panel">
        <header class="home-header">
          <h1 class="home-title">ZJU Cat Merge</h1>
          <p class="home-subtitle">\u6d59\u5927\u8004\u800b\u732b</p>
          <p class="home-hook">\u70b9\u4e00\u70b9\uff0c\u5408\u4e00\u5408\uff0c\u770b\u770b\u4f60\u80fd\u5806\u5230\u591a\u79bb\u8c31</p>
        </header>
        <section class="hero-card" aria-label="game-hero">
          <div class="hero-stack">
            <div class="hero-cat">&#128049;</div>
            <p class="home-tip">\u8f6f\u840c\u3001\u9b54\u6027\u3001\u89e3\u538b\uff0c\u9002\u5408\u8bfe\u95f4\u548c DDL \u540e\u6765\u4e00\u628a</p>
          </div>
        </section>
        <section class="home-actions home-actions-top">
          <button class="primary-button" type="button" data-action="start-game">\u5f00\u59cb\u5438\u732b</button>
          <div class="secondary-actions">
            <button class="secondary-button" type="button" data-action="open-leaderboard">\u770b\u6392\u884c\u699c</button>
            <button class="secondary-button" type="button" data-action="open-settings">\u8bbe\u7f6e</button>
          </div>
        </section>
        <section class="nick-row" aria-label="nickname-card">
          <div class="nick-meta">
            <span class="nick-label">Nickname</span>
            <strong class="nick-value">${state.nickname}</strong>
          </div>
          <button class="icon-button" type="button" aria-label="edit-nickname" data-action="open-nickname">\u6539\u6635\u79f0</button>
        </section>
        ${renderLeaderboardPreview(state)}
      </section>
      ${renderModal(state)}
    </main>
  `;
}

function renderGameScreen(root: HTMLElement): { gameRoot: HTMLElement; hudRoot: HTMLElement } {
  root.innerHTML = `
    <main class="game-screen">
      <div class="game-screen-inner">
        <div id="game-root" aria-label="game-root"></div>
        <div id="game-hud-root" aria-label="game-hud-root"></div>
      </div>
    </main>
  `;

  const gameRoot = root.querySelector<HTMLElement>("#game-root");
  const hudRoot = root.querySelector<HTMLElement>("#game-hud-root");
  if (!gameRoot || !hudRoot) {
    throw new Error("Game screen containers not found");
  }

  return { gameRoot, hudRoot };
}

async function resolveCreateGame(options: AppOptions): Promise<CreateGameImpl> {
  if (options.createGameImpl) {
    return options.createGameImpl;
  }

  const { createGame } = await import("./game/bootstrap");
  return createGame;
}

export async function createApp(root: HTMLElement, options: AppOptions = {}): Promise<void> {
  let started = false;
  const state: AppState = {
    nickname: readNickname(),
    settings: readSettings(),
    modal: null,
    leaderboardTab: "allTime",
  };

  const enterGame = async (): Promise<void> => {
    if (started) {
      return;
    }

    started = true;
    setScrollLock(true);
    const { gameRoot, hudRoot } = renderGameScreen(root);
    const bridge = createHudBridge();
    mountGameHud(hudRoot, bridge);
    const createGame = await resolveCreateGame(options);
    createGame(gameRoot, bridge);
  };

  const renderHome = (): void => {
    setScrollLock(false);
    renderHomeScreen(root, state);

    root.querySelector<HTMLElement>('[data-action="start-game"]')?.addEventListener("click", () => {
      void enterGame();
    });

    root.querySelector<HTMLElement>('[data-action="open-nickname"]')?.addEventListener("click", () => {
      state.modal = "nickname";
      renderHome();
    });

    root.querySelector<HTMLElement>('[data-action="open-settings"]')?.addEventListener("click", () => {
      state.modal = "settings";
      renderHome();
    });

    root.querySelector<HTMLElement>('[data-action="open-leaderboard"]')?.addEventListener("click", () => {
      state.modal = "leaderboard";
      renderHome();
    });

    root.querySelectorAll<HTMLElement>('[data-action="close-modal"]').forEach((button) => {
      button.addEventListener("click", () => {
        state.modal = null;
        renderHome();
      });
    });

    root.querySelectorAll<HTMLElement>('[data-action="close-settings"]').forEach((button) => {
      button.addEventListener("click", () => {
        state.modal = null;
        renderHome();
      });
    });

    root.querySelector<HTMLElement>('[data-action="save-nickname"]')?.addEventListener("click", () => {
      const value = root.querySelector<HTMLInputElement>('input[name="nickname"]')?.value.trim();
      state.nickname = value || DEFAULT_NICKNAME;
      writeNickname(state.nickname);
      state.modal = null;
      renderHome();
    });

    root.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((input) => {
      input.addEventListener("change", () => {
        state.settings = {
          ...state.settings,
          [input.name]: input.checked,
        };
        writeSettings(state.settings);
      });
    });

    root.querySelectorAll<HTMLElement>('[data-tab]').forEach((button) => {
      button.addEventListener("click", () => {
        state.leaderboardTab = button.getAttribute("data-tab") === "weekly" ? "weekly" : "allTime";
        renderHome();
      });
    });
  };

  if (shouldOpenLateLab()) {
    setScrollLock(false);
    renderLateLab(root);
    return;
  }

  if (shouldOpenShareLab()) {
    setScrollLock(false);
    renderShareLab(root);
    return;
  }

  if (options.startGame) {
    await enterGame();
    return;
  }

  renderHome();
}

const appRoot = document.querySelector<HTMLElement>("#app");
if (appRoot) {
  void createApp(appRoot);
}




