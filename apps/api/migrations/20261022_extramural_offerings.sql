-- Service offerings are configurable independently of the two service categories.
alter table public.upec_service_catalogue
 add column if not exists offerings jsonb not null default '[]'::jsonb;
update public.upec_service_catalogue
 set offerings='["Post-JAMB coaching","Holiday & after-school coaching","School of Nursing entrance examination preparation","Private / home lessons","Undergraduate special coaching","Adult education","Computer training"]'::jsonb
 where code='extramural_lessons' and offerings='[]'::jsonb;
comment on column public.upec_service_catalogue.offerings is 'Admin-configured list of selectable services within this category.';
