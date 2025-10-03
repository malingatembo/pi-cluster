# Shuma Website - Quick Reference Card

## 🌐 Access URLs

```bash
# HTTP via Ingress (with security headers)
http://10.0.0.100/shuma

# HTTP via NodePort (direct, no security middleware)
http://10.0.0.100:30080

# HTTPS (after domain setup)
https://your-domain.com
```

## 🚀 Deployment Commands

### Update Website Content
```bash
cd /home/mtembo/projects/personal/infrastructure/pi-cluster/shuma-website

# Build new version
docker buildx build --platform linux/arm64 -t shuma-website:v5 --load .

# Distribute to all nodes
for node in c00@10.0.0.100 w01@10.0.0.101 w02@10.0.0.102 w03@10.0.0.103 w04@10.0.0.104; do
  docker save shuma-website:v5 | ssh $node 'sudo k3s ctr images import -'
  ssh $node 'sudo k3s ctr images tag docker.io/library/shuma-website:v5 docker.io/library/shuma-website:latest'
done

# Rolling update
kubectl set image deployment/shuma-website nginx=shuma-website:latest -n shuma-website
kubectl rollout status deployment/shuma-website -n shuma-website
```

### Quick Rollback
```bash
# Rollback to previous version
kubectl rollout undo deployment/shuma-website -n shuma-website

# View rollout history
kubectl rollout history deployment/shuma-website -n shuma-website
```

## 🔍 Monitoring Commands

### Check Status
```bash
# Pods status
kubectl get pods -n shuma-website -o wide

# Deployment status
kubectl get deployment -n shuma-website

# Ingress status
kubectl get ingress -n shuma-website

# Service endpoints
kubectl get svc -n shuma-website

# Network policies
kubectl get networkpolicy -n shuma-website
```

### View Logs
```bash
# All pods
kubectl logs -n shuma-website -l app=shuma-website --tail=100

# Specific pod
kubectl logs -n shuma-website POD_NAME --tail=50 -f

# Traefik ingress logs
kubectl logs -n kube-system -l app.kubernetes.io/name=traefik --tail=100
```

### Debug Pods
```bash
# Execute shell in pod
kubectl exec -it -n shuma-website POD_NAME -- sh

# Check files in pod
kubectl exec -n shuma-website POD_NAME -- ls -la /usr/share/nginx/html/

# Test connectivity
kubectl exec -n shuma-website POD_NAME -- wget -O- http://localhost
```

## 🔒 Security Commands

### Test Security Headers
```bash
curl -I http://10.0.0.100/shuma | grep -E "(X-Frame|X-XSS|Content-Security|Referrer)"
```

### Check Middleware
```bash
kubectl get middleware -n shuma-website
kubectl describe middleware security-headers -n shuma-website
```

### View Certificate Status
```bash
kubectl get certificate -n shuma-website
kubectl describe certificate shuma-tls-cert -n shuma-website
```

### Check Rate Limiting
```bash
# Test rate limit (will get 429 Too Many Requests after ~100 reqs)
for i in {1..150}; do
  curl -s -o /dev/null -w "%{http_code} " http://10.0.0.100/shuma
  echo ""
done
```

## 🛠️ Troubleshooting

### Pod Crashes
```bash
# View pod events
kubectl describe pod -n shuma-website POD_NAME

# Check previous logs
kubectl logs -n shuma-website POD_NAME --previous

# Delete crashing pod (will auto-recreate)
kubectl delete pod -n shuma-website POD_NAME
```

### Ingress Not Working
```bash
# Check Traefik status
kubectl get pods -n kube-system | grep traefik

# View Traefik config
kubectl get ingressroute -A

# Test direct service access (bypass ingress)
kubectl port-forward -n shuma-website svc/shuma-website-service 8080:80
# Then: curl http://localhost:8080
```

### Network Policy Blocking
```bash
# Temporarily disable network policies
kubectl delete networkpolicy -n shuma-website --all

# Re-apply after testing
kubectl apply -f shuma-network-policy.yaml
```

## 📊 Performance Testing

### Load Test
```bash
# Simple load test (install apache2-utils first)
ab -n 1000 -c 10 http://10.0.0.100/shuma

# Monitor during load test
watch -n 1 'kubectl top pods -n shuma-website'
```

### Check Resource Usage
```bash
# Pod resource usage
kubectl top pods -n shuma-website

# Node resource usage
kubectl top nodes
```

## 🔄 Scaling

### Manual Scaling
```bash
# Scale up
kubectl scale deployment shuma-website --replicas=5 -n shuma-website

# Scale down
kubectl scale deployment shuma-website --replicas=2 -n shuma-website

# Check replica status
kubectl get deployment shuma-website -n shuma-website
```

### Auto-scaling (Future)
```bash
# Set up horizontal pod autoscaler
kubectl autoscale deployment shuma-website \
  --cpu-percent=70 \
  --min=3 \
  --max=10 \
  -n shuma-website
```

## 💾 Backup & Restore

### Backup Everything
```bash
# Backup all resources
kubectl get all,ingress,certificate,secret,networkpolicy,middleware \
  -n shuma-website -o yaml > shuma-backup-$(date +%Y%m%d).yaml

# Backup TLS certificate
kubectl get secret shuma-tls-cert -n shuma-website -o yaml > shuma-tls-backup.yaml
```

### Restore from Backup
```bash
kubectl apply -f shuma-backup-YYYYMMDD.yaml
```

## 🔧 Configuration Updates

### Update Security Headers
```bash
# Edit middleware
kubectl edit middleware security-headers -n shuma-website

# Or update file and apply
kubectl apply -f shuma-secure-ingress-http.yaml
```

### Update Rate Limits
```bash
kubectl edit middleware rate-limit -n shuma-website

# Change values:
# average: 100 → 200
# burst: 50 → 100
```

### Switch to HTTPS (After Domain Setup)
```bash
# Apply production ingress with SSL
kubectl apply -f shuma-production-ingress.yaml

# Monitor certificate creation
kubectl get certificate -n shuma-website -w
```

## 📝 File Locations

```
/home/mtembo/projects/personal/infrastructure/pi-cluster/
├── shuma-website/                      # Website source code
│   ├── index.html                      # Main HTML (Czech localized)
│   ├── css/styles.css                  # Styles (burgundy/navy theme)
│   ├── js/main.js                      # JavaScript
│   ├── images/frontimage.png           # Professional photo
│   ├── Dockerfile                      # Container build file
│   └── nginx.conf                      # Nginx configuration
├── shuma-deployment.yaml               # Main Kubernetes deployment
├── shuma-secure-ingress-http.yaml      # HTTP ingress with security
├── shuma-production-ingress.yaml       # HTTPS ingress (for later)
├── shuma-network-policy.yaml           # Network security policies
├── cert-manager-setup.yaml             # SSL certificate issuers
├── PRODUCTION-DEPLOYMENT-GUIDE.md      # Full deployment guide
├── SECURITY-STATUS.md                  # Security features documentation
└── SHUMA-QUICK-REFERENCE.md            # This file
```

## 🎨 Other Color Themes

All theme variants available on different ports:

```bash
# Burgundy & Navy (main) - Port 30080
http://10.0.0.100:30080

# Sage & Gold - Port 30081
http://10.0.0.101:30081

# Deep Teal & Rose Gold - Port 30082
http://10.0.0.102:30082

# Plum & Silver - Port 30083
http://10.0.0.103:30083

# Charcoal & Copper - Port 30084
http://10.0.0.104:30084
```

## ⚡ Quick Health Check

```bash
# One-liner to check everything
kubectl get pods,svc,ingress,middleware,networkpolicy -n shuma-website && \
curl -I http://10.0.0.100/shuma 2>&1 | head -10
```

## 🆘 Emergency Commands

### Take Site Offline
```bash
kubectl scale deployment shuma-website --replicas=0 -n shuma-website
```

### Bring Site Back Online
```bash
kubectl scale deployment shuma-website --replicas=3 -n shuma-website
```

### Complete Restart
```bash
kubectl delete pods -l app=shuma-website -n shuma-website
```

### Nuclear Option (Delete Everything and Redeploy)
```bash
kubectl delete namespace shuma-website
kubectl create namespace shuma-website
kubectl apply -f shuma-deployment.yaml
kubectl apply -f shuma-secure-ingress-http.yaml
kubectl apply -f shuma-network-policy.yaml
```
