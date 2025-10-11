# 🏕️ Camp CRUD - Visual Architecture

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      CAMP MANAGEMENT SYSTEM                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   FRONTEND   │  HTTPS  │   BACKEND    │   SQL   │   DATABASE   │
│   React/TS   │ ◄─────► │  ASP.NET Core│ ◄─────► │ SQL Server   │
│  Port: 5173  │   JWT   │  Port: 7075  │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
```

---

## 🗂️ Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CampManagement                           │
│                         (Main Page)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              AdminSidebar (Left)                          │  │
│  │  • Logo                                                   │  │
│  │  • Navigation Items                                       │  │
│  │  • Camps Management ← Active                             │  │
│  │  • Collapse Toggle                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Statistics Cards (Top)                        │  │
│  ├─────────┬─────────┬─────────┬─────────┐                  │  │
│  │ Total   │ Active  │ Locations│ Avg.   │                  │  │
│  │ Camps   │ Camps   │         │ Price   │                  │  │
│  └─────────┴─────────┴─────────┴─────────┘                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │         Search & Filter Bar (Middle)                       │  │
│  │  🔍 Search...    📁 Status Filter    🔄 Refresh          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Camps Table (Bottom)                          │  │
│  │  ┌────────┬────────┬────────┬────────┬────────┬────────┐ │  │
│  │  │ Name   │ Place  │ Dates  │ People │ Price  │ Actions│ │  │
│  │  ├────────┼────────┼────────┼────────┼────────┼────────┤ │  │
│  │  │ Camp A │ Beach  │ Jun-Jul│ 10-50  │ 2.5M   │ 👁✏🗑  │ │  │
│  │  │ Camp B │ Mt.    │ Dec-Jan│ 15-40  │ 3.0M   │ 👁✏🗑  │ │  │
│  │  └────────┴────────┴────────┴────────┴────────┴────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │        Modals (Conditional Rendering)                      │  │
│  │  • CampFormModal (Create/Edit)                            │  │
│  │  • CampDetailModal (View)                                 │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### 1. **Loading Camps**

```
User Navigates → /admin/camps
         ↓
CampManagement mounts
         ↓
useEffect triggers
         ↓
fetchCamps() called
         ↓
campService.getAllCamps()
         ↓
GET /api/camp
         ↓
Backend returns CampResponseDto[]
         ↓
setCamps(data)
         ↓
setFilteredCamps(data)
         ↓
Table renders with data
```

### 2. **Creating a Camp**

```
User clicks "Create New Camp"
         ↓
setIsFormModalOpen(true)
         ↓
CampFormModal renders
         ↓
User fills form
         ↓
User clicks "Create Camp"
         ↓
validate() checks all fields
         ↓
campService.createCamp(formData)
         ↓
POST /api/camp (with PascalCase)
         ↓
Backend creates camp
         ↓
Returns CampResponseDto
         ↓
Success message displayed
         ↓
Modal closes
         ↓
fetchCamps() refreshes list
```

### 3. **Editing a Camp**

```
User clicks Edit icon (✏️)
         ↓
handleEdit(camp) called
         ↓
setSelectedCamp(camp)
         ↓
setIsEditing(true)
         ↓
setIsFormModalOpen(true)
         ↓
CampFormModal renders with camp data
         ↓
User modifies fields
         ↓
User clicks "Update Camp"
         ↓
validate() checks all fields
         ↓
campService.updateCamp(id, formData)
         ↓
PUT /api/camp/{id} (with PascalCase)
         ↓
Backend updates camp
         ↓
Returns updated CampResponseDto
         ↓
Success message displayed
         ↓
Modal closes
         ↓
fetchCamps() refreshes list
```

### 4. **Viewing Camp Details**

```
User clicks View icon (👁️)
         ↓
handleView(camp) called
         ↓
setSelectedCamp(camp)
         ↓
setIsDetailModalOpen(true)
         ↓
CampDetailModal renders
         ↓
Displays formatted data:
  • Image
  • Quick info cards
  • Dates (formatted)
  • Location
  • Participants
  • Additional info
         ↓
User can:
  • Edit (opens form modal)
  • Delete (confirmation dialog)
  • Close (X or overlay click)
```

### 5. **Deleting a Camp**

```
User clicks Delete icon (🗑️)
         ↓
handleDelete(camp) called
         ↓
window.confirm() dialog
         ↓
User confirms
         ↓
campService.deleteCamp(id)
         ↓
DELETE /api/camp/{id}
         ↓
Backend deletes camp
         ↓
Returns 204 No Content
         ↓
Success message displayed
         ↓
fetchCamps() refreshes list
```

### 6. **Search & Filter**

```
User types in search box
         ↓
setSearchTerm(value)
         ↓
useEffect watches searchTerm
         ↓
Filter camps array:
  • By name (lowercase match)
  • By place (lowercase match)
  • By address (lowercase match)
         ↓
setFilteredCamps(result)
         ↓
Table re-renders with filtered data

───────────────────────────────

User selects status filter
         ↓
setStatusFilter(value)
         ↓
useEffect watches statusFilter
         ↓
Filter camps array:
  • By status (exact match)
         ↓
setFilteredCamps(result)
         ↓
Table re-renders with filtered data
```

---

## 🔌 API Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      campService.ts                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  getAllCamps()                                                   │
│    ↓                                                             │
│  GET /api/camp                                                   │
│    ↓                                                             │
│  return CampResponseDto[]                                        │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                   │
│  getCampById(id)                                                 │
│    ↓                                                             │
│  GET /api/camp/{id}                                              │
│    ↓                                                             │
│  return CampResponseDto                                          │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                   │
│  createCamp(camp)                                                │
│    ↓                                                             │
│  Convert camelCase → PascalCase                                  │
│    ↓                                                             │
│  POST /api/camp                                                  │
│    ↓                                                             │
│  return CampResponseDto                                          │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                   │
│  updateCamp(id, camp)                                            │
│    ↓                                                             │
│  Convert camelCase → PascalCase                                  │
│    ↓                                                             │
│  PUT /api/camp/{id}                                              │
│    ↓                                                             │
│  return CampResponseDto                                          │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                   │
│  deleteCamp(id)                                                  │
│    ↓                                                             │
│  DELETE /api/camp/{id}                                           │
│    ↓                                                             │
│  return void (204 No Content)                                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                ↓
                    axios interceptors
                                ↓
                    Add JWT token to headers
                                ↓
                    Handle 401/403 errors
                                ↓
                    https://localhost:7075/api
```

---

## 📊 State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                   CampManagement State                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  camps: CampResponseDto[]                                        │
│    → All camps from API                                          │
│    → Source of truth                                             │
│                                                                   │
│  filteredCamps: CampResponseDto[]                                │
│    → Filtered/searched camps                                     │
│    → Rendered in table                                           │
│                                                                   │
│  searchTerm: string                                              │
│    → Current search query                                        │
│    → Triggers filtering                                          │
│                                                                   │
│  statusFilter: string                                            │
│    → Current status filter                                       │
│    → "all" | "active" | "pending" | "completed" | "cancelled"   │
│                                                                   │
│  loading: boolean                                                │
│    → True during API calls                                       │
│    → Shows loading spinner                                       │
│                                                                   │
│  isFormModalOpen: boolean                                        │
│    → True when form modal visible                                │
│                                                                   │
│  isDetailModalOpen: boolean                                      │
│    → True when detail modal visible                              │
│                                                                   │
│  selectedCamp: CampResponseDto | null                            │
│    → Camp being viewed/edited                                    │
│                                                                   │
│  isEditing: boolean                                              │
│    → True when editing, false when creating                      │
│                                                                   │
│  isCollapsed: boolean                                            │
│    → Sidebar collapsed state                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Component Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                  Component Lifecycle                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Mount                                                        │
│     ↓                                                            │
│     CampManagement component renders                             │
│     ↓                                                            │
│     useEffect([]) runs (on mount)                                │
│     ↓                                                            │
│     fetchCamps() called                                          │
│     ↓                                                            │
│     API call to GET /api/camp                                    │
│     ↓                                                            │
│     Update state with camps data                                 │
│     ↓                                                            │
│     Component re-renders with data                               │
│                                                                   │
│  ──────────────────────────────────────────────────────────────  │
│                                                                   │
│  2. User Interaction                                             │
│     ↓                                                            │
│     User types in search box                                     │
│     ↓                                                            │
│     setSearchTerm(value)                                         │
│     ↓                                                            │
│     useEffect([searchTerm, statusFilter, camps]) runs            │
│     ↓                                                            │
│     Filter camps based on search/status                          │
│     ↓                                                            │
│     setFilteredCamps(result)                                     │
│     ↓                                                            │
│     Component re-renders with filtered data                      │
│                                                                   │
│  ──────────────────────────────────────────────────────────────  │
│                                                                   │
│  3. Modal Open/Close                                             │
│     ↓                                                            │
│     User clicks "Create Camp"                                    │
│     ↓                                                            │
│     setIsFormModalOpen(true)                                     │
│     ↓                                                            │
│     CampFormModal conditionally renders                          │
│     ↓                                                            │
│     User submits form                                            │
│     ↓                                                            │
│     API call to POST /api/camp                                   │
│     ↓                                                            │
│     onSuccess() callback                                         │
│     ↓                                                            │
│     fetchCamps() refreshes data                                  │
│     ↓                                                            │
│     setIsFormModalOpen(false)                                    │
│     ↓                                                            │
│     Modal unmounts                                               │
│                                                                   │
│  ──────────────────────────────────────────────────────────────  │
│                                                                   │
│  4. Unmount                                                      │
│     ↓                                                            │
│     User navigates away                                          │
│     ↓                                                            │
│     Component unmounts                                           │
│     ↓                                                            │
│     State cleared                                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Authentication Flow                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  User makes API request                                          │
│         ↓                                                        │
│  axios interceptor (request)                                     │
│         ↓                                                        │
│  Get JWT token from localStorage                                 │
│         ↓                                                        │
│  Add "Authorization: Bearer <token>" header                      │
│         ↓                                                        │
│  Send request to backend                                         │
│         ↓                                                        │
│  Backend validates token                                         │
│         ↓                                                        │
│  ┌─────────────────────┐      ┌─────────────────────┐          │
│  │   Token Valid?      │──Yes─→│   Process Request   │          │
│  └─────────────────────┘      └─────────────────────┘          │
│         │ No                            ↓                        │
│         ↓                        Return response                 │
│  Return 401 Unauthorized                ↓                        │
│         ↓                        axios interceptor (response)    │
│  axios interceptor catches 401          ↓                        │
│         ↓                        Return data to component        │
│  Clear localStorage                                              │
│         ↓                                                        │
│  Redirect to /login                                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 Responsive Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                      DESKTOP (1200px+)                           │
├─────────────────────────────────────────────────────────────────┤
│ Sidebar │                  Main Content                          │
│ (280px) │ ┌──────────┬──────────┬──────────┬──────────┐        │
│         │ │  Stat 1  │  Stat 2  │  Stat 3  │  Stat 4  │        │
│  Logo   │ └──────────┴──────────┴──────────┴──────────┘        │
│  Nav 1  │ ┌─────────────────────────────────────────────┐      │
│  Nav 2  │ │  Search   Filter   Refresh                  │      │
│  Nav 3  │ └─────────────────────────────────────────────┘      │
│  Nav 4  │ ┌─────────────────────────────────────────────┐      │
│  Nav 5  │ │            Camps Table (full width)         │      │
│         │ │  Camp 1                            👁✏🗑    │      │
│  Toggle │ │  Camp 2                            👁✏🗑    │      │
│         │ │  Camp 3                            👁✏🗑    │      │
│         │ └─────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      TABLET (768px - 1199px)                     │
├─────────────────────────────────────────────────────────────────┤
│ Side│                  Main Content                              │
│(80) │ ┌──────────┬──────────┐                                   │
│     │ │  Stat 1  │  Stat 2  │                                   │
│ 🏠  │ └──────────┴──────────┘                                   │
│ 👥  │ ┌──────────┬──────────┐                                   │
│ 📝  │ │  Stat 3  │  Stat 4  │                                   │
│ 🏕️  │ └──────────┴──────────┘                                   │
│ ⚙️  │ ┌────────────────────────────┐                           │
│     │ │  Search   Filter   Refresh │                           │
│ ←   │ └────────────────────────────┘                           │
│     │ ┌────────────────────────────┐                           │
│     │ │  Table (horiz scroll)      │                           │
│     │ └────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE (<768px)                           │
├─────────────────────────────────────────────────────────────────┤
│S│                    Main Content                                │
│i│ ┌──────────┐                                                  │
│d│ │  Stat 1  │                                                  │
│e│ └──────────┘                                                  │
││ ┌──────────┐                                                  │
│8│ │  Stat 2  │                                                  │
│0│ └──────────┘                                                  │
││ ┌──────────┐                                                  │
│p│ │  Stat 3  │                                                  │
│x│ └──────────┘                                                  │
││ ┌──────────┐                                                  │
││ │  Stat 4  │                                                  │
││ └──────────┘                                                  │
││ ┌──────────────────────────┐                                 │
││ │  Search                  │                                 │
││ └──────────────────────────┘                                 │
││ ┌──────────────────────────┐                                 │
││ │  Filter                  │                                 │
││ └──────────────────────────┘                                 │
││ ┌──────────────────────────┐                                 │
││ │  Table (scroll →)        │                                 │
││ └──────────────────────────┘                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 User Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Journey Map                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  STEP 1: Navigate                                                │
│  ───────────────────                                             │
│  User clicks "Camps Management" in sidebar                       │
│  OR                                                              │
│  User types /admin/camps in URL                                  │
│         ↓                                                        │
│  Page loads with loading spinner                                 │
│         ↓                                                        │
│  Camps fetched from API                                          │
│         ↓                                                        │
│  Table renders with data                                         │
│                                                                   │
│  ──────────────────────────────────────────────────────────────  │
│                                                                   │
│  STEP 2: Browse                                                  │
│  ───────────────                                                 │
│  User sees statistics cards (overview)                           │
│  User scrolls through camps table                                │
│  User views thumbnails, names, places, dates                     │
│         ↓                                                        │
│  OPTIONAL: User searches by name/place                           │
│  OPTIONAL: User filters by status                                │
│         ↓                                                        │
│  Table updates with filtered results                             │
│                                                                   │
│  ──────────────────────────────────────────────────────────────  │
│                                                                   │
│  STEP 3: View Details                                            │
│  ──────────────────────                                          │
│  User clicks eye icon (👁️) on a camp                            │
│         ↓                                                        │
│  Detail modal opens                                              │
│         ↓                                                        │
│  User reviews all camp information                               │
│         ↓                                                        │
│  User decides: Edit | Delete | Close                             │
│                                                                   │
│  ──────────────────────────────────────────────────────────────  │
│                                                                   │
│  STEP 4A: Create New Camp                                        │
│  ─────────────────────────                                       │
│  User clicks "Create New Camp" button                            │
│         ↓                                                        │
│  Form modal opens (empty)                                        │
│         ↓                                                        │
│  User fills in required fields                                   │
│  User optionally adds image URL (sees preview)                   │
│         ↓                                                        │
│  User clicks "Create Camp"                                       │
│         ↓                                                        │
│  Validation runs                                                 │
│         ↓                                                        │
│  If valid: API call → Success message → Modal closes             │
│  If invalid: Error messages show → User fixes → Retry            │
│         ↓                                                        │
│  Table refreshes with new camp                                   │
│                                                                   │
│  ──────────────────────────────────────────────────────────────  │
│                                                                   │
│  STEP 4B: Edit Existing Camp                                     │
│  ────────────────────────────                                    │
│  User clicks edit icon (✏️) on a camp                            │
│  OR                                                              │
│  User opens detail view → Clicks "Edit Camp"                     │
│         ↓                                                        │
│  Form modal opens (pre-filled with camp data)                    │
│         ↓                                                        │
│  User modifies fields                                            │
│         ↓                                                        │
│  User clicks "Update Camp"                                       │
│         ↓                                                        │
│  Validation runs                                                 │
│         ↓                                                        │
│  If valid: API call → Success message → Modal closes             │
│  If invalid: Error messages show → User fixes → Retry            │
│         ↓                                                        │
│  Table refreshes with updated camp                               │
│                                                                   │
│  ──────────────────────────────────────────────────────────────  │
│                                                                   │
│  STEP 4C: Delete Camp                                            │
│  ─────────────────────                                           │
│  User clicks delete icon (🗑️) on a camp                         │
│  OR                                                              │
│  User opens detail view → Clicks "Delete Camp"                   │
│         ↓                                                        │
│  Confirmation dialog appears                                     │
│         ↓                                                        │
│  User confirms deletion                                          │
│         ↓                                                        │
│  API call to delete                                              │
│         ↓                                                        │
│  Success message → Table refreshes                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Complete Feature Map

```
Camp Management System
├── Main Page (CampManagement)
│   ├── Sidebar Navigation
│   │   ├── Logo
│   │   ├── Dashboard Link
│   │   ├── Accounts Link
│   │   ├── Blogs Link
│   │   ├── Camps Link (Active)
│   │   ├── Settings Link
│   │   └── Collapse Toggle
│   │
│   ├── Statistics Dashboard
│   │   ├── Total Camps Card
│   │   ├── Active Camps Card
│   │   ├── Locations Card
│   │   └── Average Price Card
│   │
│   ├── Search & Filter Bar
│   │   ├── Search Input (name/place/address)
│   │   ├── Status Filter Dropdown
│   │   └── Refresh Button
│   │
│   ├── Camps Table
│   │   ├── Header Row
│   │   │   ├── Camp Name
│   │   │   ├── Place
│   │   │   ├── Dates
│   │   │   ├── Participants
│   │   │   ├── Price
│   │   │   ├── Status
│   │   │   └── Actions
│   │   │
│   │   └── Data Rows (foreach camp)
│   │       ├── Thumbnail Image
│   │       ├── Camp Name + Address
│   │       ├── Place (with icon)
│   │       ├── Start/End Dates (with icon)
│   │       ├── Min-Max Participants (with icon)
│   │       ├── Price (formatted VND)
│   │       ├── Status Badge (color-coded)
│   │       └── Action Buttons
│   │           ├── View (👁️)
│   │           ├── Edit (✏️)
│   │           └── Delete (🗑️)
│   │
│   └── Conditional Modals
│       ├── Form Modal (Create/Edit)
│       └── Detail Modal (View)
│
├── Form Modal (CampFormModal)
│   ├── Header
│   │   ├── Title ("Create" or "Edit")
│   │   └── Close Button (X)
│   │
│   ├── Form Fields (scrollable)
│   │   ├── Camp Name * (text)
│   │   ├── Description * (textarea)
│   │   ├── Place * (text)
│   │   ├── Address * (text)
│   │   ├── Min Participants * (number)
│   │   ├── Max Participants * (number)
│   │   ├── Start Date * (date)
│   │   ├── End Date * (date)
│   │   ├── Price * (number)
│   │   ├── Image URL (text + preview)
│   │   ├── Camp Type ID (number, optional)
│   │   └── Location ID (number, optional)
│   │
│   ├── Validation
│   │   ├── Required fields check
│   │   ├── Date logic (end > start)
│   │   ├── Participants logic (max > min)
│   │   ├── Price (>= 0)
│   │   └── Real-time error messages
│   │
│   └── Footer
│       ├── Cancel Button
│       └── Submit Button ("Create" or "Update")
│
└── Detail Modal (CampDetailModal)
    ├── Header
    │   ├── Camp Name
    │   ├── Status Badge
    │   └── Close Button (X)
    │
    ├── Content (scrollable)
    │   ├── Camp Image (if available)
    │   │
    │   ├── Quick Info Cards
    │   │   ├── Duration (calculated days)
    │   │   ├── Location (place)
    │   │   ├── Capacity (min-max)
    │   │   └── Price (formatted VND)
    │   │
    │   ├── Description Section
    │   │   └── Full camp description
    │   │
    │   ├── Dates Section
    │   │   ├── Start Date (full format)
    │   │   └── End Date (full format)
    │   │
    │   ├── Location Section
    │   │   ├── Place Name
    │   │   └── Full Address
    │   │
    │   ├── Participants Section
    │   │   ├── Minimum Required
    │   │   ├── Maximum Capacity
    │   │   └── Available Spots
    │   │
    │   └── Additional Info (if available)
    │       ├── Camp Type ID
    │       ├── Location ID
    │       └── Camp ID
    │
    └── Footer
        ├── Delete Button
        └── Edit Button
```

---

## 🎉 System Complete!

This visual guide shows the complete architecture and flow of the Camp CRUD Management System.

**Navigate to `/admin/camps` to use the system!** 🏕️
