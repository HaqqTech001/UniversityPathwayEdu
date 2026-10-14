import crypto from 'node:crypto';
const secret = () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
  return process.env.JWT_SECRET;
};
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
export function signToken({sub,role}, expiresSeconds = 3600) {
  const payload = encode({sub,role,exp:Math.floor(Date.now()/1000)+expiresSeconds});
  const signature = crypto.createHmac('sha256',secret()).update(payload).digest('base64url');
  return payload+'.'+signature;
}
export function requireRole(...roles) {
  return (req,res,next) => {
    try {
      const token = (req.headers.authorization || '').match(/^Bearer (.+)$/)?.[1] || '';
      const [payload,signature] = token.split('.');
      if (!payload || !signature) throw Error('Invalid token');
      const expected = crypto.createHmac('sha256',secret()).update(payload).digest();
      const received = Buffer.from(signature,'base64url');
      if (received.length !== expected.length || !crypto.timingSafeEqual(received,expected)) throw Error('Invalid signature');
      const claims = JSON.parse(Buffer.from(payload,'base64url').toString());
      if (claims.exp <= Date.now()/1000 || !roles.includes(claims.role) || typeof claims.sub !== 'string' || !claims.sub) throw Error('Unauthorized');
      req.actor = claims;
      next();
    } catch {res.status(401).json({error:'Unauthorized'});}
  };
}
