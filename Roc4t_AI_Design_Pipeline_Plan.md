# Roc4t AI Design Pipeline Plan

## Purpose

Roc4t is an AI-assisted CAD/BIM production pipeline. The system lets a project lead describe design tasks in natural language, then uses Claude Desktop through MCP tools to operate AutoCAD and, later, Revit. The goal is not to replace designers. The goal is to automate repetitive drafting/modeling work while keeping human review at every important decision point.

## Operating Model

```text
Project Lead -> Claude Desktop -> Roc4t MCP Server -> AutoCAD/Revit -> Human Review
```

Claude handles planning, reasoning, and tool selection. Roc4t owns the MCP servers, design standards, validation rules, and project-specific automation tools.

## Phase 1: AutoCAD POC

Goal: generate standardized 2D office layout plans from a bounded request.

Primary use case:

```text
Create a 50m2 office layout for 4 people with a meeting room.
```

Expected deliverables:

- DWG layout using Roc4t standard layers
- PDF plot at A3 / 1:50
- JSON metadata with room areas, occupancy, and validation results
- Human review checklist

Current implementation focus:

- AutoCAD MCP server under `src/mcp/roc4design-autocad-mcp`
- Roc4t layer validation with `ROC4T-*` layer naming
- Standard layer catalog from `docs/Use_Case_1_AutoCAD_POC.md`
- Tests that validate standards logic without requiring AutoCAD

## Phase 2: Revit Extension

Goal: extend the MCP pattern from 2D CAD drafting into BIM object creation and modification.

Scope:

- Revit MCP bridge
- Room/object creation tools
- BIM consistency checks
- 2D/BIM validation workflow

## Phase 3: 3D Review

Goal: provide an immersive review layer for non-technical stakeholders.

Scope:

- Three.js/IFC.js viewer
- Model loading and navigation
- Review annotations
- Change requests routed back into the source model workflow

## Phase 4: Industrialization

Goal: make the pipeline stable enough for repeated production use.

Scope:

- Versioned standards
- Automated validation reports
- Logging and audit trails
- Reusable templates and block/family libraries
- Client-specific overrides

## Standards Baseline

Phase 1 layer names:

| Layer | Purpose |
|---|---|
| `ROC4T-WALL` | All walls |
| `ROC4T-WALL-EXT` | External walls |
| `ROC4T-PARTITION` | Internal partitions |
| `ROC4T-DOOR` | Door swings and frames |
| `ROC4T-WINDOW` | Windows |
| `ROC4T-FURN` | Furniture blocks |
| `ROC4T-DIMS` | Dimensions |
| `ROC4T-TEXT` | Labels and notes |
| `ROC4T-HATCH` | Floor material hatches |
| `ROC4T-TITLE` | Title block content |

## Success Criteria

- A user can request a simple office layout in natural language.
- Claude can call the AutoCAD MCP server to create standards-compliant drawing elements.
- The drawing can be checked for Roc4t standards compliance.
- The production team can review and correct the result faster than drafting from scratch.
- All standards and implementation decisions are documented in this repository.

## Immediate Next Steps

1. Install the AutoCAD MCP package in a Python 3.10+ environment.
2. Connect Claude Desktop to the local MCP server.
3. Run layer validation and standard layer listing through Claude.
4. Test drawing creation inside AutoCAD.
5. Add block insertion tests once the Phase 1 block library exists.
