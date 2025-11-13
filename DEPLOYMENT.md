# SmartTech Connect - Deployment Guide

This guide covers deploying SmartTech Connect using Docker, Kubernetes, and Jenkins.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development with Docker](#local-development-with-docker)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [Jenkins CI/CD Setup](#jenkins-cicd-setup)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- Docker 20.10+
- Docker Compose 2.0+
- kubectl (Kubernetes CLI)
- Kubernetes cluster (minikube, kind, or cloud provider)
- Jenkins 2.400+ (for CI/CD)

### Required Knowledge
- Basic Docker commands
- Kubernetes basics (pods, services, deployments)
- Git and version control

## Local Development with Docker

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smarttech_connect-main
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Kubernetes Deployment

### 1. Setup Kubernetes Cluster

#### Option A: Minikube (Local)
```bash
minikube start
kubectl config use-context minikube
```

#### Option B: Cloud Provider
- AWS EKS
- Google GKE
- Azure AKS

### 2. Create Namespace
```bash
kubectl apply -f kubernetes/namespace.yaml
```

### 3. Create Secrets
```bash
# Create secrets from template
kubectl create secret generic smarttech-secrets \
  --from-literal=mongodb-uri='mongodb://admin:password@mongodb:27017/smarttech_connect?authSource=admin' \
  --from-literal=mongodb-username='admin' \
  --from-literal=mongodb-password='password' \
  --from-literal=jwt-secret='your-secret-key-here' \
  --from-literal=email-user='your-email@gmail.com' \
  --from-literal=email-pass='your-app-password' \
  -n smarttech
```

### 4. Apply Configurations
```bash
# Apply ConfigMap
kubectl apply -f kubernetes/config/configmap.yaml

# Deploy MongoDB
kubectl apply -f kubernetes/mongodb/

# Deploy Backend
kubectl apply -f kubernetes/backend/

# Deploy Frontend
kubectl apply -f kubernetes/frontend/

# Apply Ingress
kubectl apply -f kubernetes/ingress.yaml

# Apply HPA (Auto-scaling)
kubectl apply -f kubernetes/hpa.yaml
```

### 5. Verify Deployment
```bash
# Check pods
kubectl get pods -n smarttech

# Check services
kubectl get svc -n smarttech

# Check ingress
kubectl get ingress -n smarttech

# View logs
kubectl logs -f deployment/smarttech-backend -n smarttech
```

### 6. Update Deployment
```bash
# Update image
kubectl set image deployment/smarttech-backend backend=smarttech-backend:new-tag -n smarttech

# Rollout status
kubectl rollout status deployment/smarttech-backend -n smarttech

# Rollback if needed
kubectl rollout undo deployment/smarttech-backend -n smarttech
```

## Jenkins CI/CD Setup

### 1. Install Jenkins Plugins
- Docker Pipeline
- Kubernetes CLI
- Git
- Pipeline

### 2. Configure Jenkins Credentials

Add the following credentials in Jenkins:

1. **Docker Registry** (`docker-credentials`)
   - Username: Your Docker registry username
   - Password: Your Docker registry password

2. **Docker Registry URL** (`docker-registry-url`)
   - Value: Your Docker registry URL (e.g., `docker.io/yourusername` or `your-registry.com`)

3. **Kubernetes Config** (`kubeconfig`)
   - File: Your kubeconfig file content

### 3. Create Jenkins Pipeline

1. Go to Jenkins → New Item
2. Select "Pipeline"
3. Configure:
   - **Pipeline Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: Your Git repository
   - **Script Path**: Jenkinsfile

### 4. Pipeline Stages

The Jenkinsfile includes:
- Code checkout
- Build & test
- Docker image build
- Push to registry
- Security scan
- Kubernetes deployment
- Health checks
- Automatic rollback on failure

### 5. Trigger Pipeline

- **Manual**: Click "Build Now"
- **Automatic**: Configure webhook in Git repository
- **Scheduled**: Use cron in pipeline

## Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:password@mongodb:27017/smarttech_connect?authSource=admin
JWT_SECRET=your-secret-key
FRONTEND_URL=https://app.smarttechconnect.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend
Set via ConfigMap in Kubernetes or build-time environment variables.

## Monitoring

### Health Checks
- Backend: `http://localhost:5000/api/health`
- Frontend: `http://localhost/health`

### Kubernetes Monitoring
```bash
# Pod status
kubectl get pods -n smarttech

# Resource usage
kubectl top pods -n smarttech

# Events
kubectl get events -n smarttech --sort-by='.lastTimestamp'
```

## Scaling

### Manual Scaling
```bash
kubectl scale deployment smarttech-backend --replicas=5 -n smarttech
```

### Auto-scaling (HPA)
Already configured in `kubernetes/hpa.yaml`:
- Backend: 3-10 replicas
- Frontend: 2-5 replicas

## Troubleshooting

### Docker Issues

**Problem**: Container won't start
```bash
docker-compose logs backend
docker-compose logs frontend
```

**Problem**: Port already in use
```bash
# Change ports in docker-compose.yml
```

### Kubernetes Issues

**Problem**: Pods not starting
```bash
kubectl describe pod <pod-name> -n smarttech
kubectl logs <pod-name> -n smarttech
```

**Problem**: Image pull errors
```bash
# Check image exists in registry
# Verify credentials
```

**Problem**: Services not accessible
```bash
# Check service endpoints
kubectl get endpoints -n smarttech
# Check ingress
kubectl describe ingress smarttech-ingress -n smarttech
```

### Jenkins Issues

**Problem**: Pipeline fails at Docker build
- Check Docker daemon is running
- Verify Docker credentials

**Problem**: Kubernetes deployment fails
- Verify kubeconfig is correct
- Check namespace exists
- Verify secrets are created

## Security Best Practices

1. **Never commit secrets**
   - Use Kubernetes Secrets
   - Use Jenkins credentials
   - Use .env files (gitignored)

2. **Use image scanning**
   - Enable Trivy or similar in pipeline
   - Scan for vulnerabilities

3. **Network policies**
   - Restrict pod-to-pod communication
   - Use service mesh if needed

4. **RBAC**
   - Limit Kubernetes permissions
   - Use service accounts

## Backup & Recovery

### MongoDB Backup
```bash
kubectl exec -it mongodb-0 -n smarttech -- mongodump --out=/backup
```

### Restore
```bash
kubectl exec -it mongodb-0 -n smarttech -- mongorestore /backup
```

## Support

For issues or questions:
1. Check logs: `kubectl logs -f <pod-name> -n smarttech`
2. Check events: `kubectl get events -n smarttech`
3. Review this documentation
4. Contact DevOps team

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0

