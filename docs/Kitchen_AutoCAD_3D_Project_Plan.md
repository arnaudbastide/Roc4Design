# Kitchen AutoCAD and 3D View Project Plan

> **Roadmap, not status.** This is the original vision/plan document. For what's actually built and verified right now, see [Kitchen_Workflow_Verification.md](Kitchen_Workflow_Verification.md).

## Objective

Create a full AutoCAD-to-3D workflow for a high-end commercial kitchen. The final workflow should produce a measured 2D AutoCAD plan, structured metadata for BIM/IFC, and a 3D review scene suitable for kitchen coordination and archviz.

## Design Brief

This is a high-end commercial kitchen with a professional, industrial-grade layout designed for high-volume efficiency.

### Materials and Colors

| Element | Specification |
|---|---|
| Worktops, counters, appliances | Brushed stainless steel |
| Ventilation hood | Massive stainless steel commercial hood |
| Floor | 12 in x 12 in matte gray ceramic tile with dark grout |
| Walls | White and light gray hygienic wall panels |
| Overall feel | Bright, sterile, professional, industrial |

### Estimated Dimensions

| Item | Imperial | Metric |
|---|---:|---:|
| Total area | 35 ft wide x 45 ft deep | 10.67 m wide x 13.72 m deep |
| Counter height | 36 in | 0.91 m |
| Counter depth | 30 in | 0.76 m |
| Aisle width | 4 ft to 5 ft | 1.22 m to 1.52 m |
| Exhaust hood | 15 ft long x 4 ft deep | 4.57 m long x 1.22 m deep |

## Layout Zones

| Zone | Location | CAD/BIM Content |
|---|---|---|
| Central cooking line | Back wall / primary production wall | Ranges, griddle, stacked combi oven, exhaust hood |
| Prep islands | Center of room | Multi-tiered stainless prep islands for assembly and plating |
| Warewashing station | Right side | Hood-type dishwasher, sink/drainage area, clean/dirty flow notes |
| Cold/dry storage | Background / perimeter | Shelving, refrigeration, dry storage racks |
| Circulation aisles | Between production zones | 4 ft to 5 ft clear aisles |

## Key Appliances

| Tag | Appliance | Quantity | Notes |
|---|---|---:|---|
| `EQ-RANGE-01` | 6-burner gas range | 2 | Under main hood |
| `EQ-GRIDDLE-01` | Flat-top griddle | 1 | Under main hood |
| `EQ-COMBI-01` | Stacked combi oven with glass doors | 1 | Adjacent to cooking line |
| `EQ-DISH-01` | Industrial hood-type dishwasher | 1 | Warewashing zone |
| `EQ-SINK-01` | Commercial sink | 1+ | Coordinate with plumbing |
| `EQ-SHELF-01` | Cold/dry storage shelving | Multiple | Perimeter/background |

## AutoCAD Deliverables

1. Existing-condition base plan.
2. Equipment layout plan with tags.
3. Reflected ceiling/MEP coordination diagram.
4. Floor drain and trench drain diagram.
5. Material/finish annotations.
6. Export-ready DXF/DWG and PDF.

### Current CAD Output

The canonical high-end kitchen plan can be exported headlessly to DXF from the repository root:

```powershell
python .\tools\export_high_end_kitchen_dxf.py
```

This writes:

```text
src/mcp/roc4design-autocad-mcp/output/ROC4T-KITCHEN-HIGH-END-001.dxf
```

Generated CAD outputs are intentionally ignored by Git; regenerate them from the planner when needed.

Live GstarCAD generation is implemented through `generate_high_end_kitchen_2d`, but current local verification is blocked by the installed `GstarCAD 2024 Standard(Expired)` COM state. The controller now tries the known GstarCAD ProgID variants and reports the attempted COM IDs when connection fails.

## CAD Layer Strategy

| Layer | Content |
|---|---|
| `ROC4T-WALL` | Walls and openings |
| `ROC4T-FURN` | Counters, islands, equipment blocks |
| `ROC4T-DIMS` | Dimensions and clearance strings |
| `ROC4T-TEXT` | Labels, equipment tags, notes |
| `ROC4T-HATCH` | Floor tile hatch and material zones |
| `ROC4T-TITLE` | Title block |
| `ROC4T-MEP-HVAC` | Hood, duct zones, ceiling grilles |
| `ROC4T-MEP-PLUMB` | Sinks, drains, dishwasher plumbing |
| `ROC4T-MEP-ELEC` | Outlets, appliance power points |
| `ROC4T-MEP-FIRE` | Suppression, alarms, detectors |

## 3D View Workflow

### Free / Low-Cost Review Stack

| Tool | Role |
|---|---|
| Blender + blender-mcp | AI-assisted scene setup, asset placement, material tagging |
| BlenderBIM / FreeCAD | IFC fallback and open BIM review/editing |
| BIMvision / BR3DViewer | IFC/model review |
| DWG FastView | DWG/DXF review |

### 3D Scene Requirements

- Model room shell at 35 ft x 45 ft.
- Add stainless cooking line, prep islands, warewashing zone, and storage shelving.
- Add 12 in x 12 in gray tile floor material.
- Add white/light gray wall panels.
- Add stainless hood volume: 15 ft x 4 ft.
- Add ceiling grid with lights, diffusers, sensors, and fire devices.
- Tag all major equipment using the same IDs as AutoCAD.
- Export or review through IFC/glTF where possible.

### Current Prototype

A static browser-based Three.js prototype is available at:

```text
src/viewer/kitchen_3d_viewer/index.html
```

It visualizes the current high-end kitchen brief with the room shell, tile grid, stainless equipment, prep islands, warewashing zone, storage shelving, ceiling services, and the 15 ft x 4 ft exhaust hood. The equipment positions and room dimensions are synchronized to the AutoCAD MCP planner export shape through:

```text
src/viewer/kitchen_3d_viewer/kitchen-spec.js
```

The MCP server exposes `plan_high_end_kitchen_2d` for the AutoCAD operation plan, `generate_high_end_kitchen_2d` for live CAD generation from the same canonical high-end defaults, and `export_high_end_kitchen_viewer_spec` for the matching 3D viewer payload.

## Asset Sourcing

Use asset libraries for realistic appliances and props:

| Source | Best Use |
|---|---|
| Evermotion / Archmodels | High-quality appliances, cabinets, sinks, stoves |
| Chaos Cosmos | Fast archviz furniture, fixtures, and props |
| Sketchfab | Specific appliances and decor models |
| Blender Market / Superhive | Cutlery, utensils, containers, small appliances |
| Chocofur-style collections | Broad interior and kitchen dressing assets |

## Automation Roadmap

### Step 1: AutoCAD Schematic Generator

Implemented planner/generator entry points:

- `plan_kitchen_layout_2d` for measured kitchen inputs
- `generate_kitchen_layout_2d` for measured kitchen live CAD generation
- `plan_high_end_kitchen_2d` for the canonical brief
- `generate_high_end_kitchen_2d` for canonical live CAD generation
- `export_high_end_kitchen_viewer_spec` for 3D viewer data

Canonical brief values:

```json
{
  "project_id": "ROC4T-KITCHEN-HIGH-END-001",
  "room_width_m": 10.67,
  "room_length_m": 13.72,
  "aisle_width_m": 1.37,
  "counter_depth_m": 0.76,
  "counter_height_m": 0.91,
  "hood_length_m": 4.57,
  "hood_depth_m": 1.22,
  "floor_tile_size_m": 0.305
}
```

### Step 2: Metadata Export

Produce JSON metadata for:

- zones
- equipment
- materials
- MEP points
- clearances
- unresolved survey assumptions

### Step 3: 3D Review Package

Generate or assemble:

- schematic 3D room shell
- equipment placeholder boxes
- material assignments
- IFC/glTF export target
- viewer checklist

Current implementation: the static Three.js viewer uses the same project dimensions, equipment IDs, equipment positions, fixture geometry, material labels, and export targets returned by `kitchen_layout_to_viewer_spec()`. Regenerate the viewer payload with:

```powershell
python .\tools\export_kitchen_viewer_spec.py
```

### IFC Export

The AutoCAD MCP package includes an optional IFC export/query path backed by `ifcopenshell`:

- `export_high_end_kitchen_ifc`
- `query_kitchen_ifc`

The current exporter writes zone, equipment, and fixture proxies for coordination review. On this machine, the generated IFC round-trips with 17 products: 7 zones, 5 equipment items, and 5 fixtures.

## Open Assumptions

- Exact door locations are not yet measured.
- Exact appliance manufacturer/model dimensions are not yet confirmed.
- Hood fire suppression details are not yet confirmed.
- Plumbing/electrical loads are not yet confirmed.
- The current generator should create a schematic coordination plan, not a permit-ready drawing.
