#!/bin/bash

# Build the project
echo "Building the project..."
npm run build

# Deploy to GitHub Pages (if using gh-pages package)
# npm run deploy

# Or manually copy build folder to your web server
echo "Build completed! The build folder is ready for deployment."
echo "You can serve it with: npx serve -s build"
echo "Or copy the build folder to your web server."
