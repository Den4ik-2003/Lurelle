import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./products.css";
import Loader from "../../Components/Loader/loader";

import LikeIcon from "../../assets/Icons/like.svg";
import LikeFillIcon from "../../assets/Icons/likeFill.svg";
import StarIcon from "../../assets/Icons/starNew.svg";
import StarFillIcon from "../../assets/Icons/starFill.svg";
import StarHalfIcon from "../../assets/Icons/starHalf.svg";

import arrowLeft from "../../assets/Icons/arrowLeft.svg";
import arrowRight from "../../assets/Icons/arrowRight.svg";

const API_URL = import.meta.env.VITE_API_URL
const COMMENTS_URL = import.meta.env.VITE_COMMENTS_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const NAV_FILTER_KEY = "footerNavFilter";

const ITEMS_PER_PAGE = 24;
const SIZES = ["Міні", "Малий", "Середній", "Великий"];
const CATS_INITIAL = 5;
const BRANDS_INITIAL = 5;
const COLORS_INITIAL = 12;

function getAgeInDays(createdAt) {
  if (!createdAt) return null;
  const created = new Date(createdAt);
  if (isNaN(created.getTime())) return null;
  return (new Date() - created) / (1000 * 60 * 60 * 24);
}

function getBadge(product) {
  const ageDays = getAgeInDays(product.createdAt || product.uploadedAt || product.dateAdded);
  if (ageDays !== null && ageDays < 2) return { text: "Новинка", cls: "pc-badge-new", icon: "ti-sparkles" };
  if (ageDays !== null && ageDays >= 2 && ageDays <= 7) return { text: "Хіт", cls: "pc-badge-hit", icon: "ti-flame" };
  if (product.oldPrice && product.newPrice < product.oldPrice) {
    const discount = Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100);
    return { text: `-${discount}%`, cls: "pc-badge-sale", icon: "ti-tag" };
  }
  return null;
}

function getBadgeRank(product) {
  const ageDays = getAgeInDays(product.createdAt || product.uploadedAt || product.dateAdded);
  if (ageDays !== null && ageDays < 2) return 0;
  if (ageDays !== null && ageDays >= 2 && ageDays <= 7) return 1;
  return 2;
}

function stableHash(id) {
  const str = String(id ?? "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function calcAvgRating(comments) {
  if (!Array.isArray(comments) || comments.length === 0) return null;
  const sum = comments.reduce((acc, c) => acc + (Number(c.rating) || 0), 0);
  return sum / comments.length;
}

function StarRow({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) stars.push("fill");
    else if (i - rating < 1 && i - rating >= 0.5) stars.push("half");
    else stars.push("empty");
  }
  return (
    <div className="pc-stars">
      {stars.map((type, i) => (
        <img key={i} src={type === "fill" ? StarFillIcon : type === "half" ? StarHalfIcon : StarIcon} alt="" width={14} height={14} />
      ))}
    </div>
  );
}

function ShowMoreBtn({ shown, total, onToggle, labelMore, labelLess }) {
  if (total <= shown) return null;
  return (
    <button className="filter-show-more " onClick={onToggle}>
      {labelMore}
      <i className={`ti ti-chevron-${labelMore === labelLess ? "up" : "down"}`} />
    </button>
  );
}

function ProductCard({ product, liked, onToggleLike }) {
  const images = Array.isArray(product.images) && product.images.length ? product.images : product.image ? [product.image] : [];
  const mainImage = images[0];
  const available = Number(product.inStock) > 0;
  const badge = getBadge(product);
  const hasComments = Array.isArray(product.comments) && product.comments.length > 0;
  const avgRating = calcAvgRating(product.comments) ?? product.rating ?? 0;
  const reviewCount = hasComments ? product.comments.length : 0;
  const hasDiscount = product.oldPrice && product.newPrice < product.oldPrice;
  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };

  return (
    <div className={`pc-card ${!available ? "pc-card--oos" : ""}`}>
      {badge && (
        <span className={`pc-badge ${badge.cls}`}>
          {badge.icon && <i className={`ti ${badge.icon}`} />}
          {badge.text}
        </span>
      )}
      <button className={`pc-wishlist ${liked ? "active" : ""}`} onClick={(e) => { stop(e); onToggleLike(product.id); }} aria-label="Додати до обраного">
        <img src={liked ? LikeFillIcon : LikeIcon} alt="like" width={20} height={20} />
      </button>
      <div className="pc-img-wrap">
        {mainImage ? <img src={mainImage} alt={product.name} className="pc-img" /> : <div className="pc-img-placeholder"><i className="ti ti-photo" /></div>}
        {!available && <div className="pc-out-overlay"><span>Немає в наявності</span></div>}
      </div>
      <div className="pc-body">
        <div className="pc-label-rows">
          {product.category && <span className="pc-label pc-label-cat">{product.category}</span>}
          {product.brand && <span className="pc-label pc-label-brand">{product.brand}</span>}
        </div>
        <h3 className="pc-name">{product.name}</h3>
        <p className="pc-desc" dangerouslySetInnerHTML={{ __html: product.description }} />
        <div className="pc-rating-row">
          {hasComments ? (
            <>
              <StarRow rating={avgRating} />
              <span className="pc-rating-val">{avgRating.toFixed(1)}</span>
              <span className="pc-review-count">({reviewCount} відгуків)</span>
            </>
          ) : (
            <span className="pc-review-count pc-no-reviews">Поки немає відгуків</span>
          )}
        </div>
        <div className="pc-price-rows">
          {hasDiscount && <span className="pc-price-old">{product.oldPrice.toLocaleString("uk-UA")} грн</span>}
          <span className="pc-price-new">{product.newPrice.toLocaleString("uk-UA")} грн</span>
        </div>
      </div>
    </div>
  );
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("popular");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selCats, setSelCats] = useState([]);
  const [selBrands, setSelBrands] = useState([]);
  const [selSizes, setSelSizes] = useState([]);
  const [selColors, setSelColors] = useState([]);
  const [priceMax, setPriceMax] = useState(10000);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [apiColors, setApiColors] = useState([]);

  const [catsExpanded, setCatsExpanded] = useState(false);
  const [brandsExpanded, setBrandsExpanded] = useState(false);
  const [colorsExpanded, setColorsExpanded] = useState(false);

  const [likedIds, setLikedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("likedItems")) || []; } catch { return []; }
  });

  const toggleLike = (id) => {
    const current = JSON.parse(localStorage.getItem("likedItems")) || [];
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    localStorage.setItem("likedItems", JSON.stringify(next));
    setLikedIds(next);
    window.dispatchEvent(new Event("localStorageUpdate"));
  };

  const location = useLocation();
  const searchTerm = new URLSearchParams(location.search).get("search")?.toLowerCase() || "";

  const applyNavFilter = () => {
    const raw = localStorage.getItem(NAV_FILTER_KEY);
    if (!raw) return;
    try {
      const filter = JSON.parse(raw);
      setSelCats([]);
      setSelBrands([]);
      setSort("popular");
      if (filter.type === "category") setSelCats([filter.value]);
      if (filter.type === "brand") setSelBrands([filter.value]);
      if (filter.type === "sort") setSort(filter.value);
    } catch {}
    localStorage.removeItem(NAV_FILTER_KEY);
  };

  useEffect(() => {
    applyNavFilter();
    window.addEventListener("footerNavFilter", applyNavFilter);
    return () => window.removeEventListener("footerNavFilter", applyNavFilter);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(API_URL, { headers: { "x-api-key": API_KEY } }).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
      fetch(COMMENTS_URL, { headers: { "x-api-key": API_KEY } }).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).catch(() => []),
    ])
      .then(([productsData, commentsData]) => {
        const commentsByProductId = {};
        (Array.isArray(commentsData) ? commentsData : []).forEach((c) => {
          if (!commentsByProductId[c.productId]) commentsByProductId[c.productId] = [];
          commentsByProductId[c.productId].push(c);
        });
        const merged = productsData.map((p) => ({ ...p, comments: commentsByProductId[p.id] || [] }));
        setProducts(merged);
        const max = Math.max(...merged.map((p) => p.newPrice ?? 0), 10000);
        setPriceMax(max);
        setPriceRange([0, max]);
        const colorMap = {};
        merged.forEach((p) => { if (p.color) colorMap[p.color] = p.color; });
        setApiColors(Object.entries(colorMap).map(([name, hex]) => ({ name, hex: hex || "#888888" })));
        setLoading(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  // Build counts and sort by count descending
  const catCounts = {};
  const brandCounts = {};
  products.forEach((p) => {
    if (p.category) catCounts[p.category] = (catCounts[p.category] || 0) + 1;
    if (p.brand) brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
  });
  const categories = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a]);
  const brands = Object.keys(brandCounts).sort((a, b) => brandCounts[b] - brandCounts[a]);

  const visibleCats = catsExpanded ? categories : categories.slice(0, CATS_INITIAL);
  const visibleBrands = brandsExpanded ? brands : brands.slice(0, BRANDS_INITIAL);
  const visibleColors = colorsExpanded ? apiColors : apiColors.slice(0, COLORS_INITIAL);

  const normalizeStr = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "");

  useEffect(() => {
    let result = [...products];
    if (searchTerm) {
      const t = normalizeStr(searchTerm);
      result = result.filter((p) => normalizeStr(p.name || "").includes(t) || normalizeStr(p.description || "").includes(t));
    }
    if (selCats.length) result = result.filter((p) => selCats.includes(p.category));
    if (selBrands.length) result = result.filter((p) => selBrands.includes(p.brand));
    if (selSizes.length) result = result.filter((p) => Array.isArray(p.sizes) && p.sizes.some((s) => selSizes.includes(s)));
    if (selColors.length) result = result.filter((p) => selColors.includes(p.color));
    result = result.filter((p) => p.newPrice >= priceRange[0] && p.newPrice <= priceRange[1]);

    if (sort === "popular") result.sort((a, b) => stableHash(a.id) - stableHash(b.id));
    if (sort === "price-asc") result.sort((a, b) => a.newPrice - b.newPrice);
    if (sort === "price-desc") result.sort((a, b) => b.newPrice - a.newPrice);
    if (sort === "rating") result.sort((a, b) => { const ra = calcAvgRating(a.comments) ?? a.rating ?? 0; const rb = calcAvgRating(b.comments) ?? b.rating ?? 0; return rb - ra; });
    if (sort === "new") {
      result.sort((a, b) => {
        const rankA = getBadgeRank(a); const rankB = getBadgeRank(b);
        if (rankA !== rankB) return rankA - rankB;
        const ageA = getAgeInDays(a.createdAt || a.uploadedAt || a.dateAdded);
        const ageB = getAgeInDays(b.createdAt || b.uploadedAt || b.dateAdded);
        return (ageA ?? Infinity) - (ageB ?? Infinity);
      });
    }
    result.sort((a, b) => { const aO = Number(a.inStock) === 0; const bO = Number(b.inStock) === 0; return aO === bO ? 0 : aO ? 1 : -1; });

    setFiltered(result);
    setPage(1);
  }, [products, searchTerm, selCats, selBrands, selSizes, selColors, priceRange, sort]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageProducts = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleArr = (arr, setArr, val) => {
    localStorage.removeItem(NAV_FILTER_KEY);
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const resetFilters = () => {
    localStorage.removeItem(NAV_FILTER_KEY);
    setSelCats([]);
    setSelBrands([]);
    setSelSizes([]);
    setSelColors([]);
    setPriceRange([0, priceMax]);
  };

  const getPaginationPages = () => {
    const pages = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const activeFilterCount = selCats.length + selBrands.length + selSizes.length + selColors.length;

  return (
    <section className="products-page container">
      <Helmet>
        <title>Жіночі сумки | Premium Collection | Lurelle</title>
        <meta name="description" content="Купити жіночі сумки в Україні. Шкіряні сумки, клатчі, крос-боді та інший преміум аксесуар. Оригінальний стиль, висока якість та швидка доставка по всій Україні." />
        <meta name="keywords" content="жіночі сумки, шкіряні сумки, преміум аксесуари, дизайнерські сумки, купити сумку Україна, клатч, крос-боді" />
        <link rel="canonical" href="https://lurelle.netlify.app/products" />
      </Helmet>

      <button className="sidebar-toggle" onClick={() => setSidebarOpen((o) => !o)}>
        <i className="ti ti-adjustments-horizontal" /> Фільтри
        {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
      </button>

      <div className="products-layout">
        <aside className={`products-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <span className="sidebar-title">Фільтри</span>
            <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Закрити фільтри">
              <i className="ti ti-x" />
            </button>
          </div>

          {/* CATEGORIES */}
          <div className="filter-group">
            <div className="filter-group-head">Категорії <i className="ti ti-chevron-up" /></div>
            <div className="filter-group-body">
              {visibleCats.map((cat) => (
                <label key={cat} className="filter-check">
                  <input type="checkbox" checked={selCats.includes(cat)} onChange={() => toggleArr(selCats, setSelCats, cat)} />
                  <span className="check-box" />
                  <span className="check-label">{cat}</span>
                  <span className="check-count">{catCounts[cat]}</span>
                </label>
              ))}
              {categories.length > CATS_INITIAL && (
                <button className="filter-show-more button" onClick={() => setCatsExpanded((x) => !x)}>
                  {catsExpanded ? "Сховати" : `Ще ${categories.length - CATS_INITIAL}`}
                  <i className={`ti ti-chevron-${catsExpanded ? "up" : "down"}`} />
                </button>
              )}
            </div>
          </div>

          {/* BRANDS */}
          <div className="filter-group">
            <div className="filter-group-head">Бренди <i className="ti ti-chevron-up" /></div>
            <div className="filter-group-body">
              {visibleBrands.map((br) => (
                <label key={br} className="filter-check">
                  <input type="checkbox" checked={selBrands.includes(br)} onChange={() => toggleArr(selBrands, setSelBrands, br)} />
                  <span className="check-box" />
                  <span className="check-label">{br}</span>
                  <span className="check-count">{brandCounts[br]}</span>
                </label>
              ))}
              {brands.length > BRANDS_INITIAL && (
                <button className="filter-show-more button" onClick={() => setBrandsExpanded((x) => !x)}>
                  {brandsExpanded ? "Сховати" : `Ще ${brands.length - BRANDS_INITIAL}`}
                  <i className={`ti ti-chevron-${brandsExpanded ? "up" : "down"}`} />
                </button>
              )}
            </div>
          </div>

          {/* SIZES */}
          <div className="filter-group">
            <div className="filter-group-head">Розмір <i className="ti ti-chevron-up" /></div>
            <div className="filter-group-body">
              <div className="size-grid">
                {SIZES.map((sz) => (
                  <button key={sz} className={`size-btn ${selSizes.includes(sz) ? "active" : ""}`} onClick={() => toggleArr(selSizes, setSelSizes, sz)}>{sz}</button>
                ))}
              </div>
            </div>
          </div>

          {/* COLORS */}
          {apiColors.length > 0 && (
            <div className="filter-group">
              <div className="filter-group-head">Колір <i className="ti ti-chevron-up" /></div>
              <div className="filter-group-body">
                <div className="color-grid">
                  {visibleColors.map((c) => (
                    <button key={c.name} className={`color-btn ${selColors.includes(c.name) ? "active" : ""}`} style={{ "--clr": c.hex }} title={c.name} onClick={() => toggleArr(selColors, setSelColors, c.name)}>
                      <span className="color-circle" style={{ background: c.hex }} />
                    </button>
                  ))}
                </div>
                {apiColors.length > COLORS_INITIAL && (
                  <button className="filter-show-more button" onClick={() => setColorsExpanded((x) => !x)}>
                    {colorsExpanded ? "Сховати" : `Ще ${apiColors.length - COLORS_INITIAL}`}
                    <i className={`ti ti-chevron-${colorsExpanded ? "up" : "down"}`} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PRICE */}
          <div className="filter-group">
            <div className="filter-group-head">Ціна (грн) <i className="ti ti-chevron-up" /></div>
            <div className="filter-group-body">
              <div className="price-labels">
                <span>{priceRange[0].toLocaleString("uk-UA")}</span>
                <span>{priceRange[1].toLocaleString("uk-UA")}</span>
              </div>
              <input type="range" min={0} max={priceMax} step={50} value={priceRange[0]} className="price-range-input" onChange={(e) => { localStorage.removeItem(NAV_FILTER_KEY); const v = Number(e.target.value); if (v <= priceRange[1]) setPriceRange([v, priceRange[1]]); }} />
              <input type="range" min={0} max={priceMax} step={50} value={priceRange[1]} className="price-range-input" onChange={(e) => { localStorage.removeItem(NAV_FILTER_KEY); const v = Number(e.target.value); if (v >= priceRange[0]) setPriceRange([priceRange[0], v]); }} />
            </div>
          </div>

          <button className="reset-filters-btn" onClick={resetFilters}>Скинути фільтри</button>
        </aside>

        <div className="products-main">
          <div className="products-toolbar">
            <p className="products-found">Знайдено <span className="found-count">{filtered.length}</span> товарів</p>
            <div className="toolbar-right">
              <select className="sort-select" value={sort} onChange={(e) => { localStorage.removeItem(NAV_FILTER_KEY); setSort(e.target.value); }}>
                <option value="popular">Популярні</option>
                <option value="new">Новинки</option>
                <option value="price-asc">Ціна ↑</option>
                <option value="price-desc">Ціна ↓</option>
                <option value="rating">Рейтинг</option>
              </select>
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : error ? (
            <p className="no-results"><i className="ti ti-alert-circle" /> Помилка завантаження: {error}</p>
          ) : pageProducts.length === 0 ? (
            <p className="no-results"><i className="ti ti-mood-empty" /> Товари за цим фільтром не знайдено</p>
          ) : (
            <>
              <div className="products-grid">
                {pageProducts.map((item) => (
                  <NavLink key={item.id} to={`/product/${item.id}`} className="pc-card-link">
                    <ProductCard product={item} liked={likedIds.includes(item.id)} onToggleLike={toggleLike} />
                  </NavLink>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pg-btn pg-arrow"
                    disabled={page === 1}
                    onClick={() => { setPage((p) => p - 1); scrollToTop(); }}
                  >
                    <img src={arrowLeft} alt="Попередня сторінка" width={18} height={18} />
                  </button>

                  {getPaginationPages().map((p, i) =>
                    p === "..." ? (
                      <span key={`e${i}`} className="pg-ellipsis">…</span>
                    ) : (
                      <button
                        key={p}
                        className={`pg-btn ${p === page ? "active" : ""}`}
                        onClick={() => { setPage(p); scrollToTop(); }}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    className="pg-btn pg-arrow"
                    disabled={page === totalPages}
                    onClick={() => { setPage((p) => p + 1); scrollToTop(); }}
                  >
                    <img src={arrowRight} alt="Наступна сторінка" width={18} height={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
    </section>
  );
}