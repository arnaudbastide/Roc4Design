export const kitchenSpec = {
  "success": true,
  "projectId": "ROC4T-KITCHEN-HIGH-END-001",
  "name": "High-End Commercial Kitchen",
  "dimensions": {
    "width": 10.67,
    "depth": 13.72,
    "height": 3.0,
    "counterHeight": 0.91,
    "counterDepth": 0.76,
    "aisleWidth": 1.37,
    "hoodLength": 4.57,
    "hoodDepth": 1.22,
    "tileSize": 0.305
  },
  "materials": {
    "floor": "12 in matte gray ceramic tile with dark grout",
    "wall": "white and light gray wall panels",
    "equipment": "brushed stainless steel",
    "hood": "stainless steel exhaust hood"
  },
  "zones": [
    "left_equipment_run",
    "central_aisle",
    "right_prep_run",
    "central_cooking_line",
    "prep_islands",
    "warewashing_station",
    "cold_dry_storage"
  ],
  "equipment": [
    {
      "id": "EQ-RANGE-01",
      "label": "6-burner gas range",
      "x": 3.05,
      "y": 13.01,
      "width": 0.9,
      "depth": 0.76,
      "height": 0.91,
      "material": "brushed_stainless_steel"
    },
    {
      "id": "EQ-RANGE-02",
      "label": "6-burner gas range",
      "x": 4.05,
      "y": 13.01,
      "width": 0.9,
      "depth": 0.76,
      "height": 0.91,
      "material": "brushed_stainless_steel"
    },
    {
      "id": "EQ-GRIDDLE-01",
      "label": "Flat-top griddle",
      "x": 5.05,
      "y": 13.01,
      "width": 1.0,
      "depth": 0.76,
      "height": 0.91,
      "material": "brushed_stainless_steel"
    },
    {
      "id": "EQ-COMBI-01",
      "label": "Stacked combi oven with glass doors",
      "x": 7.87,
      "y": 13.01,
      "width": 1.0,
      "depth": 0.76,
      "height": 1.8,
      "material": "brushed_stainless_steel"
    },
    {
      "id": "EQ-DISH-01",
      "label": "Heavy-duty hood-type dishwasher",
      "x": 9.91,
      "y": 5.21,
      "width": 0.76,
      "depth": 1.1,
      "height": 1.6,
      "material": "brushed_stainless_steel"
    }
  ],
  "fixtures": [
    {
      "id": "FX-ISLAND-01",
      "label": "Multi-tier prep island 1",
      "kind": "prep_island",
      "x": 4.16,
      "y": 4.66,
      "width": 2.35,
      "depth": 0.82,
      "height": 0.91,
      "material": "brushed_stainless_steel"
    },
    {
      "id": "FX-ISLAND-02",
      "label": "Multi-tier prep island 2",
      "kind": "prep_island",
      "x": 4.16,
      "y": 7.96,
      "width": 2.35,
      "depth": 0.82,
      "height": 0.91,
      "material": "brushed_stainless_steel"
    },
    {
      "id": "EQ-SINK-01",
      "label": "Commercial sink basin",
      "kind": "sink",
      "x": 9.99,
      "y": 3.02,
      "width": 0.6,
      "depth": 0.65,
      "height": 0.08,
      "material": "brushed_stainless_steel"
    },
    {
      "id": "EQ-SHELF-01",
      "label": "Cold/dry storage shelving left",
      "kind": "storage_shelving",
      "x": 0.08,
      "y": 0.65,
      "width": 0.62,
      "depth": 2.3,
      "height": 2.0,
      "material": "brushed_stainless_steel"
    },
    {
      "id": "EQ-SHELF-02",
      "label": "Cold/dry storage shelving back",
      "kind": "storage_shelving",
      "x": 0.9,
      "y": 0.08,
      "width": 2.56,
      "depth": 0.62,
      "height": 2.0,
      "material": "brushed_stainless_steel"
    }
  ],
  "exportTargets": [
    "DXF/DWG",
    "IFC",
    "glTF"
  ],
  "assetSources": [
    "Evermotion/Archmodels",
    "Chaos Cosmos",
    "Sketchfab",
    "Blender Market/Superhive"
  ]
};
