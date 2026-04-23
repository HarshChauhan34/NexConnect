import { Search, ShoppingBag, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/useAuth";
import { deleteProduct, getProducts } from "../services/productService";

function Products() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingProductId, setDeletingProductId] = useState(null);

  const canDeleteProduct = (product) => {
    const role = user?.role;
    if (role === "admin") return true;
    if (role !== "organizer") return false;

    const createdById =
      typeof product.createdBy === "string"
        ? product.createdBy
        : product.createdBy?._id;

    return Boolean(createdById && createdById === user?._id);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      setDeletingProductId(productId);
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((item) => item._id !== productId));
      toast.success("Product deleted");
    } catch (apiError) {
      toast.error(apiError.response?.data?.message || "Failed to delete product.");
    } finally {
      setDeletingProductId(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts({
          search: debouncedQuery,
          page,
          limit: 6,
        });

        if (!isMounted) return;

        const newItems = response.data.items || [];
        setProducts((prev) => (page === 1 ? newItems : [...prev, ...newItems]));
        setHasMore(Boolean(response.data.hasMore));
        setError("");
      } catch (apiError) {
        if (isMounted) {
          setError(apiError.response?.data?.message || "Failed to fetch products.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, page]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65 sm:p-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Product Showcase
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Browse and search products from MongoDB with incremental loading.
        </p>

        <div className="relative mt-5">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => {
              setProducts([]);
              setQuery(event.target.value);
            }}
            placeholder="Search products..."
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.length === 0 && !loading && !error && (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white/70 p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
            No products found.
          </div>
        )}

        {products.map((product) => (
          <article
            key={product._id}
            className="flex h-full flex-col rounded-2xl border border-white/60 bg-white/80 p-5 shadow-md backdrop-blur-xl transition hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-950/65"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
                <ShoppingBag size={18} />
              </div>
              {canDeleteProduct(product) && (
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(product._id)}
                  disabled={deletingProductId === product._id}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 disabled:opacity-60 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/20"
                  aria-label="Delete product"
                  title="Delete product"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{product.type}</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                ${Number(product.price || 0).toFixed(2)}/month
              </span>
              <span className="inline-flex items-center gap-1 text-amber-600">
                <Star size={15} fill="currentColor" /> {Number(product.rating || 0).toFixed(1)}
              </span>
            </div>
          </article>
        ))}
      </section>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
          Loading products...
        </div>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setPage((prev) => prev + 1)}
            className="rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

export default Products;
