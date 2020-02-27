@Library('defra-library@fix/remove-global-variables')
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

node {
  checkout scm
  try {
    // stage('Database testing') {
    //   def credentialsId = 'test_db_pwd'
    //   def host = 'ffc-demo-rds.ffc.aws-int.defra.cloud'
    //   def username = 'test_db_user'
    //   def dbname = 'test_db_name'
    //   def sqlCmd = 'SELECT * FROM \\"schedule_scheduleId_seq\\"'
    //   defraUtils.runSqlCommandOnDatabaseHost(credentialsId, host, username, dbname, sqlCmd)
    //   defraUtils.createDatabase(credentialsId, host, username, dbname, username)
    //   defraUtils.dropDatabase(credentialsId, host, username, dbname)
    // }
    stage('Set branch, PR, and containerTag variables') {
      (pr, containerTag, mergedPrNo) = defraUtils.getVariables(repoName, defraUtils.getPackageJsonVersion())
      // defraUtils.setGithubStatusPending()
    }
    // stage('Provision resources') {
    //     // [['service': ['code', 'name', 'type']], 'pr_code', 'queue_purpose', 'repo_name']
    //     defraUtils.provisionInfrastructure('aws', 'sqs', [service: [code: "FFC", name: "Future Farming Services", type: "FFC"], pr_code: pr, queue_purpose: "test-queue1", repo_name: repoName])
    //     defraUtils.provisionInfrastructure('aws', 'sqs', [service: [code: "FFC", name: "Future Farming Services", type: "FFC"], pr_code: pr, queue_purpose: "test-queue3", repo_name: repoName])
    // }
    // stage('Delete resources') {
    //     defraUtils.destroyInfrastructure(repoName, pr)
    // }
    stage('Helm lint') {
      defraUtils.lintHelm(imageName)
    }
    stage('Build test image') {
      defraUtils.buildTestImage(imageName, BUILD_NUMBER)
    }
    // stage('Run tests') {
    //   defraUtils.runTests(imageName, BUILD_NUMBER)
    // }
    // stage('Fix absolute paths in lcov file') {
    //   defraUtils.replaceInFile(containerSrcFolder, localSrcFolder, lcovFile)
    // }
    // stage('SonarQube analysis') {
    //   defraUtils.analyseCode(sonarQubeEnv, sonarScanner, ['sonar.projectKey' : repoName, 'sonar.sources' : '.'])
    // }
    // stage("Code quality gate") {
    //   defraUtils.waitForQualityGateResult(timeoutInMinutes)
    // }
    // stage('Push container image') {
    //   defraUtils.buildAndPushContainerImage(regCredsId, registry, imageName, containerTag)
    // }
    // if (pr != '') {
    //   stage('Helm install') {
    //     def extraCommands = [
    //       "--values ./helm/ffc-ce-payment-orchestrator/jenkins-aws.yaml",
    //       "--set container.redeployOnChange=$pr-$BUILD_NUMBER"
    //     ].join(' ')
    //
    //     defraUtils.deployChart(kubeCredsId, registry, imageName, containerTag, extraCommands)
    //   }
    // }
    // if (pr == '') {
    //   stage('Publish chart') {
    //     defraUtils.publishChart(registry, imageName, containerTag)
    //   }
    //   stage('Trigger Deployment') {
    //     withCredentials([
    //       string(credentialsId: 'JenkinsDeployUrl', variable: 'jenkinsDeployUrl'),
    //       string(credentialsId: 'ffc-ce-payment-orchestrator-deploy-token', variable: 'jenkinsToken')
    //     ]) {
    //       defraUtils.triggerDeploy(jenkinsDeployUrl, 'FCEP/job/ffc-ce-payment-orchestrator-deploy', jenkinsToken, ['chartVersion':'1.0.0'])
    //     }
    //   }
    // }
    // if (mergedPrNo != '') {
    //   stage('Remove merged PR') {
    //     defraUtils.undeployChart(kubeCredsId, imageName, mergedPrNo)
    //   }
    // }
    // defraUtils.setGithubStatusSuccess()
  } catch(e) {
    defraUtils.setGithubStatusFailure(e.message)
    throw e
  // } finally {
  //   defraUtils.deleteTestOutput(imageName)
  }
}
