export type GameUiLayout = {
  header: {
    height: number;
    backgroundColor: number;
    next: {
      x: number;
      y: number;
      radius: number;
    };
    progress: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    restart: {
      x: number;
      y: number;
      radius: number;
      integratedWithNext: boolean;
      hasOwnContainer: boolean;
    };
  };
  scoreDisplay: {
    valueX: number;
    valueY: number;
    subtitle: string;
    subtitleY: number;
    accentColor: string;
  };
  playfield: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    hasFrame: boolean;
  };
  tools: {
    hasBorder: boolean;
    hasShadow: boolean;
    labelBelowIcon: boolean;
    leftX: number;
    rightX: number;
    topY: number;
    gapY: number;
  };
};

export function getPreviewSpawnY(playfieldTop: number, redLineY: number): number {
  return Math.round(playfieldTop + (redLineY - playfieldTop) * 0.48);
}

export function getGameUiLayout(width: number, height: number): GameUiLayout {
  return {
    header: {
      height: 104,
      backgroundColor: 0x060816,
      next: {
        x: 42,
        y: 52,
        radius: 26,
      },
      progress: {
        x: width / 2,
        y: 58,
        width: width - 146,
        height: 38,
      },
      restart: {
        x: width - 42,
        y: 52,
        radius: 26,
        integratedWithNext: true,
        hasOwnContainer: false,
      },
    },
    scoreDisplay: {
      valueX: width / 2,
      valueY: 146,
      subtitle: "ZJU MERGE",
      subtitleY: 184,
      accentColor: "#f7b94c",
    },
    playfield: {
      top: 102,
      bottom: height - 20,
      left: 0,
      right: width,
      hasFrame: false,
    },
    tools: {
      hasBorder: false,
      hasShadow: true,
      labelBelowIcon: true,
      leftX: 42,
      rightX: width - 42,
      topY: 410,
      gapY: 84,
    },
  };
}

