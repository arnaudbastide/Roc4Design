"""Write the high-end kitchen plan straight to a DXF file. No CAD application or license required."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUTOCAD_MCP_SRC = ROOT / "src" / "mcp" / "roc4design-autocad-mcp" / "src"
OUTPUT = ROOT / "src" / "mcp" / "roc4design-autocad-mcp" / "output"

sys.path.insert(0, str(AUTOCAD_MCP_SRC))

from roc4design_autocad_mcp.dxf_export import write_operations_to_dxf  # noqa: E402
from roc4design_autocad_mcp.kitchen_layout import (  # noqa: E402
    high_end_kitchen_default_request,
    plan_kitchen_layout,
)


def main() -> None:
    parser = argparse.ArgumentParser(description="Export the high-end kitchen brief to a DXF file.")
    parser.add_argument("--project-id", default="ROC4T-KITCHEN-HIGH-END-001")
    parser.add_argument("--output", type=Path, default=OUTPUT / "ROC4T-KITCHEN-HIGH-END-001.dxf")
    args = parser.parse_args()

    plan = plan_kitchen_layout(high_end_kitchen_default_request(args.project_id))
    if not plan.get("success"):
        print(json.dumps({"success": False, "stage": "plan", "errors": plan.get("errors")}, indent=2))
        raise SystemExit(1)

    result = write_operations_to_dxf(plan["operations"], str(args.output))
    print(json.dumps(result, indent=2, default=str))

    if not result.get("success"):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
