import prisma from '../../../../core/config/db';

export class ManageSettings {
  async getSettings() {
    const settings = await prisma.systemSetting.findMany();
    // Convert array of {key, value} to a single object
    const settingsObj: Record<string, any> = {};
    for (const setting of settings) {
      settingsObj[setting.key] = setting.value;
    }
    return settingsObj;
  }

  async updateSettings(settingsData: Record<string, any>) {
    // Iterate and upsert each key
    const updatePromises = Object.entries(settingsData).map(([key, value]) => {
      return prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    });

    await prisma.$transaction(updatePromises);
    return await this.getSettings();
  }
}
