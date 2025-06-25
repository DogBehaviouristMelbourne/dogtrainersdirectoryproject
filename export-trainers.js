// Quick script to export trainers from Supabase to JSON
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const url = process.env.VITE_SUPABASE_URL
const anon = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  console.error('❌ Missing environment variables!')
  console.error('Please create a .env file with:')
  console.error('VITE_SUPABASE_URL=your_url')
  console.error('VITE_SUPABASE_ANON_KEY=your_key')
  process.exit(1)
}

const supabase = createClient(url, anon)

async function exportTrainers() {
  try {
    console.log('🔄 Fetching trainers from Supabase...')
    
    const { data: trainers, error } = await supabase
      .from('trainers')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('❌ Error fetching trainers:', error)
      return
    }
    
    console.log(`✅ Found ${trainers.length} trainers`)
    
    // Write to JSON file
    const jsonPath = path.join(process.cwd(), 'src/data/trainers.json')
    fs.writeFileSync(jsonPath, JSON.stringify(trainers, null, 2))
    
    console.log(`🎉 Exported ${trainers.length} trainers to src/data/trainers.json`)
    console.log('📝 Sample trainer:', trainers[0])
    
  } catch (err) {
    console.error('❌ Export failed:', err.message)
  }
}

exportTrainers()
