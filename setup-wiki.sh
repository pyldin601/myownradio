#!/bin/bash

# Script to set up GitHub wiki with API documentation
# Run this script after the wiki has been initialized on GitHub

set -e

REPO="pyldin601/myownradio"
WIKI_DIR="wiki-repo"

echo "Setting up GitHub wiki for $REPO..."

# Clean up if directory exists
if [ -d "$WIKI_DIR" ]; then
    echo "Removing existing wiki directory..."
    rm -rf "$WIKI_DIR"
fi

# Clone the wiki repository
echo "Cloning wiki repository..."
git clone "https://github.com/$REPO.wiki.git" "$WIKI_DIR" || {
    echo "Error: Could not clone wiki repository."
    echo "Please ensure:"
    echo "1. The wiki is enabled in repository settings"
    echo "2. You have created at least one wiki page through the GitHub web interface"
    echo "3. You have proper access rights"
    exit 1
}

cd "$WIKI_DIR"

# Copy API documentation
echo "Adding API documentation..."
cp ../API-Documentation.md API-Documentation.md

# Create or update Home.md to link to API docs
if [ ! -f Home.md ]; then
    cat > Home.md << 'EOF'
# MyOwnRadio Wiki

Welcome to the MyOwnRadio wiki!

## Documentation

- [API Documentation](API-Documentation) - Complete API reference for the backend service

EOF
else
    # Check if link already exists
    if ! grep -q "API Documentation" Home.md; then
        echo "" >> Home.md
        echo "## Documentation" >> Home.md
        echo "" >> Home.md
        echo "- [API Documentation](API-Documentation) - Complete API reference for the backend service" >> Home.md
    fi
fi

# Commit and push
echo "Committing changes..."
git add API-Documentation.md Home.md
git commit -m "Add API Documentation" || echo "No changes to commit"
git push origin master || git push origin main

echo "Wiki updated successfully!"
echo "View your wiki at: https://github.com/$REPO/wiki"

cd ..

