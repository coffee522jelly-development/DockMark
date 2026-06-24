#!/bin/bash
# Script to examine headers of widgets

for file in src/components/widgets/*Widget.tsx; do
    echo "--- $file ---"
    grep -E "h2|h3|card-title|header|title" "$file" | head -n 3
done
