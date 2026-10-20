import { IContentRepository, ContentFilterOptions } from '../ports/IContentRepository';
import { ContentItem, MediaAsset, HomepageConfig } from '../../domain/entities/ContentItem';
import { ContentNotFoundError, MediaAssetNotFoundError } from '../../domain/errors/ContentErrors';

export class GetContentItems {
  constructor(private readonly repo: IContentRepository) {}

  async execute(filters?: ContentFilterOptions): Promise<{ items: ContentItem[]; total: number }> {
    return this.repo.findMany(filters);
  }
}

export class GetContentItemByIdOrSlug {
  constructor(private readonly repo: IContentRepository) {}

  async execute(idOrSlug: string, incrementView = false): Promise<ContentItem> {
    let item = await this.repo.findById(idOrSlug);
    if (!item) {
      item = await this.repo.findBySlug(idOrSlug);
    }
    if (!item) {
      throw new ContentNotFoundError();
    }
    if (incrementView) {
      await this.repo.incrementViews(item.id);
    }
    return item;
  }
}

export class CreateContentItem {
  constructor(private readonly repo: IContentRepository) {}

  async execute(data: Partial<ContentItem>): Promise<ContentItem> {
    const slug = data.slug || (data.title ? data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined);
    return this.repo.create({ ...data, slug });
  }
}

export class UpdateContentItem {
  constructor(private readonly repo: IContentRepository) {}

  async execute(id: string, data: Partial<ContentItem>): Promise<ContentItem> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new ContentNotFoundError();
    }
    return this.repo.update(id, data);
  }
}

export class DeleteContentItem {
  constructor(private readonly repo: IContentRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new ContentNotFoundError();
    }
    await this.repo.delete(id);
  }
}

export class GetHomepageConfigUseCase {
  constructor(private readonly repo: IContentRepository) {}

  async execute(key = 'main'): Promise<any> {
    const config = await this.repo.getHomepageConfig(key);
    return config ? config.data : null;
  }
}

export class SaveHomepageConfigUseCase {
  constructor(private readonly repo: IContentRepository) {}

  async execute(key = 'main', data: any, updatedBy = 'CMS Admin'): Promise<HomepageConfig> {
    const existing = await this.repo.getHomepageConfig(key);
    const existingData = existing && existing.data ? existing.data : {};
    const mergedData = { ...existingData, ...data };
    return this.repo.saveHomepageConfig(key, mergedData, updatedBy);
  }
}

export class SaveMediaAssetUseCase {
  constructor(private readonly repo: IContentRepository) {}

  async execute(data: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    album?: string;
    altText?: string;
    uploaderId?: string;
  }): Promise<MediaAsset> {
    return this.repo.saveMediaAsset(data);
  }
}

export class GetMediaAssetsUseCase {
  constructor(private readonly repo: IContentRepository) {}

  async execute(album?: string): Promise<MediaAsset[]> {
    return this.repo.findMediaAssets(album);
  }
}

export class DeleteMediaAssetUseCase {
  constructor(private readonly repo: IContentRepository) {}

  async execute(id: string): Promise<void> {
    await this.repo.deleteMediaAsset(id);
  }
}
