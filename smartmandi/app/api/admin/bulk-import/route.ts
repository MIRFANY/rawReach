// app/api/admin/bulk-import/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/client'
import { parseExcelFile } from '@/lib/excel-parser'

export async function POST(req: NextRequest) {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    try {
        const items = await parseExcelFile(file) // returns SabzimandiItem[]
        // transform for DB
        const data = items.map((i) => ({
            name: i.name,
            type: 'sabzimandi',
            price: i.price,
            quantity: i.quantity,
            owner_name: 'Sabzimandi',
            description: i.description,
            contact_info: { phone: i.contact, location: i.location }
        }))
        const { error } = await supabase.from('listings').insert(data)
        if (error) throw error
        return NextResponse.json({ message: `Imported ${data.length} items ✅` })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
