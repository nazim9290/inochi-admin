pipeline {
  agent any
  environment {
    APP_NAME = "inochi_admin"
    CONTAINER_NAME = "inochi_admin"
    PORT = "4000"
  }
  stages {
    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/nazim9290/inochi-admin.git'
      }
    }
    stage('Build Docker Image') {
      steps {
        sh 'docker build -t $APP_NAME .'
      }
    }
    stage('Deploy') {
      steps {
        sh '''
        docker stop $CONTAINER_NAME || true
        docker rm $CONTAINER_NAME || true
        docker run -d --name $CONTAINER_NAME -p 4000:4000 --restart=always $APP_NAME
        '''
      }
    }
  }
}
