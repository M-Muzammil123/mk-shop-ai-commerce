import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50/80 border-t border-gray-100 py-12 dark:bg-black/40 dark:border-gray-900 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Branding */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-black text-xs tracking-tighter">
                MK
              </div>
              <span className="text-lg font-black tracking-tight">MK SHOP</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              Shop smarter with AI. Natural language query understanding, product intelligence, and conversational discovery.
            </p>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4">Shop Catalog</h4>
            <ul className="space-y-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
              <li><Link href="/shop" className="hover:text-blue-500">All Products</Link></li>
              <li><Link href="/shop?category=electronics" className="hover:text-blue-500">Electronics</Link></li>
              <li><Link href="/shop?category=fashion" className="hover:text-blue-500">Fashion</Link></li>
              <li><Link href="/shop?category=home-living" className="hover:text-blue-500">Home & Living</Link></li>
            </ul>
          </div>

          {/* Column 3: Platform */}
          <div>
            <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4">AI Platform</h4>
            <ul className="space-y-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
              <li><Link href="/shop?mode=ai" className="hover:text-blue-500">Natural AI Search</Link></li>
              <li><Link href="/shop?mode=compare" className="hover:text-blue-500">Spec Comparison</Link></li>
              <li><Link href="/cart" className="hover:text-blue-500">AI Cart Assistant</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4">MK SHOP Updates</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Subscribe for early releases and special codes.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black/60 outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button className="text-xs px-4 py-2.5 bg-black text-white dark:bg-white dark:text-black font-bold rounded-xl hover:opacity-85">
                Join
              </button>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-100 dark:border-gray-900 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 font-medium">
          <p>© 2026 MK SHOP. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="opacity-75">Privacy Policy</span>
            <span className="opacity-75">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
