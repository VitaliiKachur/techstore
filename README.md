# TechStore

Інтернет-магазин електроніки (курсова робота): каталог товарів, кошик, оформлення замовлень, особистий кабінет і **адмін-панель** для керування товарами, категоріями, акціями та замовленнями.

**Стек:** Next.js (client) + Express + Prisma + PostgreSQL.

---

## Вимоги

- Node.js 22+
- PostgreSQL

---

## Локальний запуск (розробка)

Проєкт запускається **двома терміналами**: backend і frontend. У режимі розробки використовується **`npm run dev`**.

### 1. Backend (`server`)

```bash
cd server
npm install
```

Створіть `server/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/techstore"
JWT_SECRET="your-secret-key"
PORT=5000
```

Перший раз (міграції + тестові дані, зокрема адмін):

```bash
npx prisma migrate deploy
npm run seed
```

Перед `npm run dev` потрібно згенерувати Prisma Client (якщо ще не робили):

```bash
npx prisma generate
```

**Запуск API:**

```bash
npm run dev
```

API: [http://localhost:5000](http://localhost:5000)

### 2. Frontend (`client`)

```bash
cd client
npm install
```

Опційно `client/.env.local` (за замовчуванням API — `http://localhost:5000`):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Запуск сайту:**

```bash
npm run dev
```

Сайт: [http://localhost:3000](http://localhost:3000)

> Backend (`server`) і frontend (`client`) мають працювати **одночасно**.

---

## Збірка backend (production / Render)

Для деплою або production-запуску backend **не** використовують `npm run dev`. Потрібна збірка TypeScript і Prisma:

```bash
cd server
npm install && npx prisma generate && npm run build
```

Після білду (локально або на сервері) також застосуйте міграції до БД:

```bash
npx prisma migrate deploy
```

Запуск зібраного API:

```bash
npm start
```


## Вхід як адміністратор

Після `npm run seed` у базі є користувач з роллю **ADMIN**.

| Поле | Значення |
|------|----------|
| **Email** | `admin@techstore.local` |
| **Пароль** | `admin4554` |

### Кроки для перевірки

1. Запустіть `npm run dev` у `server` і `client`.
2. Відкрийте [http://localhost:3000/login](http://localhost:3000/login).
3. Увійдіть з email і паролем з таблиці.
4. Відкрийте [http://localhost:3000/admin](http://localhost:3000/admin).

У панелі адміністратора:

- замовлення (статуси, пошук);
- товари (CRUD, фото);
- категорії;
- акції на головній.

> Якщо вхід не працює: перевірте `npm run seed`, що backend на порту **5000**, і `NEXT_PUBLIC_API_URL` у клієнті.

---

## Тести та CI

```bash
cd client && npm run test:coverage
cd server && npm run test:coverage
```

---

## Структура репозиторію

```
techstore/
├── client/          # Next.js — npm run dev
├── server/          # Express API — npm run dev / npm run build + npm start
└── .github/         # CI
```

---

## Репозиторій

[github.com/VitaliiKachur/techstore](https://github.com/VitaliiKachur/techstore)
