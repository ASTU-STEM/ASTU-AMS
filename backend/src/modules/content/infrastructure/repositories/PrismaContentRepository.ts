import { IContentRepository, ContentFilterOptions } from '../../application/ports/IContentRepository';
import { ContentItem, MediaAsset, HomepageConfig } from '../../domain/entities/ContentItem';
import prisma from '../../../../core/config/db';
import { defaultBackendHomepageConfig } from '../defaultHomepageConfig';

export class PrismaContentRepository implements IContentRepository {
  async findMany(filters?: ContentFilterOptions): Promise<{ items: ContentItem[]; total: number }> {
    const where: any = {};
    if (filters?.status && filters.status !== 'all') {
      where.status = filters.status.toUpperCase();
    }
    if (filters?.type && filters.type !== 'all') {
      where.type = filters.type.toUpperCase();
    }
    if (filters?.featured !== undefined) {
      where.featured = filters.featured;
    }
    if (filters?.pinned !== undefined) {
      where.pinned = filters.pinned;
    }
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { excerpt: { contains: filters.search } },
      ];
    }

    const [items, total] = await Promise.all([
      (prisma as any).contentItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: filters?.skip,
        take: filters?.limit,
      }),
      (prisma as any).contentItem.count({ where }),
    ]);

    return {
      items: (items || []).map(this.mapToContentEntity),
      total: total || 0,
    };
  }

  async findById(id: string): Promise<ContentItem | null> {
    const item = await (prisma as any).contentItem.findUnique({ where: { id } });
    return item ? this.mapToContentEntity(item) : null;
  }

  async findBySlug(slug: string): Promise<ContentItem | null> {
    const item = await (prisma as any).contentItem.findUnique({ where: { slug } });
    return item ? this.mapToContentEntity(item) : null;
  }

  async create(data: Partial<ContentItem>): Promise<ContentItem> {
    const payload: any = {
      title: data.title,
      slug: data.slug,
      type: data.type ? (data.type as string).toUpperCase() : 'POST',
      status: data.status ? (data.status as string).toUpperCase() : 'PUBLISHED',
      priority: data.priority ? (data.priority as string).toUpperCase() : 'NORMAL',
      excerpt: data.excerpt || '',
      body: data.body || '',
      featuredImg: data.featuredImg,
      author: data.author || 'Content Manager',
      authorId: data.authorId,
      tags: data.tags || [],
      pinned: data.pinned ?? false,
      featured: data.featured ?? false,
      language: data.language || 'EN',
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : (String(data.status).toUpperCase() === 'PUBLISHED' ? new Date() : undefined),
    };

    const item = await (prisma as any).contentItem.create({ data: payload });
    return this.mapToContentEntity(item);
  }

  async update(id: string, data: Partial<ContentItem>): Promise<ContentItem> {
    const payload: any = { ...data };
    if (data.type) payload.type = (data.type as string).toUpperCase();
    if (data.status) payload.status = (data.status as string).toUpperCase();
    if (data.priority) payload.priority = (data.priority as string).toUpperCase();
    if (data.scheduledFor) payload.scheduledFor = new Date(data.scheduledFor);
    if (data.publishedAt) payload.publishedAt = new Date(data.publishedAt);

    const item = await (prisma as any).contentItem.update({
      where: { id },
      data: payload,
    });
    return this.mapToContentEntity(item);
  }

  async delete(id: string): Promise<void> {
    await (prisma as any).contentItem.delete({ where: { id } });
  }

  async incrementViews(id: string): Promise<void> {
    try {
      const item = await (prisma as any).contentItem.findUnique({ where: { id } });
      if (item) {
        await (prisma as any).contentItem.update({
          where: { id },
          data: { views: (item.views || 0) + 1 },
        });
      }
    } catch { /* ignore view increment error */ }
  }

  async getHomepageConfig(key = 'main'): Promise<HomepageConfig | null> {
    let config = await (prisma as any).homepageConfig.findUnique({ where: { key } });
    if (!config || !config.data) {
      // Auto-bootstrap from canonical backend config
      config = await (prisma as any).homepageConfig.upsert({
        where: { key },
        create: { key, data: defaultBackendHomepageConfig, updatedBy: 'System Bootstrap' },
        update: { data: defaultBackendHomepageConfig, updatedBy: 'System Bootstrap', updatedAt: new Date() },
      });
    } else {
      // Ensure any newly added canonical keys exist
      const mergedData = { ...defaultBackendHomepageConfig, ...config.data };
      config.data = mergedData;
    }
    return new HomepageConfig(
      config.id,
      config.key,
      config.data,
      config.updatedBy || null,
      new Date(config.updatedAt || Date.now()),
      new Date(config.createdAt || Date.now())
    );
  }

  async saveHomepageConfig(key = 'main', data: any, updatedBy = 'CMS Admin'): Promise<HomepageConfig> {
    const merged = { ...defaultBackendHomepageConfig, ...data };
    const config = await (prisma as any).homepageConfig.upsert({
      where: { key },
      create: { key, data: merged, updatedBy },
      update: { data: merged, updatedBy, updatedAt: new Date() },
    });
    return new HomepageConfig(
      config.id,
      config.key,
      config.data,
      config.updatedBy || null,
      new Date(config.updatedAt || Date.now()),
      new Date(config.createdAt || Date.now())
    );
  }

  async saveMediaAsset(data: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    album?: string;
    altText?: string;
    uploaderId?: string;
  }): Promise<MediaAsset> {
    const asset = await (prisma as any).mediaAsset.create({
      data: {
        filename: data.filename,
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: data.size,
        url: data.url,
        album: data.album || 'General',
        altText: data.altText,
        uploaderId: data.uploaderId,
      },
    });
    return new MediaAsset(
      asset.id,
      asset.filename,
      asset.originalName,
      asset.mimeType,
      asset.size,
      asset.url,
      asset.album || null,
      asset.altText || null,
      asset.uploaderId || null,
      new Date(asset.createdAt || Date.now()),
      new Date(asset.updatedAt || Date.now())
    );
  }

  async findMediaAssets(album?: string): Promise<MediaAsset[]> {
    const where: any = {};
    if (album && album !== 'all') {
      where.album = album;
    }
    const assets = await (prisma as any).mediaAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return (assets || []).map(
      (a: any) =>
        new MediaAsset(
          a.id,
          a.filename,
          a.originalName,
          a.mimeType,
          a.size,
          a.url,
          a.album || null,
          a.altText || null,
          a.uploaderId || null,
          new Date(a.createdAt || Date.now()),
          new Date(a.updatedAt || Date.now())
        )
    );
  }

  async deleteMediaAsset(id: string): Promise<void> {
    await (prisma as any).mediaAsset.delete({ where: { id } });
  }

  private mapToContentEntity(item: any): ContentItem {
    return new ContentItem(
      item.id,
      item.title,
      item.slug || null,
      item.type || 'POST',
      item.status || 'PUBLISHED',
      item.priority || 'NORMAL',
      item.excerpt || null,
      item.body || null,
      item.featuredImg || item.image || null,
      item.author || 'Content Manager',
      item.authorId || null,
      item.tags || [],
      Boolean(item.pinned),
      Boolean(item.featured),
      item.language || 'EN',
      item.views || 0,
      item.scheduledFor ? new Date(item.scheduledFor) : null,
      item.publishedAt ? new Date(item.publishedAt) : null,
      new Date(item.createdAt || Date.now()),
      new Date(item.updatedAt || Date.now())
    );
  }
}
