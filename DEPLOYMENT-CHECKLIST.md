# 🚀 DigitalOcean Deployment Checklist

## Before Deployment
- [ ] Push your code to GitHub repository
- [ ] Have your domain name ready
- [ ] DigitalOcean droplet created (Ubuntu 20.04+)
- [ ] Domain DNS A record pointing to droplet IP
- [ ] SSH access to your server

## Deployment Steps

### 1. 🖥️ Server Setup
```bash
# SSH into your DigitalOcean server
ssh root@YOUR_SERVER_IP

# Run the deployment script
bash <(curl -s https://raw.githubusercontent.com/NarottamSharma/Echo-Editor/main/deploy.sh)
```

### 2. 📁 Clone and Setup Project
```bash
cd /var/www
git clone https://github.com/NarottamSharma/Echo-Editor.git echo-editor
cd echo-editor

# Make scripts executable
chmod +x deploy.sh production-deploy.sh

# Run production deployment
./production-deploy.sh YOUR_DOMAIN.com
```

### 3. 🔧 Manual Configuration (if needed)
```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# View logs
pm2 logs
sudo tail -f /var/log/nginx/error.log
```

### 4. 🔒 SSL Certificate
The script automatically sets up Let's Encrypt SSL. If manual setup needed:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 5. 🎯 Testing
- Visit `https://yourdomain.com`
- Test user registration and room creation
- Test real-time collaboration
- Check mobile responsiveness

## 🛠️ Troubleshooting

### Backend Issues
```bash
pm2 logs echo-editor-backend
pm2 restart echo-editor-backend
```

### Frontend Issues
```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx config
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Issues
```bash
sudo certbot renew --dry-run
```

## 📱 Post-Deployment

### Performance Optimization
- [ ] Enable gzip compression (included in nginx.conf)
- [ ] Set up CDN (optional)
- [ ] Monitor server resources
- [ ] Set up backup for MongoDB

### Security
- [ ] Configure firewall
- [ ] Set up fail2ban
- [ ] Regular security updates
- [ ] Monitor logs

### Monitoring
```bash
# Set up PM2 monitoring
pm2 install pm2-server-monit

# Check server resources
htop
df -h
```

## 🔄 Updates and Maintenance

### Deploy Updates
```bash
cd /var/www/echo-editor
git pull origin main
cd code-editor-frontend && npm run build
pm2 restart echo-editor-backend
```

### SSL Renewal (automatic with certbot)
```bash
sudo certbot renew
```

## 📞 Support
If you encounter issues:
1. Check the logs: `pm2 logs`
2. Verify Nginx config: `sudo nginx -t`  
3. Check SSL: `sudo certbot certificates`
4. Monitor resources: `htop`

Your Echo Editor should be live at: `https://yourdomain.com` 🎉