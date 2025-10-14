# Staff Control Panel - Quick Start Guide

## 🚀 Access the Staff Panel

Navigate to: **http://localhost:5173/staff/schedule**

## 📋 Pages Overview

### 1️⃣ My Schedule (Default)
**What you'll see:**
- Interactive calendar showing current month
- Days with work schedules highlighted in **black**
- Today's date has a **bold border**
- Right panel shows upcoming schedule by default

**How to use:**
- Click **◀ ▶** arrows to navigate between months
- Click any **highlighted day** to see schedule details for that day
- View camp name, location, time slot, and your role
- See how many campers you'll be working with

**Mock schedules available:**
- October 15, 16, 20, 22, 25, 28
- November 2

---

### 2️⃣ My Camps
**What you'll see:**
- Grid of camp cards you're assigned to
- Filter tabs: All / Upcoming / Ongoing / Completed
- Each card shows camp details and status

**How to use:**
- Click **filter tabs** to see different camp statuses
- Hover over cards for elevation effect
- Click **View Details** to see more (placeholder for now)

**Mock camps available:**
- 4 camps total
- 3 upcoming, 1 completed

---

### 3️⃣ My Blogs
**What you'll see:**
- List of your blog posts
- Filter tabs: All Posts / Published / Drafts
- "Create New Blog" button at top

**How to use:**
- Click **filter tabs** to see published vs draft posts
- View, Edit, or Delete using action buttons on the right
- Click **Create New Blog** to start a new post (placeholder for now)

**Mock blogs available:**
- 4 blog posts total
- 3 published (with view counts)
- 1 draft

---

## 🎨 Design Features

### Professional Theme
- Clean black & white design
- Consistent with admin panel styling
- Smooth animations and transitions

### Responsive Design
- Works on desktop and mobile
- Sidebar collapses for more space
- Grid layouts adapt to screen size

### Interactive Elements
- Hover effects on all cards and buttons
- Active state indicators
- Smooth transitions (0.2-0.3s)

---

## 🧭 Navigation

### Sidebar Menu
Click any menu item to navigate:
- **📅 My Schedule** - Calendar and work schedule
- **⛺ My Camps** - Your assigned camps
- **📝 My Blogs** - Your blog posts

### Collapse Sidebar
- Click **◀ ▶** button at bottom of sidebar
- Sidebar shrinks to icons only
- More space for main content

### Logout
- Click **Logout** button at bottom of sidebar
- (Placeholder for now - will integrate with auth)

---

## 📊 Mock Data Summary

### Schedule Entries: 7
- Covers October and early November
- Various camps and locations
- Different time slots and roles

### Camp Assignments: 4
- Mix of upcoming and completed
- Different locations and sizes
- 15-30 campers per camp

### Blog Posts: 4
- Educational content about camping
- View counts for published posts
- Draft and published states

---

## 🔧 Technical Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Lucide React** - Icon library
- **CSS Modules** - Styling
- **React Router** - Navigation

---

## ✅ What Works Now

- ✅ Full calendar navigation
- ✅ Interactive day selection
- ✅ Schedule details display
- ✅ Filter tabs on all pages
- ✅ Responsive layout
- ✅ Sidebar collapse/expand
- ✅ Professional styling
- ✅ Mock data rendering

---

## 🔜 Coming Soon (Backend Integration)

- 🔲 Real schedule data from API
- 🔲 Actual camp assignments
- 🔲 Blog CRUD operations
- 🔲 Authentication guards
- 🔲 Push notifications
- 🔲 Export schedule feature

---

## 📸 Page Screenshots (What to Expect)

### My Schedule
```
┌─────────────────────────────────────────────────────┐
│  [Logo] Staff Panel                                  │
│  📅 My Schedule                                      │
│  ⛺ My Camps                                         │
│  📝 My Blogs                                         │
│                                                      │
│  [Logout]                                            │
│  [◀]                                                 │
└─────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  My Schedule                                                  │
│  View and manage your work schedule                          │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────┐  ┌─────────────────────────┐│
│  │    ◀  October 2025  ▶     │  │  Upcoming Schedule      ││
│  │                            │  │                         ││
│  │  Sun Mon Tue ... Fri Sat   │  │  Oct 15                 ││
│  │    1   2   3  ... 11  12   │  │  Adventure Quest Camp   ││
│  │   13  14  15  ... 18  19   │  │  Mountain Valley        ││
│  │         ████             │  │  8:00 AM - 4:00 PM      ││
│  │   20  21  22  ... 25  26   │  │  Camp Counselor         ││
│  │  ████      ████ ████       │  │  20 Campers             ││
│  └────────────────────────────┘  └─────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Differences from Admin Panel

| Feature | Admin Panel | Staff Panel |
|---------|-------------|-------------|
| **Landing Page** | Dashboard with stats | My Schedule with calendar |
| **Navigation** | Dashboard, Accounts, Blogs, Camps, Settings | My Schedule, My Camps, My Blogs |
| **Focus** | Management & oversight | Personal schedule & tasks |
| **Dashboard** | Yes (statistics, charts) | No dashboard |
| **Scope** | All data (camps, users, blogs) | Personal data only |

---

## 💡 Tips

1. **Calendar Navigation**: Use keyboard arrow keys on day selection for quick browsing
2. **Sidebar**: Collapse it when working with detailed schedules for more space
3. **Filters**: Combine with search for quick access to specific items
4. **Hover Effects**: Hover over elements to see interactive feedback
5. **Responsive**: Try resizing your browser to see responsive design in action

---

## 🐛 Known Issues

- None at the moment! All features working as expected with mock data.

---

## 📞 Support

For questions or issues, refer to:
- `STAFF_PANEL_DOCUMENTATION.md` - Full technical documentation
- `src/pages/Staff/` - Source code for all staff pages
- `src/components/staff/` - Reusable staff components

---

**Happy Scheduling! 📅⛺📝**
