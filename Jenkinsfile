pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = credentials('docker-registry-url')
        DOCKER_CREDENTIALS = credentials('docker-credentials')
        KUBECONFIG = credentials('kubeconfig')
        IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/smarttech-backend:${IMAGE_TAG}"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/smarttech-frontend:${IMAGE_TAG}"
        KUBERNETES_NAMESPACE = 'smarttech'
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "Checking out code from ${env.GIT_BRANCH}"
                    checkout scm
                }
            }
        }
        
        stage('Build & Test Backend') {
            steps {
                dir('backend') {
                    script {
                        echo "Installing backend dependencies..."
                        sh 'npm ci'
                        
                        echo "Running backend tests..."
                        // Uncomment when tests are available
                        // sh 'npm test'
                        
                        echo "Backend build completed"
                    }
                }
            }
        }
        
        stage('Build & Test Frontend') {
            steps {
                dir('frontend') {
                    script {
                        echo "Installing frontend dependencies..."
                        sh 'npm ci'
                        
                        echo "Building frontend..."
                        sh 'npm run build'
                        
                        echo "Frontend build completed"
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    echo "Building backend Docker image..."
                    sh """
                        docker build -t ${BACKEND_IMAGE} \
                            -t ${DOCKER_REGISTRY}/smarttech-backend:latest \
                            ./backend
                    """
                    
                    echo "Building frontend Docker image..."
                    sh """
                        docker build -t ${FRONTEND_IMAGE} \
                            -t ${DOCKER_REGISTRY}/smarttech-frontend:latest \
                            ./frontend
                    """
                }
            }
        }
        
        stage('Push Docker Images') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'docker-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh """
                            echo ${DOCKER_PASS} | docker login ${DOCKER_REGISTRY} -u ${DOCKER_USER} --password-stdin
                            docker push ${BACKEND_IMAGE}
                            docker push ${DOCKER_REGISTRY}/smarttech-backend:latest
                            docker push ${FRONTEND_IMAGE}
                            docker push ${DOCKER_REGISTRY}/smarttech-frontend:latest
                        """
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    echo "Scanning Docker images for vulnerabilities..."
                    // Uncomment when security scanning tool is configured
                    // sh "trivy image ${BACKEND_IMAGE}"
                    // sh "trivy image ${FRONTEND_IMAGE}"
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    echo "Deploying to Kubernetes namespace: ${KUBERNETES_NAMESPACE}"
                    
                    // Update image tags in deployment files
                    sh """
                        sed -i 's|subodh40/smarttech-backend:latest|${BACKEND_IMAGE}|g' kubernetes/backend/deployment.yaml
                        sed -i 's|subodh40/smarttech-frontend:latest|${FRONTEND_IMAGE}|g' kubernetes/frontend/deployment.yaml
                    """
                    
                    // Apply Kubernetes manifests
                    sh """
                        kubectl apply -f kubernetes/namespace.yaml
                        kubectl apply -f kubernetes/config/configmap.yaml
                        kubectl apply -f kubernetes/mongodb/
                        kubectl apply -f kubernetes/backend/
                        kubectl apply -f kubernetes/frontend/
                        kubectl apply -f kubernetes/ingress.yaml
                        kubectl apply -f kubernetes/hpa.yaml
                    """
                    
                    // Wait for rollout
                    sh """
                        kubectl rollout status deployment/smarttech-backend -n ${KUBERNETES_NAMESPACE} --timeout=5m
                        kubectl rollout status deployment/smarttech-frontend -n ${KUBERNETES_NAMESPACE} --timeout=5m
                    """
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo "Performing health checks..."
                    sh """
                        sleep 30
                        kubectl get pods -n ${KUBERNETES_NAMESPACE}
                        
                        # Check backend health
                        BACKEND_POD=\$(kubectl get pods -n ${KUBERNETES_NAMESPACE} -l app=smarttech-backend -o jsonpath='{.items[0].metadata.name}')
                        kubectl exec -n ${KUBERNETES_NAMESPACE} \$BACKEND_POD -- wget -q -O- http://localhost:5000/api/health || exit 1
                        
                        # Check frontend health
                        FRONTEND_POD=\$(kubectl get pods -n ${KUBERNETES_NAMESPACE} -l app=smarttech-frontend -o jsonpath='{.items[0].metadata.name}')
                        kubectl exec -n ${KUBERNETES_NAMESPACE} \$FRONTEND_POD -- wget -q -O- http://localhost/health || exit 1
                    """
                }
            }
        }
    }
    
    post {
        success {
            script {
                echo "Deployment successful! Image tag: ${IMAGE_TAG}"
                // Send notification (Slack, email, etc.)
                // slackSend(color: 'good', message: "Deployment successful: ${IMAGE_TAG}")
            }
        }
        failure {
            script {
                echo "Deployment failed! Rolling back..."
                sh """
                    kubectl rollout undo deployment/smarttech-backend -n ${KUBERNETES_NAMESPACE}
                    kubectl rollout undo deployment/smarttech-frontend -n ${KUBERNETES_NAMESPACE}
                """
                // Send notification
                // slackSend(color: 'danger', message: "Deployment failed: ${IMAGE_TAG}")
            }
        }
        always {
            cleanWs()
        }
    }
}

