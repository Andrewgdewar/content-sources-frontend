#!/bin/bash

# --------------------------------------------
# Export vars for helper scripts to use
# --------------------------------------------
# name of app-sre "application" folder this component lives in; needs to match for quay
export COMPONENT="content-sources"
# IMAGE should match the quay repo set by app.yaml in app-interface
export IMAGE="quay.io/cloudservices/content-sources-frontend"
export WORKSPACE=${WORKSPACE:-$APP_ROOT} # if running in jenkins, use the build's workspace
export APP_ROOT=$(pwd)

# set NODE_BUILD_VERSION based on nvmrc or default to 18
if [[ -n $(<.nvmrc) ]]; then
    export NODE_BUILD_VERSION=$(<.nvmrc)
else
    export NODE_BUILD_VERSION=18
fi

COMMON_BUILDER=https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/master

set -exv
# source is preferred to | bash -s in this case to avoid a subshell
source <(curl -sSL $COMMON_BUILDER/src/frontend-build.sh)
BUILD_RESULTS=$?

# cleanup docker builds as sonar user do not have perms to read them
rm -r $PWD/.docker || true

source $WORKSPACE/.rhcicd/sonarqube.sh || true

# Stubbed out for now
mkdir -p $WORKSPACE/artifacts
#cat << EOF > $WORKSPACE/artifacts/junit-dummy.xml
#<testsuite tests="1">
#    <testcase classname="dummy" name="dummytest"/>
#</testsuite>
#EOF

# teardown_docker
exit $BUILD_RESULTS
