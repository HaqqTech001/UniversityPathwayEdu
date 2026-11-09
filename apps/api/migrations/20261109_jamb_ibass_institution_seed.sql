-- Seed only institution identities directly visible in official JAMB IBASS brochure pages.
-- No programmes or UTME combinations are inferred from this institution-only seed.
insert into public.upec_jamb_institutions
(institution_name,institution_type,state_name,official_source_reference,source_verified,source_checked_at,verification_notes,active)
values
('ADMIRALTY UNIVERSITY OF NIGERIA, IBUSA, DELTA STATE','university','Delta State','https://ibass.jamb.gov.ng/brochure-courses?id=21&school=ADMIRALTY+UNIVERSITY+OF+NIGERIA%2C+IBUSA%2C+DELTA+STATE',true,now(),'Institution identity confirmed on the official JAMB IBASS brochure institution page. No programme or subject combination inferred.',true),
('UNIVERSITY OF BENIN, BENIN CITY, EDO STATE','university','Edo State','https://ibass.jamb.gov.ng/brochure-courses?id=101&school=UNIVERSITY+OF+BENIN%2C+BENIN+CITY%2C+EDO+STATE',true,now(),'Institution identity confirmed on the official JAMB IBASS brochure institution page. No programme or subject combination inferred.',true),
('GREENFIELD UNIVERSITY, KASARAMI, KADUNA STATE','university','Kaduna State','https://ibass.jamb.gov.ng/brochure-courses?id=371&school=GREENFIELD+UNIVERSITY%2C+KASARAMI%2C+KADUNA+STATE',true,now(),'Institution identity confirmed on the official JAMB IBASS brochure institution page. No programme or subject combination inferred.',true),
('OSUN STATE UNIVERSITY, OSOGBO, OSUN STATE','university','Osun State','https://ibass.jamb.gov.ng/brochure-courses?id=798&school=OSUN+STATE+UNIVERSITY%2C+OSOGBO%2C+OSUN+STATE',true,now(),'Institution identity confirmed on the official JAMB IBASS brochure institution page. No programme or subject combination inferred.',true)
on conflict do nothing;
