import prisma from '../../../../core/config/db';

export const DEFAULT_SETTINGS = {
  general: {
    universityName: 'Adama Science and Technology University',
    abbreviation: 'ASTU',
    website: 'https://astu.edu.et',
    contactEmail: 'admin@astu.edu.et',
    address: 'Adama, Ethiopia',
    academicYear: '2024-25',
    language: 'English',
    timezone: 'Africa/Addis_Ababa',
    dateFormat: 'DD/MM/YYYY',
    phoneNumber: '+251 22 110 0001',
    supportEmail: 'support@astu.edu.et',
    postalCode: 'P.O. Box 1888, Adama, Ethiopia',
    portalTitle: 'Alumni Management System',
  },
  get email() {
    return {
      smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: String(process.env.SMTP_PORT || '465'),
      smtpUser: process.env.SMTP_USER || 'astustun@gmail.com',
      smtpPassword: process.env.SMTP_PASS || 'hddh dzbs kalr uebf',
      fromName: 'ASTU Alumni Management System',
      fromEmail: process.env.SMTP_FROM || process.env.SMTP_USER || 'astustun@gmail.com',
    };
  },
  get integrations() {
    return {
      regApiToggle: true,
      smsToggle: true,
      googleToggle: false,
      linkedinToggle: true,
      openRouterToggle: true,
      chapaToggle: true,
      diditToggle: true,

      regApiEndpoint: process.env.REGISTRAR_API_URL || 'https://registrar.astu.edu.et/api/v1',
      regApiKey: process.env.REGISTRAR_API_KEY || 'astu_erp_live_sec_key',

      openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
      openRouterModel: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1:free',

      chapaSecretKey: process.env.CHAPA_SECRET_KEY || 'CHAPA_TEST_PRIV_UwuQ_bQaixYr3gDHWSXUzeYJIwUFbNe83EZLUsCf',
      chapaPublicKey: process.env.CHAPA_PUBLIC_KEY || 'CHAPA_TEST_PUB_QtTbDIJUG_SdCp8zYvikvL3NyAcrALjfVKeO7K3e',

      diditApiKey: process.env.DIDIT_API_KEY || 'fNZOouKi6YdbExgG-X2_OY7_lzjTCCl9Gwie3203Qrc',

      smsGatewayUser: process.env.SMS_GATEWAY_USER || 'astu_sms',
      smsGatewayPass: process.env.SMS_GATEWAY_PASS || 'password',

      googleClientId: process.env.GOOGLE_CLIENT_ID || 'google-client-id.apps.googleusercontent.com',
      linkedinClientId: process.env.LINKEDIN_CLIENT_ID || 'linkedin-client-id',
    };
  },
  appearance: {
    primaryColor: '#003580',
    accentColor: '#E8A020',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH',
  },
};

export class ManageSettings {
  async getSettings() {
    let settings = await prisma.systemSetting.findMany().catch(() => []);
    
    if (!settings || settings.length === 0) {
      // Auto-seed initial default settings into database
      const initial = {
        general: DEFAULT_SETTINGS.general,
        email: DEFAULT_SETTINGS.email,
        integrations: DEFAULT_SETTINGS.integrations,
        appearance: DEFAULT_SETTINGS.appearance,
      };
      for (const [key, value] of Object.entries(initial)) {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }).catch(() => {});
      }
      settings = await prisma.systemSetting.findMany().catch(() => []);
    }

    const settingsObj: Record<string, any> = {
      general: { ...DEFAULT_SETTINGS.general },
      email: { ...DEFAULT_SETTINGS.email },
      integrations: { ...DEFAULT_SETTINGS.integrations },
      appearance: { ...DEFAULT_SETTINGS.appearance },
    };

    for (const setting of settings) {
      settingsObj[setting.key] = typeof setting.value === 'object' && setting.value !== null
        ? { ...(settingsObj[setting.key] || {}), ...setting.value }
        : setting.value;
    }

    // Auto-migrate portalTitle if set to legacy 'ASTU Alumni Management System'
    if (settingsObj.general && (settingsObj.general.portalTitle === 'ASTU Alumni Management System' || !settingsObj.general.portalTitle)) {
      settingsObj.general.portalTitle = 'Alumni Management System';
      await prisma.systemSetting.upsert({
        where: { key: 'general' },
        update: { value: settingsObj.general },
        create: { key: 'general', value: settingsObj.general },
      }).catch(() => {});
    }

    // Auto-migrate any existing DB records containing old placeholder mock strings to real .env values
    const envEmail = DEFAULT_SETTINGS.email;
    if (settingsObj.email) {
      const e = settingsObj.email;
      if (
        !e.smtpHost || e.smtpHost.includes('astu.edu.et') ||
        !e.smtpUser || e.smtpUser.includes('mailer@astu.edu.et') ||
        !e.fromEmail || e.fromEmail.includes('noreply@astu.edu.et')
      ) {
        settingsObj.email = {
          smtpHost: envEmail.smtpHost,
          smtpPort: envEmail.smtpPort,
          smtpUser: envEmail.smtpUser,
          smtpPassword: envEmail.smtpPassword,
          fromName: e.fromName || envEmail.fromName,
          fromEmail: envEmail.fromEmail,
        };
        await prisma.systemSetting.upsert({
          where: { key: 'email' },
          update: { value: settingsObj.email },
          create: { key: 'email', value: settingsObj.email },
        }).catch(() => {});
      }
    }

    const envIntegrations = DEFAULT_SETTINGS.integrations;
    if (settingsObj.integrations) {
      const i = settingsObj.integrations;
      if (
        !i.regApiEndpoint || i.regApiEndpoint.includes('api.astu.edu.et') ||
        i.regApiKey === 'astu_erp_xxxxx' ||
        !i.openRouterApiKey
      ) {
        settingsObj.integrations = {
          ...envIntegrations,
          ...i,
          regApiEndpoint: envIntegrations.regApiEndpoint,
          regApiKey: i.regApiKey && i.regApiKey !== 'astu_erp_xxxxx' ? i.regApiKey : envIntegrations.regApiKey,
          openRouterApiKey: i.openRouterApiKey || envIntegrations.openRouterApiKey,
          openRouterModel: i.openRouterModel || envIntegrations.openRouterModel,
          chapaSecretKey: i.chapaSecretKey || envIntegrations.chapaSecretKey,
          chapaPublicKey: i.chapaPublicKey || envIntegrations.chapaPublicKey,
          diditApiKey: i.diditApiKey || envIntegrations.diditApiKey,
        };
        await prisma.systemSetting.upsert({
          where: { key: 'integrations' },
          update: { value: settingsObj.integrations },
          create: { key: 'integrations', value: settingsObj.integrations },
        }).catch(() => {});
      }
    }

    return settingsObj;
  }

  async updateSettings(settingsData: Record<string, any>) {
    await prisma.$transaction(async (tx) => {
      for (const [key, value] of Object.entries(settingsData)) {
        await tx.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    });

    return await this.getSettings();
  }
}

