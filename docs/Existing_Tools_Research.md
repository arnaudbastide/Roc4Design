# Existing MCP Tools Research & Evaluation
## Roc4t AI-Assisted Design Pipeline

> **Date**: Pre-implementation | **Owner**: Technical Lead | **Status**: Research Complete — Adopt & Extend Recommended

---

## 1. Executive Summary

Real GitHub and MCP registry research reveals **multiple viable open-source MCP servers** for both AutoCAD and Revit. Rather than building everything from scratch, Roc4t should **adopt the best-fitting existing server as a foundation and extend it** with our standards, security layer, and workflow-specific tools.

**Key Finding**: There is no single existing server that perfectly matches Roc4t's needs (standards enforcement, layer prefix validation, block libraries, PDF export). However, several are excellent starting points that can save 2–3 weeks of initial development.

**Recommendation**:
- **AutoCAD**: Fork and extend `vigneshpbmenon/autocad-mcp-server` or `ranvirw18/autocad-mcp-server` (clean Python COM, MIT license, FastMCP)
- **Revit**: Fork and extend `shuotao/REVIT_MCP_study` or `Sam-AEC/aec-model-bridge` (most mature, well-documented)
- **Fallback**: Build from official `mcp` SDK if fork integration exceeds 5 days

---

## 2. Research Methodology

| Source | Searched | Results |
|--------|----------|---------|
| GitHub | `autocad mcp server` | 8+ repos |
| GitHub | `revit mcp server` | 6+ repos |
| mcpservers.org | AutoCAD category | 3 entries |
| glama.ai/mcp | AutoCAD + Revit | 6 entries |
| lobehub.com/mcp | AutoCAD + Revit | 8 entries |
| snyk.io/articles | CAD MCP servers | 1 aggregated article |
| Autodesk official | APS MCP sample | 1 sample repo |

**Evaluation criteria used**:
1. **License** (MIT = preferred, Apache = acceptable, proprietary = rejected)
2. **Maintenance** (active 2025–2026 = good, stale 2023 = risk)
3. **Scope match** (does it cover AutoCAD/Revit COM, not just LT/AutoLISP?)
4. **Standards support** (can we enforce Roc4t layer names, blocks?)
5. **Extensibility** (clean code, modular, easy to add tools)
6. **Claude compatibility** (tested with Claude Desktop, stdio transport)
7. **Test coverage** (unit tests present = lower risk)

---

## 3. AutoCAD MCP Servers — Detailed Evaluation

### 3.1 `ranvirw18/autocad-mcp-server` (mcpservers.org)

| Attribute | Detail |
|-----------|--------|
| **URL** | `https://mcpservers.org/servers/ranvirw18/autocad-mcp-server.git` |
| **Language** | Python 3.11+ |
| **Framework** | FastMCP |
| **License** | MIT |
| **Last Update** | June 2026 |
| **Tools** | 10 core CAD tools |

**Tools available**:
- `draw_line`, `draw_polyline`, `draw_rectangle`, `draw_circle`
- Layer management
- Document operations
- Natural language control

**Pros**:
- ✅ Production-grade claims (Pydantic validation, logging, unit tests)
- ✅ FastMCP framework (clean, modern Python MCP SDK)
- ✅ Auto-reconnection on AutoCAD restart
- ✅ Full type hints & Pydantic validation
- ✅ Unit tests covering all tools
- ✅ Direct COM calls, no network overhead

**Cons**:
- ⚠️ No block management tools listed
- ⚠️ No dimension tools listed
- ⚠️ No PDF/DWG export tools listed
- ⚠️ Limited to basic geometry
- ⚠️ Newer project (limited community validation)

**Roc4t fit**: **Good foundation**. FastMCP is clean, Pydantic validation aligns with our security goals. We would need to add: blocks, dimensions, export, layer prefix validation, standards engine.

**Verdict**: **Adopt as base** — saves ~1 week of plumbing work.

---

### 3.2 `vigneshpbmenon/autocad-mcp-server`

| Attribute | Detail |
|-----------|--------|
| **URL** | `https://github.com/vigneshpbmenon/autocad-mcp-server` |
| **Language** | Python 3.8+ |
| **Framework** | Native MCP SDK (or FastMCP) |
| **License** | MIT |
| **Last Update** | 2026 (v0.1) |
| **Tools** | 6 basic drawing tools |

**Tools available**:
- `draw_line`, `draw_polyline`, `draw_rectangle`, `draw_circle`, `draw_ellipse`, `draw_arc`

**Pros**:
- ✅ Clean, minimal codebase
- ✅ Easy to understand and extend
- ✅ Direct AutoCAD COM integration
- ✅ `uv` package manager support (modern Python tooling)
- ✅ MIT license

**Cons**:
- ⚠️ Very basic (only 6 geometry tools)
- ⚠️ No layer management
- ⚠️ No blocks, dimensions, text, export
- ⚠️ No tests mentioned
- ⚠️ v0.1 — early stage

**Roc4t fit**: **Good minimal base**. Very clean, but we'd add ~80% of the tools ourselves. Best if we want a minimal codebase to own fully.

**Verdict**: **Adopt as minimal base** if we want maximum control; **less recommended** than `ranvirw18` if we want to save time.

---

### 3.3 `zh19980811/Easy-MCP-AutoCad` (64 ⭐ on GitHub)

| Attribute | Detail |
|-----------|--------|
| **URL** | `https://github.com/zh19980811/Easy-MCP-AutoCad` |
| **Language** | Python 3.10+ |
| **License** | MIT |
| **Last Update** | 2025 (not actively maintained) |
| **Stars** | 64 |
| **Tools** | 15+ tools including drawing, layer mgmt, analysis |

**Tools available**:
- `create_new_drawing`, `draw_line`, `draw_circle`, `set_layer`
- `highlight_text`, `scan_elements`, `export_to_database`
- `scan_all_entities`, `highlight_entity`, `count_text_patterns`
- `draw_device_connection`, `execute_query`, `query_and_highlight`
- SQLite database integration

**Pros**:
- ✅ Most feature-rich of the open-source AutoCAD MCP servers
- ✅ SQLite database for CAD element tracking
- ✅ Layer management
- ✅ Element analysis and highlighting
- ✅ Text pattern matching and counting
- ✅ Device connection drawing
- ✅ Good star count (community validation)
- ✅ YouTube demo video

**Cons**:
- ⚠️ **NOT actively maintained** — author explicitly states this
- ⚠️ No blocks, dimensions, or export tools
- ⚠️ Code quality unknown (no test coverage mentioned)
- ⚠️ SQLite approach may not align with Roc4t's simple file-based workflow
- ⚠️ May have security issues (needs audit)

**Roc4t fit**: **Use for reference only**. The SQLite/element-analysis features are interesting but not core to our use case. The maintenance risk is too high for a dependency.

**Verdict**: **Study, don't fork**. Read the code for patterns, but do not adopt as a dependency.

---

### 3.4 `Porta048/AutoCad-MCP`

| Attribute | Detail |
|-----------|--------|
| **URL** | `https://github.com/Porta048/AutoCad-MCP` |
| **Language** | Python 3.10+ |
| **License** | MIT |
| **CAD Support** | AutoCAD, GstarCAD, ZWCAD |
| **Tools** | 11 tools |

**Tools available**:
- `draw_line`, `draw_circle`, `draw_arc`, `draw_ellipse`, `draw_rectangle`, `draw_polyline`
- `draw_text`, `draw_hatch`, `add_dimension`, `save_drawing`, `process_command`

**Pros**:
- ✅ Multi-CAD support (AutoCAD, GstarCAD, ZWCAD)
- ✅ Has `add_dimension` — rare in open-source MCP servers
- ✅ Has `draw_text` and `draw_hatch`
- ✅ Has `save_drawing` (DWG export)
- ✅ Natural language command processing (`process_command`)
- ✅ Configurable CAD type in `config.json`

**Cons**:
- ⚠️ No layer management with prefix validation
- ⚠️ No block insertion/definition
- ⚠️ No PDF export
- ⚠️ No tests mentioned
- ⚠️ Italian-first documentation (though English exists)

**Roc4t fit**: **Good feature set**. The `add_dimension`, `draw_text`, and `save_drawing` tools are closer to our needs. Multi-CAD support is irrelevant for Roc4t but shows code quality.

**Verdict**: **Strong candidate for adoption**. The tool set is the closest to our Use Case 1 requirements.

---

### 3.5 `puran-water/autocad-mcp` (AutoCAD LT AutoLISP MCP Server)

| Attribute | Detail |
|-----------|--------|
| **URL** | `https://github.com/puran-water/autocad-mcp` |
| **Language** | Python 3.10+ (server) + AutoLISP (AutoCAD) |
| **License** | MIT |
| **Backends** | Dual: File IPC (Windows) + ezdxf (headless) |
| **Tools** | 19 consolidated tools |

**Tools available**:
- `drawing`, `entity`, `layer`, `block`, `annotation`
- `pid`, `view`, `system`, `query`, `search`, `geometry`
- `select`, `modify`, `validate`, `export`, `xref`, `layout`, `electrical`
- `execute_lisp` (run arbitrary AutoLISP)
- Headless DXF generation via `ezdxf` (no AutoCAD needed)
- Screenshot via Win32 `PrintWindow`

**Pros**:
- ✅ **Most comprehensive open-source AutoCAD MCP server**
- ✅ Has `block` and `layer` tools
- ✅ Has `export` tool
- ✅ Has `annotation` and `dimension` tools
- ✅ Has `validate` tool (drawing validation)
- ✅ Dual backend: can run headless (ezdxf) or with AutoCAD (File IPC)
- ✅ `execute_lisp` — escape hatch for any AutoCAD operation
- ✅ AutoCAD LT support (not just full AutoCAD)
- ✅ Screenshot capability
- ✅ P&ID support (process engineering)

**Cons**:
- ⚠️ **File IPC backend is complex** — uses JSON files + AutoLISP dispatcher + `PostMessageW` keystrokes
- ⚠️ Dual backend adds complexity we don't need
- ⚠️ AutoCAD LT focus; full AutoCAD COM may be simpler for our use case
- ⚠️ Not clear if actively maintained
- ⚠️ Code may be over-engineered for our needs

**Roc4t fit**: **Excellent match for AutoCAD LT automation**. It is the strongest candidate if we must support AutoCAD LT, because it uses AutoLISP on Windows and also supports headless DXF generation through a separate `ezdxf` backend. For full AutoCAD production automation, COM-based servers may still be simpler for PDF plotting and document control.

**Verdict**: **Strong AutoCAD LT candidate**. Use as the primary reference/base for LT workflows and keep the `ezdxf` backend in mind for headless CI/testing. For full AutoCAD COM workflows, compare directly against `ranvirw18` and `Porta048`.

---

### 3.6 Additional candidate note

`zh19980811/Easy-MCP-AutoCad` is already covered in section 3.3. It remains useful as a learning/reference project for natural-language AutoCAD control, but it is less compelling as a production base than `puran-water`, `ranvirw18`, or `Porta048`.

---

### 3.7 `daobataotie/CAD-MCP`

| Attribute | Detail |
|-----------|--------|
| **URL** | `https://github.com/daobataotie/CAD-MCP` |
| **Language** | Python |
| **Role** | Broader CAD control server for natural-language drawing operations |

**Roc4t fit**: Potentially useful for drawing-operation patterns across CAD tools. Needs deeper evaluation before considering it as a base for AutoCAD-specific production workflows.

**Verdict**: **Evaluate as broad CAD reference**.

---

### 3.8 `AnCode666/multiCAD-mcp`

| Attribute | Detail |
|-----------|--------|
| **URL** | `https://github.com/AnCode666/multiCAD-mcp` |
| **Language** | Python |
| **CAD Support** | AutoCAD, ZWCAD, and other CAD-style workflows |

**Roc4t fit**: Useful if multi-CAD support becomes important, especially for teams with ZWCAD or mixed CAD environments. For Phase 1, multi-CAD scope may add avoidable complexity.

**Verdict**: **Keep as multi-CAD fallback/reference**.

---

### 3.9 `nguyenngocdue/DeepBIM-MCP-Autocad-Plugin`

| Attribute | Detail |
|-----------|--------|
| **URL** | `https://github.com/nguyenngocdue/DeepBIM-MCP-Autocad-Plugin` |
| **Role** | AutoCAD plugin/server focused on connecting AutoCAD with AI assistants over MCP via TCP/HTTP |
| **Transport** | TCP/HTTP-oriented integration |

**Roc4t fit**: Relevant if we decide stdio is too limiting and want a TCP/HTTP bridge to AutoCAD. Needs hands-on testing for stability, tool coverage, and license fit.

**Verdict**: **Evaluate for transport architecture ideas**.

---

### 3.10 `Igualguana/AUTOCAD-ELECTRICAL-MCP`

| Attribute | Detail |
|-----------|--------|
| **URL** | `https://github.com/Igualguana/AUTOCAD-ELECTRICAL-MCP` |
| **Language** | Python + JavaScript |
| **License** | Unknown |
| **Operations** | 46 AutoCAD Electrical operations |
| **Modes** | Claude Code CLI + Web Dashboard (Ollama) |

**Pros**:
- ✅ 46 operations — very comprehensive
- ✅ Dual mode (Claude Code + local Ollama web dashboard)
- ✅ macOS + Windows support
- ✅ Web dashboard for non-Claude users

**Cons**:
- ⚠️ **Specific to AutoCAD Electrical** — not general AutoCAD
- ⚠️ Unknown license
- ⚠️ Overkill for architectural office layouts
- ⚠️ Different domain (electrical vs. interior/architecture)

**Roc4t fit**: **Not applicable** — wrong domain.

**Verdict**: **Skip**.

---

### 3.11 AutoCAD MCP Server Comparison Matrix

| Server | Tools | Layer | Block | Dim | Text | Export | Tests | Maintained | License | Roc4t Fit |
|--------|-------|-------|-------|-----|------|--------|-------|------------|---------|-----------|
| `ranvirw18` | 10 | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ (2026) | MIT | ⭐⭐⭐⭐ |
| `vigneshpbmenon` | 6 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (2026) | MIT | ⭐⭐⭐ |
| `zh19980811` | 15 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ (stale) | MIT | ⭐⭐ |
| `Porta048` | 11 | ❌ | ❌ | ✅ | ✅ | ✅ (DWG) | ❌ | ✅ | MIT | ⭐⭐⭐⭐ |
| `puran-water` | 19 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❓ | MIT | ⭐⭐⭐⭐ |
| `daobataotie/CAD-MCP` | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | ⭐⭐ |
| `AnCode666/multiCAD-mcp` | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | ⭐⭐⭐ |
| `DeepBIM-MCP-Autocad-Plugin` | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | ⭐⭐ |
| `AUTOCAD-ELECTRICAL` | 46 | N/A | N/A | N/A | N/A | N/A | ❓ | ❓ | ? | ⭐ |

**Legend**: ⭐⭐⭐⭐⭐ = adopt as base; ⭐⭐⭐⭐ = strong candidate; ⭐⭐⭐ = possible; ⭐⭐ = reference only; ⭐ = skip

---

## 4. Revit MCP Servers — Detailed Evaluation

### 4.1 `Sam-AEC/aec-model-bridge` (Autodesk-Revit-MCP-Server)

| Attribute | Detail |
|-----------|--------|
| **URL** | `https://github.com/Sam-AEC/aec-model-bridge` |
| **Language** | Python (MCP server) + C# .NET (Revit add-in) |
| **License** | MIT |
| **Revit Versions** | 2024, 2025, 2026, 2027 |
| **Tools** | **100 MCP tools** |
| **Architecture** | MCP stdio → Python hub → HTTP bridge → C# add-in → ExternalEvent → Revit API |

**Tools available** (100 total across categories):
- Model authoring (walls, floors, roofs, doors, windows)
- Documentation (views, sheets, schedules, tags)
- Parameters (get/set, shared parameters, families)
- Exports (DWG, PDF, IFC, Navisworks)
- Worksharing (synchronize, borrowing, permissions)
- Architecture, structure, MEP, geometry, QA

**Pros**:
- ✅ **Most comprehensive Revit MCP server available** (100 tools)
- ✅ Native C# Revit add-in (no pyRevit dependency)
- ✅ ExternalEvent architecture (thread-safe Revit API calls)
- ✅ Mock mode for testing without Revit
- ✅ Multi-platform provider architecture (IFC, Speckle, Rhino.Compute)
- ✅ Reflection API for advanced workflows
- ✅ Supports Revit 2024–2027
- ✅ Localhost-only by default (security)
- ✅ PowerShell install scripts
- ✅ Active development (2026)

**Cons**:
- ⚠️ Complex architecture (Python hub + C# add-in + HTTP bridge)
- ⚠️ .NET build requirements for each Revit version
- ⚠️ May be overkill for our Phase 2 needs
- ⚠️ 100 tools = large codebase to understand and extend

**Roc4t fit**: **Excellent for Phase 2**. If we need deep Revit integration, this is the best starting point. The 100 tools cover almost everything we might need. However, the complexity may require 3–5 days of setup before we can extend it.

**Verdict**: **Adopt as Revit base** — but plan for a 3–5 day integration sprint.

---

### 4.2 `shuotao/REVIT_MCP_study`

| Attribute | Detail |
|-----------|--------|
| **URL** | `https://github.com/shuotao/REVIT_MCP_study` |
| **Language** | TypeScript (Node.js MCP server) + C# (Revit add-in) |
| **License** | Unknown (assumed open source) |
| **Revit Version** | 2022+ |
| **Tools** | **96 runtime MCP tools** |
| **Extras** | 45 domain SOP files, 22 Claude skills |

**Architecture**:
```
AI Client (Claude Desktop / VS Code Copilot / Gemini CLI)
  → stdio → Node.js MCP Server (TypeScript)
  → WebSocket (ws://localhost:8964) → C# Revit Add-in
  → ExternalEvent → Revit API
```

**Tools available** (96 total):
- Wall creation, floor creation, door/window insertion
- Element query and filtering
- Parameter get/set
- View and level management
- Model information and state sync

**Pros**:
- ✅ Very well documented (knowledge station website)
- ✅ 96 tools — comprehensive
- ✅ Multi-AI-platform support (Claude, Gemini, Copilot, Antigravity)
- ✅ 45 domain SOP files (domain knowledge built-in)
- ✅ 22 Claude skills (prompt engineering templates)
- ✅ YouTube demo videos
- ✅ Real-time bidirectional WebSocket communication
- ✅ Clean separation: TypeScript server + C# add-in

**Cons**:
- ⚠️ TypeScript/Node.js instead of Python (our preferred stack)
- ⚠️ WebSocket transport instead of simpler HTTP
- ⚠️ SOP files are in Chinese (domain knowledge may need translation)
- ⚠️ Unknown license
- ⚠️ Code maturity unclear (described as "study" project)

**Roc4t fit**: **Good reference, stack mismatch**. The domain SOP files and Claude skills are valuable intellectual property we could learn from. But TypeScript/Node.js is not our target stack (Python). We could port concepts.

**Verdict**: **Study for architecture and SOP patterns**; do not adopt directly.

---

### 4.3 `autodesk-platform-services/aps-sample-mcp-server-revit-automation`

| Attribute | Detail |
|-----------|--------|
| **URL** | `https://github.com/autodesk-platform-services/aps-sample-mcp-server-revit-automation` |
| **Language** | C# (.NET 10) |
| **License** | MIT (Autodesk sample) |
| **Approach** | Cloud — APS Automation API |
| **Auth** | Service-to-Service (SSA) with JWT + RSA |

**Architecture**:
```
MCP Client (Claude/VS Code)
  → MCP Protocol (HTTP)
  → .NET MCP Server
  → HTTPS + Bearer Token
  → Autodesk Automation API for Revit (Cloud)
  → Headless Revit execution on ACC/BIM360 models
```

**Pros**:
- ✅ **Official Autodesk sample** — best practices from the vendor
- ✅ Cloud-native — no local Revit needed for execution
- ✅ Scalable — multiple workitems in parallel
- ✅ Works with ACC/BIM360 cloud models
- ✅ Fluent API with type-safe model configuration
- ✅ SSA authentication (enterprise-grade)

**Cons**:
- ⚠️ **Cloud-only** — data leaves premises
- ⚠️ **APS subscription required** — ongoing cost
- ⚠️ **Latency** — 30–120s per operation (upload → process → download)
- ⚠️ **.NET 10 SDK required** — bleeding edge
- ⚠️ Requires APS app registration, service accounts, private keys
- ⚠️ "Vibe-coded sample" — Autodesk explicitly says it's experimental
- ⚠️ Doesn't match our "local data sovereignty" requirement

**Roc4t fit**: **Not suitable for Phase 1–2**. The cloud dependency and latency conflict with our local-control requirements. However, worth revisiting in Phase 3 if we need batch processing or client cloud collaboration.

**Verdict**: **Skip for now; revisit in Phase 3**.

---

### 4.4 `mcp-servers-for-revit/mcp-server-for-revit-dotnet`

| Attribute | Detail |
|-----------|--------|
| **URL** | `https://github.com/mcp-servers-for-revit/mcp-server-for-revit-dotnet` |
| **Language** | C# full stack |
| **License** | Unknown |
| **Purpose** | Tutorial + MCP server for Revit |
| **Transports** | stdio, SSE, Stream |

**Pros**:
- ✅ C# full stack — no Python/TypeScript bridge needed
- ✅ Tutorial documentation for learning MCP
- ✅ Supports multiple transports (stdio, SSE, Stream)

**Cons**:
- ⚠️ Limited tool set (tutorial scope)
- ⚠️ Less mature than `Sam-AEC` or `shuotao`
- ⚠️ No mention of Revit version support

**Roc4t fit**: **Reference only**. Good for learning MCP internals, but `Sam-AEC` is more feature-complete.

**Verdict**: **Study, don't adopt**.

---

### 4.5 Revit MCP Server Comparison Matrix

| Server | Tools | Version | Local | Cloud | Tests | Maintained | License | Stack | Roc4t Fit |
|--------|-------|---------|-------|-------|-------|------------|---------|-------|-----------|
| `Sam-AEC/aec-model-bridge` | 100 | 2024–2027 | ✅ | ❌ | Mock mode | ✅ (2026) | MIT | Python + C# | ⭐⭐⭐⭐⭐ |
| `shuotao/REVIT_MCP_study` | 96 | 2022+ | ✅ | ❌ | ❓ | ✅ | ? | TypeScript + C# | ⭐⭐⭐⭐ |
| `APS sample` | ~10 | Cloud | ❌ | ✅ | ❓ | ✅ | MIT | C# .NET 10 | ⭐⭐⭐ |
| `mcp-server-for-revit-dotnet` | ~10 | ? | ✅ | ❌ | ❓ | ❓ | ? | C# | ⭐⭐⭐ |

---

## 5. Adopt vs. Build Decision Matrix

### 5.1 AutoCAD — Recommendation: **Adopt + Extend**

| Approach | Time | Risk | Fit | Recommendation |
|----------|------|------|-----|----------------|
| **Adopt `ranvirw18` + extend** | 5–7 days | Low | Good | **Primary choice** — clean FastMCP base, add our tools |
| **Adopt `Porta048` + extend** | 5–7 days | Low | Good | **Secondary choice** — closer feature set (dim, text, save) |
| **Adopt `puran-water` + strip** | 7–10 days | Medium | Good | Complex architecture; strip dual backend, keep tools |
| **Build from `mcp` SDK** | 10–14 days | Low | Perfect | Full control, but no time savings |

**Selected approach**: **Adopt `ranvirw18/autocad-mcp-server` (or `Porta048`) as base, then extend with**:
- Roc4t layer prefix validation (`ROC4T-*`)
- Standard block library (`WKSTN-01`, `MEET-TBL-01`, etc.)
- `add_dimension` tool (if not in base)
- `export_pdf` and `export_dwg` tools
- `insert_block` and `define_block` tools
- Standards engine (JSON config)
- Security layer (input validation, sandbox, audit)

### 5.2 Revit — Recommendation: **Adopt + Extend (Phase 2)**

| Approach | Time | Risk | Fit | Recommendation |
|----------|------|------|-----|----------------|
| **Adopt `Sam-AEC/aec-model-bridge`** | 7–10 days | Medium | Excellent | **Primary choice** — 100 tools, mature architecture |
| **Study `shuotao`, port concepts to Python** | 10–14 days | Medium | Good | If we want Python-only stack |
| **Build from `mcp` SDK + pyRevit** | 14–21 days | Low | Perfect | Full control, but no time savings |

**Selected approach**: **Adopt `Sam-AEC/aec-model-bridge` for Phase 2**. It has the most mature Revit integration. The Python hub + C# add-in architecture is well-designed. We extend it with:
- Roc4t BIM standards (family naming, parameter rules)
- 2D/BIM consistency validation tools
- AutoCAD-to-Revit data sync tools

---

## 6. Integration Plan for Existing Tools

### 6.1 Week 1 — Evaluation & Fork

| Day | Task | Owner | Output |
|-----|------|-------|--------|
| Day 1 | Clone `ranvirw18/autocad-mcp-server` and `Porta048/AutoCad-MCP` | Technical Lead | Local copies |
| Day 2 | Run both servers; test with Claude Desktop | Technical Lead | Test report |
| Day 3 | Compare code quality, test coverage, extensibility | Technical Lead | Comparison doc |
| Day 4 | **Select base** and fork to `Roc4t/mcp-autocad` | Technical Lead | Forked repo |
| Day 5 | Add Roc4t standards config loader | Technical Lead | Config system |
| Day 6 | Add layer prefix validation + first standard block | Technical Lead | Working prototype |
| Day 7 | Write integration tests | Technical Lead | Test suite |

### 6.2 Week 2 — Extension

| Day | Task | Owner | Output |
|-----|------|-------|--------|
| Day 8 | Add all 10 Use Case 1 tools | Technical Lead | Tool set complete |
| Day 9 | Add export tools (PDF, DWG) | Technical Lead | Export working |
| Day 10 | Add security layer (sandbox, audit) | Technical Lead | Secure server |
| Day 11 | Integration test with Use Case 1 | Technical Lead + Production | Validated flow |
| Day 12 | Demo to stakeholders | Project Lead | Go/No-Go decision |

### 6.3 Phase 2 — Revit Integration (Weeks 3–4)

| Week | Task | Owner | Output |
|------|------|-------|--------|
| Week 3 | Clone `Sam-AEC/aec-model-bridge`; install Revit add-in | Technical Lead | Running Revit MCP |
| Week 4 | Extend with Roc4t BIM standards + sync tools | Technical Lead | Revit tools ready |

---

## 7. Risk Analysis of Adopting Existing Tools

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Base project abandoned** | High | Fork immediately; monitor upstream; maintain our own branch |
| **License conflict** | Low | All candidates are MIT; verify before forking |
| **Code quality issues** | Medium | Code review before fork; write tests for any adopted code |
| **Architecture mismatch** | Medium | Evaluate for 2–3 days before committing; keep "build from scratch" as fallback |
| **Security vulnerabilities** | Medium | Security audit of adopted code; add our own validation layer |
| **Missing critical features** | Low | All bases are missing features we need; we plan to extend anyway |
| **Claude Desktop incompatibility** | Medium | Test stdio transport on Day 2; if it fails, switch base |

---

## 8. Key URLs & References

### AutoCAD MCP Servers

| Project | URL | License |
|---------|-----|---------|
| `ranvirw18/autocad-mcp-server` | `https://mcpservers.org/servers/ranvirw18/autocad-mcp-server.git` | MIT |
| `vigneshpbmenon/autocad-mcp-server` | `https://github.com/vigneshpbmenon/autocad-mcp-server` | MIT |
| `zh19980811/Easy-MCP-AutoCad` | `https://github.com/zh19980811/Easy-MCP-AutoCad` | MIT |
| `Porta048/AutoCad-MCP` | `https://github.com/Porta048/AutoCad-MCP` | MIT |
| `puran-water/autocad-mcp` | `https://github.com/puran-water/autocad-mcp` | MIT |
| `daobataotie/CAD-MCP` | `https://github.com/daobataotie/CAD-MCP` | TBD |
| `AnCode666/multiCAD-mcp` | `https://github.com/AnCode666/multiCAD-mcp` | TBD |
| `nguyenngocdue/DeepBIM-MCP-Autocad-Plugin` | `https://github.com/nguyenngocdue/DeepBIM-MCP-Autocad-Plugin` | TBD |
| `Igualguana/AUTOCAD-ELECTRICAL-MCP` | `https://github.com/Igualguana/AUTOCAD-ELECTRICAL-MCP` | ? |

### Revit MCP Servers

| Project | URL | License |
|---------|-----|---------|
| `Sam-AEC/aec-model-bridge` | `https://github.com/Sam-AEC/aec-model-bridge` | MIT |
| `shuotao/REVIT_MCP_study` | `https://github.com/shuotao/REVIT_MCP_study` | ? |
| `APS sample` | `https://github.com/autodesk-platform-services/aps-sample-mcp-server-revit-automation` | MIT |
| `mcp-server-for-revit-dotnet` | `https://github.com/mcp-servers-for-revit/mcp-server-for-revit-dotnet` | ? |

### Blender / Visualization MCP Servers

| Project | URL | License | Notes |
|---------|-----|---------|-------|
| `ahujasid/blender-mcp` | `https://github.com/ahujasid/blender-mcp` | TBD | Strong starting point for Blender + AI workflows; connects Blender to an LLM through MCP for prompt-assisted modeling and scene manipulation |

**Kitchen model note**: ready-made professional kitchen geometry is usually sourced from 3D resource hubs or manufacturer/asset libraries, not MCP code repositories. Treat Blender MCP as the automation/control layer; treat kitchen equipment models as downloadable assets to import, normalize, tag, and place.

### MCP Registries & Directories

| Directory | URL |
|-----------|-----|
| MCP Servers | `https://mcpservers.org` |
| Glama MCP Directory | `https://glama.ai/mcp/servers` |
| LobeHub MCP | `https://lobehub.com/mcp` |
| MCP Market | `https://mcpmarket.com` |
| MCP Pizza | `https://mcp.pizza` |
| Snyk CAD MCP Article | `https://snyk.io/articles/9-mcp-servers-for-computer-aided-drafting-cad-with-ai/` |

---

## 9. Summary & Recommendation

### Final Recommendation: **Adopt + Extend Strategy**

| Phase | Base Project | What We Keep | What We Add |
|-------|--------------|--------------|-------------|
| **Phase 1 (AutoCAD)** | `ranvirw18/autocad-mcp-server` or `Porta048/AutoCad-MCP` | MCP server skeleton, COM connection, basic drawing tools | Layer validation, blocks, dimensions, export, standards engine, security, audit |
| **Phase 2 (Revit)** | `Sam-AEC/aec-model-bridge` | Python hub, C# add-in, 100 tools | Roc4t BIM standards, AutoCAD sync, QA tools |
| **Phase 3 (Review/Visualization)** | `ahujasid/blender-mcp` + asset libraries | Blender MCP control pattern | Kitchen asset import workflow, tagging, scale checks, IFC/glTF export |

### Time Savings Estimate

| Approach | Phase 1 Dev Time | Phase 2 Dev Time |
|----------|------------------|------------------|
| Build from scratch | 3–4 weeks | 4–6 weeks |
| **Adopt + Extend** | **1–2 weeks** | **2–3 weeks** |
| **Time saved** | **~2 weeks** | **~2–3 weeks** |

### Next Actions

1. **Day 1–2**: Clone `ranvirw18` and `Porta048`; run both; test with Claude Desktop
2. **Day 3**: Make adopt/build decision; fork selected repo
3. **Day 4–7**: Extend with Roc4t-specific tools and standards
4. **Day 8–12**: Integration test and demo

---

*This research document is current as of the search date. MCP is a rapidly evolving ecosystem; re-check these repositories before final commitment.*
