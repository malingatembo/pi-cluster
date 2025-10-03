# Shuma Executive Massage Parlor - Production Deployment Guide

## Prerequisites

1. **Domain Name**: You need to own a domain (e.g., `shumaspa.cz`)
2. **DNS Access**: Ability to create A records pointing to your cluster
3. **Public IP**: Your cluster must be accessible from the internet on ports 80/443

## Step 1: Install cert-manager

cert-manager automates SSL certificate management with Let's Encrypt.

```bash
# Install cert-manager CRDs and controller
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml

# Wait for cert-manager to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=cert-manager -n cert-manager --timeout=300s

# Apply cluster issuers
kubectl apply -f cert-manager-setup.yaml
```

## Step 2: Configure Your Domain

### Option A: Using a Real Domain

1. **Purchase domain** from registrar (e.g., GoDaddy, Namecheap, Cloudflare)

2. **Configure DNS A records**:
   ```
   Type: A
   Name: @ (or shuma)
   Value: YOUR_PUBLIC_IP
   TTL: 3600

   Type: A
   Name: www
   Value: YOUR_PUBLIC_IP
   TTL: 3600
   ```

3. **Update ingress files**:
   ```bash
   # Replace shuma.example.com with your actual domain
   sed -i 's/shuma.example.com/shumaspa.cz/g' shuma-production-ingress.yaml
   sed -i 's/admin@shumaspa.cz/your-email@domain.com/g' cert-manager-setup.yaml
   ```

### Option B: Using Local/Test Domain

For testing without a real domain:

```bash
# Add to /etc/hosts on your local machine
echo "10.0.0.100 shuma.local" | sudo tee -a /etc/hosts

# Use shuma.local instead of real domain
sed -i 's/shuma.example.com/shuma.local/g' shuma-production-ingress.yaml
```

**Note**: Let's Encrypt won't work with local domains. Skip cert-manager for testing.

## Step 3: Port Forwarding (If Behind NAT)

If your cluster is behind a router/firewall:

1. **Configure router port forwarding**:
   - External Port 80 → Internal 10.0.0.100:80
   - External Port 443 → Internal 10.0.0.100:443

2. **Find your public IP**:
   ```bash
   curl ifconfig.me
   ```

## Step 4: Deploy Production Ingress

```bash
# First, test with staging certificates (to avoid rate limits)
kubectl apply -f shuma-production-ingress.yaml

# Check certificate status
kubectl get certificate -n shuma-website
kubectl describe certificate shuma-tls-cert -n shuma-website

# Check ingress
kubectl get ingress -n shuma-website

# View certificate issuer logs
kubectl logs -n cert-manager -l app=cert-manager --tail=50
```

## Step 5: Test SSL Certificate

```bash
# Test HTTPS (should get valid certificate)
curl -I https://your-domain.com

# Check certificate details
openssl s_client -connect your-domain.com:443 -servername your-domain.com < /dev/null

# Test security headers
curl -I https://your-domain.com | grep -E "(X-Frame|X-XSS|Strict-Transport)"
```

## Step 6: Switch to Production Certificates

Once staging works:

```bash
# Update ingress to use production issuer
kubectl edit ingress shuma-website-https -n shuma-website

# Change:
# cert-manager.io/cluster-issuer: letsencrypt-staging
# To:
# cert-manager.io/cluster-issuer: letsencrypt-prod

# Delete staging certificate to force renewal
kubectl delete certificate shuma-tls-cert -n shuma-website

# Wait for new production certificate
kubectl get certificate -n shuma-website -w
```

## Step 7: Apply Network Policies (Optional)

Network policies restrict pod-to-pod communication for defense in depth:

```bash
# Apply network policies
kubectl apply -f shuma-network-policy.yaml

# Verify policies are applied
kubectl get networkpolicy -n shuma-website
```

## Step 8: Configure Firewall on Nodes

Harden firewall rules on each Raspberry Pi:

```bash
# Run on each cluster node
ssh user@node-ip

# Install ufw (uncomplicated firewall)
sudo apt update && sudo apt install -y ufw

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (IMPORTANT: do this first!)
sudo ufw allow 22/tcp

# Allow k3s cluster communication
sudo ufw allow from 10.0.0.0/24 to any port 6443 proto tcp   # k3s API
sudo ufw allow from 10.0.0.0/24 to any port 10250 proto tcp  # kubelet
sudo ufw allow from 10.42.0.0/16 to any                      # Pod network
sudo ufw allow from 10.43.0.0/16 to any                      # Service network

# Allow HTTP/HTTPS (only on nodes running Traefik)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

## Step 9: Security Hardening Checklist

- [ ] SSL/TLS certificates installed and valid
- [ ] HTTP → HTTPS redirect working
- [ ] Security headers present (X-Frame-Options, CSP, etc.)
- [ ] Rate limiting enabled
- [ ] Network policies applied
- [ ] Firewall rules configured on all nodes
- [ ] Regular security updates scheduled
- [ ] Backup strategy in place
- [ ] Monitoring/alerting configured

## Monitoring & Maintenance

### Check Certificate Expiry

```bash
# Certificates auto-renew, but verify:
kubectl get certificate -n shuma-website -o wide

# Check cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager --tail=100 -f
```

### Update Website

```bash
# Build new image
docker buildx build --platform linux/arm64 -t shuma-website:v5 --load .

# Distribute to nodes
for node in c00@10.0.0.100 w01@10.0.0.101 w02@10.0.0.102 w03@10.0.0.103 w04@10.0.0.104; do
  docker save shuma-website:v5 | ssh $node 'sudo k3s ctr images import -'
  ssh $node 'sudo k3s ctr images tag docker.io/library/shuma-website:v5 docker.io/library/shuma-website:latest'
done

# Rolling update
kubectl set image deployment/shuma-website nginx=shuma-website:latest -n shuma-website
kubectl rollout status deployment/shuma-website -n shuma-website
```

### Backup Configuration

```bash
# Backup all Kubernetes manifests
kubectl get all,ingress,certificate,secret -n shuma-website -o yaml > shuma-backup-$(date +%Y%m%d).yaml

# Backup TLS certificates
kubectl get secret shuma-tls-cert -n shuma-website -o yaml > shuma-tls-backup.yaml
```

## Troubleshooting

### Certificate Not Issued

```bash
# Check certificate status
kubectl describe certificate shuma-tls-cert -n shuma-website

# Check certificate request
kubectl get certificaterequest -n shuma-website
kubectl describe certificaterequest -n shuma-website

# Check challenge status
kubectl get challenge -n shuma-website
kubectl describe challenge -n shuma-website

# Check cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager --tail=200
```

### Ingress Not Working

```bash
# Check ingress status
kubectl get ingress -n shuma-website
kubectl describe ingress shuma-website-https -n shuma-website

# Check Traefik logs
kubectl logs -n kube-system -l app.kubernetes.io/name=traefik --tail=100

# Check service endpoints
kubectl get endpoints -n shuma-website
```

### Rate Limiting Too Aggressive

```bash
# Adjust rate limit middleware
kubectl edit middleware rate-limit -n shuma-website

# Increase average/burst values
# average: 100 → 200
# burst: 50 → 100
```

## Production URLs

After deployment, your site will be available at:

- **HTTPS**: https://your-domain.com (primary)
- **HTTP**: http://your-domain.com (redirects to HTTPS)
- **NodePort** (backup): http://any-node-ip:30080

## Security Features Implemented

1. **SSL/TLS Encryption**: Let's Encrypt certificates with automatic renewal
2. **HTTP Strict Transport Security (HSTS)**: Forces HTTPS for 1 year
3. **Content Security Policy (CSP)**: Prevents XSS attacks
4. **X-Frame-Options**: Prevents clickjacking
5. **X-Content-Type-Options**: Prevents MIME sniffing
6. **Rate Limiting**: 100 req/min average, 50 burst
7. **Compression**: Gzip compression for faster loading
8. **Network Policies**: Restricts pod-to-pod communication
9. **Firewall Rules**: Host-level traffic filtering

## Performance Optimizations

- **Image Caching**: 1 year cache for static assets
- **Gzip Compression**: Reduces bandwidth by ~70%
- **CDN Ready**: Can add Cloudflare for DDoS protection
- **Pod Anti-affinity**: Distributes load across nodes
- **Health Checks**: Automatic pod restart on failure
