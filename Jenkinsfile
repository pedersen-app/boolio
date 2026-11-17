pipeline {
    agent {
        label 'build-jenkins-node'
    }

    environment {
        BUILD_MAX_OLD_SPACE_SIZE = '1024'
        TEST_MAX_OLD_SPACE_SIZE = '768'
        NPM_CONFIG_MAXSOCKETS = '1'
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1'
        CYPRESS_INSTALL_BINARY = '0'
    }

    options {
        skipDefaultCheckout true
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                dir("${env.WORKSPACE}") {
                    checkout scm
                }
            }
        }

        stage('Install dependencies') {
            steps {
                dir("${env.WORKSPACE}") {
                    sh '''
                        set -e
                        if command -v nvm >/dev/null 2>&1; then
                            . "$HOME/.nvm/nvm.sh"
                            nvm use || nvm install
                        fi
                        npm ci --no-audit --no-fund
                    '''
                }
            }
        }

        stage('CI tests') {
            steps {
                dir("${env.WORKSPACE}") {
                    sh '''
                        set -e
                        if command -v nvm >/dev/null 2>&1; then
                            . "$HOME/.nvm/nvm.sh"
                            nvm use || nvm install
                        fi
                        npm test -- --run
                    '''
                }
            }
        }

        stage('Build') {
            steps {
                dir("${env.WORKSPACE}") {
                    sh '''
                        set -e
                        if command -v nvm >/dev/null 2>&1; then
                            . "$HOME/.nvm/nvm.sh"
                            nvm use || nvm install
                        fi
                        npm run build
                    '''
                }
            }
        }
    }
}
