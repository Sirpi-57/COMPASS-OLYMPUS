/**
 * Export Service Module
 * Responsible for exporting property data to CSV and PDF formats
 */

class ExportService {
    constructor() {
        this.exportCsvBtn = null;
        this.exportPdfBtn = null;
        this.getPropertiesCallback = null;
    }

    /**
     * Initialize the export service
     * @param {Object} config - Configuration object
     * @param {string} config.exportCsvBtnId - ID of the export CSV button
     * @param {string} config.exportPdfBtnId - ID of the export PDF button
     * @param {Function} config.getPropertiesCallback - Callback to get properties for export
     */
    init(config) {
        this.exportCsvBtn = document.getElementById(config.exportCsvBtnId);
        this.exportPdfBtn = document.getElementById(config.exportPdfBtnId);
        this.getPropertiesCallback = config.getPropertiesCallback;
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('Export Service initialized');
    }

    /**
     * Set up event listeners for export buttons
     */
    setupEventListeners() {
        if (this.exportCsvBtn) {
            this.exportCsvBtn.addEventListener('click', () => {
                this.exportToCsv();
            });
        }
        
        if (this.exportPdfBtn) {
            this.exportPdfBtn.addEventListener('click', () => {
                this.exportToPdf();
            });
        }
    }

    /**
     * Export properties to CSV file
     */
    exportToCsv() {
        if (!this.getPropertiesCallback) return;
        
        const properties = this.getPropertiesCallback();
        if (!properties || properties.length === 0) {
            alert('No properties to export');
            return;
        }
        
        // Define CSV headers
        const headers = [
            'Property ID',
            'Type',
            'BHK',
            'Locality',
            'Building Name',
            'Area (sq.ft)',
            'Rent (₹)',
            'Furnishing Status',
            'Maintenance (₹)',
            'Deposit (₹)',
            'Pets Allowed',
            'Available From',
            'Owner Name',
            'Owner Contact'
        ];
        
        // Create CSV content
        let csvContent = headers.join(',') + '\n';
        
        properties.forEach(property => {
            const row = [
                property.propertyId,
                `"${property.propertyType}"`,
                property.bhk,
                `"${property.locality}"`,
                `"${property.buildingName || ''}"`,
                property.area,
                property.rent,
                `"${property.furnishingStatus}"`,
                property.maintenanceCharges,
                property.deposit,
                property.petsAllowed ? 'Yes' : 'No',
                `"${property.availableFrom || 'Immediate'}"`,
                `"${property.ownerName}"`,
                `"${property.ownerContact}"`
            ];
            
            csvContent += row.join(',') + '\n';
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'chennai_properties.csv');
        link.style.visibility = 'hidden';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Export properties to PDF file
     */
    exportToPdf() {
        if (!this.getPropertiesCallback) return;
        
        const properties = this.getPropertiesCallback();
        if (!properties || properties.length === 0) {
            alert('No properties to export');
            return;
        }
        
        // Check if jsPDF is available
        if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
            console.error('jsPDF is not available');
            alert('PDF export is not available. Please try CSV export instead.');
            return;
        }
        
        // Create PDF document
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.text('Chennai Property Search Results', 14, 22);
        
        // Add date
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        
        // Add property count
        doc.text(`Total properties: ${properties.length}`, 14, 36);
        
        // Prepare table data
        const tableColumn = ['Type', 'BHK', 'Locality', 'Building', 'Area', 'Rent (₹)', 'Furnishing'];
        const tableRows = [];
        
        properties.forEach(property => {
            const row = [
                property.propertyType,
                property.bhk,
                property.locality,
                property.buildingName || '-',
                property.area,
                property.rent.toLocaleString(),
                property.furnishingStatus
            ];
            
            tableRows.push(row);
        });
        
        // Add table
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 133, 244] },
            alternateRowStyles: { fillColor: [240, 240, 240] },
            margin: { top: 45 }
        });
        
        // Save PDF
        doc.save('chennai_properties.pdf');
    }
}

// Create and export a singleton instance
const exportService = new ExportService();
