// Repository name use, must end with / or be '' for none
repository= 'docker.area51.onl/area51/'

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
    sh "docker pull area51/babel:react-latest"
    sh "docker pull httpd:2.4.29-alpine"
  }

  buildStep( 'dependencies' )
  buildStep( 'sources' )
  stage( "build" ) {
    parallel(
      'eslint': {
        buildStep( 'eslint' )
      },
      'babel': {
        buildStep( 'babel' )
      }
    )
  }

  stage( "webpack") {
    sh 'docker build -t ' + dockerImage + ' --build-arg environment=production --target httpd .'
  }

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

