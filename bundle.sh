#!/bin/bash

# Ensure we're in the project root
cd "$(dirname "$0")"

echo "Bundling project to dist/..."

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run the build script
npm run build

echo "Build complete! Output in dist/"
