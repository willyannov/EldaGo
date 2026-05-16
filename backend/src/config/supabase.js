import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórias no .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
