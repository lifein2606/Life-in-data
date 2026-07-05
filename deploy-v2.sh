#!/bin/bash
set -e
echo "=== 配方系统部署开始 ==="
cd /root/lifein-recipe-v2

BASE_URL="https://ghfast.top/https://raw.githubusercontent.com/lifein2606/Life-in-data/v2-task-system"

# 下载所有源码文件
echo ">>> 下载源码..."
curl -L "$BASE_URL/src/types/index.ts" -o src/types/index.ts
curl -L "$BASE_URL/src/app/products/page.tsx" -o src/app/products/page.tsx
curl -L "$BASE_URL/src/app/products/[id]/edit/page.tsx" -o "src/app/products/[id]/edit/page.tsx"
curl -L "$BASE_URL/src/lib/storage.ts" -o src/lib/storage.ts
curl -L "$BASE_URL/src/hooks/use-app.tsx" -o src/hooks/use-app.tsx

# 构建
echo ">>> 构建中..."
npm run build

# 重启
echo ">>> 重启服务..."
pm2 restart lifein-recipe-v2

echo "=== 部署完成 ==="
