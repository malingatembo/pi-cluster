# Shuma Executive Massage Parlor - Theme Collection Guide

Complete reference for all five premium color themes created for the Shuma website.

## 🎨 All Available Themes

### 1. 🔴 Burgundy & Navy (Original - Classic Executive)
**Git Tag**: `theme-burgundy-navy`
**Branch**: `feature/shuma-executive-massage-website-20251003`
**Port**: `30080`
**Namespace**: `shuma-website`

**Colors:**
- Primary: Burgundy (#8B0000)
- Secondary: Navy Blue (#001F3F)
- Accent: Gold (#D4AF37)
- Background: Cream (#F5F5F5)

**Personality:**
- Bold and professional
- Executive-level presentation
- Traditional luxury feel
- Gender-neutral appeal

**Access:** `http://10.0.0.100:30080`

---

### 2. 🟢 Sage & Gold (Natural Luxury)
**Git Tag**: `theme-sage-gold`
**Branch**: `feature/shuma-sage-gold-theme-20251003`
**Port**: `30081`
**Namespace**: `shuma-sage`

**Colors:**
- Primary: Deep Sage Green (#4A6741)
- Secondary: Forest Green (#2D5016)
- Accent: Rich Warm Gold (#C9A961)
- Background: Warm Cream (#F5F1E8)

**Personality:**
- Natural, organic wellness
- Spa psychology (green = calm, healing)
- Holistic and grounding
- Best wellness industry alignment

**Access:** `http://10.0.0.100:30081`

---

### 3. 🔵 Teal & Rose Gold (Modern Elegance)
**Git Tag**: `theme-teal-rose`
**Branch**: `feature/shuma-multi-themes-20251003`
**Location**: `shuma-themes/teal-rose/`
**Port**: `30082`
**Namespace**: `shuma-teal`

**Colors:**
- Primary: Deep Teal (#1B4D5C)
- Secondary: Darker Teal (#0D3A47)
- Accent: Rose Gold (#B76E79)
- Background: Soft Blush (#F4E4E1)

**Personality:**
- Contemporary and feminine
- Instagram-worthy aesthetic
- Modern luxury sophistication
- Trending color palette

**Access:** `http://10.0.0.100:30082`

---

### 4. 🟣 Plum & Silver (Royal Elegance)
**Git Tag**: `theme-plum-silver`
**Branch**: `feature/shuma-multi-themes-20251003`
**Location**: `shuma-themes/plum-silver/`
**Port**: `30083`
**Namespace**: `shuma-plum`

**Colors:**
- Primary: Deep Plum (#5D3A5A)
- Secondary: Dark Plum (#3D1F3B)
- Accent: Silver (#C0C0C0)
- Background: Lavender Mist (#F0EFF4)

**Personality:**
- Regal and calming
- Unique positioning
- Memorable and elegant
- Exclusive royal treatment feel

**Access:** `http://10.0.0.100:30083`

---

### 5. ⚫ Charcoal & Copper (Industrial Chic)
**Git Tag**: `theme-charcoal-copper`
**Branch**: `feature/shuma-multi-themes-20251003`
**Location**: `shuma-themes/charcoal-copper/`
**Port**: `30084`
**Namespace**: `shuma-charcoal`

**Colors:**
- Primary: Charcoal Gray (#2C3E50)
- Secondary: Deep Charcoal (#1A252F)
- Accent: Warm Copper (#C77A58)
- Background: Warm Taupe (#D4C5B9)

**Personality:**
- Urban sophistication
- Masculine executive appeal
- Industrial luxury
- Modern edge

**Access:** `http://10.0.0.100:30084`

---

## 🚀 How to Access Themes

### View Live Deployments
All themes are currently running on your k3s cluster:
```bash
# List all deployments
kubectl get deployments --all-namespaces | grep shuma

# Check specific theme
kubectl get all -n shuma-website    # Burgundy & Navy
kubectl get all -n shuma-sage       # Sage & Gold
kubectl get all -n shuma-teal       # Teal & Rose Gold
kubectl get all -n shuma-plum       # Plum & Silver
kubectl get all -n shuma-charcoal   # Charcoal & Copper
```

### Access from Browser
Open these URLs to view each theme:
- http://10.0.0.100:30080 (Burgundy & Navy)
- http://10.0.0.100:30081 (Sage & Gold)
- http://10.0.0.100:30082 (Teal & Rose Gold)
- http://10.0.0.100:30083 (Plum & Silver)
- http://10.0.0.100:30084 (Charcoal & Copper)

---

## 📂 Theme File Locations

### Git Repository Structure
```
pi-cluster/
├── shuma-website/              # Original Burgundy & Navy
│   ├── index.html
│   ├── css/styles.css
│   ├── js/main.js
│   └── Dockerfile
│
├── shuma-themes/
│   ├── teal-rose/             # Teal & Rose Gold
│   ├── plum-silver/           # Plum & Silver
│   └── charcoal-copper/       # Charcoal & Copper
│
├── shuma-deployment.yaml       # Burgundy & Navy deployment
├── shuma-sage-deployment.yaml  # Sage & Gold deployment
└── shuma-all-themes-deployment.yaml  # Teal, Plum, Charcoal deployments
```

---

## 🔄 Switching Between Themes

### Option 1: Git Checkout (for development)
```bash
# Switch to specific theme branch
git checkout feature/shuma-executive-massage-website-20251003  # Original
git checkout feature/shuma-sage-gold-theme-20251003            # Sage & Gold
git checkout feature/shuma-multi-themes-20251003               # All 3 new themes

# Or use tags
git checkout theme-burgundy-navy
git checkout theme-sage-gold
git checkout theme-teal-rose
git checkout theme-plum-silver
git checkout theme-charcoal-copper
```

### Option 2: Keep All Running (current setup)
All themes are deployed simultaneously on different ports - just visit the URL!

### Option 3: Deploy Single Theme
```bash
# Delete other themes
kubectl delete namespace shuma-sage shuma-teal shuma-plum shuma-charcoal

# Keep only your favorite
kubectl get all -n shuma-website  # Burgundy & Navy remains
```

---

## 🎯 Recommended Theme by Use Case

| Client Type | Best Theme | Reasoning |
|-------------|------------|-----------|
| General Spa Clients | Sage & Gold | Most spa-appropriate, calming |
| Female-focused | Teal & Rose Gold | Contemporary, Instagram-worthy |
| Male Executives | Charcoal & Copper | Masculine, urban sophistication |
| Unique Positioning | Plum & Silver | Stand out from competitors |
| Traditional Luxury | Burgundy & Navy | Classic executive appeal |

---

## 💾 Backup & Archive

### All themes are preserved in:
1. **Git Branches** (on GitHub)
   - `feature/shuma-executive-massage-website-20251003`
   - `feature/shuma-sage-gold-theme-20251003`
   - `feature/shuma-multi-themes-20251003`

2. **Git Tags** (on GitHub)
   - `theme-burgundy-navy`
   - `theme-sage-gold`
   - `theme-teal-rose`
   - `theme-plum-silver`
   - `theme-charcoal-copper`

3. **Docker Images** (on cluster nodes)
   - `shuma-website:latest`
   - `shuma-sage-gold:latest`
   - `shuma-teal-rose:latest`
   - `shuma-plum-silver:latest`
   - `shuma-charcoal-copper:latest`

4. **Kubernetes Deployments** (currently running)
   - All 5 themes deployed and accessible

---

## 🔧 Maintenance Commands

### View All Themes
```bash
kubectl get namespaces | grep shuma
```

### Stop a Specific Theme
```bash
kubectl delete namespace shuma-sage  # Example: remove Sage & Gold
```

### Restart a Theme
```bash
kubectl rollout restart deployment/shuma-website -n shuma-website
```

### Scale a Theme
```bash
kubectl scale deployment shuma-website --replicas=5 -n shuma-website
```

---

## 📊 Resource Usage

Each theme deployment uses:
- **Pods**: 2-3 replicas
- **Memory**: 64-128Mi per pod
- **CPU**: 100-200m per pod
- **Total Cluster**: ~25 pods, ~2GB RAM for all themes

---

## 🎨 Future Theme Ideas

If you want more themes later:
- Midnight Blue & Champagne (Ultra Luxury)
- Forest Green & Ivory (Organic Premium)
- Espresso & Caramel (Warm Sophistication)
- Pearl White & Platinum (Minimal Elegance)

---

**Created**: 2025-10-03
**Last Updated**: 2025-10-03
**Maintained By**: Claude Code
