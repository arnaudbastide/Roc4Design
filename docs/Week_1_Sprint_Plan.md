# Week 1 Sprint Plan
## Roc4t Phase 1 — AutoCAD POC

> **Sprint**: Week 1 (Days 1–7) | **Goal**: Standards defined, environment ready, first manual reference created

---

## Sprint Overview

| Item | Value |
|------|-------|
| **Sprint Goal** | Define the first use case, establish Roc4t standards, set up the prototype environment, and create a manual reference drawing |
| **Duration** | 7 days |
| **Team Capacity** | 2 designers (Production) + 1 Technical Lead + 1 Business Lead |
| **Definition of Done** | All standards documented, template created, environment running, reference drawing approved |

---

## Day-by-Day Breakdown

### Day 1 — Use Case Definition & Existing Tool Evaluation

| Task | Owner | Time | Output | Done? |
|------|-------|------|--------|-------|
| Review and approve Use Case 1 spec | Project Lead + Business Lead | 2h | Approved UC1 spec | ☐ |
| Assign technical and business leads | Project Lead | 1h | Named leads in RACI | ☐ |
| Set up project workspace (GitHub repo, folders) | Technical Lead | 2h | Repo initialized | ☐ |
| **Clone and evaluate 2 AutoCAD MCP servers** (`ranvirw18`, `Porta048`) | Technical Lead | 2h | Evaluation notes | ☐ |
| Team kick-off meeting (review docs, Q&A) | Project Lead | 1h | Meeting notes, alignment | ☐ |
| **Daily Checkpoint** | All | 15 min | Day 1 status | ☐ |

**Day 1 Success Criteria**: Team aligned, leads assigned, repo ready, UC1 spec approved, **MCP base candidates cloned**.

---

### Day 2 — Standards Inventory & MCP Base Selection

| Task | Owner | Time | Output | Done? |
|------|-------|------|--------|-------|
| Inventory existing AutoCAD templates and files | Production Team | 4h | File list with locations | ☐ |
| Document current layer usage and conventions | Production Team | 3h | Layer map spreadsheet | ☐ |
| List existing blocks, title blocks, and libraries | Production Team | 3h | Block inventory | ☐ |
| **Run both MCP servers; test with Claude Desktop** | Technical Lead | 3h | Test report | ☐ |
| **Compare code quality, extensibility, license** | Technical Lead | 2h | Comparison doc | ☐ |
| Review inventory with Business Lead | Business Lead + Production | 2h | Reviewed inventory | ☐ |
| **Daily Checkpoint** | All | 15 min | Day 2 status | ☐ |

**Day 2 Success Criteria**: Complete inventory of existing standards, templates, and assets. **MCP base selected** (adopt vs. build decision made).

---

### Day 3 — Standards Definition (Part 1)

| Task | Owner | Time | Output | Done? |
|------|-------|------|--------|-------|
| Draft layer naming convention | Business Lead | 3h | `standards/layers.md` | ☐ |
| Draft file naming convention | Business Lead | 2h | `standards/naming.md` | ☐ |
| Draft dimension style specification | Production Team | 3h | `standards/dimensions.md` | ☐ |
| Draft block naming convention | Production Team | 2h | `standards/blocks.md` | ☐ |
| **Daily Checkpoint** | All | 15 min | Day 3 status | ☐ |

**Day 3 Success Criteria**: Draft standards for layers, files, dimensions, and blocks.

---

### Day 4 — Standards Definition (Part 2) & Template Creation

| Task | Owner | Time | Output | Done? |
|------|-------|------|--------|-------|
| Draft delivery format specification | Business Lead | 2h | `standards/delivery.md` | ☐ |
| Draft validation rules checklist | Business Lead | 2h | `standards/validation.md` | ☐ |
| Create standard AutoCAD template (`ROC4T-OFFICE-A3.dwt`) | Production Team | 4h | Template file | ☐ |
| Set up standard layers in template | Production Team | 2h | Layers configured | ☐ |
| **Daily Checkpoint** | All | 15 min | Day 4 status | ☐ |

**Day 4 Success Criteria**: Standard template created with correct layers, dimensions, and title block.

---

### Day 5 — Block Library & MCP Server Setup

| Task | Owner | Time | Output | Done? |
|------|-------|------|--------|-------|
| Create 10 standard blocks (workstation, meeting table, chair, etc.) | Production Team | 6h | Block files in `standards/blocks/` | ☐ |
| Set up Technical Lead development environment | Technical Lead | 4h | Python, pywin32, AutoCAD COM test script | ☐ |
| **Fork selected MCP base; add Roc4t config loader** | Technical Lead | 3h | Forked repo with config system | ☐ |
| **Add layer prefix validation (`ROC4T-*`) to MCP server** | Technical Lead | 2h | Validated layer tool | ☐ |
| **Daily Checkpoint** | All | 15 min | Day 5 status | ☐ |

**Day 5 Success Criteria**: Block library created, dev environment ready, **MCP server forked with first Roc4t-specific validation**.

---

### Day 6 — Manual Reference Drawing

| Task | Owner | Time | Output | Done? |
|------|-------|------|--------|-------|
| Create first manual 2D office layout (50m², 4 people, meeting room) | Production Team | 6h | Reference DWG + PDF | ☐ |
| Time the manual process (stopwatch every sub-task) | Production Team | — | Time log per sub-task | ☐ |
| Document best practices and edge cases observed | Production Team | 2h | Notes in `docs/reference_notes.md` | ☐ |
| Review reference drawing with Business Lead | Business Lead | 2h | Approved reference | ☐ |
| **Daily Checkpoint** | All | 15 min | Day 6 status | ☐ |

**Day 6 Success Criteria**: Approved reference drawing with detailed time log and notes.

---

### Day 7 — Review & Week 2 Planning

| Task | Owner | Time | Output | Done? |
|------|-------|------|--------|-------|
| Review all standards documents | Business Lead | 2h | Standards v1.0 approved | ☐ |
| Consolidate standards into `standards/v1.0/` folder | Technical Lead | 1h | Organized standards folder | ☐ |
| Write Week 1 retrospective | Project Lead | 1h | Retro notes | ☐ |
| Plan Week 2 tasks (detailed task breakdown) | Technical Lead | 2h | Week 2 task list | ☐ |
| Update project README with Week 1 progress | Technical Lead | 1h | Updated README | ☐ |
| **Sprint Review** | All | 1h | Demo standards + reference drawing | ☐ |
| **Daily Checkpoint** | All | 15 min | Day 7 status | ☐ |

**Day 7 Success Criteria**: Standards v1.0 approved, Week 2 planned, team ready for automation.

---

## Sprint Backlog Summary

| Story | Points | Owner | Status |
|-------|--------|-------|--------|
| UC1 spec approved | 2 | Project Lead | ☐ |
| Standards inventory complete | 3 | Production Team | ☐ |
| Layer naming convention defined | 2 | Business Lead | ☐ |
| File naming convention defined | 2 | Business Lead | ☐ |
| Dimension style spec defined | 2 | Production Team | ☐ |
| Block naming convention defined | 2 | Production Team | ☐ |
| Delivery format spec defined | 1 | Business Lead | ☐ |
| Validation rules defined | 2 | Business Lead | ☐ |
| Standard template created | 5 | Production Team | ☐ |
| Standard layers configured | 3 | Production Team | ☐ |
| 10 standard blocks created | 5 | Production Team | ☐ |
| Dev environment set up | 3 | Technical Lead | ☐ |
| **MCP servers cloned and evaluated** | 3 | Technical Lead | ☐ |
| **MCP base selected and forked** | 3 | Technical Lead | ☐ |
| **Layer prefix validation added** | 2 | Technical Lead | ☐ |
| Manual reference drawing created | 5 | Production Team | ☐ |
| Time log for manual process | 2 | Production Team | ☐ |
| Best practices documented | 2 | Production Team | ☐ |
| Standards v1.0 approved | 2 | Business Lead | ☐ |
| Week 2 plan ready | 2 | Technical Lead | ☐ |

**Total Story Points**: 54

---

## Definition of Done (Per Task)

- [ ] Code / file reviewed by at least one other person
- [ ] Documented in Markdown
- [ ] Saved in the correct project folder
- [ ] Referenced in the project README or standards index
- [ ] No blockers for next task

---

## Risks & Blockers

| Risk | Impact | Mitigation | Owner |
|------|--------|------------|-------|
| Designers don't have time for standards work | High | Protect 4h/day for standards; defer non-urgent projects | Project Lead |
| AutoCAD version mismatch | Medium | Confirm version before Day 5; use lowest common version | Technical Lead |
| Block library takes longer than expected | Medium | Start with 5 essential blocks; add 5 more in Week 2 | Production Team |
| Technical Lead unavailable | High | Cross-train Business Lead on basic repo/git tasks | Project Lead |
| Standards conflict with existing client work | Medium | Document exceptions; create "client override" process | Business Lead |

---

## Success Metrics for Week 1

| Metric | Target | How Measured |
|--------|--------|--------------|
| Standards documents completed | 8/8 | Checklist |
| Template created and tested | 1 | File exists + opens correctly |
| Blocks created | 10 | Files in `standards/blocks/` |
| Reference drawing approved | 1 | Business Lead sign-off |
| Manual time logged | 100% | Time log spreadsheet |
| **MCP base selected and forked** | **Yes** | **Forked repo with validation** |
| Team satisfaction | Positive | Retro feedback |

---

*This sprint plan is the contract for Week 1. Update it daily during standups. Any scope changes require Project Lead approval.*
