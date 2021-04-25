#!groovy

/*
 * Copyright (C) 2020 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// https://www.jenkins.io/doc/tutorials/create-a-pipeline-in-blue-ocean/

pipeline {
    // agent any
    agent {
        docker {
            // https://www.debian.org/releases: Buster = Debian 10
            // IOException bei 'gcr.io/distroless/nodejs-debian10:14'
            // image 'node:15.11.0-buster'
            image 'node:14.16.0-buster'
            // https://stackoverflow.com/questions/62330354/jenkins-pipeline-alpine-agent-apk-update-error-unable-to-lock-database-permis
            // https://stackoverflow.com/questions/42630894/jenkins-docker-how-to-control-docker-user-when-using-image-inside-command/51986870#51986870
            // https://stackoverflow.com/questions/42743201/npm-install-fails-in-jenkins-pipeline-in-docker
            args '--publish 3000:3000 --publish 5000:5000'
            // fuer "apt-get install ..."
            args '--user root:root'
        }
    }

    // Umgebungsvariable:
    environment {
        // Atlas:
        DB_HOST = 'cluster0.0eq6f.mongodb.net'
        DB_USER = 'user_atlas'
        DB_PASS = 'password_atlas'
        DB_POPULATE = true
        DB_POPULATE_FILES = true

        LOG_DIR = './log'
        LOG_COLOR_CONSOLE = false
        MAIL_HOST = 'skip'
        USER_PASSWORD = 'p'
        USER_PASSWORD_FALSCH = 'FALSCH'
    }

    stages {
        // Stage = Logisch-zusammengehoerige Aufgaben der Pipeline:
        // zur spaeteren Visualisierung
        stage('Init') {
            // Step = einzelne Aufgabe
            steps {
                script {
                    if (!isUnix()) {
                        error 'Unix ist erforderlich'
                    }
                }

                echo "Jenkins-Job ${env.JOB_NAME} #${env.BUILD_ID} mit Workspace ${env.WORKSPACE}"

                // Unterverzeichnisse src und test im WORKSPACE loeschen: vom letzten Build
                // Kurzform fuer: sh([script: '...'])
                sh 'rm -rf src'
                sh 'rm -rf test'

                // https://www.jenkins.io/doc/pipeline/steps/git
                // "named arguments" statt Funktionsaufruf mit Klammern
                git url: 'file:///git-repository/beispiel', branch: 'main', poll: true
            }
        }

        stage('Install') {
            steps {
                // https://stackoverflow.com/questions/51416409/jenkins-env-node-no-such-file-or-directory
                // https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions
                // https://www.debian.org/distrib/packages
                // https://packages.debian.org/buster/nodejs
                // sh 'curl -sL https://deb.nodesource.com/setup_current.x | bash -; apt-get install --yes nodejs'
                sh 'curl --silent --location https://deb.nodesource.com/setup_14.x | bash -; apt-get install --yes nodejs'

                sh 'npm i -g npm'

                // https://packages.debian.org/search?keywords=search
                // https://packages.debian.org/buster/npm
                //sh 'apt-get install --yes npm=5.8.0+ds6-4+deb10u2'

                // https://packages.debian.org/stable/python
                // https://packages.debian.org/stable/python/python3
                // https://packages.debian.org/buster/python3
                sh 'apt-get install --yes python3=3.7.3-1'

                // https://docs.docker.com/engine/install/debian
                // https://packages.debian.org/buster/docker.io
                sh 'apt-get install --yes --no-install-recommends docker.io=18.09.1+dfsg1-7.1+deb10u2'

                // https://medium.com/@manav503/how-to-build-docker-images-inside-a-jenkins-container-d59944102f30

                sh 'node --version'
                sh 'npm --version'
                sh 'docker --version'
                sh 'id'

                script {
                    if (!fileExists("${env.WORKSPACE}/package.json")) {
                        echo "package.json ist *NICHT* in ${env.WORKSPACE} vorhanden"
                    }
                }

                // "clean install", ggf. --loglevel verbose
                sh 'npm ci'
            }
        }

        stage('Compile') {
            steps {
                sh 'npm run tsc'
            }
        }

        stage('Test, Codeanalyse, Security, Dok.') {
            steps {
                parallel(
                    'Test': {
                        echo 'TODO: DB-Verbindung fuer Tests konfigurieren'
                        //sh 'npm run test:coverage'
                    },
                    'ESLint': {
                        sh 'npm run eslint'
                    },
                    'EJS-Lint': {
                        echo 'TODO: EJS-Lint ist auskommentiert'
                        //sh 'npm run ejs-lint'
                    },
                    'Security': {
                        sh 'npm audit --production'
                    },
                    'AsciiDoctor': {
                        sh 'npm run asciidoc'
                    },
                    'TypeDoc': {
                        echo 'TODO: TypeDoc ist auskommentiert'
                        //sh 'npm run typedoc'
                    },
                    'reveal.js': {
                        echo 'TODO: reveal.js ist auskommentiert'
                        //sh 'npm run revealjs'
                    }
                )
            }

            post {
                always {
                  echo 'TODO: Links fuer Coverage, TypeDoc und reveal.js'

                  //publishHTML target : [
                  //  reportDir: 'coverage',
                  //  reportFiles: 'index.html',
                  //  reportName: 'Coverage (Istanbul)',
                  //  reportTitles: 'Coverage'
                  //]

                  //publishHTML target : [
                  //  reportDir: 'doc/api',
                  //  reportFiles: 'index.html',
                  //  reportName: 'TypeDoc',
                  //  reportTitles: 'TypeDoc'
                  //]

                  publishHTML target : [
                    reportDir: 'doc/entwicklerhandrezept/html',
                    reportFiles: 'entwicklerhandrezept.html',
                    reportName: 'Entwicklerhandrezept',
                    reportTitles: 'Entwicklerhandrezept'
                  ]

                  //publishHTML target : [
                  //  reportDir: 'doc/folien',
                  //  reportFiles: 'folien.html',
                  //  reportName: 'Folien (reveal.js)',
                  //  reportTitles: 'TypeDoc'
                  //]
                }

                success {
                    script {
                        if (fileExists("${env.WORKSPACE}/rezept.zip")) {
                            sh 'rm rezept.zip'
                        }
                    }
                    // https://www.jenkins.io/doc/pipeline/steps/pipeline-utility-steps/#zip-create-zip-file
                    zip zipFile: 'rezept.zip', archive: false, dir: 'dist'
                    // jobs/rezept/builds/.../archive/rezept.zip
                    archiveArtifacts 'rezept.zip'
                }
            }
        }

        stage('Docker Image bauen') {
            steps {
              echo 'TODO: Docker-Image bauen'
              // Docker-Installation und laufender Docker-Daemon erforderlich
              // sh 'docker build --tag juergenzimmermann/rezept:1.0.0 .'
            }
        }

        stage('Deployment fuer Kubernetes') {
            steps {
                echo 'TODO: Deployment fuer Kubernetes mit z.B. Ansible'
            }
        }
    }
}
