Absolutely. Since you’re going to **vibe-code this MVP**, the prompt should be much more explicit than the original—especially about architecture, UX, calculations, data flow, fallbacks, and what the coding agent should *not* waste time building.

Copy-paste this as your **master build prompt**:

# SITEGEN — PARAMETRIC ARCHITECTURAL FEASIBILITY & LAND ACQUISITION INTELLIGENCE ENGINE

## 1. ROLE

You are an expert:

- Full-Stack Engineer
- React + TypeScript Engineer
- Django REST Framework Engineer
- GIS / PostGIS Specialist
- 3D Web Visualization Engineer
- React Three Fiber Engineer
- Architectural Parametric Design Engineer
- Real-Estate Feasibility Analyst
- Premium UI/UX Designer

You are building **SiteGen**, a Hyderabad-focused MVP for architectural feasibility and land-acquisition intelligence.

Do not treat this as a generic CRUD dashboard.

The core product question is:

> **"Should I buy this plot of land?"**

The application should allow a developer, architect, investor, or land buyer to enter/select a plot, apply basic Hyderabad development parameters, instantly calculate a preliminary development envelope, visualize it in 3D, estimate financial potential, and generate a feasibility report.

---

# 2. PRODUCT VISION

SiteGen is NOT primarily a 3D architectural visualization tool.

It is a:

> **Parametric land feasibility + acquisition intelligence engine.**

The 3D visualization exists to make the calculations understandable.

The product should turn:

**Land → Regulations → Buildable Envelope → Capacity → Financials → Acquisition Decision**

into one extremely simple workflow.

The user should be able to understand the feasibility of a plot within a few minutes.

---

# 3. MVP SCOPE

IMPORTANT:

Do NOT attempt to build a global zoning platform.

Do NOT build a complete architectural CAD system.

Do NOT build BIM.

Do NOT build detailed building interiors.

Do NOT attempt to support every Indian city.

Do NOT create hundreds of zoning rules for the first version.

The MVP is exclusively focused on:

> **Hyderabad, Telangana, India**

The architecture should nevertheless be designed so additional cities/regulatory jurisdictions can be added later.

Use a clean abstraction such as:

```text
Jurisdiction
    ↓
RegulationSet
    ↓
Rule
    ↓
CalculationEngine
```

Hyderabad should be the first implementation.

---

# 4. PRIMARY USER FLOW

The ideal user journey is:

## STEP 1 — ENTER SITE

User enters:

- Address
- Google Maps URL
- Latitude/longitude
- OR manually selects a location on the map

Example:

```text
Plot location
Hyderabad, Telangana
```

---

## STEP 2 — DEFINE / CONFIRM BOUNDARY

Display the site on a map.

Allow the user to:

- Draw polygon
- Edit polygon vertices
- Move vertices
- Delete polygon
- Reset boundary
- Confirm boundary

Once confirmed, calculate:

- Plot area
- Plot perimeter
- Approximate dimensions
- Centroid
- Road-facing edges where possible

Show:

```text
SITE AREA
8,000 sq.ft

PERIMETER
360 ft

APPROX. DIMENSIONS
80 × 100 ft
```

---

# 5. MAP EXPERIENCE

Use:

- Mapbox GL JS if a Mapbox token is available
- Otherwise create a development fallback using OpenStreetMap-compatible map rendering

The application must not crash if an API key is missing.

Use environment variables:

```env
VITE_MAPBOX_TOKEN=
```

If unavailable:

Show a graceful development/demo map fallback.

Never hardcode API keys.

---

# 6. CORE UI PHILOSOPHY

The interface must feel like a premium professional product.

Reference the design philosophy of:

- Apple
- Stripe
- Linear
- Arc
- Notion
- Figma

Do NOT make it look like:

- A government portal
- A generic Bootstrap dashboard
- An admin panel
- A cheap SaaS template
- A cluttered architecture application

The interface should communicate:

> Precision  
> Intelligence  
> Confidence  
> Simplicity

---

# 7. VISUAL DESIGN

## Default Theme

Use dark mode by default.

Primary background:

```text
#08090B
```

Secondary surfaces should be slightly lighter.

Use subtle borders rather than heavy shadows.

Use translucent/frosted surfaces where appropriate.

Example:

```css
background: rgba(...)
backdrop-filter: blur(...)
border: 1px solid rgba(...)
```

Do not overuse glassmorphism.

---

# 8. TYPOGRAPHY

Use:

- Inter
- Geist
- or another modern geometric sans-serif

Typography hierarchy:

### Large numbers

Very large and bold.

Example:

```text
42,800
sq.ft
```

### Labels

Small and muted.

Example:

```text
ESTIMATED SALEABLE AREA
```

### Important metrics

Use strong contrast.

Avoid excessive font weights.

---

# 9. COLOR SYSTEM

Keep the interface mostly monochrome.

Use accent colors only for information.

Suggested semantic colors:

```text
Primary accent:
Blue

Positive:
Green

Warning:
Amber

Critical:
Red

Neutral:
Gray
```

The 3D building mass should use a visually distinct but restrained accent.

Do not make the interface colorful.

---

# 10. APPLICATION LAYOUT

Desktop-first.

The application should occupy the entire viewport.

Structure:

```text
┌────────────────────────────────────────────────────────────┐
│ TOP BAR                                                    │
├──────────────┬───────────────────────────────┬─────────────┤
│              │                               │             │
│ LEFT PANEL   │                               │ RIGHT PANEL │
│              │       3D SITE CANVAS          │             │
│ Site         │                               │ Analytics   │
│ Parameters   │                               │             │
│              │                               │             │
│ Regulations  │                               │ Sun         │
│              │                               │ Shadow      │
│ Typology     │                               │ Capacity    │
│              │                               │             │
├──────────────┴───────────────────────────────┴─────────────┤
│ BOTTOM FINANCIAL / ACQUISITION INTELLIGENCE PANEL         │
└────────────────────────────────────────────────────────────┘
```

The 3D visualization must remain the visual centerpiece.

---

# 11. TOP BAR

Create a minimal top navigation bar.

Left:

```text
SITEGEN
```

Subtitle:

```text
Land Feasibility Intelligence
```

Center/right:

```text
Hyderabad
```

Status indicator:

```text
PRELIMINARY ANALYSIS
```

Actions:

```text
Reset
Save
Export PDF
```

Do not clutter the navbar.

---

# 12. LEFT CONTROL PANEL

The left panel controls the feasibility engine.

Create tabs:

```text
SITE
RULES
BUILDING
FINANCE
```

---

# 13. SITE TAB

Inputs:

### Location

```text
Address
Coordinates
```

### Site area

Calculated automatically.

Allow manual override for MVP.

### Road width

Input:

```text
Road Width
[ 30 ] ft
```

### Land price

Input:

```text
Land Price
₹ ______
```

### Boundary

Buttons:

```text
Draw Boundary
Edit Boundary
Confirm
```

---

# 14. RULES TAB

Display the regulatory assumptions being used.

Example:

```text
JURISDICTION

Hyderabad
Telangana

REGULATION PROFILE

GHMC / HMDA Preliminary

ROAD WIDTH
30 ft

FRONT SETBACK
10 ft

SIDE SETBACK
5 ft

REAR SETBACK
5 ft

MAX HEIGHT
[ calculated ]

FAR / FSI
[ 2.5 ]
```

IMPORTANT:

Do not pretend these values are universally or legally applicable.

Regulatory values must be represented as:

```text
Preliminary assumption
```

and must be configurable.

Create a dedicated rules configuration object.

Example:

```typescript
interface ZoningRules {
  jurisdiction: string;
  minRoadWidth: number;
  frontSetback: number;
  rearSetback: number;
  sideSetback: number;
  maxHeight: number;
  maxFAR: number;
  parkingRatio: number;
}
```

---

# 15. BUILDING TAB

Allow the user to control the development scenario.

Inputs:

### Building typology

Dropdown:

```text
Residential
Apartment
Villa
Commercial
Mixed Use
Office
```

For MVP, apartment/residential should be the primary scenario.

---

### Floors

Slider:

```text
Floors

1 ─────────────── 20

8 floors
```

---

### Average floor height

Slider:

```text
Floor Height

2.8m ─────── 5.0m

3.2m
```

---

### Target FAR

Slider/input:

```text
FAR

0.5 ───────── 5.0

2.50
```

---

### Building efficiency

Input:

```text
Efficiency

60% ─────── 90%

80%
```

---

# 16. FINANCE TAB

Inputs:

### Land acquisition cost

```text
₹ 2,00,00,000
```

### Construction cost

```text
₹ 2,200 / sq.ft
```

### Expected selling price

```text
₹ 6,500 / sq.ft
```

### Parking cost

Optional.

### Other development costs

Optional percentage.

Example:

```text
Approvals + consultants + contingency

8%
```

---

# 17. MAIN 3D CANVAS

Use:

- React Three Fiber
- Drei
- Three.js

The canvas should show:

1. Ground plane
2. Plot boundary
3. Setback boundary
4. Buildable envelope
5. Building mass
6. Roads
7. North indicator
8. Optional surrounding buildings

The building should be generated parametrically.

---

# 18. 3D BUILDABLE ENVELOPE

The fundamental 3D calculation is:

```text
Plot polygon
        ↓
Setbacks
        ↓
Buildable polygon
        ↓
Maximum floor area
        ↓
Floor count
        ↓
Building mass
```

The building should sit spatially on the actual plot.

Do NOT simply put a generic cube in the center.

The building footprint should be derived from the buildable polygon.

---

# 19. BUILDING GENERATION

Create a reusable component:

```text
BuildingMass.tsx
```

Props:

```typescript
interface BuildingMassProps {
  footprint: Polygon;
  floors: number;
  floorHeight: number;
  opacity?: number;
}
```

Extrude the footprint vertically.

For example:

```text
buildingHeight =
floors × floorHeight
```

Use translucent geometry so the plot remains visible.

---

# 20. SITE GEOMETRY

Create utilities:

```text
geometry/
    calculateArea.ts
    calculateCentroid.ts
    calculateSetbacks.ts
    calculateBuildablePolygon.ts
    calculateDimensions.ts
```

Do not put all calculations inside React components.

Separate:

```text
UI
↓
State
↓
Calculation Engine
↓
Visualization
```

---

# 21. BACKEND ARCHITECTURE

Use:

```text
Django
Django REST Framework
PostgreSQL
PostGIS
```

Suggested structure:

```text
backend/
    config/
    sites/
    zoning/
    feasibility/
    reports/
```

---

# 22. DATABASE MODELS

Create:

## Site

```text
id
name
address
latitude
longitude
boundary
area_sqft
area_sqm
road_width
created_at
updated_at
```

`boundary` must use a PostGIS PolygonField.

---

## ZoningRule

```text
id
jurisdiction
rule_name
road_width_min
front_setback
rear_setback
side_setback
max_height
max_far
parking_ratio
effective_from
effective_to
```

---

## FeasibilityScenario

```text
id
site
typology
far
floors
floor_height
efficiency
construction_cost
selling_price
land_cost
created_at
```

---

## FeasibilityResult

Store calculated results:

```text
plot_area
buildable_area
gross_floor_area
saleable_area
building_height
parking_spaces
construction_cost
land_cost
revenue
development_cost
profit
margin
```

---

# 23. POSTGIS REQUIREMENTS

Use PostGIS for spatial operations.

The backend should eventually support:

### Polygon area

```text
ST_Area
```

### Polygon intersection

```text
ST_Intersection
```

### Buffer

```text
ST_Buffer
```

### Distance

```text
ST_Distance
```

### Point inside polygon

```text
ST_Contains
```

Do not fake GIS calculations if PostGIS can perform them.

---

# 24. API DESIGN

Create REST endpoints.

## Create site

```http
POST /api/sites/
```

Example:

```json
{
  "name": "Sample Hyderabad Plot",
  "address": "Hyderabad, Telangana",
  "latitude": 17.385,
  "longitude": 78.486,
  "boundary": {}
}
```

---

## Get site

```http
GET /api/sites/:id/
```

---

## Calculate feasibility

```http
POST /api/feasibility/calculate/
```

Example:

```json
{
  "site_id": 1,
  "road_width": 30,
  "far": 2.5,
  "floors": 8,
  "floor_height": 3.2,
  "efficiency": 0.8,
  "land_cost": 20000000,
  "construction_cost": 2200,
  "selling_price": 6500
}
```

Return:

```json
{
  "plot_area_sqft": 8000,
  "buildable_area_sqft": 5000,
  "gross_floor_area_sqft": 20000,
  "saleable_area_sqft": 16000,
  "floors": 8,
  "building_height_m": 25.6,
  "parking_spaces": 32,
  "land_cost": 20000000,
  "construction_cost": 44000000,
  "estimated_revenue": 104000000,
  "estimated_profit": 40000000,
  "margin_percent": 38.46
}
```

---

# 25. CALCULATION ENGINE

Create a dedicated service:

```text
FeasibilityEngine
```

It should take:

```text
Site
+
Zoning Rules
+
Development Inputs
+
Financial Inputs
```

and produce:

```text
FeasibilityResult
```

---

# 26. BASIC CALCULATION LOGIC

For the MVP:

## Plot area

Calculate from geometry.

```text
plot_area = polygon_area
```

---

## Setback area

Generate an inward-offset polygon.

Conceptually:

```text
buildable_polygon =
plot_polygon
minus
required setbacks
```

Use PostGIS geometry operations wherever possible.

---

## Buildable footprint

Calculate:

```text
buildable_footprint_area
```

---

## Maximum GFA

Use:

```text
GFA = plot_area × FAR
```

subject to applicable constraints.

Do NOT blindly use FAR without checking other constraints.

---

## Floor area

Approximate:

```text
floor_area =
min(
    buildable_footprint × floors,
    allowable_GFA
)
```

---

## Saleable area

Use:

```text
saleable_area =
GFA × efficiency
```

Example:

```text
GFA = 50,000
Efficiency = 80%

Saleable =
40,000 sq.ft
```

---

# 27. PARKING

For the MVP, parking should be configurable.

Example:

```text
1 parking space / 500 sq.ft saleable area
```

Calculate:

```text
parking_spaces =
ceil(saleable_area / parking_ratio)
```

Clearly label this as a preliminary assumption.

---

# 28. FINANCIAL ENGINE

Calculate:

## Land cost

```text
land_cost = user_input
```

---

## Construction cost

```text
construction_cost =
GFA × construction_cost_per_sqft
```

---

## Revenue

```text
revenue =
saleable_area × selling_price_per_sqft
```

---

## Additional development costs

Example:

```text
additional_cost =
construction_cost × additional_cost_percentage
```

---

## Total project cost

```text
total_cost =
land_cost
+
construction_cost
+
additional_cost
```

---

## Estimated profit

```text
profit =
revenue - total_cost
```

---

## Development margin

```text
margin =
profit / revenue × 100
```

---

# 29. ACQUISITION INTELLIGENCE

This is the most important part of the product.

The bottom panel should answer the user's question:

> **Should I buy this land?**

Do NOT produce a simplistic AI-generated yes/no decision.

Instead present factual feasibility indicators.

Example:

```text
SITE FEASIBILITY

Estimated Saleable Area
42,800 sq.ft

Estimated Revenue
₹27.8 Cr

Estimated Development Cost
₹19.4 Cr

Estimated Gross Profit
₹8.4 Cr

Estimated Margin
30.2%

Required Parking
86 spaces

Buildable Footprint
5,200 sq.ft
```

Then provide an informational status:

```text
FEASIBILITY INDICATORS
```

with states such as:

```text
Strong development capacity
Moderate parking constraint
High land-cost sensitivity
```

These should be derived from transparent thresholds and clearly labeled as analytical indicators, not investment advice.

---

# 30. BOTTOM PANEL

The bottom panel should be collapsible.

Collapsed:

```text
₹27.8 Cr estimated revenue
42,800 sq.ft saleable
30.2% estimated margin
```

Expanded:

Show detailed table:

```text
Metric                  Value
────────────────────────────────
Plot Area               8,000 sq.ft
Buildable Area          5,200 sq.ft
FAR                     2.50
GFA                     20,000 sq.ft
Saleable Area           16,000 sq.ft
Floors                  8
Height                  25.6 m
Parking                 32
Land Cost               ₹2.0 Cr
Construction Cost       ₹4.4 Cr
Revenue                 ₹10.4 Cr
Profit                  ₹4.0 Cr
Margin                  38.5%
```

---

# 31. RIGHT ANALYTICS PANEL

Create tabs:

```text
SUN
CAPACITY
SITE
```

---

# 32. SUN ANALYSIS

Use SunCalc.

Inputs:

```text
Latitude
Longitude
Date
Time
```

Display:

```text
SUN PATH
```

In the 3D scene show:

- Sun position
- Direction vector
- Shadow direction
- Optional animated sun movement

Add a toggle:

```text
☼ Sun Simulation
```

When enabled:

Animate the sun gradually.

Do not attempt a highly accurate architectural daylight simulation in MVP.

This is a visualization aid.

---

# 33. SHADOWS

Enable Three.js shadows.

The building should cast a visible shadow onto:

- Site
- Ground
- Nearby massing where available

Provide:

```text
Morning
Noon
Evening
```

quick controls.

---

# 34. CAPACITY ANALYTICS

Display simple visual charts.

Use a lightweight charting library such as Recharts.

Charts:

### Area breakdown

```text
Plot Area
Buildable Area
GFA
Saleable Area
```

### Financial breakdown

```text
Land Cost
Construction
Other Costs
Revenue
Profit
```

Do not make charts visually noisy.

---

# 35. SURROUNDING CONTEXT

For MVP:

Use OpenStreetMap / Mapbox context where possible.

Potential context:

- Roads
- Buildings
- Nearby landmarks
- Commercial areas
- Transit
- Schools
- Hospitals

Do not build a complete GIS intelligence layer yet.

Only show enough context to make the plot understandable.

---

# 36. 3D CAMERA

Provide:

- Orbit controls
- Zoom
- Pan
- Reset camera
- Top-down view
- Perspective view

Buttons:

```text
3D
TOP
RESET
```

When the user changes the building parameters, smoothly animate the building to its new dimensions.

---

# 37. MICRO-INTERACTIONS

Use subtle animations.

Examples:

- Panel open/close
- Slider value updates
- Building height animation
- Metric number transitions
- Loading states
- Hover states
- Button transitions
- Camera transitions

Use Framer Motion where appropriate.

Do not animate everything.

The product should feel calm.

---

# 38. RESPONSIVE DESIGN

Desktop is the primary experience.

However, do not allow the UI to completely break on smaller screens.

On tablet/mobile:

Convert:

```text
Left Panel
Right Panel
Bottom Panel
```

into collapsible drawers.

The 3D canvas should remain usable.

---

# 39. LOADING STATES

Never display blank screens.

Create elegant loading states.

Example:

```text
Analyzing site geometry...
```

Then:

```text
Applying zoning parameters...
```

Then:

```text
Generating development envelope...
```

Then:

```text
Calculating feasibility...
```

For MVP these can be simulated while actual calculations execute.

---

# 40. ERROR HANDLING

Handle:

- Invalid polygon
- No boundary
- Missing API key
- Invalid road width
- Invalid FAR
- Backend unavailable
- Calculation failure
- PDF generation failure

Errors should be understandable.

Bad:

```text
500 Internal Server Error
```

Good:

```text
We couldn't calculate the site geometry.

Check that the plot boundary contains at least 3 valid points.
```

---

# 41. PDF REPORT

Implement:

```text
Export Feasibility Report
```

Generate a professional PDF.

Report structure:

## SITEGEN

### Preliminary Site Feasibility Report

Site:

```text
Hyderabad, Telangana
```

---

### 1. Site Information

```text
Plot Area
Location
Road Width
Boundary
```

---

### 2. Regulatory Assumptions

```text
Jurisdiction
FAR
Setbacks
Height
Parking assumptions
```

---

### 3. Development Potential

```text
Buildable Footprint
GFA
Saleable Area
Floors
Height
```

---

### 4. Financial Feasibility

```text
Land Cost
Construction Cost
Revenue
Development Cost
Estimated Profit
Margin
```

---

### 5. Visualization

Include a screenshot/render of the 3D massing.

---

### 6. Disclaimer

Display prominently:

> Preliminary feasibility estimate — not a statutory approval.

Also state that regulatory assumptions must be independently verified with the applicable authorities and project professionals before acquisition or development decisions.

---

# 42. DISCLAIMER

The disclaimer must appear inside the application.

Use a subtle but visible badge:

```text
PRELIMINARY FEASIBILITY
```

and:

> Preliminary feasibility estimate — not a statutory approval.

Never present calculated values as legally approved development rights.

---

# 43. REGULATORY DATA ARCHITECTURE

This is extremely important.

Do not hardcode zoning numbers throughout the application.

Bad:

```javascript
if (roadWidth > 30) {
  setback = 10;
}
```

Instead:

```javascript
const rules = zoningService.getRules({
  jurisdiction: "HYDERABAD",
  roadWidth
});
```

The rules should come from one central source.

Example:

```typescript
const hyderabadRules = {
  jurisdiction: "Hyderabad",
  authority: "GHMC/HMDA",
  setbacks: {...},
  FAR: {...},
  height: {...},
  parking: {...}
};
```

Keep this data easy to update.

Where exact current statutory rules have not been verified, use clearly marked **demo/preliminary assumptions** rather than inventing authoritative values.

---

# 44. FRONTEND STATE MANAGEMENT

Use a lightweight state solution.

Prefer:

```text
Zustand
```

or React Context if the state remains simple.

Central state should contain:

```typescript
site
boundary
zoning
building
finance
feasibility
visualization
```

Avoid prop-drilling through many components.

---

# 45. FRONTEND PROJECT STRUCTURE

Use a clean architecture similar to:

```text
src/
│
├── components/
│   ├── layout/
│   ├── panels/
│   ├── map/
│   ├── building/
│   ├── analytics/
│   ├── finance/
│   └── ui/
│
├── pages/
│   └── FeasibilityWorkspace.tsx
│
├── engine/
│   ├── feasibility.ts
│   ├── geometry.ts
│   ├── finance.ts
│   └── zoning.ts
│
├── services/
│   ├── api.ts
│   ├── maps.ts
│   └── solar.ts
│
├── store/
│   └── siteStore.ts
│
├── types/
│   └── index.ts
│
├── utils/
│
└── App.tsx
```

---

# 46. BACKEND PROJECT STRUCTURE

```text
backend/
│
├── config/
│
├── sites/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── services.py
│
├── zoning/
│   ├── models.py
│   ├── serializers.py
│   ├── services.py
│   └── rules/
│
├── feasibility/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── services.py
│   └── calculations.py
│
└── reports/
    ├── services.py
    └── views.py
```

---

# 47. TYPESCRIPT

Use TypeScript rather than plain JavaScript if practical.

Define strong types for:

```text
Site
Boundary
ZoningRules
BuildingParameters
FinancialInputs
FeasibilityResult
SunData
Report
```

Avoid:

```typescript
any
```

unless absolutely necessary.

---

# 48. API CONFIGURATION

Use:

```env
VITE_API_URL=http://localhost:8000/api
VITE_MAPBOX_TOKEN=
```

Backend:

```env
DATABASE_URL=
SECRET_KEY=
DEBUG=
MAPBOX_TOKEN=
```

Never commit secrets.

Create:

```text
.env.example
```

---

# 49. DEVELOPMENT FALLBACK MODE

The application must still work without external services.

If:

```text
MAPBOX_TOKEN
```

is missing:

Use demo location/map data.

If backend is unavailable:

Allow a frontend demo mode.

Create a clearly identifiable:

```text
DEMO MODE
```

indicator.

This allows the UI and 3D experience to be demonstrated immediately.

---

# 50. DEMO SITE

Create one default Hyderabad demo plot.

Example:

```text
Site Area:
8,000 sq.ft

Road Width:
30 ft

FAR:
2.5

Floors:
8

Floor Height:
3.2m

Efficiency:
80%

Land Cost:
₹2 Cr

Construction Cost:
₹2,200/sq.ft

Selling Price:
₹6,500/sq.ft
```

These are demonstration inputs only.

Do not represent them as actual regulatory entitlements.

---

# 51. UX DETAILS

When the user changes:

```text
FAR
```

the building should update.

When the user changes:

```text
Floors
```

the building should update.

When the user changes:

```text
Setback
```

the buildable footprint should update.

When the user changes:

```text
Selling Price
```

financial metrics should update.

The application should feel genuinely parametric.

---

# 52. IMPORTANT PERFORMANCE REQUIREMENTS

Avoid unnecessary React renders.

Use:

```text
useMemo
useCallback
```

where appropriate.

Do not regenerate expensive geometry unnecessarily.

The 3D scene should remain responsive.

Do not load enormous GIS datasets for the MVP.

---

# 53. ACCESSIBILITY

Include:

- Keyboard accessible controls
- Visible focus states
- Tooltips
- Good contrast
- Proper labels
- Accessible buttons
- ARIA labels where needed

Do not sacrifice accessibility for aesthetics.

---

# 54. EMPTY STATES

For a new project:

```text
Start by defining your site boundary.
```

For missing financial data:

```text
Add financial assumptions to unlock acquisition analysis.
```

For missing zoning:

```text
Select a jurisdiction to apply preliminary zoning assumptions.
```

---

# 55. TOOLTIP SYSTEM

Important metrics should have tooltips.

Example:

### FAR

```text
Floor Area Ratio

The ratio of total floor area to plot area.
```

### GFA

```text
Gross Floor Area

Approximate total floor area generated by the development scenario.
```

### Saleable Area

```text
Estimated Saleable Area

GFA multiplied by the assumed efficiency percentage.
```

### Margin

```text
Estimated Development Margin

Estimated profit divided by estimated revenue.
```

---

# 56. ARCHITECTURAL / GIS PRECISION

Use metric units internally where appropriate.

Allow the UI to display:

```text
sq.ft
ft
m
```

Create conversion utilities:

```text
sqft ↔ sqm
ft ↔ m
```

Do not mix units silently.

---

# 57. SECURITY

Implement basic security practices:

- Django CSRF protection
- CORS configuration
- Environment variables
- Input validation
- Polygon validation
- Numeric range validation
- SQL injection protection through Django ORM
- API error handling

---

# 58. WHAT NOT TO BUILD YET

Do NOT spend time on:

- Authentication
- Payments
- Team collaboration
- Enterprise permissions
- AI chatbot
- Full building floor plans
- BIM export
- Revit integration
- Detailed structural design
- Detailed MEP
- Construction scheduling
- CRM
- Marketplace
- Property listings
- Automated land purchasing
- Legal approval automation

The MVP must stay focused.

---

# 59. FUTURE ARCHITECTURE

Design the code so these can be added later:

```text
Hyderabad
↓
Bangalore
↓
Mumbai
↓
Delhi
↓
Pune
↓
Other Indian cities
```

The zoning engine should eventually support:

```text
Jurisdiction
Authority
RuleSet
EffectiveDate
RoadWidth
Setbacks
FAR
Height
Parking
LandUse
```

---

# 60. IMPORTANT PRODUCT PRINCIPLE

Follow this principle throughout the implementation:

> **Stability before intelligence.**
>
> **Data before AI.**
>
> **Clarity before features.**

Do not add an AI chatbot just because this is called an intelligence engine.

The intelligence should first come from:

```text
Accurate geometry
+
Transparent rules
+
Parametric calculations
+
Clear financial modeling
```

---

# 61. BUILD ORDER

Implement in this exact order.

## PHASE 1 — UI FOUNDATION

First build:

- Full-screen workspace
- Top bar
- Left panel
- Right panel
- Bottom panel
- Dark premium design
- Responsive layout
- Dummy data

Do not start with backend.

---

## PHASE 2 — 3D EXPERIENCE

Implement:

- React Three Fiber
- Plot
- Ground
- Building mass
- Setback boundary
- Orbit controls
- Camera controls
- Smooth animation

The application should already look impressive at this stage.

---

## PHASE 3 — PARAMETRIC FRONTEND ENGINE

Connect:

```text
sliders
↓
state
↓
calculation engine
↓
3D geometry
↓
analytics
```

Changing parameters must visibly change the model.

---

## PHASE 4 — BACKEND

Build:

- Django
- DRF
- PostgreSQL
- PostGIS
- Models
- Serializers
- APIs

---

## PHASE 5 — GIS

Implement:

- Polygon storage
- Area calculation
- Boundary validation
- Setback geometry
- Spatial operations
- Road-width input

---

## PHASE 6 — ZONING

Implement the Hyderabad preliminary rule engine.

Keep rules configurable.

Do not hardcode regulatory assumptions across the application.

---

## PHASE 7 — FINANCIAL ENGINE

Connect:

```text
land price
construction cost
sale price
GFA
saleable area
revenue
profit
margin
```

---

## PHASE 8 — SOLAR

Implement:

- SunCalc
- Sun position
- Shadow visualization
- Morning/noon/evening
- Animation

---

## PHASE 9 — REPORT

Implement:

```text
Generate PDF
```

with:

- Site
- Map
- 3D image
- Regulations
- Capacity
- Financials
- Disclaimer

---

# 62. QUALITY BAR

Before considering the MVP complete, verify:

### UI

- Does it feel premium?
- Is whitespace used properly?
- Is the hierarchy obvious?
- Is the 3D canvas the visual focus?
- Are panels unobtrusive?

### GIS

- Does the polygon represent the actual site?
- Does the area calculate correctly?
- Are setbacks reflected geometrically?

### Parametric engine

- Do sliders actually change calculations?
- Does the 3D mass update?
- Do financial metrics update?

### Financials

- Are formulas transparent?
- Are assumptions visible?
- Are units consistent?

### Regulatory

- Are assumptions clearly identified?
- Is there a disclaimer?
- Are rules centralized?

### Performance

- Does the 3D scene remain responsive?
- Are unnecessary rerenders avoided?

---

# 63. FINAL UX TEST

A first-time user should be able to:

1. Open SiteGen
2. See a Hyderabad demo plot
3. Understand the plot immediately
4. Change road width
5. Change FAR
6. Change floors
7. Watch the building change
8. See buildable area change
9. See financial metrics change
10. Toggle sun simulation
11. Expand acquisition analysis
12. Export a PDF

without needing documentation.

---

# 64. FINAL PRODUCT SCREEN

The finished screen should visually communicate something similar to:

```text
SITEGEN
Land Feasibility Intelligence

┌──────────────────────────────────────────────────────────┐
│ Hyderabad                               PRELIMINARY      │
│                                           ANALYSIS        │
├──────────────┬───────────────────────────┬───────────────┤
│ SITE         │                           │ SITE CAPACITY │
│              │                           │               │
│ Area         │                           │ 20,000        │
│ 8,000 sqft   │       3D BUILDING         │ GFA           │
│              │                           │               │
│ Road         │          █████            │ 16,000        │
│ 30 ft        │          █████            │ Saleable      │
│              │          █████            │               │
│ RULES        │                           │ 32            │
│              │       PLOT BOUNDARY       │ Parking       │
│ FAR 2.5      │                           │               │
│ Setback 10ft │                           │ SUN            │
│              │                           │ ☼ Simulation   │
│ BUILDING     │                           │               │
│              │                           │               │
│ Floors 8     │                           │               │
│ Height 3.2m  │                           │               │
├──────────────┴───────────────────────────┴───────────────┤
│ ESTIMATED REVENUE      DEVELOPMENT COST       MARGIN     │
│ ₹10.4 Cr               ₹6.4 Cr                38.5%      │
│                                                          │
│              EXPAND ACQUISITION ANALYSIS                 │
└──────────────────────────────────────────────────────────┘
```

The actual implementation should look significantly more polished than this ASCII representation.

---

# 65. CODING PRINCIPLES

Follow these rules while coding:

1. Write clean, maintainable code.
2. Use reusable components.
3. Avoid giant components.
4. Separate UI from business logic.
5. Separate business logic from GIS logic.
6. Separate zoning rules from calculations.
7. Use TypeScript types.
8. Validate all user inputs.
9. Handle API failures gracefully.
10. Never expose API secrets.
11. Never fake statutory approval.
12. Clearly distinguish demo assumptions from verified regulatory data.
13. Prefer simple working functionality over unfinished advanced functionality.
14. Do not install unnecessary dependencies.
15. Keep the application runnable after every major implementation step.

---

# 66. MOST IMPORTANT INSTRUCTION

Do not merely create a beautiful static mockup.

The MVP must be **functionally parametric**.

If the user changes:

```text
Plot
→ Setback
→ FAR
→ Floors
→ Floor Height
→ Efficiency
→ Construction Cost
→ Sale Price
```

the system must recalculate and update:

```text
Buildable Footprint
GFA
Saleable Area
Building Height
Parking
Construction Cost
Revenue
Profit
Margin
3D Building
Charts
```

The entire experience should feel like one connected computational system.

---

# 67. FIRST IMPLEMENTATION TASK

Start immediately with:

### Step 1

Scaffold the project.

### Step 2

Build the premium SiteGen workspace UI.

### Step 3

Create a Hyderabad demo site.

### Step 4

Build the interactive 3D plot and building mass.

### Step 5

Implement the left controls.

### Step 6

Connect controls to the parametric calculation engine.

### Step 7

Add analytics.

### Step 8

Add financial intelligence.

### Step 9

Connect Django/PostGIS.

### Step 10

Add PDF export.

At each stage, keep the application runnable.

Do not stop at wireframes.

Do not generate placeholder screens that have no interaction.

Build the actual MVP.

---

# 68. SUCCESS CRITERIA

The MVP is successful if a user can look at one Hyderabad plot and immediately understand:

> **How much can I potentially build?**

> **What does the building envelope look like?**

> **How much saleable area could I potentially get?**

> **What might the project cost?**

> **What might the project generate?**

> **What assumptions are driving these numbers?**

And finally:

> **Is this site worth investigating further?**

The product should provide the information needed for that decision without pretending to replace statutory approval, legal due diligence, architectural approval, or professional investment advice.

Build SiteGen as a **calm, premium, computationally credible land-feasibility workspace**, not as a generic dashboard.