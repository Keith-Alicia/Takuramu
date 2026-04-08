export type Portfolio = {
  id: string;
  title: string;
  share_id: string;
  is_public: boolean;
  created_at: string;
  place_count: number;
};

export type Place = {
  id: string;
  portfolio_id: string;
  tabelog_url: string;
  ai_generated_text: string;
  created_at: string;
  photos: Photo[];
};

export type Photo = {
  id: string;
  storage_url: string;
  order_index: number;
};

export const mockPortfolios: Portfolio[] = [
  {
    id: "p1",
    title: "横浜中華街",
    share_id: "share_yokohama_chuka",
    is_public: true,
    created_at: "2026-04-01T10:00:00Z",
    place_count: 2,
  },
  {
    id: "p2",
    title: "学芸大学",
    share_id: "share_gakudai",
    is_public: true,
    created_at: "2026-04-05T14:30:00Z",
    place_count: 3,
  },
  {
    id: "p3",
    title: "都城",
    share_id: "share_miyakonojo",
    is_public: true,
    created_at: "2026-04-06T09:15:00Z",
    place_count: 3,
  },
  {
    id: "p4",
    title: "千葉",
    share_id: "share_chiba",
    is_public: true,
    created_at: "2026-04-07T11:45:00Z",
    place_count: 2,
  },
  {
    id: "p5",
    title: "奥渋",
    share_id: "share_okushibu",
    is_public: false,
    created_at: "2026-04-08T18:00:00Z",
    place_count: 2,
  },
  {
    id: "p6",
    title: "福岡 天神",
    share_id: "share_fukuoka",
    is_public: true,
    created_at: "2026-04-08T20:30:00Z",
    place_count: 2,
  },
  {
    id: "p7",
    title: "札幌 すすきの",
    share_id: "share_sapporo",
    is_public: false,
    created_at: "2026-04-09T12:00:00Z",
    place_count: 1,
  },
  {
    id: "p8",
    title: "京都 祇園",
    share_id: "share_kyoto",
    is_public: true,
    created_at: "2026-04-10T15:20:00Z",
    place_count: 1,
  },
];

export const mockPlaces: Record<string, Place[]> = {
  p1: [
    {
      id: "place1",
      portfolio_id: "p1",
      tabelog_url: "https://tabelog.com/kanagawa/A1401/A140104/14000001/",
      ai_generated_text: "老若男女に愛される、居心地の良い止まり木のような空間。多様なカルチャーが交差し、気高き友人たちとの刺激的な時間が流れる。",
      created_at: "2026-04-02T12:00:00Z",
      photos: [
        {
          id: "photo1",
          storage_url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=800&auto=format&fit=crop",
          order_index: 0,
        },
      ],
    },
    {
      id: "place2",
      portfolio_id: "p1",
      tabelog_url: "https://tabelog.com/kanagawa/A1401/A140104/14000002/",
      ai_generated_text: "本格的な飲茶を楽しめる隠れ家的なお店。手作りの点心はどれも絶品で、休日の午後を優雅に過ごすのにぴったり。",
      created_at: "2026-04-03T09:00:00Z",
      photos: [
        {
          id: "photo2",
          storage_url: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=800&auto=format&fit=crop",
          order_index: 0,
        },
      ],
    },
  ],
  p2: [
    {
      id: "place3",
      portfolio_id: "p2",
      tabelog_url: "https://tabelog.com/tokyo/A1317/A131702/13000003/",
      ai_generated_text: "自家焙煎のコーヒーが香る、落ち着いた雰囲気のカフェ。こだわりの豆を使ったエスプレッソと、季節のタルトの相性が抜群。",
      created_at: "2026-04-05T15:00:00Z",
      photos: [
        {
          id: "photo3",
          storage_url: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop",
          order_index: 0,
        },
        {
          id: "photo4",
          storage_url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop",
          order_index: 1,
        }
      ],
    },
    {
      id: "place4",
      portfolio_id: "p2",
      tabelog_url: "https://tabelog.com/tokyo/A1317/A131702/13000004/",
      ai_generated_text: "ナチュラルワインと気の利いたおつまみが楽しめるビストロ。店主の温かい人柄に惹かれて、夜な夜な地元の人々が集う。",
      created_at: "2026-04-05T19:30:00Z",
      photos: [
        {
          id: "photo5",
          storage_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop",
          order_index: 0,
        },
      ],
    },
    {
      id: "place5",
      portfolio_id: "p2",
      tabelog_url: "https://tabelog.com/tokyo/A1317/A131702/13000005/",
      ai_generated_text: "焼きたてのパンの香りがたまらない路地裏のベーカリー。サクサクのクロワッサンは午前中で売り切れるほどの人気。",
      created_at: "2026-04-06T08:00:00Z",
      photos: [
        {
          id: "photo6",
          storage_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop",
          order_index: 0,
        },
      ],
    },
  ],
  p3: [
    {
      id: "place6",
      portfolio_id: "p3",
      tabelog_url: "https://tabelog.com/miyazaki/A4503/A450301/45000001/",
      ai_generated_text: "宮崎牛の極上の旨味を堪能できる焼肉の名店。とろけるようなお肉と、地元産の新鮮な野菜の組み合わせが最高。",
      created_at: "2026-04-06T18:00:00Z",
      photos: [
        {
          id: "photo7",
          storage_url: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=800&auto=format&fit=crop",
          order_index: 0,
        },
      ],
    },
    {
      id: "place7",
      portfolio_id: "p3",
      tabelog_url: "https://tabelog.com/miyazaki/A4503/A450301/45000002/",
      ai_generated_text: "地鶏の炭火焼きが名物の活気あふれる居酒屋。香ばしい匂いと焼酎で、都城の夜を満喫できる。",
      created_at: "2026-04-06T20:00:00Z",
      photos: [
        {
          id: "photo8",
          storage_url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop",
          order_index: 0,
        },
      ],
    },
    {
      id: "place8",
      portfolio_id: "p3",
      tabelog_url: "https://tabelog.com/miyazaki/A4503/A450301/45000003/",
      ai_generated_text: "地元民に愛される昔ながらのうどん店。コシのある麺と優しいお出汁が、心も体も温めてくれる。",
      created_at: "2026-04-07T12:00:00Z",
      photos: [
        {
          id: "photo9",
          storage_url: "https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=800&auto=format&fit=crop",
          order_index: 0,
        },
      ],
    },
  ],
  p4: [
    {
      id: "place9",
      portfolio_id: "p4",
      tabelog_url: "https://tabelog.com/chiba/A1201/A120101/12000001/",
      ai_generated_text: "器の美しさが際立つ、目にも鮮やかな朝食ビュッフェ。千葉にいることを忘れるような、上質で贅沢な朝の時間が約束されている。",
      created_at: "2026-04-07T08:00:00Z",
      photos: [
        {
          id: "photo10",
          storage_url: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
          order_index: 0,
        },
        {
          id: "photo11",
          storage_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop",
          order_index: 1,
        },
      ],
    },
    {
      id: "place10",
      portfolio_id: "p4",
      tabelog_url: "https://tabelog.com/chiba/A1201/A120101/12000002/",
      ai_generated_text: "新鮮な海の幸をふんだんに使った海鮮丼が自慢の食堂。港町ならではの活気と、圧倒的なコストパフォーマンスが魅力。",
      created_at: "2026-04-07T13:00:00Z",
      photos: [
        {
          id: "photo12",
          storage_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop",
          order_index: 0,
        },
      ],
    },
  ],
  p5: [
    {
      id: "place11",
      portfolio_id: "p5",
      tabelog_url: "https://tabelog.com/tokyo/A1303/A130301/13000001/",
      ai_generated_text: "スタイリッシュな空間で味わう創作イタリアン。洗練された料理の数々と、厳選されたワインのペアリングが素晴らしい。",
      created_at: "2026-04-08T19:00:00Z",
      photos: [
        {
          id: "photo13",
          storage_url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop",
          order_index: 0,
        },
      ],
    },
    {
      id: "place12",
      portfolio_id: "p5",
      tabelog_url: "https://tabelog.com/tokyo/A1303/A130301/13000002/",
      ai_generated_text: "深夜まで賑わう、大人のためのモダンなバー。クリエイティブなカクテルと、ゆったりとした時間が流れる。",
      created_at: "2026-04-08T22:00:00Z",
      photos: [
        {
          id: "photo14",
          storage_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop",
          order_index: 0,
        },
      ],
    },
  ],
  p6: [
    {
      id: "place13",
      portfolio_id: "p6",
      tabelog_url: "https://tabelog.com/fukuoka/A4001/A400103/40000001/",
      ai_generated_text: "濃厚な豚骨スープが自慢の屋台ラーメン。一杯のラーメンに込められた情熱と、屋台ならではの風情が楽しめる。",
      created_at: "2026-04-09T00:00:00Z",
      photos: [
        {
          id: "photo15",
          storage_url: "https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=800&auto=format&fit=crop",
          order_index: 0,
        },
      ],
    },
    {
      id: "place14",
      portfolio_id: "p6",
      tabelog_url: "https://tabelog.com/fukuoka/A4001/A400103/40000002/",
      ai_generated_text: "玄界灘で獲れた新鮮な魚介を堪能できる割烹。大将の包丁さばきが見えるカウンター席で、極上の海鮮料理を。",
      created_at: "2026-04-09T18:30:00Z",
      photos: [
        {
          id: "photo16",
          storage_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop",
          order_index: 0,
        },
      ],
    },
  ],
  p7: [
    {
      id: "place15",
      portfolio_id: "p7",
      tabelog_url: "https://tabelog.com/hokkaido/A0101/A010103/10000001/",
      ai_generated_text: "北海道の味覚を詰め込んだジンギスカンの名店。秘伝のタレと柔らかいお肉が、ビールとの相性抜群。",
      created_at: "2026-04-10T19:00:00Z",
      photos: [
        {
          id: "photo17",
          storage_url: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=800&auto=format&fit=crop",
          order_index: 0,
        },
      ],
    },
  ],
  p8: [
    {
      id: "place16",
      portfolio_id: "p8",
      tabelog_url: "https://tabelog.com/kyoto/A2601/A260301/26000001/",
      ai_generated_text: "風情ある町家を改装した、和の心を感じる甘味処。丁寧に作られた抹茶パフェと、静かな庭園の景色に癒される。",
      created_at: "2026-04-10T14:00:00Z",
      photos: [
        {
          id: "photo18",
          storage_url: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=800&auto=format&fit=crop",
          order_index: 0,
        },
      ],
    },
  ],
};