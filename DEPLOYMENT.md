# Health Tracker System - Deployment Guide

This guide provides various deployment options for the Health Tracker System.

## Quick Deployment Options

### 1. Local Development Server

#### Using Python (Recommended)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Access at: `http://localhost:8000`

#### Using Node.js
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Access at: `http://localhost:3000`

#### Using PHP
```bash
php -S localhost:8000
```
Access at: `http://localhost:8000`

### 2. Web Hosting Platforms

#### GitHub Pages
1. Create a new repository on GitHub
2. Upload all files to the repository
3. Go to Settings > Pages
4. Select source branch (usually `main`)
5. Access your site at: `https://yourusername.github.io/repository-name`

#### Netlify
1. Create account at [netlify.com](https://netlify.com)
2. Drag and drop your project folder to deploy
3. Or connect your GitHub repository for automatic deployments
4. Your site will be available at a custom Netlify URL

#### Vercel
1. Create account at [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel` in your project directory
4. Follow the prompts to deploy

#### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init hosting

# Deploy
firebase deploy
```

### 3. Traditional Web Hosting

#### cPanel/Shared Hosting
1. Upload all files to your `public_html` directory
2. Ensure your hosting supports PHP (for API features)
3. Access via your domain name

#### VPS/Dedicated Server
1. Install web server (Apache/Nginx)
2. Install PHP and MySQL (for database features)
3. Upload files to web root directory
4. Configure database connection in `api.php`

## Database Deployment

### MySQL/MariaDB Setup
1. Create database:
```sql
CREATE DATABASE health_tracker;
```

2. Import schema:
```bash
mysql -u username -p health_tracker < database.sql
```

3. Create user and grant permissions:
```sql
CREATE USER 'health_tracker_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON health_tracker.* TO 'health_tracker_user'@'localhost';
FLUSH PRIVILEGES;
```

### PostgreSQL Setup
1. Create database:
```sql
CREATE DATABASE health_tracker;
```

2. Convert MySQL schema to PostgreSQL format
3. Import schema:
```bash
psql -U username -d health_tracker -f database.sql
```

## Configuration

### Environment Variables
Create a `.env` file for sensitive configuration:
```env
DB_HOST=localhost
DB_NAME=health_tracker
DB_USER=health_tracker_user
DB_PASS=secure_password
API_BASE_URL=https://yourdomain.com/api
```

### Security Considerations
1. Change default database credentials
2. Use HTTPS in production
3. Implement proper CORS policies
4. Add rate limiting for API endpoints
5. Validate and sanitize all inputs
6. Use prepared statements for database queries

## Performance Optimization

### Frontend Optimization
1. Enable gzip compression on your server
2. Use a CDN for static assets
3. Implement browser caching headers
4. Minify CSS and JavaScript files
5. Optimize images and icons

### Database Optimization
1. Create appropriate indexes
2. Use database connection pooling
3. Implement query caching
4. Regular database maintenance

## Monitoring and Maintenance

### Health Checks
- Monitor database connectivity
- Check API endpoint availability
- Monitor storage usage
- Track user activity and errors

### Backup Strategy
1. Regular database backups
2. File system backups
3. Version control for code changes
4. Test restore procedures

## Troubleshooting

### Common Issues

#### CORS Errors
Add CORS headers to your server configuration:
```apache
# Apache .htaccess
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
```

#### Database Connection Issues
1. Verify database credentials
2. Check firewall settings
3. Ensure database server is running
4. Test connection from command line

#### File Permission Issues
```bash
# Set proper permissions
chmod 644 *.html *.css *.js
chmod 755 .
chmod 600 .env
```

## SSL/HTTPS Setup

### Let's Encrypt (Free SSL)
```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot --apache -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Cloudflare SSL
1. Add your domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption
4. Configure security settings

## Scaling Considerations

### Load Balancing
- Use multiple web servers
- Implement database replication
- Use CDN for static content
- Consider microservices architecture

### Caching
- Implement Redis for session storage
- Use database query caching
- Enable browser caching
- Consider full-page caching for static content

## Support and Maintenance

### Regular Tasks
1. Update dependencies and security patches
2. Monitor server resources
3. Backup data regularly
4. Review and optimize database queries
5. Monitor user feedback and analytics

### Version Control
- Use Git for code versioning
- Tag releases appropriately
- Maintain changelog
- Document configuration changes

## Contact and Support

For deployment issues or questions:
1. Check the troubleshooting section
2. Review server logs
3. Test in different environments
4. Consult hosting provider documentation

---

**Note**: This deployment guide covers the most common scenarios. Adjust configurations based on your specific hosting environment and requirements.
