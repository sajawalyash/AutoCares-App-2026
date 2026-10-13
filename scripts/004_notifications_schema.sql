-- AutoCares Realtime Notifications Schema
-- Run this in Supabase SQL Editor

-- 1. Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_is_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow authenticated to insert notifications" ON public.notifications;
CREATE POLICY "Allow authenticated to insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- 4. Enable Supabase Realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 5. Safe Trigger function for service request status updates
CREATE OR REPLACE FUNCTION public.handle_service_request_notification()
RETURNS TRIGGER AS $func$
DECLARE
  v_row_json JSONB;
  v_customer_id UUID;
  v_mechanic_id UUID;
  v_problem TEXT;
BEGIN
  v_row_json := to_jsonb(NEW);

  -- Safely extract customer_id without "record has no field" errors
  BEGIN
    v_customer_id := (COALESCE(v_row_json->>'customer_id', v_row_json->>'user_id'))::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_customer_id := NULL;
  END;

  -- Safely extract mechanic_id
  BEGIN
    v_mechanic_id := (v_row_json->>'mechanic_id')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_mechanic_id := NULL;
  END;

  v_problem := COALESCE(v_row_json->>'problem', v_row_json->>'problem_description', 'A driver nearby needs assistance!');

  -- When new request is submitted
  IF TG_OP = 'INSERT' THEN
    IF v_mechanic_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, link, metadata)
      VALUES (
        v_mechanic_id,
        'New Service Request!',
        v_problem,
        'service_request',
        '/mechanic/dashboard',
        jsonb_build_object('request_id', NEW.id, 'status', NEW.status)
      );
    END IF;
    RETURN NEW;
  END IF;

  -- When request status changes
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'assigned' AND v_customer_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, link, metadata)
      VALUES (
        v_customer_id,
        'Mechanic Assigned!',
        'A mechanic has accepted your service request and is preparing to assist you.',
        'request_accepted',
        '/tracking',
        jsonb_build_object('request_id', NEW.id, 'status', NEW.status)
      );
    ELSIF NEW.status = 'on_way' AND v_customer_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, link, metadata)
      VALUES (
        v_customer_id,
        'Mechanic is On the Way!',
        'Your mechanic is currently traveling to your location.',
        'mechanic_on_way',
        '/tracking',
        jsonb_build_object('request_id', NEW.id, 'status', NEW.status)
      );
    ELSIF NEW.status = 'completed' AND v_customer_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, link, metadata)
      VALUES (
        v_customer_id,
        'Service Completed',
        'Your service has been marked as completed. Please take a moment to rate the mechanic.',
        'request_completed',
        '/ratings',
        jsonb_build_object('request_id', NEW.id, 'status', NEW.status)
      );
    ELSIF NEW.status = 'rejected' AND v_customer_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, link, metadata)
      VALUES (
        v_customer_id,
        'Request Declined',
        'The mechanic was unable to accept your request. Please request another nearby mechanic.',
        'request_rejected',
        '/mechanics',
        jsonb_build_object('request_id', NEW.id, 'status', NEW.status)
      );
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Ensure trigger failure never breaks service request creation/updating
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Attach trigger
DROP TRIGGER IF EXISTS trigger_service_request_notification ON public.service_requests;
CREATE TRIGGER trigger_service_request_notification
  AFTER INSERT OR UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_service_request_notification();
