import { renderShareCardToCanvas, type RenderedShareCard, type ShareCardExportRenderInput } from "./shareCardExportRenderer";

export type ShareCardExportCapabilities = {
  share?: (data: ShareData) => Promise<void>;
  canShare?: (data: ShareData) => boolean;
  download?: (blob: Blob, fileName: string) => void | Promise<void>;
  createObjectURL?: (blob: Blob) => string;
  revokeObjectURL?: (url: string) => void;
};

export type ExportShareCardOptions = {
  blob: Blob;
  fileName: string;
  title?: string;
  text?: string;
  capabilities?: ShareCardExportCapabilities;
};

export type ExportShareCardFromRendererOptions = {
  renderInput: ShareCardExportRenderInput;
  fileName: string;
  title?: string;
  text?: string;
  capabilities?: ShareCardExportCapabilities;
  render?: (input: ShareCardExportRenderInput) => Promise<RenderedShareCard>;
};

export type ExportShareCardFromElementOptions = {
  element: HTMLElement;
  fileName: string;
  title?: string;
  text?: string;
  capabilities?: ShareCardExportCapabilities;
  capture?: (element: HTMLElement) => Promise<Blob>;
};

const SHARE_CARD_EXPORT_STATUS_EVENT = "zju-cat-merge:share-card-export-status";

function notifyShareStatus(status: "Shared" | "Saved"): void {
  if (typeof document === "undefined") {
    return;
  }

  document.dispatchEvent(
    new CustomEvent(SHARE_CARD_EXPORT_STATUS_EVENT, {
      detail: { status },
    }),
  );
}

function createSharePayload(options: ExportShareCardOptions, file: File): ShareData {
  const payload: ShareData = {
    files: [file],
  };

  if (options.title) {
    payload.title = options.title;
  }

  if (options.text) {
    payload.text = options.text;
  }

  return payload;
}

function getNativeShareCapabilities(capabilities: ShareCardExportCapabilities): {
  share?: (data: ShareData) => Promise<void>;
  canShare?: (data: ShareData) => boolean;
} {
  const navigatorLike = typeof navigator === "undefined" ? undefined : navigator;

  return {
    share: capabilities.share ?? navigatorLike?.share?.bind(navigatorLike),
    canShare: capabilities.canShare ?? navigatorLike?.canShare?.bind(navigatorLike),
  };
}

function getCaptureDimensions(element: HTMLElement): { width: number; height: number } {
  const rect = element.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width || element.scrollWidth || 1080));
  const height = Math.max(1, Math.round(rect.height || element.scrollHeight || 1920));

  return { width, height };
}

function copyComputedStyles(source: Element, target: Element): void {
  if (!(source instanceof HTMLElement) || !(target instanceof HTMLElement)) {
    return;
  }

  const computed = getComputedStyle(source);
  for (let index = 0; index < computed.length; index += 1) {
    const property = computed.item(index);
    target.style.setProperty(property, computed.getPropertyValue(property), computed.getPropertyPriority(property));
  }
}

function cloneWithComputedStyles(source: Element): Element {
  const clone = source.cloneNode(true) as Element;
  const sourceElements = [source, ...Array.from(source.querySelectorAll("*"))];
  const cloneElements = [clone, ...Array.from(clone.querySelectorAll("*"))];

  sourceElements.forEach((sourceElement, index) => {
    const cloneElement = cloneElements[index];
    if (cloneElement) {
      copyComputedStyles(sourceElement, cloneElement);
    }
  });

  return clone;
}

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Unable to create image blob."));
    }, "image/png");
  });
}

export async function captureShareCardBlob(element: HTMLElement): Promise<Blob> {
  const { width, height } = getCaptureDimensions(element);
  const clone = cloneWithComputedStyles(element) as HTMLElement;
  const wrapper = document.createElement("div");
  wrapper.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  wrapper.appendChild(clone);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <foreignObject width="100%" height="100%">
        ${new XMLSerializer().serializeToString(wrapper)}
      </foreignObject>
    </svg>
  `;

  const image = new Image();
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to access canvas context.");
  }

  return await new Promise<Blob>((resolve, reject) => {
    image.onload = async () => {
      try {
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve(await canvasToBlob(canvas));
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = () => reject(new Error("Unable to render share card preview."));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

async function downloadFallback(
  blob: Blob,
  fileName: string,
  capabilities: ShareCardExportCapabilities,
): Promise<void> {
  if (capabilities.download) {
    await capabilities.download(blob, fileName);
    return;
  }

  const createObjectURL = capabilities.createObjectURL ?? URL.createObjectURL.bind(URL);
  const revokeObjectURL = capabilities.revokeObjectURL ?? URL.revokeObjectURL.bind(URL);
  const objectUrl = createObjectURL(blob);

  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.rel = "noopener";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    revokeObjectURL(objectUrl);
  }
}

export async function exportShareCard(options: ExportShareCardOptions): Promise<"shared" | "downloaded"> {
  const capabilities = options.capabilities ?? {};
  const { share, canShare } = getNativeShareCapabilities(capabilities);
  const file = new File([options.blob], options.fileName, {
    type: options.blob.type || "image/png",
  });
  const shareData = createSharePayload(options, file);

  if (share) {
    const canNativeShare = canShare ? canShare(shareData) : true;

    if (canNativeShare) {
      try {
        await share(shareData);
        notifyShareStatus("Shared");
        return "shared";
      } catch {
        // Fall through to download when the share target rejects the asset.
      }
    }
  }

  await downloadFallback(options.blob, options.fileName, capabilities);
  notifyShareStatus("Saved");
  return "downloaded";
}

export async function exportShareCardFromRenderer(
  options: ExportShareCardFromRendererOptions,
): Promise<"shared" | "downloaded"> {
  const render = options.render ?? renderShareCardToCanvas;
  const rendered = await render(options.renderInput);
  const blob = await canvasToBlob(rendered.canvas);

  return await exportShareCard({
    blob,
    fileName: options.fileName,
    title: options.title,
    text: options.text,
    capabilities: options.capabilities,
  });
}

export async function exportShareCardFromElement(
  options: ExportShareCardFromElementOptions,
): Promise<"shared" | "downloaded"> {
  const capture = options.capture ?? captureShareCardBlob;
  const blob = await capture(options.element);

  return await exportShareCard({
    blob,
    fileName: options.fileName,
    title: options.title,
    text: options.text,
    capabilities: options.capabilities,
  });
}
