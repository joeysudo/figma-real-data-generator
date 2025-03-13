#!/bin/bash

# Replace these variables with your information
GITHUB_USERNAME="joeysudo"
REPO_NAME="figma-real-data-generator"

# Connect your local repository to GitHub
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

# Set the main branch
git branch -M main

# Push your code to GitHub
git push -u origin main

echo ""
echo "Your code has been pushed to GitHub!"
echo "Visit https://github.com/$GITHUB_USERNAME/$REPO_NAME to see your repository." 