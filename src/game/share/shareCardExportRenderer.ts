import type { ShareCardAssets } from "./shareCardAssets";
import type { ShareCardModel } from "./shareCardPolicy";

export const SHARE_CARD_EXPORT_WIDTH = 1080;
export const SHARE_CARD_EXPORT_HEIGHT = 1920;

export type ShareCardExportSafeArea = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type ShareCardExportRenderInput = {
  model: ShareCardModel;
  score: number;
  peakLevel: number;
  isNewBest: boolean;
  assets: ShareCardAssets;
};

export type RenderedShareCard = {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  safeArea: ShareCardExportSafeArea;
  assetMode: ShareCardAssets["exportMode"];
  heroSource: string | null;
};

const SAFE_AREA: ShareCardExportSafeArea = {
  left: 96,
  top: 120,
  right: 96,
  bottom: 120,
};

const SCORE_AREA = {
  x: SAFE_AREA.left,
  y: SHARE_CARD_EXPORT_HEIGHT - 500,
  width: SHARE_CARD_EXPORT_WIDTH - SAFE_AREA.left - SAFE_AREA.right,
  height: 280,
};

function getHeroFrame() {
  return {
    x: SAFE_AREA.left,
    y: SAFE_AREA.top + 70,
    width: SHARE_CARD_EXPORT_WIDTH - SAFE_AREA.left - SAFE_AREA.right,
    height: 920,
  };
}

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to access canvas context.");
  }

  return context;
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawBackground(context: CanvasRenderingContext2D, model: ShareCardModel): void {
  const gradient = context.createLinearGradient(0, 0, 0, SHARE_CARD_EXPORT_HEIGHT);
  if (model.band === "high") {
    gradient.addColorStop(0, "#fff6df");
    gradient.addColorStop(1, "#f7bc75");
  } else if (model.band === "mid") {
    gradient.addColorStop(0, "#fff8ee");
    gradient.addColorStop(1, "#f6deae");
  } else {
    gradient.addColorStop(0, "#fffaf2");
    gradient.addColorStop(1, "#f7e6c9");
  }

  context.fillStyle = gradient;
  context.fillRect(0, 0, SHARE_CARD_EXPORT_WIDTH, SHARE_CARD_EXPORT_HEIGHT);
}

function drawScoreBlock(context: CanvasRenderingContext2D, input: ShareCardExportRenderInput): void {
  context.fillStyle = "rgba(255, 250, 242, 0.54)";
  roundRect(context, SCORE_AREA.x, SCORE_AREA.y, SCORE_AREA.width, SCORE_AREA.height, 30);
  context.fill();

  context.fillStyle = "rgba(77, 47, 31, 0.82)";
  context.font = "900 28px sans-serif";
  context.fillText("SCORE", SCORE_AREA.x + 10, SCORE_AREA.y + 36);



  context.fillStyle = "#472a1b";
  context.font = "900 118px sans-serif";
  context.fillText(String(input.score), SCORE_AREA.x, SCORE_AREA.y + 164);
  context.font = "900 26px sans-serif";
  context.fillText(`Peak Lv.${input.peakLevel}`, SCORE_AREA.x, SCORE_AREA.y + 242);
}

function drawHeadline(context: CanvasRenderingContext2D, input: ShareCardExportRenderInput): void {
  context.fillStyle = "rgba(77, 47, 31, 0.82)";
  context.font = "900 42px sans-serif";
  context.fillText("ZJU MERGE", SAFE_AREA.left, 92);
  context.font = "700 24px sans-serif";
  context.fillText("Frozen result", SHARE_CARD_EXPORT_WIDTH - SAFE_AREA.right - 188, 92);
  drawScoreBlock(context, input);
}

function drawPlaceholderHero(context: CanvasRenderingContext2D, frame: ReturnType<typeof getHeroFrame>): void {
  const centerX = frame.x + frame.width / 2;
  const centerY = frame.y + frame.height / 2;
  const radius = Math.min(frame.width, frame.height) * 0.26;

  context.fillStyle = "rgba(255, 255, 255, 0.42)";
  roundRect(context, frame.x, frame.y, frame.width, frame.height, 44);
  context.fill();

  context.fillStyle = "rgba(236, 156, 73, 0.92)";
  context.beginPath();
  context.arc(centerX, centerY, radius * 1.18, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "rgba(255, 248, 240, 0.94)";
  context.beginPath();
  context.arc(centerX - radius * 0.9, centerY - radius * 0.92, radius * 0.38, 0, Math.PI * 2);
  context.arc(centerX + radius * 0.9, centerY - radius * 0.92, radius * 0.38, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#fff8f0";
  context.font = "900 82px sans-serif";
  context.textAlign = "center";
  context.fillText("CAT", centerX, centerY + 28);
  context.textAlign = "start";
}

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return await new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

export async function renderShareCardToCanvas(input: ShareCardExportRenderInput): Promise<RenderedShareCard> {
  const canvas = document.createElement("canvas");
  canvas.width = SHARE_CARD_EXPORT_WIDTH;
  canvas.height = SHARE_CARD_EXPORT_HEIGHT;

  const context = getContext(canvas);
  const heroFrame = getHeroFrame();

  drawBackground(context, input.model);

  const heroSource = input.assets.exportMode === "static" ? input.assets.staticHeroSrc ?? null : null;
  let assetMode: ShareCardAssets["exportMode"] = input.assets.exportMode;

  if (heroSource) {
    const image = await loadImage(heroSource);
    if (image) {
      context.save();
      roundRect(context, heroFrame.x, heroFrame.y, heroFrame.width, heroFrame.height, 52);
      context.clip();
      context.drawImage(image, heroFrame.x, heroFrame.y, heroFrame.width, heroFrame.height);
      context.restore();
    } else {
      assetMode = "placeholder";
      drawPlaceholderHero(context, heroFrame);
    }
  } else {
    assetMode = "placeholder";
    drawPlaceholderHero(context, heroFrame);
  }

  drawHeadline(context, input);

  context.fillStyle = "rgba(77, 47, 31, 0.66)";
  context.font = "800 24px sans-serif";
  context.fillText("Share the frozen result card.", SAFE_AREA.left, SHARE_CARD_EXPORT_HEIGHT - 168);

  return {
    canvas,
    width: SHARE_CARD_EXPORT_WIDTH,
    height: SHARE_CARD_EXPORT_HEIGHT,
    safeArea: SAFE_AREA,
    assetMode,
    heroSource,
  };
}
