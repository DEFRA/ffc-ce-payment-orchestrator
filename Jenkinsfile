@Library('defra-library@psd-770-azure-ci') _

def config = [environment: "dev"]
def containerSrcFolder = '\\/home\\/node'
def localSrcFolder = '.'
def lcovFile = './test-output/lcov.info'

node {
  checkout scm

  try {
    stage('Set GitHub status as pending') {
      build.setGithubStatusPending()
    }

    stage('Set PR, and containerTag variables') {
      (repoName, pr, containerTag, mergedPrNo) = build.getVariables(version.getPackageJsonVersion())
    }

    if (pr != '') {
      stage('Verify version incremented') {
        version.verifyPackageJsonIncremented()
      }
    }

    stage('Helm lint') {
      test.lintHelm(repoName)
    }

    stage('Build test image') {
      build.buildTestImage(DOCKER_REGISTRY_CREDENTIALS_ID, DOCKER_REGISTRY, repoName, BUILD_NUMBER, containerTag)
    }

    stage('Run tests') {
      build.runTests(repoName, repoName, BUILD_NUMBER, containerTag)
    }

    stage('Create JUnit report') {
      test.createJUnitReport()
    }

    stage('Fix lcov report') {
      utils.replaceInFile(containerSrcFolder, localSrcFolder, lcovFile)
    }

    // Test master branch branch
    pr = ''
    containerTag = '0.1.0'

    stage('Push container image') {
      build.buildAndPushContainerImage(DOCKER_REGISTRY_CREDENTIALS_ID, DOCKER_REGISTRY, repoName, containerTag)
    }

    if (pr != '') {
      stage('Helm install') {
        helm.deployChart(config.environment, DOCKER_REGISTRY, repoName, containerTag)
      }
    }
    else {
      stage('Publish chart') {
        helm.publishChartToACR(DOCKER_REGISTRY, repoName, containerTag)
      }

      stage('Trigger GitHub release') {
        withCredentials([
          string(credentialsId: 'github-auth-token', variable: 'gitToken')
        ]) {
          release.trigger(containerTag, repoName, containerTag, gitToken)
        }
      }

      stage('Trigger Deployment') {
        withCredentials([
          string(credentialsId: 'remote_build_token', variable: 'jenkinsToken')
        ]) {
          deploy.trigger(JENKINS_DEPLOY_SITE_ROOT, repoName, jenkinsToken, ['chartVersion': containerTag, 'environment': config.environment])
        }
      }
    }

    stage('Set GitHub status as success'){
      build.setGithubStatusSuccess()
    }
  } catch(e) {
    stage('Set GitHub status as fail') {
      build.setGithubStatusFailure(e.message)
    }

    // stage('Send build failure slack notification') {
    //   notifySlack.buildFailure(e.message, "#generalbuildfailures")
    // }

    throw e
  } finally {
    stage('Clean up test output') {
      test.deleteOutput('defradigital/node-development', containerSrcFolder)
    }
  }
}
