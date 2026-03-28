import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const { email, first_name } = await request.json()

    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Valid email required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('subscribers')
      .insert([{ email, first_name: first_name || null }])

    if (error) {
      if (error.code === '23505') {
        return Response.json({ message: 'Already subscribed!' }, { status: 200 })
      }
      throw error
    }

    return Response.json({ message: 'Subscribed successfully!' }, { status: 200 })
  } catch (err) {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
