import { createClient } from "@supabase/supabase-js";

// Create Supabase client
const supabase = createClient("your_project_url", "your_supabase_api_key");

module.exports = supabase;
