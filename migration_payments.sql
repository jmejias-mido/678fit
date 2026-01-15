-- Create PAYMENTS table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    member_id UUID REFERENCES members(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    method TEXT, -- 'cash', 'zelle', 'pago_movil', etc.
    status TEXT DEFAULT 'completed',
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    plan_name TEXT, -- Snapshot of plan name at time of payment
    period_start DATE,
    period_end DATE
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own payments
-- limited by member_id -> members.user_id = auth.uid()
CREATE POLICY "Users can view own payments" 
ON payments 
FOR SELECT 
TO authenticated 
USING (
    member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
    )
);

-- Policy: Admin can do everything
CREATE POLICY "Admin manage payments" 
ON payments 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
