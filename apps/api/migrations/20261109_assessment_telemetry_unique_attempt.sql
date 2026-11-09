-- A candidate has one rolling telemetry record per institutional assessment attempt.
-- Existing production telemetry was checked before adding this constraint.
create unique index if not exists upec_assessment_telemetry_attempt_id_uidx
  on public.upec_assessment_telemetry (attempt_id);
