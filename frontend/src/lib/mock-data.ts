const initialMockData = {
  portfolios: [
    {
      id: "mock-portfolio-1",
      user_id: "mock-user",
      title: "横浜の美味しい中華",
      share_id: "yokohama-chuka-123",
      is_public: true,
      created_at: new Date().toISOString(),
      place_count: 2,
    },
    {
      id: "mock-portfolio-2",
      user_id: "mock-user",
      title: "渋谷の隠れ家カフェ",
      share_id: "shibuya-cafe-456",
      is_public: true,
      created_at: new Date().toISOString(),
      place_count: 1,
    },
  ],
  places: [
    {
      id: "mock-place-1",
      portfolio_id: "mock-portfolio-1",
      name: "萬珍樓",
      tabelog_url: "https://tabelog.com/kanagawa/A1401/A140105/14000104/",
      ai_generated_text: "活気あふれる横浜中華街の中心にある老舗。伝統的な広東料理の味は間違いなく、特にフカヒレスープや点心の数々に感動しました。特別な日や大切な人との食事にぴったりな、重厚感と温かみが共存する空間です。",
      created_at: new Date().toISOString(),
      photos: [
        {
          id: "photo-1",
          storage_url: "https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          order_index: 0,
        },
        {
          id: "photo-2",
          storage_url: "https://images.unsplash.com/photo-1615560946294-0df52701fccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          order_index: 1,
        },
      ],
    },
    {
      id: "mock-place-2",
      portfolio_id: "mock-portfolio-1",
      name: "菜香新館",
      tabelog_url: "https://tabelog.com/kanagawa/A1401/A140105/14000140/",
      ai_generated_text: "飲茶の美味しさが忘れられない名店。次々と運ばれてくる熱々の小籠包や蒸し餃子は、どれも繊細で深い味わいでした。賑やかながらも落ち着いて食事が楽しめる、中華街ならではの活気を感じられるお店です。",
      created_at: new Date().toISOString(),
      photos: [
        {
          id: "photo-3",
          storage_url: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          order_index: 0,
        }
      ],
    },
    {
      id: "mock-place-3",
      portfolio_id: "mock-portfolio-2",
      name: "Cafe 1886 at Bosch",
      tabelog_url: "https://tabelog.com/tokyo/A1303/A130301/13186835/",
      ai_generated_text: "喧騒から少し離れた場所にある、モダンで静かなカフェ。こだわりのコーヒーとともに過ごす時間は、まるで自分だけの秘密の隠れ家を見つけたような気分にさせてくれます。",
      created_at: new Date().toISOString(),
      photos: [],
    }
  ]
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockData = (globalThis as any).mockData || initialMockData;

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).mockData = mockData;
}