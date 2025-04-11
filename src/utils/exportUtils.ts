
/**
 * Utility functions for exporting data
 */

/**
 * Convert data to CSV format and trigger download
 */
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  let csvContent = headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(item => {
    const row = headers.map(header => {
      // Format value properly for CSV
      let value = item[header];
      
      // Handle numbers
      if (typeof value === 'number') {
        return value;
      }
      
      // Handle dates
      if (value instanceof Date) {
        return value.toISOString();
      }
      
      // Handle strings (escape quotes and commas)
      if (typeof value === 'string') {
        // If value contains comma or quote, wrap in quotes and escape inner quotes
        if (value.includes(',') || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }
      
      // Handle objects or arrays by converting to JSON string
      if (typeof value === 'object' && value !== null) {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      
      // Handle null/undefined
      return value === null || value === undefined ? '' : String(value);
    }).join(',');
    
    csvContent += row + '\n';
  });
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Convert data to PDF and trigger download
 * This is a simplified version that creates a styled HTML table and uses browser print to PDF
 */
export const exportToPDF = (data: any[], filename: string, title: string = 'Report') => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create a new window for the PDF content
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups for this website to export PDF');
    return;
  }
  
  // Create HTML content
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        h1 { text-align: center; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <table>
        <thead>
          <tr>
            ${headers.map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
  `;
  
  // Add data rows
  data.forEach(item => {
    htmlContent += '<tr>';
    headers.forEach(header => {
      let value = item[header];
      
      // Format value for display
      if (value instanceof Date) {
        value = value.toLocaleDateString();
      } else if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      }
      
      htmlContent += `<td>${value === null || value === undefined ? '' : value}</td>`;
    });
    htmlContent += '</tr>';
  });
  
  // Close table and add print button
  htmlContent += `
        </tbody>
      </table>
      <div class="footer">Generated on ${new Date().toLocaleString()}</div>
      <button onclick="window.print();setTimeout(function(){window.close();},750);" style="margin: 20px auto; display: block; padding: 10px 20px;">Print / Save as PDF</button>
    </body>
    </html>
  `;
  
  // Write to the new window and trigger print
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
