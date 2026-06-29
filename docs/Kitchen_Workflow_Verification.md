# Kitchen Workflow Verification

> **Current verified status, not the original plan.** For the original vision/roadmap this implements, see [Kitchen_AutoCAD_3D_Project_Plan.md](Kitchen_AutoCAD_3D_Project_Plan.md). This document tracks what's actually built and verified as of the latest update — update it whenever verification status changes, rather than letting it silently drift from reality.

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

Run from `src/mcp/roc4design-autocad-mcp` (using the `.venv` — Python 3.12, the canonical environment per `pyproject.toml`'s `requires-python = ">=3.10"`; Python 3.9 is no longer tracked):

```powershell
.\.venv\Scripts\python.exe -m pytest tests
.\.venv\Scripts\python.exe -m compileall src\roc4design_autocad_mcp
```

Run from the repository root:

```powershell
node --check .\src\viewer\kitchen_3d_viewer\kitchen-viewer.js
node --check .\src\viewer\kitchen_3d_viewer\kitchen-spec.js
```

## Current Evidence

- AutoCAD MCP tests pass: 25 passed (Python 3.12, `.venv`), no warnings.
- MCP package compile check passes.
- Viewer JavaScript syntax check passes.
- Generated viewer spec syntax check passes.
- `tools/verify_kitchen_viewer_spec.py` checks that `kitchen-spec.js` exactly matches the canonical Python planner output.
- `tools/export_high_end_kitchen_dxf.py` writes `src/mcp/roc4design-autocad-mcp/output/ROC4T-KITCHEN-HIGH-END-001.dxf`.
- `tools/verify_high_end_kitchen_dxf.py` checks the generated DXF for canonical Roc4Design layers and kitchen tags. Current DXF verification passes with 56 entities and no missing required layers or tags.
- `audit_kitchen_layout_2d`, `list_entities`, `export_high_end_kitchen_ifc`, and `export_high_end_kitchen_dxf` have all been **run-verified through `server.py`/`CADService()` itself** (not bypassed via direct module imports) — see "Python Version Blocker" below.
- `export_high_end_kitchen_ifc` writes an IFC file with real geometry. Verified: 17 products (7 zones, 5 equipment, 5 fixtures), each with a correct `ObjectPlacement`/`Representation` matching the planner's coordinates exactly.
- `query_kitchen_ifc` round-trips generated IFC proxy elements by category. Verified: equipment category returns 5 elements.
- `tests/test_dxf_export.py` (new) covers rectangle→polyline, text insert/value, real dimension entities, the signed-offset helper, failure isolation, and a round-trip check.

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

`ifcopenshell` is installed and importable locally (0.8.5 in the `.venv`).

The canonical kitchen IFC export has been verified:

- Output: `src/mcp/roc4design-autocad-mcp/output/ROC4T-KITCHEN-HIGH-END-001.ifc`
- Products: 17 (7 zones, 5 equipment, 5 fixtures)
- `query_kitchen_ifc(..., "equipment")` returns 5 equipment elements.
- **Geometry**: every product now has a real `ObjectPlacement` and `Representation` (an extruded `IfcRectangleProfileDef` box), built via `ifcopenshell.api.context`/`geometry` helpers using the same x/y/width/depth/height already in the planner output. Verified by computing each shape's world-space bounding box with `ifcopenshell.geom` (`use-world-coords=True`) and asserting it matches the plan's coordinates exactly — e.g. `EQ-RANGE-01` resolves to (3.05, 13.01)–(3.95, 13.77), matching `plan_kitchen_layout()`'s output exactly. Zones get a thin 0.05m nominal slab since the planner only gives them a footprint, not a height. The file is no longer visually empty in a BIM viewer.

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

**Verified for real, through `server.py` itself** (not bypassing it via direct module imports, as everything before this was): `audit_kitchen_layout_2d`, `list_entities`, `export_high_end_kitchen_ifc` (17 products), and `export_high_end_kitchen_dxf` (56/56 operations) all work correctly via `CADService()`. `pytest tests/` passes (25/25 as of the latest test additions) under Python 3.12 too, with no leftover `asyncio_mode` config warning (that warning was itself a symptom of `pytest-asyncio` never being installable under 3.9).

## 3D Viewer — real bug found and fixed

The viewer was **silently completely broken** before this fix — every prior "the scene reads from kitchen-spec.js" claim was true at the code level but had never actually been confirmed to render, because nothing had opened it in a real (isolated) browser and checked the console.

Root cause: `kitchen-viewer.js` imports `OrbitControls` from the Three.js examples CDN bundle, which internally does `import * as THREE from "three"` — a **bare module specifier**. Bare specifiers only resolve via a bundler or an explicit `<script type="importmap">`; plain `<script type="module">` in a browser cannot resolve `"three"` on its own. The browser console showed:

```
Uncaught TypeError: Failed to resolve module specifier "three". Relative references must start with either "/", "./", or "../".
```

That error aborts the entire module's execution before any scene-building code runs — so the canvas never painted anything. It looked deceptively like it was "working" in screenshots because `index.html`'s plain CSS (`body { background: #f3f4f6 }`) happens to be nearly the same color as the intended `scene.background`, and the static HTML overlay (info panel, "drag to orbit" hint) rendered fine since neither depends on the JS.

**Fix**: added an import map to `index.html` mapping `"three"` to the same `unpkg.com/three@0.164.1` URL already used directly elsewhere:
```html
<script type="importmap">
  { "imports": { "three": "https://unpkg.com/three@0.164.1/build/three.module.js" } }
</script>
```

**Verified properly this time** — isolated headless Chrome (`--user-data-dir` pointing at a fresh profile; earlier attempts were accidentally being routed into the user's already-running Chrome instance via its single-instance lock, which produced misleading/inconsistent results). Confirmed via console capture: zero `Uncaught`/`TypeError` errors after the fix. Confirmed via screenshot: real 3D geometry renders — floor, prep islands, ceiling LED grid, HVAC grilles, dishwasher hood, all in the correct stainless/blue/dark-steel colors matching the legend.

A follow-up top-down camera test to double-check island/shelving proportions was inconclusive (positioning the camera nearly straight overhead without adjusting `camera.up` hits OrbitControls' gimbal-lock-like degenerate case at the pole, making screen-space axis orientation unreliable) — not treated as a finding either way. The default oblique camera angle is the reliable evidence and looks correct.

## FreeCAD Visual Verification — done

Both the DXF and IFC outputs were opened in FreeCAD (`C:\Program Files\FreeCAD 1.1\bin\`) and confirmed correct, independently of all the Python-side checks above:

- **DXF**: `freecadcmd.exe`'s own importer reported exact entity counts matching the planner's operations — 24 `LWPOLYLINE` (1 wall + 3 furniture runs + 5 fixtures + 5 equipment + 1 hood + 3 floor drains + 6 ceiling grilles), 30 `TEXT`, 2 `DIMENSION`. A GUI screenshot (top view) showed the room outline with equipment/fixtures in magenta (`ROC4T-FURN`, AutoCAD color 6), ceiling grilles/hood in cyan (`ROC4T-MEP-HVAC`, color 4), and floor drains in green (`ROC4T-MEP-PLUMB`, color 3) — exactly matching the layers' assigned colors in `kitchen_layout.py`. One harmless note: FreeCAD's DXF importer doesn't support the `SOLID` entity type, used once for a dimension arrowhead — a FreeCAD limitation, not a file defect.
- **IFC**: FreeCAD 1.1's native IFC workflow (`nativeifc.ifc_tools.create_document`, not the older `importIFC`/`Arch` path) imported all 17 products. Bounding boxes read back from FreeCAD's own `ifcopenshell`-based importer matched the planner's coordinates to the millimeter — e.g. `FX-ISLAND-01`: (4160, 4660, 0)–(6510, 5480, 910)mm = exactly 4.16, 4.66–6.51, 5.48m, 0.91m tall. This is a second, fully independent confirmation of the geometry fix (the first being `ifcopenshell.geom` bounding-box checks done directly in Python). A GUI screenshot (top view) showed the same recognizable layout: perimeter zones, two islands centered in the aisle, equipment along the back wall, warewashing area at the bottom-right.

(Side note from this check: capturing a screenshot of a specific GUI window requires targeting that window's handle via `GetWindowRect`, not a full-desktop capture — a full-desktop screenshot during this work briefly captured an unrelated foreground window instead of FreeCAD.)

## Current Milestone Status

The schematic CAD, IFC, and 3D review pipeline is implemented and repeatably verified end-to-end through generated DXF (with real polylines/dimensions), generated IFC (with real geometry, not just tagged proxies), and the Three.js viewer (now confirmed actually rendering, not just structurally correct) — all license-free and requiring no CAD application, and now visually confirmed in FreeCAD on top of the programmatic checks. The MCP server wrapper (`server.py`) itself is now run-verified under Python 3.12, including the four previously-unverified tools. Live GstarCAD COM drawing was verified in-session at 56/56 operations before GstarCAD was uninstalled (license unusable); it is no longer part of the active pipeline.

**Hardening added**: a CI workflow per repo (`src/mcp/roc4design-autocad-mcp/.github/workflows/ci.yml` running the Python test suite plus a `server.py` import smoke test across Python 3.10–3.12 on Windows; `.github/workflows/kitchen-viewer-ci.yml` running a headless-browser smoke test that fails the build on any console error — verified to both pass on current code and correctly fail when the import-map bug was temporarily reintroduced), a `.python-version` pin (3.12), and updated README setup instructions.

**Remaining open item**: deciding whether to add a Blender pass for the 3D view (the IFC now has real geometry, making a Bonsai/BlenderBIM import viable) — not started, no decision made yet.
