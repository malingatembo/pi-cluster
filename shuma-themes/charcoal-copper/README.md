# Shuma Executive Massage Parlor Website

Premium luxury massage parlor website featuring a sophisticated burgundy and navy blue color theme.

## 🎨 Design Features

- **Color Palette**: Deep burgundy (#8B0000) and navy blue (#001F3F) with gold (#D4AF37) accents
- **Typography**: Playfair Display (headings) and Lato (body text)
- **Responsive Design**: Mobile-first approach, fully responsive across all devices
- **Modern Animations**: Smooth transitions and scroll-based animations
- **Premium UX**: Executive-level presentation and user experience

## 📁 Project Structure

```
shuma-website/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Premium styling with red/blue theme
├── js/
│   └── main.js         # Interactive JavaScript features
├── images/             # Image assets (to be added)
├── Dockerfile          # Docker build configuration
├── nginx.conf          # Nginx server configuration
└── README.md           # This file
```

## 🚀 Features

### Website Sections
1. **Hero Section** - Elegant introduction with call-to-action
2. **About Us** - Executive positioning and value proposition
3. **Services** - Six premium massage offerings with pricing
4. **Team** - Professional therapist profiles
5. **Testimonials** - Client reviews with auto-rotating slider
6. **Booking System** - Interactive booking form with validation
7. **Contact** - Contact information and location map

### Technical Features
- Smooth scroll navigation
- Active navigation highlighting
- Mobile-responsive hamburger menu
- Testimonial slider with auto-play
- Form validation and feedback
- Intersection Observer animations
- Optimized performance and SEO
- Security headers and best practices

## 🛠️ Deployment Options

### Option 1: Docker Container

Build the Docker image:
```bash
cd shuma-website
docker build -t shuma-website:latest .
```

Run the container:
```bash
docker run -d -p 8080:80 --name shuma-website shuma-website:latest
```

Access at: `http://localhost:8080`

### Option 2: Kubernetes Deployment

Deploy to your k3s cluster:
```bash
# Create namespace and deploy
kubectl apply -f ../shuma-deployment.yaml

# Check deployment status
kubectl get all -n shuma-website

# Get service URL
kubectl get svc -n shuma-website
```

Access via:
- LoadBalancer IP (if available)
- NodePort: `http://<node-ip>:30080`

### Option 3: Simple Nginx

Serve with nginx directly:
```bash
# Copy files to nginx directory
sudo cp -r shuma-website/* /var/www/html/

# Restart nginx
sudo systemctl restart nginx
```

## 📋 Customization Guide

### Change Colors
Edit CSS variables in `css/styles.css`:
```css
:root {
    --burgundy: #8B0000;    /* Primary color */
    --navy: #001F3F;        /* Secondary color */
    --gold: #D4AF37;        /* Accent color */
    --cream: #F5F5F5;       /* Background color */
}
```

### Update Content
- **Services**: Edit service cards in `index.html` (lines ~200-350)
- **Team Members**: Edit team cards in `index.html` (lines ~400-500)
- **Contact Info**: Update contact section (lines ~700-800)

### Add Images
1. Place images in `images/` directory
2. Update image placeholders in HTML:
```html
<img src="images/your-image.jpg" alt="Description">
```

## 🔒 Security Features

- CSP (Content Security Policy) headers
- XSS protection
- Clickjacking prevention
- MIME type sniffing prevention
- Secure referrer policy

## ⚡ Performance Optimizations

- Gzip compression enabled
- Static asset caching (1 year)
- Image optimization support
- Minification ready
- Lazy loading compatible

## 📱 Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- iOS Safari (latest 2 versions)
- Android Chrome (latest 2 versions)

## 🎯 Future Enhancements

- [ ] Add real images for services and team
- [ ] Integrate with booking backend API
- [ ] Add Google Maps integration
- [ ] Implement contact form backend
- [ ] Add gift certificate purchase system
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Progressive Web App (PWA) features
- [ ] Analytics integration

## 📞 Support

For support or customization requests, contact the development team.

## 📄 License

Copyright © 2025 Shuma Executive Massage Parlor. All rights reserved.
