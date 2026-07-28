import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://geleptoxywornyghyhij.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjA1YWUyYjg1LTg4N2MtNGU4YS1hOGFjLWRkODc3M2NlY2VmMyJ9.eyJwcm9qZWN0SWQiOiJnZWxlcHRveHl3b3JueWdoeWhpaiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg1MjI0NjQyLCJleHAiOjIxMDA1ODQ2NDIsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.u-Q2gAJVSnnDRpedK9znixqzbh68sJlLR74xvrgdh3M';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };