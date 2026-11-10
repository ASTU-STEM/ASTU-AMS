export interface ReportPackage {
  reportTitle: string;
  category: string;
  timeframe: string;
  scope: string;
  totalRecords: number;
  data: Record<string, any>[];
}

export function generateAndDownloadReport(
  report: ReportPackage,
  format: 'PDF' | 'CSV' | 'JSON' = 'PDF',
  existingWindow?: Window | null
) {
  const timestamp = new Date().toLocaleString();
  const refId = `ASTU-RPT-${Math.floor(Math.random() * 899999 + 100000)}`;

  if (format === 'CSV') {
    if (!report.data || report.data.length === 0) {
      alert('No records available to export.');
      return;
    }
    const headers = Object.keys(report.data[0]);
    const csvRows = [
      `# ${report.reportTitle}`,
      `# Category: ${report.category} | Scope: ${report.scope} | Generated: ${timestamp}`,
      headers.join(','),
      ...report.data.map((row) =>
        headers
          .map((h) => {
            const val = row[h] !== undefined ? String(row[h]) : '';
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.reportTitle.replace(/\s+/g, '_')}_${refId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  if (format === 'JSON') {
    const jsonStr = JSON.stringify(
      {
        meta: {
          title: report.reportTitle,
          category: report.category,
          scope: report.scope,
          timeframe: report.timeframe,
          generatedAt: timestamp,
          referenceId: refId,
        },
        records: report.data,
      },
      null,
      2
    );

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.reportTitle.replace(/\s+/g, '_')}_${refId}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    document.body.removeChild(link);
    return;
  }

  // --- DEFAULT FORMAT: PDF via Branded Print & Document Window Stream ---
  let printWindow = existingWindow;
  if (!printWindow || printWindow.closed) {
    try {
      printWindow = window.open('', '_blank');
    } catch (_) {
      printWindow = null;
    }
  }

  const headers = report.data.length > 0 ? Object.keys(report.data[0]) : [];

  const tableHeadersHtml = headers
    .map(
      (h) =>
        `<th style="padding: 10px 12px; background: #003580; color: #ffffff; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">${h
          .replace(/([A-Z])/g, ' $1')
          .trim()}</th>`
    )
    .join('');

  const tableRowsHtml = report.data.length > 0
    ? report.data
        .map(
          (row, idx) => `
          <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
            ${headers
              .map(
                (h) =>
                  `<td style="padding: 10px 12px; color: #1e293b; font-size: 12px; font-weight: ${
                    h.toLowerCase().includes('id') || h.toLowerCase().includes('status') ? 'bold' : 'normal'
                  };">${row[h] !== undefined && row[h] !== null ? row[h] : '-'}</td>`
              )
              .join('')}
          </tr>
        `
        )
        .join('')
    : `<tr><td colspan="6" style="padding: 24px; text-align: center; color: #64748b; font-size: 13px;">No matching records currently in database.</td></tr>`;

  const logoUrl = window.location.origin + '/images/astu-seal-logo.png';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${report.reportTitle} - ASTU Institutional Report</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 0;
            background: #ffffff;
          }
          .no-print {
            background: #003580;
            color: #ffffff;
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 13px;
            font-weight: 700;
            position: sticky;
            top: 0;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .no-print button {
            background: #ffffff;
            color: #003580;
            font-weight: 900;
            border: none;
            padding: 8px 18px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: all 0.2s;
          }
          .no-print button:hover {
            background: #f1f5f9;
            transform: translateY(-1px);
          }
          .content-wrapper {
            padding: 24px 32px;
          }
          @media print {
            .no-print { display: none !important; }
            .content-wrapper { padding: 0 !important; }
          }
          .header-banner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px solid #003580;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .logo-title-group {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .logo-img {
            height: 64px;
            width: 64px;
            object-fit: contain;
          }
          .title-area h1 {
            font-size: 19px;
            font-weight: 900;
            color: #003580;
            margin: 0 0 4px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .title-area h2 {
            font-size: 12px;
            font-weight: 700;
            color: #475569;
            margin: 0;
          }
          .badge-seal {
            text-align: right;
          }
          .badge-seal .seal {
            background: #f0fdf4;
            color: #166534;
            border: 1px solid #bbf7d0;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            display: inline-block;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 20px;
          }
          .meta-item label {
            font-size: 10px;
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
            display: block;
            margin-bottom: 2px;
          }
          .meta-item span {
            font-size: 12px;
            font-weight: 700;
            color: #0f172a;
          }
          .summary-box {
            background: #eff6ff;
            border-left: 4px solid #003580;
            padding: 12px 16px;
            border-radius: 4px;
            margin-bottom: 24px;
            font-size: 12px;
            color: #1e3a8a;
            line-height: 1.5;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #cbd5e1;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            font-size: 10px;
            color: #64748b;
          }
          .signature-box {
            text-align: center;
            border-top: 1px solid #94a3b8;
            padding-top: 4px;
            width: 180px;
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <div>📄 ASTU Official Institutional Report Document</div>
          <button onclick="window.print()">🖨️ Print / Save PDF Document</button>
        </div>

        <div class="content-wrapper">
          <div class="header-banner">
            <div class="logo-title-group">
              <img src="${logoUrl}" alt="ASTU Seal Logo" class="logo-img" onerror="this.src='/images/astu-seal-logo.png'" />
              <div class="title-area">
                <h1>Adama Science and Technology University</h1>
                <h2>Institutional Reports & Quality Assurance Center</h2>
              </div>
            </div>
            <div class="badge-seal">
              <div class="seal">✓ ABET & HERQA Compliant</div>
              <div style="font-size: 9px; color: #94a3b8; margin-top: 4px;">Ref: ${refId}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <label>Report Title</label>
              <span>${report.reportTitle}</span>
            </div>
            <div class="meta-item">
              <label>Category / Domain</label>
              <span>${report.category}</span>
            </div>
            <div class="meta-item">
              <label>Reporting Scope</label>
              <span>${report.scope}</span>
            </div>
            <div class="meta-item">
              <label>Generated On</label>
              <span>${timestamp}</span>
            </div>
          </div>

          <div class="summary-box">
            <strong>Executive Summary:</strong> This official report contains ${report.totalRecords} verified institutional entries compiled from ASTU Alumni Management System. All datasets have been validated for accreditation and institutional decision-making.
          </div>

          <table>
            <thead>
              <tr>${tableHeadersHtml}</tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <div>
              <p style="margin:0; font-weight: bold; color: #003580;">ASTU Alumni & Advancement Office</p>
              <p style="margin:2px 0 0 0;">Adama, Ethiopia • www.astu.edu.et • Official Audit Document</p>
            </div>
            <div class="signature-box">
              Authorized Sign-Off<br>
              <strong style="color: #0f172a;">Director of Institutional Quality</strong>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          };
        </script>
      </body>
    </html>
  `;

  if (printWindow && !printWindow.closed) {
    try {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      return;
    } catch (e) {
      console.warn('Writing to popup window failed, downloading blob file fallback', e);
    }
  }

  // Fallback if popup blocked: Direct HTML Blob file download
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${report.reportTitle.replace(/\s+/g, '_')}_${refId}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
