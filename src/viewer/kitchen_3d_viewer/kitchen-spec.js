const FT_TO_M = 0.3048;
const IN_TO_M = 0.0254;

export const kitchenSpec = {
  projectId: "ROC4T-KITCHEN-HIGH-END-001",
  name: "High-End Commercial Kitchen",
  dimensions: {
    width: 35 * FT_TO_M,
    depth: 45 * FT_TO_M,
    height: 3.0,
    counterHeight: 36 * IN_TO_M,
    counterDepth: 30 * IN_TO_M,
    aisleWidth: 4.5 * FT_TO_M,
    hoodLength: 15 * FT_TO_M,
    hoodDepth: 4 * FT_TO_M,
    tileSize: 12 * IN_TO_M,
  },
  materials: {
    floor: "12 in matte gray ceramic tile with dark grout",
    wall: "white and light gray wall panels",
    equipment: "brushed stainless steel",
    hood: "stainless steel exhaust hood",
  },
  zones: [
    "central cooking line",
    "multi-tier prep islands",
    "right-side warewashing station",
    "cold and dry storage",
  ],
  equipment: [
    { id: "EQ-RANGE-01", label: "6-burner gas range" },
    { id: "EQ-RANGE-02", label: "6-burner gas range" },
    { id: "EQ-GRIDDLE-01", label: "flat-top griddle" },
    { id: "EQ-COMBI-01", label: "stacked combi oven" },
    { id: "EQ-DISH-01", label: "hood-type dishwasher" },
  ],
};
