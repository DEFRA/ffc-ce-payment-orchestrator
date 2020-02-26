@Library('defra-library@psd-483-setup-rbac-for-namespace')
import uk.gov.defra.ffc.DefraUtils
def defraUtils = new DefraUtils()

def registry = '562955126301.dkr.ecr.eu-west-2.amazonaws.com'
def regCredsId = 'ecr:eu-west-2:ecr-user'
def kubeCredsId = 'FFCLDNEKSAWSS001_KUBECONFIG'
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

// Note 1: need to set region as the aws credentials do not
// Note 2: the AWS credentials are of type iam-role
def namespace = 'ffc-ce'
def group = 'developer'

node {
  checkout scm
  try {
    stage('Set branch, PR, and containerTag variables') {
      (pr, containerTag, mergedPrNo) = defraUtils.getVariables(repoName, defraUtils.getPackageJsonVersion())
      defraUtils.setGithubStatusPending()
    }
    if (pr != '') {
      stage('Helm install') {
        def extraCommands = [
          "--values ./helm/ffc-ce-payment-orchestrator/jenkins-aws.yaml",
          "--set container.redeployOnChange=$pr-$BUILD_NUMBER"
        ].join(' ')

        defraUtils.deployChart(kubeCredsId, registry, imageName, containerTag, extraCommands)
        def prNamespace = "${imageName}-${containerTag}" 
        echo "setup rbac for ${prNamespace}"
        defraUtils.setupRbacForNamespace(prNamespace, group)
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
        def prNamespace = "${imageName}-${containerTag}" 
        echo "setup rbac for ${prNamespace}"
        defraUtils.teardownRbacForNamespace(prNamespace, group)
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
