export interface User {
  email: string;
  token: string;
  id: string;
  studio_id: string;
  role_id: number;
  app_id: string[];
}

export interface Player {
  account_type: AccountType;
  app_id: string;
  data: Record<string, null>;
  email: string;
  external_wallet: string;
  identifier: string;
  provisioned_wallet: string;
  socials: Record<string, null>;
  statistic_attribute_id: string;
  type: string;
  user_id: string;
  value: string;
}

export interface Studio {
  name: string;
  studio_id: string;
  admin_details: StudioAdmin[];
  data: Record<string, null>;
  statistics: Record<string, null>;
}

export interface StudioAdmin {
  admin_id: string;
  role_id: number;
  admin_email: string;
  status: number;
}

export interface App {
  app_id: string;
  studio_id: string;
  name: string;
  api_key: string;
  admin_email: string;
  created_at: Date;
  image_url: string;
  status: number;
}

export interface AppDetail {
  achievements: Achievement[];
  app: App;
  app_admins: AppAdmin[];
  bundles: Bundle[];
  data: AppData;
  items: Item[];
  statisticAttributes: StatisticAttribute[];
  statistics: AppStatistic[];
}

export interface AppAdmin {
  id: string;
  app_id: string;
  role_id: number;
  email: string;
}

export interface AppStatistic {
  id: string;
  app_id: string;
  data: string;
}

export interface AppData {
  id: string;
  data: string;
}

export interface StatisticAttribute {
  attribute_id: string;
  app_id: string;
  attribute_name: string;
}

export interface Achievement {
  id: string;
  app_id: string;
  name: string;
}

export interface AchievementRule {
  id: string;
  app_id: string;
  achievement_id: string;
  statistic_id: string;
  type: string;
  value: string;
}

export interface Bundle {
  id: string;
  app_id: string;
  name: string;
  count: number;
}

export interface Item {
  item_id: string;
  app_id: string;
  item_name: string;
  item_data: any;
  item_options: any;
}

export interface BundleItem {
  id: string;
  bundle_id: string;
  item_id: string;
}

export interface AppDetail {
  app: App;
  bundles: Bundle[];
  data: AppData;
  statistics: AppStatistic[];
  achievements: Achievement[];
  statisticAttributes: StatisticAttribute[];
  items: Item[];
  app_admins: AppAdmin[];
}

export interface Role {
  role_id: number;
  name: string;
}

export enum AccountType {
  FULL = 0,
  HEADLESS = 1,
}

export type MatchesItem = {
  id: string;
  app_id: string;
  xp_earned: number | string;
  user_id: string;
  created_at: string;
  duration_in_minutes: number | string;
};

// Dashboard Game Statistics

export type GameStatistics = {
  match_day_friendly: string;
  players: string;
  matches: string;
  headshots: string;
  resources: string;
  sum_row_num: string;
};

export type PlayerCount = {
  count: string;
};

export type TopFiveHighestPlayers= {
  steam_username: string;
  count: string;
};

export type TotalMatchesPerDay= {
  match_day: string;
  count: string;
};