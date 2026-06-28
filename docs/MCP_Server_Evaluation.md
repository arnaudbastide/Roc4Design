# MCP Server Evaluation & Recommendation
## Roc4t AI-Assisted Design Pipeline

> **Date**: Pre-implementation | **Owner**: Technical Lead | **Status**: Decision Required

---

## 1. Executive Summary

The Model Context Protocol (MCP) server is the **critical bridge** between Claude (the AI orchestrator) and the design software (AutoCAD, Revit). **Claude has been selected as the MCP client**, which means we do NOT build a custom AI orchestrator. Instead, we build a **custom MCP server** that exposes Roc4t-specific tools to Claude.

**Decision**: We use **Claude as the MCP client** and build a **custom Python MCP server** (Option 4, described below) that wraps AutoCAD/Revit COM automation.

**Recommendation Summary**:

| Phase | Claude Role | MCP Server | Rationale |
|-------|-------------|------------|-----------|
| **Phase 1** (AutoCAD POC) | Claude Desktop (MCP Client) | **Custom Roc4t MCP Server** (Python + COM) | Claude handles reasoning; we build tools only |
| **Phase 2** (BIM Extension) | Claude Desktop or API | Custom Roc4t MCP Server + pyRevit | Same pattern, extend to Revit |
| **Phase 3** (3D Review) | Claude API (programmatic) | Hardened Roc4t MCP Server | Full API integration for production |

---

## 2. Evaluation Framework

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **Time to POC** | 20% | How quickly can we get a working prototype? |
| **Local Control** | 20% | Can we run everything on-premise without cloud dependency? |
| **AutoCAD Support** | 15% | Quality of AutoCAD automation capabilities |
| **Revit/BIM Support** | 15% | Quality of Revit/BIM automation capabilities |
| **Security** | 15% | Can we enforce least-privilege, sandbox, audit? |
| **Long-term Viability** | 10% | Is the project maintained? Is there a roadmap? |
| **Cost** | 5% | Licensing, infrastructure, development cost |

**Key change**: We are no longer evaluating "AI orchestrators" (Planner, Generator, Verifier). Claude handles all of that. We only evaluate the **MCP server** that exposes tools to Claude.

---

## 3. The Claude MCP Architecture

Since **Claude has been selected as the MCP client**, the architecture simplifies dramatically:

```
┌──────────────────────────────────────────────────────────┐
│  Claude Desktop / API (MCP Client)                     │
│  • Understands natural language                        │
│  • Decomposes into tool calls                          │
│  • Handles errors and retries                          │
│  • Validates outputs                                     │
└──────────────────┬───────────────────────────────────────┘
                   │ MCP Protocol (stdio or SSE)
                   ▼
┌──────────────────────────────────────────────────────────┐
│  Roc4t MCP Server (Custom Python + pywin32)            │
│  • Exposes AutoCAD/Revit tools                         │
│  • Validates inputs against Roc4t standards            │
│  • Converts tool calls to COM/API commands             │
│  • Returns results to Claude                           │
└──────────────────┬───────────────────────────────────────┘
                   │ COM / API Calls
                   ▼
┌──────────────────────────────────────────────────────────┐
│  AutoCAD / Revit (Windows)                             │
└──────────────────────────────────────────────────────────┘
```

**What we DON'T build**:
- Custom LLM orchestrator (no LangChain, no LangGraph, no FastAPI AI service)
- Custom planner/generator/verifier agents (Claude does this natively)
- JSON-RPC custom protocol (MCP stdio/SSE is standard)

**What we DO build**:
- Custom MCP server with Roc4t-specific tools
- Security layer (input validation, sandbox, audit)
- Standards engine (enforce Roc4t naming, layers, blocks)
- AutoCAD/Revit COM wrappers exposed as MCP tools

---

## 4. MCP Server Options Evaluated

### 3.1 Overview

Autodesk's official Model Context Protocol (or equivalent via Autodesk Platform Services — APS) provides a cloud-native, API-first approach to design automation.

**Key Components**:
- **Autodesk Platform Services (APS)** — Cloud APIs for Design Automation (DA4A), Model Derivative, Viewer
- **Design Automation API** — Run AutoCAD/Revit scripts in the cloud
- **Data Management API** — Manage files in Autodesk Construction Cloud (ACC) / BIM 360
- **Model Derivative API** — Convert files to formats like IFC, SVF, glTF

### 3.2 Pros

| Advantage | Details |
|-----------|---------|
| **Native ecosystem** | Built by Autodesk, guaranteed compatibility with latest versions |
| **Cloud scalability** | Run multiple jobs in parallel without local workstation load |
| **No local AutoCAD** | Scripts run in headless AutoCAD instances in the cloud |
| **Built-in viewer** | Forge Viewer included for web-based review |
| **Enterprise support** | Autodesk support, SLAs, documentation |

### 3.3 Cons

| Disadvantage | Details |
|--------------|---------|
| **Cloud dependency** | Requires internet, data leaves premises, subscription required |
| **Cost** | APS credits consumption; can be expensive for frequent operations |
| **Latency** | Upload → process → download cycle; 30-120s per operation |
| **Limited local control** | Cannot easily enforce file system sandboxing |
| **Heavier setup** | OAuth, app registration, webhooks, bucket management |
| **AutoCAD Windows limitation** | Design Automation for AutoCAD only supports specific versions and scripting languages |
| **Vendor lock-in** | Deep dependency on Autodesk roadmap and pricing |

### 3.4 Technical Architecture

```
AI Orchestrator → HTTPS → Autodesk APS
                         ├── Design Automation API → Headless AutoCAD/Revit (cloud)
                         ├── Data Management API → ACC / BIM 360 (cloud storage)
                         └── Model Derivative API → File conversion (cloud)
```

### 3.5 Score

| Criterion | Score (1-5) | Notes |
|-----------|-------------|-------|
| Time to POC | 2 | Heavy setup, OAuth, credit management |
| Local Control | 1 | Cloud-only; data leaves premises |
| AutoCAD Support | 3 | Supported but limited to specific versions |
| Revit/BIM Support | 5 | Excellent; designed for this |
| Security | 3 | Autodesk handles infra, but we lose granular control |
| Long-term Viability | 4 | Backed by Autodesk, but pricing/roadmap uncertain |
| Cost | 2 | Pay-per-use can be expensive |
| **Weighted Total** | **2.55 / 5** | |

---

## 4. Option 2: Open-Source MCP (Python + COM)

### 4.1 Overview

Use existing open-source MCP servers that wrap AutoCAD/Revit COM automation via Python. These projects are built by the community for rapid local prototyping.

**Projects Evaluated** (see [`Existing_Tools_Research.md`](Existing_Tools_Research.md) for full details):
- **`ranvirw18/autocad-mcp-server`** — FastMCP, 10 tools, Pydantic validation, production-grade, MIT
- **`vigneshpbmenon/autocad-mcp-server`** — Minimal, 6 tools, easy to extend, MIT
- **`zh19980811/Easy-MCP-AutoCad`** — 15 tools, 64 stars, SQLite, **not actively maintained**
- **`Porta048/AutoCad-MCP`** — 11 tools, dimensions + text + save, multi-CAD support, MIT
- **`puran-water/autocad-mcp`** — 19 tools, dual backend (File IPC + ezdxf headless), complex but comprehensive
- **`Sam-AEC/aec-model-bridge`** — **100 Revit tools**, Python hub + C# add-in, mock mode, MIT
- **`shuotao/REVIT_MCP_study`** — 96 Revit tools, TypeScript + C#, 45 SOPs, well-documented
- **`autodesk-platform-services/aps-sample-mcp-server-revit-automation`** — Official Autodesk cloud sample, .NET 10

### 4.2 Pros

| Advantage | Details |
|-----------|---------|
| **Fastest setup** | Install Python + pywin32, run server, connect to AutoCAD |
| **Full local control** | Everything runs on your Windows machine; no internet needed |
| **Zero cloud cost** | No API credits, no subscriptions |
| **Low latency** | Direct COM calls; sub-second response for simple operations |
| **Highly adaptable** | Fork and modify to fit Roc4t standards |
| **Security** | Can run in sandbox, enforce file permissions, log everything |
| **Great for learning** | Exposes raw COM API; teaches how AutoCAD works |

### 4.3 Cons

| Disadvantage | Details |
|--------------|---------|
| **Code quality varies** | Community projects may have bugs, incomplete features |
| **Security audit needed** | Must review for injection risks, unsafe evals |
| **Maintenance risk** | Community projects may be abandoned |
| **Limited Revit support** | Most open-source projects focus on AutoCAD, not Revit |
| **No built-in viewer** | Need to build or integrate 3D viewer separately |
| **Windows-only** | COM requires Windows; cannot run on Linux/Mac |

### 4.4 Technical Architecture

```
AI Orchestrator → JSON-RPC (local socket) → MCP Server (Python)
                                              └── pywin32 → COM → AutoCAD.Application
                                              └── Revit API → Revit (if supported)
```

### 4.5 Recommended Implementation for Roc4t

**Phase 1**: Use an open-source AutoCAD MCP server as a starting point. **Recommended: `ranvirw18/autocad-mcp-server` (FastMCP, clean, tested) or `Porta048/AutoCad-MCP` (has dimensions + text + save)**. Fork it to:
- Add Roc4t-specific commands (layer setup with `ROC4T-*` prefix validation, standard blocks, template loading)
- Add input validation (prevent injection, restrict commands, layer name allow-list)
- Add audit logging
- Add sandbox file access restrictions
- Add `export_pdf` and `export_dwg` tools
- Add standard block library (`insert_block`, `define_block`)

**Code skeleton** (extends the adopted base):
```python
# mcp_server.py
from mcp.server import Server
from mcp.types import Tool, TextContent
import win32com.client
import os

app = Server("roc4t-autocad-mcp")

@app.tool()
async def create_layer(name: str, color: int, linetype: str = "Continuous"):
    """Create a layer in the active AutoCAD document."""
    # Validate: only allowed layer names
    if not name.startswith("ROC4T-"):
        raise ValueError("Layer names must start with ROC4T-")
    
    acad = win32com.client.Dispatch("AutoCAD.Application")
    doc = acad.ActiveDocument
    layer = doc.Layers.Add(name)
    layer.color = color
    # Log for audit
    log_command("create_layer", name, "success")
    return TextContent(text=f"Layer '{name}' created.")

# Additional tools: add_line, insert_block, add_dimension, etc.
```

### 4.6 Score

| Criterion | Score (1-5) | Notes |
|-----------|-------------|-------|
| Time to POC | 5 | Can be running in hours |
| Local Control | 5 | Full on-premise control |
| AutoCAD Support | 5 | Direct COM access; full capability |
| Revit/BIM Support | 3 | Limited open-source options; may need custom work |
| Security | 4 | Fully sandboxable; requires audit |
| Long-term Viability | 3 | Community maintenance risk |
| Cost | 5 | Free |
| **Weighted Total** | **4.45 / 5** | |

---

## 5. Option 3: Custom Roc4t MVP MCP

### 5.1 Overview

Build a purpose-built MCP server **from scratch** (or by forking an open-source base) that is tailored to Roc4t's standards, security requirements, and workflow.

**Recommended base for forking**: `ranvirw18/autocad-mcp-server` (FastMCP, production-grade, Pydantic, MIT) or `Porta048/AutoCad-MCP` (closest tool set to our needs: dimensions, text, save). See [`Existing_Tools_Research.md`](Existing_Tools_Research.md) for full evaluation.

### 5.2 Approach

**Phase 1**: Start with Option 2 (adopt an open-source base) to prove the concept.

**Phase 2**: Fork and rewrite with Roc4t-specific architecture:

```
roc4t-mcp-server/
├── config/
│   ├── standards.json          # Roc4t layer names, colors, blocks
│   ├── templates.json          # Template file paths
│   └── security.json           # Allowed commands, file paths
├── src/
│   ├── server.py              # MCP server core (FastAPI / JSON-RPC)
│   ├── handlers/
│   │   ├── autocad.py         # AutoCAD COM wrapper
│   │   ├── revit.py           # Revit API wrapper
│   │   └── query.py           # Read-only introspection
│   ├── validators/
│   │   ├── input_validator.py # Command allow-list, parameter checks
│   │   └── output_validator.py # Standards compliance checks
│   ├── security/
│   │   ├── sandbox.py         # File system restrictions
│   │   └── audit.py           # Logging & audit trail
│   └── standards/
│       └── roc4t_standards.py # Roc4t-specific rules engine
├── tests/
│   └── test_commands.py       # Unit tests for each command
└── logs/
    └── audit/                  # Append-only audit logs
```

### 5.3 Pros

| Advantage | Details |
|-----------|---------|
| **Perfect fit** | Designed exactly for Roc4t's workflow and standards |
| **Security** | Built-in allow-lists, sandbox, audit from day one |
| **Maintainability** | Clean codebase, no unused features, well-documented |
| **Extensibility** | Easy to add new commands, new software support |
| **Branding** | "Roc4t MCP Server" — professional, ownable |

### 5.4 Cons

| Disadvantage | Details |
|--------------|---------|
| **Development time** | 2–4 weeks of dedicated dev work |
| **Requires expertise** | Need Python + COM + AutoCAD/Revit API knowledge |
| **Maintenance burden** | Ongoing updates for new AutoCAD/Revit versions |
| **Not proven** | Unproven code; more bugs initially |

### 5.5 Score

| Criterion | Score (1-5) | Notes |
|-----------|-------------|-------|
| Time to POC | 2 | Requires significant dev time |
| Local Control | 5 | Full control by design |
| AutoCAD Support | 5 | Can implement any COM feature |
| Revit/BIM Support | 5 | Can implement any Revit API feature |
| Security | 5 | Security-first design |
| Long-term Viability | 5 | Fully owned, maintained by Roc4t |
| Cost | 4 | Dev time, but no licensing |
| **Weighted Total** | **4.05 / 5** | |

---

## 6. Option 4: Claude as MCP Client + Custom Roc4t MCP Server (RECOMMENDED)

> **This is the selected architecture for Roc4t.**

### 6.1 Overview

Since **Claude has been selected as the AI orchestrator**, we no longer need a custom Python orchestrator (no LangChain, no LangGraph, no FastAPI). Claude acts as the MCP client, and we build a **custom MCP server** that exposes AutoCAD/Revit tools.

**Key insight**: We only need to build the MCP server. Claude handles all reasoning, planning, error recovery, and validation natively.

**Architecture**:
```
Claude Desktop (MCP Client) → MCP stdio → Roc4t MCP Server (Python + pywin32) → AutoCAD/Revit
```

### 6.2 Pros

| Advantage | Details |
|-----------|---------|
| **No custom AI orchestrator** | Claude handles reasoning, planning, validation out of the box |
| **Fastest time to value** | We only build tools, not an orchestration framework |
| **Natural conversation** | Project Lead types in plain language; Claude responds naturally |
| **Mature reasoning** | Claude's task decomposition is excellent, no custom prompt engineering needed |
| **Easy to extend** | Add a new tool to the MCP server → Claude immediately knows how to use it |
| **Local MCP server** | Data stays on-premise; only natural language goes to Anthropic |
| **Standard protocol** | MCP is Anthropic's official protocol, well-documented |

### 6.3 Cons

| Disadvantage | Details |
|--------------|---------|
| **Claude dependency** | Deep dependency on Anthropic's product |
| **Claude Desktop required** | Need to install Claude Desktop on the workstation |
| **MCP SDK is new** | Official `mcp` Python SDK is still evolving |
| **No programmatic API (Phase 1)** | Claude Desktop is interactive; API mode is Phase 2+ |
| **Cost** | Claude Pro subscription (~$20/mo) or API usage |

### 6.4 Score

| Criterion | Score (1-5) | Notes |
|-----------|-------------|-------|
| Time to POC | 5 | We only build tools, not an orchestrator |
| Local Control | 5 | MCP server runs locally; Claude Desktop is local |
| AutoCAD Support | 5 | Full COM access via custom server |
| Revit/BIM Support | 5 | Full API access via custom server |
| Security | 5 | Full sandbox, allow-list, audit in our server |
| Long-term Viability | 4 | Claude is mature; MCP is evolving |
| Cost | 4 | Claude Pro + dev time |
| **Weighted Total** | **4.95 / 5** | |

---

## 7. Comparative Analysis

| Criterion | Option 1 (Autodesk) | Option 2 (Open-source) | Option 3 (Custom) | **Option 4 (Claude + Custom)** |
|-----------|---------------------|------------------------|-------------------|--------------------------------|
| **Time to POC** | 2 weeks | 2 days | 3–4 weeks | **3–5 days** |
| **Local Control** | Cloud-only | Full local | Full local | **Full local** |
| **AutoCAD Support** | Limited | Excellent | Excellent | **Excellent** |
| **Revit/BIM Support** | Excellent | Limited | Excellent | **Excellent** |
| **Security** | Moderate | Good (with audit) | Excellent | **Excellent** |
| **Long-term Viability** | Vendor-dependent | Community risk | Fully owned | **Claude + own server** |
| **Cost** | $$–$$$ | Free | Dev time | **Claude Pro + dev time** |
| **Custom AI code** | None needed | None needed | 5,000+ lines | **~1,500 lines (tools only)** |
| **Weighted Score** | **2.55** | **4.45** | **4.05** | **4.95** |

---

## 8. Final Recommendation

> **Selected Architecture: Option 4 — Claude as MCP Client + Custom Roc4t MCP Server**

Since Claude has been selected as the AI orchestrator, the entire architecture simplifies. We do NOT build a custom AI orchestrator in Python. Instead:

- **Claude** handles reasoning, planning, error recovery, and validation
- **We** build the MCP server that exposes AutoCAD/Revit tools
- **MCP protocol** connects them (stdio for Desktop, SSE for API)

### Phase 1 (AutoCAD POC — Weeks 1-2): **Build Roc4t MCP Server for AutoCAD**

**Why**: Claude handles all the "intelligence." We only need to build the tools that manipulate AutoCAD. This is the fastest path to value.

**Action plan**:
1. Install Claude Desktop on the CAD workstation
2. Install the official `mcp` Python SDK (`pip install mcp`)
3. Create `server.py` with the first tool (e.g., `create_document`)
4. Configure Claude Desktop to connect to `server.py` via stdio
5. Test end-to-end: type a request in Claude → see tool call → see AutoCAD action
6. Add tools incrementally: layers → drawing → blocks → dimensions → export
7. Add security layer (input validation, sandbox, audit logging)
8. Add standards engine (enforce Roc4t naming, layers, blocks)

**See**: [`Claude_MCP_Architecture.md`](Claude_MCP_Architecture.md) for detailed implementation guide.

### Phase 2 (BIM Extension — Weeks 3-4): **Extend MCP Server to Revit**

**Why**: Same pattern — Claude handles reasoning, we add Revit tools to the MCP server.

**Action plan**:
1. Add Revit tools to the existing MCP server (pyRevit or Revit API)
2. Test Claude's ability to orchestrate AutoCAD + Revit workflows
3. Add 2D/BIM consistency validation tools

### Phase 3 (Industrialization — Month 2+): **Harden & Scale**

**Why**: By now we have a proven MCP server. We harden it for production and add Claude API support for programmatic access.

**Action plan**:
1. Full security audit of the MCP server
2. Comprehensive test suite (> 90% coverage)
3. Claude API integration (for web app / batch processing)
4. Performance optimization (< 30s per layout)
5. Documentation and handover

---

## 9. Immediate Next Steps

| Step | Action | Owner | Due |
|------|--------|-------|-----|
| 1 | Install Claude Desktop on CAD workstation | Technical Lead | Day 0 |
| 2 | Install `mcp` Python SDK (`pip install mcp`) | Technical Lead | Day 0 |
| 3 | Create `server.py` skeleton with 1 test tool | Technical Lead | Day 1 |
| 4 | Configure Claude Desktop to connect to server | Technical Lead | Day 1 |
| 5 | Test end-to-end: Claude → MCP → AutoCAD | Technical Lead | Day 2 |
| 6 | Add document, layer, and drawing tools | Technical Lead | Day 3-4 |
| 7 | Add block, dimension, and export tools | Technical Lead | Day 5-6 |
| 8 | Add security layer (input validation, sandbox) | Technical Lead | Day 7 |
| 9 | Add audit logging | Technical Lead | Day 7 |
| 10 | Add standards engine | Technical Lead | Day 8 |
| 11 | Write unit tests | Technical Lead | Day 9-10 |
| 12 | Integration test with Use Case 1 | Technical Lead + Production | Day 11-12 |
| 13 | Demo to stakeholders | Project Lead | Day 14 |

---

## 10. Appendix: Evaluated Open-Source Projects

### AutoCAD MCP Servers

| Project | URL | Language | Tools | Layer | Block | Dim | Export | Tests | Maintained | License | Notes |
|---------|-----|----------|-------|-------|-------|-----|--------|-------|------------|---------|-------|
| `ranvirw18/autocad-mcp-server` | mcpservers.org | Python 3.11+ | 10 | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ (2026) | MIT | FastMCP, Pydantic, production-grade |
| `vigneshpbmenon/autocad-mcp-server` | GitHub | Python 3.8+ | 6 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (2026) | MIT | Minimal, clean, easy to extend |
| `zh19980811/Easy-MCP-AutoCad` | GitHub | Python 3.10+ | 15 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ (stale) | MIT | 64⭐, SQLite, **not maintained** |
| `Porta048/AutoCad-MCP` | GitHub | Python 3.10+ | 11 | ❌ | ❌ | ✅ | ✅ (DWG) | ❌ | ✅ | MIT | Multi-CAD, dim + text + save |
| `puran-water/autocad-mcp` | GitHub | Python 3.10+ + AutoLISP | 19 | ✅ | ✅ | ✅ | ✅ | ❌ | ❓ | MIT | Strongest AutoCAD LT match; AutoLISP + headless DXF backend |
| `daobataotie/CAD-MCP` | GitHub | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | Broad CAD natural-language control server |
| `AnCode666/multiCAD-mcp` | GitHub | Python | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | Multi-CAD support including AutoCAD/ZWCAD |
| `nguyenngocdue/DeepBIM-MCP-Autocad-Plugin` | GitHub | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | AutoCAD AI assistant bridge over MCP via TCP/HTTP |
| `Igualguana/AUTOCAD-ELECTRICAL-MCP` | GitHub | Python + JS | 46 | N/A | N/A | N/A | N/A | ❓ | ❓ | ? | Electrical only, not applicable |

### Revit MCP Servers

| Project | URL | Language | Tools | Local | Cloud | Mock | Maintained | License | Notes |
|---------|-----|----------|-------|-------|-------|------|------------|---------|-------|
| `Sam-AEC/aec-model-bridge` | GitHub | Python + C# | **100** | ✅ | ❌ | ✅ | ✅ (2026) | MIT | **Best Revit option**, ExternalEvent, 2024–2027 |
| `shuotao/REVIT_MCP_study` | GitHub | TypeScript + C# | 96 | ✅ | ❌ | ❌ | ✅ | ? | 45 SOPs, 22 Claude skills, WebSocket |
| `APS sample` | GitHub | C# .NET 10 | ~10 | ❌ | ✅ | ❌ | ✅ | MIT | Official Autodesk cloud sample |
| `mcp-server-for-revit-dotnet` | GitHub | C# | ~10 | ✅ | ❌ | ❌ | ❓ | ? | Tutorial project |

**Recommendation**: Fork `ranvirw18/autocad-mcp-server` (AutoCAD) and `Sam-AEC/aec-model-bridge` (Revit) as bases. Both are MIT-licensed, actively maintained, and provide the cleanest architecture for extension. See [`Existing_Tools_Research.md`](Existing_Tools_Research.md) for detailed evaluation.

*(For Roc4t, we recommend adopting these open-source bases rather than building from scratch — estimated time savings: 2 weeks for AutoCAD, 2–3 weeks for Revit.)*

---

*This evaluation is a living document. As we progress through Phase 1, we should revisit this decision and update scores based on real-world experience.*
