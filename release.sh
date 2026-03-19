#!/usr/bin/env bash
set -euo pipefail

start=$(date +%s)

repo_url="https://github.com/enzonic-llc/e-cloud.git"
tmp_dir="tmp"
repo_dir="$tmp_dir/e-cloud"
release_dir="release"

rsync_excludes=(
  "--exclude=.git"
  "--exclude=.github"
  "--exclude=$tmp_dir"
  "--exclude=$release_dir"
  "--exclude=node_modules"
  "--exclude=vendor"
  "--exclude=storage/logs"
  "--exclude=storage/framework/cache"
  "--exclude=storage/framework/sessions"
  "--exclude=storage/framework/testing"
)

if ! command -v rsync >/dev/null 2>&1; then
  echo "Error: rsync is required to run this script." >&2
  exit 1
fi

echo "Cleaning compiled frontend assets..."
if [ -d "public/assets" ]; then
  find public/assets \( -name "*.js" -o -name "*.map" -o -name "*.json" \) -type f -delete || true
fi

echo "Building the panel (production assets)..."
yarn run build:production

echo "Preparing temporary workspace..."
rm -rf "$tmp_dir"
mkdir -p "$tmp_dir"

echo "Cloning the base panel repository..."
git clone --depth=1 "$repo_url" "$repo_dir"

echo "Removing git metadata from cloned repository..."
rm -rf "$repo_dir/.git"

echo "Copying current workspace files into cloned repository..."
rsync -a "${rsync_excludes[@]}" ./ "$repo_dir/"

echo "Preparing release directory..."
rm -rf "$release_dir"
mkdir -p "$release_dir"

echo "Creating archives..."
tar -czf "$release_dir/panel.tar.gz" -C "$repo_dir" .
(cd "$repo_dir" && zip -rq "../../$release_dir/panel.zip" .)

echo "Cleaning up temporary workspace..."
rm -rf "$tmp_dir"

end=$(date +%s)

echo "Build in $((end - start)) seconds"
