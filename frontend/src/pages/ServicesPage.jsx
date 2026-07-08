//servicepage
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { bookingService } from "../services/bookingService";
import { formatNaira } from "../utils/helpers";

const FALLBACK_SERVICES = [
  {
    id: 1,
    name: "Wash & Fold",
    icon: "🧺",
    price: 500,
    price_unit: "per_item",
    description:
      "Fast and efficient. Ideal for everyday wear, gym clothes, and towels. Expertly washed, softened, and neatly folded.",
    features: ["Neat folding", "Color separation", "Same-day available"],
  },
  {
    id: 2,
    name: "Wash & Iron",
    icon: "👔",
    price: 500,
    price_unit: "per_item",
    description:
      "Premium complete care. Your clothes are washed, dried, and professionally steam-pressed for a crisp finish.",
    features: [
      "Professional pressing",
      "Eco-friendly detergents",
      "24-48h turnaround",
    ],
  },
  {
    id: 3,
    name: "Dry Cleaning",
    icon: "💨",
    price: 500,
    price_unit: "per_item",
    description:
      "Expert care for suits, silk, and formal garments using eco-safe solvents. Hanger delivery included.",
    features: ["Eco-safe solvents", "Hanger delivery", "Stain treatment"],
  },
];

export default function ServicesPage() {
  const { data: services = FALLBACK_SERVICES, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: bookingService.getServices,
    placeholderData: FALLBACK_SERVICES,
  });
  const serviceList =
    Array.isArray(services) && services.length > 0 ? services : FALLBACK_SERVICES;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-display">
          Select a Service
        </h1>
        <p className="text-slate-500 mt-1">
          Choose the best care for your garments. Prices in Nigerian Naira (₦).
        </p>
      </div>

      {/* Service cards */}
      <div className="space-y-5">
        {isLoading
          ? [1, 2, 3].map((i) => (
              <div key={i} className="card h-48 animate-pulse bg-slate-100" />
            ))
          : serviceList.map((service) => (
              <div
                key={service.id}
                className="card overflow-hidden hover:shadow-card-lg transition-all group"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image / emoji */}
                  <div className="md:w-56 bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center py-10 flex-shrink-0">
                    <span className="text-7xl">{service.icon || "🧺"}</span>
                  </div>
                  {/* Content */}
                  <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-primary-600 text-2xl">
                          local_laundry_service
                        </span>
                        <h2 className="text-2xl font-bold text-slate-900 font-display">
                          {service.name}
                        </h2>
                      </div>
                      <p className="text-slate-500 text-base leading-relaxed mb-4">
                        {service.description}
                      </p>
                      <ul className="flex flex-wrap gap-x-6 gap-y-2">
                        {(service.features || []).map((f) => (
                          <li
                            key={f}
                            className="flex items-center gap-2 text-sm text-slate-600"
                          >
                            <span className="material-symbols-outlined text-emerald-500 text-base">
                              check_circle
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-5 border-t border-slate-100">
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                          Pricing
                        </div>
                        <div className="text-2xl font-bold text-slate-900 font-display">
                          {formatNaira(service.price)}
                          <span className="text-sm font-normal text-slate-400">
                            {" "}
                            / {service.price_unit?.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/book/${service.id}`}
                        state={{ service }}
                        className="btn-primary min-w-[160px] justify-center"
                      >
                        Select Service
                        <span className="material-symbols-outlined text-xl">
                          chevron_right
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Custom plan */}
      <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary-50 border-primary-200">
        <div>
          <h3 className="text-lg font-bold text-slate-900 font-display">
            Need a custom plan?
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            We offer special rates for bulk orders, hostels, and commercial
            services.
          </p>
        </div>
        <a
          href="dayagilcore@gmail.com"
          className="btn-outline flex-shrink-0"
        >
          Contact Support
          <span className="material-symbols-outlined text-base">
            open_in_new
          </span>
        </a>
      </div>
    </div>
  );
}
