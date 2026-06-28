# Technology Stack Decision Matrix
## Roc4t AI-Assisted Design Pipeline

> **Version**: 1.0 | **Status**: Pre-implementation decisions

---

## 1. Overview

This document captures the technology decisions for each layer of the Roc4t pipeline. Each decision is evaluated against project requirements, with a final recommendation and rationale.

---

## 2. AI Orchestrator Stack

> **Decision**: We use **Claude as the MCP client** via Claude Desktop (or API). Claude handles all reasoning, planning, and tool selection. We do NOT build a custom AI orchestrator. Instead, we build a **custom MCP server** that exposes Roc4t-specific tools to Claude.

### 2.1 Claude as MCP Client

| Aspect | Detail |
|--------|--------|
| **Product** | Claude Desktop (or Claude API with MCP support) |
| **Role** | Natural language understanding, task decomposition, tool selection, error recovery, output validation |
| **Why Claude** | Native MCP support, excellent reasoning, long context, safe output |
| **Cost** | Claude Pro subscription (~$20/mo) + API usage for scale |
| **Data handling** | Project data stays local (MCP server runs locally); only natural language requests go to Claude |

### 2.2 What Claude Does (Out of the Box)

- **Understands** natural language requests from the Project Lead
- **Decomposes** complex tasks into sequences of tool calls
- **Selects** the right MCP tool for each sub-task
- **Handles** errors by retrying or asking for clarification
- **Validates** outputs by reading back results from tools
- **Summarizes** results in human-friendly language

### 2.3 What We Build (Custom MCP Server)

- **MCP Server** (`roc4t-mcp-server`) running on the Windows CAD workstation
- **Exposes tools** for AutoCAD/Revit operations via Python + pywin32 COM
- **Security layer** (input validation, allow-list, sandbox, audit logging)
- **Standards enforcement** (Roc4t layer names, block names, validation rules)

### 2.4 Architecture Pattern

```
User (Natural Language) → Claude Desktop → MCP Protocol → Roc4t MCP Server → AutoCAD/Revit
                                    ↓                              ↓
                              Reasoning/Planning            COM/pywin32
```

**No custom AI orchestrator needed**. Claude replaces the "Planner → Generator → Verifier" multi-agent system we originally considered.

### 2.5 MCP Server Technology

| Component | Technology | Notes |
|-----------|-----------|-------|
| **MCP Server** | Python + `mcp` SDK (official) | `pip install mcp` or `mcp-sdk` |
| **Transport** | stdio (Claude Desktop) or SSE (API) | Claude Desktop uses stdio; API can use SSE |
| **AutoCAD COM** | pywin32 | `win32com.client.Dispatch("AutoCAD.Application")` |
| **Revit API** | pyRevit (Phase 2) or C# add-in (Phase 3) | Python-first for speed |
| **Standards** | JSON config files | Loaded at server startup |
| **Audit** | Python structlog | JSON logs, local only |

### 2.6 MCP Server Base — Adopt vs. Build Decision

**Research finding**: 8+ open-source AutoCAD MCP servers and 4+ Revit MCP servers exist on GitHub. See [`Existing_Tools_Research.md`](Existing_Tools_Research.md) for full evaluation.

**AutoCAD Phase 1**:

| Approach | Base Project | Time | Risk | Recommendation |
|----------|--------------|------|------|----------------|
| **Adopt + Extend** | `ranvirw18/autocad-mcp-server` (FastMCP, MIT) | 5–7 days | Low | **Primary** — clean, tested, Pydantic |
| **Adopt + Extend** | `Porta048/AutoCad-MCP` (MIT) | 5–7 days | Low | **Secondary** — has dim, text, save |
| **Build from SDK** | Official `mcp` Python SDK | 10–14 days | Low | **Fallback** — if adoption fails after 5 days |

**Decision**: **Adopt `ranvirw18/autocad-mcp-server` as base**, extend with Roc4t standards, blocks, dimensions, export, and security layer. Estimated time savings: ~1 week.

**Revit Phase 2**:

| Approach | Base Project | Time | Risk | Recommendation |
|----------|--------------|------|------|----------------|
| **Adopt + Extend** | `Sam-AEC/aec-model-bridge` (MIT, 100 tools) | 7–10 days | Medium | **Primary** — most mature Revit MCP |
| **Build from SDK** | Official `mcp` + pyRevit | 14–21 days | Low | **Fallback** |

**Decision**: **Adopt `Sam-AEC/aec-model-bridge` for Phase 2**. Estimated time savings: 2–3 weeks.

---

## 3. MCP Bridge Stack

### 3.1 MCP Server Language

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Python** | pywin32 for COM, great for prototyping | Windows-only for COM | **Primary** — fastest path |
| **C# (.NET)** | Native COM interop, best for Revit API | More verbose, slower dev | **Phase 3** — if performance critical |
| **C++** | Fastest COM performance | Overkill for this use case | Not recommended |

**Decision**: **Python 3.12** with `pywin32` for AutoCAD COM and `pyRevit` or custom Revit API for Revit.

### 3.2 Communication Protocol

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **JSON-RPC over local socket** | Standard MCP, lightweight, fast | Needs custom client | **Primary** — matches MCP spec |
| **HTTP REST (FastAPI)** | Easy to debug, universal | Slightly more overhead | **Alternative** — if debugging is hard |
| **gRPC** | Fast, typed, streaming | More complex setup | **Future** — if high throughput needed |
| **STDIO (subprocess)** | Simplest, no networking | Fragile, no concurrency | **Phase 1 testing only** |

**Decision**: **JSON-RPC over local TCP socket** (or HTTP REST for easier debugging). The MCP spec uses JSON-RPC, so we align with that.

### 3.3 AutoCAD Automation

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **COM Automation (pywin32)** | Full AutoCAD API, well-documented | Windows-only, requires running AutoCAD | **Primary** — standard approach |
| **LibreCAD** | Free/open-source 2D CAD, useful for simple DXF review and lightweight drafting | Limited automation and no DWG-native production workflow | **Supplemental 2D tool** — review/fallback, not primary automation |
| **AutoCAD .NET API** | Type-safe, modern | Requires C#, more setup | **Future** — if we need .NET |
| **AutoCAD ActiveX** | Same as COM, JavaScript/VBScript | Less powerful than .NET | Not recommended |
| **Teigha / ODA** | No AutoCAD license needed | Complex, may not support all features | **Not for Phase 1** |

**Decision**: **pywin32 COM Automation** for AutoCAD. It's the standard and most flexible approach.

### 3.4 Revit Automation

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Revit API (C# add-in)** | Full API, native, fast | Requires C#, compiled add-in | **Phase 2** — if deep integration needed |
| **pyRevit** | Python scripts inside Revit, easy to iterate | Limited API access, requires Revit open | **Phase 1-2** — for rapid prototyping |
| **FreeCAD** | Open-source BIM/IFC-capable modeling, Python automation, useful for experiments | Not a Revit replacement for production coordination | **Supplemental BIM/IFC tool** |
| **BlenderBIM** | Open-source IFC-native review/modeling workflow, strong IFC inspection capability | Different modeling UX; not ideal for direct Revit-style authoring | **Supplemental BIM/IFC tool** |
| **Design Automation API (APS)** | Cloud, no local Revit | Cloud dependency, cost, latency | **Phase 3** — for batch processing |
| **RevitPythonShell** | Interactive Python in Revit | Not for automation, UI only | **Dev tool only** |

**Decision**: **Start with pyRevit** for Phase 2 prototyping. If we need deeper integration, move to a C# Revit add-in.

---

## 4. 3D Viewer Stack

### 4.1 Viewer Technology

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Three.js + IFC.js** | Open source, local, full control | Requires IFC export, custom UI | **Phase 3** — best for data sovereignty |
| **Autodesk Viewer / APS Viewer** | Native Autodesk ecosystem support, strong web review workflow | Cloud dependency, data handling and cost constraints | **Alternative** — if cloud review is acceptable |
| **BIMvision** | Free desktop IFC viewer, fast stakeholder review without custom development | Desktop-only, review-focused, limited integration | **Supplemental review tool** |
| **Blender + blender-mcp** | AI-assisted scene manipulation, useful for visualization and asset placement workflows | Not a BIM authoring source of truth; kitchen models still need asset libraries | **Supplemental visualization workflow** |
| **Babylon.js** | Good for games, less BIM-focused | Would need custom IFC parser | Not recommended |
| **Unity WebGL** | High fidelity, VR support | High dev effort, large builds | **Future** — for VR review |

**Decision**: **Three.js + IFC.js** for Phase 3. We export IFC from Revit/AutoCAD and load it in a local web viewer. This keeps all data on-premise. Use BIMvision for quick desktop IFC review and Autodesk Viewer / APS Viewer when cloud review or native Autodesk model review is acceptable.

### 4.2 Web Framework (for Viewer UI)

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **React + TypeScript** | Mature, component-based, great ecosystem | Learning curve if team doesn't know it | **Primary** — industry standard |
| **Vue.js** | Easier to learn, lighter | Smaller ecosystem than React | **Alternative** — if team prefers Vue |
| **Vanilla JS** | No dependencies, fast | Harder to maintain at scale | **Not recommended** |

**Decision**: **React + TypeScript** for the viewer UI. It's the standard for web-based 3D viewers.

---

## 5. Data & Storage Stack

### 5.1 Project State / Registry

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **SQLite** | Embedded, zero-config, reliable | Not for high concurrency | **Primary** — perfect for local app |
| **JSON files** | Human-readable, simple | No querying, corruption risk | **Config files only** |
| **PostgreSQL** | Robust, scalable | Overkill for Phase 1, needs setup | **Future** — if multi-user |

**Decision**: **SQLite** for project registry, action log, and file index. It's embedded, reliable, and requires no setup.

### 5.2 File Storage

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Local NAS / Windows file server** | Fast, secure, no internet | Single point of failure, no remote access | **Phase 1** — standard for design firms |
| **OneDrive / SharePoint** | Cloud sync, sharing | Sync conflicts, latency, subscription | **Future** — if remote collaboration needed |
| **Autodesk ACC / BIM 360** | Native integration, issues | Expensive, cloud dependency | **Phase 3** — if client requires it |

**Decision**: **Local file server** for Phase 1. Standard project folders with Windows ACLs.

---

## 6. Infrastructure & Deployment

### 6.1 Development Environment

| Component | Technology | Notes |
|-----------|-----------|-------|
| OS | Windows 11 Pro | Required for AutoCAD/Revit COM |
| IDE | VS Code + Python extension | Free, great for Python/JS |
| Python | 3.12 | Latest stable, good async support |
| Node.js | 20 LTS | For React viewer |
| AutoCAD | 2024 (or latest licensed) | Match designer versions |
| LibreCAD | Latest stable | Supplemental 2D DXF review/drafting |
| Revit | 2024 (or latest licensed) | For Phase 2 |
| FreeCAD / BlenderBIM | Latest stable | Supplemental BIM/IFC review and experiments |
| BIMvision | Latest stable | Desktop IFC review |

### 6.2 Deployment Target

| Phase | Topology | Notes |
|-------|----------|-------|
| **Phase 1** | Single Windows workstation | Claude Desktop + MCP Server + AutoCAD on one machine |
| **Phase 2** | Two workstations | Claude Desktop on any OS; MCP Server + AutoCAD/Revit on CAD workstation |
| **Phase 3** | Networked | File server + CAD workstation + web viewer host |

### 6.3 Containerization

| Component | Docker | Notes |
|-----------|--------|-------|
| Claude Desktop | ❌ No | Desktop app, runs natively |
| MCP Server | ❌ No | Requires Windows + COM, not container-friendly |
| 3D Viewer | ✅ Yes | React app, can serve via Nginx |
| Database | ✅ Yes | SQLite is file-based, but can mount volume |

**Decision**: Containerize the 3D Viewer only. MCP Server and Claude Desktop stay native on Windows.

---

## 7. Monitoring & Observability Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Logging | Python `structlog` + JSON | Structured logs for analysis |
| Log aggregation | Local files + optional ELK | No cloud for Phase 1 |
| Metrics | Prometheus (future) | Track performance |
| Alerting | Custom scripts (future) | Simple threshold checks |
| Error tracking | Sentry (optional) | If cloud acceptable |

**Decision**: **Local JSON logs** for Phase 1. No cloud monitoring to keep data on-premise.

---

## 8. Development Tools

| Purpose | Tool | Notes |
|---------|------|-------|
| Version control | Git + GitHub (private) | All code, docs, standards |
| Task tracking | GitHub Issues / Projects | Free, integrated with code |
| Documentation | Markdown in repo | Living docs, versioned with code |
| API testing | Postman / HTTPie | Test MCP endpoints |
| Python testing | pytest | Unit + integration tests |
| JS testing | Jest | React component tests |
| Linting | ruff (Python), ESLint (JS) | Code quality |
| Formatting | black (Python), Prettier (JS) | Consistent style |

---

## 9. Final Technology Stack Summary

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **AI Orchestrator** | **Claude Desktop / Claude API** | latest | Claude as MCP client; no custom orchestrator needed |
| **MCP SDK** | **Official `mcp` Python SDK** | latest | `pip install mcp` |
| **MCP Server** | Python + pywin32 (COM) | 3.12+ | Custom Roc4t server |
| **MCP Transport** | stdio (Desktop) / SSE (API) | — | Phase 1: stdio |
| **AutoCAD** | COM Automation | 2024+ | pywin32 dispatch |
| **2D CAD Supplemental** | LibreCAD | latest | Lightweight DXF review/fallback |
| **Revit** | pyRevit → C# add-in | 2024+ | Phase 2 |
| **BIM/IFC Supplemental** | FreeCAD / BlenderBIM | latest | IFC inspection and fallback modeling experiments |
| **3D Viewer** | React + TypeScript + Three.js + IFC.js; Autodesk Viewer / APS Viewer; BIMvision | latest | Local web viewer primary; Autodesk/BIMvision for review alternatives |
| **Database** | SQLite | 3.45+ | Embedded, zero-config |
| **File Storage** | Local NAS / Windows shares | — | Project folders |
| **Logging** | structlog (JSON) | latest | Local files only |
| **Version Control** | Git + GitHub | — | Private repo |
| **Testing** | pytest + Jest | — | Unit + integration |
| **Container** | Docker | latest | 3D Viewer only |

**Key simplification**: No FastAPI, no LangChain, no LangGraph, no custom AI orchestrator. Claude handles all reasoning. We only build the MCP server that exposes tools.

---

## 10. Open Decisions

| # | Decision | Options | Timeline |
|---|----------|---------|----------|
| 1 | **Claude Desktop vs Claude API** | Desktop (interactive) vs API (programmatic) | Phase 1 — start with Desktop for testing, API for production |
| 2 | MCP SDK version | `mcp` official SDK vs community alternatives | Phase 1 — use official `mcp` Python SDK |
| 3 | 3D viewer technology | Three.js + IFC.js vs Autodesk Viewer / APS Viewer vs BIMvision | Phase 3 — Three.js preferred; BIMvision/Autodesk Viewer as review alternatives |
| 4 | Document storage | Local NAS vs Cloud | Phase 1 — local |
| 5 | AutoCAD version | 2024 vs 2025 | Match designer versions |

---

*This document should be reviewed and updated after each phase. Technology choices may evolve based on real-world constraints.*
