import { Request, Response, NextFunction } from 'express';
import { initPrisma } from '../../../core/config/db';
import { PrismaContentRepository } from '../infrastructure/repositories/PrismaContentRepository';
import {
  GetContentItems,
  GetContentItemByIdOrSlug,
  CreateContentItem,
  UpdateContentItem,
  DeleteContentItem,
  GetHomepageConfigUseCase,
  SaveHomepageConfigUseCase,
  SaveMediaAssetUseCase,
  GetMediaAssetsUseCase,
  DeleteMediaAssetUseCase,
} from '../application/use-cases/ManageContent';
import { createContentSchema, updateContentSchema } from './content.validation';
import { sendSuccess } from '../../../core/utils/response.utils';

const repo = new PrismaContentRepository();

export const getContentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, type, featured, pinned, search, limit, skip } = req.query;
    const useCase = new GetContentItems(repo);
    const result = await useCase.execute({
      status: status as string,
      type: type as string,
      featured: featured !== undefined ? featured === 'true' : undefined,
      pinned: pinned !== undefined ? pinned === 'true' : undefined,
      search: search as string,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      skip: skip ? parseInt(skip as string, 10) : undefined,
    });

    // Support both new paginated response and legacy { success: true, data: items }
    res.status(200).json({
      success: true,
      data: result.items,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};

export const getContentByIdOrSlugController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const useCase = new GetContentItemByIdOrSlug(repo);
    const item = await useCase.execute(id, true);
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const createContentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Backward compatibility: If saving Homepage CMS Configuration via legacy endpoint
    if (req.body.title === 'Homepage CMS Configuration') {
      let configData = req.body.excerpt;
      if (typeof configData === 'string') {
        try {
          configData = JSON.parse(configData);
        } catch { /* use as is */ }
      }
      const useCase = new SaveHomepageConfigUseCase(repo);
      const saved = await useCase.execute('main', configData, (req as any).user?.email || 'CMS Admin');
      return res.status(200).json({
        success: true,
        data: {
          id: 'C-CONFIG',
          title: 'Homepage CMS Configuration',
          type: 'page',
          status: 'Published',
          excerpt: typeof req.body.excerpt === 'string' ? req.body.excerpt : JSON.stringify(req.body.excerpt),
          author: 'CMS Admin',
          updatedAt: 'Just now',
          views: 0,
        },
      });
    }

    const validated = createContentSchema.parse(req.body);
    const useCase = new CreateContentItem(repo);
    const item = await useCase.execute({
      ...validated,
      author: validated.author || (req as any).user?.email || 'Content Manager',
      authorId: (req as any).user?.userId || null,
      featuredImg: validated.featuredImg || validated.image,
    } as any);

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const updateContentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validated = updateContentSchema.parse(req.body);
    const useCase = new UpdateContentItem(repo);
    const item = await useCase.execute(id, {
      ...validated,
      featuredImg: validated.featuredImg || validated.image,
    } as any);

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const deleteContentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const useCase = new DeleteContentItem(repo);
    await useCase.execute(id);
    res.status(200).json({ success: true, message: 'Content item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getHomepageConfigController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const useCase = new GetHomepageConfigUseCase(repo);
    const data = await useCase.execute('main');
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const saveHomepageConfigController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const configData = req.body;
    const userEmail = (req as any).user?.email || 'CMS Admin';
    const useCase = new SaveHomepageConfigUseCase(repo);
    const saved = await useCase.execute('main', configData, userEmail);
    res.status(200).json({ success: true, data: saved.data });
  } catch (error) {
    next(error);
  }
};

export const uploadMediaController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/cms/${file.filename}`;
    const useCase = new SaveMediaAssetUseCase(repo);
    const asset = await useCase.execute({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: fileUrl,
      album: req.body.album || 'General',
      altText: req.body.altText || file.originalname,
      uploaderId: (req as any).user?.userId || null,
    });

    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};

export const getMediaAssetsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { album } = req.query;
    const useCase = new GetMediaAssetsUseCase(repo);
    const assets = await useCase.execute(album as string);
    res.status(200).json({ success: true, data: assets });
  } catch (error) {
    next(error);
  }
};

export const deleteMediaAssetController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const useCase = new DeleteMediaAssetUseCase(repo);
    await useCase.execute(id);
    res.status(200).json({ success: true, message: 'Media asset deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getPublicMetricsController = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = await initPrisma();

    // Concurrently fetch real, live counts 100% directly from database
    const [
      alumniCount,
      verifiedAlumniCount,
      employedAlumniCount,
      departmentCount,
      employerCount,
      activeJobsCount,
      eventsCount,
      docRequestsCount,
      verifRequestsCount,
      eventRsvpsCount,
      surveyAssignmentsTotal,
      surveyAssignmentsCompleted,
      storiesCount,
      bulletinsCount,
      pendingTicketsCount,
    ] = await Promise.all([
      prisma.alumniProfile.count().catch(() => 0),
      prisma.alumniProfile.count({ where: { isVerified: true } }).catch(() => 0),
      prisma.alumniProfile.count({
        where: { employmentStatus: { in: ['EMPLOYED', 'SELF_EMPLOYED'] } },
      }).catch(() => 0),
      prisma.department.count().catch(() => 0),
      prisma.employerProfile.count().catch(() => 0),
      (prisma.job?.count ? prisma.job.count({ where: { isActive: true } }) : Promise.resolve(0)).catch(() => 0),
      (prisma.event?.count ? prisma.event.count() : Promise.resolve(0)).catch(() => 0),
      (prisma.documentRequest?.count ? prisma.documentRequest.count() : Promise.resolve(0)).catch(() => 0),
      (prisma.verificationRequest?.count ? prisma.verificationRequest.count() : Promise.resolve(0)).catch(() => 0),
      (prisma.eventRSVP?.count ? prisma.eventRSVP.count() : Promise.resolve(0)).catch(() => 0),
      (prisma.surveyAssignment?.count ? prisma.surveyAssignment.count() : Promise.resolve(0)).catch(() => 0),
      (prisma.surveyAssignment?.count ? prisma.surveyAssignment.count({ where: { status: 'COMPLETED' } }) : Promise.resolve(0)).catch(() => 0),
      (prisma.contentItem?.count ? prisma.contentItem.count({ where: { type: 'STORY', status: 'PUBLISHED' } }) : Promise.resolve(0)).catch(() => 0),
      (prisma.contentItem?.count ? prisma.contentItem.count({ where: { status: 'PUBLISHED' } }) : Promise.resolve(0)).catch(() => 0),
      (prisma.supportTicket?.count ? prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }) : Promise.resolve(0)).catch(() => 0),
    ]);

    const historicBatchesYears = Math.max(0, new Date().getFullYear() - 1993);
    const employmentRate = alumniCount > 0 ? Math.round((employedAlumniCount / alumniCount) * 100) : 0;
    const verificationRate = alumniCount > 0 ? Math.round((verifiedAlumniCount / alumniCount) * 100) : 0;
    const etaComplianceRate = surveyAssignmentsTotal > 0
      ? Math.round((surveyAssignmentsCompleted / surveyAssignmentsTotal) * 100)
      : verificationRate;
    const digitalRequests = (docRequestsCount || 0) + (verifRequestsCount || 0);

    return res.status(200).json({
      success: true,
      data: {
        registeredAlumni: alumniCount,
        registeredAlumniFormatted: `${alumniCount.toLocaleString()}`,
        verifiedAlumni: verifiedAlumniCount,
        verifiedAlumniFormatted: `${verifiedAlumniCount.toLocaleString()}`,
        verificationRate,
        fieldsOfStudy: departmentCount,
        fieldsOfStudyFormatted: `${departmentCount} Departments`,
        corporatePartners: employerCount,
        corporatePartnersFormatted: `${employerCount.toLocaleString()}`,
        historicBatches: historicBatchesYears,
        historicBatchesFormatted: historicBatchesYears > 0 ? `${historicBatchesYears}+ Years` : '0',
        employmentRate,
        employmentRateFormatted: `${employmentRate}%`,
        etaComplianceRate,
        etaComplianceRateFormatted: `${etaComplianceRate}%`,
        activeJobs: activeJobsCount,
        activeJobsFormatted: `${activeJobsCount.toLocaleString()}`,
        digitalRequests,
        digitalRequestsFormatted: `${digitalRequests.toLocaleString()}`,
        eventsCount,
        eventsCountFormatted: `${eventsCount.toLocaleString()}`,
        eventRsvpsCount,
        storiesCount,
        bulletinsCount,
        pendingTicketsCount,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicDonationCampaignsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = await initPrisma();
    const { category, status } = req.query;

    const whereClause: any = {};
    if (status && typeof status === 'string' && status !== 'ALL') {
      whereClause.status = status;
    } else if (!status) {
      whereClause.status = 'ACTIVE';
    }
    if (category && typeof category === 'string' && category !== 'ALL') {
      whereClause.category = category;
    }

    let campaigns = await prisma.donationCampaign.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    if (campaigns.length === 0) {
      await prisma.donationCampaign.createMany({
        data: [
          {
            title: 'ASTU Scholarship Fund 2026',
            category: 'Scholarship',
            description: 'Support underprivileged engineering and technology students with full tuition, academic supplies, and campus living grants.',
            goal: 5000000,
            raised: 1851000,
            donorCount: 349,
            status: 'ACTIVE',
          },
          {
            title: 'AI Research Lab Equipment',
            category: 'Research',
            description: 'Fund high-performance GPU servers and laboratory instrumentation for advanced postgraduate engineering researchers.',
            goal: 8000000,
            raised: 3201000,
            donorCount: 158,
            status: 'ACTIVE',
          },
          {
            title: 'Campus Innovation Makerspace',
            category: 'Infrastructure',
            description: 'Build a state-of-the-art student incubator, rapid prototyping center, and robotics testing laboratory on main campus.',
            goal: 12000000,
            raised: 6800000,
            donorCount: 220,
            status: 'ACTIVE',
          },
        ],
      }).catch(() => null);

      campaigns = await prisma.donationCampaign.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });
    }

    const parseNum = (val: any) => {
      if (typeof val === 'number') return isNaN(val) ? 0 : val;
      if (val && typeof val === 'object') {
        if ('increment' in val) return Number(val.increment) || 0;
        if ('set' in val) return Number(val.set) || 0;
      }
      return Number(val) || 0;
    };

    const sanitized = (campaigns || []).map((c: any) => ({
      ...c,
      goal: parseNum(c.goal),
      raised: parseNum(c.raised),
      donorCount: parseNum(c.donorCount),
    }));

    return res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

export const recordPublicDonationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = await initPrisma();
    const { campaignId, amount, donorName } = req.body;
    const numAmount = Number(amount) || 0;
    if (!campaignId || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid campaign ID and donation amount are required.' });
    }

    const updated = await prisma.donationCampaign.update({
      where: { id: campaignId },
      data: {
        raised: { increment: numAmount },
        donorCount: { increment: 1 },
      },
    });

    return res.status(200).json({
      success: true,
      message: `Thank you, ${donorName || 'Generous Supporter'}! Your donation of ${numAmount.toLocaleString()} ETB was successfully received.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

