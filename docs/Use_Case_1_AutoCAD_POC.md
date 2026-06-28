# Use Case 1: AutoCAD POC Specification
## Standardized 2D Office Layout Plan Generation

> **Phase**: 1 (Weeks 1-2) | **Priority**: High | **Status**: Ready for implementation

---

## 1. Use Case Summary

**Objective**: Build an AI-assisted pipeline that generates a standardized 2D office layout plan from a brief natural language request.

**Scope**: A single, well-defined, recurring task. No BIM. No 3D. No complex geometry. Just a reliable, fast 2D plan generator.

**Why this use case**:
- Recurring: Office layouts are frequently requested
- Bounded: Clear inputs (area, workstation count, room types) and outputs (DWG + PDF)
- Valuable: Saves 30-60 minutes of manual drawing per plan
- Teachable: Captures Roc4t standards in a concrete, testable form

---

## 2. Input Specification

### 2.1 Natural Language Request Format

```
"Create a [AREA]m² office layout for [N] people with [ROOMS]"
```

**Examples**:
- "Create a 50m² office layout for 4 people with a meeting room"
- "Create a 80m² open office for 8 people with a kitchenette"
- "Create a 120m² office for 10 people with 2 meeting rooms and a reception"

### 2.2 Structured Input (API / JSON)

```json
{
  "request_type": "office_layout_2d",
  "project_id": "ROC4T-2025-001",
  "parameters": {
    "total_area_m2": 50,
    "occupancy": 4,
    "room_types": ["open_office", "meeting_room"],
    "constraints": {
      "min_room_width_m": 2.5,
      "corridor_width_m": 1.2,
      "window_wall": "north"
    }
  },
  "output": {
    "format": ["dwg", "pdf"],
    "template": "ROC4T-OFFICE-A3.dwt",
    "scale": "1:50"
  }
}
```

### 2.3 Input Parameters

| Parameter | Type | Required | Default | Constraints |
|-----------|------|----------|---------|-------------|
| `total_area_m2` | float | Yes | — | 20–500 m² |
| `occupancy` | int | Yes | — | 1–50 people |
| `room_types` | string[] | Yes | `["open_office"]` | Must be from approved list |
| `min_room_width_m` | float | No | 2.5 | > 2.0 m |
| `corridor_width_m` | float | No | 1.2 | > 1.0 m |
| `window_wall` | enum | No | `"unspecified"` | north/south/east/west/unspecified |
| `accessibility` | bool | No | `true` | WC required if > 5 people |
| `template` | string | No | `"ROC4T-OFFICE-A3.dwt"` | Must exist in template library |

---

## 3. Output Specification

### 3.1 Deliverables

| File | Format | Naming Convention | Notes |
|------|--------|---------------------|-------|
| Drawing | DWG | `ROC4T-{PROJECT}-{TYPE}-V{NN}.dwg` | e.g., `ROC4T-001-LAYOUT-V01.dwg` |
| Plot | PDF | `ROC4T-{PROJECT}-{TYPE}-V{NN}.pdf` | A3, 1:50, monochrome |
| Metadata | JSON | `ROC4T-{PROJECT}-{TYPE}-V{NN}.meta.json` | Area, occupancy, room list, validation results |

### 3.2 Drawing Content Requirements

**Mandatory Layers** (Roc4t standard):

| Layer Name | Color | Linetype | Lineweight | Content |
|------------|-------|----------|------------|---------|
| `ROC4T-WALL` | White (7) | Continuous | 0.35mm | All walls |
| `ROC4T-WALL-EXT` | White (7) | Continuous | 0.50mm | External walls |
| `ROC4T-PARTITION` | Cyan (4) | Continuous | 0.25mm | Internal partitions |
| `ROC4T-DOOR` | Green (3) | Continuous | 0.25mm | Door swings and frames |
| `ROC4T-WINDOW` | Green (3) | Continuous | 0.25mm | Windows |
| `ROC4T-FURN` | Magenta (6) | Continuous | 0.18mm | Furniture blocks |
| `ROC4T-DIMS` | Red (1) | Continuous | 0.18mm | Dimensions |
| `ROC4T-TEXT` | Yellow (2) | Continuous | 0.18mm | Labels and notes |
| `ROC4T-HATCH` | Grey (8) | Continuous | 0.18mm | Floor material hatches |
| `ROC4T-TITLE` | White (7) | Continuous | 0.35mm | Title block content |

**Mandatory Drawing Elements**:

1. **Outer walls** (rectangle based on area, with aspect ratio ~1.4:1)
2. **Internal partitions** (room divisions per room_types)
3. **Doors** (swing arcs, standard 0.9m width)
4. **Windows** (on window_wall if specified, otherwise 2 longest walls)
5. **Furniture blocks** (workstations, meeting table, chairs, storage)
6. **Dimensions** (overall width, length, key room widths)
7. **Room labels** (room name + area in m²)
8. **North arrow** (if window_wall specified)
9. **Title block** (project name, date, scale, drawn by, checked by)
10. **Area callout** (total area, occupancy, efficiency ratio)

### 3.3 Quality Criteria

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Area accuracy | ±2% | Calculated vs requested |
| Occupancy compliance | 100% | Number of workstations = occupancy |
| Min room width | ≥ 2.5m | All rooms except storage/WC |
| Corridor width | ≥ 1.2m | All circulation paths |
| Layer compliance | 100% | All entities on correct layers |
| Dimension completeness | 100% | All required dimensions present |
| Block naming | 100% | All blocks use standard names |
| Export success | 100% | DWG and PDF both generated |

---

## 4. Business Rules & Layout Logic

### 4.1 Room Type Definitions

| Room Type | Area per person | Min width | Furniture | Notes |
|-----------|-----------------|-----------|-----------|-------|
| `open_office` | 4–6 m² | — | Workstation block | Primary space |
| `meeting_room` | 2–3 m² | 3.0 m | Meeting table + chairs | 4–12 people |
| `kitchenette` | 6–10 m² | 2.0 m | Counter, fridge, sink | If > 8 people |
| `reception` | 10–15 m² | 3.0 m | Desk, seating | If requested |
| `storage` | 4–8 m² | 1.5 m | Shelving | Optional |
| `wc` | 3–4 m² | 1.5 m | WC fixture block | Required if > 5 people |

### 4.2 Layout Algorithm (Simplified)

```
1. Calculate outer dimensions from total_area_m2
   → width = sqrt(area * 1.4), depth = area / width

2. Subtract circulation (corridors) from usable area
   → usable_area = total_area - (corridor_area)

3. Allocate room areas proportionally:
   → open_office: 60% of usable
   → meeting_room: 20% of usable
   → support: 20% of usable

4. Place rooms along a grid:
   → Meeting room near entrance (if reception exists)
   → Open office near windows (if window_wall specified)
   → WC / kitchenette near plumbing walls

5. Insert doors:
   → Every room gets at least one door
   → Meeting room: sliding or swing door
   → WC: door with swing into room

6. Insert windows:
   → On window_wall (if specified) or longest walls
   → Max 50% wall coverage
   → Min 1.0m from corners

7. Insert furniture blocks:
   → Workstations: grid pattern, 1.5m spacing
   → Meeting table: centered in meeting room
   → Storage: against wall

8. Add dimensions and annotations

9. Apply title block and export
```

### 4.3 Standard Block Library (Phase 1)

| Block Name | Description | Dimensions | Insertion Point |
|------------|-------------|------------|-----------------|
| `ROC4T-WKSTN-01` | Standard workstation | 1.6m x 0.8m | Back-left corner |
| `ROC4T-WKSTN-02` | Corner workstation | 1.6m x 1.6m | Corner |
| `ROC4T-MEET-TBL-01` | Meeting table (4p) | 1.8m x 0.9m | Center |
| `ROC4T-MEET-TBL-02` | Meeting table (6p) | 2.4m x 1.2m | Center |
| `ROC4T-CHAIR-01` | Office chair | 0.5m x 0.5m | Front of table |
| `ROC4T-STORAGE-01` | Storage cabinet | 0.9m x 0.4m | Back-left corner |
| `ROC4T-WC-01` | WC fixture | 0.7m x 0.5m | Back wall |
| `ROC4T-DOOR-SW-01` | Swing door (internal) | 0.9m x 0.05m | Hinge side |
| `ROC4T-DOOR-SL-01` | Sliding door | 0.9m x 0.05m | Wall center |
| `ROC4T-WIN-01` | Standard window | 1.2m x 0.05m | Wall center |

---

## 5. Validation & Testing Plan

### 5.1 Automated Validation Checklist

```python
def validate_layout(dwg_path) -> ValidationReport:
    checks = [
        check_layers_exist_and_correct(),
        check_all_entities_on_correct_layers(),
        check_dimensions_present(),
        check_title_block_filled(),
        check_area_within_tolerance(requested_area),
        check_workstation_count_equals_occupancy(),
        check_min_room_widths(),
        check_corridor_widths(),
        check_no_overlapping_entities(),
        check_dwg_version_compatible(),
        check_pdf_export_success(),
    ]
    return aggregate_report(checks)
```

### 5.2 Test Cases

| Test ID | Description | Input | Expected Result | Priority |
|---------|-------------|-------|-----------------|----------|
| TC-01 | Minimal layout | 20m², 1 person, open office | 1 workstation, no meeting room | High |
| TC-02 | Standard small | 50m², 4 people, open + meeting | 4 workstations, 1 meeting room, 1 WC | High |
| TC-03 | Medium with kitchen | 80m², 8 people, open + meeting + kitchen | 8 workstations, 1 meeting, 1 kitchen, 1 WC | High |
| TC-04 | Large multi-room | 120m², 10 people, open + 2 meetings + reception | 10 workstations, 2 meetings, reception, 1 WC | Medium |
| TC-05 | Window wall constraint | 50m², 4 people, north windows | Open office on north wall, windows on north | Medium |
| TC-06 | Accessibility required | 60m², 6 people, open + meeting | WC present, min door width 0.9m | Medium |
| TC-07 | Invalid area (too small) | 10m², 2 people | Error: area below minimum | Low |
| TC-08 | Invalid occupancy (too high) | 50m², 20 people | Error: density exceeds maximum | Low |
| TC-09 | Template not found | Custom template name | Error: template not in library | Low |
| TC-10 | Layer standard violation | — (post-generation edit) | Validation catches wrong layer | High |

### 5.3 Human Validation Checklist

Before any output is considered "delivered", the production team must verify:

- [ ] Does the layout match the verbal request?
- [ ] Are all standard blocks used correctly?
- [ ] Do dimensions make sense for construction?
- [ ] Is the drawing visually clean and professional?
- [ ] Are title block fields correct?
- [ ] Does the PDF render correctly?
- [ ] Are there any obvious errors (missing doors, overlapping walls)?

---

## 6. Implementation Tasks (Phase 1 Breakdown)

### Week 1: Setup & Standards

| Day | Task | Owner | Deliverable |
|-----|------|-------|-------------|
| 1.1 | Define use case spec (this document) | Technical Lead | UC1 spec approved |
| 1.2 | Create standard template `ROC4T-OFFICE-A3.dwt` | Production Team | Template file + documentation |
| 1.3 | Define layer standard & create layer setup script | Production Team | Layer definitions JSON |
| 1.4 | Create standard block library | Production Team | 10 blocks in standard folder |
| 1.5 | Define dimension styles & text styles | Production Team | Style definitions JSON |
| 1.6 | Set up AutoCAD COM test environment | Technical Lead | Test script runs successfully |
| 1.7 | Install Claude Desktop & `mcp` Python SDK | Technical Lead | Claude Desktop opens, `mcp` importable |
| 1.8 | Write first manual layout as reference | Production Team | Reference DWG + time logged |

### Week 2: Automation & Validation

| Day | Task | Owner | Deliverable |
|-----|------|-------|-------------|
| 2.1 | Implement MCP server skeleton (AutoCAD only) | Technical Lead | Server responds to ping from Claude Desktop |
| 2.2 | Implement `document.create`, `layer.create`, `drawing.add_line` | Technical Lead | 3 tools tested via Claude Desktop |
| 2.3 | Implement block insertion & dimensioning tools | Technical Lead | Full geometry generation via Claude |
| 2.4 | Implement layout generation tools (simplified) | Technical Lead | Claude generates test layout end-to-end |
| 2.5 | Implement validation engine (exposed as MCP tool) | Technical Lead | All 11 checks callable via Claude |
| 2.6 | Configure Claude Desktop → MCP Server → AutoCAD flow | Technical Lead | Claude generates layout from natural language |
| 2.7 | Run all 10 test cases via Claude, fix failures | Production Team + Technical Lead | Test report with pass rate |
| 2.8 | Demo to stakeholders (Claude + AutoCAD live) | Project Lead | Demo + feedback collected |

---

## 7. Success Criteria for Phase 1

| Criterion | Target | How Measured |
|-----------|--------|--------------|
| End-to-end time | < 60 seconds | From natural language request to PDF |
| Accuracy | 95%+ | Test cases pass rate |
| Manual correction time | < 5 minutes per plan | Time from AI output to approved drawing |
| Standards compliance | 100% | Automated validation score |
| Human satisfaction | Positive | Post-demo feedback survey |

---

## 8. Risks & Mitigations (Use Case Specific)

| Risk | Impact | Mitigation |
|------|--------|------------|
| AutoCAD COM automation unstable | High | Add retry logic, graceful failure, manual fallback |
| Block library incomplete | Medium | Start with 10 blocks, expand based on feedback |
| Layout algorithm produces ugly results | Medium | Human validation required, algorithm improves over time |
| Template doesn't match Roc4t branding | Medium | Designer reviews template before automation |
| Dimension styles don't export correctly | Low | Test export on every AutoCAD version |

---

## 9. Future Expansion (Post-Phase 1)

| Feature | Phase | Description |
|---------|-------|-------------|
| Custom furniture arrangements | Phase 2 | "Cluster desks in groups of 4" |
| Multi-floor layouts | Phase 2 | Staircases, floor connectors |
| Material specifications | Phase 2 | Floor finishes, wall types |
| Revit model generation | Phase 2 | Convert 2D plan to BIM model |
| Client-specific templates | Phase 3 | Branded templates per client |
| Batch generation | Phase 3 | Generate 10 variants at once |

---

*This document is the technical contract for Use Case 1. All implementation decisions must align with it. Changes require approval from the Technical Lead and Business Lead.*
