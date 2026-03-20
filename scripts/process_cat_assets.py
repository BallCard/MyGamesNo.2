from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from shutil import copy2

from PIL import Image


@dataclass(frozen=True)
class AssetSelection:
    level: int
    source_gif: Path
    frame_index: int


def _render_frame(source_gif: Path, frame_index: int) -> Image.Image:
    with Image.open(source_gif) as image:
        image.seek(frame_index)
        return image.convert("RGBA")


def _fit_on_canvas(frame: Image.Image, canvas_size: int) -> Image.Image:
    alpha = frame.getchannel("A")
    bbox = alpha.getbbox()
    if bbox is None:
        raise ValueError("Selected frame is fully transparent")

    cropped = frame.crop(bbox)
    max_subject = int(canvas_size * 0.82)
    width, height = cropped.size
    scale = min(max_subject / width, max_subject / height)
    resized = cropped.resize(
        (max(1, round(width * scale)), max(1, round(height * scale))),
        Image.Resampling.LANCZOS,
    )

    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    x = (canvas_size - resized.width) // 2
    y = (canvas_size - resized.height) // 2
    canvas.alpha_composite(resized, (x, y))
    return canvas


def export_selected_assets(
    selections: list[AssetSelection],
    *,
    output_dir: Path,
    canvas_size: int = 512,
    selected_gif_dir: Path | None = None,
) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    if selected_gif_dir is not None:
        selected_gif_dir.mkdir(parents=True, exist_ok=True)

    for selection in selections:
        frame = _render_frame(selection.source_gif, selection.frame_index)
        canvas = _fit_on_canvas(frame, canvas_size)
        canvas.save(output_dir / f"cat-{selection.level}.png")
        if selected_gif_dir is not None:
            copy2(
                selection.source_gif,
                selected_gif_dir / f"cat-{selection.level}.gif",
            )


if __name__ == "__main__":
    repo_root = Path(__file__).resolve().parents[1]
    raw_dir = repo_root / "assets" / "raw-gifs"
    selected = [
        AssetSelection(1, raw_dir / "1739669151740.gif", 75),
        AssetSelection(2, raw_dir / "1739669468684.gif", 45),
        AssetSelection(3, raw_dir / "1739669272399.gif", 75),
        AssetSelection(4, raw_dir / "1739677373999.gif", 53),
        AssetSelection(5, raw_dir / "1739669511858.gif", 67),
        AssetSelection(6, raw_dir / "1739669611997.gif", 75),
        AssetSelection(7, raw_dir / "1739669329312.gif", 75),
        AssetSelection(8, raw_dir / "1739670504608.gif", 75),
        AssetSelection(9, raw_dir / "1739669761027.gif", 75),
        AssetSelection(10, raw_dir / "1739670687306.gif", 65),
        AssetSelection(11, raw_dir / "1739670476430.gif", 108),
        AssetSelection(12, raw_dir / "1739670012601.gif", 81),
    ]
    export_selected_assets(
        selected,
        output_dir=repo_root / "public" / "assets" / "cats",
        selected_gif_dir=repo_root / "assets" / "selected-gifs",
    )
