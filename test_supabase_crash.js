
import { createClient } from '@supabase/supabase-js';

try {
    console.log("Attempting to create client with undefined...");
    const supabase = createClient(undefined, undefined);
    console.log("Client created successfully");
} catch (error) {
    console.error("Caught error:", error.message);
}

try {
    console.log("Attempting to create client with empty strings...");
    const supabase = createClient('', '');
    console.log("Client created successfully");
} catch (error) {
    console.error("Caught error:", error.message);
}
