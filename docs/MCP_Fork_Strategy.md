# MCP Fork Strategy

The root repository tracks upstream MCP bases as submodules. Roc4Design-specific implementation work should not stay as unpublished local edits inside those submodules, because other clones cannot reproduce local-only commits.

## Current Situation

| Submodule | Upstream | Local state | Recommended action |
|---|---|---|---|
| `src/mcp/autocad-mcp-server` | `vigneshpbmenon/autocad-mcp-server` | Clean | Keep as minimal reference |
| `src/mcp/roc4design-autocad-mcp` | `Porta048/AutoCad-MCP` | Has Roc4Design-specific local changes | Move to a Roc4Design fork |
| `src/mcp/roc4design-revit-mcp` | `mcp-servers-for-revit/revit-mcp` | Has Roc4Design-specific local changes | Move to a Roc4Design fork |

## Required Forks

Create GitHub forks or new repositories:

| Desired repository | Source |
|---|---|
| `arnaudbastide/roc4design-autocad-mcp` | `Porta048/AutoCad-MCP` |
| `arnaudbastide/roc4design-revit-mcp` | `mcp-servers-for-revit/revit-mcp` |

After the forks exist, update each submodule remote:

```powershell
git -C src/mcp/roc4design-autocad-mcp remote set-url origin https://github.com/arnaudbastide/roc4design-autocad-mcp.git
git -C src/mcp/roc4design-revit-mcp remote set-url origin https://github.com/arnaudbastide/roc4design-revit-mcp.git
```

Then commit and push the local submodule changes inside each fork:

```powershell
git -C src/mcp/roc4design-autocad-mcp add .
git -C src/mcp/roc4design-autocad-mcp commit -m "Add Roc4Design AutoCAD standards layer"
git -C src/mcp/roc4design-autocad-mcp push origin main

git -C src/mcp/roc4design-revit-mcp add .
git -C src/mcp/roc4design-revit-mcp commit -m "Add Roc4Design Revit MCP customization"
git -C src/mcp/roc4design-revit-mcp push origin main
```

Finally, update the root repository to point to the fork commits:

```powershell
git add .gitmodules src/mcp/roc4design-autocad-mcp src/mcp/roc4design-revit-mcp
git commit -m "Point MCP submodules to Roc4Design forks"
git push origin master
```

## Why This Matters

Submodule pointers store commit SHAs. If the root repository points to a local-only submodule commit, another machine cannot clone that exact state. Forks make the Roc4Design changes reproducible and reviewable.
