# Use Case 2: Commercial Kitchen Existing-Condition Survey

## Summary

Use site photos of a commercial kitchen to prepare an existing-condition CAD/BIM brief. The first goal is not full automation from images alone. The goal is to convert visual evidence into a structured survey checklist, preliminary layout assumptions, and CAD/BIM object requirements.

## Visual Observations From Reference Photos

- Narrow galley-style commercial kitchen.
- Main circulation aisle runs through the center.
- Stainless steel worktops and base cabinets on both sides.
- Cooking line with heavy stainless extraction hood.
- Prep/service counters opposite cooking equipment.
- Suspended ceiling with lighting panels, supply/return diffusers, sensors, and sprinklers/detectors.
- Floor tile finish with linear trench drains and smaller floor drains.
- Wall-mounted shelves, small appliances, mixers, bins, sinks, and service equipment.
- Likely MEP coordination zones:
  - Exhaust ducting above cooking line
  - Supply/return air grilles in suspended ceiling
  - Plumbing at sinks and floor drains
  - Electrical outlets and appliance feeds along counters
  - Fire/life-safety devices in ceiling

## Missing Data Required Before Production Drawing

| Data | Required For |
|---|---|
| Overall room length, width, and ceiling height | Base plan and sections |
| Door/opening locations and widths | Circulation and egress |
| Equipment list with dimensions | Accurate plan blocks/families |
| Hood dimensions and duct route | MEP coordination |
| Sink, drain, and water point locations | Plumbing layout |
| Electrical panel/outlet/appliance load data | Electrical layout |
| Floor drain invert/slope requirements | Drainage coordination |
| Wall and ceiling material specification | Finish schedule |
| Fire suppression system details | Life-safety coordination |

## CAD Layer Requirements

Use the Roc4t layer convention:

| Layer | Content |
|---|---|
| `ROC4T-WALL` | Existing walls |
| `ROC4T-DOOR` | Doors/openings |
| `ROC4T-FURN` | Kitchen equipment, counters, shelves, bins |
| `ROC4T-DIMS` | Survey dimensions |
| `ROC4T-TEXT` | Labels, notes, equipment tags |
| `ROC4T-HATCH` | Floor/wall finishes |
| `ROC4T-TITLE` | Title block content |

Proposed MEP extension layers:

| Layer | Content |
|---|---|
| `ROC4T-MEP-HVAC` | Diffusers, grilles, exhaust hoods, ducts |
| `ROC4T-MEP-PLUMB` | Sinks, drains, water points |
| `ROC4T-MEP-ELEC` | Outlets, panels, appliance feeds |
| `ROC4T-MEP-FIRE` | Fire suppression, sprinklers, detectors |

## Initial CAD Output

The first deliverable should be a measured existing-condition plan:

- Room boundary
- Central aisle
- Continuous counter/equipment runs on both sides
- Cooking hood zone
- Prep/service counters
- Sink and drain locations
- Ceiling device grid
- Equipment tags
- Photo reference markers
- Survey uncertainty notes

## Automation Scope

### Phase 1: Manual-Assisted CAD

Create a tool that accepts measured inputs and generates a schematic kitchen plan:

```json
{
  "request_type": "commercial_kitchen_existing_condition",
  "project_id": "ROC4T-KITCHEN-001",
  "parameters": {
    "room_length_m": 12.0,
    "room_width_m": 3.2,
    "aisle_width_m": 1.2,
    "left_run_depth_m": 0.8,
    "right_run_depth_m": 0.75,
    "has_extraction_hood": true,
    "floor_drains": 2,
    "ceiling_grid": true
  }
}
```

### Phase 2: BIM/IFC

Create BIM placeholders for:

- Cooking equipment
- Stainless worktops
- Sinks
- Shelving
- Exhaust hood
- Floor drains
- Ceiling diffusers/lights
- Fire/life-safety devices

### Phase 3: Review

Use BIMvision, Autodesk Viewer / APS Viewer, or the planned local IFC viewer to review:

- Clearances
- Hood/equipment coordination
- Drain locations
- Ceiling service conflicts
- Maintenance access

## Archviz Asset Sourcing

For kitchen visualization, use asset libraries for geometry and materials rather than expecting MCP code repositories to provide finished appliance models.

### Best Sources

| Source | Best Use |
|---|---|
| Evermotion / Archmodels | Polished kitchen furniture, refrigerators, ovens, sinks, stoves, cabinets |
| Chaos Cosmos | Fast archviz scenes with ready-to-use furniture, fixtures, and props |
| Sketchfab | Specific kitchen appliances, decor packs, and free/low-cost model searches |
| Blender Market / Superhive | Targeted prop packs such as cutlery, utensils, containers, and small appliances |
| Chocofur-style interior collections | Broad Blender interior libraries for kitchen and general archviz dressing |

### Prioritized Asset List

Start with the main fixed assets:

- Refrigerator
- Oven
- Stove/cooktop
- Dishwasher
- Sink
- Cabinets
- Kitchen islands
- Countertops

Then add small scene props:

- Blender
- Toaster
- Jars
- Cups
- Utensils
- Cutting boards
- Bottles
- Containers

### Practical Recommendation

Use Evermotion or Chaos Cosmos for large furniture and appliance pieces, then fill detail with Blender Market / Superhive or Sketchfab prop packs. This gives a good balance of quality, speed, and realism for kitchen archviz. Blender MCP can then be used as the control layer for importing, placing, tagging, and adjusting these assets.

## Implementation Notes

- Photos alone are not enough for dimensionally reliable CAD.
- The automation should request missing measurements rather than infer precise geometry.
- The first useful tool is a measured-input layout generator, not pure image recognition.
- Add photo markers to the CAD plan so reviewers can trace each observation back to field evidence.
