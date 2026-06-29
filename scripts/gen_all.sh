#!/bin/bash
cd /home/z/my-project
# Loop: run generation script repeatedly until all 135 images exist
for round in $(seq 1 30); do
  COUNT=$(ls public/recipes/r*.png 2>/dev/null | wc -l)
  echo "[$(date)] Round $round: $COUNT/135 images"
  if [ "$COUNT" -ge 135 ]; then
    echo "All images generated!"
    break
  fi
  bun scripts/generate_images.ts >> /tmp/img-gen.log 2>&1
  echo "[$(date)] Round $round done, sleeping 60s before retry..."
  sleep 60
done
echo "[$(date] Generation loop finished. Final count: $(ls public/recipes/r*.png 2>/dev/null | wc -l)/135"
