#!/bin/bash
set -e
cd /workspace/projects
export PORT=${DEPLOY_RUN_PORT:-5000}
pnpm run start