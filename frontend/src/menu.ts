export interface MenuItem {
  key: string;
  label: string;
  ready?: boolean;
}

export interface MenuSection {
  title?: string;
  items: MenuItem[];
}

export const MENU: MenuSection[] = [
  {
    items: [
      { key: "site", label: "Наш сайт" },
      { key: "colleagues", label: "Коллеги", ready: true },
    ],
  },
  {
    title: "Игра",
    items: [
      { key: "heroes", label: "Герои" },
      { key: "achievements", label: "Достижения" },
      { key: "store", label: "Магазин" },
      { key: "tasks", label: "Задания" },
      { key: "quests", label: "Квесты" },
      { key: "ratings", label: "Рейтинги" },
    ],
  },
  {
    title: "Контент",
    items: [{ key: "company", label: "Компания" }],
  },
  {
    title: "Обучение",
    items: [
      { key: "knowledge", label: "База знаний" },
      { key: "training", label: "Обучение" },
      { key: "tests", label: "Тесты" },
    ],
  },
  {
    title: "Управление",
    items: [
      { key: "groups", label: "Группы", ready: true },
      { key: "events", label: "Лог событий" },
    ],
  },
  { title: "Оценка", items: [] },
];

export const SETTINGS_ITEM: MenuItem = {
  key: "settings",
  label: "Настройки",
  ready: true,
};
