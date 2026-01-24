import { motion } from 'framer-motion';
import { Package, Star } from 'lucide-react';

export interface DomesticProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  image?: string;
  price?: string;
  rating?: number;
  reviewCount?: number;
}

interface DomesticProductListProps {
  products: DomesticProduct[];
  selectedProduct: DomesticProduct | null;
  onSelectProduct: (product: DomesticProduct) => void;
}

export default function DomesticProductList({ products, selectedProduct, onSelectProduct }: DomesticProductListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 shadow-xl h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <Package className="w-5 h-5 text-rose-600" />
        <h3 className="text-slate-900 font-bold text-lg">🇰🇷 한국 인기 제품</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {products.map((product, index) => (
          <motion.button
            key={product.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            onClick={() => onSelectProduct(product)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
              selectedProduct?.id === product.id
                ? 'border-rose-500 bg-rose-50 shadow-md'
                : 'border-slate-200 bg-slate-50 hover:border-rose-300 hover:bg-rose-50/50'
            }`}
          >
            <div className="flex items-center gap-3">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                />
              ) : (
                <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-rose-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-rose-600 font-medium">{product.brand}</div>
                <div className="text-sm font-semibold text-slate-900 truncate">{product.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  {product.price && (
                    <span className="text-xs font-medium text-slate-700">{product.price}</span>
                  )}
                  {product.rating && (
                    <span className="flex items-center gap-0.5 text-xs text-amber-600">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {product.rating.toFixed(1)}
                    </span>
                  )}
                  {product.reviewCount && (
                    <span className="text-xs text-slate-400">({product.reviewCount.toLocaleString()})</span>
                  )}
                </div>
              </div>
              {selectedProduct?.id === product.id && (
                <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
