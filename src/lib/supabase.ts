
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbqtexuroytotxilvkgj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icXRleHVyb3l0b3R4aWx2a2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0NTk2NDQsImV4cCI6MjA1MzAzNTY0NH0.ytnHBtq8roZZ-j_1uwimilvD3pDMZVHvK33zbRNXmM4';

export const supabase = createClient(supabaseUrl, supabaseKey);
