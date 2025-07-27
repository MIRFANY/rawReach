// lib/sabzimandi-excel.ts
import * as XLSX from 'xlsx'

export function parseMandiExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: 'array' })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet)
            const rows = Array.isArray(jsonData) ? jsonData : []

            // Parse each row to SmartMandi listing format
            const parsed = rows.map((row: any) => {
                // Parse price (remove ₹, commas, etc.)
                const cleanPrice = (p: any) => {
                    if (!p) return null
                    return parseFloat(String(p).replace(/[₹,\s]/g, ''))
                }
                // Make product name
                let name = row['Commodity'] || ''
                if (row['Variety'] && String(row['Variety']).trim() !== '') {
                    name += ' - ' + row['Variety'].trim()
                }
                // fallback quantity
                const quantity = 100
                return {
                    name,
                    type: 'sabzimandi',
                    price: cleanPrice(row['Modal Price']) || cleanPrice(row['Min Price']) || 0,
                    quantity,
                    owner_name: row['Mandi / Market'] || row['Market'] || 'Sabzi Mandi',
                    description: `Variety: ${row['Variety'] || ''}, State: ${row['State'] || ''}, District: ${row['District'] || ''}, Min Price: ${row['Min Price'] || ''}, Max Price: ${row['Max Price'] || ''}, Arrival: ${row['Arrival Date'] || ''}`,
                    photo_url: null,
                    contact_info: {
                        phone: "", // Optionally fill if you have mandi phone number
                        location: `${row['Mandi / Market'] || 'Sabzi Mandi'}, ${row['District'] || ''}, ${row['State'] || ''}`
                    },
                }
            })
            resolve(parsed)
        }
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
    })
}
