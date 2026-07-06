#!/bin/bash
set -e
echo "=== 配方系统部署开始 ==="
cd /root/lifein-recipe-v2

BASE_URL="https://ghfast.top/https://raw.githubusercontent.com/lifein2606/Life-in-data/v2-task-system"

echo ">>> 下载更新后的源码..."
curl -L "$BASE_URL/src/app/products/page.tsx" -o src/app/products/page.tsx
curl -L "$BASE_URL/src/app/products/[id]/page.tsx" -o "src/app/products/[id]/page.tsx"
curl -L "$BASE_URL/src/app/products/[id]/edit/page.tsx" -o "src/app/products/[id]/edit/page.tsx"
curl -L "$BASE_URL/src/components/ui/collapsible.tsx" -o src/components/ui/collapsible.tsx

echo ">>> 构建中..."
pnpm run build

echo ">>> 重启服务..."
pm2 restart lifein-recipe-v2

echo "=== 部署完成 ==="
