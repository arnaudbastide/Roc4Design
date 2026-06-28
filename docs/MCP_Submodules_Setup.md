# MCP Submodules Setup

This repository tracks MCP base projects as Git submodules under `src/mcp/`.

## Clone

```powershell
git clone --recurse-submodules https://github.com/arnaudbastide/Roc4Design.git
cd Roc4Design
```

If the repository was cloned without submodules:

```powershell
git submodule update --init --recursive
```

## Current Submodules

| Path | Remote | Purpose |
|---|---|---|
| `src/mcp/autocad-mcp-server` | `https://github.com/vigneshpbmenon/autocad-mcp-server.git` | Minimal AutoCAD MCP reference |
| `src/mcp/roc4design-autocad-mcp` | `https://github.com/Porta048/AutoCad-MCP.git` | AutoCAD/GstarCAD/ZWCAD MCP base with drawing tools |
| `src/mcp/roc4design-revit-mcp` | `https://github.com/mcp-servers-for-revit/revit-mcp.git` | Revit MCP reference |

## Notes

- The root repository tracks only the submodule commit pointers.
- Local changes inside a submodule must be committed in that submodule's own repository or fork.
- For AutoCAD LT support, evaluate `puran-water/autocad-mcp` as the next candidate because it uses AutoLISP and supports headless DXF generation.
