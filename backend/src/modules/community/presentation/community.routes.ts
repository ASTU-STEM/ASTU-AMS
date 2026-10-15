import { Router } from 'express';
import { optionalAuthenticateJWT } from '../../../core/middleware/auth.middleware';
import { sendSuccess, sendError } from '../../../core/utils/response.utils';
import prisma from '../../../core/config/db';

const router = Router();

const toMemberDto = (m: any) => ({
  id: m.id,
  name: m.name || '',
  role: m.role || '',
  org: m.org || '',
  location: m.location || '',
  category: m.category || 'all',
  degree: m.degree || '',
  gradYear: m.gradYear || '',
  image: m.image || '',
  bio: m.bio || '',
  quote: m.quote ?? null,
  badge: m.badge ?? null,
  active: m.active !== false,
});

const pickData = (body: any) => ({
  name: body.name || '',
  role: body.role || '',
  org: body.org || '',
  location: body.location || '',
  category: body.category || 'all',
  degree: body.degree || '',
  gradYear: body.gradYear || '',
  image: body.image || '',
  bio: body.bio || '',
  quote: body.quote ?? null,
  badge: body.badge ?? null,
  active: body.active !== false,
});

const FIELDS = ['name', 'role', 'org', 'location', 'category', 'degree', 'gradYear', 'image', 'bio', 'quote', 'badge', 'active'];

const pickPartial = (body: any) => {
  const data: any = {};
  for (const key of FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) data[key] = body[key];
  }
  return data;
};

router.get('/', optionalAuthenticateJWT, async (_req, res) => {
  try {
    const members = await (prisma as any).communityMember.findMany({});
    return sendSuccess(res, 'Community members retrieved', members.map(toMemberDto));
  } catch (err) {
    return sendError(res, 'Failed to retrieve community members', err, 500);
  }
});

router.post('/', optionalAuthenticateJWT, async (req, res) => {
  try {
    const created = await (prisma as any).communityMember.create({ data: pickData(req.body) });
    return sendSuccess(res, 'Community member created', toMemberDto(created), 201);
  } catch (err) {
    return sendError(res, 'Failed to create community member', err, 500);
  }
});

router.put('/:id', optionalAuthenticateJWT, async (req, res) => {
  try {
    const updated = await (prisma as any).communityMember.update({
      where: { id: req.params.id },
      data: pickPartial(req.body),
    });
    return sendSuccess(res, 'Community member updated', toMemberDto(updated));
  } catch (err) {
    return sendError(res, 'Failed to update community member', err, 404);
  }
});

router.delete('/:id', optionalAuthenticateJWT, async (req, res) => {
  try {
    await (prisma as any).communityMember.delete({ where: { id: req.params.id } });
    return sendSuccess(res, 'Community member deleted');
  } catch (err) {
    return sendError(res, 'Failed to delete community member', err, 404);
  }
});

export default router;
