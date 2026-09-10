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
} from '../../../application/use-cases/ManageContent';
import { IContentRepository } from '../../../application/ports/IContentRepository';
import { ContentItem, MediaAsset, HomepageConfig } from '../../../domain/entities/ContentItem';
import { ContentNotFoundError } from '../../../domain/errors/ContentErrors';

describe('ManageContent Use Cases', () => {
  let mockRepo: jest.Mocked<IContentRepository>;

  const mockContent = new ContentItem(
    'item1',
    'ASTU Science & Technology Fair 2026',
    'astu-science-technology-fair-2026',
    'POST',
    'PUBLISHED',
    'HIGH',
    'Annual fair featuring student innovations',
    'Full body text describing the engineering exhibits',
    'https://astu.edu.et/uploads/fair.jpg',
    'Dr. Bekele',
    'user1',
    ['STEM', 'Fair', 'Research'],
    true,
    true,
    'en',
    150,
    null,
    new Date('2026-03-01'),
    new Date('2026-01-01'),
    new Date('2026-03-01')
  );

  const mockMedia = new MediaAsset(
    'media1',
    'campus-drone-shot.jpg',
    'original-drone.jpg',
    'image/jpeg',
    204850,
    '/uploads/cms/campus-drone-shot.jpg',
    'Campus',
    'ASTU Main Campus aerial view',
    'user1',
    new Date(),
    new Date()
  );

  const mockConfig = new HomepageConfig(
    'cfg1',
    'main',
    {
      heroSlides: [{ id: '1', title: 'Welcome to ASTU Alumni Network' }],
      partners: [{ id: '1', name: 'Tech Ethiopia' }],
    },
    'CMS Admin',
    new Date(),
    new Date()
  );

  beforeEach(() => {
    mockRepo = {
      findMany: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      incrementViews: jest.fn(),
      getHomepageConfig: jest.fn(),
      saveHomepageConfig: jest.fn(),
      saveMediaAsset: jest.fn(),
      findMediaAssets: jest.fn(),
      deleteMediaAsset: jest.fn(),
    };
  });

  describe('GetContentItems', () => {
    it('should return list of content items and total count', async () => {
      mockRepo.findMany.mockResolvedValue({ items: [mockContent], total: 1 });
      const useCase = new GetContentItems(mockRepo);
      const result = await useCase.execute({ status: 'PUBLISHED' });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.items[0].title).toBe('ASTU Science & Technology Fair 2026');
      expect(mockRepo.findMany).toHaveBeenCalledWith({ status: 'PUBLISHED' });
    });
  });

  describe('GetContentItemByIdOrSlug', () => {
    it('should return item by id', async () => {
      mockRepo.findById.mockResolvedValue(mockContent);
      const useCase = new GetContentItemByIdOrSlug(mockRepo);
      const result = await useCase.execute('item1');

      expect(result).toEqual(mockContent);
      expect(mockRepo.findById).toHaveBeenCalledWith('item1');
      expect(mockRepo.findBySlug).not.toHaveBeenCalled();
    });

    it('should find item by slug when id lookup returns null', async () => {
      mockRepo.findById.mockResolvedValue(null);
      mockRepo.findBySlug.mockResolvedValue(mockContent);
      const useCase = new GetContentItemByIdOrSlug(mockRepo);
      const result = await useCase.execute('astu-science-technology-fair-2026');

      expect(result).toEqual(mockContent);
      expect(mockRepo.findBySlug).toHaveBeenCalledWith('astu-science-technology-fair-2026');
    });

    it('should increment view count when incrementView flag is true', async () => {
      mockRepo.findById.mockResolvedValue(mockContent);
      const useCase = new GetContentItemByIdOrSlug(mockRepo);
      await useCase.execute('item1', true);

      expect(mockRepo.incrementViews).toHaveBeenCalledWith('item1');
    });

    it('should throw ContentNotFoundError if item is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      mockRepo.findBySlug.mockResolvedValue(null);
      const useCase = new GetContentItemByIdOrSlug(mockRepo);

      await expect(useCase.execute('non-existent')).rejects.toThrow(ContentNotFoundError);
    });
  });

  describe('CreateContentItem', () => {
    it('should create content item with automatically generated slug if not provided', async () => {
      mockRepo.create.mockResolvedValue(mockContent);
      const useCase = new CreateContentItem(mockRepo);

      const input = {
        title: 'ASTU Science & Technology Fair 2026',
        body: 'Full content',
      };

      const result = await useCase.execute(input as any);
      expect(result).toEqual(mockContent);
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'astu-science-technology-fair-2026',
        })
      );
    });

    it('should preserve explicit custom slug if provided', async () => {
      mockRepo.create.mockResolvedValue(mockContent);
      const useCase = new CreateContentItem(mockRepo);

      await useCase.execute({
        title: 'Custom Fair',
        slug: 'custom-fair-slug',
      } as any);

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'custom-fair-slug',
        })
      );
    });
  });

  describe('UpdateContentItem', () => {
    it('should update existing content item', async () => {
      mockRepo.findById.mockResolvedValue(mockContent);
      const updatedMock = { ...mockContent, title: 'Updated Title' } as ContentItem;
      mockRepo.update.mockResolvedValue(updatedMock);

      const useCase = new UpdateContentItem(mockRepo);
      const result = await useCase.execute('item1', { title: 'Updated Title' });

      expect(result.title).toBe('Updated Title');
      expect(mockRepo.update).toHaveBeenCalledWith('item1', { title: 'Updated Title' });
    });

    it('should throw ContentNotFoundError if updating non-existent item', async () => {
      mockRepo.findById.mockResolvedValue(null);
      const useCase = new UpdateContentItem(mockRepo);

      await expect(useCase.execute('missing-id', { title: 'New' })).rejects.toThrow(ContentNotFoundError);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('DeleteContentItem', () => {
    it('should delete existing content item', async () => {
      mockRepo.findById.mockResolvedValue(mockContent);
      const useCase = new DeleteContentItem(mockRepo);

      await useCase.execute('item1');
      expect(mockRepo.delete).toHaveBeenCalledWith('item1');
    });

    it('should throw ContentNotFoundError if deleting non-existent item', async () => {
      mockRepo.findById.mockResolvedValue(null);
      const useCase = new DeleteContentItem(mockRepo);

      await expect(useCase.execute('missing-id')).rejects.toThrow(ContentNotFoundError);
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('HomepageConfig Use Cases', () => {
    it('should get homepage config data', async () => {
      mockRepo.getHomepageConfig.mockResolvedValue(mockConfig);
      const useCase = new GetHomepageConfigUseCase(mockRepo);
      const result = await useCase.execute('main');

      expect(result).toEqual(mockConfig.data);
      expect(mockRepo.getHomepageConfig).toHaveBeenCalledWith('main');
    });

    it('should return null when homepage config is not found', async () => {
      mockRepo.getHomepageConfig.mockResolvedValue(null);
      const useCase = new GetHomepageConfigUseCase(mockRepo);
      const result = await useCase.execute('non-existent');

      expect(result).toBeNull();
    });

    it('should save homepage config data', async () => {
      mockRepo.saveHomepageConfig.mockResolvedValue(mockConfig);
      const useCase = new SaveHomepageConfigUseCase(mockRepo);

      const result = await useCase.execute('main', mockConfig.data, 'SuperAdmin');
      expect(result).toEqual(mockConfig);
      expect(mockRepo.saveHomepageConfig).toHaveBeenCalledWith('main', mockConfig.data, 'SuperAdmin');
    });
  });

  describe('MediaAsset Use Cases', () => {
    it('should save media asset metadata', async () => {
      mockRepo.saveMediaAsset.mockResolvedValue(mockMedia);
      const useCase = new SaveMediaAssetUseCase(mockRepo);

      const result = await useCase.execute({
        filename: 'campus-drone-shot.jpg',
        originalName: 'original-drone.jpg',
        mimeType: 'image/jpeg',
        size: 204850,
        url: '/uploads/cms/campus-drone-shot.jpg',
        album: 'Campus',
      });

      expect(result).toEqual(mockMedia);
      expect(mockRepo.saveMediaAsset).toHaveBeenCalled();
    });

    it('should get all media assets with optional album filter', async () => {
      mockRepo.findMediaAssets.mockResolvedValue([mockMedia]);
      const useCase = new GetMediaAssetsUseCase(mockRepo);

      const result = await useCase.execute('Campus');
      expect(result).toHaveLength(1);
      expect(mockRepo.findMediaAssets).toHaveBeenCalledWith('Campus');
    });

    it('should delete media asset by id', async () => {
      const useCase = new DeleteMediaAssetUseCase(mockRepo);
      await useCase.execute('media1');

      expect(mockRepo.deleteMediaAsset).toHaveBeenCalledWith('media1');
    });
  });
});
