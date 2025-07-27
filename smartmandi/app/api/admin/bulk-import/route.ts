// app/api/admin/bulk-import/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

// --- 1. CREATE a server instance of supabase
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// --- 2. Helper: Parse Buffer (.xlsx) to listings data
async function parseMandiExcel(file: Blob): Promise<any[]> {
    // Read as buffer
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(worksheet)
    // Map to listings
    return (rows as any[]).map((row) => {
        // Clean prices
        const cleanPrice = (p: any) =>
            p ? parseFloat(String(p).replace(/[^\d.]/g, '')) : null
        // Name
        let name = row['Commodity'] || ''
        if (row['Variety'] && String(row['Variety']).trim())
            name += ' - ' + String(row['Variety']).trim()
        // Standard description
        return {
            name,
            type: 'sabzimandi',
            price:
                cleanPrice(row['Modal Price']) ||
                cleanPrice(row['Min Price']) ||
                cleanPrice(row['Max Price']) ||
                0,
            quantity: 100, // Default or change as needed
            owner_name: row['Mandi / Market'] || 'Sabzi Mandi',
            description: `Variety: ${row['Variety'] || ''}, State: ${row['State'] || ''}, District: ${row['District'] || ''}, Min Price: ${row['Min Price'] || ''}, Max Price: ${row['Max Price'] || ''}, Arrival: ${row['Arrival Date'] || ''}`,
            photo_url: null,
            contact_info: {
                phone: '', // Add default or skip if unavailable
                location: [
                    row['Mandi / Market'],
                    row['District'],
                    row['State'],
                ]
                    .filter(Boolean)
                    .join(', '),
            },
        }
    })
}

// --- 3. API Handler
export async function POST(req: NextRequest) {
    const form = await req.formData()
    const file = form.get('file') as Blob | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    try {
        const items = await parseMandiExcel(file)
        const { error } = await supabase.from('listings').insert(items)
        if (error) throw error
        return NextResponse.json({
            message: `Imported ${items.length} items ✅`,
        })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
