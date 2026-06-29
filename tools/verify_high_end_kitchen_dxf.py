"""Verify that the generated high-end kitchen DXF contains canonical layers and tags.

Parses the file with ezdxf rather than scanning raw text, so the check confirms
real declared layers and real TEXT entity content, not incidental substring matches.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUTOCAD_MCP_SRC = ROOT / "src" / "mcp" / "roc4design-autocad-mcp" / "src"
DEFAULT_DXF = ROOT / "src" / "mcp" / "roc4design-autocad-mcp" / "output" / "ROC4T-KITCHEN-HIGH-END-001.dxf"

sys.path.insert(0, str(AUTOCAD_MCP_SRC))

REQUIRED_LAYERS = [
    "ROC4T-WALL",
    "ROC4T-FURN",
    "ROC4T-MEP-HVAC",
    "ROC4T-MEP-PLUMB",
    "ROC4T-DIMS",
]

REQUIRED_TAGS = [
    "EQ-RANGE-01",
    "EQ-RANGE-02",
    "EQ-GRIDDLE-01",
    "EQ-COMBI-01",
    "EQ-DISH-01",
    "EQ-SINK-01",
    "EQ-SHELF-01",
    "FX-ISLAND-01",
    "FX-ISLAND-02",
]


def verify_dxf(path: Path) -> dict:
    if not path.exists():
        return {"success": False, "file": str(path), "error": "DXF file does not exist"}

    import ezdxf

    try:
        doc = ezdxf.readfile(str(path))
    except (IOError, ezdxf.DXFStructureError) as exc:
        return {"success": False, "file": str(path), "error": f"Invalid DXF: {exc}"}

    msp = doc.modelspace()
    declared_layers = {layer.dxf.name for layer in doc.layers}
    text_values = {entity.dxf.text for entity in msp if entity.dxftype() == "TEXT"}

    missing_layers = [layer for layer in REQUIRED_LAYERS if layer not in declared_layers]
    missing_tags = [tag for tag in REQUIRED_TAGS if tag not in text_values]

    return {
        "success": not missing_layers and not missing_tags,
        "file": str(path),
        "bytes": path.stat().st_size,
        "entity_count": len(msp),
        "required_layers": REQUIRED_LAYERS,
        "missing_layers": missing_layers,
        "required_tags": REQUIRED_TAGS,
        "missing_tags": missing_tags,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Verify generated high-end kitchen DXF content.")
    parser.add_argument("--file", type=Path, default=DEFAULT_DXF, help="DXF file to verify.")
    args = parser.parse_args()

    result = verify_dxf(args.file)
    print(json.dumps(result, indent=2))
    if not result["success"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
