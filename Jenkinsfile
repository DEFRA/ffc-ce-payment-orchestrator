@Library('defra-library@psd-483-setup-rbac-for-namespace')
import uk.gov.defra.ffc.DefraUtils
def defraUtils = new DefraUtils()

def registry = '562955126301.dkr.ecr.eu-west-2.amazonaws.com'
def regCredsId = 'ecr:eu-west-2:ecr-user'
def kubeCredsId = 'FFCLDNEKSAWSS002_KUBECONFIG'
def imageName = 'ffc-ce-payment-orchestrator'
def repoName = 'ffc-ce-payment-orchestrator'
def pr = ''
def mergedPrNo = ''
def containerTag = ''
def sonarQubeEnv = 'SonarQube'
def sonarScanner = 'SonarScanner'
def containerSrcFolder = '\\/usr\\/src\\/app'
def localSrcFolder = '.'
def lcovFile = './test-output/lcov.info'
def timeoutInMinutes = 5
def serviceName = 'ffc-ce'
def environment = 'dev'

node {
  checkout scm
  try {
    stage('Set branch, PR, and containerTag variables') {
      (pr, containerTag, mergedPrNo) = defraUtils.getVariables(repoName, defraUtils.getPackageJsonVersion())
      defraUtils.setGithubStatusPending()
    }
    stage('Test deploy/undeploy') {
        int fakePrNumber = 999
        String fakeContainerTag = "pr$fakePrNumber"
        int fakeBuildNumber = 1
        def extraCommands = [
          "--values ./helm/ffc-ce-payment-orchestrator/jenkins-aws.yaml",
          "--set container.redeployOnChange=$fakePrNumber-$fakeBuildNumber"
        ].join(' ')

        defraUtils.deployChart(kubeCredsId, registry, imageName, fakeContainerTag, extraCommands)
        /* defraUtils.setupRbac(environment, serviceName, imageName, fakeContainerTag) */
        /* defraUtils.teardownRbac(environment, serviceName, imageName, fakeContainerTag) */
        defraUtils.undeployChart(kubeCredsId, imageName, fakeContainerTag)
    }
    if (pr != '') {
      stage('Helm install') {
        def extraCommands = [
          "--values ./helm/ffc-ce-payment-orchestrator/jenkins-aws.yaml",
          "--set container.redeployOnChange=$pr-$BUILD_NUMBER"
        ].join(' ')

        defraUtils.deployChart(kubeCredsId, registry, imageName, containerTag, extraCommands)
      }
    }
    if (pr == '') {
      stage('Publish chart') {
        defraUtils.publishChart(registry, imageName, containerTag)
      }
      stage('Trigger Deployment') {
        withCredentials([
          string(credentialsId: 'JenkinsDeployUrl', variable: 'jenkinsDeployUrl'),
          string(credentialsId: 'ffc-ce-payment-orchestrator-deploy-token', variable: 'jenkinsToken')
        ]) {
          defraUtils.triggerDeploy(jenkinsDeployUrl, 'FCEP/job/ffc-ce-payment-orchestrator-deploy', jenkinsToken, ['chartVersion':'1.0.0'])
        }
      }
    }
    if (mergedPrNo != '') {
      stage('Remove merged PR') {
        defraUtils.undeployChart(kubeCredsId, imageName, mergedPrNo)
      }
    }
    defraUtils.setGithubStatusSuccess()
  } catch(e) {
    defraUtils.setGithubStatusFailure(e.message)
    throw e
  } finally {
    /* defraUtils.deleteTestOutput(imageName) */
  }
}
