-- Purge any auth tokens that may have already been uploaded via the localStorage dump
UPDATE public.snapshots
SET payload = jsonb_set(
  payload,
  '{data}',
  COALESCE((
    SELECT jsonb_object_agg(key, value)
    FROM jsonb_each(payload->'data')
    WHERE key NOT ILIKE 'sb-%'
      AND key NOT ILIKE '%auth-token%'
      AND key NOT ILIKE '%auth.token%'
      AND key NOT ILIKE 'supabase.auth%'
      AND key NOT ILIKE '%access_token%'
      AND key NOT ILIKE '%refresh_token%'
      AND key NOT ILIKE '%session%'
      AND key NOT ILIKE '%password%'
      AND key NOT ILIKE '%secret%'
      AND key NOT ILIKE '%apikey%'
      AND key NOT ILIKE '%api_key%'
  ), '{}'::jsonb)
)
WHERE payload ? 'data'
  AND payload->>'__fullLocalStorageDump' = 'true';

-- Constrain payload size and enum values to prevent storage abuse
ALTER TABLE public.snapshots
  ADD CONSTRAINT snapshots_payload_size_check
  CHECK (pg_column_size(payload) < 524288);

ALTER TABLE public.snapshots
  ADD CONSTRAINT snapshots_doc_type_check
  CHECK (doc_type IN ('sow','timeline','sow_archive','timeline_save_local'));

ALTER TABLE public.snapshots
  ADD CONSTRAINT snapshots_kind_check
  CHECK (kind IN ('save','submit','archive','clear','auto','migration','timeline_save','timeline_auto','timeline_recall','reactivate'));