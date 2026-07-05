#!/bin/bash
set -e
echo "=== 配方系统部署开始 ==="
cd /root/lifein-recipe-v2

BASE_URL="https://ghfast.top/https://raw.githubusercontent.com/lifein2606/Life-in-data/v2-task-system"

echo ">>> 下载更新后的源码..."
curl -L "$BASE_URL/src/types/index.ts" -o src/types/index.ts
curl -L "$BASE_URL/src/app/products/page.tsx" -o src/app/products/page.tsx
curl -L "$BASE_URL/src/app/products/[id]/edit/page.tsx" -o "src/app/products/[id]/edit/page.tsx"
curl -L "$BASE_URL/src/lib/storage.ts" -o src/lib/storage.ts
curl -L "$BASE_URL/src/hooks/use-app.tsx" -o src/hooks/use-app.tsx
curl -L "$BASE_URL/package.json" -o package.json
curl -L "$BASE_URL/pnpm-lock.yaml" -o pnpm-lock.yaml

echo ">>> 安装依赖..."
# 确保使用 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "安装 pnpm..."
    npm install -g pnpm --registry=https://registry.npmmirror.com
fi

pnpm install --registry=https://registry.npmmirror.com

echo ">>> 构建中..."
pnpm run build

echo ">>> 重启服务..."
pm2 restart lifein-recipe-v2

echo "=== 部署完成 ==="
