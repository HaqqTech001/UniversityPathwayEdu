alter table public.upec_jamb_programmes
 add column if not exists discovery_notes text not null default '',
 add column if not exists discovery_source_reference text,
 add column if not exists discovered_at timestamptz,
 add column if not exists discovered_by uuid;
comment on column public.upec_jamb_programmes.discovery_notes is 'Provenance notes describing how this provisional programme name was copied from the official IBASS directory; does not verify programme availability or admission requirements.';
comment on column public.upec_jamb_programmes.discovered_at is 'Timestamp when this programme was first imported from an institution IBASS directory.';
comment on column public.upec_jamb_programmes.discovered_by is 'Staff account that imported this provisional IBASS programme record.';

comment on column public.upec_jamb_programmes.discovery_source_reference is 'Official IBASS brochure URL from which provisional programme names were discovered; this does not verify programme availability or admission requirements.';
