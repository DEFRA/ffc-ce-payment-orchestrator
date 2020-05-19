@Library('defra-library@v-6')

def repoName = 'ffc-ce-payment-orchestrator'
def namespace = 'paul-test-ci'
def tag = '-test-ci'

node {
  checkout scm

  // stage('Set PR, and containerTag variables') {
  //   build.BRANCH_NAME = 'azure-ci'
  //   (repoName, pr, containerTag, mergedPrNo) = build.getVariables(version.getPackageJsonVersion())
  // }

  // echo "repoName = $repoName"
  // echo "pr = $pr"
  // echo "containerTag = $containerTag"
  // echo "mergedPrNo = $mergedPrNo"

  withEnv(['HELM_EXPERIMENTAL_OCI=1']) {
    stage("Test") {
      withKubeConfig([credentialsId: "test_kube_config"]) {
        withCredentials([
          string(credentialsId: 'test_acr_url', variable: 'acrUrl'),
          usernamePassword(credentialsId: 'test_acr_creds', usernameVariable: 'acrUser', passwordVariable: 'acrPwd'),
        ]) {
          def dockerTag = "docker$tag"
          def helmTag = "helm$tag"

          sh "az acr login --name $acrUrl --username $acrUser --password $acrPwd"

          // Build and push docker container
          // sh "docker-compose -f docker-compose.yaml build --no-cache"
          // sh "docker tag $repoName $acrUrl/$repoName:$dockerTag"
          // sh "docker push $acrUrl/$repoName:$dockerTag"

          // Build and push Helm chart
          sh "helm chart save helm/$repoName $acrUrl/$repoName:$helmTag"
          sh "helm chart push $acrUrl/$repoName:$helmTag"

          // sh "kubectl get namespaces $namespace || kubectl create namespace $namespace"
          // sh "helm upgrade --install --atomic --namespace=$namespace $repoName --set namespace=$namespace $repoName-1.0.0.tgz --set image=$acrUrl/$repoName:$dockerTag"
        }
      }
    }
  }
}

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
