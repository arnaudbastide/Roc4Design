# Roc4t — Technical Architecture
## AI-Assisted Design Pipeline

> **Version**: 1.0 | **Status**: Pre-implementation | **Classification**: Internal

---

## 1. System Overview

The Roc4t AI-Assisted Design Pipeline is a **layered automation system** that connects natural language requests to production-grade CAD/BIM outputs through an AI orchestrator. The system is designed to:

- Accept natural language or structured input from non-technical stakeholders
- Translate intent into parameterized CAD/BIM operations
- Execute those operations via a Model Context Protocol (MCP) bridge
- Verify outputs against Roc4t standards
- Render results in a 3D immersive viewer for review and iteration

---

## 2. Architectural Diagram (Claude MCP)

```
┌─────────────────────────────────────────────────────────────────┐
│  STAKEHOLDER LAYER                                              │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ Project Lead │  │ 3D Immersive     │  │ Business Lead    │  │
│  │ (Natural     │  │ Review Viewer    │  │ (Quality Rules) │  │
│  │  Language)   │  │ (Web / Desktop)  │  │                  │  │
│  └──────┬───────┘  └────────┬─────────┘  └──────────────────┘  │
└─────────┼────────────────────┼──────────────────────────────────┘
          │                    │
          │ Natural Language   │ Spatial Review + Change Requests
          │ Request            │
          ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  AI ORCHESTRATION LAYER (Claude)                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Claude Desktop / API (MCP Client)                       │   │
│  │  • Understands natural language requests                   │   │
│  │  • Decomposes into tool call sequences                   │   │
│  │  • Selects appropriate MCP tools                         │   │
│  │  • Handles errors and retries                              │   │
│  │  • Validates outputs by reading tool results               │   │
│  │  • Summarizes results for the user                       │   │
│  └─────────────────────┬──────────────────────────────────────┘   │
└────────────────────────┼──────────────────────────────────────────┘
                         │ MCP Protocol (stdio or SSE)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  BRIDGE LAYER (Roc4t MCP Server)                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  roc4t-mcp-server (Python + mcp SDK + pywin32)           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                │   │
│  │  │  Query   │  │  Execute │  │  Retrieve│                │   │
│  │  │  Tools   │  │  Tools   │  │  Tools   │                │   │
│  │  └──────────┘  └──────────┘  └──────────┘                │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                │   │
│  │  │  Security│  │  Audit   │  │Standards │                │   │
│  │  │  Layer   │  │  Logger  │  │  Engine  │                │   │
│  │  └──────────┘  └──────────┘  └──────────┘                │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                         │ COM / API Calls
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  DESIGN SOFTWARE LAYER                                          │
│  ┌──────────────┐  ┌──────────────────┐                        │
│  │  AutoCAD     │  │  Revit / BIM     │                        │
│  │  (2D)        │  │  (3D Structured) │                        │
│  │  DWG/DXF/PDF │  │  RVT/Family libs │                        │
│  └──────────────┘  └──────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
                         │
                         │ File Export
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  OUTPUT & 3D LAYER                                              │
│  ┌──────────────┐  ┌──────────────────┐                        │
│  │  File Store  │  │  3D Viewer       │                        │
│  │  (Project    │  │  (WebGL/Three.js │                        │
│  │   folders)   │  │   or Forge)      │                        │
│  └──────────────┘  └──────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

**Key change**: Claude replaces the custom "Planner → Generator → Verifier" multi-agent system. We no longer build an AI orchestrator in Python.

---

## 3. Component Specifications

### 3.1 AI Orchestrator Agent (Claude as MCP Client)

**Role**: Claude acts as the MCP client, handling all reasoning, planning, and tool orchestration. We do NOT build a custom AI orchestrator.

**What Claude Does**:
- **Understands** natural language requests from the Project Lead
- **Decomposes** complex tasks into sequences of MCP tool calls
- **Selects** the appropriate tool for each sub-task
- **Handles** errors by retrying or asking for clarification
- **Validates** outputs by reading back results from tools
- **Summarizes** results in human-friendly language

**What We Build**:
- A **custom MCP server** (`roc4t-mcp-server`) that exposes AutoCAD/Revit tools
- A **standards engine** that validates commands against Roc4t rules
- An **audit logger** that records every command

**Claude Configuration** (for Claude Desktop):

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "roc4t-autocad": {
      "command": "python",
      "args": ["C:\\Roc4t\\src\\mcp\\server.py"],
      "env": {
        "ROC4T_PROJECT_DIR": "C:\\Projects",
        "ROC4T_STANDARDS": "C:\\Roc4t\\standards"
      }
    }
  }
}
```

**Example Conversation Flow**:

```
User: "Create a 50m² office layout for 4 people with a meeting room"

Claude: "I'll generate that layout for you. Let me start by setting up the
         standard Roc4t template and layers."

Claude → [tool: create_document]     → MCP Server → AutoCAD
Claude → [tool: create_layers]         → MCP Server → AutoCAD
Claude → [tool: draw_outer_walls]      → MCP Server → AutoCAD
Claude → [tool: add_partition]         → MCP Server → AutoCAD
Claude → [tool: insert_workstations]   → MCP Server → AutoCAD
Claude → [tool: insert_meeting_table]  → MCP Server → AutoCAD
Claude → [tool: add_dimensions]       → MCP Server → AutoCAD
Claude → [tool: add_labels]            → MCP Server → AutoCAD
Claude → [tool: export_pdf]           → MCP Server → AutoCAD

Claude: "Done! I've created a 50m² office layout with 4 workstations and a
         meeting room. The drawing has been saved as:
         - ROC4T-001-LAYOUT-V01.dwg
         - ROC4T-001-LAYOUT-V01.pdf
         Total area: 50.2m². Would you like me to make any adjustments?"
```

**Why This Is Better Than a Custom Orchestrator**:
- **No code to maintain** for reasoning, planning, or error handling
- **Claude is already excellent** at decomposing tasks and selecting tools
- **Natural conversation** — the Project Lead can ask follow-ups in plain language
- **Zero latency** for reasoning (no local LLM inference needed)
- **Mature ecosystem** — MCP is Anthropic's official protocol, well-supported

### 3.2 MCP Bridge (Roc4t Custom MCP Server)

**Role**: Secure, structured interface between Claude and the design software. The MCP server exposes a set of **tools** that Claude can call.

**Protocol**: MCP (Model Context Protocol) via stdio (Claude Desktop) or SSE (API)

**Implementation**: Python using the official `mcp` SDK

```python
# server.py — Roc4t MCP Server skeleton
from mcp.server import Server
from mcp.types import Tool, TextContent
import win32com.client

app = Server("roc4t-autocad")

@app.tool()
async def create_document(template: str, project_id: str) -> TextContent:
    """Create a new AutoCAD document from a Roc4t template."""
    acad = win32com.client.Dispatch("AutoCAD.Application")
    doc = acad.Documents.Add(template)
    doc.SaveAs(f"{project_id}.dwg")
    return TextContent(text=f"Created {project_id}.dwg from {template}")

@app.tool()
async def create_layer(name: str, color: int, linetype: str = "Continuous") -> TextContent:
    """Create a layer in the active AutoCAD document."""
    # Validate: only allowed layer names
    if not name.startswith("ROC4T-"):
        raise ValueError("Layer names must start with ROC4T-")
    
    acad = win32com.client.Dispatch("AutoCAD.Application")
    doc = acad.ActiveDocument
    layer = doc.Layers.Add(name)
    layer.color = color
    return TextContent(text=f"Layer '{name}' created.")

@app.tool()
async def draw_polyline(points: list, layer: str) -> TextContent:
    """Draw a polyline in the active document."""
    acad = win32com.client.Dispatch("AutoCAD.Application")
    doc = acad.ActiveDocument
    # ... (COM calls to draw polyline)
    return TextContent(text=f"Polyline drawn on layer {layer}.")

# ... more tools: insert_block, add_dimension, export_pdf, etc.
```

**Core Tool Categories** (exposed to Claude):

| Category | Tools | Target |
|----------|-------|--------|
| **Query** | `list_layers`, `get_document_info`, `list_blocks`, `get_dimension_styles` | Read-only introspection |
| **Document** | `create_document`, `open_document`, `save_document`, `export_pdf`, `export_dwg` | File lifecycle |
| **Drawing** | `add_line`, `add_circle`, `add_rectangle`, `add_text`, `add_dimension`, `add_hatch` | 2D geometry |
| **Layer** | `create_layer`, `set_layer_active`, `set_layer_color`, `freeze_layer` | Layer management |
| **Block** | `insert_block`, `define_block`, `list_block_attributes` | Reusable objects |
| **BIM** | `create_wall`, `create_door`, `create_room`, `add_schedule`, `update_parameter` | Revit objects |
| **3D** | `export_ifc`, `export_navisworks`, `generate_view` | 3D interchange |

**Security Model**:
- **Sandboxed execution**: MCP server runs in a dedicated Windows process with limited file system access
- **Allow-list**: Only pre-approved tools can be called
- **Input validation**: All parameters validated before conversion to COM/API calls
- **Audit logging**: Every tool call logged with timestamp, user, result
- **No external network**: MCP server has no outbound internet access

### 3.3 AutoCAD Integration (Phase 1)

**Interface**: Windows COM Automation (`AutoCAD.Application`) via Python `pywin32`

**Key Automation Areas**:
1. **Template Management**: Open `.dwt` templates, set paper size, apply title blocks
2. **Layer Automation**: Create standard layers from naming conventions, set colors/linetypes
3. **Geometry Generation**: Draw lines, polylines, rectangles, circles, hatches
4. **Dimensioning**: Add linear, aligned, radial dimensions with standard styles
5. **Block Management**: Insert standard blocks (furniture, fixtures, doors, windows)
6. **Text & Annotation**: Add room labels, notes, area callouts
7. **Export**: Save as DWG, DXF, PDF with specified settings

**COM Object Model (Simplified)**:
```
AutoCAD.Application
├── Documents (collection)
│   └── Document (active drawing)
│       ├── ModelSpace
│       │   ├── AddLine(...)
│       │   ├── AddCircle(...)
│       │   ├── AddText(...)
│       │   └── AddBlockRef(...)
│       ├── PaperSpace
│       ├── Layers (collection)
│       ├── Blocks (collection)
│       ├── DimStyles (collection)
│       └── Plot
│           └── PlotToFile(...)
└── Preferences
```

### 3.4 Revit / BIM Integration (Phase 2)

**Interface**: Revit API via Python (`pyRevit` or custom add-in) or Autodesk Platform Services (APS)

**Key Automation Areas**:
1. **Element Creation**: Walls, floors, ceilings, roofs, doors, windows
2. **Parameter Management**: Type parameters, instance parameters, shared parameters
3. **Room & Area**: Generate rooms from boundaries, calculate areas
4. **Schedules**: Create material take-offs, door/window schedules
5. **Views**: Generate plan views, elevations, sections, 3D views
6. **Family Management**: Load and place families, update family parameters
7. **Coordination**: Export to IFC, Navisworks, or DWG for coordination

**Revit API Entry Points**:
- `UIApplication.ActiveUIDocument.Document` — current document
- `Document.Create.NewWall(...)` — element creation
- `FilteredElementCollector` — query existing elements
- `Transaction` — all changes wrapped in transactions

### 3.5 3D Immersive Review (Phase 3)

**Options Evaluated**:

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Autodesk Viewer / APS Viewer** | Native Autodesk ecosystem support, web-based, no install | Cloud-only, data handling and subscription cost | Phase 3+ if cloud acceptable |
| **Three.js + IFC.js** | Open source, local, full control | Requires IFC export, custom UI development | **Phase 3 preferred** |
| **BIMvision** | Fast desktop IFC review, minimal setup | Desktop-only, review-focused, limited integration | Supplemental review tool |
| **BIM 360 / ACC** | Full collaboration, issue tracking | Cloud-only, expensive, overkill for internal review | Not recommended for MVP |
| **Unity / Unreal** | High fidelity, immersive VR | High dev effort, requires build | Future consideration |

**Recommended Phase 3 Architecture**:
```
Revit/AutoCAD → Export IFC → IFC.js Parser → Three.js Viewer → Web UI
                                      ↓
                              Natural Language → AI Agent → Modify Revit → Refresh IFC
```

**Viewer Requirements**:
- Load IFC or converted glTF models
- Orbit, zoom, pan, section plane
- Click-to-select elements (show properties)
- Measure distances
- Annotate with comments
- Submit change requests in natural language

---

## 4. Data Flow

### 4.1 Typical Request Flow (2D Plan Generation via Claude MCP)

```
1. Lead: "Create a 50m² office layout with 4 workstations and a meeting room"
         ↓
2. Claude (MCP Client):
   - Classifies: "2D Layout Plan Generation"
   - Decomposes into tool calls:
     a. create_document(template="ROC4T-OFFICE-A3.dwt", project_id="ROC4T-001")
     b. create_layers([{"name":"ROC4T-WALL", "color":7}, ...])
     c. draw_polyline(points=[...], layer="ROC4T-WALL")
     d. draw_polyline(points=[...], layer="ROC4T-PARTITION")
     e. insert_block(name="ROC4T-WKSTN-01", position=[...], count=4)
     f. insert_block(name="ROC4T-MEET-TBL-01", position=[...])
     g. add_dimensions([...])
     h. add_text([...])
     i. export_pdf(filename="ROC4T-001-LAYOUT-V01.pdf")
         ↓
3. MCP Server (roc4t-mcp-server):
   - Validates each tool call against Roc4t standards
   - Converts to COM calls
   - Executes in AutoCAD
   - Returns results to Claude
         ↓
4. AutoCAD: Performs drawing operations
         ↓
5. Claude: Reads back results, confirms success, reports to user
         ↓
6. Export: Files saved to project folder
         ↓
7. 3D Viewer: (Optional) Load for spatial review
         ↓
8. Lead Reviews → Approves or Requests Changes
         ↓
9. If changes: Claude receives new instructions, loops back to Step 2
```

**Key difference from original architecture**: No custom Planner/Generator/Verifier in Python. Claude handles all of this natively.

### 4.2 State Management

The system maintains persistent state across sessions:

| State Type | Storage | Purpose |
|------------|---------|---------|
| Project Registry | SQLite / JSON file | Project list, status, last action |
| Action Log | Append-only log file | Audit trail of all AI actions |
| Standards Cache | Local JSON | Loaded Roc4t standards for validation |
| Context Memory | In-memory + serialized | Conversation history, pending tasks |
| File Index | SQLite | Generated files, versions, locations |

---

## 5. API Contract (MCP → Design Software)

### 5.1 Request Format

```json
{
  "jsonrpc": "2.0",
  "id": "uuid-1234",
  "method": "autocad.execute",
  "params": {
    "command": "drawing.add_line",
    "arguments": {
      "start_point": [0, 0, 0],
      "end_point": [7000, 0, 0],
      "layer": "WALL"
    },
    "document_id": "ROC4T-001.dwg"
  }
}
```

### 5.2 Response Format

```json
{
  "jsonrpc": "2.0",
  "id": "uuid-1234",
  "result": {
    "status": "success",
    "entity_id": "Line_42",
    "properties": {
      "length": 7000,
      "layer": "WALL",
      "bounds": [[0,0,0], [7000,0,0]]
    }
  }
}
```

### 5.3 Error Format

```json
{
  "jsonrpc": "2.0",
  "id": "uuid-1234",
  "error": {
    "code": -32001,
    "message": "Layer not found",
    "data": {
      "layer": "WALL",
      "available_layers": ["0", "DEFPOINTS"]
    }
  }
}
```

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Metric | Target | Notes |
|--------|--------|-------|
| Command execution latency | < 2s for simple drawing ops | COM overhead is main factor |
| Plan generation (simple) | < 30s end-to-end | From request to PDF |
| 3D model load | < 10s for models < 50MB | Depends on viewer tech |
| AI response time | < 5s for task decomposition | LLM inference time |

### 6.2 Reliability

- **Graceful degradation**: If AutoCAD is not running, system can queue commands or start it automatically
- **Transaction safety**: All drawing operations should be reversible (undo stack)
- **Backup**: Auto-save every 5 minutes; versioned file naming
- **Crash recovery**: If MCP server crashes, AI can reconnect and resume

### 6.3 Scalability

- **Phase 1**: Single workstation, single AutoCAD instance
- **Phase 2**: Multiple Revit projects via project switching
- **Phase 3**: Web-based viewer allows concurrent review sessions
- **Future**: Queue-based job system for batch processing

---

## 7. Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Security Zones                                         │
├─────────────────────────────────────────────────────────┤
│  Zone 1: AI Orchestrator                                │
│  - Runs on controlled VM / workstation                │
│  - Network: outbound to LLM API only (if cloud LLM)   │
│  - No direct file system access to project folders    │
├─────────────────────────────────────────────────────────┤
│  Zone 2: MCP Server                                     │
│  - Runs on same Windows machine as AutoCAD/Revit      │
│  - File access: project directories ONLY (sandboxed)   │
│  - Network: no external access                         │
│  - Command allow-list enforced                         │
├─────────────────────────────────────────────────────────┤
│  Zone 3: Design Software                               │
│  - AutoCAD / Revit on Windows workstation             │
│  - Standard user privileges (no admin)                 │
│  - File access: project directories only               │
├─────────────────────────────────────────────────────────┤
│  Zone 4: File Storage                                  │
│  - Project folders with ACLs                           │
│  - Audit log read-only after write                     │
│  - Backup to separate volume                           │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Deployment Topology (Claude MCP)

### Phase 1 (Single Workstation — Claude Desktop)

```
┌────────────────────────────────────────────────────┐
│  Windows Workstation (Dev/Test)                   │
│  ┌────────────────────┐  ┌──────────────────┐  │
│  │ Claude Desktop     │  │ AutoCAD 2024     │  │
│  │ (MCP Client)       │  │ (COM)            │  │
│  │                    │  │                  │  │
│  │ User types:        │  │                  │  │
│  │ "Create layout..." │  │                  │  │
│  └─────────┬──────────┘  └──────────────────┘  │
│            │ MCP (stdio)                        │
│  ┌─────────┴──────────┐                        │
│  │ Roc4t MCP Server   │                        │
│  │ (Python + pywin32) │                        │
│  │ • Standards engine │                        │
│  │ • Security layer   │                        │
│  │ • Audit logger     │                        │
│  └────────────────────┘                        │
└────────────────────────────────────────────────────┘
```

**How it works**:
1. User opens Claude Desktop
2. Claude Desktop spawns the Roc4t MCP Server as a subprocess (stdio transport)
3. User types a natural language request in Claude's chat interface
4. Claude reasons about the request, decides which tools to call
5. Claude sends tool calls to the MCP Server via stdio
6. MCP Server validates, executes in AutoCAD, returns results
7. Claude reports results back to the user

### Phase 2+ (API Mode — For Batch/Integration)

```
┌────────────────────────────────────────────────────┐
│  Roc4t Web App / API Consumer                     │
│  (React / Python / etc.)                         │
│  └─────────┬────────────────────────────────────┘  │
│            │ HTTP API requests                     │
│  ┌─────────┴────────────────────────────────────┐  │
│  │  Claude API (Anthropic)                      │  │
│  │  (MCP Client via API)                        │  │
│  │  • Receives structured requests               │  │
│  │  • Returns tool call sequences                │  │
│  └─────────┬────────────────────────────────────┘  │
│            │ MCP (SSE)                                │
│  ┌─────────┴──────────┐  ┌──────────────────┐      │
│  │ Roc4t MCP Server   │  │ AutoCAD/Revit    │      │
│  │ (Python + pywin32) │  │ (COM/API)        │      │
│  └────────────────────┘  └──────────────────┘      │
└────────────────────────────────────────────────────┘
```

---

## 9. Monitoring & Observability

### 9.1 Metrics to Track

| Metric | Instrument | Alert Threshold |
|--------|-----------|-----------------|
| Command execution time | Histogram | > 5s for simple ops |
| Error rate | Counter | > 5% of commands |
| AI task completion rate | Counter | < 90% success |
| File generation time | Timer | > 60s for simple plans |
| MCP server uptime | Gauge | < 99% |

### 9.2 Logging Strategy

```
logs/
├── mcp/
│   ├── commands.log      # Every command issued
│   ├── errors.log        # Errors and stack traces
│   └── performance.log   # Timing data
├── ai/
│   ├── requests.log      # Incoming requests
│   ├── decisions.log     # Planner/Generator/Verifier decisions
│   └── conversations.log # Full conversation history
└── audit/
    └── file_changes.log  # File creation, modification, deletion
```

---

## 10. Open Questions & Decisions

| # | Question | Status | Decision |
|---|----------|--------|----------|
| 1 | **Claude Desktop vs Claude API** | **Resolved** | Start with Claude Desktop for Phase 1; evaluate API for Phase 2+ |
| 2 | **MCP transport** | **Resolved** | stdio for Desktop (Phase 1), SSE for API (Phase 2+) |
| 3 | **3D viewer technology** | Pending | Three.js + IFC.js preferred |
| 4 | **Document storage** | Pending | Local NAS for Phase 1 |
| 5 | **AutoCAD version** | Pending | Match designer versions |

---

## 11. Appendix: Technology Inventory

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| **AI Orchestrator** | **Claude Desktop / Claude API** | latest | Claude as MCP client; no custom orchestrator |
| **MCP SDK** | **Official `mcp` Python SDK** | latest | `pip install mcp` |
| **MCP Server** | Python + pywin32 (COM) | 3.12+ | Custom Roc4t server |
| **MCP Transport** | stdio (Desktop) / SSE (API) | — | Phase 1: stdio |
| **AutoCAD** | AutoCAD 2024/2025 | 2024+ | COM automation required |
| **2D CAD Supplemental** | LibreCAD | latest | Lightweight DXF review/fallback |
| **Revit** | Revit 2024 | 2024+ | Revit API + pyRevit |
| **BIM/IFC Supplemental** | FreeCAD / BlenderBIM | latest | IFC inspection and fallback modeling experiments |
| **3D Viewer** | Three.js + IFC.js; Autodesk Viewer / APS Viewer; BIMvision | latest | Local web viewer primary, review alternatives available |
| **Database** | SQLite | 3.45+ | Embedded, zero-config |
| **Logging** | Python structlog | latest | Structured JSON logs |
| **Version Control** | Git + GitHub | — | Private repo |
| **Testing** | pytest | — | Unit + integration tests |
| **Container** | Docker | latest | 3D Viewer only |

---

*Document generated for Roc4t internal use. Version 1.0 — Pre-implementation.*
