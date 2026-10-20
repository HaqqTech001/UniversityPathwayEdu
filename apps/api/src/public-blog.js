import {Router} from 'express';
import {supabaseAdmin as db} from './db.js';
const router=Router(),wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
router.get('/posts',wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_blog_posts').select('slug,title,category,excerpt,sections,minutes,published_at').eq('status','published').order('published_at',{ascending:false}).limit(100);
 if(error)throw error;res.json({posts:data||[]});
}));
export default router;
