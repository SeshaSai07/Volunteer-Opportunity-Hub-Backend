const supabase = require('./config/supabaseClient');

async function checkDB() {
    console.log('--- Checking Database ---');

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Error accessing profiles table:', error.message);
            console.error('Hint: Did you run the database_schema.sql script in Supabase?');
        } else {
            console.log('✅ Profiles table exists and is accessible.');
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

checkDB();
