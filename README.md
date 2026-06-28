# Project README
## Roc4t — AI-Assisted Design Pipeline

> **Status**: Pre-implementation | **Phase**: 1 (AutoCAD POC) | **Next Milestone**: Day 30 Demo

---

## What is this?

Roc4t is building an **AI-assisted design pipeline** that automates repetitive CAD/BIM tasks while keeping human designers in control. The system uses **Claude as the AI orchestrator** (via Model Context Protocol — MCP) connected to a **custom MCP server** that manipulates AutoCAD and Revit. The Project Lead simply types natural language requests to Claude, and the system produces production-grade drawings and models, with a 3D immersive review layer for non-technical stakeholders.

**Core principle**: *AI prepares, humans decide, the lead visualizes and modifies.*

**Architecture at a glance**:
```
Project Lead (plain language) → Claude Desktop (MCP Client) → Roc4t MCP Server (Python + COM) → AutoCAD/Revit
```

We do **NOT** build a custom AI orchestrator. Claude handles all reasoning, planning, and error recovery natively. We only build the MCP server that exposes AutoCAD/Revit tools.

---

## Quick Links

| Document | Purpose | Audience |
|----------|---------|----------|
| [Strategic Plan](Roc4t_AI_Design_Pipeline_Plan.md) | Full vision, 30-day roadmap, risk matrix | All stakeholders |
| [Executive Summary](docs/Executive_Summary.docx) | One-pager for leadership | Project Lead, Business Lead |
| [RACI & Roles](docs/RACI_Roles_and_Process.docx) | Who does what, RACI matrix | Whole team |
| [Technical Architecture](docs/Technical_Architecture.md) | System design, APIs, data flow | Technical Lead, developers |
| [Use Case 1 Spec](docs/Use_Case_1_AutoCAD_POC.md) | First concrete implementation task | Technical Lead, Production Team |
| [Claude MCP Architecture](docs/Claude_MCP_Architecture.md) | Detailed Claude + MCP implementation guide | Technical Lead |
| [MCP Evaluation](docs/MCP_Server_Evaluation.md) | MCP server options & recommendation | Technical Lead |
| [Existing Tools Research](docs/Existing_Tools_Research.md) | Real GitHub MCP tools evaluation | Technical Lead |
| [Technology Stack](docs/Technology_Stack.md) | Technology decisions | Technical Lead |
| [Standards Checklist](docs/Standards_Checklist.md) | Standards to define before automation | Business Lead, Production Team |
| [Week 1 Sprint Plan](docs/Week_1_Sprint_Plan.md) | Day-by-day breakdown for Phase 1 | Technical Lead, Production Team |
| [Kick-off Presentation](presentations/roc4t_kickoff/Roc4t_Kickoff.pptx) | Stakeholder presentation | All stakeholders |

---

## Project Structure

```
Roc4Design/
├── docs/                          # Internal documentation
│   ├── Executive_Summary.docx
│   ├── RACI_Roles_and_Process.docx
│   ├── Standards_Checklist.md
│   ├── Technical_Architecture.md
│   ├── Use_Case_1_AutoCAD_POC.md
│   ├── MCP_Server_Evaluation.md
│   ├── Technology_Stack.md
│   ├── Existing_Tools_Research.md
│   ├── Claude_MCP_Architecture.md
│   └── Week_1_Sprint_Plan.md
├── presentations/               # Stakeholder decks
│   └── roc4t_kickoff/
│       ├── Roc4t_Kickoff.pptx
│       ├── Roc4t_Kickoff.pptd
│       ├── outline.md
│       ├── design.md
│       └── pages/                 # Individual slide files
├── standards/                     # Roc4t design standards (TBD)
│   ├── templates/                 # .dwt, .rvt templates
│   ├── blocks/                    # AutoCAD blocks
│   ├── families/                  # Revit families
│   └── naming_conventions.md
├── src/                           # Source code
│   ├── automation/                # AI orchestrator scripts
│   ├── mcp/                       # MCP server
│   ├── viewer/                    # 3D web viewer (Phase 3)
│   └── shared/                    # Shared utilities
├── tests/                         # Test plans & test data
├── media/                         # Screenshots, demo videos
├── assets/                        # Shared assets (logos, etc.)
└── templates/                     # Document templates
```

---

## 30-Day Roadmap

### Phase 1 — AutoCAD POC (Weeks 1-2)
**Goal**: Quick productivity gain on a narrow, well-defined use case.

- Define priority use case: **Standardized 2D office layout plans**
- Create standard template, layers, blocks, dimension styles
- Build/adopt MCP server for AutoCAD (Python + COM, based on open-source base)
- Implement layout generation algorithm
- Validate outputs against standards
- **Deliverable**: Functional AutoCAD prototype + test report

### Phase 2 — BIM / Revit Extension (Weeks 3-4)
**Goal**: Move from drawing automation to intelligent design automation.

- Define BIM structure and target Revit objects
- Extend MCP server to Revit (adopt `Sam-AEC/aec-model-bridge` base)
- Test AI-driven modifications in Revit
- Verify 2D/BIM consistency
- **Deliverable**: Exploitable BIM base + consistency validation

### Phase 3 — 3D Immersive Review (Week 4+)
**Goal**: Make the project readable for the lead.

- Prepare 3D viewer environment (Three.js + IFC.js)
- Load model and test navigation
- Simulate modification requests
- Verify changes return to source model
- **Deliverable**: Functional 3D view + demo script

### Phase 4 — Industrialization (Month 2+)
**Goal**: Stabilize and scale.

- Document all standards, rules, and templates
- Implement automated quality controls
- Add logging and audit trails
- Create reusable libraries
- **Deliverable**: Production-ready system

---

## Team & Roles

| Role | Responsibility | Current Assignee |
|------|---------------|------------------|
| **Project Lead** | Validates need, arbitrates priorities, tests immersive review | *TBD* |
| **Production Team** | Creates, corrects, documents standards; 2 designers | *2 remote designers* |
| **Technical Lead** | Builds automation and AI integration | *TBD* |
| **Business Lead** | Defines quality rules and validates outputs | *TBD* |

---

## Critical Success Factors

1. **Scope framing** — narrow and well-defined
2. **Standards definition** — written before automation
3. **Human validation** — kept at every critical step

---

## How to Contribute

1. **Read the docs**: Start with the [Executive Summary](docs/Executive_Summary.docx) and [Technical Architecture](docs/Technical_Architecture.md)
2. **Set up your environment**: See [Technology Stack](docs/Technology_Stack.md) for required tools
3. **Pick a task**: Check the current phase's task list in [Use Case 1 Spec](docs/Use_Case_1_AutoCAD_POC.md)
4. **Follow standards**: All code must pass linting and tests; all docs must be in Markdown
5. **Log your time**: Track time spent on manual tasks during Phase 1 — this is our baseline for measuring AI savings

---

## Communication

- **Daily standups**: 15 min sync between Technical Lead and Production Team
- **Weekly reviews**: Project Lead + all leads, progress against milestones
- **Demo day**: Day 30 — Go / No-go / Adjust decision
- **Documentation**: All decisions written down in this repo

---

## Contact

- **Project questions**: Project Lead
- **Technical questions**: Technical Lead
- **Standards questions**: Business Lead
- **Production questions**: Production Team (designers)

---

*This README is a living document. Update it as the project evolves.*
