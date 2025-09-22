#!/bin/bash

# Complete deployment script for Echo Editor on DigitalOcean
# Usage: ./production-deploy.sh YOUR_DOMAIN.com

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "❌ Please provide your domain name"
    echo "Usage: ./production-deploy.sh yourdomain.com"
    exit 1
fi

echo "🚀 Deploying Echo Editor to $DOMAIN"

# Update frontend environment for production
echo "📝 Updating frontend configuration..."
cd code-editor-frontend
cat > .env.production << EOF
VITE_API_URL=https://$DOMAIN
VITE_SOCKET_URL=https://$DOMAIN
EOF

# Rebuild frontend with production settings
echo "🏗️ Building frontend for production..."
npm run build

# Update backend environment
echo "📝 Updating backend configuration..."
cd ../code-editor-backend
cat > .env << EOF
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://narottamphodegaa:4NigS6bFkV27pHTX@cluster0.myoyepz.mongodb.net/echo-editor?retryWrites=true&w=majority&appName=Cluster0
CLIENT_URL=https://$DOMAIN
EOF

# Update Nginx config with domain
echo "🌐 Configuring Nginx..."
cd ..
sed "s/YOUR_DOMAIN.com/$DOMAIN/g" nginx.conf > /tmp/echo-editor-nginx.conf
sudo cp /tmp/echo-editor-nginx.conf /etc/nginx/sites-available/echo-editor
sudo ln -sf /etc/nginx/sites-available/echo-editor /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration error"
    exit 1
fi

# Install Certbot for SSL
echo "🔒 Setting up SSL certificate..."
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Start backend with PM2
echo "🚀 Starting backend service..."
cd code-editor-backend
pm2 start ecosystem.config.json
pm2 startup
pm2 save

# Restart Nginx
sudo systemctl restart nginx

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📋 Summary:"
echo "   🌐 Domain: https://$DOMAIN"
echo "   🔒 SSL: Enabled via Let's Encrypt"
echo "   ⚡ Backend: Running with PM2"
echo "   🌊 Nginx: Configured and running"
echo ""
echo "🔧 Useful commands:"
echo "   View backend logs: pm2 logs"
echo "   Restart backend: pm2 restart echo-editor-backend"
echo "   Check nginx status: sudo systemctl status nginx"
echo "   Renew SSL: sudo certbot renew"
echo ""
echo "🌟 Your Echo Editor is now live at https://$DOMAIN"