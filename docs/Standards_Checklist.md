# Roc4t — Standards to Define Before Automation

> **Rule: The clearer the standards, the more effective the AI becomes.**
> This checklist must be completed before any automation scripts are deployed.

---

## 1. Drawing Templates (Gabarits)
- [ ] Title block layout and fields
- [ ] Paper sizes (A1, A2, A3, A4) and orientation rules
- [ ] Margin and frame standards
- [ ] Logo and branding placement

## 2. Layer Conventions & Naming Rules
- [ ] Layer naming convention (e.g., `ROCK-ARCH-WALL`, `ROCK-MECH-HVAC`)
- [ ] Layer colors and line weights
- [ ] Layer grouping and hierarchy
- [ ] Frozen / locked layer policy

## 3. Dimension Styles
- [ ] Dimension scale per drawing type
- [ ] Text height and font for dimensions
- [ ] Arrowhead style and size
- [ ] Tolerance and precision rules

## 4. Object Libraries (Blocks / Families)
- [ ] Standard block naming convention
- [ ] Block categories (doors, windows, furniture, fixtures, equipment)
- [ ] Insertion point standards
- [ ] Attribute definitions (tag, prompt, default value)

## 5. BIM Families
- [ ] Revit family naming convention
- [ ] Parameter mapping (type vs instance)
- [ ] Shared parameter definitions
- [ ] LOD (Level of Detail) targets per phase

## 6. Delivery Formats
- [ ] DWG version compatibility
- [ ] DXF export settings
- [ ] PDF output presets (layer visibility, line weights, color)
- [ ] File compression and packaging rules

## 7. Validation Rules
- [ ] Pre-delivery checklist (layer audit, orphan check, xref status)
- [ ] Quality scoring rubric
- [ ] Error classification (blocking vs warning vs info)

## 8. Export Formats
- [ ] Naming convention for exported files
- [ ] Folder structure for deliverables
- [ ] Metadata and properties to populate
- [ ] Version numbering (v1, v1.1, v2 …)

## 9. Naming Conventions for Files and Objects
- [ ] Project folder structure
- [ ] File naming template: `PROJECT-PHASE-DISCIPLINE-VERSION.dwg`
- [ ] Object naming: `CATEGORY-TYPE-ID`
- [ ] Sheet numbering system

## 10. Modification Rights & Governance
- [ ] Who can approve changes to standards
- [ ] Change log format
- [ ] Rollback procedure
- [ ] Training and onboarding for new team members

---

## Quick-Start: Standards Definition Workshop (Week 1)

| Day | Activity | Owner | Output |
|-----|----------|-------|--------|
| 1 | Inventory existing templates and files | Production Team | File list |
| 2 | Document current layer usage | Production Team | Layer map |
| 3 | Draft naming conventions | Business Lead | Draft doc |
| 4 | Review with designers | Project Lead | Reviewed draft |
| 5 | Approve and publish v1 | Business Lead | `standards/v1/` folder |

---

*Last updated: today*
