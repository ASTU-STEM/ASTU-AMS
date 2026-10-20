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

    // Concurrently fetch real, live counts from database
    const [
      alumniCount,
      employedAlumniCount,
      departmentCount,
      employerCount,
      activeJobsCount,
      eventsCount,
      docRequestsCount,
      verifRequestsCount,
    ] = await Promise.all([
      prisma.alumniProfile.count().catch(() => 0),
      prisma.alumniProfile.count({
        where: { employmentStatus: { in: ['EMPLOYED', 'SELF_EMPLOYED'] } },
      }).catch(() => 0),
      prisma.department.count().catch(() => 0),
      prisma.employerProfile.count().catch(() => 0),
      prisma.job.count({ where: { isActive: true } }).catch(() => 0),
      (prisma.event?.count ? prisma.event.count() : Promise.resolve(0)).catch(() => 0),
      (prisma.documentRequest?.count ? prisma.documentRequest.count() : Promise.resolve(0)).catch(() => 0),
      (prisma.verificationRequest?.count ? prisma.verificationRequest.count() : Promise.resolve(0)).catch(() => 0),
    ]);

    const formatCount = (n: number) => (n > 0 ? `${n.toLocaleString()}+` : '0');
    const historicBatchesYears = Math.max(0, new Date().getFullYear() - 1993);
    const employmentRate = alumniCount > 0 ? Math.round((employedAlumniCount / alumniCount) * 100) : 0;
    const digitalRequests = (docRequestsCount || 0) + (verifRequestsCount || 0);

    return res.status(200).json({
      success: true,
      data: {
        registeredAlumni: alumniCount,
        registeredAlumniFormatted: formatCount(alumniCount),
        fieldsOfStudy: departmentCount,
        fieldsOfStudyFormatted: departmentCount > 0 ? `${departmentCount} Major Areas` : '0',
        corporatePartners: employerCount,
        corporatePartnersFormatted: formatCount(employerCount),
        historicBatches: historicBatchesYears,
        historicBatchesFormatted: historicBatchesYears > 0 ? `${historicBatchesYears}+ Years` : '0',
        employmentRate,
        employmentRateFormatted: `${employmentRate}%`,
        activeJobs: activeJobsCount,
        activeJobsFormatted: formatCount(activeJobsCount),
        digitalRequests,
        digitalRequestsFormatted: formatCount(digitalRequests),
        eventsCount: eventsCount || 0,
        eventsCountFormatted: formatCount(eventsCount || 0),
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
