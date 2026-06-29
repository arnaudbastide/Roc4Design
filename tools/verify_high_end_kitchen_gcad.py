"""Verify the canonical high-end kitchen plan against the configured CAD COM target."""

from __future__ import annotations

import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUTOCAD_MCP_SRC = ROOT / "src" / "mcp" / "roc4design-autocad-mcp" / "src"
OUTPUT = ROOT / "src" / "mcp" / "roc4design-autocad-mcp" / "output"

sys.path.insert(0, str(AUTOCAD_MCP_SRC))

from roc4design_autocad_mcp.cad_controller import CADController  # noqa: E402
from roc4design_autocad_mcp.config import load_config  # noqa: E402
from roc4design_autocad_mcp.kitchen_layout import (  # noqa: E402
    high_end_kitchen_default_request,
    plan_kitchen_layout,
)


def execute_operation(controller: CADController, operation: dict) -> dict:
    tool = operation["tool"]
    if tool == "draw_rectangle":
        return controller.draw_rectangle(
            tuple(operation["corner1"]),
            tuple(operation["corner2"]),
            operation.get("layer"),
            operation.get("color"),
            operation.get("lineweight"),
        )
    if tool == "draw_text":
        return controller.draw_text(
            tuple(operation["position"]),
            operation["text"],
            operation.get("height", 0.22),
            operation.get("rotation", 0.0),
            operation.get("layer"),
            operation.get("color"),
        )
    if tool == "add_dimension":
        return controller.add_dimension(
            tuple(operation["start"]),
            tuple(operation["end"]),
            tuple(operation["text_position"]),
            operation.get("layer"),
            operation.get("color"),
        )
    return {"success": False, "error": f"Unsupported operation: {tool}"}


def main() -> None:
    config = load_config()
    controller = CADController(config.cad)
    plan = plan_kitchen_layout(high_end_kitchen_default_request())
    if not plan.get("success"):
        print(json.dumps({"success": False, "stage": "plan", "errors": plan.get("errors")}, indent=2))
        raise SystemExit(1)

    if not controller.start():
        print(json.dumps({"success": False, "stage": "connect", "cad_type": config.cad.type}, indent=2))
        raise SystemExit(1)

    failures = []
    results = []
    for operation in plan["operations"]:
        result = execute_operation(controller, operation)
        results.append(result)
        if not result.get("success"):
            failures.append({"operation": operation, "result": result})

    OUTPUT.mkdir(parents=True, exist_ok=True)
    save_result = controller.save_drawing(str(OUTPUT / "ROC4T-KITCHEN-HIGH-END-001.dwg"))
    if not save_result.get("success"):
        failures.append({"operation": {"tool": "save_drawing"}, "result": save_result})

    print(
        json.dumps(
            {
                "success": not failures,
                "cad_type": config.cad.type,
                "operations_planned": len(plan["operations"]),
                "operations_executed": len(results) - len([item for item in results if not item.get("success")]),
                "failures": failures,
                "save_dwg": save_result,
            },
            indent=2,
        )
    )

    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
