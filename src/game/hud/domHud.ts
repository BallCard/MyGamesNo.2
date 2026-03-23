import type { HudBridge, HudState } from "./bridge";
import type { ToolKind } from "../systems/toolState";
import { buildShareCardModel, type ShareCardInput, type ShareCardModel } from "../share/shareCardPolicy";
import { resolveShareCardAssets, type ShareCardAssets } from "../share/shareCardAssets";
import { exportShareCardFromRenderer, type ExportShareCardFromRendererOptions } from "../share/shareCardExport";
import { renderShareCardPreview } from "../share/shareCardPreview";
import type { ShareCardExportRenderInput } from "../share/shareCardExportRenderer";
import { RESULT_MASCOT_ASSET_KEY } from "../config/cats";

const TOOL_ORDER: ToolKind[] = ["shake", "hammer", "bomb", "refresh"];
const TOOL_LABELS: Record<ToolKind, string> = {
  shake: "SHAKE",
  hammer: "HAMMER",
  bomb: "BOMB",
  refresh: "REFRESH",
};
const TOOL_ICONS: Record<ToolKind, string> = {
  shake: "&#128243;",
  hammer: "&#128296;",
  bomb: "&#128163;",
  refresh: "&#128260;",
};

function assetUrl(assetKey: string): string {
  return `/assets/cats/${assetKey}.png`;
}

function renderTools(state: HudState, side: "left" | "right"): string {
  if (state.result) {
    return "";
  }

  const tools = side === "left" ? TOOL_ORDER.slice(0, 2) : TOOL_ORDER.slice(2);
  return tools
    .map((tool) => {
      const active = state.activeTool === tool ? " is-active" : "";
      const disabled = state.toolCounts[tool] <= 0 ? " is-disabled" : "";
      return `
        <button class="hud-tool${active}${disabled}" data-tool="${tool}" type="button">
          <span class="hud-tool-icon">${TOOL_ICONS[tool]}</span>
          <span class="hud-tool-label">${TOOL_LABELS[tool]}</span>
          <span class="hud-tool-count">x${state.toolCounts[tool]}</span>
        </button>
      `;
    })
    .join("");
}

function renderResultOverlay(state: HudState, isSharePreviewOpen: boolean): string {
  if (!state.result) {
    return "";
  }

  const headline = state.result.isNewBest ? "NEW BEST" : "RUN COMPLETE";
  const label = state.result.isNewBest ? "PERSONAL BEST" : "FINAL SCORE";
  const inertAttrs = isSharePreviewOpen ? ' aria-disabled="true" tabindex="-1"' : "";

  return `
    <div class="hud-result-underlay${isSharePreviewOpen ? " is-inert" : ""}" data-share-underlay${isSharePreviewOpen ? ' inert aria-hidden="true"' : ""}>
      <div class="hud-result-overlay" aria-label="result-overlay">
        <div class="hud-result-card">
          <div class="hud-result-eyebrow${state.result.isNewBest ? " is-best" : ""}">${headline}</div>
          <div class="hud-result-mascot-wrap" aria-hidden="true">
            <img class="hud-result-mascot" src="${assetUrl(RESULT_MASCOT_ASSET_KEY)}" alt="" />
          </div>
          <div class="hud-result-score">${state.result.score}</div>
          <div class="hud-result-label">${label}</div>
          <div class="hud-result-stats">
            <div class="hud-result-stat-card">
              <div class="hud-result-stat-label">SCORE</div>
              <div class="hud-result-stat-value">${state.result.score}</div>
            </div>
            <div class="hud-result-stat-card">
              <div class="hud-result-stat-label">PEAK LV</div>
              <div class="hud-result-stat-value">Lv.${state.result.peakLevel}</div>
            </div>
          </div>
          <div class="hud-result-actions">
            <button class="hud-result-restart${isSharePreviewOpen ? " is-disabled" : ""}" type="button" data-action="restart-result"${inertAttrs}>Restart</button>
            <button class="hud-result-secondary${isSharePreviewOpen ? " is-disabled" : ""}" type="button" data-action="share-result"${inertAttrs}>Share</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function render(state: HudState, isSharePreviewOpen: boolean, sharePreviewMarkup: string): string {
  const resultActive = Boolean(state.result);
  const restartMarkup = resultActive
    ? '<div class="hud-restart-wrap is-hidden"></div>'
    : `
        <div class="hud-restart-wrap">
          <button class="hud-orb hud-restart" type="button" data-action="restart" aria-label="Restart">
            <span>&#8635;</span>
          </button>
        </div>`;

  return `
    <div class="game-hud${resultActive ? " is-game-over" : ""}${isSharePreviewOpen ? " is-share-preview-open" : ""}" aria-label="game-hud">
      <header class="hud-header">
        <div class="hud-next">
          <div class="hud-orb hud-next-orb">
            <img src="${assetUrl(state.nextAssetKey)}" alt="Next level ${state.nextLevel}" />
          </div>
          <div class="hud-next-label">Level ${state.nextLevel}</div>
        </div>
        <div class="hud-center">
          <div class="hud-score">${state.score}</div>
          <div class="hud-score-label">${state.scoreLabel}</div>
          <div class="hud-progress-shell">
            <span class="hud-progress-label hud-progress-label-left">${state.progressCurrentLabel}</span>
            <span class="hud-progress-label hud-progress-label-right">${state.progressNextLabel}</span>
            <div class="hud-progress-track">
              <div class="hud-progress-fill" style="width:${Math.max(6, Math.round(state.progressRatio * 100))}%"></div>
            </div>
          </div>
        </div>
        ${restartMarkup}
      </header>
      <aside class="hud-tools hud-tools-left">
        ${renderTools(state, "left")}
      </aside>
      <aside class="hud-tools hud-tools-right">
        ${renderTools(state, "right")}
      </aside>
      ${renderResultOverlay(state, isSharePreviewOpen)}
      ${sharePreviewMarkup}
    </div>
  `;
}

function bindPressAction(element: HTMLElement, action: () => void | Promise<void>): void {
  element.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    void Promise.resolve(action()).catch(() => {});
  });
}

const shareCardPreviewPreloadCache = new Map<string, Promise<void>>();

function preloadImage(src: string): Promise<void> {
  const cached = shareCardPreviewPreloadCache.get(src);
  if (cached) {
    return cached;
  }

  const pending = new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });

  shareCardPreviewPreloadCache.set(src, pending);
  return pending;
}

function preloadShareCardPreviewAssets(assets: ShareCardAssets): Promise<void> {
  if (assets.previewMode === "gif" && assets.previewGifSrc) {
    return preloadImage(assets.previewGifSrc);
  }

  if (assets.previewMode === "frames" && assets.previewFrameSrcs.length > 0) {
    return Promise.all(assets.previewFrameSrcs.map((src) => preloadImage(src))).then(() => void 0);
  }

  return Promise.resolve();
}

function createShareCardInput(result: NonNullable<HudState["result"]>): ShareCardInput {
  return {
    score: result.score,
    peakLevel: result.peakLevel,
    isNewBest: false,
  };
}

export type MountGameHudOptions = {
  resolveShareCardAssets?: (peakLevel: number) => ShareCardAssets;
  exportShareCard?: (options: ExportShareCardFromRendererOptions) => Promise<"shared" | "downloaded">;
  preloadShareCardAssets?: (assets: ShareCardAssets) => Promise<void>;
};

type FrozenShareCard = {
  renderInput: ShareCardExportRenderInput;
  model: ShareCardModel;
  assets: ShareCardAssets;
};

export function mountGameHud(root: HTMLElement, bridge: HudBridge, options?: MountGameHudOptions): () => void {
  let sharePreviewOpen = false;
  let frozenShareCard: FrozenShareCard | null = null;
  const resolveAssets = options?.resolveShareCardAssets ?? resolveShareCardAssets;
  const exportShareCard = options?.exportShareCard ?? exportShareCardFromRenderer;
  const preloadAssets = options?.preloadShareCardAssets ?? preloadShareCardPreviewAssets;

  const closeSharePreview = (): void => {
    if (!sharePreviewOpen) {
      return;
    }

    sharePreviewOpen = false;
    frozenShareCard = null;
    paint(bridge.getState());
  };

  const openSharePreview = async (): Promise<void> => {
    const state = bridge.getState();
    if (!state.result) {
      return;
    }

    const shareInput = createShareCardInput(state.result);
    const model = buildShareCardModel(shareInput);
    const assets = resolveAssets(shareInput.peakLevel);
    await preloadAssets(assets);

    const latestResult = bridge.getState().result;
    if (!latestResult || latestResult.score !== state.result.score || latestResult.peakLevel !== state.result.peakLevel) {
      return;
    }

    sharePreviewOpen = true;
    frozenShareCard = {
      renderInput: {
        model,
        score: shareInput.score,
        peakLevel: shareInput.peakLevel,
        isNewBest: shareInput.isNewBest,
        assets,
      },
      model,
      assets,
    };
    paint(state);
  };

  const getSharePreviewMarkup = (): string => {
    if (!sharePreviewOpen || !frozenShareCard) {
      return "";
    }

    return renderShareCardPreview({
      model: frozenShareCard.model,
      score: frozenShareCard.renderInput.score,
      peakLevel: frozenShareCard.renderInput.peakLevel,
      isNewBest: frozenShareCard.renderInput.isNewBest,
      assets: frozenShareCard.assets,
    });
  };

  const handlePreviewShare = async (): Promise<void> => {
    if (!frozenShareCard) {
      return;
    }

    await exportShareCard({
      renderInput: frozenShareCard.renderInput,
      fileName: "zju-cat-merge-share.png",
      title: "ZJU Cat Merge",
      text: `Score ${frozenShareCard.renderInput.score}, peak Lv.${frozenShareCard.renderInput.peakLevel}`,
    });
  };

  const bind = (): void => {
    const restartButton = root.querySelector<HTMLElement>('[data-action="restart"]');
    if (restartButton) {
      bindPressAction(restartButton, () => bridge.restart());
    }

    const resultRestartButton = root.querySelector<HTMLElement>('[data-action="restart-result"]');
    if (resultRestartButton && !sharePreviewOpen) {
      bindPressAction(resultRestartButton, () => bridge.restart());
    }

    const resultShareButton = root.querySelector<HTMLElement>('[data-action="share-result"]');
    if (resultShareButton && !sharePreviewOpen) {
      bindPressAction(resultShareButton, openSharePreview);
    }

    const closeShareButton = root.querySelector<HTMLElement>('[data-action="close-share-preview"]');
    if (closeShareButton) {
      bindPressAction(closeShareButton, closeSharePreview);
    }

    const previewShareButton = root.querySelector<HTMLElement>('[data-action="share-preview"]');
    if (previewShareButton) {
      bindPressAction(previewShareButton, handlePreviewShare);
    }

    root.querySelectorAll<HTMLElement>('[data-tool]').forEach((button) => {
      bindPressAction(button, () => {
        const tool = button.getAttribute("data-tool") as ToolKind | null;
        if (tool) {
          bridge.useTool(tool);
        }
      });
    });
  };

  const paint = (state: HudState): void => {
    root.innerHTML = render(state, sharePreviewOpen, getSharePreviewMarkup());
    bind();
    if (sharePreviewOpen) {
      root.querySelector<HTMLElement>('[data-action="close-share-preview"]')?.focus();
    }
  };

  paint(bridge.getState());
  const unsubscribe = bridge.subscribe((state) => {
    paint(state);
  });

  return () => {
    unsubscribe();
    root.innerHTML = "";
  };
}


