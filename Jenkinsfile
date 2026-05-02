// EN: Production deploy for the Inochi admin panel.
//     Jenkins runs on the same VPS that hosts the app, so a webhook on
//     `main` push triggers this pipeline which delegates to the on-server
//     `inochi-deploy` script. The script pulls origin/main into
//     `/home/inochi/admin`, installs deps, runs `vite build`, and restarts
//     PM2 process `inochi-admin` (which serves `dist/` on port 4000).
// BN: Inochi admin panel-এর production deploy। Jenkins এই VPS-এই চলে যেখানে
//     app চলে, তাই `main`-এ push হলে webhook এই pipeline trigger করে।
//     Pipeline server-এর `inochi-deploy` script-কে delegate করে — script
//     `/home/inochi/admin`-এ origin/main pull, deps install, `vite build`,
//     তারপর PM2 process `inochi-admin` (port 4000-এ `dist/` serve) restart।
pipeline {
  agent any
  options {
    timestamps()
    timeout(time: 15, unit: 'MINUTES')
    disableConcurrentBuilds()
  }
  stages {
    // EN: Checkout is for build-history visibility only — Jenkins records the
    //     commit hash so we can correlate a deploy with a code change. The
    //     actual files used at runtime live under /home/inochi/admin.
    // BN: Checkout শুধু build-history visibility-এর জন্য — Jenkins commit hash
    //     রেকর্ড করে যাতে deploy আর code change correlate করা যায়। Runtime
    //     file-গুলো /home/inochi/admin-এ থাকে।
    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/nazim9290/inochi-admin.git'
      }
    }
    stage('Deploy') {
      steps {
        sh 'sudo /usr/local/bin/inochi-deploy admin'
      }
    }
  }
  post {
    success {
      echo '✓ Admin deployed — https://admin.inochieducation.com'
    }
    failure {
      echo '✗ Admin deploy failed — check the Deploy stage log above for the failing step.'
    }
  }
}
