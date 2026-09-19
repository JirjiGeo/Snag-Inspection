# Qbel - Employee Evaluations

A modern, real-time employee evaluation system built with vanilla JavaScript and Supabase.

## Features

- ✅ **Employee Management** - Add and manage employee profiles
- ✅ **Comprehensive Evaluations** - Role-specific evaluation criteria
- ✅ **Real-Time Scoring** - Live score calculations with weighted criteria
- ✅ **Department Health Dashboard** - Track evaluation progress across departments
- ✅ **Secure Authentication** - Built-in login with Supabase Auth
- ✅ **PDF Export** - Generate professional evaluation reports
- ✅ **Evaluation History** - Track previous evaluations and scores
- ✅ **Cloud Sync** - All data automatically synced with Supabase

## Quick Start

### Local Development

1. **Clone the repository** (or download the files)
   ```bash
   git clone https://github.com/USERNAME/employees-evaluation.git
   cd employees-evaluation
   ```

2. **Set up Supabase** (see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md))
   - Create a Supabase project
   - Run the database schema
   - Get your API keys

3. **Configure the app**
   - Create `supabase-config.js` with your Supabase credentials
   - See `supabase-config.example.js` for the template

4. **Open in browser**
   - Open `index.html` in your browser
   - Or run a local server: `python -m http.server 8000`

### Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions on:
- Setting up Supabase Auth
- Deploying to Vercel or GitHub Pages
- Configuring environment variables

## Project Structure

```
├── index.html              # Main application UI
├── app.js                  # Core application logic
├── auth.js                 # Authentication module
├── styles.css              # Styling (minified)
├── supabase-config.js      # Supabase client configuration
├── supabase-schema.sql     # Database schema
├── DEPLOYMENT_GUIDE.md     # Detailed deployment instructions
└── README.md               # This file
```

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Hosting**: Vercel or GitHub Pages (recommended)
- **Database**: Supabase PostgreSQL

## Authentication

The app uses Supabase Auth for secure user authentication:
- Email/password authentication
- Session management
- Row-level security on database

## Database Schema

### Employees Table
- `id` - UUID primary key
- `full_name` - Employee name
- `department` - Department name
- `designation` - Job title
- `joining_date` - Date of joining
- `reporting_to` - Manager name
- `created_at` - Timestamp

### Evaluations Table
- `id` - UUID primary key
- `employee_id` - Reference to employee
- `evaluation_date` - Date of evaluation
- `score` - Overall score (0-100)
- `ratings` - JSON array of criteria scores
- `comments` - Various comment fields
- `signatures` - Employee, manager, evaluator signatures

## Evaluation Criteria

The app supports role-specific evaluation criteria including:
- Common Core Competencies
- Department-Specific Performance
- Leadership & Management
- Communication Skills
- System Knowledge & Digital Competency

## Configuration

### Environment Variables

Create `supabase-config.js`:

```javascript
window.SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT_REF.supabase.co',
  anonKey: 'YOUR_PUBLIC_ANON_KEY'
};
```

Get these from Supabase **Settings > API > Project Settings**.

## User Roles

The system supports different evaluation forms for:
- Facility Engineers
- Facility Technicians
- Facility Supervisors/Team Leaders
- HR Managers
- Procurement Managers
- IT Managers
- Operations Managers
- Customer Support Representatives

## Data Security

- ✅ Password-protected authentication
- ✅ Row-level security on database
- ✅ HTTPS encryption in transit
- ✅ Sensitive config not committed to git

## Features Guide

### Creating Evaluations
1. Click "New evaluation" button
2. Select an employee
3. Rate each criterion from 0-5
4. Scores calculate automatically
5. Add comments and signatures
6. Save when complete

### Viewing Department Progress
- Dashboard shows real-time evaluation completion rates
- Color-coded progress bars for each department
- Completion percentages updated automatically

### Exporting Evaluations
- Click "Export as PDF" from evaluation actions
- Print-friendly format with all criteria and signatures
- Professional header with company branding

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers supported

## Troubleshooting

### Supabase Configuration Issues
- Check that `supabase-config.js` exists with correct keys
- Verify your Supabase project URL and anon key
- Check browser console for error messages

### Authentication Issues
- Ensure your app URL is in Supabase allowed redirect URLs
- Clear browser cookies and try again
- Check email confirmation status

### Data Not Syncing
- Verify internet connection
- Check Supabase project status
- Clear browser localStorage and refresh

## Development

### Local Testing
```bash
# Start a local web server
python -m http.server 8000

# Visit http://localhost:8000
```

### Database Queries
Use Supabase Dashboard SQL Editor to test queries:
```sql
SELECT * FROM employees;
SELECT * FROM evaluations WHERE employee_id = 'XXX';
```

## License

MIT License - feel free to use for your organization

## Support

- 📧 Email: Contact your Qbel system administrator
- 📖 Docs: See DEPLOYMENT_GUIDE.md
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Made with ❤️ for better employee evaluations
