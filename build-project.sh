#!/bin/bash

# Build script for Phase 3.2
echo "🔨 Building project..."
echo "Current directory: $(pwd)"

# Ensure we're in the right directory
cd /Users/supercarlito/Desktop/dogtrainersdirectoryproject

echo "📁 Project directory: $(pwd)"
echo "📦 Package.json exists: $(test -f package.json && echo "✅ Yes" || echo "❌ No")"

# Run the build
echo "🏗️ Starting Astro build..."
npm run build

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Dist directory contents:"
    ls -la dist/ 2>/dev/null || echo "No dist directory found"
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎯 Ready for Phase 3.2 testing!"
