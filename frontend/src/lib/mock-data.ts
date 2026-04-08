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
    title: "横浜の中華",
    share_id: "share_yokohama_chuka",
    is_public: true,
    created_at: "2026-04-01T10:00:00Z",
    place_count: 2,
  },
  {
    id: "p2",
    title: "デートで使えるカフェ",
    share_id: "share_date_cafes",
    is_public: false,
    created_at: "2026-04-05T14:30:00Z",
    place_count: 0,
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
      tabelog_url: "https://tabelog.com/chiba/A1201/A120101/12000002/",
      ai_generated_text: "器の美しさが際立つ、目にも鮮やかな朝食ビュッフェ。千葉にいることを忘れるような、上質で贅沢な朝の時間が約束されている。",
      created_at: "2026-04-03T09:00:00Z",
      photos: [
        {
          id: "photo2",
          storage_url: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
          order_index: 0,
        },
        {
          id: "photo3",
          storage_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop",
          order_index: 1,
        },
      ],
    },
  ],
};