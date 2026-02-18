#!/bin/sh
set -e
echo "Waiting for database..."
for i in 1 2 3 4 5 6 7 8 9 10; do
  if npx prisma db push --accept-data-loss 2>/dev/null; then
    echo "Database schema synced."
    break
  fi
  if [ "$i" = 10 ]; then
    echo "Warning: Could not sync database schema, starting anyway."
    break
  fi
  sleep 2
done
exec "$@"
