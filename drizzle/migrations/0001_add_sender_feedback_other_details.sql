ALTER TABLE public.sender_feedback_responses
  ADD COLUMN daily_helpfulness_detail text CHECK (daily_helpfulness_detail IS NULL OR char_length(daily_helpfulness_detail) <= 300),
  ADD COLUMN favorite_feature_detail text CHECK (favorite_feature_detail IS NULL OR char_length(favorite_feature_detail) <= 300),
  ADD COLUMN wants_upgrade_detail text CHECK (wants_upgrade_detail IS NULL OR char_length(wants_upgrade_detail) <= 300);