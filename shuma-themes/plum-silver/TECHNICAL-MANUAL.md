# Shuma Website - Technical Inspection Manual

Quick reference guide for inspecting and troubleshooting the Shuma Executive Massage Parlor website deployment on k3s.

## Quick Access

**Website URLs:**
```bash
# NodePort (ports 30080)
http://10.0.0.100:30080  # Master
http://10.0.0.101:30080  # Worker 1
http://10.0.0.102:30080  # Worker 2
http://10.0.0.103:30080  # Worker 3
http://10.0.0.104:30080  # Worker 4
```

## 1. Cluster Health Checks

### View All Resources
```bash
kubectl get all -n shuma-website
```

Expected output:
- 3 pods in `Running` status
- 2 services (LoadBalancer + NodePort)
- 1 deployment with 3/3 ready

### Check Pod Status
```bash
# List pods with detailed info
kubectl get pods -n shuma-website -o wide

# Watch pods in real-time
kubectl get pods -n shuma-website -w
```

**Expected:** All pods `1/1 READY`, `STATUS: Running`

### Check Pod Health
```bash
# View pod details
kubectl describe pod <pod-name> -n shuma-website

# Check resource usage
kubectl top pods -n shuma-website
```

## 2. Service & Network Inspection

### View Services
```bash
# List services
kubectl get svc -n shuma-website

# Describe service details
kubectl describe svc shuma-website-nodeport -n shuma-website
```

**Expected Services:**
- `shuma-website-nodeport`: NodePort on 30080
- `shuma-website-service`: LoadBalancer (pending external IP)

### Test Connectivity
```bash
# Test from local machine
curl -I http://10.0.0.100:30080

# Test from cluster (internal)
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -n shuma-website -- curl http://shuma-website-service

# Check DNS resolution
kubectl run -it --rm debug --image=busybox --restart=Never -n shuma-website -- nslookup shuma-website-service
```

**Expected:** HTTP 200 OK with nginx headers

## 3. Log Inspection

### View Application Logs
```bash
# Tail logs from all pods
kubectl logs -n shuma-website -l app=shuma-website --tail=50

# Follow logs in real-time
kubectl logs -n shuma-website -l app=shuma-website -f

# Logs from specific pod
kubectl logs <pod-name> -n shuma-website

# Previous crashed container logs
kubectl logs <pod-name> -n shuma-website --previous
```

### Check Nginx Access Logs
```bash
kubectl exec -it <pod-name> -n shuma-website -- tail -f /var/log/nginx/access.log
```

### Check Nginx Error Logs
```bash
kubectl exec -it <pod-name> -n shuma-website -- tail -f /var/log/nginx/error.log
```

## 4. Deployment Inspection

### Check Deployment Status
```bash
# Deployment overview
kubectl get deployment shuma-website -n shuma-website

# Detailed deployment info
kubectl describe deployment shuma-website -n shuma-website

# Rollout status
kubectl rollout status deployment/shuma-website -n shuma-website

# Rollout history
kubectl rollout history deployment/shuma-website -n shuma-website
```

### Check ReplicaSets
```bash
kubectl get rs -n shuma-website
```

**Expected:** Current RS with 3 desired/ready, old RSs scaled to 0

## 5. Resource Usage

### Pod Resources
```bash
# CPU/Memory usage (requires metrics-server)
kubectl top pods -n shuma-website

# Resource requests/limits
kubectl describe pod <pod-name> -n shuma-website | grep -A 10 "Limits"
```

**Expected Limits:**
- Memory: 64Mi (request) / 128Mi (limit)
- CPU: 100m (request) / 200m (limit)

### Node Distribution
```bash
# See which nodes pods are on
kubectl get pods -n shuma-website -o wide

# Check node resources
kubectl top nodes
```

**Expected:** Pods distributed across different nodes (anti-affinity)

## 6. Configuration Inspection

### View Deployment YAML
```bash
kubectl get deployment shuma-website -n shuma-website -o yaml
```

### View Service YAML
```bash
kubectl get svc shuma-website-nodeport -n shuma-website -o yaml
```

### Check Environment Variables
```bash
kubectl exec <pod-name> -n shuma-website -- env
```

## 7. Interactive Debugging

### Shell into Pod
```bash
# Get bash shell
kubectl exec -it <pod-name> -n shuma-website -- /bin/sh

# Once inside:
ls -la /usr/share/nginx/html/          # Check website files
cat /etc/nginx/nginx.conf              # Check nginx config
nginx -t                                # Test nginx config
ps aux                                  # Check running processes
```

### Test from Inside Pod
```bash
kubectl exec -it <pod-name> -n shuma-website -- sh -c "wget -O- http://localhost"
```

## 8. Health & Readiness Probes

### Check Probe Status
```bash
kubectl describe pod <pod-name> -n shuma-website | grep -A 5 "Liveness"
kubectl describe pod <pod-name> -n shuma-website | grep -A 5 "Readiness"
```

**Configured Probes:**
- **Liveness:** HTTP GET / on port 80, every 10s
- **Readiness:** HTTP GET / on port 80, every 5s

## 9. Events & Troubleshooting

### View Recent Events
```bash
# All events in namespace
kubectl get events -n shuma-website --sort-by=.lastTimestamp

# Events for specific pod
kubectl describe pod <pod-name> -n shuma-website | grep -A 20 "Events:"

# Watch events
kubectl get events -n shuma-website -w
```

### Common Issues

**Pods not starting:**
```bash
kubectl describe pod <pod-name> -n shuma-website
kubectl logs <pod-name> -n shuma-website
```

**Image pull errors:**
```bash
# Check if image exists on node
ssh <user>@<node-ip> 'sudo k3s ctr images ls | grep shuma'
```

**Connection refused:**
```bash
# Test pod network
kubectl exec <pod-name> -n shuma-website -- netstat -tlnp
```

## 10. Performance Testing

### Basic Load Test
```bash
# Install apache bench
sudo apt install apache2-utils

# Run load test (100 requests, 10 concurrent)
ab -n 100 -c 10 http://10.0.0.100:30080/
```

### Curl Performance
```bash
# Measure response time
curl -w "@-" -o /dev/null -s http://10.0.0.100:30080/ <<'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
      time_redirect:  %{time_redirect}\n
   time_pretransfer:  %{time_pretransfer}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF
```

## 11. Scaling Operations

### Scale Deployment
```bash
# Scale to 5 replicas
kubectl scale deployment shuma-website -n shuma-website --replicas=5

# Scale back to 3
kubectl scale deployment shuma-website -n shuma-website --replicas=3
```

### Check Scaling
```bash
kubectl get deployment shuma-website -n shuma-website -w
```

## 12. Update & Rollback

### Update Deployment
```bash
# After building new image
kubectl rollout restart deployment/shuma-website -n shuma-website

# Update image (if using registry)
kubectl set image deployment/shuma-website nginx=shuma-website:v2 -n shuma-website
```

### Rollback
```bash
# Rollback to previous version
kubectl rollout undo deployment/shuma-website -n shuma-website

# Rollback to specific revision
kubectl rollout undo deployment/shuma-website -n shuma-website --to-revision=2
```

## 13. Security Inspection

### Check Security Headers
```bash
curl -I http://10.0.0.100:30080 | grep -E "(X-Frame|X-XSS|X-Content|CSP|Referrer)"
```

**Expected Headers:**
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Content-Security-Policy: present
- Referrer-Policy: present

### Check Pod Security
```bash
kubectl get pod <pod-name> -n shuma-website -o yaml | grep -A 10 "securityContext"
```

## 14. Cleanup Commands

### Delete Specific Resources
```bash
# Delete single pod (will recreate)
kubectl delete pod <pod-name> -n shuma-website

# Delete deployment (keeps namespace)
kubectl delete deployment shuma-website -n shuma-website

# Delete all resources in namespace
kubectl delete all --all -n shuma-website
```

### Complete Removal
```bash
# Delete everything including namespace
kubectl delete namespace shuma-website
```

## 15. Quick Troubleshooting Checklist

```bash
# 1. Are pods running?
kubectl get pods -n shuma-website

# 2. Any errors in events?
kubectl get events -n shuma-website --sort-by=.lastTimestamp | tail -20

# 3. Check pod logs
kubectl logs -n shuma-website -l app=shuma-website --tail=50

# 4. Is service accessible?
curl -I http://10.0.0.100:30080

# 5. Are endpoints configured?
kubectl get endpoints -n shuma-website

# 6. Check pod details
kubectl describe pod <pod-name> -n shuma-website
```

## 16. Monitoring Dashboard (Optional)

### K9s - Terminal UI
```bash
# Install k9s
brew install k9s  # macOS
# or download from https://k9scli.io/

# Launch and navigate to namespace
k9s -n shuma-website
```

**K9s shortcuts:**
- `:pods` - View pods
- `:svc` - View services
- `:deploy` - View deployments
- `l` - View logs
- `d` - Describe resource
- `?` - Help

## Quick Reference Card

| Task | Command |
|------|---------|
| Check status | `kubectl get all -n shuma-website` |
| View logs | `kubectl logs -n shuma-website -l app=shuma-website -f` |
| Test website | `curl http://10.0.0.100:30080` |
| Shell into pod | `kubectl exec -it <pod> -n shuma-website -- sh` |
| Restart deployment | `kubectl rollout restart deployment/shuma-website -n shuma-website` |
| Scale pods | `kubectl scale deployment shuma-website --replicas=N -n shuma-website` |
| View events | `kubectl get events -n shuma-website --sort-by=.lastTimestamp` |
| Delete pod | `kubectl delete pod <pod> -n shuma-website` |

## Contact & Support

**Deployment Files:**
- Main manifest: `shuma-deployment.yaml`
- Website code: `shuma-website/`
- Documentation: `shuma-website/README.md`

**Cluster Info:**
- Master: pi5-01 (10.0.0.100)
- Workers: pi4-01 to pi4-04 (10.0.0.101-104)
- Namespace: `shuma-website`

---
*Last Updated: 2025-10-03*
