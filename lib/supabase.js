import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  "https://netgmnxzeytmbrtutcho.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldGdtbnh6ZXl0bWJydHV0Y2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NDMzNTQsImV4cCI6MjA5NDIxOTM1NH0.npHvI1tQ-bYHsA3mKc8s0p1k8i_UmmnFJ9RnHw4XMa0"
)