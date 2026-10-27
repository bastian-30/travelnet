import { useEffect, useState } from "react";
import { sampleReviews, type Review } from "../data/nicaragua";
import { useCatalog } from "../hooks/useCatalog";
import { guardarResena, obtenerResenas, type Resena } from "../services/api";

const reviewAvatar =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&auto=format";

function toReview(resena: Resena): Review {
  return {
    id: String(resena.id),
    author: resena.autor,
    avatar: reviewAvatar,
    date: new Date(resena.creado_en).toLocaleDateString("es-NI", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    rating: resena.calificacion,
    text: resena.comentario,
    siteId: resena.destino_id,
    siteName: resena.destino_nombre,
    departmentName: resena.departamento,
  };
}

type View =
  | { type: "home" }
  | { type: "department"; departmentId: string }
  | {
      type: "site";
      departmentId: string;
      siteId: string;
    }
  | { type: "live" }
  | { type: "reviews" };

interface ReviewsViewProps {
  onNavigate: (view: View) => void;
}

function StarRating({
  rating,
  interactive,
  onChange,
}: {
  rating: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          disabled={!interactive}
          onClick={() => onChange && onChange(s)}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <svg
            className="w-5 h-5 transition-colors"
            fill={s <= (hovered || rating) ? "#F4C430" : "rgba(244,196,48,0.2)"}
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#0A1A42",
        border: "1px solid rgba(26,111,196,0.15)",
      }}
    >
      {review.imageUrl && (
        <div className="relative h-44 overflow-hidden">
          <img src={review.imageUrl} alt={review.siteName} className="w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(10,26,66,0.9) 0%, transparent 55%)",
            }}
          />
          <div className="absolute bottom-3 left-3">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: "rgba(26,111,196,0.3)", color: "#3B8FE8" }}
            >
              {review.departmentName}
            </span>
          </div>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <img
              src={review.avatar}
              alt={review.author}
              className="w-9 h-9 rounded-full object-cover"
              style={{ border: "2px solid rgba(244,196,48,0.2)" }}
            />
            <div>
              <div className="font-semibold text-sm" style={{ color: "#F0F6FF" }}>
                {review.author}
              </div>
              <div className="text-xs" style={{ color: "#8BA3C7" }}>
                {review.date}
              </div>
            </div>
          </div>
          <StarRating rating={review.rating} />
        </div>

        <div className="text-xs mb-3 font-semibold" style={{ color: "#3B8FE8" }}>
          📍 {review.siteName}
        </div>

        <p className="text-sm leading-relaxed" style={{ color: "#8BA3C7" }}>
          {review.text}
        </p>
      </div>
    </div>
  );
}

export default function ReviewsView({ onNavigate }: ReviewsViewProps) {
  const [reviews, setReviews] = useState<Review[]>(sampleReviews);
  const [filterDept, setFilterDept] = useState("all");
  const [filterRating, setFilterRating] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const departments = useCatalog();

  // Form state
  const [formAuthor, setFormAuthor] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formText, setFormText] = useState("");
  const [formDept, setFormDept] = useState("");
  const [formSite, setFormSite] = useState("");
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    obtenerResenas()
      .then((list) => {
        if (!cancelled) {
          setReviews(list.map(toReview));
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = reviews.filter((r) => {
    const deptOk = filterDept === "all" || r.departmentName === filterDept;
    const ratingOk = filterRating === 0 || r.rating >= filterRating;
    return deptOk && ratingOk;
  });

  const availableSites = formDept ? departments.find((d) => d.name === formDept)?.sites || [] : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formAuthor || !formText || !formDept || !formSite || formRating === 0) return;

    const dept = departments.find((d) => d.name === formDept);
    const site = dept?.sites.find((s) => s.name === formSite);

    setFormError("");

    try {
      const created = await guardarResena({
        autor: formAuthor,
        calificacion: formRating,
        comentario: formText,
        destino_id: site?.id || "",
        destino_nombre: formSite,
        departamento: formDept,
      });

      setReviews([toReview(created), ...reviews]);
      setSubmitted(true);
      setFormAuthor("");
      setFormRating(5);
      setFormText("");
      setFormDept("");
      setFormSite("");
      setTimeout(() => {
        setSubmitted(false);
        setShowForm(false);
      }, 2500);
    } catch {
      setFormError("No se pudo guardar la reseña. Intenta de nuevo.");
    }
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "0";

  return (
    <div className="min-h-screen pt-16" style={{ background: "#050D28" }}>
      {/* Header */}
      <div className="px-4 py-8" style={{ borderBottom: "1px solid rgba(26,111,196,0.15)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
              >
                Reseñas de Viajeros
              </h1>
              <p className="text-sm mt-1" style={{ color: "#8BA3C7" }}>
                Experiencias reales en los sitios turísticos, históricos y coloniales de Nicaragua
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div
                  className="text-3xl font-bold"
                  style={{ fontFamily: "Fraunces, serif", color: "#F4C430" }}
                >
                  {avgRating}
                </div>
                <StarRating rating={Math.round(parseFloat(avgRating))} />
                <div className="text-xs mt-1" style={{ color: "#8BA3C7" }}>
                  {reviews.length} reseñas
                </div>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: "linear-gradient(135deg, #1A6FC4, #1B7A3E)",
                  color: "#F0F6FF",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                ✍️ Escribir Reseña
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Write Review Form */}
        {showForm && (
          <div
            className="mb-8 rounded-2xl p-6 animate-fade-in"
            style={{
              background: "#0A1A42",
              border: "1px solid rgba(26,111,196,0.25)",
            }}
          >
            <h2
              className="text-lg font-bold mb-5"
              style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
            >
              Comparte tu Experiencia
            </h2>

            {submitted ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-semibold" style={{ color: "#27AE60" }}>
                  ¡Gracias por tu reseña!
                </p>
                <p className="text-sm mt-1" style={{ color: "#8BA3C7" }}>
                  Tu experiencia ayuda a otros viajeros.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: "#8BA3C7" }}
                    >
                      Tu nombre *
                    </label>
                    <input
                      type="text"
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      placeholder="Ej: María López"
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: "rgba(5,13,40,0.7)",
                        border: "1px solid rgba(26,111,196,0.25)",
                        color: "#F0F6FF",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(59,143,232,0.5)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(26,111,196,0.25)")}
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: "#8BA3C7" }}
                    >
                      Calificación *
                    </label>
                    <div className="flex items-center gap-2 h-10">
                      <StarRating rating={formRating} interactive onChange={setFormRating} />
                      <span className="text-sm font-semibold" style={{ color: "#F4C430" }}>
                        {formRating}/5
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: "#8BA3C7" }}
                    >
                      Departamento *
                    </label>
                    <select
                      value={formDept}
                      onChange={(e) => {
                        setFormDept(e.target.value);
                        setFormSite("");
                      }}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{
                        background: "rgba(5,13,40,0.7)",
                        border: "1px solid rgba(26,111,196,0.25)",
                        color: formDept ? "#F0F6FF" : "#8BA3C7",
                      }}
                      required
                    >
                      <option value="">Selecciona un departamento</option>
                      {departments.map((d) => (
                        <option
                          key={d.id}
                          value={d.name}
                          style={{ background: "#0A1A42", color: "#F0F6FF" }}
                        >
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: "#8BA3C7" }}
                    >
                      Sitio visitado *
                    </label>
                    <select
                      value={formSite}
                      onChange={(e) => setFormSite(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{
                        background: "rgba(5,13,40,0.7)",
                        border: "1px solid rgba(26,111,196,0.25)",
                        color: formSite ? "#F0F6FF" : "#8BA3C7",
                      }}
                      disabled={!formDept}
                      required
                    >
                      <option value="">
                        {formDept ? "Selecciona un sitio" : "Primero elige el departamento"}
                      </option>
                      {availableSites.map((s) => (
                        <option
                          key={s.id}
                          value={s.name}
                          style={{ background: "#0A1A42", color: "#F0F6FF" }}
                        >
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: "#8BA3C7" }}
                  >
                    Tu experiencia *
                  </label>
                  <textarea
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    placeholder="Describe tu visita: ¿Qué te impresionó? ¿Qué recomendarías? ¿Cómo fue la experiencia general?"
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
                    style={{
                      background: "rgba(5,13,40,0.7)",
                      border: "1px solid rgba(26,111,196,0.25)",
                      color: "#F0F6FF",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(59,143,232,0.5)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(26,111,196,0.25)")}
                    required
                  />
                </div>

                {/* Image upload UI */}
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: "#8BA3C7" }}
                  >
                    Agregar imágenes (opcional)
                  </label>
                  <div
                    className="rounded-xl p-6 text-center cursor-pointer transition-all"
                    style={{
                      background: "rgba(5,13,40,0.5)",
                      border: "2px dashed rgba(26,111,196,0.25)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = "rgba(59,143,232,0.4)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = "rgba(26,111,196,0.25)")
                    }
                  >
                    <div className="text-2xl mb-2">📸</div>
                    <p className="text-sm font-semibold" style={{ color: "#8BA3C7" }}>
                      Arrastra imágenes aquí o haz clic para subir
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#4A6080" }}>
                      PNG, JPG hasta 10MB · Máximo 5 imágenes
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  {formError ? (
                    <p className="text-sm font-semibold" style={{ color: "#E53E3E" }}>
                      {formError}
                    </p>
                  ) : (
                    <span />
                  )}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{
                        background: "rgba(26,111,196,0.1)",
                        color: "#8BA3C7",
                        border: "1px solid rgba(26,111,196,0.2)",
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: "linear-gradient(135deg, #1A6FC4, #1B7A3E)",
                        color: "#F0F6FF",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                    >
                      Publicar Reseña
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: "#8BA3C7" }}>
              Departamento:
            </span>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-3 py-1.5 rounded-full text-xs outline-none"
              style={{
                background: "rgba(10,26,66,0.8)",
                border: "1px solid rgba(26,111,196,0.2)",
                color: "#F0F6FF",
              }}
            >
              <option value="" style={{ background: "#0A1A42" }}>
                Todos
              </option>
              {departments.map((d) => (
                <option key={d.id} value={d.name} style={{ background: "#0A1A42" }}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: "#8BA3C7" }}>
              Mínimo:
            </span>
            <div className="flex gap-1">
              {[0, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRating(r)}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: filterRating === r ? "rgba(244,196,48,0.15)" : "rgba(10,26,66,0.8)",
                    color: filterRating === r ? "#F4C430" : "#8BA3C7",
                    border:
                      filterRating === r
                        ? "1px solid rgba(244,196,48,0.3)"
                        : "1px solid rgba(26,111,196,0.15)",
                  }}
                >
                  {r === 0 ? "Todos" : `${r}★+`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#8BA3C7" }}>
            No hay reseñas con los filtros seleccionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
