"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import ProductImage from "@/components/ProductImage";
import SiteHeader from "@/components/SiteHeader";
import { AuthUser, getAuthToken, loadCurrentUser } from "@/lib/auth";
import {
  Category,
  Product,
  ProductPayload,
  createCategory,
  createProduct,
  deleteProduct,
  loadCategories,
  loadProducts,
  updateCategory,
  updateProduct,
} from "@/lib/catalog";
import {
  CustomerOrder,
  ORDER_STATUSES,
  OrderStatus,
  getOrderStatusLabel,
  loadCustomerOrders,
  updateOrderStatus,
} from "@/lib/orders";
import {
  Promotion,
  PromotionPayload,
  loadAdminPromotion,
  updateAdminPromotion,
} from "@/lib/promotions";

type AdminTab = "products" | "orders" | "categories" | "promotions";
type ProductFormTab = "main" | "description" | "media";

type ProductFormState = {
  title: string;
  description: string;
  details: string;
  price: string;
  stock: string;
  image: string;
  galleryImages: string[];
  categoryId: string;
};

type PromotionFormState = {
  title: string;
  subtitle: string;
  badge: string;
  discountPercent: string;
  minQuantity: string;
  active: boolean;
  productIds: string[];
};

const EMPTY_PRODUCT_FORM: ProductFormState = {
  title: "",
  description: "",
  details: "",
  price: "",
  stock: "",
  image: "",
  galleryImages: [],
  categoryId: "",
};

const EMPTY_PROMOTION_FORM: PromotionFormState = {
  title: "Товари дня",
  subtitle: "Добірка дня",
  badge: "-10%",
  discountPercent: "10",
  minQuantity: "3",
  active: true,
  productIds: [],
};

const PRODUCT_IMAGE_MAX_DIMENSION = 900;
const PRODUCT_IMAGE_QUALITY = 0.84;

export default function AdminPage() {
  const productFormRef = useRef<HTMLFormElement | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [productFormTab, setProductFormTab] = useState<ProductFormTab>("main");
  const [promotionForm, setPromotionForm] = useState<PromotionFormState>(EMPTY_PROMOTION_FORM);
  const [categoryName, setCategoryName] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | "">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isSavingPromotion, setIsSavingPromotion] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  );

  const orderStats = useMemo(
    () =>
      ORDER_STATUSES.map((status) => ({
        status,
        count: orders.filter((order) => order.status === status).length,
      })),
    [orders]
  );

  useEffect(() => {
    async function loadAdminData() {
      if (!getAuthToken()) {
        setError("Увійди в акаунт адміністратора.");
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await loadCurrentUser();
        setUser(currentUser);

        if (currentUser.role !== "ADMIN") {
          setError("Ця панель доступна тільки адміністратору.");
          return;
        }

        const [nextCategories, nextProducts, nextOrders, nextPromotion] = await Promise.all([
          loadCategories(),
          loadProducts({ limit: 50 }),
          loadCustomerOrders(),
          loadAdminPromotion(),
        ]);
        setCategories(nextCategories);
        setProducts(nextProducts);
        setOrders(nextOrders);
        setPromotion(nextPromotion);
        if (nextPromotion) {
          setPromotionForm({
            title: nextPromotion.title,
            subtitle: nextPromotion.subtitle,
            badge: nextPromotion.badge,
            discountPercent: String(nextPromotion.discountPercent),
            minQuantity: String(nextPromotion.minQuantity),
            active: nextPromotion.active,
            productIds: nextPromotion.productIds,
          });
        }
        setProductForm((current) => ({
          ...current,
          categoryId: current.categoryId || nextCategories[0]?.id || "",
        }));
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Не вдалося завантажити адмін-панель."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadAdminData();
  }, []);

  async function refreshProducts() {
    setProducts(
      await loadProducts({
        categoryId: productCategoryFilter,
        search: productSearch,
        limit: 50,
      })
    );
  }

  async function refreshOrders() {
    setOrders(await loadCustomerOrders({ status: orderStatusFilter, search: orderSearch }));
  }

  async function refreshCategories() {
    const nextCategories = await loadCategories();
    setCategories(nextCategories);
    setProductForm((current) => ({
      ...current,
      categoryId: current.categoryId || nextCategories[0]?.id || "",
    }));
  }

  function startEditProduct(product: Product) {
    setSelectedProductId(product.id);
    setProductForm({
      title: product.title,
      description: product.description,
      details: product.details ?? "",
      price: String(product.price),
      stock: String(product.stock),
      image: product.image,
      galleryImages: product.galleryImages ?? [],
      categoryId: product.category.id,
    });
    setActiveTab("products");
    setMessage("");
    setError("");
    window.requestAnimationFrame(() => {
      productFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function resetProductForm() {
    setSelectedProductId(null);
    setProductFormTab("main");
    setProductForm({
      ...EMPTY_PRODUCT_FORM,
      categoryId: categories[0]?.id || "",
    });
  }

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSavingProduct(true);

    const payload: ProductPayload = {
      title: productForm.title.trim(),
      description: productForm.description.trim(),
      details: productForm.details.trim() || null,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      image: productForm.image.trim(),
      galleryImages: productForm.galleryImages,
      categoryId: productForm.categoryId,
    };

    try {
      if (selectedProductId) {
        await updateProduct(selectedProductId, payload);
        setMessage("Товар оновлено.");
      } else {
        await createProduct(payload);
        setMessage("Новий товар додано.");
      }

      resetProductForm();
      await refreshProducts();
      await refreshCategories();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Не вдалося зберегти товар.");
    } finally {
      setIsSavingProduct(false);
    }
  }

  async function handleDeleteProduct(productId: string) {
    setError("");
    setMessage("");

    try {
      await deleteProduct(productId);
      setMessage("Товар видалено.");
      if (selectedProductId === productId) resetProductForm();
      await refreshProducts();
      await refreshCategories();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Не вдалося видалити товар.");
    }
  }

  function startEditCategory(category: Category) {
    setSelectedCategoryId(category.id);
    setCategoryName(category.name);
    setMessage("");
    setError("");
  }

  function resetCategoryForm() {
    setSelectedCategoryId(null);
    setCategoryName("");
  }

  async function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSavingCategory(true);

    try {
      const category = selectedCategoryId
        ? await updateCategory(selectedCategoryId, categoryName.trim())
        : await createCategory(categoryName.trim());

      resetCategoryForm();
      setMessage(
        selectedCategoryId
          ? `Категорію "${category.name}" оновлено.`
          : `Категорію "${category.name}" створено.`
      );
      await refreshCategories();
      await refreshProducts();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Не вдалося зберегти категорію."
      );
    } finally {
      setIsSavingCategory(false);
    }
  }

  async function handlePromotionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSavingPromotion(true);

    const payload: PromotionPayload = {
      type: "PRODUCT_DISCOUNT",
      title: promotionForm.title.trim(),
      subtitle: promotionForm.subtitle.trim(),
      badge: promotionForm.badge.trim(),
      discountPercent: Number(promotionForm.discountPercent),
      minQuantity: 1,
      active: promotionForm.active,
      productIds: promotionForm.productIds,
    };

    try {
      const nextPromotion = await updateAdminPromotion(payload);
      setPromotion(nextPromotion);
      setPromotionForm({
        title: nextPromotion.title,
        subtitle: nextPromotion.subtitle,
        badge: nextPromotion.badge,
        discountPercent: String(nextPromotion.discountPercent),
        minQuantity: String(nextPromotion.minQuantity),
        active: nextPromotion.active,
        productIds: nextPromotion.productIds,
      });
      setMessage("Акцію збережено.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Не вдалося зберегти акцію.");
    } finally {
      setIsSavingPromotion(false);
    }
  }

  function togglePromotionProduct(productId: string) {
    setPromotionForm((current) => ({
      ...current,
      productIds: current.productIds.includes(productId)
        ? current.productIds.filter((selectedProductId) => selectedProductId !== productId)
        : [...current.productIds, productId],
    }));
  }

  async function handleProductImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Оберіть файл зображення для товару.");
      return;
    }

    try {
      setError("");
      const image = await resizeProductImage(file);
      setProductForm((current) => ({ ...current, image }));
      setMessage("Фото товару додано до форми.");
    } catch {
      setError("Не вдалося обробити фото. Спробуйте інше зображення.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleGalleryImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    const invalidFile = files.find((file) => !file.type.startsWith("image/"));
    if (invalidFile) {
      setError("Для галереї можна обирати тільки зображення.");
      return;
    }

    try {
      setError("");
      const images = await Promise.all(files.map((file) => resizeProductImage(file)));
      setProductForm((current) => ({
        ...current,
        galleryImages: [...current.galleryImages, ...images],
      }));
      setMessage("Додаткові фото додано до форми.");
    } catch {
      setError("Не вдалося обробити додаткові фото. Спробуйте інші зображення.");
    } finally {
      event.target.value = "";
    }
  }

  function removeGalleryImage(index: number) {
    setProductForm((current) => ({
      ...current,
      galleryImages: current.galleryImages.filter((_, imageIndex) => imageIndex !== index),
    }));
  }

  async function handleOrderStatusChange(orderId: string, status: OrderStatus) {
    setError("");
    setMessage("");

    try {
      const updatedOrder = await updateOrderStatus(orderId, status);
      setOrders((currentOrders) =>
        currentOrders.map((order) => (order.id === orderId ? updatedOrder : order))
      );
      setMessage("Статус замовлення оновлено.");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Не вдалося оновити статус."
      );
    }
  }

  async function handleProductFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    await refreshProducts();
  }

  async function handleOrderFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    await refreshOrders();
  }

  return (
    <main className="min-h-screen bg-[var(--page)] text-[var(--text)]">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase text-[var(--accent-strong)]">
              Панель адміністратора
            </p>
            <h1 className="mt-2 text-3xl font-black md:text-4xl">
              Керування магазином
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Категорії, товари, залишки та статуси замовлень в одному робочому місці.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--muted)]">
            {user ? `Адмін: ${user.name}` : "Перевірка доступу"}
          </div>
        </div>

        {isLoading ? <p className="catalog-message">Завантаження адмін-панелі...</p> : null}

        {!isLoading && error && user?.role !== "ADMIN" ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-sm font-bold text-[var(--muted)]">{error}</p>
            <Link
              className="mt-4 inline-flex h-10 items-center rounded-md bg-[var(--text)] px-4 text-sm font-black text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827]"
              href="/login"
            >
              Увійти
            </Link>
          </div>
        ) : null}

        {!isLoading && user?.role === "ADMIN" ? (
          <>
            <div className="mb-5 grid gap-3 md:grid-cols-4">
              {orderStats.map((stat) => (
                <button
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition hover:border-[var(--accent)]"
                  key={stat.status}
                  onClick={() => {
                    setActiveTab("orders");
                    setOrderStatusFilter(stat.status);
                  }}
                  type="button"
                >
                  <p className="text-2xl font-black">{stat.count}</p>
                  <p className="mt-1 text-sm font-bold text-[var(--muted)]">
                    {getOrderStatusLabel(stat.status)}
                  </p>
                </button>
              ))}
            </div>

            <div className="mb-5 flex flex-wrap gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
              <AdminTabButton
                active={activeTab === "orders"}
                label="Замовлення"
                onClick={() => setActiveTab("orders")}
              />
              <AdminTabButton
                active={activeTab === "products"}
                label="Товари"
                onClick={() => setActiveTab("products")}
              />
              <AdminTabButton
                active={activeTab === "categories"}
                label="Категорії"
                onClick={() => setActiveTab("categories")}
              />
              <AdminTabButton
                active={activeTab === "promotions"}
                label="Акції"
                onClick={() => setActiveTab("promotions")}
              />
            </div>

            {message ? (
              <p className="mb-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm font-bold text-[var(--accent-strong)]">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="mb-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm font-bold text-[var(--rose)]">
                {error}
              </p>
            ) : null}

            {activeTab === "orders" ? (
              <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="mb-5 flex flex-col justify-between gap-4 border-b border-[var(--border)] pb-5 lg:flex-row lg:items-end">
                  <div>
                    <p className="text-xs font-black uppercase text-[var(--accent-strong)]">
                      Обробка
                    </p>
                    <h2 className="text-2xl font-black">Замовлення клієнтів</h2>
                  </div>
                  <form
                    className="grid gap-3 md:grid-cols-[180px_1fr_auto]"
                    onSubmit={handleOrderFilterSubmit}
                  >
                    <select
                      className="h-11 rounded-md border border-[var(--border)] bg-[var(--page)] px-3 text-sm font-bold outline-none"
                      onChange={(event) =>
                        setOrderStatusFilter(event.target.value as OrderStatus | "")
                      }
                      value={orderStatusFilter}
                    >
                      <option value="">Всі статуси</option>
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {getOrderStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                    <input
                      className="h-11 rounded-md border border-[var(--border)] bg-[var(--page)] px-3 text-sm font-bold outline-none"
                      onChange={(event) => setOrderSearch(event.target.value)}
                      placeholder="Пошук: клієнт, email, товар, номер"
                      value={orderSearch}
                    />
                    <button className="h-11 rounded-md bg-[var(--text)] px-5 text-sm font-black text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827]">
                      Фільтрувати
                    </button>
                  </form>
                </div>

                <div className="space-y-4">
                  {orders.map((order) => (
                    <article
                      className="rounded-lg border border-[var(--border)] bg-[var(--page)] p-4"
                      key={order.id}
                    >
                      <div className="grid gap-4 border-b border-[var(--border)] pb-4 lg:grid-cols-[1fr_220px_220px] lg:items-start">
                        <div>
                          <p className="text-xs font-black uppercase text-[var(--accent-strong)]">
                            #{order.id.slice(-8).toUpperCase()}
                          </p>
                          <h3 className="mt-1 text-xl font-black">
                            {formatPrice(order.totalPrice)}
                          </h3>
                          <p className="mt-1 text-sm font-bold text-[var(--muted)]">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-sm font-bold text-[var(--muted)]">
                          <p className="text-[var(--text)]">{order.user?.name ?? "Клієнт"}</p>
                          <p className="mt-1">{order.user?.email ?? "Email не вказано"}</p>
                        </div>
                        <select
                          className="h-11 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-black outline-none"
                          onChange={(event) =>
                            handleOrderStatusChange(order.id, event.target.value as OrderStatus)
                          }
                          value={order.status}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {getOrderStatusLabel(status)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {order.items.map((item) => (
                          <div
                            className="grid grid-cols-[88px_1fr_auto] items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3"
                            key={item.id}
                          >
                            <ProductImage
                              alt={item.product.title}
                              className="min-h-[88px] rounded-md"
                              src={item.product.image}
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black">{item.product.title}</p>
                              <p className="mt-1 text-xs font-bold text-[var(--muted)]">
                                {item.product.category.name}
                              </p>
                            </div>
                            <p className="font-black">x{item.quantity}</p>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                  {orders.length === 0 ? (
                    <p className="catalog-message">Замовлень за цими фільтрами немає.</p>
                  ) : null}
                </div>
              </section>
            ) : null}

            {activeTab === "products" ? (
              <section className="grid gap-5 lg:grid-cols-[380px_1fr]">
                <form
                  className="h-fit scroll-mt-24 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto"
                  onSubmit={handleProductSubmit}
                  ref={productFormRef}
                >
                  <div className="mb-5 border-b border-[var(--border)] pb-4">
                    <p className="text-xs font-black uppercase text-[var(--accent-strong)]">
                      {selectedProduct ? "Редагування" : "Новий товар"}
                    </p>
                    <h2 className="text-2xl font-black">
                      {selectedProduct ? selectedProduct.title : "Додати товар"}
                    </h2>
                  </div>
                  <div className="mb-5 grid grid-cols-3 gap-2 rounded-lg border border-[var(--border)] bg-[var(--page)] p-1">
                    <AdminFormTabButton
                      active={productFormTab === "main"}
                      label="Основне"
                      onClick={() => setProductFormTab("main")}
                    />
                    <AdminFormTabButton
                      active={productFormTab === "description"}
                      label="Опис"
                      onClick={() => setProductFormTab("description")}
                    />
                    <AdminFormTabButton
                      active={productFormTab === "media"}
                      label="Фото"
                      onClick={() => setProductFormTab("media")}
                    />
                  </div>
                  <AdminInput
                    label="Назва"
                    onChange={(value) => setProductForm({ ...productForm, title: value })}
                    required
                    value={productForm.title}
                  />
                  {productFormTab === "description" ? (
                    <>
                      <label className="mt-4 block">
                        <span className="text-sm font-bold">Опис</span>
                        <textarea
                          className="mt-1 min-h-28 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 py-2 text-sm outline-none"
                          onChange={(event) =>
                            setProductForm({ ...productForm, description: event.target.value })
                          }
                          required
                          value={productForm.description}
                        />
                      </label>
                      <label className="mt-4 block">
                        <span className="text-sm font-bold">Додатковий опис</span>
                        <textarea
                          className="mt-1 min-h-44 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 py-2 text-sm outline-none"
                          onChange={(event) =>
                            setProductForm({ ...productForm, details: event.target.value })
                          }
                          placeholder="Характеристики, комплектація, гарантія, особливості товару"
                          value={productForm.details}
                        />
                      </label>
                    </>
                  ) : null}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <AdminInput
                      label="Ціна"
                      onChange={(value) => setProductForm({ ...productForm, price: value })}
                      required
                      type="number"
                      value={productForm.price}
                    />
                    <AdminInput
                      label="Залишок"
                      onChange={(value) => setProductForm({ ...productForm, stock: value })}
                      required
                      type="number"
                      value={productForm.stock}
                    />
                  </div>
                  {productFormTab === "media" ? (
                    <>
                      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--page)] p-4">
                        <span className="text-sm font-bold">Фото товару</span>
                        <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr] sm:items-center">
                          {productForm.image ? (
                            <ProductImage
                              alt={productForm.title || "Фото товару"}
                              className="min-h-[120px] rounded-md"
                              src={productForm.image}
                            />
                          ) : (
                            <div className="grid min-h-[120px] place-items-center rounded-md border border-dashed border-[var(--border)] text-sm font-bold text-[var(--muted)]">
                              Немає фото
                            </div>
                          )}
                          <div>
                            <label className="inline-flex h-11 cursor-pointer items-center rounded-md bg-[var(--text)] px-4 text-sm font-black text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827]">
                              Обрати фото
                              <input
                                accept="image/*"
                                className="hidden"
                                onChange={handleProductImageUpload}
                                type="file"
                              />
                            </label>
                            <p className="mt-2 text-xs font-bold leading-5 text-[var(--muted)]">
                              Фото стискається і зберігається разом із товаром.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--page)] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-bold">Додаткові фото</span>
                          <label className="inline-flex h-10 cursor-pointer items-center rounded-md border border-[var(--border)] px-3 text-sm font-black transition hover:border-[var(--accent)]">
                            Додати фото
                            <input
                              accept="image/*"
                              className="hidden"
                              multiple
                              onChange={handleGalleryImageUpload}
                              type="file"
                            />
                          </label>
                        </div>
                        {productForm.galleryImages.length > 0 ? (
                          <div className="mt-3 grid grid-cols-2 gap-3">
                            {productForm.galleryImages.map((image, index) => (
                              <div
                                className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-2"
                                key={`${image.slice(0, 24)}-${index}`}
                              >
                                <ProductImage
                                  alt={`Додаткове фото ${index + 1}`}
                                  className="min-h-[110px] rounded-md"
                                  src={image}
                                />
                                <button
                                  className="mt-2 h-9 w-full rounded-md border border-[var(--border)] text-xs font-black transition hover:border-[var(--rose)] hover:text-[var(--rose)]"
                                  onClick={() => removeGalleryImage(index)}
                                  type="button"
                                >
                                  Видалити
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-3 text-xs font-bold leading-5 text-[var(--muted)]">
                            Додай кілька фото, щоб вони показувались на сторінці деталей товару.
                          </p>
                        )}
                      </div>
                    </>
                  ) : null}
                  <label className="mt-4 block">
                    <span className="text-sm font-bold">Категорія</span>
                    <select
                      className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 text-sm font-bold outline-none"
                      onChange={(event) =>
                        setProductForm({ ...productForm, categoryId: event.target.value })
                      }
                      required
                      value={productForm.categoryId}
                    >
                      <option value="">Оберіть категорію</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="mt-5 flex gap-3">
                    <button
                      className="h-11 rounded-md bg-[var(--text)] px-5 text-sm font-black text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827] disabled:opacity-60"
                      disabled={isSavingProduct}
                      type="submit"
                    >
                      {isSavingProduct ? "Збереження..." : selectedProduct ? "Оновити" : "Створити"}
                    </button>
                    <button
                      className="h-11 rounded-md border border-[var(--border)] px-4 text-sm font-black transition hover:border-[var(--accent)]"
                      onClick={resetProductForm}
                      type="button"
                    >
                      Очистити
                    </button>
                  </div>
                </form>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
                  <div className="mb-5 border-b border-[var(--border)] pb-4">
                    <h2 className="text-2xl font-black">Каталог товарів</h2>
                    <form
                      className="mt-4 grid gap-3 md:grid-cols-[180px_1fr_auto]"
                      onSubmit={handleProductFilterSubmit}
                    >
                      <select
                        className="h-11 rounded-md border border-[var(--border)] bg-[var(--page)] px-3 text-sm font-bold outline-none"
                        onChange={(event) => setProductCategoryFilter(event.target.value)}
                        value={productCategoryFilter}
                      >
                        <option value="">Всі категорії</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <input
                        className="h-11 rounded-md border border-[var(--border)] bg-[var(--page)] px-3 text-sm font-bold outline-none"
                        onChange={(event) => setProductSearch(event.target.value)}
                        placeholder="Пошук товару"
                        value={productSearch}
                      />
                      <button className="h-11 rounded-md bg-[var(--text)] px-5 text-sm font-black text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827]">
                        Знайти
                      </button>
                    </form>
                  </div>
                  <div className="grid gap-4 xl:grid-cols-2">
                    {products.map((product) => (
                      <article
                        className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--page)] p-4 md:grid-cols-[130px_1fr]"
                        key={product.id}
                      >
                        <ProductImage
                          alt={product.title}
                          className="min-h-[130px] rounded-md"
                          src={product.image}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-lg font-black">{product.title}</p>
                          <p className="mt-1 text-sm font-bold text-[var(--muted)]">
                            {product.category.name}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 text-sm font-black">
                            <span className="rounded-md bg-[var(--accent-soft)] px-2 py-1 text-[var(--accent-strong)]">
                              {formatPrice(product.price)}
                            </span>
                            <span className="rounded-md border border-[var(--border)] px-2 py-1">
                              {product.stock} шт.
                            </span>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <button
                              className="h-10 rounded-md border border-[var(--border)] px-3 text-sm font-black transition hover:border-[var(--accent)]"
                              onClick={() => startEditProduct(product)}
                              type="button"
                            >
                              Редагувати
                            </button>
                            <button
                              className="h-10 rounded-md border border-[var(--border)] px-3 text-sm font-black transition hover:border-[var(--rose)] hover:text-[var(--rose)]"
                              onClick={() => handleDeleteProduct(product.id)}
                              type="button"
                            >
                              Видалити
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {activeTab === "categories" ? (
              <section className="grid gap-5 lg:grid-cols-[380px_1fr]">
                <form
                  className="h-fit rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5"
                  onSubmit={handleCategorySubmit}
                >
                  <p className="text-xs font-black uppercase text-[var(--accent-strong)]">
                    Категорії
                  </p>
                  <h2 className="mt-1 text-2xl font-black">
                    {selectedCategory ? "Редагувати категорію" : "Створити категорію"}
                  </h2>
                  {selectedCategory ? (
                    <p className="mt-2 text-sm font-bold text-[var(--muted)]">
                      Змінюється: {selectedCategory.name}
                    </p>
                  ) : null}
                  <AdminInput
                    label="Назва категорії"
                    onChange={setCategoryName}
                    required
                    value={categoryName}
                  />
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      className="h-11 rounded-md bg-[var(--text)] px-5 text-sm font-black text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827] disabled:opacity-60"
                      disabled={isSavingCategory}
                      type="submit"
                    >
                      {isSavingCategory
                        ? "Збереження..."
                        : selectedCategory
                          ? "Оновити категорію"
                          : "Додати категорію"}
                    </button>
                    {selectedCategory ? (
                      <button
                        className="h-11 rounded-md border border-[var(--border)] px-4 text-sm font-black transition hover:border-[var(--accent)]"
                        onClick={resetCategoryForm}
                        type="button"
                      >
                        Скасувати
                      </button>
                    ) : null}
                  </div>
                </form>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
                  <h2 className="text-2xl font-black">Список категорій</h2>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {categories.map((category) => (
                      <div
                        className="rounded-lg border border-[var(--border)] bg-[var(--page)] p-4"
                        key={category.id}
                      >
                        <p className="text-lg font-black">{category.name}</p>
                        <p className="mt-1 text-sm font-bold text-[var(--muted)]">
                          Товарів: {category._count?.products ?? 0}
                        </p>
                        <button
                          className="mt-4 h-10 rounded-md border border-[var(--border)] px-3 text-sm font-black transition hover:border-[var(--accent)]"
                          onClick={() => startEditCategory(category)}
                          type="button"
                        >
                          Редагувати
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {activeTab === "promotions" ? (
              <section className="grid gap-5 lg:grid-cols-[420px_1fr]">
                <form
                  className="h-fit rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 lg:sticky lg:top-24"
                  onSubmit={handlePromotionSubmit}
                >
                  <p className="text-xs font-black uppercase text-[var(--accent-strong)]">
                    Товари дня
                  </p>
                  <h2 className="mt-1 text-2xl font-black">Акція на головній</h2>
                  <p className="mt-2 text-sm font-bold leading-6 text-[var(--muted)]">
                    Покажи добірку на головній сторінці та застосуй пряму знижку до кожного
                    товару з цієї добірки.
                  </p>

                  <AdminInput
                    label="Назва акції"
                    onChange={(value) => setPromotionForm({ ...promotionForm, title: value })}
                    required
                    value={promotionForm.title}
                  />
                  <AdminInput
                    label="Підпис"
                    onChange={(value) => setPromotionForm({ ...promotionForm, subtitle: value })}
                    required
                    value={promotionForm.subtitle}
                  />
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <AdminInput
                      label="Бейдж"
                      onChange={(value) => setPromotionForm({ ...promotionForm, badge: value })}
                      required
                      value={promotionForm.badge}
                    />
                    <AdminInput
                      label="Знижка %"
                      onChange={(value) =>
                        setPromotionForm({ ...promotionForm, discountPercent: value })
                      }
                      required
                      type="number"
                      value={promotionForm.discountPercent}
                    />
                  </div>

                  <label className="mt-4 flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--page)] p-4 text-sm font-black">
                    <input
                      checked={promotionForm.active}
                      onChange={(event) =>
                        setPromotionForm({ ...promotionForm, active: event.target.checked })
                      }
                      type="checkbox"
                    />
                    Акція активна
                  </label>

                  <button
                    className="mt-5 h-11 rounded-md bg-[var(--text)] px-5 text-sm font-black text-[var(--surface)] transition hover:bg-[var(--accent)] hover:text-[#111827] disabled:opacity-60"
                    disabled={isSavingPromotion}
                    type="submit"
                  >
                    {isSavingPromotion ? "Збереження..." : "Зберегти акцію"}
                  </button>
                </form>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
                  <div className="mb-5 border-b border-[var(--border)] pb-4">
                    <h2 className="text-2xl font-black">Товари в акції</h2>
                    <p className="mt-2 text-sm font-bold text-[var(--muted)]">
                      Обери товари для промо-блоку та прямої знижки у каталозі.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => {
                      const selected = promotionForm.productIds.includes(product.id);

                      return (
                        <button
                          className={`grid gap-3 rounded-lg border p-3 text-left transition ${
                            selected
                              ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                              : "border-[var(--border)] bg-[var(--page)] hover:border-[var(--accent)]"
                          }`}
                          key={product.id}
                          onClick={() => togglePromotionProduct(product.id)}
                          type="button"
                        >
                          <ProductImage
                            alt={product.title}
                            className="min-h-[120px] rounded-md"
                            src={product.image}
                          />
                          <span className="line-clamp-2 text-sm font-black">{product.title}</span>
                          <span className="text-xs font-bold text-[var(--muted)]">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-xs font-black text-[var(--accent-strong)]">
                            {selected ? "В акції" : "Додати до акції"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {promotion ? (
                    <p className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--page)] p-4 text-sm font-bold text-[var(--muted)]">
                      Зараз збережено: {promotion.title}, знижка {promotion.discountPercent}%,
                      товарів у добірці: {promotion.productIds.length}.
                    </p>
                  ) : null}
                </div>
              </section>
            ) : null}
          </>
        ) : null}
      </section>
    </main>
  );
}

function AdminTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`h-10 rounded-md px-4 text-sm font-black transition ${
        active
          ? "bg-[var(--text)] text-[var(--surface)]"
          : "text-[var(--muted)] hover:bg-[var(--page)] hover:text-[var(--text)]"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function AdminFormTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`h-9 rounded-md px-2 text-xs font-black transition ${
        active
          ? "bg-[var(--text)] text-[var(--surface)]"
          : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function AdminInput({
  label,
  onChange,
  placeholder,
  required = false,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="mt-4 block">
      <span className="text-sm font-bold">{label}</span>
      <input
        className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 text-sm font-bold outline-none"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function resizeProductImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Image file did not load as a data URL"));
        return;
      }

      const image = new Image();
      image.onerror = () => reject(new Error("Failed to load image"));
      image.onload = () => {
        const scale = Math.min(
          1,
          PRODUCT_IMAGE_MAX_DIMENSION / image.width,
          PRODUCT_IMAGE_MAX_DIMENSION / image.height
        );
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Canvas is not available"));
          return;
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", PRODUCT_IMAGE_QUALITY));
      };
      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}
