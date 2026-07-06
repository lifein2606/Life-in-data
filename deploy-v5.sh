#!/bin/bash
set -e
cd /root/lifein-recipe-v2

echo "=== 配方系统部署开始 ==="

echo ">>> 下载更新后的源码..."
curl -L https://ghfast.top/https://raw.githubusercontent.com/lifein2606/Life-in-data/v2-task-system/src/app/products/%5Bid%5D/page.tsx -o src/app/products/\[id\]/page.tsx

echo ">>> 构建中..."
pnpm run build

echo ">>> 重启服务..."
pm2 restart lifein-recipe-v2

echo "=== 部署完成 ==="
pm2 list


