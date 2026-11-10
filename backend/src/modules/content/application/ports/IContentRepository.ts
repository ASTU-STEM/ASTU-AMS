import { ContentItem, MediaAsset, HomepageConfig } from '../../domain/entities/ContentItem';

export interface ContentFilterOptions {
  status?: string;
  type?: string;
  featured?: boolean;
  pinned?: boolean;
  search?: string;
  limit?: number;
  skip?: number;
}

export interface IContentRepository {
  findMany(filters?: ContentFilterOptions): Promise<{ items: ContentItem[]; total: number }>;
  findById(id: string): Promise<ContentItem | null>;
  findBySlug(slug: string): Promise<ContentItem | null>;
  create(data: Partial<ContentItem>): Promise<ContentItem>;
  update(id: string, data: Partial<ContentItem>): Promise<ContentItem>;
  delete(id: string): Promise<void>;
  incrementViews(id: string): Promise<void>;

  getHomepageConfig(key?: string): Promise<HomepageConfig | null>;
  saveHomepageConfig(key: string, data: any, updatedBy?: string): Promise<HomepageConfig>;

  saveMediaAsset(data: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    album?: string;
    altText?: string;
    uploaderId?: string;
  }): Promise<MediaAsset>;
  findMediaAssets(album?: string): Promise<MediaAsset[]>;
  deleteMediaAsset(id: string): Promise<void>;
}
