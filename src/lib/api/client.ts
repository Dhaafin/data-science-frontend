import axios from "axios";

// Environment variables must be loaded correctly in Next.js (NEXT_PUBLIC_ prefix)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables are missing! Ensure NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
  );
}

/**
 * Reusable Axios instance pointing to the Supabase REST API (PostgREST).
 * Automatically injects the necessary apikey and Authorization headers.
 */
export const supabaseApi = axios.create({
  baseURL: `${supabaseUrl}/rest/v1`,
  headers: {
    "Content-Type": "application/json",
    apikey: supabaseAnonKey || "",
    Authorization: `Bearer ${supabaseAnonKey || ""}`,
  },
});

// Response interceptor for standard error handling
supabaseApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // PostgREST errors usually have a message property
    console.error("Supabase API Error:", error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);
