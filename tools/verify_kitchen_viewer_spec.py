"""Verify that kitchen-spec.js matches the canonical Python planner output."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUTOCAD_MCP_SRC = ROOT / "src" / "mcp" / "roc4design-autocad-mcp" / "src"
DEFAULT_SPEC = ROOT / "src" / "viewer" / "kitchen_3d_viewer" / "kitchen-spec.js"

sys.path.insert(0, str(AUTOCAD_MCP_SRC))

from roc4design_autocad_mcp.kitchen_layout import (  # noqa: E402
    high_end_kitchen_default_request,
    kitchen_layout_to_viewer_spec,
    plan_kitchen_layout,
)


PREFIX = "export const kitchenSpec = "
SUFFIX = ";"


def load_spec_module(path: Path) -> dict:
    text = path.read_text(encoding="utf-8").strip()
    if not text.startswith(PREFIX):
        raise ValueError(f"{path} does not start with expected ES module export")
    payload = text[len(PREFIX) :]
    if payload.endswith(SUFFIX):
        payload = payload[: -len(SUFFIX)]
    return json.loads(payload)


def expected_spec(project_id: str) -> dict:
    request = high_end_kitchen_default_request(project_id)
    return kitchen_layout_to_viewer_spec(plan_kitchen_layout(request))


def main() -> None:
    parser = argparse.ArgumentParser(description="Verify kitchen-spec.js against planner output.")
    parser.add_argument("--file", type=Path, default=DEFAULT_SPEC, help="Viewer spec ES module path.")
    parser.add_argument(
        "--project-id",
        default="ROC4T-KITCHEN-HIGH-END-001",
        help="Project identifier for the canonical planner request.",
    )
    args = parser.parse_args()

    actual = load_spec_module(args.file)
    expected = expected_spec(args.project_id)
    result = {
        "success": actual == expected,
        "file": str(args.file),
        "project_id": args.project_id,
        "equipment_count": len(actual.get("equipment", [])),
        "fixture_count": len(actual.get("fixtures", [])),
    }
    if actual != expected:
        result["error"] = "Viewer spec does not match planner output"
        result["actual_keys"] = sorted(actual.keys())
        result["expected_keys"] = sorted(expected.keys())

    print(json.dumps(result, indent=2))
    if not result["success"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
