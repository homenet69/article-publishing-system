# Article Publishing System

A comprehensive system for publishing articles to your website with automated admin panel integration.

## Overview

This system provides two ways to publish articles:
1. **Local Publishing**: Articles are logged and stored locally
2. **Admin Panel Integration**: Articles are automatically published to your website's admin panel at http://100.74.157.99:3000/admin

## Features

- ✅ Modern, clean web interface for article submission
- ✅ Form validation (title and content required)
- ✅ Local article logging and storage
- ✅ Automated browser automation for admin panel publishing
- ✅ Error handling and user feedback
- ✅ Responsive design
- ✅ Norwegian language support

## Files Structure

```
├── package.json              # Dependencies and scripts
├── server.js                 # Express server with publishing endpoints
├── publish.html              # Article submission form
├── publish.js                # Client-side form handling
├── styles.css                # Styling for all pages
├── admin-publisher.js        # Browser automation for admin panel
├── index.html                # Original fact-checking page
├── script.js                 # Fact-checking functionality
└── README.md                 # This documentation
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Access the publishing interface:
- Article Publishing: http://localhost:8000/publish.html
- Fact Checking: http://localhost:8000/

## Usage

### Publishing Articles

1. Navigate to http://localhost:8000/publish.html
2. Fill in the article title and content
3. Choose publishing option:
   - **Unchecked**: Publish locally only (logged to console)
   - **Checked**: Publish to both local system and admin panel
4. Click "Publiser Artikkel" to submit

### Admin Panel Integration

When the "Publiser også til admin-panelet" checkbox is selected, the system will:

1. Launch a browser instance
2. Navigate to your admin panel at http://100.74.157.99:3000/admin
3. Locate and click the red "Skriv Ny Artikkel" button
4. Fill in the article form automatically
5. Submit the article
6. Provide feedback on success/failure

## API Endpoints

### POST /publishArticle

Publishes an article with optional admin panel integration.

**Request Body:**
```json
{
  "title": "Article Title",
  "content": "Article content...",
  "useAdminPanel": false
}
```

**Response:**
```json
{
  "message": "Artikkelen har blitt publisert med suksess!",
  "title": "Article Title",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "adminPublished": true
}
```

### POST /faktasjekk

Original fact-checking endpoint (unchanged).

## Configuration

### Admin Panel Settings

The admin panel integration can be configured in `admin-publisher.js`:

- **Admin URL**: Currently set to `http://100.74.157.99:3000/admin`
- **Button Detection**: Multiple selectors for finding the "Skriv Ny Artikkel" button
- **Form Field Detection**: Automatic detection of title and content fields
- **Browser Settings**: Headless mode, viewport size, timeouts

### Server Settings

Server configuration in `server.js`:
- **Port**: 8000 (configurable via PORT constant)
- **CORS**: Enabled for cross-origin requests
- **JSON Parsing**: Enabled for request body parsing

## Browser Automation Details

The system uses Puppeteer to automate interactions with your admin panel:

1. **Button Detection**: Tries multiple strategies to find the red "Skriv Ny Artikkel" button
2. **Form Filling**: Automatically detects and fills title and content fields
3. **Submission**: Finds and clicks the submit button
4. **Error Handling**: Comprehensive error handling with fallback strategies

## Troubleshooting

### Common Issues

1. **Admin Panel Not Accessible**
   - Ensure http://100.74.157.99:3000/admin is accessible
   - Check network connectivity
   - Verify admin panel is running

2. **Button Not Found**
   - The system tries multiple selectors to find the "Skriv Ny Artikkel" button
   - If it fails, check the admin panel's HTML structure
   - Update selectors in `admin-publisher.js` if needed

3. **Form Fields Not Detected**
   - The system tries multiple selectors for title and content fields
   - Update field selectors in `admin-publisher.js` if needed

4. **Puppeteer Issues**
   - Ensure Puppeteer is properly installed
   - Check browser dependencies on your system
   - Try running with `headless: false` for debugging

### Debugging

1. **Enable Verbose Logging**
   - Check server console for detailed logs
   - Browser automation logs all steps

2. **Test Admin Panel Manually**
   - Visit http://100.74.157.99:3000/admin manually
   - Verify the "Skriv Ny Artikkel" button exists and works

3. **Test Local Publishing**
   - Try publishing without admin panel integration first
   - Check server logs for article details

## Security Considerations

- The system runs browser automation with appropriate security settings
- No sensitive data is logged or stored
- Admin panel credentials (if required) should be handled separately

## Future Enhancements

- Authentication system for article publishing
- Article management (edit, delete, list)
- Rich text editor for content formatting
- Image upload support
- Article scheduling
- Multiple admin panel support
- Database storage for articles

## Support

For issues or questions:
1. Check the server console logs
2. Verify admin panel accessibility
3. Test with local publishing first
4. Review browser automation logs
