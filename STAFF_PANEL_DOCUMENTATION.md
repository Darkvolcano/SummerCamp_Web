# Staff Control Panel

## Overview
A professional staff control panel built with React and TypeScript, featuring a calendar-based schedule management system with mock data.

## Structure

```
src/
├── components/
│   └── staff/
│       ├── StaffSidebar.tsx          # Reusable sidebar navigation
│       └── StaffSidebar.css          # Sidebar styles
│
└── pages/
    └── Staff/
        ├── MySchedule/
        │   ├── MySchedule.tsx        # Main schedule page with calendar
        │   └── MySchedule.css        # Schedule and calendar styles
        ├── MyCamps/
        │   ├── MyCamps.tsx           # Staff's assigned camps
        │   └── MyCamps.css           # Camps grid styles
        └── MyBlogs/
            ├── MyBlogs.tsx           # Staff's blog management
            └── MyBlogs.css           # Blogs list styles
```

## Features

### 1. **Staff Sidebar Component**
- Clean, collapsible navigation
- Three main sections:
  - 📅 My Schedule
  - ⛺ My Camps
  - 📝 My Blogs
- Professional black/white theme matching admin panel
- Smooth transitions and hover effects
- Responsive collapse functionality

### 2. **My Schedule (Default Landing Page)**
- **Interactive Calendar View**
  - Month navigation (previous/next)
  - Highlighted days with work schedules (black background)
  - Current day indicator (bold border)
  - Selected day indicator (gray background)
  - Grid layout with day names

- **Schedule Details Panel**
  - Click on any highlighted day to view details
  - Shows schedule information:
    - Camp name
    - Location (with map pin icon)
    - Time slot (with clock icon)
    - Number of campers (with users icon)
    - Role badge (staff role)
  - Default view shows "Upcoming Schedule" (next 5 events)
  - Empty state for days without schedule

- **Mock Schedule Data** (7 entries):
  ```
  Oct 15 - Adventure Quest Camp (Mountain Valley)
  Oct 16 - Nature Explorer Camp (Forest Park)
  Oct 20 - Sports & Fun Camp (City Sports Complex)
  Oct 22 - Art & Creativity Camp (Community Center)
  Oct 25 - Science Discovery Camp (Science Museum)
  Oct 28 - Adventure Quest Camp (Lake District)
  Nov 02 - Outdoor Skills Camp (Wilderness Area)
  ```

### 3. **My Camps**
- Grid layout of assigned camp programs
- Filter tabs: All / Upcoming / Ongoing / Completed
- Camp cards display:
  - Camp icon
  - Status badge (color-coded)
  - Camp name
  - Description
  - Location, dates, camper count
  - "View Details" button
- Hover effects with elevation

- **Mock Camps Data** (4 entries):
  - Adventure Quest Camp (Upcoming)
  - Science Discovery Camp (Upcoming)
  - Sports & Fun Camp (Completed)
  - Art & Creativity Camp (Upcoming)

### 4. **My Blogs**
- List view of blog posts
- Filter tabs: All Posts / Published / Drafts
- "Create New Blog" button in header
- Blog items display:
  - Book icon
  - Title and status badge
  - Excerpt (2-line clamp)
  - Metadata (date, views)
  - Action buttons (View, Edit, Delete)
- Responsive card layout

- **Mock Blogs Data** (4 entries):
  - "10 Essential Skills Every Camper Should Learn" (Published, 245 views)
  - "Creating Safe and Fun Camp Activities" (Published, 189 views)
  - "Building Team Spirit in Summer Camps" (Draft)
  - "Nature Education: Teaching Kids About Wildlife" (Published, 312 views)

## Routing

Routes added to `App.tsx`:

```tsx
/staff/schedule  → MySchedule (default landing page)
/staff/camps     → MyCamps
/staff/blogs     → MyBlogs
```

## Design System

### Colors
- **Primary Black**: `#111827` (navigation, buttons, text)
- **Secondary Gray**: `#4b5563` (inactive items)
- **Light Gray**: `#f3f4f6` (hover states)
- **White**: `#ffffff` (background, active text)
- **Border**: `#e5e7eb`

### Typography
- **Page Title**: 2rem, weight 800
- **Section Headers**: 1.25-1.5rem, weight 700
- **Body Text**: 0.875-1rem, weight 400-600
- **Letter Spacing**: -0.02em for headings

### Spacing
- **Layout Padding**: 2rem
- **Card Padding**: 1.5-2rem
- **Gap between items**: 1-2rem
- **Border Radius**: 8-12px

### Effects
- Box shadow on hover: `0 4px 12px rgba(0, 0, 0, 0.1)`
- Transform on hover: `translateY(-2px)` or `scale(1.05)`
- Transition duration: `0.2-0.3s ease`

## Responsive Design

### Desktop (> 768px)
- Sidebar: 280px width (80px when collapsed)
- Main content: `margin-left: 280px`
- Calendar grid: 7 columns (full week)
- Camps grid: Auto-fill, min 320px

### Mobile (< 768px)
- Sidebar: Hidden by default (can be toggled)
- Main content: Full width
- Filter tabs: Stacked vertically
- Cards: Single column layout

## Key Features

### Calendar Logic
- Calculates first day of month and total days
- Generates empty cells for alignment
- Maps work schedules by date
- Highlights today and scheduled days
- Click interaction for day selection

### State Management
- `useState` for UI state (collapsed, filters, selected date)
- `useMemo` for derived data (filtered lists, calendar days, schedule map)
- Performance optimized with proper memoization

### Accessibility
- Semantic HTML elements
- `aria-label` on navigation buttons
- Keyboard navigation support
- Focus states on interactive elements
- Color contrast compliance

## Mock Data Structure

### WorkSchedule Interface
```typescript
interface WorkSchedule {
    date: string;        // "YYYY-MM-DD"
    campName: string;
    location: string;
    timeSlot: string;
    role: string;
    camperCount: number;
}
```

### Camp Interface
```typescript
interface Camp {
    id: number;
    name: string;
    location: string;
    startDate: string;
    endDate: string;
    camperCount: number;
    status: "upcoming" | "ongoing" | "completed";
    description: string;
}
```

### Blog Interface
```typescript
interface Blog {
    id: number;
    title: string;
    excerpt: string;
    createdAt: string;
    status: "published" | "draft";
    views: number;
}
```

## Navigation Flow

1. **Entry Point**: Navigate to `/staff/schedule`
2. **Default View**: My Schedule page with current month calendar
3. **Sidebar Navigation**: Click on any menu item to switch pages
4. **Collapsible Sidebar**: Toggle button at bottom to collapse/expand

## Future Enhancements

### Backend Integration
- [ ] Connect to staff schedule API
- [ ] Fetch real camp assignments
- [ ] Integrate blog management API
- [ ] Add authentication guards

### Features
- [ ] Multi-day schedule support
- [ ] Schedule conflict detection
- [ ] Export schedule to calendar (iCal)
- [ ] Real-time notifications
- [ ] Blog rich text editor
- [ ] Camp attendance tracking
- [ ] Performance metrics dashboard

### UX Improvements
- [ ] Loading skeletons
- [ ] Toast notifications
- [ ] Confirmation modals
- [ ] Drag-and-drop schedule management
- [ ] Quick add schedule button
- [ ] Search and filter enhancements

## Testing Checklist

- [x] Calendar renders correctly
- [x] Month navigation works
- [x] Day click shows schedule details
- [x] Highlighted days match mock data
- [x] Sidebar navigation works
- [x] Filter tabs work on all pages
- [x] Responsive layout adapts
- [x] No TypeScript errors
- [x] Professional styling consistent with admin panel

## Usage

### To Access Staff Panel:
```
http://localhost:5173/staff/schedule
```

### To Navigate:
- Click sidebar items to switch between Schedule, Camps, and Blogs
- Use calendar navigation to browse different months
- Click on highlighted calendar days to see schedule details
- Use filter tabs to filter camps and blogs by status

## Notes

- All data is currently mock data for demonstration
- Sidebar styling matches admin panel for consistency
- Calendar automatically shows current month on load
- Default landing page is My Schedule (not Dashboard)
- No dashboard page as per requirements
- Professional black/white theme throughout
