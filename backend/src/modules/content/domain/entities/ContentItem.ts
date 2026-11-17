export type ContentType = 'POST' | 'PAGE' | 'ANNOUNCEMENT' | 'GALLERY' | 'EVENT' | 'TEMPLATE';
export type ContentStatus = 'DRAFT' | 'NEEDS_REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
export type ContentPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export class ContentItem {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly slug: string | null,
    public readonly type: ContentType,
    public readonly status: ContentStatus,
    public readonly priority: ContentPriority,
    public readonly excerpt: string | null,
    public readonly body: string | null,
    public readonly featuredImg: string | null,
    public readonly author: string,
    public readonly authorId: string | null,
    public readonly tags: string[],
    public readonly pinned: boolean,
    public readonly featured: boolean,
    public readonly language: string,
    public readonly views: number,
    public readonly scheduledFor: Date | null,
    public readonly publishedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}

export class MediaAsset {
  constructor(
    public readonly id: string,
    public readonly filename: string,
    public readonly originalName: string,
    public readonly mimeType: string,
    public readonly size: number,
    public readonly url: string,
    public readonly album: string | null,
    public readonly altText: string | null,
    public readonly uploaderId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}

export class HomepageConfig {
  constructor(
    public readonly id: string,
    public readonly key: string,
    public readonly data: any,
    public readonly updatedBy: string | null,
    public readonly updatedAt: Date,
    public readonly createdAt: Date
  ) {}
}
