import { useState } from 'react';
import { Copy, CheckCircle2, ExternalLink, Code2, Server } from 'lucide-react';
import { motion } from 'motion/react';

export default function SetupGuide() {
  const [copied, setCopied] = useState(false);

  const appsScriptCode = `const SHEET_NAME = "Domains";

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Domain", "Status", "Registration Date", "Expiry Date", "Registrar", "Last Checked"]);
    sheet.getRange("A1:F1").setFontWeight("bold");
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === "add_domains") {
      const domains = data.domains;
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = ss.getSheetByName(SHEET_NAME);
      if (!sheet) {
        setup();
        sheet = ss.getSheetByName(SHEET_NAME);
      }

      const results = [];
      const existingDomains = sheet.getRange("A:A").getValues().flat();
      const existingDomainsLower = existingDomains.map(d => String(d).toLowerCase());

      for (const domain of domains) {
        const whoisData = fetchWhoisData(domain);
        const rowIndex = existingDomainsLower.indexOf(domain.toLowerCase());
        
        const rowData = [
          domain,
          whoisData.status,
          whoisData.registrationDate,
          whoisData.expiryDate,
          whoisData.registrar,
          new Date().toISOString()
        ];

        if (rowIndex > -1) {
          // Update existing row - keep original domain name if it was already there? 
          // Actually, let's update it to the new casing provided by user.
          sheet.getRange(rowIndex + 1, 1, 1, 6).setValues([rowData]);
        } else {
          // Append new row
          sheet.appendRow(rowData);
        }
        results.push({ domain, ...whoisData });
      }

      return ContentService.createTextOutput(JSON.stringify({ success: true, data: results }))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (action === "delete_domain") {
      const domainToDelete = String(data.domain).toLowerCase();
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(SHEET_NAME);
      if (sheet) {
        const data = sheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
          if (String(data[i][0]).toLowerCase() === domainToDelete) {
            sheet.deleteRow(i + 1);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ success: true, data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);

    const result = rows.map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        // Convert camelCase headers to match frontend expectations
        let key = header.toString().toLowerCase().replace(/\\s+(.)/g, (match, group1) => group1.toUpperCase());
        if (key === 'lastChecked') key = 'lastChecked'; // Ensure exact match
        obj[key] = row[index];
      });
      return obj;
    });

    return ContentService.createTextOutput(JSON.stringify({ success: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function fetchWhoisData(domain) {
  try {
    const servers = [
      \`https://rdap.org/domain/\${domain}\`,
      \`https://rdap-bootstrap.arin.net/bootstrap/domain/\${domain}\`,
      \`https://rdap.markmonitor.com/rdap/domain/\${domain}\`
    ];
    
    let response;
    let lastError = "";
    
    for (const url of servers) {
      try {
        response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
        if (response.getResponseCode() === 200) break;
        if (response.getResponseCode() === 404) return { status: "Available/Not Found", registrationDate: "N/A", expiryDate: "N/A", registrar: "N/A" };
        lastError = "HTTP " + response.getResponseCode();
      } catch (e) {
        lastError = e.toString();
      }
    }

    if (response && response.getResponseCode() === 200) {
      const json = JSON.parse(response.getContentText());
      
      let expiryDate = "Unknown";
      let registrationDate = "Unknown";
      let registrar = "Unknown";
      
      if (json.events) {
        const expEvent = json.events.find(e => e.eventAction === "expiration");
        if (expEvent) expiryDate = expEvent.eventDate;
        
        const regEvent = json.events.find(e => e.eventAction === "registration");
        if (regEvent) registrationDate = regEvent.eventDate;
      }
      
      if (json.entities) {
        const regEntity = json.entities.find(e => e.roles && e.roles.includes("registrar"));
        if (regEntity && regEntity.vcardArray) {
          const fn = regEntity.vcardArray[1].find(v => v[0] === "fn");
          if (fn) registrar = fn[3];
        }
      }
      
      let status = "Active";
      if (json.status && json.status.length > 0) {
        status = json.status.join(", ");
      } else if (expiryDate !== "Unknown") {
        const exp = new Date(expiryDate);
        const now = new Date();
        const diffDays = (exp - now) / (1000 * 60 * 60 * 24);
        
        if (diffDays < 0) {
          status = "Expired";
        } else if (diffDays <= 30) {
          status = "Nearing Expiry";
        }
      }
      
      return { status, registrationDate, expiryDate, registrar };
    } else {
      return { status: "Error: " + lastError, registrationDate: "Error", expiryDate: "Error", registrar: "Error" };
    }
  } catch (e) {
    return { status: "Error: " + e.toString(), registrationDate: "Error", expiryDate: "Error", registrar: "Error" };
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 sm:px-0">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Google Apps Script Integration</h2>
            <p className="text-slate-500 mt-1">Connect this tool to your own Google Sheet for persistent storage.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-1">1</div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Create a Google Sheet</h3>
              <p className="text-slate-600 mt-1">Go to <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">sheets.new <ExternalLink className="w-3 h-3 ml-1" /></a> and create a new spreadsheet. Name it "Domain Hunter".</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-1">2</div>
            <div className="w-full">
              <h3 className="text-lg font-semibold text-slate-900">Open Apps Script Editor</h3>
              <p className="text-slate-600 mt-1 mb-4">In your Google Sheet, go to <strong>Extensions &gt; Apps Script</strong>. Delete any existing code and paste the following:</p>
              
              <div className="relative group w-full">
                <div className="absolute right-4 top-4 z-20">
                  <button 
                    onClick={handleCopy}
                    className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-lg border border-slate-700"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-slate-900 shadow-xl">
                  <pre 
                    className="text-slate-300 p-6 text-sm font-mono leading-relaxed"
                    style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}
                  >
                    <code>{appsScriptCode}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-1">3</div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Deploy as Web App</h3>
              <p className="text-slate-600 mt-1">
                Click <strong>Deploy &gt; New deployment</strong>.<br />
                Select type: <strong>Web app</strong>.<br />
                Execute as: <strong>Me</strong>.<br />
                Who has access: <strong>Anyone</strong>.<br />
                Click <strong>Deploy</strong> and authorize the permissions.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-1">4</div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Configure Settings</h3>
              <p className="text-slate-600 mt-1">
                Copy the <strong>Web app URL</strong> provided after deployment.<br />
                Go to the <strong>Settings</strong> modal in this app (gear icon in header).<br />
                Select <strong>Google Apps Script</strong> and paste your URL.<br />
                <span className="text-xs text-blue-600 font-medium mt-1 block italic">Tip: You can also set VITE_APPS_SCRIPT_URL in your .env file to pre-configure this.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
