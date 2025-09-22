# Echo Editor Deployment Guide

## Server Requirements
- Ubuntu 20.04 or later
- Node.js 18+ 
- MongoDB (or use MongoDB Atlas)
- Nginx (for reverse proxy)
- PM2 (for process management)
- SSL certificate (Let's Encrypt)

## Deployment Steps

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y
```

### 2. Clone and Setup Project
```bash
# Clone your repository
git clone https://github.com/NarottamSharma/Echo-Editor.git
cd Echo-Editor

# Backend setup
cd code-editor-backend
npm install
cd ..

# Frontend setup  
cd code-editor-frontend
npm install
npm run build
cd ..
```

### 3. Environment Configuration
Create production .env file with your MongoDB Atlas URI and domain.

### 4. Nginx Configuration
Set up reverse proxy for your domain.

### 5. SSL Certificate
Configure Let's Encrypt for HTTPS.

### 6. Process Management
Use PM2 to run your backend in production.

## Domain Configuration
Point your domain A record to your DigitalOcean droplet IP.