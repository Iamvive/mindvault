# RoomAI Technical Design Specification

**Date:** 2026-07-29  
**Status:** Approved  
**Project Location:** `room-ai/` (Standalone workspace application)

---

## 1. Overview & Goal

**RoomAI** is a web application that enables users to upload a photo of their current room, specify what furniture to add and keep, choose a design style, and instantly receive a realistic AI-generated makeover visualization along with a curated, shoppable furniture recommendation list.

### Key Constraints & Budget Guidelines
- **100% Free / Low Cost Operations:** Uses Google Gemini Flash API (free tier) for vision analysis and free image generation endpoints (Pollinations.ai / Hugging Face free inference).
- **Protected Regions:** Existing furniture specified to be kept (e.g. desk, mirror, walls, windows) are preserved during makeover rendering.
- **Dimensional Sanity Check:** Recommendations strictly check suggested dimensions against estimated free floor space (e.g. preventing a queen bed recommendation in a 6x6 ft space).

---

## 2. Architecture & Tech Stack

```
                               ┌───────────────────────────┐
                               │       React + Vite        │
                               │  Frontend (Step Wizard)   │
                               └─────────────┬─────────────┘
                                             │ HTTP multipart / JSON
                                             ▼
                               ┌───────────────────────────┐
                               │   Express Node.js Server  │
                               │        (TypeScript)       │
                               └──────┬─────────────┬──────┘
                                      │             │
                ┌─────────────────────┘             └─────────────────────┐
                ▼                                                         ▼
  ┌──────────────────────────┐                              ┌───────────────────────────┐
  │ Google Gemini Flash API  │                              │ Free Image Gen Engine     │
  │   (Vision & Analysis)    │                              │ (Pollinations/HF Inpaint) │
  └──────────────────────────┘                              └───────────────────────────┘
```

- **Frontend:** React + Vite, Single Page Application (SPA), Vanilla CSS with Subtle Gradient Design System tokens & glassmorphism aesthetic.
- **Backend:** Node.js Express API (TypeScript).
- **Vision & Spatial Analysis:** `@google/genai` (Google Gemini 1.5/2.5 Flash API) returning structured JSON.
- **Image Generation Engine:** Pollinations.ai / Hugging Face Free API for room inpainting & style transformation.
- **Catalog Database:** Curated static JSON database (`data/furnitureCatalog.json`).

---

## 3. Directory & File Structure

```
room-ai/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── geminiService.ts      # Room analysis via Gemini Vision API
│   │   │   ├── imageGenService.ts    # Free AI Makeover image generation
│   │   │   └── catalogService.ts     # Recommendation matching logic
│   │   ├── routes/
│   │   │   └── roomRoutes.ts         # REST API endpoints
│   │   ├── data/
│   │   │   └── furnitureCatalog.json # Curated catalog across 5 design styles
│   │   └── index.ts                  # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── WizardStepper.tsx     # Step 1 -> 2 -> 3 navigation header
│   │   │   ├── UploadStep.tsx        # Drag & drop photo uploader
│   │   │   ├── PreferencesStep.tsx   # Form for item to add, keep items, style, dimensions
│   │   │   ├── MakeoverView.tsx      # Interactive before/after makeover visualization
│   │   │   └── RecommendationCard.tsx# Shoppable recommendation item card
│   │   ├── styles/
│   │   │   └── index.css             # Theme design system & subtle gradients
│   │   ├── App.tsx                   # Main Wizard flow container
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 4. API Specifications

### `POST /api/analyze-room`
- **Request:** `multipart/form-data` containing `image` file.
- **Response JSON:**
```json
{
  "room_type": "bedroom",
  "detected_furniture": [
    { "item": "wooden desk", "approx_location": "left wall" },
    { "item": "wall mirror", "approx_location": "center back wall" }
  ],
  "estimated_free_space": {
    "length_ft": 8,
    "width_ft": 7,
    "unit": "feet"
  },
  "wall_layout_notes": "Large open floor area on the right side next to the desk.",
  "confidence_flag": "estimated — please confirm actual space"
}
```

### `POST /api/generate-makeover`
- **Request JSON / Form Data:**
  - `image`: original room photo (file or base64)
  - `add_item`: e.g. "queen bed"
  - `keep_items`: `["desk", "mirror"]`
  - `style`: `"minimalist" | "modern" | "boho" | "scandinavian" | "industrial"`
  - `dimensions`: optional `{ length_ft: 8, width_ft: 7 }`
  - `budget`: optional string or price tier
- **Response JSON:**
```json
{
  "makeover": {
    "image_url": "https://...",
    "description": "A minimalist bedroom featuring a sleek platform bed aligned against the right wall while keeping your existing desk and mirror intact.",
    "suggested_item_dimensions": "60 x 80 inches (Queen)",
    "estimated_price_range": "$350 - $600",
    "placement_notes": "Positioned against the right wall to preserve walkway space near the desk."
  },
  "recommendations": [
    {
      "id": "rec_01",
      "name": "Nordic Wood Platform Bed Frame",
      "style": "minimalist",
      "category": "bed",
      "dimensions": "64\" W x 82\" L x 14\" H",
      "price_range": "$420 - $520",
      "image": "https://...",
      "match_reason": "Fits perfectly in your estimated 8x7 ft free floor space without obstructing the desk."
    }
  ]
}
```

---

## 5. Vision Analysis & Image Generation Prompts

### Gemini Vision Prompt Schema
```
You are an expert interior spatial analyst. Analyze this room photo and return a strictly valid JSON object with the following fields:
- room_type (e.g. bedroom, living room, home office)
- detected_furniture: list of objects with item name and approximate location in photo
- estimated_free_space: object with estimated length_ft, width_ft, and unit
- wall_layout_notes: detailed spatial layout description
- confidence_flag: "estimated — please confirm actual space"
```

### Image Generation Prompt Template
```
"A [style] [room_type], keeping the existing [keep_items] in their original exact positions, seamlessly adding a [add_item] in the empty floor region, natural indoor ambient lighting matching original photo, clean architectural interior photography, highly detailed, photorealistic render"
```

---

## 6. Curated Catalog Schema (`data/furnitureCatalog.json`)
Covers styles: `minimalist`, `modern`, `boho`, `scandinavian`, `industrial`.
Contains categories: `bed`, `sofa`, `accent_chair`, `coffee_table`, `bookshelf`, `desk_lamp`, `rug`.

Each item contains:
- `id`, `name`, `style`, `category`, `dimensions_inches`, `price_range`, `image_url`, `description`.

---

## 7. Verification & Testing Plan
1. **API Integration Verification:** Test `/api/analyze-room` with sample room photo to ensure valid structured JSON from Gemini Flash.
2. **Makeover Image Verification:** Verify `/api/generate-makeover` produces valid image URL and matching recommendation list.
3. **Frontend Wizard Flow Test:** Verify smooth progression from Upload (Step 1) -> Preferences & Detection (Step 2) -> Makeover & Recommendations (Step 3).
