// Supabase 클라이언트 설정
let SUPABASE_URL = 'https://fmjbtdmafpxsnymhtxkp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_O-u3pUx9ni2z6dQup2ZcxQ_G6m68uAc';

SUPABASE_URL = SUPABASE_URL.replace(/\/+$|\/auth\/v1.*$/g, '');

let supabaseClient = null;
try {
  if (window.supabase && SUPABASE_ANON_KEY) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.warn("Supabase 클라이언트 초기화 실패:", e);
}
