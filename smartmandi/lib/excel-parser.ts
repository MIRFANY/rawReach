// lib/excel-parser.ts
import * as XLSX from 'xlsx';

export interface SabzimandiItem {
    name: string;
    type: 'sabzimandi';
    price: number;
    quantity: number;
    unit: string;
    location: string;
    contact: string;
    description?: string;
}

export function parseExcelFile(file: File): Promise<SabzimandiItem[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const parsedItems: SabzimandiItem[] = jsonData.map((row: any) => ({
                    name: row['Item Name'] || row['name'] || '',
                    type: 'sabzimandi',
                    price: parseFloat(row['Price'] || row['price'] || 0),
                    quantity: parseInt(row['Quantity'] || row['quantity'] || 0),
                    unit: row['Unit'] || row['unit'] || 'kg',
                    location: row['Location'] || row['location'] || '',
                    contact: row['Contact'] || row['contact'] || '',
                    description: row['Description'] || row['description'] || ''
                }));

                resolve(parsedItems);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('File reading failed'));
        reader.readAsArrayBuffer(file);
    });
}
