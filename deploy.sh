#!/bin/bash
set -e

ALIAS="mam-dca-huynhhuuhien2022-3059s-projects.vercel.app"

echo "▲ Pulling project settings..."
vercel pull --yes --environment preview

echo "▲ Building..."
vercel build --yes

echo "▲ Deploying..."
DEPLOY_OUTPUT=$(vercel --prebuilt 2>&1)
echo "$DEPLOY_OUTPUT"

# Extract deployment URL from JSON output
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | python3 -c "
import sys, json, re
out = sys.stdin.read()
# Try JSON block at end
match = re.search(r'\{[\s\S]*\"deployment\"[\s\S]*\}', out)
if match:
    try:
        data = json.loads(match.group())
        url = data['deployment']['url'].replace('https://', '')
        print(url)
        exit()
    except:
        pass
# Fallback: grep Preview line
for line in out.splitlines():
    if 'Preview' in line and 'vercel.app' in line:
        parts = line.split()
        for p in parts:
            if 'vercel.app' in p:
                print(p.replace('https://', ''))
                exit()
")

if [ -z "$DEPLOY_URL" ]; then
  echo "✗ Could not parse deploy URL"
  exit 1
fi

echo ""
echo "▲ Promoting to production..."
vercel promote "$DEPLOY_URL" --yes 2>/dev/null || true

echo "▲ Aliasing $DEPLOY_URL → $ALIAS..."
vercel alias set "$DEPLOY_URL" "$ALIAS"

echo ""
echo "✓ Live: https://$ALIAS"
