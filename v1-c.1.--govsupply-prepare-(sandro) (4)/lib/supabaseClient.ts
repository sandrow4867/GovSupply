import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://coxzsakwjvrqdskkacec.supabase.co';


export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNveHpzYWt3anZycWRza2thY2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExOTM0NTcsImV4cCI6MjA3Njc2OTQ1N30.3e5m0BXrNCrlTIAGtc4F8pJRycamgLuXehSA_78bBPA';

export const supabase = createClient(supabaseUrl,supabaseAnonKey);
