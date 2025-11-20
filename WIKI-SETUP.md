# GitHub Wiki Setup Instructions

The API documentation has been prepared for the GitHub wiki. To add it to your wiki, follow these steps:

## Option 1: Using the Setup Script (Recommended)

1. **Initialize the wiki on GitHub** (if not already done):
   - Go to your repository: https://github.com/pyldin601/myownradio
   - Click on "Wiki" in the repository navigation
   - Create a simple "Home" page (just add some text and save)
   - This initializes the wiki repository

2. **Run the setup script**:
   ```bash
   ./setup-wiki.sh
   ```

The script will:
- Clone the wiki repository
- Add the API documentation
- Update the Home page with a link to the API docs
- Push everything to GitHub

## Option 2: Manual Setup

1. **Initialize the wiki** (if not already done):
   - Go to https://github.com/pyldin601/myownradio/wiki
   - Create a "Home" page

2. **Clone the wiki repository**:
   ```bash
   git clone https://github.com/pyldin601/myownradio.wiki.git wiki-repo
   cd wiki-repo
   ```

3. **Add the API documentation**:
   ```bash
   cp ../API-Documentation.md API-Documentation.md
   ```

4. **Update Home.md** (optional):
   Add a link to the API documentation in `Home.md`:
   ```markdown
   # MyOwnRadio Wiki
   
   - [API Documentation](API-Documentation)
   ```

5. **Commit and push**:
   ```bash
   git add API-Documentation.md Home.md
   git commit -m "Add API Documentation"
   git push origin master
   ```

## Option 3: Using GitHub Web Interface

1. Go to https://github.com/pyldin601/myownradio/wiki
2. Click "New Page"
3. Name it "API-Documentation"
4. Copy the contents from `API-Documentation.md` in this repository
5. Save the page

## Viewing the Wiki

Once set up, your wiki will be available at:
https://github.com/pyldin601/myownradio/wiki

The API documentation will be at:
https://github.com/pyldin601/myownradio/wiki/API-Documentation

