// types/index.ts
export type ListingSource = 'sabzimandi' | 'firm' | 'vendor'

export interface Listing {
    id: string
    name: string
    type: ListingSource
    price: number
    quantity: number
    owner_name: string | null
    description: string | null
    photo_url?: string | null
    contact_info: {
        phone?: string
        location?: string
    } | null
    created_at: string
}
