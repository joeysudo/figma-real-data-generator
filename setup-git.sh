#!/bin/bash

# Add all files to Git
git add .

# Commit the files
git commit -m "Initial commit of Real Data Generator Figma plugin"

# Instructions for the user
echo ""
echo "Your files have been committed to the local Git repository."
echo ""
echo "To push to GitHub, you need to:"
echo "1. Create a new repository on GitHub (https://github.com/new)"
echo "2. Run the following commands to push your code:"
echo ""
echo "   git remote add origin https://github.com/joeysudo/figma-real-data-generator.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "Replace YOUR_USERNAME with your GitHub username and YOUR_REPO_NAME with your repository name." 