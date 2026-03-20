import "./styles.css";

type CreateGameImpl = (target: HTMLElement) => unknown;

type AppOptions = {
  startGame?: boolean;
  createGameImpl?: CreateGameImpl;
};

function setScrollLock(locked: boolean): void {
  document.documentElement.classList.toggle("app-locked", locked);
  document.body.classList.toggle("app-locked", locked);
}

function renderHomeScreen(root: HTMLElement): void {
  root.innerHTML = `
    <main class="home-screen">
      <section class="home-panel">
        <header class="home-header">
          <h1 class="home-title">ZJU Cat Merge</h1>
          <p class="home-subtitle">浙大耄耋猫</p>
          <p class="home-hook">点一点，合一合，看看你能堆到多离谱</p>
        </header>
        <section class="hero-card" aria-label="game-hero">
          <div class="hero-stack">
            <div class="hero-cat">🐱</div>
            <p class="home-tip">软萌、魔性、解压，适合课间和 DDL 后来一把</p>
          </div>
        </section>
        <section class="home-actions home-actions-top">
          <button class="primary-button" type="button">开始吸猫</button>
          <div class="secondary-actions">
            <button class="secondary-button" type="button">看排行榜</button>
            <button class="secondary-button" type="button">设置</button>
          </div>
        </section>
        <section class="nick-row" aria-label="nickname-card">
          <div class="nick-meta">
            <span class="nick-label">Nickname</span>
            <strong class="nick-value">匿名同学</strong>
          </div>
          <button class="icon-button" type="button" aria-label="edit-nickname">改昵称</button>
        </section>
      </section>
    </main>
  `;
}

function renderGameScreen(root: HTMLElement): HTMLElement {
  root.innerHTML = `
    <main class="game-screen">
      <div class="game-screen-inner">
        <div id="game-root" aria-label="game-root"></div>
      </div>
    </main>
  `;

  const gameRoot = root.querySelector<HTMLElement>("#game-root");
  if (!gameRoot) {
    throw new Error("Game root container not found");
  }

  return gameRoot;
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

  const enterGame = async (): Promise<void> => {
    if (started) {
      return;
    }

    started = true;
    setScrollLock(true);
    const gameRoot = renderGameScreen(root);
    const createGame = await resolveCreateGame(options);
    createGame(gameRoot);
  };

  if (options.startGame) {
    await enterGame();
    return;
  }

  setScrollLock(false);
  renderHomeScreen(root);
  root.querySelector<HTMLButtonElement>(".primary-button")?.addEventListener("click", () => {
    void enterGame();
  });
}

const appRoot = document.querySelector<HTMLElement>("#app");
if (appRoot) {
  void createApp(appRoot);
}
