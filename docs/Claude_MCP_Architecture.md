# Claude MCP Architecture
## Roc4t AI-Assisted Design Pipeline

> **Status**: Approved | **Decision**: Claude as MCP Client + Custom Roc4t MCP Server

---

## 1. The Decision

**Claude has been selected as the AI orchestrator.** We do NOT build a custom Python orchestrator (no LangChain, no LangGraph, no FastAPI AI service).

**What we build instead**: A **custom MCP server** (`roc4t-mcp-server`) that exposes AutoCAD and Revit tools to Claude via the Model Context Protocol.

**Why this changes everything**:
- Claude handles reasoning, planning, error recovery, and validation natively
- We only need to build the "hands" (tools) that manipulate AutoCAD/Revit
- The architecture is simpler, faster to build, and more maintainable
- The Project Lead can converse naturally with Claude, no API needed

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  USER (Project Lead)                                      │
│  Types: "Create a 50m² office layout for 4 people"        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  CLAUDE DESKTOP (or Claude API)                             │
│  MCP Client — handles ALL reasoning                         │
│  • Understands the request                                  │
│  • Decomposes into tool calls                               │
│  • Calls tools via MCP stdio/SSE                            │
│  • Validates results                                        │
│  • Reports back to user                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ MCP Protocol (stdio for Desktop, SSE for API)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  ROC4T MCP SERVER (Python + mcp SDK + pywin32)            │
│  • Receives tool calls from Claude                          │
│  • Validates inputs against Roc4t standards                 │
│  • Converts to AutoCAD/Revit COM commands                   │
│  • Returns structured results to Claude                     │
│  • Logs every action for audit                                │
└──────────────────────┬──────────────────────────────────────┘
                       │ COM / Revit API
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  AUTOCAD / REVIT (Windows)                                  │
│  Executes drawing/modeling commands                         │
└──────────────────────┬──────────────────────────────────────┘
                       │ File Export
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  OUTPUT (DWG / PDF / RVT)                                 │
│  Saved to project folders                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. What Claude Does (We Don't Build This)

| Task | How Claude Handles It | Example |
|------|----------------------|---------|
| **Natural Language Understanding** | Claude parses the user's request directly | "50m² office for 4 people" → `area=50, occupancy=4, room_types=["open_office"]` |
| **Task Decomposition** | Claude breaks complex requests into tool call sequences | Creates 5-10 sequential tool calls |
| **Tool Selection** | Claude chooses the right tool based on context | `create_document` → `create_layers` → `draw_polyline` → `insert_block` |
| **Error Recovery** | Claude reads error responses and retries or asks for clarification | If layer creation fails, Claude tries again or reports the issue |
| **Output Validation** | Claude reads back results and checks for completeness | "I see 4 workstations and 1 meeting room. Total area: 50.2m². Looks correct." |
| **Summarization** | Claude reports results in natural language | "Done! I've created your layout. The PDF is saved at..." |

---

## 4. What We Build (Roc4t MCP Server)

### 4.1 Server Structure

```
src/mcp/
├── server.py              # MCP server entry point (mcp SDK)
├── tools/
│   ├── __init__.py
│   ├── document.py        # create_document, open_document, save_document
│   ├── drawing.py         # add_line, add_circle, add_polyline, add_text
│   ├── layer.py           # create_layer, set_layer_active, set_layer_color
│   ├── block.py           # insert_block, define_block, list_blocks
│   ├── dimension.py       # add_linear_dimension, add_aligned_dimension
│   ├── export.py          # export_pdf, export_dwg, export_dxf
│   ├── query.py           # list_layers, get_document_info, list_blocks
│   └── revit.py           # create_wall, create_door, create_room (Phase 2)
├── standards/
│   ├── __init__.py
│   ├── layers.json        # Roc4t layer definitions
│   ├── blocks.json        # Standard block library
│   ├── templates.json     # Template file paths
│   └── validation.py      # Standards compliance engine
├── security/
│   ├── __init__.py
│   ├── input_validator.py # Allow-list, parameter bounds
│   ├── sandbox.py         # File system restrictions
│   └── audit.py           # Audit logging
└── config/
    ├── settings.py        # Server configuration
    └── logging.yaml       # Logging configuration
```

### 4.2 Tool Definition Example

```python
# src/mcp/tools/drawing.py
from mcp.server import Server
from mcp.types import Tool, TextContent
import win32com.client

app = Server("roc4t-autocad")

@app.tool()
async def draw_polyline(
    points: list[list[float]], 
    layer: str = "ROC4T-WALL",
    closed: bool = True
) -> TextContent:
    """
    Draw a polyline in the active AutoCAD document.
    
    Args:
        points: List of [x, y, z] coordinates defining the polyline vertices
        layer: Layer name (must start with ROC4T-)
        closed: Whether to close the polyline (connect last to first point)
    
    Returns:
        TextContent with the entity ID and length of the created polyline
    """
    # Validate layer name
    if not layer.startswith("ROC4T-"):
        raise ValueError(f"Layer '{layer}' does not start with ROC4T-")
    
    # Validate points
    if len(points) < 2:
        raise ValueError("Polyline must have at least 2 points")
    
    # Get AutoCAD instance
    acad = win32com.client.Dispatch("AutoCAD.Application")
    doc = acad.ActiveDocument
    
    # Ensure layer exists
    try:
        doc.Layers.Item(layer)
    except Exception:
        raise ValueError(f"Layer '{layer}' does not exist. Create it first with create_layer.")
    
    # Convert points to AutoCAD format
    point_array = win32com.client.VARIANT(
        win32com.client.pythoncom.VT_ARRAY | win32com.client.pythoncom.VT_R8,
        [coord for point in points for coord in point]
    )
    
    # Draw polyline
    pline = doc.ModelSpace.AddPolyline(point_array)
    pline.Layer = layer
    pline.Closed = closed
    
    # Get length
    length = pline.Length
    entity_id = pline.Handle
    
    # Audit log
    audit.log("draw_polyline", {
        "layer": layer,
        "points": points,
        "closed": closed,
        "length": length,
        "entity_id": entity_id
    })
    
    return TextContent(
        text=f"Polyline created on layer '{layer}' (ID: {entity_id}, Length: {length:.2f} units)"
    )
```

### 4.3 Claude Desktop Configuration

To connect Claude Desktop to the Roc4t MCP server, add this to the Claude Desktop config:

**Windows**:
```json
// %APPDATA%\Claude\settings.json
{
  "mcpServers": {
    "roc4t-autocad": {
      "command": "python",
      "args": ["C:\\Roc4t\\src\\mcp\\server.py"],
      "env": {
        "ROC4T_PROJECT_DIR": "C:\\Projects",
        "ROC4T_STANDARDS_DIR": "C:\\Roc4t\\standards",
        "ROC4T_LOG_DIR": "C:\\Roc4t\\logs"
      }
    }
  }
}
```

**macOS / Linux**:
```json
// ~/Library/Application Support/Claude/settings.json
{
  "mcpServers": {
    "roc4t-autocad": {
      "command": "python3",
      "args": ["/path/to/roc4t/src/mcp/server.py"],
      "env": {
        "ROC4T_PROJECT_DIR": "/path/to/projects",
        "ROC4T_STANDARDS_DIR": "/path/to/roc4t/standards",
        "ROC4T_LOG_DIR": "/path/to/roc4t/logs"
      }
    }
  }
}
```

---

## 5. Example Conversation Flow

### User Request

```
User: Create a 50m² office layout for 4 people with a meeting room
```

### Claude's Internal Process

```
Claude thinks:
1. This is a 2D office layout request
2. Parameters: area=50m², occupancy=4, room_types=[open_office, meeting_room]
3. I need to:
   a. Create a new document from the standard template
   b. Set up layers
   c. Draw outer walls (approx 7m x 7.14m)
   d. Add partition for meeting room
   e. Insert 4 workstations
   f. Insert meeting table
   g. Add dimensions
   h. Add room labels
   i. Export to PDF

Claude calls tools sequentially:
```

### Tool Call Sequence

```
→ create_document(template="ROC4T-OFFICE-A3.dwt", project_id="ROC4T-001-LAYOUT")
← "Created ROC4T-001-LAYOUT.dwg from ROC4T-OFFICE-A3.dwt"

→ create_layer(name="ROC4T-WALL", color=7, linetype="Continuous")
← "Layer 'ROC4T-WALL' created."

→ create_layer(name="ROC4T-PARTITION", color=4, linetype="Continuous")
← "Layer 'ROC4T-PARTITION' created."

→ create_layer(name="ROC4T-FURN", color=6, linetype="Continuous")
← "Layer 'ROC4T-FURN' created."

→ create_layer(name="ROC4T-DIMS", color=1, linetype="Continuous")
← "Layer 'ROC4T-DIMS' created."

→ create_layer(name="ROC4T-TEXT", color=2, linetype="Continuous")
← "Layer 'ROC4T-TEXT' created."

→ draw_polyline(
    points=[[0,0,0],[7000,0,0],[7000,7140,0],[0,7140,0],[0,0,0]],
    layer="ROC4T-WALL",
    closed=true
  )
← "Polyline created on layer 'ROC4T-WALL' (ID: A1B2, Length: 28280.0 units)"

→ draw_polyline(
    points=[[3000,0,0],[3000,4000,0]],
    layer="ROC4T-PARTITION",
    closed=false
  )
← "Polyline created on layer 'ROC4T-PARTITION' (ID: A1B3, Length: 4000.0 units)"

→ insert_block(name="ROC4T-WKSTN-01", position=[1000,5000,0], layer="ROC4T-FURN")
← "Block 'ROC4T-WKSTN-01' inserted at (1000, 5000, 0)"

→ insert_block(name="ROC4T-WKSTN-01", position=[2500,5000,0], layer="ROC4T-FURN")
← "Block 'ROC4T-WKSTN-01' inserted at (2500, 5000, 0)"

→ insert_block(name="ROC4T-WKSTN-01", position=[1000,6000,0], layer="ROC4T-FURN")
← "Block 'ROC4T-WKSTN-01' inserted at (1000, 6000, 0)"

→ insert_block(name="ROC4T-WKSTN-01", position=[2500,6000,0], layer="ROC4T-FURN")
← "Block 'ROC4T-WKSTN-01' inserted at (2500, 6000, 0)"

→ insert_block(name="ROC4T-MEET-TBL-01", position=[5000,2000,0], layer="ROC4T-FURN")
← "Block 'ROC4T-MEET-TBL-01' inserted at (5000, 2000, 0)"

→ add_dimensions([
    {"type": "linear", "start": [0,0,0], "end": [7000,0,0], "offset": 500},
    {"type": "linear", "start": [7000,0,0], "end": [7000,7140,0], "offset": 500}
  ])
← "2 dimensions added."

→ add_text(text="Open Office (32m²)", position=[1500,3500,0], layer="ROC4T-TEXT", height=200)
← "Text added: 'Open Office (32m²)'"

→ add_text(text="Meeting Room (12m²)", position=[4500,3500,0], layer="ROC4T-TEXT", height=200)
← "Text added: 'Meeting Room (12m²)'"

→ export_pdf(filename="ROC4T-001-LAYOUT-V01.pdf", paper_size="A3", scale="1:50")
← "Exported to ROC4T-001-LAYOUT-V01.pdf"

→ save_document()
← "Document saved."
```

### Claude's Response to User

```
Claude: "Done! I've created a 50m² office layout with 4 workstations and a meeting room.

📐 Drawing Details:
• Total area: 50.0 m² (7.0m × 7.14m)
• Open office: 32 m² with 4 workstations
• Meeting room: 12 m² with table for 6 people
• Circulation: 6 m²

📁 Files Generated:
• ROC4T-001-LAYOUT-V01.dwg
• ROC4T-001-LAYOUT-V01.pdf

All elements use Roc4t standard layers and blocks. Would you like me to adjust anything?"
```

---

## 6. Security Model

### 6.1 Input Validation (MCP Server Side)

```python
# Every tool validates inputs before executing

def validate_layer_name(name: str) -> None:
    """Only allow Roc4t-standard layer names."""
    allowed_prefixes = ["ROC4T-", "0", "DEFPOINTS"]
    if not any(name.startswith(p) for p in allowed_prefixes):
        raise ValueError(f"Layer name '{name}' not allowed. Must start with ROC4T-.")

def validate_file_path(path: str) -> None:
    """Only allow access to project directories."""
    project_dir = os.environ.get("ROC4T_PROJECT_DIR", "C:\\Projects")
    if not os.path.abspath(path).startswith(os.path.abspath(project_dir)):
        raise ValueError(f"Access denied: '{path}' is outside the project directory.")

def validate_command(command: str) -> None:
    """Only allow pre-approved commands."""
    allowed_commands = {
        "create_document", "open_document", "save_document",
        "draw_polyline", "draw_line", "draw_circle", "draw_rectangle",
        "create_layer", "set_layer_active", "set_layer_color",
        "insert_block", "define_block",
        "add_dimension", "add_text", "add_hatch",
        "export_pdf", "export_dwg", "export_dxf",
        "list_layers", "get_document_info", "list_blocks"
    }
    if command not in allowed_commands:
        raise ValueError(f"Command '{command}' not in allow-list.")
```

### 6.2 Audit Logging

Every tool call is logged with:
- Timestamp
- Tool name
- Arguments (sanitized)
- Result (success / error)
- User (if available)
- AutoCAD document name

```python
# logs/audit/2025-01-15.log
{
  "timestamp": "2025-01-15T10:30:00Z",
  "tool": "draw_polyline",
  "args": {"layer": "ROC4T-WALL", "points": 5, "closed": true},
  "result": "success",
  "entity_id": "A1B2",
  "document": "ROC4T-001-LAYOUT.dwg"
}
```

---

## 7. Development Plan

### Phase 1 (Week 1-2): AutoCAD MCP Server

| Week | Task | Deliverable |
|------|------|-------------|
| 1.1 | Set up Python environment, install `mcp` SDK | `pip list` shows `mcp` |
| 1.2 | Create server skeleton with 1 test tool | `server.py` runs, responds to Claude |
| 1.3 | Implement document tools (create, open, save) | 3 tools working |
| 1.4 | Implement layer tools (create, set active, set color) | 3 tools working |
| 1.5 | Implement drawing tools (polyline, line, circle, rectangle) | 4 tools working |
| 1.6 | Implement block tools (insert, define) | 2 tools working |
| 1.7 | Implement dimension and text tools | 2 tools working |
| 2.1 | Implement export tools (PDF, DWG, DXF) | 3 tools working |
| 2.2 | Implement query tools (list layers, list blocks, get info) | 3 tools working |
| 2.3 | Add security layer (input validation, sandbox) | All inputs validated |
| 2.4 | Add audit logging | Logs generated for every call |
| 2.5 | Add standards engine (Roc4t rules) | Standards enforced |
| 2.6 | Write unit tests for all tools | pytest passes |
| 2.7 | Integration test with Claude Desktop | End-to-end test successful |
| 2.8 | Demo to stakeholders | Demo + feedback |

### Phase 2 (Week 3-4): Revit Extension

| Week | Task | Deliverable |
|------|------|-------------|
| 3.1 | Research pyRevit MCP integration | Research doc |
| 3.2 | Implement Revit document tools | 3 tools working |
| 3.3 | Implement Revit element tools (wall, door, room) | 3 tools working |
| 3.4 | Implement Revit parameter tools | 2 tools working |
| 3.5 | Implement Revit view and schedule tools | 2 tools working |
| 3.6 | Add Revit standards validation | Revit rules enforced |
| 3.7 | Integration test with Claude Desktop | End-to-end test |
| 4.1 | 2D/BIM consistency check | Validation tool working |
| 4.2 | Demo BIM workflow | Demo + feedback |

### Phase 3 (Month 2+): Hardening & Scale

| Task | Deliverable |
|------|-------------|
| Claude API integration (for programmatic access) | API endpoint working |
| Multi-project support | Project switching |
| Batch processing | Multiple layouts in parallel |
| Performance optimization | < 30s per layout |
| Full test suite | > 90% coverage |
| Documentation | Complete user guide |

---

## 8. Comparison: With vs Without Claude MCP

| Aspect | Without Claude (Custom Orchestrator) | With Claude MCP |
|--------|--------------------------------------|-----------------|
| **Code to write** | 5,000+ lines (LangChain + FastAPI + custom agents) | 1,500 lines (MCP server tools only) |
| **Reasoning quality** | Depends on custom prompt engineering | Claude's native reasoning, excellent |
| **Error handling** | Custom retry logic | Claude handles natively |
| **User experience** | API calls or web form | Natural conversation in Claude Desktop |
| **Time to POC** | 3-4 weeks | 1-2 weeks |
| **Maintenance** | Custom LLM orchestrator needs updates | Only MCP server needs updates |
| **Cost** | API calls + infrastructure | Claude Pro subscription (~$20/mo) |
| **Flexibility** | Code changes for new features | Just add new tools to MCP server |

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Claude Desktop not available on all workstations | Medium | Use Claude API as fallback; web interface |
| Claude hallucinates tool calls | Low | MCP server validates all inputs; reject unknown tools |
| Claude makes too many tool calls | Low | Add rate limiting in MCP server; max calls per request |
| Dependency on Anthropic | Medium | Keep MCP server generic; could swap to another MCP client |
| Claude doesn't understand CAD terminology | Low | Provide rich tool descriptions; add examples |
| Network issues with Claude API | Low | Claude Desktop works offline (MCP server is local); API needs internet |

---

## 10. Appendix: MCP Tool Inventory (Phase 1)

| Tool | Category | Description | AutoCAD COM Equivalent |
|------|----------|-------------|------------------------|
| `create_document` | Document | Create new DWG from template | `Documents.Add(template)` |
| `open_document` | Document | Open existing DWG | `Documents.Open(path)` |
| `save_document` | Document | Save active document | `Document.Save()` |
| `create_layer` | Layer | Create layer with color/linetype | `Layers.Add(name)` |
| `set_layer_active` | Layer | Set current layer | `Document.ActiveLayer = layer` |
| `draw_polyline` | Drawing | Draw polyline from points | `ModelSpace.AddPolyline(...)` |
| `draw_line` | Drawing | Draw single line | `ModelSpace.AddLine(...)` |
| `draw_circle` | Drawing | Draw circle | `ModelSpace.AddCircle(...)` |
| `draw_rectangle` | Drawing | Draw rectangle | `ModelSpace.AddPolyline(...)` |
| `insert_block` | Block | Insert block reference | `ModelSpace.InsertBlock(...)` |
| `define_block` | Block | Define new block | `Document.Blocks.Add(...)` |
| `add_text` | Text | Add text annotation | `ModelSpace.AddText(...)` |
| `add_dimension` | Dimension | Add linear dimension | `ModelSpace.AddDimAligned(...)` |
| `add_hatch` | Hatch | Add hatch pattern | `ModelSpace.AddHatch(...)` |
| `export_pdf` | Export | Export to PDF | `Document.PlotToFile(...)` |
| `export_dwg` | Export | Save as DWG | `Document.SaveAs(...)` |
| `list_layers` | Query | List all layers in document | `Document.Layers` collection |
| `get_document_info` | Query | Get document metadata | `Document.Name`, `Document.Path` |
| `list_blocks` | Query | List all block definitions | `Document.Blocks` collection |

---

*This architecture is the foundation for the Roc4t AI pipeline. All implementation work should align with it.*
