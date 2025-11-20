#!/bin/bash
set -e
echo "Installing root dependencies..."
npm install
echo "Installing backend dependencies..."
cd backend
npm install
echo "Building backend..."
npm run build
echo "Build complete!"
ls -la dist/
