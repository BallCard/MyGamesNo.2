import type { ShareCardAssets } from "./shareCardAssets";
import { resolveShareCardAssets } from "./shareCardAssets";
import type { ShareCardModel } from "./shareCardPolicy";

export type ShareCardPreviewProps = {
  surfaceClassName?: string;
  model: ShareCardModel;
  score: number;
  peakLevel: number;
  isNewBest: boolean;
  assets?: ShareCardAssets;
};

const SHARE_CARD_EXPORT_STATUS_EVENT = "zju-cat-merge:share-card-export-status";
const SHARE_CARD_FRAME_INTERVAL_MS = 220;
const SHARE_CARD_FRAME_SRC_DELIMITER = "||";

type ShareCardExportStatusDetail = {
  status: "Shared" | "Saved";
};

let shareStatusListenerInstalled = false;
let shareCardFrameTickerInstalled = false;
let shareCardFrameTick = 0;

function installShareStatusListener(): void {
  if (shareStatusListenerInstalled || typeof document === "undefined") {
    return;
  }

  document.addEventListener(SHARE_CARD_EXPORT_STATUS_EVENT, (event) => {
    const detail = (event as CustomEvent<ShareCardExportStatusDetail>).detail;
    const status = detail?.status ?? "Shared";

    document.querySelectorAll<HTMLElement>("[data-share-success]").forEach((hint) => {
      hint.hidden = false;
      hint.textContent = status;
    });
  });

  shareStatusListenerInstalled = true;
}

function syncShareCardFrames(): void {
  if (typeof document === "undefined") {
    return;
  }

  document.querySelectorAll<HTMLElement>("[data-share-card-frame-group]").forEach((group) => {
    const liveFrame = group.querySelector<HTMLImageElement>("[data-share-card-frame-live]");
    if (!liveFrame) {
      return;
    }

    const srcList = (group.getAttribute("data-frame-srcs") ?? "")
      .split(SHARE_CARD_FRAME_SRC_DELIMITER)
      .map((src) => src.trim())
      .filter(Boolean);
    if (!srcList.length) {
      return;
    }

    const frameCount = Number(group.getAttribute("data-frame-count") ?? `${srcList.length}`) || srcList.length;
    const activeIndex = shareCardFrameTick % frameCount;
    const nextSrc = srcList[Math.min(activeIndex, srcList.length - 1)] ?? srcList[0];

    group.setAttribute("data-active-frame", String(activeIndex + 1));
    liveFrame.setAttribute("data-frame-index", String(activeIndex + 1));
    liveFrame.setAttribute("src", nextSrc);
  });
}

function installShareCardFrameTicker(): void {
  if (shareCardFrameTickerInstalled || typeof window === "undefined") {
    return;
  }

  syncShareCardFrames();
  window.setInterval(() => {
    shareCardFrameTick += 1;
    syncShareCardFrames();
  }, SHARE_CARD_FRAME_INTERVAL_MS);
  shareCardFrameTickerInstalled = true;
}

function renderCatVisual(assets: ShareCardAssets): string {
  if (assets.previewMode === "gif" && assets.previewGifSrc) {
    return `<img class="share-card-cat-gif" src="${assets.previewGifSrc}" alt="" />`;
  }

  if (assets.previewMode === "frames" && assets.previewFrameSrcs.length > 1) {
    const frameCount = assets.previewFrameSrcs.length;
    const frameSrcs = assets.previewFrameSrcs.join(SHARE_CARD_FRAME_SRC_DELIMITER);
    const initialSrc = assets.previewFrameSrcs[0];

    return `
      <div class="share-card-cat-frames" aria-hidden="true" data-share-card-frame-group data-frame-count="${frameCount}" data-active-frame="1" data-frame-srcs="${frameSrcs}">
        <img class="share-card-cat-frame-live" src="${initialSrc}" alt="" data-share-card-frame-live data-frame-index="1" />
      </div>
    `;
  }

  if (assets.previewMode === "static") {
    return `<img class="share-card-cat-img" src="${assets.staticHeroSrc ?? assets.placeholderSrc}" alt="" />`;
  }

  return `
    <div class="share-card-cat-placeholder" aria-hidden="true">
      <span class="share-card-cat-placeholder-label">CAT</span>
    </div>
  `;
}

export function renderShareCardSurface(props: ShareCardPreviewProps): string {
  installShareCardFrameTicker();
  const assets = props.assets ?? resolveShareCardAssets(props.peakLevel);

  return `
    <div class="share-card ${props.surfaceClassName ?? ""} is-band-${props.model.band} is-pose-${props.model.poseMode} is-anchor-${props.model.scoreAnchor} is-preview-${assets.previewMode}" data-preview-mode="${assets.previewMode}" data-export-mode="${assets.exportMode}">
      <div class="share-card-topline">
        <div class="share-card-brand">ZJU MERGE</div>
        <div class="share-card-frozen">Frozen result</div>
      </div>
      <div class="share-card-stage">
        <div class="share-card-cat" aria-hidden="true">
          ${renderCatVisual(assets)}
        </div>
        <div class="share-card-score-panel">
          <div class="share-card-score-label">SCORE</div>
          <div class="share-card-score">${props.score}</div>
        </div>
      </div>
      <div class="share-card-line">${props.model.shareLine}</div>
      <div class="share-card-meta">Peak Lv.${props.peakLevel}</div>
      <div class="share-card-footer">Share the frozen result card.</div>
    </div>
  `;
}

export function renderShareCardPreview(props: ShareCardPreviewProps): string {
  installShareStatusListener();

  return `
    <div class="share-preview" aria-label="share-preview" role="dialog" aria-modal="true">
      <div class="share-preview-shell">
        <div class="share-preview-header">
          <button class="share-preview-close" type="button" data-action="close-share-preview">Close</button>
          <button class="share-preview-share" type="button" data-action="share-preview">Share</button>
        </div>
        <div class="share-preview-status" data-share-success aria-live="polite" hidden></div>
        ${renderShareCardSurface(props)}
      </div>
    </div>
  `;
}