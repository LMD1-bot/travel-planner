import { Trip, DayPlan, Activity } from "@/types/trip";
import { createTrip, NewTripInput } from "@/lib/trip";
import { addDaysISO, todayISO, uid } from "@/lib/utils";

export interface TemplateMeta {
  id: string;
  city: string;
  title: string;
  days: number;
  emoji: string;
  tags: string[];
  summary: string;
}

interface RawActivity {
  time: string;
  title: string;
  location?: string;
  cost?: number;
  notes?: string;
}

interface RawTemplate extends TemplateMeta {
  daysPlan: RawActivity[][];
}

function act(a: RawActivity): Activity {
  return {
    id: uid(),
    title: a.title,
    location: a.location,
    startTime: a.time,
    endTime: undefined,
    notes: a.notes,
    cost: a.cost,
  };
}

const RAW: RawTemplate[] = [
  {
    id: "xiamen",
    city: "福建 · 厦门",
    title: "厦门文艺海岛 3 日游",
    days: 3,
    emoji: "🌊",
    tags: ["海滨", "文艺", "美食"],
    summary: "鼓浪屿 + 环岛路 + 沙坡尾，慢节奏文艺之旅",
    daysPlan: [
      [
        { time: "09:00", title: "抵达厦门，前往酒店放行李", location: "中山路附近" },
        { time: "11:00", title: "中山路步行街逛吃", location: "中山路", cost: 80, notes: "黄则和花生汤、八婆婆烧仙草" },
        { time: "14:00", title: "乘船登鼓浪屿", location: "邮轮中心厦鼓码头", cost: 35, notes: "提前在公众号买船票" },
        { time: "15:00", title: "鼓浪屿漫步：日光岩、菽庄花园", location: "鼓浪屿", cost: 90 },
        { time: "19:00", title: "龙头路小吃街晚餐", location: "鼓浪屿龙头路", cost: 100 },
      ],
      [
        { time: "08:30", title: "南普陀寺", location: "思明区", cost: 0, notes: "免费，可登顶看海" },
        { time: "11:00", title: "厦门大学（外观/预约进校）", location: "厦大", cost: 0 },
        { time: "13:00", title: "沙坡尾艺术西区午餐+咖啡", location: "沙坡尾", cost: 90 },
        { time: "15:30", title: "环岛路骑行", location: "环岛路", cost: 30, notes: "租共享单车，吹海风看日落" },
        { time: "18:30", title: "曾厝垵夜市", location: "曾厝垵", cost: 100 },
      ],
      [
        { time: "09:00", title: "集美学村", location: "集美区", cost: 0, notes: "嘉庚建筑，适合拍照" },
        { time: "12:00", title: "集美午餐：沙茶面", cost: 40 },
        { time: "14:00", title: "返程，前往机场/车站", location: "厦门高崎机场" },
      ],
    ],
  },
  {
    id: "chengdu",
    city: "四川 · 成都",
    title: "成都休闲美食 3 日游",
    days: 3,
    emoji: "🐼",
    tags: ["美食", "熊猫", "慢生活"],
    summary: "大熊猫 + 火锅 + 茶馆，巴适慢生活",
    daysPlan: [
      [
        { time: "08:00", title: "大熊猫繁育研究基地（看滚滚吃早餐）", location: "成华区", cost: 55, notes: "一定要早去，上午熊猫最活跃" },
        { time: "12:00", title: "春熙路/太古里逛街午餐", location: "春熙路", cost: 100 },
        { time: "15:00", title: "宽窄巷子", location: "青羊区", cost: 50 },
        { time: "19:00", title: "火锅大餐", cost: 120, notes: "小龙坎/大龙燚/蜀大侠，记得点微辣" },
      ],
      [
        { time: "09:00", title: "武侯祠", location: "武侯区", cost: 50 },
        { time: "11:00", title: "锦里古街", location: "武侯祠旁", cost: 60, notes: "三大炮、钵钵鸡" },
        { time: "14:00", title: "人民公园喝盖碗茶 + 掏耳朵", location: "人民公园", cost: 40, notes: "体验成都慢生活" },
        { time: "19:00", title: "九眼桥夜景 + 酒吧街", location: "九眼桥", cost: 100 },
      ],
      [
        { time: "08:30", title: "都江堰 + 青城山一日游", location: "都江堰", cost: 160, notes: "可跟一日游团或高铁前往" },
        { time: "18:00", title: "返回市区，晚餐串串香", cost: 70 },
      ],
    ],
  },
  {
    id: "xian",
    city: "陕西 · 西安",
    title: "西安古都穿越 3 日游",
    days: 3,
    emoji: "🏛️",
    tags: ["历史", "古都", "美食"],
    summary: "兵马俑 + 古城墙 + 回民街，一眼千年",
    daysPlan: [
      [
        { time: "08:30", title: "秦始皇兵马俑博物馆", location: "临潼区", cost: 120, notes: "请个讲解或租讲解器，值得" },
        { time: "13:00", title: "华清宫", location: "临潼区", cost: 120 },
        { time: "19:00", title: "回民街晚餐", location: "回民街", cost: 80, notes: "羊肉泡馍、肉夹馍、凉皮" },
      ],
      [
        { time: "09:00", title: "西安城墙骑行一圈", location: "永宁门", cost: 54, notes: "南门上墙，骑行约 1.5 小时" },
        { time: "12:30", title: "永兴坊午餐", location: "永兴坊", cost: 60 },
        { time: "14:30", title: "陕西历史博物馆", location: "雁塔区", cost: 0, notes: "免费但需提前在官网预约" },
        { time: "19:00", title: "大雁塔北广场音乐喷泉", location: "大雁塔", cost: 0, notes: "晚上有喷泉表演" },
      ],
      [
        { time: "09:00", title: "碑林博物馆 / 书院门", location: "碑林区", cost: 65 },
        { time: "12:00", title: "钟鼓楼广场 + 午餐", cost: 60 },
        { time: "15:00", title: "返程", location: "西安北站/咸阳机场" },
      ],
    ],
  },
  {
    id: "hangzhou",
    city: "浙江 · 杭州",
    title: "杭州西湖诗意 2 日游",
    days: 2,
    emoji: "🍃",
    tags: ["湖泊", "茶", "江南"],
    summary: "西湖 + 龙井 + 灵隐，江南诗意周末",
    daysPlan: [
      [
        { time: "09:00", title: "西湖断桥残雪 → 白堤漫步", location: "西湖", cost: 0 },
        { time: "11:30", title: "楼外楼/外婆家午餐", cost: 100 },
        { time: "14:00", title: "苏堤春晓 + 花港观鱼", location: "西湖", cost: 0, notes: "可租船游湖" },
        { time: "17:00", title: "雷峰塔看日落", location: "雷峰塔", cost: 40 },
        { time: "19:30", title: "河坊街夜市", cost: 80 },
      ],
      [
        { time: "08:30", title: "灵隐寺祈福", location: "灵隐", cost: 75, notes: "含飞来峰门票" },
        { time: "12:00", title: "龙井村品茶 + 农家菜", location: "龙井村", cost: 120 },
        { time: "15:00", title: "九溪烟树徒步", location: "九溪", cost: 0 },
        { time: "17:30", title: "返程", location: "杭州东站" },
      ],
    ],
  },
  {
    id: "chongqing",
    city: "重庆",
    title: "重庆山城魔幻 3 日游",
    days: 3,
    emoji: "🌶️",
    tags: ["火锅", "夜景", "8D魔幻"],
    summary: "洪崖洞 + 轻轨穿楼 + 麻辣火锅",
    daysPlan: [
      [
        { time: "10:00", title: "解放碑步行街", location: "渝中区", cost: 60 },
        { time: "12:00", title: "八一好吃街午餐", cost: 50, notes: "酸辣粉、山城小汤圆" },
        { time: "14:00", title: "长江索道", location: "新华路", cost: 20, notes: "体验空中过江" },
        { time: "18:00", title: "洪崖洞夜景", location: "洪崖洞", cost: 0, notes: "天黑后亮灯最美" },
        { time: "20:00", title: "重庆火锅", cost: 100, notes: "九宫格，点微辣起步" },
      ],
      [
        { time: "09:00", title: "李子坝轻轨穿楼打卡", location: "李子坝站", cost: 2 },
        { time: "10:30", title: "鹅岭二厂文创园", location: "鹅岭", cost: 0, notes: "《从你的全世界路过》取景地" },
        { time: "13:00", title: "磁器口古镇", location: "沙坪坝区", cost: 80, notes: "陈麻花必买" },
        { time: "18:00", title: "南山一棵树观景台看夜景", location: "南岸区", cost: 30 },
      ],
      [
        { time: "09:00", title: "武隆天生三桥/仙女山（可选一日游）", location: "武隆", cost: 200, notes: "《满城尽带黄金甲》取景地，较远需一天" },
        { time: "19:00", title: "返回市区，江湖菜晚餐", cost: 80 },
      ],
    ],
  },
  {
    id: "dali",
    city: "云南 · 大理",
    title: "大理风花雪月 3 日游",
    days: 3,
    emoji: "🏔️",
    tags: ["洱海", "古城", "文艺"],
    summary: "洱海骑行 + 古城发呆 + 苍山远眺",
    daysPlan: [
      [
        { time: "10:00", title: "抵达大理，入住古城民宿", location: "大理古城" },
        { time: "12:00", title: "古城午餐：饵丝/乳扇", cost: 40 },
        { time: "14:00", title: "大理古城闲逛：人民路、洋人街", cost: 50 },
        { time: "18:00", title: "古城看日落 + 晚餐", cost: 70 },
      ],
      [
        { time: "08:30", title: "环洱海骑行/包车", location: "洱海", cost: 150, notes: "洱海生态廊道，途径喜洲、双廊" },
        { time: "12:30", title: "喜洲古镇午餐 + 喜洲粑粑", location: "喜洲", cost: 50 },
        { time: "16:00", title: "双廊古镇下午茶看海", location: "双廊", cost: 80 },
      ],
      [
        { time: "09:00", title: "苍山感通索道/洗马潭", location: "苍山", cost: 180, notes: "视天气选择，山上较冷带外套" },
        { time: "14:00", title: "返程", location: "大理站/机场" },
      ],
    ],
  },
  {
    id: "beijing",
    city: "北京",
    title: "北京经典文化 3 日游",
    days: 3,
    emoji: "🏯",
    tags: ["古都", "文化", "历史"],
    summary: "故宫 + 长城 + 胡同，感受帝都底蕴",
    daysPlan: [
      [
        { time: "08:30", title: "天安门广场", location: "东城区", cost: 0 },
        { time: "09:30", title: "故宫博物院", location: "故宫", cost: 60, notes: "务必提前网上实名预约" },
        { time: "14:00", title: "景山公园俯瞰故宫全景", location: "景山", cost: 2 },
        { time: "18:00", title: "王府井/四季民福烤鸭", cost: 150 },
      ],
      [
        { time: "07:30", title: "八达岭/慕田峪长城", location: "延庆/怀柔", cost: 100, notes: "早出发避开人流，建议慕田峪人更少" },
        { time: "15:00", title: "返回市区", cost: 0 },
        { time: "18:30", title: "南锣鼓巷 + 什刹海夜景", cost: 80 },
      ],
      [
        { time: "09:00", title: "颐和园", location: "海淀区", cost: 30 },
        { time: "13:00", title: "圆明园 / 清华北大外观", cost: 25 },
        { time: "16:00", title: "返程", location: "北京南站/首都机场" },
      ],
    ],
  },
];

/** Metadata list for the template picker UI. */
export const TEMPLATES: TemplateMeta[] = RAW.map(
  ({ id, city, title, days, emoji, tags, summary }) => ({
    id,
    city,
    title,
    days,
    emoji,
    tags,
    summary,
  })
);

/** Build a real Trip from a template, with dates starting from `start`. */
export function instantiateTemplate(
  templateId: string,
  start?: string
): Trip | null {
  const raw = RAW.find((r) => r.id === templateId);
  if (!raw) return null;
  const startDate = start ?? addDaysISO(todayISO(), 7);
  const endDate = addDaysISO(startDate, raw.days - 1);
  const base: NewTripInput = {
    name: raw.title,
    destination: raw.city,
    startDate,
    endDate,
    travelers: 2,
    transport: "train",
    notes: raw.summary,
  };
  const trip = createTrip(base);
  const days: DayPlan[] = raw.daysPlan.map((acts, i) => ({
    date: addDaysISO(startDate, i),
    activities: acts.map(act),
  }));
  trip.days = days;
  return trip;
}
