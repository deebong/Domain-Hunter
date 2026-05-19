# Domain Hunter

A professional WHOIS status monitoring tool designed to track, manage, and hunt down expiring domains. This tool provides a clear, organized dashboard to keep an eye on your domain portfolio's health.

## 🚀 Features

- **Google Sheets Backend**: Leverage your own Google Spreadsheet as a database via a custom Google Apps Script. No complex database setup required.
- **CamelCase Preservation**: Displays domains exactly how you typed them (e.g., `MyCoolSite.com`) for better visual readability, while handling searches and lookups case-insensitively.
- **Advanced Sorting**: Instantly sort your domains by Name, Status, Age, or Expiry Date.
- **Individual Refresh**: Update WHOIS data for a specific domain with a single click, or perform a full refresh for the entire list.
- **Age & Expiry Tracking**: Calculates the domain age and shows a live countdown of "Days to Expiry".
- **Column Filtering**: Customize your dashboard view by toggling visibility for columns like Registrar, Last Checked, Age, and more.
- **Mobile Responsive**: A fully optimized interface that works seamlessly on desktops, tablets, and smartphones.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript.
- **Styling**: Tailwind CSS (with responsive design).
- **Icons**: Lucide React.
- **Animations**: Motion.
- **Backend / Storage**: Google Apps Script & Google Sheets.

## 📦 Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/domain-hunter.git
   cd domain-hunter
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Application**
   ```bash
   npm run build
   ```

4. **Deployment**
   - Upload the contents of the `dist` folder to your static hosting provider (GitHub Pages, Vercel, Netlify, or your shared hosting).

5. **Configure the Backend**
   - Open the application in your browser.
   - Navigate to the **Apps Script Setup** tab.
   - Follow the step-by-step instructions provided in the UI to create your Google Sheet and deploy the companion Apps Script.
   - Paste your **Apps Script Web App URL** into the **Settings** modal (gear icon) in the dashboard.

## ⚠️ Limitations

- **RDAP/WHOIS Rate Limits**: Data fetching is dependent on public RDAP servers. Some domain extensions may have stricter rate limits or may not support RDAP yet.
- **Apps Script Execution Time**: Google Apps Script has a 6-minute execution limit. For very large domain lists (hundreds of domains), it is recommended to refresh domains in smaller batches.

## 🛤️ Future Pipeline

- **Email Notifications**: Automated alerts when a domain is within 30 days of expiry.
- **Historical Tracking**: Record status changes over time.
- **Bulk Domain Importer**: Advanced parsing for bulk domain lists from text/CSV files.
- **Multi-Sheet Support**: Group domains into different sheets/categories.

## ⚖️ License

This project is licensed under the [MIT License](LICENSE).

---
*Note: This application is purely client-side and stores your Google Apps Script URL locally in your browser's `localStorage`. No sensitive spreadsheet data or API keys are stored on the server.*
