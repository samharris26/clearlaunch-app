create a readme.md file and place this in to it:
# ClearLaunch — Build & Launch Roadmap

A structured, end-to-end checklist for developing, launching, and scaling the ClearLaunch product.  
This file is intentionally detailed so Cursor can follow it in logical order.  
Tick items off as you complete them.

---

## 1. Foundations & Direction
- [ ] **Define clear value proposition**
- [ ] **Define brand tone & identity** (straight-up, determined, spirited)
- [ ] **Finalise typography, colours, logo**
- [ ] **Confirm pricing model**  
  - Free: 1 launch, limited AI tools  
  - Pro: 3 launches + all AI tools  
  - Add-ons: extra users
- [ ] **Confirm tech stack decisions**
  - Keep Clerk auth
  - Supabase for DB
  - Next.js app
  - Astro marketing site
  - Stripe for payments

---

## 2. Data Architecture & Backend Setup
- [ ] **Define final DB schema**
  - organisations  
  - users  
  - launches  
  - tasks  
  - onboarding responses  
  - pricing/plan  
  - affiliate links
- [ ] **Fix organisation reference issue** (ensure AI generation uses the right one)
- [ ] **Implement plan limits** (free = 1 launch)
- [ ] **Integrate Stripe**
  - Plan creation
  - Webhooks → update user plan
  - Handle upgrades/downgrades

---

## 3. Core Product Build

### Onboarding
- [ ] Build onboarding flow UI
- [ ] Add right-hand copy + bullet points with icons
- [ ] Save responses to DB
- [ ] Feed onboarding data into AI generation

### Dashboard
- [ ] Build dashboard layout (Figma → Cursor)
- [ ] Show all launches
- [ ] Disable “Add launch” on free plan
- [ ] Display plan status + “Upgrade”

### Launch Overview
- [ ] Build launch detail view
- [ ] Add regenerate plan button
- [ ] Add launch settings modal
- [ ] Add task board with filters (All / Upcoming / Completed / Overdue)

### Task Cards
- [ ] Fix spacing/layout issues
- [ ] Remove duplicate due date
- [ ] Add better glanceable info:
  - status dot  
  - platform icons  
  - time estimate  
  - due tag  
  - subtasks  
- [ ] Add “Tip” area with affiliate links

### Task Modal
- [ ] Build modal UI
- [ ] Title + description
- [ ] Subtasks
- [ ] Notes
- [ ] Due date editing
- [ ] “Generate assets” button

---

## 4. AI System

- [ ] Rewrite AI generation prompt with:
  - granular tasks  
  - platform-aware  
  - combined logic  
  - timeline-aware  
  - uses onboarding data  
  - follows tone  
- [ ] Add multi-platform alignment (IG + email + TikTok etc.)
- [ ] Add logic for different launch durations (5 days to 5 months)
- [ ] Add regenerate-single-task support
- [ ] Add regenerate-category support
- [ ] Store AI prompt + version in DB

---

## 5. Content & Asset Generation
- [ ] Instagram copy generator
- [ ] Carousel generator
- [ ] Reels/TikTok script generator
- [ ] Email campaign generator
- [ ] Reusable content templates
- [ ] Ability for users to add custom tasks manually

---

## 6. Calendar & Reminder System
- [ ] ICS file export for individual tasks
- [ ] ICS export for full launch timeline
- [ ] Optional email reminders (later)

---

## 7. Tool/Affiliate Integrations
- [ ] Identify recommended tools (email platforms, link-in-bio, schedulers)
- [ ] Create affiliate accounts
- [ ] Add affiliate link DB table
- [ ] Add lightbulb “Tip” UI in task cards
- [ ] Implement affiliate-link click tracking

---

## 8. Marketing Site (Astro)
- [ ] Create `/marketing` Astro project
- [ ] Build homepage
- [ ] Pricing page
- [ ] Feature overview
- [ ] Add sign-in/sign-up buttons
- [ ] SEO setup (metadata, OG, sitemap)
- [ ] Demo/gif assets
- [ ] Connect Stripe checkout
- [ ] Publish on Vercel

---

## 9. Instagram Launch Plan
- [ ] Create 14–30 day content plan
- [ ] Teasers
- [ ] Screenshots/mocks
- [ ] How-it-works video
- [ ] Founder story
- [ ] Launch countdown
- [ ] Final announcement post
- [ ] Build landing page for email capture

---

## 10. Testing & QA
- [ ] Mobile testing (ngrok or Vercel)
- [ ] End-to-end testing:
  - onboarding  
  - launch creation  
  - AI plan generation  
  - task editing  
  - payment flows  
  - plan limitations  
- [ ] Fix layout inconsistencies
- [ ] Cross-browser QA

---

## 11. Launch Prep
- [ ] Private beta (5–10 creators)
- [ ] Gather feedback → refine UI/UX
- [ ] Finalise pricing
- [ ] Prepare Product Hunt assets
- [ ] Prepare Instagram posts

---

## 12. Public Launch
- [ ] Launch on Product Hunt
- [ ] Launch on Instagram
- [ ] Email early sign-ups
- [ ] Monitor metrics + fix edge cases
- [ ] Update landing site with real screenshots

---

## 13. Post-Launch
- [ ] Collect analytics & user behaviour
- [ ] Monthly feature drops
- [ ] Add referral system
- [ ] Add team collaboration
- [ ] Explore automated posting

---

This document is intentionally structured so you can work top-to-bottom.  
Cursor can follow this as a development roadmap.
