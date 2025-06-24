// Quick script to analyze current trainers in Supabase
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  'https://fauysecbxlrzypyzifqw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhdXlzZWNieGxyenlweXppZnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODk4MTEsImV4cCI6MjA2NjA2NTgxMX0.LgkpF5cpgdRuN1mLeiYZEBC_DtkR3ONas__Z2-m3nEg'
)

async function analyzeTrainers() {
  // Get all trainers
  const { data: trainers, error } = await supabase
    .from('trainers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`📊 CURRENT TRAINER ANALYSIS:`)
  console.log(`Total Trainers: ${trainers.length}`)
  
  if (trainers.length > 0) {
    console.log(`\n🏗️ DATABASE STRUCTURE:`)
    console.log('Columns:', Object.keys(trainers[0]))
    
    console.log(`\n📍 LOCATION BREAKDOWN:`)
    const locations = {}
    trainers.forEach(t => {
      const loc = t.suburb || t.location || 'Unknown'
      locations[loc] = (locations[loc] || 0) + 1
    })
    console.table(locations)

    console.log(`\n🎯 CATEGORIES:`)
    const categories = {}
    trainers.forEach(t => {
      if (t.categories) {
        t.categories.forEach(cat => {
          categories[cat] = (categories[cat] || 0) + 1
        })
      }
    })
    console.table(categories)

    console.log(`\n💰 PAYMENT STATUS CHECK:`)
    const hasPaymentField = trainers[0].hasOwnProperty('payment_status')
    console.log('Has payment_status field:', hasPaymentField)
    
    if (hasPaymentField) {
      const paymentStatus = {}
      trainers.forEach(t => {
        const status = t.payment_status || 'unknown'
        paymentStatus[status] = (paymentStatus[status] || 0) + 1
      })
      console.table(paymentStatus)
    }

    console.log(`\n🗓️ RECENT ADDITIONS:`)
    trainers.slice(0, 5).forEach(t => {
      console.log(`- ${t.name} (${t.suburb || t.location}) - ${t.created_at}`)
    })
  }
}

analyzeTrainers().catch(console.error)
