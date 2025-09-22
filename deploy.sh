#!/bin/bash

# Echo Editor Deployment Script
# Run this script on your DigitalOcean server

echo "🚀 Starting Echo Editor deployment..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install global packages
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y

# Create app directory
sudo mkdir -p /var/www/echo-editor
sudo chown $USER:$USER /var/www/echo-editor

# Clone repository (replace with your repo URL)
cd /var/www
git clone https://github.com/NarottamSharma/Echo-Editor.git echo-editor
cd echo-editor

# Backend setup
echo "📦 Setting up backend..."
cd code-editor-backend
npm install --production

# Create logs directory
mkdir -p logs

# Frontend build
echo "🏗️ Building frontend..."
cd ../code-editor-frontend
npm install
npm run build

# Create production environment file
echo "⚙️ Creating production environment..."
cd ../code-editor-backend
cat > .env.production << EOF
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://narottamphodegaa:4NigS6bFkV27pHTX@cluster0.myoyepz.mongodb.net/echo-editor?retryWrites=true&w=majority&appName=Cluster0
CLIENT_URL=https://YOUR_DOMAIN.com
EOF

echo "✅ Deployment preparation complete!"
echo "Next steps:"
echo "1. Configure Nginx"
echo "2. Set up SSL certificate"
echo "3. Start PM2 process"