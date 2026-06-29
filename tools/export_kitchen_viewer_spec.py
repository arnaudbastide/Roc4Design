"""Generate the kitchen 3D viewer spec from the AutoCAD MCP planner."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUTOCAD_MCP_SRC = ROOT / "src" / "mcp" / "roc4design-autocad-mcp" / "src"
VIEWER_SPEC = ROOT / "src" / "viewer" / "kitchen_3d_viewer" / "kitchen-spec.js"

sys.path.insert(0, str(AUTOCAD_MCP_SRC))

from roc4design_autocad_mcp.kitchen_layout import (  # noqa: E402
    high_end_kitchen_default_request,
    kitchen_layout_to_viewer_spec,
    plan_kitchen_layout,
)


def build_spec(project_id: str) -> dict:
    request = high_end_kitchen_default_request(project_id)
    plan = plan_kitchen_layout(request)
    spec = kitchen_layout_to_viewer_spec(plan)
    if not spec.get("success"):
        raise RuntimeError(f"Kitchen viewer spec generation failed: {spec.get('errors')}")
    return spec


def write_es_module(spec: dict, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(spec, indent=2)
    output_path.write_text(f"export const kitchenSpec = {payload};\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Write src/viewer/kitchen_3d_viewer/kitchen-spec.js from the kitchen planner."
    )
    parser.add_argument(
        "--project-id",
        default="ROC4T-KITCHEN-HIGH-END-001",
        help="Project identifier to embed in the generated viewer spec.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=VIEWER_SPEC,
        help="Output ES module path.",
    )
    args = parser.parse_args()

    write_es_module(build_spec(args.project_id), args.output)
    print(f"Wrote {args.output}")


if __name__ == "__main__":
    main()
