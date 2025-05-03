// Default data for system settings components
// This provides fallback data when database queries fail or during development

import { SocialMediaLink, PaymentIcon, LegalDocument, ExchangeRate } from './supabaseUtils';

// Default social media links
export const defaultSocialMediaLinks: SocialMediaLink[] = [
  {
    id: "default-facebook",
    name: "Facebook",
    icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/600px-Facebook_Logo_%282019%29.png",
    url: "https://facebook.com",
    is_active: true,
    display_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "default-instagram",
    name: "Instagram",
    icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/132px-Instagram_logo_2016.svg.png",
    url: "https://instagram.com",
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "default-twitter",
    name: "Twitter",
    icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/X_logo_2023.png/600px-X_logo_2023.png",
    url: "https://twitter.com",
    is_active: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "default-linkedin",
    name: "LinkedIn",
    icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/600px-LinkedIn_logo_initials.png",
    url: "https://linkedin.com",
    is_active: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Default payment icons
export const defaultPaymentIcons: PaymentIcon[] = [
  {
    id: "default-visa",
    name: "Visa",
    icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png",
    is_active: true,
    display_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "default-mastercard",
    name: "MasterCard",
    icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png",
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "default-paypal",
    name: "PayPal",
    icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1280px-PayPal.svg.png",
    is_active: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "default-applepay",
    name: "Apple Pay",
    icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Apple_Pay_logo.svg/1280px-Apple_Pay_logo.svg.png",
    is_active: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "default-alipay",
    name: "Alipay",
    icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Alipay_logo.svg/1280px-Alipay_logo.svg.png",
    is_active: true,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Default legal documents with sample content
export const defaultLegalDocuments: Record<string, LegalDocument> = {
  "privacy-policy": {
    id: "default-privacy-policy",
    slug: "privacy-policy",
    title: "隐私政策",
    content: "# 隐私政策\n\n本隐私政策描述了我们如何收集、使用和披露您的个人信息。\n\n## 信息收集\n\n我们收集的信息可能包括：\n\n- 基本身份信息（姓名、���子邮件地址等）\n- 设备和浏览器信息\n- 使用数据和活动信息\n\n## 信息使用\n\n我们使用收集的信息：\n\n- 提供和维护服务\n- 处理支付和发送通知\n- 提高我们的服务质量\n\n## 信息共享\n\n我们不会出售您的个人信息。我们可能会与以下方共享信息：\n\n- 服务提供商\n- 商业合作伙伴\n- 法律要求的情况\n\n## 联系我们\n\n如果您对我们的隐私政策有任何疑问，请联系我们。\n\n最后更新日期：2025年5月3日",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  "terms-of-use": {
    id: "default-terms-of-use",
    slug: "terms-of-use",
    title: "使用条款",
    content: "# 使用条款\n\n欢迎使用我们的服务。通过访问或使用我们的网站，您同意受这些条款的约束。\n\n## 服务使用\n\n您同意：\n\n- 仅将服务用于合法目的\n- 不违反任何适用的法律法规\n- 不侵犯他人的知识产权\n\n## 账户责任\n\n如果您创建账户，您负责：\n\n- 保持密码安全\n- 限制账户访问权限\n- 账户下的所有活动\n\n## 内容所有权\n\n我们平台上的所有内容归我们或内容创建者所有，受版权法保护。\n\n## 服务变更\n\n我们保留随时修改或终止服务的权利，恕不另行通知。\n\n最后更新日期：2025年5月3日",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  "cookie-policy": {
    id: "default-cookie-policy",
    slug: "cookie-policy",
    title: "Cookie政策",
    content: "# Cookie政策\n\n本Cookie政策解释了我们如何使用Cookie和类似技术。\n\n## 什么是Cookie\n\nCookie是放置在您设备上的小型文本文件，用于记住用户偏好和其他信息。\n\n## 我们使用的Cookie类型\n\n- 必要Cookie：网站基本功能所需\n- 功能Cookie：记住您的偏好设置\n- 分析Cookie：帮助我们了解用户如何使用网站\n- 营销Cookie：用于向您展示相关广告\n\n## Cookie管理\n\n大多数网络浏览器允许您控制Cookie。您可以：\n\n- 删除现有Cookie\n- 阻止未来的Cookie\n- 设置Cookie通知\n\n## 联系我们\n\n如果您对我们的Cookie政策有任何疑问，请联系我们。\n\n最后更新日期：2025年5月3日",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  "registration-agreement": {
    id: "default-registration-agreement",
    slug: "registration-agreement",
    title: "注册协议",
    content: "# 注册协议\n\n通过注册账户，您同意以下条款和条件。\n\n## 注册要求\n\n- 您必须提供准确的个人信息\n- 您必须至少年满18岁\n- 每人只能注册一个账户\n\n## 账户安全\n\n您负责维护账户安全，包括：\n\n- 创建强密码\n- 定期更新密码\n- 不与他人共享账户\n\n## 账户终止\n\n我们可能会在以下情况终止账户：\n\n- 违反使用条款\n- 提供虚假信息\n- 长期不活动\n\n## 修改协议\n\n我们可能会不时修改本协议，修改后会通知您。继续使用账户即表示您接受修改后的条款。\n\n最后更新日期：2025年5月3日",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  "data-transfer-terms": {
    id: "default-data-transfer-terms",
    slug: "data-transfer-terms",
    title: "跨境数据传输条款",
    content: "# 跨境数据传输条款\n\n本条款规定了我们如何处理跨境数据传输。\n\n## 数据收集和传输\n\n我们可能将您的个人数据从您所在国家/地区传输到其他国家/地区，包括：\n\n- 公司总部所在地\n- 服务器和数据中心所在地\n- 合作伙伴和供应商所在地\n\n## 数据保护措施\n\n我们采取以下措施保护您的跨境数据：\n\n- 加密传输\n- 数据访问控制\n- 与第三方签订数据处理协议\n\n## 国际框架\n\n我们依据以下框架传输数据：\n\n- 标准合同条款\n- 隐私盾框架\n- 适当的同意机制\n\n## 您的权利\n\n您有权了解您的数据如何被传输和处理。如需了解更多信息，请联系我们的隐私团队。\n\n最后更新日期：2025年5月3日",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
};

// Default exchange rates
export const defaultExchangeRates = [
  {
    id: 'default-1',
    rate: 7.23, // CNY to USD
    from_currency: 'CNY',
    to_currency: 'USD',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'default-2',
    rate: 7.20, // Historical rate example
    from_currency: 'CNY',
    to_currency: 'USD',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 86400000).toISOString()
  }
];

// Default company/site information
export const defaultSiteSettings = {
  id: "default-settings",
  company_name: "SecondRise",
  company_full_name: "Mandarin (Hong Kong) International Limited",
  company_registration_number: "HK29387392",
  company_address: "Suite 1216, 12/F, Tower B, Manulife Financial Centre, 223-231 Wai Yip St, Kwun Tong, Hong Kong",
  copyright_text: `© ${new Date().getFullYear()} SecondRise. Mandarin (Hong Kong) International Limited. 版权所有`,
  site_name: "SecondRise 官方网站",
  site_description: "打造您的职业未来，从这里开始。SecondRise提供专业的在线课程，助您掌握最前沿的技能。",
  contact_email: "support@secondrise.com",
  support_phone: "+85298211389",
  logo_url: "https://placehold.co/400x100/252525/FFFFFF/png?text=SecondRise",
  enable_registration: true,
  maintenance_mode: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Default contact methods
export const defaultContactMethods = [
  {
    id: "default-email",
    type: "email",
    label: "联系邮箱",
    value: "support@secondrise.com",
    is_active: true,
    display_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "default-phone",
    type: "phone",
    label: "客服电话",
    value: "+85298211389",
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "default-whatsapp",
    type: "whatsapp",
    label: "WhatsApp",
    value: "+85298211389",
    is_active: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "default-address",
    type: "address",
    label: "公司地址",
    value: "Suite 1216, 12/F, Tower B, Manulife Financial Centre, 223-231 Wai Yip St, Kwun Tong, Hong Kong",
    is_active: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Default FAQ data with multilingual support
export const defaultFaqs = [
  {
    id: 1,
    category: "account",
    display_order: 1,
    is_featured: true,
    is_active: true,
    question: "如何更改我的账户密码？",
    answer: "您可以在个人资料设置中找到\"安全\"选项，点击\"更改密码\"按钮，然后按照提示操作即可修改密码。请确保您的新密码足够强大且不容易被猜到。",
    language_code: "zh"
  },
  {
    id: 1,
    category: "account",
    display_order: 1,
    is_featured: true,
    is_active: true,
    question: "How do I change my account password?",
    answer: "You can find the 'Security' option in your profile settings, click the 'Change Password' button, and follow the prompts to modify your password. Please ensure your new password is strong and not easily guessable.",
    language_code: "en"
  },
  {
    id: 2,
    category: "account",
    display_order: 2,
    is_featured: false,
    is_active: true,
    question: "如何更新我的个人资料信息？",
    answer: "登录后，点击右上角您的头像，选择\"个人资料\"，然后您可以编辑您的个人信息，包括姓名、联系方式和个人简介等。完成后，点击\"保存更改\"按钮。",
    language_code: "zh"
  },
  {
    id: 2,
    category: "account",
    display_order: 2,
    is_featured: false,
    is_active: true,
    question: "How do I update my profile information?",
    answer: "After logging in, click on your avatar in the top right corner, select 'Profile', and then you can edit your personal information including name, contact details, and bio. Click the 'Save Changes' button when done.",
    language_code: "en"
  },
  {
    id: 3,
    category: "course",
    display_order: 1,
    is_featured: true,
    is_active: true,
    question: "我可以在不同设备上访问我购买的课程吗？",
    answer: "是的，您购买的所有课程都可以在任何设备上通过您的账户访问。我们的平台支持电脑、平板和手机等多种设备，让您随时随地学习。",
    language_code: "zh"
  },
  {
    id: 3,
    category: "course",
    display_order: 1,
    is_featured: true,
    is_active: true,
    question: "Can I access my purchased courses on different devices?",
    answer: "Yes, all your purchased courses can be accessed on any device through your account. Our platform supports multiple devices including computers, tablets, and phones, allowing you to learn anytime, anywhere.",
    language_code: "en"
  },
  {
    id: 4,
    category: "course",
    display_order: 2,
    is_featured: true,
    is_active: true,
    question: "课程内容会定期更新吗？",
    answer: "是的，我们的导师会定期更新课程内容，确保您学习的是最新、最相关的知识。更新通常包括新的讲座视频、补充材料和行业最新趋势分析等。",
    language_code: "zh"
  },
  {
    id: 4,
    category: "course",
    display_order: 2,
    is_featured: true,
    is_active: true,
    question: "Do course contents get updated regularly?",
    answer: "Yes, our instructors regularly update course content to ensure you're learning the most current and relevant information. Updates typically include new lecture videos, supplementary materials, and analysis of the latest industry trends.",
    language_code: "en"
  },
  {
    id: 5,
    category: "payment",
    display_order: 1,
    is_featured: true,
    is_active: true,
    question: "你们支持哪些支付方式？",
    answer: "我们支持多种支付方式，包括主要信用卡（Visa、MasterCard、American Express）、PayPal、微信支付和支付宝。在某些地区，我们还支持银行转账和其他本地支付方式。",
    language_code: "zh"
  },
  {
    id: 5,
    category: "payment",
    display_order: 1,
    is_featured: true,
    is_active: true,
    question: "What payment methods do you support?",
    answer: "We support various payment methods including major credit cards (Visa, MasterCard, American Express), PayPal, WeChat Pay, and Alipay. In certain regions, we also support bank transfers and other local payment options.",
    language_code: "en"
  },
  {
    id: 6,
    category: "payment",
    display_order: 2,
    is_featured: false,
    is_active: true,
    question: "如果我不满意课程，可以退款吗？",
    answer: "是的，我们提供30天退款保证。如果您在购买课程后的30天内不满意，可以申请全额退款。请联系我们的客服团队，他��将指导您完成退款流程。",
    language_code: "zh"
  },
  {
    id: 6,
    category: "payment",
    display_order: 2,
    is_featured: false,
    is_active: true,
    question: "Can I get a refund if I'm not satisfied with a course?",
    answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with a course within 30 days of purchase, you can request a full refund. Please contact our customer service team, and they will guide you through the refund process.",
    language_code: "en"
  }
];

// Helper function to transform default FAQs by language
export function getDefaultFaqsByLanguage(languageCode: string) {
  return defaultFaqs
    .filter(faq => faq.language_code === languageCode)
    .map(faq => ({
      id: faq.id,
      category: faq.category,
      display_order: faq.display_order,
      is_featured: faq.is_featured,
      is_active: faq.is_active,
      question: faq.question,
      answer: faq.answer,
      language_code: faq.language_code
    }));
}

// Helper function to get featured FAQs
export function getDefaultFeaturedFaqs(languageCode: string, limit: number = 4) {
  return defaultFaqs
    .filter(faq => faq.language_code === languageCode && faq.is_featured)
    .slice(0, limit)
    .map(faq => ({
      id: faq.id,
      category: faq.category,
      display_order: faq.display_order,
      is_featured: faq.is_featured,
      is_active: faq.is_active,
      question: faq.question,
      answer: faq.answer,
      language_code: faq.language_code
    }));
}
