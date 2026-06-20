#!/bin/bash
set -e
cd /workspace/projects
pnpm install --frozen-lockfile
pnpm run build