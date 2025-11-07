# Health Tracker System

A comprehensive web-based health tracking application that helps users monitor their daily health activities and achieve wellness goals.

## Features

### Core Functionality
- **User Authentication**: Secure registration and login system
- **Health Data Tracking**: Record daily steps, water intake, sleep duration, and calorie consumption
- **Data Management**: Edit, update, or delete health records
- **Progress Visualization**: Interactive charts showing trends over customizable timeframes
- **Goal Setting**: Set and track daily, weekly, and monthly health goals
- **History Tracking**: View and analyze past health data
- **Profile Management**: User statistics and account information

### Advanced Features
- **Multiple Timeframes**: View trends for 7, 14, 30, or 90 days
- **Interactive Charts**: Switch between different health metrics with VIBGYOR color scheme
- **Goal Comparison**: Visual comparison of actual performance vs. goals
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Data Persistence**: All data saved locally using browser storage
- **Real-time Updates**: Instant dashboard updates when data is added

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for data visualization
- **Icons**: Font Awesome for UI icons
- **Database**: SQL (MySQL/PostgreSQL) with comprehensive schema
- **Storage**: LocalStorage for client-side data persistence
- **Architecture**: Model-View-Controller (MVC) pattern

## File Structure

```
health_tracker/
├── index.html          # Main HTML file with complete UI
├── styles.css          # Responsive CSS with modern design
├── script.js           # JavaScript functionality and logic
├── database.sql        # Complete SQL database schema
└── README.md          # Project documentation
```

## Installation & Setup

### Option 1: Direct Browser Usage
1. Download all files to a local directory
2. Open `index.html` in a web browser
3. Start using the application immediately

### Option 2: Web Server Setup
1. Place files in your web server directory
2. Ensure the server supports static files
3. Access via browser at your server URL

### Option 3: Database Integration
1. Set up MySQL or PostgreSQL database
2. Run the SQL commands from `database.sql`
3. Modify `script.js` to connect to your database
4. Replace localStorage functions with database API calls

## Usage Guide

### Getting Started
1. **Register**: Create a new account with your email and password
2. **Login**: Sign in with your credentials
3. **Dashboard**: View your daily health metrics and progress

### Adding Health Data
1. Click "Add Today's Data" on the dashboard
2. Fill in your daily metrics:
   - Steps walked
   - Water intake (in milliliters)
   - Sleep duration (in hours)
   - Calories consumed
3. Click "Save Data" to store your information

### Viewing Trends
1. Navigate to the "Trends" section
2. Select your preferred timeframe (7, 14, 30, or 90 days)
3. Switch between different metrics using the buttons:
   - Steps (Red)
   - Water (Orange)
   - Sleep (Yellow)
   - Calories (Green)
4. Compare your actual performance with your goals

### Setting Goals
1. Go to the "Goals" section
2. Set your targets for:
   - Daily goals
   - Weekly goals
   - Monthly goals
3. Goals are automatically used for progress tracking

### Viewing History
1. Access the "History" section
2. Select a date range to filter records
3. Edit or delete individual records as needed
4. Export data for external analysis

## Database Schema

The application includes a comprehensive SQL schema with:

- **Users Table**: User account information
- **Health Data Table**: Daily health metrics
- **Goals Table**: User-defined health goals
- **Sessions Table**: User session management
- **Insights Table**: Health recommendations and achievements
- **Views**: Pre-calculated summaries for performance
- **Stored Procedures**: Common database operations
- **Triggers**: Automatic goal setting for new users

## Customization

### Colors and Themes
The application uses a VIBGYOR color scheme for different metrics:
- Steps: Red (#ff0000)
- Water: Orange (#ff7f00)
- Sleep: Yellow (#ffff00)
- Calories: Green (#00ff00)

### Default Goals
- Daily: 10,000 steps, 2,000ml water, 8 hours sleep, 2,000 calories
- Weekly: 70,000 steps, 14,000ml water, 56 hours sleep, 14,000 calories
- Monthly: 300,000 steps, 60,000ml water, 240 hours sleep, 60,000 calories

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Features

- Password encoding (basic)
- User session management
- Data validation and sanitization
- Secure data storage

## Performance Optimizations

- Responsive design for all devices
- Efficient chart rendering
- Optimized database queries
- Lazy loading of data
- Caching mechanisms

## Future Enhancements

- Real-time notifications
- Social features and challenges
- Integration with fitness devices
- Advanced analytics and insights
- Mobile app development
- Cloud synchronization
- Multi-language support

## Troubleshooting

### Common Issues

1. **Charts not displaying**: Ensure Chart.js is loaded properly
2. **Data not saving**: Check browser localStorage permissions
3. **Mobile responsiveness**: Clear browser cache and reload
4. **Login issues**: Verify email format and password requirements

### Browser Requirements
- JavaScript enabled
- LocalStorage support
- Modern CSS support
- Canvas support for charts

## Contributing

This is a complete, standalone health tracking application. Feel free to:
- Customize the design and colors
- Add new features and metrics
- Integrate with external APIs
- Deploy to your preferred hosting platform

## License

This project is open source and available under the MIT License.

## Support

For technical support or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Test in different browsers
4. Verify all files are present

---

**Health Tracker System** - Transform your health journey with comprehensive tracking and beautiful visualizations.
