def repoName = 'ffc-ce-payment-orchestrator'
def namespace = 'paul-test2'
def dockerTag = 'test'

node {
  stage("Test") {
    withCredentials([string(credentialsId: 'test_acr_url', variable: 'acrUrl')]) {
      def q1 = "helm package helm/$repoName"
      def q2 = "kubectl create namespace $namespace"
      def q3 = "helm install --namespace=$namespace $repoName --set namespace=$namespace $repoName-1.0.0.tgz --set image=$acrUrl/$repoName:$dockerTag"
      echo "$q1"
      echo "$q2"
      echo "$q3"
    }
  }
}

// @Library('defra-library@0.0.8')
// import uk.gov.defra.ffc.DefraUtils
// def defraUtils = new DefraUtils()

// def registry = ''
// def regCredsId = 'ecr:eu-west-2:ecr-user'
// def kubeCredsId = 'FFCLDNEKSAWSS001_KUBECONFIG'
// def imageName = 'ffc-ce-payment-orchestrator'
// def repoName = 'ffc-ce-payment-orchestrator'
// def pr = ''
// def mergedPrNo = ''
// def containerTag = ''
// def sonarQubeEnv = 'SonarQube'
// def sonarScanner = 'SonarScanner'
// def containerSrcFolder = '\\/usr\\/src\\/app'
// def localSrcFolder = '.'
// def lcovFile = './test-output/lcov.info'
// def timeoutInMinutes = 5

// node {
//   checkout scm
//   try {
//     stage('Set branch, PR, and containerTag variables') {
//       (pr, containerTag, mergedPrNo) = defraUtils.getVariables(repoName)
//       defraUtils.setGithubStatusPending()
//     }
//     stage('Helm lint') {
//       defraUtils.lintHelm(imageName)
//     }
//     stage('Build test image') {
//       defraUtils.buildTestImage(imageName, BUILD_NUMBER)
//     }
//     stage('Run tests') {
//       defraUtils.runTests(imageName, BUILD_NUMBER)
//     }
//     stage('Fix absolute paths in lcov file') {
//       defraUtils.replaceInFile(containerSrcFolder, localSrcFolder, lcovFile)
//     }
//     stage('SonarQube analysis') {
//       defraUtils.analyseCode(sonarQubeEnv, sonarScanner, ['sonar.projectKey' : repoName, 'sonar.sources' : '.'])
//     }
//     stage("Code quality gate") {
//       defraUtils.waitForQualityGateResult(timeoutInMinutes)
//     }
//     stage('Push container image') {
//       defraUtils.buildAndPushContainerImage(regCredsId, registry, imageName, containerTag)
//     }
//     if (pr != '') {
//       stage('Helm install') {
//         def extraCommands = [
//           "--values ./helm/ffc-ce-payment-orchestrator/jenkins-aws.yaml",
//           "--set container.redeployOnChange=$pr-$BUILD_NUMBER"
//         ].join(' ')

//         defraUtils.deployChart(kubeCredsId, registry, imageName, containerTag, extraCommands)
//       }
//     }
//     if (pr == '') {
//       stage('Publish chart') {
//         defraUtils.publishChart(registry, imageName, containerTag)
//       }
//       stage('Trigger Deployment') {
//         withCredentials([
//           string(credentialsId: 'JenkinsDeployUrl', variable: 'jenkinsDeployUrl'),
//           string(credentialsId: 'ffc-ce-payment-orchestrator-deploy-token', variable: 'jenkinsToken')
//         ]) {
//           defraUtils.triggerDeploy(jenkinsDeployUrl, 'FCEP/job/ffc-ce-payment-orchestrator-deploy', jenkinsToken, ['chartVersion':'1.0.0'])
//         }
//       }
//     }
//     if (mergedPrNo != '') {
//       stage('Remove merged PR') {
//         defraUtils.undeployChart(kubeCredsId, imageName, mergedPrNo)
//       }
//     }
//     defraUtils.setGithubStatusSuccess()
//   } catch(e) {
//     defraUtils.setGithubStatusFailure(e.message)
//     throw e
//   } finally {
//     defraUtils.deleteTestOutput(imageName)
//   }
// }
