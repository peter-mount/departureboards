// Repository name use, must end with / or be '' for none
repository= 'docker.area51.dev/area51/'

// image prefix
imagePrefix = 'departureboards'

// The image version, master branch is latest in docker
version=BRANCH_NAME
if( version == 'master' ) {
  version = 'latest'
}

// Build properties
properties([
  buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '10')),
  disableConcurrentBuilds(),
  disableResume(),
  pipelineTriggers([
    cron('0 6 * * *'),
    upstream('/Public/Alpine/master'),
  ])
])

dockerImage = repository + imagePrefix + ":" + version

def buildStep = {
  target -> stage( target ) {
    sh 'docker build -t ' + dockerImage + ' --target ' + target + ' .'
  }
}

node( 'AMD64' ) {
  stage( "prepare" ) {
    checkout scm
    sh "docker pull area51/node:latest"
    sh "docker pull httpd:2.4.41-alpine"
  }

  buildStep( 'npm' )
  buildStep( 'build' )
  buildStep( 'httpd' )

  stage( 'docker' ) {
    sh "docker push " + dockerImage
  }

}

//if( BRANCH_NAME == 'master' ) {
//  node( "api-a" ) {
//    stage( 'deploy UAT' ) {
//      sh "/usr/local/bin/departureboards-uat.sh"
//    }
//  }
//}

