#!/bin/sh
set -e
export PORT=${DEPLOY_RUN_PORT:-5000}
pnpm run start
