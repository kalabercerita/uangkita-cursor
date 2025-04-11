/**
 * Utility functions for exporting data
 */

/**
 * Convert data to CSV format and trigger download
 */
export const exportToCSV = (data: any[], filename: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    if (!data || !data.length) {
      console.error('No data to export');
      reject(new Error('No data to export'));
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
    
    // Create blob and return it
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    resolve(blob);
  });
};

/**
 * Convert data to PDF and trigger download
 */
export const exportToPDF = (data: any[], filename: string, title: string = 'Report'): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    if (!data || !data.length) {
      console.error('No data to export');
      reject(new Error('No data to export'));
      return;
    }

    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create a new window for the PDF content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      reject(new Error('Please allow popups for this website to export PDF'));
      return;
    }
    
    // Create HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${filename}</title>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
            padding: 20px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background-color: #f2f2f2; 
          }
          h1 { 
            text-align: center; 
            margin-bottom: 30px;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            font-size: 12px; 
            color: #666; 
          }
          @media print {
            button { display: none; }
            body { margin: 0; padding: 20px; }
          }
          .text-right { text-align: right; }
          .text-green { color: green; }
          .text-red { color: red; }
          .bold { font-weight: bold; }
          #print-btn {
            display: block;
            margin: 20px auto;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
          }
          #print-btn:hover {
            background-color: #45a049;
          }
          .auto-print {
            display: none;
          }
        </style>
        <script>
          // Automatically open print dialog when page loads
          window.onload = function() {
            // Small delay to make sure content is fully loaded
            setTimeout(function() {
              document.getElementById('print-btn').click();
            }, 500);
          };
          
          function printAndWait() {
            window.print();
            // Keep window open for a moment to allow user to save PDF
            setTimeout(function() {
              // Only close if not in focus - allows user to keep it open if they want
              if (!document.hasFocus()) {
                window.close();
              }
            }, 1000);
          }
        </script>
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
      const isTotal = item.categoryName && (
        item.categoryName.includes('Total') || 
        item.categoryName.includes('Saldo')
      );
      
      const rowClass = isTotal ? 'bold' : '';
      
      htmlContent += `<tr class="${rowClass}">`;
      headers.forEach(header => {
        let value = item[header];
        let cellClass = '';
        
        // Format value for display
        if (header === 'amount' || header === 'value') {
          // Determine if it's income or expense based on value
          const isIncome = Number(value) >= 0;
          cellClass = `text-right ${isIncome ? 'text-green' : 'text-red'}`;
          
          // Format as currency
          value = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(Math.abs(Number(value)));
        } else if (header === 'percentage') {
          cellClass = 'text-right';
          value = `${Number(value).toFixed(1)}%`;
        } else if (value instanceof Date) {
          value = value.toLocaleDateString();
        } else if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }
        
        htmlContent += `<td class="${cellClass}">${value === null || value === undefined ? '' : value}</td>`;
      });
      htmlContent += '</tr>';
    });
    
    // Close table and add print button
    htmlContent += `
          </tbody>
        </table>
        <div class="footer">Dicetak pada ${new Date().toLocaleString()}</div>
        <button id="print-btn" onclick="printAndWait()">Cetak / Simpan sebagai PDF</button>
      </body>
      </html>
    `;
    
    // Write to the new window and trigger print
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Create a simple blob as placeholder since we're using the print dialog
    // The actual PDF creation happens in the browser's print dialog
    const blob = new Blob(['PDF being created in print dialog'], { type: 'application/pdf' });
    resolve(blob);
  });
};
