"""Apply UPEC attendance student-photo API fix to a local checkout.
Usage: python apply_upec_attendance_photo_fix.py C:\\Users\\USER\\UniversityPathwayEdu
"""
from pathlib import Path
import sys

root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd()
path = root / 'apps' / 'api' / 'src' / 'academic-routes.js'
if not path.is_file():
    raise SystemExit(f'Cannot find {path}. Run with the repository folder as argument.')
source = path.read_text(encoding='utf-8')
start = source.find("router.get('/attendance/students'")
end = source.find("\n}));", start)
if start < 0 or end < 0:
    raise SystemExit('Expected attendance/students endpoint not found; file left unchanged.')
section = source[start:end]
if 'photoUrl' in section:
    raise SystemExit('Attendance endpoint already returns photoUrl; file left unchanged.')
old = " res.json({students:(accounts||[]).map(a=>({id:a.id,name:a.full_name||'Student',programme:(applications||[]).find(p=>p.account_id===a.id)?.programme||''}))});"
if old not in section:
    raise SystemExit('Expected roster response differs from known version; file left unchanged.')
new = ''' const {data:photos,error:photoError}=await db.from('upec_student_photos')
  .select('student_account_id,storage_path').in('student_account_id',ids);
 if(photoError)throw photoError;
 const photoMap=new Map((photos||[]).map(photo=>[photo.student_account_id,photo.storage_path]));
 const students=await Promise.all((accounts||[]).map(async account=>{
  const storagePath=photoMap.get(account.id);
  const signed=storagePath
   ?await db.storage.from('upec-student-photos').createSignedUrl(storagePath,600)
   :null;
  return {
   id:account.id,
   name:account.full_name||'Student',
   programme:(applications||[]).find(a=>a.account_id===account.id)?.programme||'',
   photoUrl:signed&&!signed.error?signed.data.signedUrl:null
  };
 }));
 res.json({students});'''
updated = source[:start] + section.replace(old,new) + source[end:]
backup = path.with_suffix(path.suffix + '.before-attendance-photo-fix.bak')
backup.write_text(source,encoding='utf-8')
path.write_text(updated,encoding='utf-8')
print(f'Updated: {path}')
print(f'Backup: {backup}')
print('Next: node --check apps/api/src/academic-routes.js')
