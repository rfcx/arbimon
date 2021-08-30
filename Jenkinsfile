pipeline {
  agent {
    kubernetes {
      yaml """
        kind: Pod
        metadata:
          name: kaniko
        spec:
          containers:
          - name: kubectl
            image: 887044485231.dkr.ecr.eu-west-1.amazonaws.com/tools/kubectl:v1.20.1
            imagePullPolicy: Always
            command:
            - cat
            tty: true
          - name: kaniko
            image: gcr.io/kaniko-project/executor:debug
            imagePullPolicy: Always
            command:
            - cat
            tty: true
            volumeMounts:
              - name: docker-config
                mountPath: /kaniko/.docker
          volumes:
            - name: docker-config
              configMap:
                name: docker-config
      """
    }
  }
  environment {
    APP = "biodiversity-analytics"
    K8S_NAMESPACE = k8sNamespace(BRANCH_NAME)
    ECR_HOST = "887044485231.dkr.ecr.eu-west-1.amazonaws.com"
    ECR_REPO = ecrRepoName(BRANCH_NAME)
    SLACK_CHANNEL = slackChannel(BRANCH_NAME)
  }
  stages {
    stage("Build") {
      steps {
        slackSend (channel: "#${env.SLACK_CHANNEL}", color: '#FF9800', message: "*Biodiversity Analytics*: Build started <${env.BUILD_URL}|#${env.BUILD_NUMBER}> commit ${env.GIT_COMMIT[0..6]} branch ${env.BRANCH_NAME}")
        catchError {
          container(name: 'kaniko') {
            sh '''
            /kaniko/executor --snapshotMode=redo --use-new-run=true --cache=true --cache-repo=${ECR_HOST}/${ECR_REPO} --dockerfile `pwd`/Dockerfile --context `pwd` --destination=${ECR_HOST}/${ECR_REPO}:latest --destination=${ECR_HOST}/${ECR_REPO}:$BUILD_NUMBER
            '''
          }
        }
      }
      post {
        success {
          slackSend (channel: "#${env.SLACK_CHANNEL}", color: '#3380C7', message: "*Biodiversity Analytics*: Image built on <${env.BUILD_URL}|#${env.BUILD_NUMBER}> branch ${env.BRANCH_NAME}")
          echo 'Compile Stage Successful'
        }
        failure {
          slackSend (channel: "#${env.SLACK_CHANNEL}", color: '#F44336', message: "*Biodiversity Analytics*: Image build failed <${env.BUILD_URL}|#${env.BUILD_NUMBER}> branch ${env.BRANCH_NAME}")
          echo 'Compile Stage Failed'
        }
      }
    }
    stage('Deploy') {
      agent {
        label 'slave'
      }
      steps {
        sh "kubectl apply -f build/${K8S_NAMESPACE} --namespace ${K8S_NAMESPACE}"
        sh "kubectl set image deployment ${APP} ${APP}=${ECR_HOST}/${ECR_REPO}:$BUILD_NUMBER --namespace ${K8S_NAMESPACE}"
      }
    }
    stage('Verifying') {
      agent {
        label 'slave'
      }
      options {
        skipDefaultCheckout true
      }
      steps {
        catchError {
          sh "kubectl rollout status deployment ${APP} --namespace ${K8S_NAMESPACE}"
          slackSend (channel: "#${env.SLACK_CHANNEL}", color: '#4CAF50', message: "*Biodiversity Analytics*: Deployment completed <${env.BUILD_URL}|#${env.BUILD_NUMBER}> branch ${env.BRANCH_NAME}")
        }
      }
    }
  }
}

def ecrRepoName(branch) {
  script {
    repo = "biodiversity-analytics/testing"
    if (branch == "staging") {
      repo = "biodiversity-analytics/staging"
    }
    if (branch == "master") {
      repo = "biodiversity-analytics"
    }
  }
  return repo
}

def k8sNamespace(branch) {
  script {
    namespace = "testing"
    if (branch == "staging") {
      namespace = "staging"
    }
    if (branch == "master") {
      namespace = "production"
    }
  }
  return namespace
}

def slackChannel(branch) {
  script {
    channel = "alerts-deployment"
    if (branch == "master") {
      channel = "alerts-deployment-prod"
    }
  }
  return channel
}