
// Banner sample data with internationalization support
const defaultBanners = [
  {
    id: "hero-main",
    type: "hero",
    isActive: true,
    displayOrder: 1,
    backgroundImage: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    overlayGradient: {
      from: "purple-900/90",
      via: "blue-900/80", 
      to: "indigo-800/90"
    },
    buttonStyle: {
      primary: {
        bgFrom: "yellow-500",
        bgTo: "orange-500",
        textColor: "gray-900"
      },
      secondary: {
        border: "white",
        textColor: "white",
        hoverBg: "white/10"
      }
    },
    statsEnabled: true,
    translations: {
      en: {
        headline: "Master Cross-Border E-Commerce",
        subheadline: "Your Path to Global Success",
        description: "Professional training for professionals and students looking to build successful side businesses in international e-commerce markets.",
        primaryButtonText: "Start Learning",
        secondaryButtonText: "Join Our Community",
        stats: [
          { icon: "Users", value: "5,000+", label: "Active Students" },
          { icon: "BookOpen", value: "50+", label: "Expert Instructors" },
          { icon: "Send", value: "Amazon · eBay · Shopify", label: "Global Markets Coverage" }
        ],
        badges: [
          { color: "green", text: "Certified E-commerce Course" },
          { color: "yellow", text: "Industry Expert Instructors" }
        ]
      },
      zh: {
        headline: "掌握跨境电商技能",
        subheadline: "通向全球成功的路径",
        description: "专业培训，为职场人士和大学生提供建立成功跨境电商副业的技能与知识。亚马逊、eBay、Shopify、AliExpress、Wish等平台跨境销售技能培训。",
        primaryButtonText: "开始学习 - 开启全球销售之旅",
        secondaryButtonText: "加入我们的社区",
        stats: [
          { icon: "Users", value: "5,000+", label: "活跃学员" },
          { icon: "BookOpen", value: "50+", label: "专业讲师" },
          { icon: "Send", value: "Amazon · eBay · Shopify", label: "覆盖全球市场" }
        ],
        badges: [
          { color: "green", text: "跨境电商认证课程" },
          { color: "yellow", text: "行业专家授课" }
        ]
      }
    }
  },
  {
    id: "hero-secondary",
    type: "hero",
    isActive: false,
    displayOrder: 2,
    backgroundImage: "https://images.unsplash.com/photo-1549421263-5ec394a5ad4c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    overlayGradient: {
      from: "blue-800/90",
      via: "indigo-700/85", 
      to: "purple-700/80"
    },
    buttonStyle: {
      primary: {
        bgFrom: "blue-500",
        bgTo: "violet-500",
        textColor: "white"
      },
      secondary: {
        border: "white",
        textColor: "white",
        hoverBg: "white/10"
      }
    },
    statsEnabled: true,
    translations: {
      en: {
        headline: "Expand Your E-commerce Knowledge",
        subheadline: "Learn From Industry Leaders",
        description: "Discover strategies, tools and techniques used by successful e-commerce businesses worldwide. Start your journey today!",
        primaryButtonText: "Explore Courses",
        secondaryButtonText: "Free Resources",
        stats: [
          { icon: "Users", value: "10,000+", label: "Graduates" },
          { icon: "BookOpen", value: "200+", label: "Video Lessons" },
          { icon: "Send", value: "Global Market Access", label: "Worldwide Opportunities" }
        ],
        badges: [
          { color: "blue", text: "Up-to-date Content" },
          { color: "pink", text: "Live Support Included" }
        ]
      },
      zh: {
        headline: "拓展您的电商知识",
        subheadline: "向行业领袖学习",
        description: "发现全球成功电商企业使用的策略、工具和技术。今天开始您的学习之旅！",
        primaryButtonText: "探索课程",
        secondaryButtonText: "免费资源",
        stats: [
          { icon: "Users", value: "10,000+", label: "毕业学员" },
          { icon: "BookOpen", value: "200+", label: "视频课程" },
          { icon: "Send", value: "全球市场准入", label: "全球机会" }
        ],
        badges: [
          { color: "blue", text: "内容持续更新" },
          { color: "pink", text: "包含实时支持" }
        ]
      }
    }
  }
];

// Get all available banners
export const getAllBanners = async () => {
  try {
    // Here you would normally fetch from a database
    // For now we return sample data
    return defaultBanners;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return defaultBanners; // Fallback to sample data
  }
};

// Get active banners
export const getActiveBanners = async () => {
  try {
    // Here you would normally fetch from a database with a filter
    // For now we filter sample data
    return defaultBanners.filter(banner => banner.isActive);
  } catch (error) {
    console.error("Error fetching active banners:", error);
    return defaultBanners.filter(banner => banner.isActive); // Fallback to filtered sample data
  }
};

// Get a specific banner by ID
export const getBannerById = async (id) => {
  try {
    // Here you would normally fetch from a database by ID
    // For now we filter sample data
    const banner = defaultBanners.find(b => b.id === id);
    return banner || defaultBanners[0]; // Return first banner as fallback
  } catch (error) {
    console.error(`Error fetching banner with ID ${id}:`, error);
    return defaultBanners[0]; // Fallback to first sample banner
  }
};

// Get banner translation based on language
export const getBannerTranslation = (banner, language) => {
  if (!banner || !banner.translations) return null;
  
  // Return requested language or fall back to English, then Chinese
  return banner.translations[language] || 
         banner.translations.en || 
         banner.translations.zh || 
         null;
};
