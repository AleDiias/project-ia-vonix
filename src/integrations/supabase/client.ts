// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mbqtexuroytotxilvkgj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icXRleHVyb3l0b3R4aWx2a2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0NTk2NDQsImV4cCI6MjA1MzAzNTY0NH0.ytnHBtq8roZZ-j_1uwimilvD3pDMZVHvK33zbRNXmM4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);