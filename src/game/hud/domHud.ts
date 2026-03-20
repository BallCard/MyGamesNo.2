import type { HudBridge, HudState } from "./bridge";
import type { ToolKind } from "../systems/toolState";

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

function render(state: HudState): string {
  return `
    <div class="game-hud" aria-label="game-hud">
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
        <div class="hud-restart-wrap">
          <button class="hud-orb hud-restart" type="button" data-action="restart" aria-label="Restart">
            <span>&#8635;</span>
          </button>
        </div>
      </header>
      <aside class="hud-tools hud-tools-left">
        ${renderTools(state, "left")}
      </aside>
      <aside class="hud-tools hud-tools-right">
        ${renderTools(state, "right")}
      </aside>
    </div>
  `;
}

function bindPressAction(element: HTMLElement, action: () => void): void {
  element.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    action();
  });
}

export function mountGameHud(root: HTMLElement, bridge: HudBridge): () => void {
  const bind = (): void => {
    const restartButton = root.querySelector<HTMLElement>('[data-action="restart"]');
    if (restartButton) {
      bindPressAction(restartButton, () => bridge.restart());
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
    root.innerHTML = render(state);
    bind();
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

