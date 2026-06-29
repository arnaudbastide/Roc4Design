# Kitchen Workflow Verification

## Scope

This verifies the current high-end commercial kitchen milestone:

- Canonical 35 ft x 45 ft kitchen planner data.
- 2D CAD/DXF output path (the actual deliverable — no CAD application or license required).
- IFC export/query path (same — no CAD application or license required).
- Synchronized 3D viewer payload.
- GstarCAD live-COM status (historical only — GstarCAD has since been uninstalled; see below).

## Verified Commands

Run from the repository root unless noted.

```powershell
python .\tools\export_kitchen_viewer_spec.py
python .\tools\verify_kitchen_viewer_spec.py
python .\tools\export_high_end_kitchen_dxf.py
python .\tools\verify_high_end_kitchen_dxf.py
```

Run from `src/mcp/roc4design-autocad-mcp`:

```powershell
python -m pytest tests
python -m compileall src\roc4design_autocad_mcp
```

Run from the repository root:

```powershell
node --check .\src\viewer\kitchen_3d_viewer\kitchen-viewer.js
node --check .\src\viewer\kitchen_3d_viewer\kitchen-spec.js
```

## Current Evidence

- AutoCAD MCP tests pass: 19 passed, 1 warning.
- MCP package compile check passes.
- Viewer JavaScript syntax check passes.
- Generated viewer spec syntax check passes.
- `tools/verify_kitchen_viewer_spec.py` checks that `kitchen-spec.js` exactly matches the canonical Python planner output.
- `tools/export_high_end_kitchen_dxf.py` writes `src/mcp/roc4design-autocad-mcp/output/ROC4T-KITCHEN-HIGH-END-001.dxf`.
- `tools/verify_high_end_kitchen_dxf.py` checks the generated DXF for canonical Roc4Design layers and kitchen tags. Current DXF verification passes with 56 entities and no missing required layers or tags.
- `audit_kitchen_layout_2d` checks the canonical planner output for required layers, zones, equipment, fixtures, and operation count.
- `list_entities` and `get_entity_properties` read from in-session `DrawingState`, not a live CAD query — they work with no CAD application installed at all.
- `export_high_end_kitchen_ifc` writes an IFC file when `ifcopenshell` is installed. Verified directly: 17 products (7 zones, 5 equipment, 5 fixtures).
- `query_kitchen_ifc` round-trips generated IFC proxy elements by category. Verified directly: equipment category returns 5 elements.

**Caveat**: the four bullets above describing `server.py` functions (`audit_kitchen_layout_2d`, `list_entities`, `get_entity_properties`) are code-reviewed, not run-verified — `server.py` cannot currently be imported on this machine. See "Python Version Blocker" below.

## Required DXF Layers

- `ROC4T-WALL`
- `ROC4T-FURN`
- `ROC4T-MEP-HVAC`
- `ROC4T-MEP-PLUMB`
- `ROC4T-DIMS`

## Required DXF Tags

- `EQ-RANGE-01`
- `EQ-RANGE-02`
- `EQ-GRIDDLE-01`
- `EQ-COMBI-01`
- `EQ-DISH-01`
- `EQ-SINK-01`
- `EQ-SHELF-01`
- `FX-ISLAND-01`
- `FX-ISLAND-02`

## GstarCAD Live-COM Status (historical — GstarCAD has been uninstalled)

GstarCAD was previously installed at `C:\Program Files\Gstarsoft\GstarCAD2024\gcad.exe`. The local window reported `GstarCAD 2024 Standard(Expired)` — almost certainly because this machine's system clock is set to 2026, which also broke `pip`'s TLS certificate validation the same way.

The controller's `CAD_APP_IDS["GCAD"]` fallback tries multiple known ProgID variants (`Gcad.Application`, `Gcad.Application.23`, `GStarCAD.Application`, `GStarCAD.Application.23`, `GcadVba.GcadApplication`, `GcadVba.GcadApplication.23`) — useful if a properly licensed GstarCAD is ever connected again, but all six resolved to the same broken CLSID on this machine.

Before uninstalling, live drawing was fully verified: 56/56 operations executed correctly (walls, fixtures, tagged equipment, MEP markers, text, dimensions, all drawn in-session). Only `save_drawing`/`SaveAs` was blocked, by the expired license. **GstarCAD is no longer installed and is not required for any current deliverable** — the DXF and IFC export paths below replaced it as the actual 2D/BIM output, with no CAD application or license dependency at all.

## IFC Status

`ifcopenshell` is installed and importable locally:

```text
0.8.4.post1
```

The canonical kitchen IFC export has been verified:

- Output: `src/mcp/roc4design-autocad-mcp/output/ROC4T-KITCHEN-HIGH-END-001.ifc`
- Products: 17
- Zones: 7
- Equipment: 5
- Fixtures: 5
- `query_kitchen_ifc(..., "equipment")` returns 5 equipment elements.

FreeCAD is installed locally and can be used as the no-cost IFC review tool:

```text
C:\Program Files\FreeCAD 1.1\bin\freecad.exe
```

Install IFC support in a fresh environment with:

```powershell
pip install -e .[bim]
```

## Python Version Blocker — RESOLVED

`pyproject.toml` declares `requires-python = ">=3.10"` because the `mcp` SDK package only publishes for Python 3.10+. This machine originally had only Python 3.9 installed, so `server.py` could never be imported.

**Fixed**: installed Python 3.12.10 via `winget install --id Python.Python.3.12 --source winget` (pinning `--source winget` was required — the default multi-source search also queries `msstore`, which fails with a TLS certificate error, the same system-clock-related issue that affected `pip` earlier). Created a dedicated venv at `src/mcp/roc4design-autocad-mcp/.venv` and installed with `pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -e ".[dev,bim]"`.

Two real bugs surfaced once `server.py` could finally be imported and run for the first time:
1. `pyproject.toml` had an invalid classifier (`"Topic :: Scientific/Engineering :: Computer Aided Design"` is not a real PyPI trove classifier) that made `hatchling` refuse to build the editable install. Fixed to `"Topic :: Scientific/Engineering"`.
2. `server.py`'s `export_high_end_kitchen_dxf` called `write_operations_to_dxf` without importing it from `dxf_export` — a `NameError` that no test had ever caught, because no test imports `server.py`. Fixed; also added `ezdxf` as a declared base dependency (it had only ever been installed ad hoc, never declared).

**Verified for real, through `server.py` itself** (not bypassing it via direct module imports, as everything before this was): `audit_kitchen_layout_2d`, `list_entities`, `export_high_end_kitchen_ifc` (17 products), and `export_high_end_kitchen_dxf` (56/56 operations) all work correctly via `CADService()`. `pytest tests/` passes 19/19 under Python 3.12 too, with no leftover `asyncio_mode` config warning (that warning was itself a symptom of `pytest-asyncio` never being installable under 3.9).

## Current Milestone Status

The schematic CAD, IFC, and 3D review pipeline is implemented and repeatably verified through generated DXF, generated IFC, and generated Three.js viewer spec — all license-free and requiring no CAD application. Live GstarCAD COM drawing was verified in-session at 56/56 operations before GstarCAD was uninstalled (license unusable); it is no longer part of the active pipeline. The MCP server wrapper (`server.py`) itself remains unverified pending a Python 3.10+ environment.
