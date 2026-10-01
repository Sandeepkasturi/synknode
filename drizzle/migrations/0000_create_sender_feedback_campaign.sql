CREATE TABLE public.sender_feedback_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  respondent_name text NOT NULL CHECK (char_length(btrim(respondent_name)) BETWEEN 1 AND 100),
  age smallint NOT NULL CHECK (age BETWEEN 13 AND 100),
  gender text NOT NULL CHECK (gender IN ('woman', 'man', 'non-binary', 'prefer-not-to-say', 'self-describe')),
  gender_detail text CHECK (gender_detail IS NULL OR char_length(gender_detail) <= 80),
  daily_helpfulness text NOT NULL CHECK (daily_helpfulness IN ('useful', 'very-useful', 'other')),
  favorite_feature text NOT NULL CHECK (favorite_feature IN ('file-sharing', 'transfer-speed', 'ui-design', 'other')),
  wants_upgrade text NOT NULL CHECK (wants_upgrade IN ('yes', 'no', 'other')),
  accounts_opinion text NOT NULL CHECK (accounts_opinion IN ('helpful', 'very-helpful', 'not-interested', 'incognito')),
  pricing_preference text NOT NULL CHECK (pricing_preference IN ('free', 'pay-as-you-go', 'subscription', 'credits')),
  usage_frequency text NOT NULL CHECK (usage_frequency IN ('daily', 'weekly', 'monthly', 'occasionally')),
  most_wanted_improvement text NOT NULL CHECK (char_length(btrim(most_wanted_improvement)) BETWEEN 1 AND 500),
  additional_comments text CHECK (additional_comments IS NULL OR char_length(additional_comments) <= 1000),
  campaign_key text NOT NULL DEFAULT '2026-october-expansion',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (created_at >= '2026-10-01 00:00:00+05:30'::timestamptz AND created_at <= '2026-10-10 23:59:59+05:30'::timestamptz)
);
GRANT INSERT ON public.sender_feedback_responses TO anon, authenticated;
GRANT ALL ON public.sender_feedback_responses TO service_role;
ALTER TABLE public.sender_feedback_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Campaign visitors can submit feedback"
ON public.sender_feedback_responses FOR INSERT TO anon, authenticated
WITH CHECK (campaign_key = '2026-october-expansion' AND now() >= '2026-10-01 00:00:00+05:30'::timestamptz AND now() <= '2026-10-10 23:59:59+05:30'::timestamptz);
CREATE INDEX sender_feedback_responses_created_at_idx ON public.sender_feedback_responses (created_at);
COMMENT ON TABLE public.sender_feedback_responses IS 'Private responses for the October 1-10, 2026 SynkNode sender expansion survey.';