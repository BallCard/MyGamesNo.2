from pathlib import Path
from shutil import rmtree
import unittest

from scripts.process_cat_assets import AssetSelection, export_selected_assets


class ProcessCatAssetsTests(unittest.TestCase):
    def test_exports_square_png_with_transparency(self) -> None:
        repo_root = Path(__file__).resolve().parents[1]
        source = repo_root / "assets" / "raw-gifs" / "1739669151740.gif"
        output_dir = repo_root / ".tmp-test-assets"
        rmtree(output_dir, ignore_errors=True)
        output_dir.mkdir(parents=True, exist_ok=True)

        try:
            export_selected_assets(
                [
                    AssetSelection(
                        level=1,
                        source_gif=source,
                        frame_index=75,
                    )
                ],
                output_dir=output_dir,
                canvas_size=512,
            )

            exported = output_dir / "cat-1.png"
            self.assertTrue(exported.exists())

            from PIL import Image

            with Image.open(exported) as image:
                self.assertEqual(image.size, (512, 512))
                self.assertEqual(image.mode, "RGBA")
                alpha = image.getchannel("A")
                bbox = alpha.getbbox()
                self.assertIsNotNone(bbox)
                self.assertLess(bbox[0], bbox[2])
                self.assertLess(bbox[1], bbox[3])
                self.assertGreater(bbox[0], 0)
                self.assertGreater(bbox[1], 0)
                self.assertLess(bbox[2], 512)
                self.assertLess(bbox[3], 512)
                self.assertLess(alpha.getextrema()[0], 255)
        finally:
            rmtree(output_dir, ignore_errors=True)


if __name__ == "__main__":
    unittest.main()
