import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://ajivqgeqsrllykhnxooa.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijk1NGEwNGJjLTY0MjQtNDhkMy04ZTAwLTg3OGE1MmJkYjZkYiJ9.eyJwcm9qZWN0SWQiOiJhaml2cWdlcXNybGx5a2hueG9vYSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg1MjU4NTIwLCJleHAiOjIxMDA2MTg1MjAsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.kQZj62KfhrJOlKCeDeXDyNifN30z6ry4bxL3RTvuyhw';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };