const pipedriveOptions = {
  technology: [
    { id: 41, label: 'Ember JS' },
    { id: 42, label: 'Ruby on Rails' },
    { id: 43, label: 'Node (+NestJS)' },
    { id: 44, label: 'React' },
    { id: 45, label: 'React Native' },
    { id: 72, label: 'Other', labelPL: 'Inne' },
    { id: 308, label: "I'm not sure", labelPL: 'Nie jestem pewien' },
  ],
  services: [
    { id: 46, label: 'QA', labelPL: 'Testowanie (QA)' },
    { id: 47, label: 'Backend development' },
    { id: 48, label: 'Frontend development' },
    { id: 49, label: 'Mobile development', labelPL: 'Aplikacje mobilne' },
    { id: 50, label: 'UX/UI' },
    { id: 51, label: 'Business Analysis' },
    { id: 52, label: 'Process Facilitation' },
    { id: 53, label: 'DevOps' },
    {
      id: 57,
      label: 'E-learning management system',
      labelPL: 'System zarządzania e-learningiem',
      customKey: 'ccdefef6d869c6eca32383a82f08794b314994d4',
    },
    {
      id: 58,
      label: 'FinTech development',
      labelPL: 'Oprogramowanie finansowe (FinTech)',
      customKey: 'ccdefef6d869c6eca32383a82f08794b314994d4',
    },
    {
      id: 59,
      label: 'HealthCare development',
      labelPL: 'Oprogramowanie medyczne',
      customKey: 'ccdefef6d869c6eca32383a82f08794b314994d4',
    },
    {
      id: 56,
      label: 'HRM development',
      labelPL: 'Oprogramowanie HRM',
      customKey: 'ccdefef6d869c6eca32383a82f08794b314994d4',
    },
    {
      id: 61,
      label: 'Colaborate development',
      customKey: 'ccdefef6d869c6eca32383a82f08794b314994d4',
    },
  ],
  serviceType: [
    { id: 54, label: 'IT Staff augmentation', labelPL: 'Wzmocnienie zespołu IT' },
    { id: 55, label: 'Dedicated Development Team', labelPL: 'Dedykowany zespół programistów' },
  ],
};

const customFieldKeys = {
  message: '00be3a73060a78f049c8fa820048d01390560f20',
  serviceType: 'd1b2a3593492afaa6100299dc9ead6b7d4033281',
  services: 'b8d111942d197c30158837cf6b1bfad1c7a2b39a',
  technology: '879bface1482212eb74e89233a1517e1f8fdec13',
  formPath: '9739f3c5dcad8564256d9bf13836bbda5ee87fb3',
  gtmCampaign: '7aa364c6d2ccfe48c940e63a6073cdb6ee789c65',
  gtmSource: 'b85ab7da73112ac887081a34372d3c2f41cccc96',
  gtmMedium: '0fc0b65de4abe3945ea109db848f1cf49720a8ca',
  gtmTimeToConversion: '329c82f443eb731fb607497002a65f93b1c60abd',
  gtmUserId: '13ccbd67619cfba5e0d2c53c47956b076122d462',
  gclid: 'cda352ea7da65eac338b9225a1acdb91a02a3ef2',
  referrer: '70d1d0d1c87762239221fe27706d0e7f94f791f0',
};

const marketingCustomFields = {
  'Lead magnet CTO': {
    key: 'a6bdae9743d847bd24804a6dda3ebc06de41c233',
    subscribe: 331,
    unsubscribe: 336,
  },
  'Lead magnet non-technical BP': {
    key: '991411a7eca4ded2d8f22d041c2405ab185274ca',
    subscribe: 332,
    unsubscribe: 335,
  },
  'Form submission contacts': {
    key: '6bd138ac3222928121e7e0b8b4f09a15a7212f8a',
    subscribe: 333,
    unsubscribe: 334,
  },
};

module.exports = {
  pipedriveOptions,
  customFieldKeys,
  marketingCustomFields,
};
