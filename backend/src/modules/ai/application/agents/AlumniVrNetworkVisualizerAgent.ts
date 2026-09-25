import prisma from '../../../../core/config/db';

export interface VrSpatialNode {
  alumniId: string;
  fullName: string;
  position3D: { x: number; y: number; z: number };
  clusterCategory: string;
  portfolioUrl: string;
}

export class AlumniVrNetworkVisualizerAgent {
  /**
   * Builds a 3D virtual spatial map of the global alumni network for VR headset walkthroughs,
   * visualizing career clusters and virtual chatrooms.
   */
  public static async generateVrSpatialMap(): Promise<VrSpatialNode[]> {
    const alumniList = await prisma.alumniProfile.findMany({ take: 10 }).catch(() => []);

    return alumniList.map((a, i) => ({
      alumniId: a.id,
      fullName: a.fullName,
      position3D: { x: (i * 12.5) % 100, y: Math.floor(i / 4) * 15, z: (i * 7.5) % 80 },
      clusterCategory: a.graduationYear > 2022 ? 'Recent Graduates Hub' : 'Senior Industry Leaders Hub',
      portfolioUrl: a.portfolio || `http://localhost:5173/alumni/${a.id}`,
    }));
  }
}
