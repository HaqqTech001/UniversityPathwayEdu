import {Router} from 'express';
import {randomUUID} from 'node:crypto';
import {pool} from './db.js';
import {requireRole} from './security.js';
const router = Router();
const admin = requireRole('admin');
const candidate = requireRole('candidate');
const allowedEvents = new Set(['TAB_HIDDEN','WINDOW_BLUR','FULLSCREEN_EXIT','CAMERA_OFF','CAMERA_ON','RECONNECTED']);
const allowedReasons = new Set(['MANUAL','TIME_EXPIRED','TAB_HIDDEN','FULLSCREEN_EXIT','ADMIN_ENDED','WINDOW_BLUR']);
const fetchRoom = async id => (await pool.query('SELECT * FROM cbt_rooms WHERE id=?',[id]))[0][0];
const checkMember = async (id,sub) => (await pool.query('SELECT * FROM cbt_room_candidates WHERE room_id=? AND candidate_id=?',[id,sub]))[0][0];
router.post('/rooms',admin,async(req,res,next)=>{
  try {
    const title = String(req.body?.title||'').trim();
    const duration = Number(req.body?.durationSeconds||7200);
    if (!title || title.length>160 || !Number.isInteger(duration) || duration<60 || duration>14400) return res.status(400).json({error:'Invalid title or duration'});
    const id=randomUUID();
    await pool.query('INSERT INTO cbt_rooms(id,title,duration_seconds) VALUES(?,?,?)',[id,title,duration]);
    res.status(201).json({id,title,status:'waiting',durationSeconds:duration});
  }catch(e){next(e);}
});
router.get('/rooms',admin,async(_req,res,next)=>{
  try {res.json((await pool.query('SELECT * FROM cbt_rooms ORDER BY created_at DESC LIMIT 100'))[0]);}catch(e){next(e);}
});
router.post('/rooms/:id/start',admin,async(req,res,next)=>{
  try {
    const [result]=await pool.query("UPDATE cbt_rooms SET status='running',started_at=NOW() WHERE id=? AND status='waiting'",[req.params.id]);
    if(!result.affectedRows) return res.status(409).json({error:'Room not found or not waiting'});
    await pool.query("UPDATE cbt_room_candidates SET status='in_progress' WHERE room_id=? AND status='joined'",[req.params.id]);
    res.json({status:'running'});
  }catch(e){next(e);}
});
router.post('/rooms/:id/end',admin,async(req,res,next)=>{
  try {
    const [result]=await pool.query("UPDATE cbt_rooms SET status='ended',ended_at=NOW() WHERE id=? AND status<>'ended'",[req.params.id]);
    if(!result.affectedRows) return res.status(409).json({error:'Room not found or already ended'});
    await pool.query("UPDATE cbt_room_candidates SET status='submitted',submitted_at=NOW(),submit_reason='ADMIN_ENDED' WHERE room_id=? AND status<>'submitted'",[req.params.id]);
    res.json({status:'ended'});
  }catch(e){next(e);}
});
router.get('/rooms/:id/monitor',admin,async(req,res,next)=>{
  try {
    const room=await fetchRoom(req.params.id);
    if(!room)return res.status(404).json({error:'Room not found'});
    const [candidates]=await pool.query(`SELECT c.candidate_id,c.status,c.joined_at,c.submitted_at,c.submit_reason,
      COUNT(a.question_id) AS answered FROM cbt_room_candidates c LEFT JOIN cbt_room_answers a
      ON a.room_id=c.room_id AND a.candidate_id=c.candidate_id
      WHERE c.room_id=? GROUP BY c.candidate_id,c.status,c.joined_at,c.submitted_at,c.submit_reason`,[req.params.id]);
    const [events]=await pool.query('SELECT candidate_id,event_type,occurred_at FROM cbt_room_events WHERE room_id=? ORDER BY id DESC LIMIT 100',[req.params.id]);
    res.json({room,candidates,events});
  }catch(e){next(e);}
});
router.post('/rooms/:id/join',candidate,async(req,res,next)=>{
  try {
    const room=await fetchRoom(req.params.id);
    if(!room)return res.status(404).json({error:'Room not found'});
    if(room.status==='ended')return res.status(409).json({error:'Room ended'});
    await pool.query("INSERT IGNORE INTO cbt_room_candidates(room_id,candidate_id,status) VALUES(?,?,?)",[req.params.id,req.actor.sub,room.status==='running'?'in_progress':'joined']);
    const member=await checkMember(req.params.id,req.actor.sub);
    res.json({room,member});
  }catch(e){next(e);}
});
router.get('/rooms/:id/session',candidate,async(req,res,next)=>{
  try {
    const room=await fetchRoom(req.params.id);
    const member=await checkMember(req.params.id,req.actor.sub);
    if(!room||!member)return res.status(404).json({error:'Session not found'});
    const [answers]=await pool.query('SELECT question_id,option_index FROM cbt_room_answers WHERE room_id=? AND candidate_id=?',[req.params.id,req.actor.sub]);
    res.json({room,member,answers});
  }catch(e){next(e);}
});
router.put('/rooms/:id/answers/:questionId',candidate,async(req,res,next)=>{
  try {
    const room=await fetchRoom(req.params.id);
    const member=await checkMember(req.params.id,req.actor.sub);
    if(!room||!member)return res.status(404).json({error:'Session not found'});
    if(room.status!=='running'||member.status!=='in_progress')return res.status(409).json({error:'Session is not active'});
    const option=Number(req.body?.optionIndex);
    if(!Number.isInteger(option)||option<0||option>3||!/^[-\w]{1,100}$/.test(req.params.questionId))return res.status(400).json({error:'Invalid answer'});
    await pool.query('INSERT INTO cbt_room_answers(room_id,candidate_id,question_id,option_index) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE option_index=VALUES(option_index)',[req.params.id,req.actor.sub,req.params.questionId,option]);
    res.json({saved:true});
  }catch(e){next(e);}
});
router.post('/rooms/:id/events',candidate,async(req,res,next)=>{
  try {
    const member=await checkMember(req.params.id,req.actor.sub);
    if(!member)return res.status(404).json({error:'Session not found'});
    if(member.status==='submitted')return res.status(409).json({error:'Already submitted'});
    const event=String(req.body?.eventType||'');
    if(!allowedEvents.has(event))return res.status(400).json({error:'Invalid event'});
    await pool.query('INSERT INTO cbt_room_events(room_id,candidate_id,event_type) VALUES(?,?,?)',[req.params.id,req.actor.sub,event]);
    res.json({logged:true});
  }catch(e){next(e);}
});
router.post('/rooms/:id/submit',candidate,async(req,res,next)=>{
  try {
    const reason=String(req.body?.reason||'MANUAL');
    if(!allowedReasons.has(reason))return res.status(400).json({error:'Invalid reason'});
    const [result]=await pool.query("UPDATE cbt_room_candidates SET status='submitted',submitted_at=NOW(),submit_reason=? WHERE room_id=? AND candidate_id=? AND status='in_progress'",[reason,req.params.id,req.actor.sub]);
    if(!result.affectedRows)return res.status(409).json({error:'Session not active or already submitted'});
    res.json({submitted:true,reason});
  }catch(e){next(e);}
});
export default router;
