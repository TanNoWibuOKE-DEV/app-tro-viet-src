-- ==============================================================================
-- Trọ Việt - Migration v3 (Phase 3: Realtime Chat, Reviews, Reports & Notifications)
-- ==============================================================================

-- 1. NOTIFICATIONS TABLE
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM (
      'chat_message',
      'review_received',
      'review_approved',
      'listing_approved',
      'listing_rejected',
      'verification_approved',
      'verification_rejected',
      'report_resolved',
      'anti_scam_warning'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'anti_scam_warning',
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);

-- 2. ENABLE RLS ON NOTIFICATIONS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users read own notifications'
  ) THEN
    CREATE POLICY "Users read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users update own notifications'
  ) THEN
    CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3. ADDITIONAL POLICIES FOR CONVERSATIONS & REVIEWS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Tenants create conversations'
  ) THEN
    CREATE POLICY "Tenants create conversations" ON conversations FOR INSERT WITH CHECK (
      auth.uid() = tenant_id
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Landlords reply to reviews on their listings'
  ) THEN
    CREATE POLICY "Landlords reply to reviews on their listings" ON reviews FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM listings 
        WHERE listings.id = reviews.listing_id 
        AND listings.landlord_id = auth.uid()
      )
    );
  END IF;
END $$;

-- 4. SAMPLE SEED DATA FOR PHASE 3 TESTING [MẪU - DEV]
-- Note: Insert sample reviews and reports if needed for development
