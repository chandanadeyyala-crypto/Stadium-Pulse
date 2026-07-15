import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getFacilities } from '../utils/api';
import { useTranslation } from '../utils/useTranslation';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  Utensils,
  Search,
  Check,
  Compass,
  Loader2,
  AlertCircle,
  Accessibility,
  Clock,
  MapPin,
  Filter
} from 'lucide-react';

export default function FoodDrinksPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { highContrast } = useAccessibility();

  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(location.state?.category || 'all');
  const [dietaryFilters, setDietaryFilters] = useState({
    Vegetarian: false,
    Vegan: false,
    Halal: false
  });
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [openOnly, setOpenOnly] = useState(false);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        const res = await getFacilities();
        // Only include facilities that match food & drink categories
        const foodDrinkCategories = [
          'Meals', 'Snacks', 'Vegetarian', 'Vegan', 'Halal',
          'Beverages', 'Water stations', 'Coffee', 'Desserts'
        ];
        const foodFacilities = res.data.filter(facility => 
          facility.category && (foodDrinkCategories.includes(facility.category) || facility.id.includes('Food') || facility.id.includes('Water') || facility.id.includes('Beverage') || facility.id.includes('Coffee'))
        );
        setFacilities(foodFacilities);
      } catch (err) {
        console.error('Error fetching food and drinks facilities:', err);
        setError(t('Failed to load menu options. Please check your connection.'));
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [t]);

  const categories = [
    { id: 'all', label: t('All Items') },
    { id: 'Meals', label: t('Meals') },
    { id: 'Snacks', label: t('Snacks') },
    { id: 'Vegetarian', label: t('Vegetarian') },
    { id: 'Vegan', label: t('Vegan') },
    { id: 'Halal', label: t('Halal') },
    { id: 'Beverages', label: t('Beverages') },
    { id: 'Water stations', label: t('Water stations') },
    { id: 'Coffee', label: t('Coffee') },
    { id: 'Desserts', label: t('Desserts') }
  ];

  const handleDietaryToggle = (diet) => {
    setDietaryFilters(prev => ({
      ...prev,
      [diet]: !prev[diet]
    }));
  };

  const handleNavigate = (facilityId) => {
    navigate('/smart-navigation', {
      state: { startNode: 'Gate B', destinationNode: facilityId }
    });
  };

  // Filtering Logic
  const filteredFacilities = facilities.filter(facility => {
    // 1. Search Query (Name, Description, or Zone)
    const matchesSearch = searchQuery === '' || 
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (facility.description && facility.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (facility.zone && facility.zone.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Category Filter
    // Note: Category filter matches facility.category. Also if category is 'Vegetarian' / 'Vegan' / 'Halal',
    // it can match category name or dietary tags array
    const matchesCategory = selectedCategory === 'all' || 
      facility.category === selectedCategory ||
      (selectedCategory === 'Vegetarian' && facility.dietary?.includes('Vegetarian')) ||
      (selectedCategory === 'Vegan' && facility.dietary?.includes('Vegan')) ||
      (selectedCategory === 'Halal' && facility.dietary?.includes('Halal'));

    // 3. Dietary Filter (AND match for selected dietary requirements)
    const matchesDietary = Object.entries(dietaryFilters).every(([diet, active]) => {
      if (!active) return true;
      return facility.dietary?.includes(diet) || facility.category === diet;
    });

    // 4. Accessibility Filter
    const matchesAccessibility = !accessibleOnly || 
      facility.accessibility?.toLowerCase().includes('accessible') || 
      facility.isAccessible;

    // 5. Open Only Filter
    const matchesOpen = !openOnly || facility.status === 'open';

    return matchesSearch && matchesCategory && matchesDietary && matchesAccessibility && matchesOpen;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="bg-electricBlue/10 p-2.5 rounded-xl border border-electricBlue/20">
          <Utensils className="text-electricBlue" size={22} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white uppercase tracking-wider">
            {t('Food & Drinks')}
          </h1>
          <p className="text-xs text-slate-400">
            {t('Browse dining options, dietary tags, and water stations near your zone.')}
          </p>
        </div>
      </div>

      {/* Main Filter Section */}
      <div className="glass-panel p-4 md:p-6 rounded-2xl border border-slate-800 space-y-4">
        {/* Search and Quick Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={t('Search options, zones, keywords...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stadiumNavy border border-slate-700 hover:border-slate-600 focus:border-electricBlue rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAccessibleOnly(prev => !prev)}
              className={`px-3 py-2 border rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                accessibleOnly 
                  ? 'bg-electricBlue border-electricBlue text-white shadow-md' 
                  : 'bg-stadiumNavy border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <Accessibility size={13} />
              <span>{t('Accessible Only')}</span>
            </button>

            <button
              onClick={() => setOpenOnly(prev => !prev)}
              className={`px-3 py-2 border rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                openOnly 
                  ? 'bg-pitchGreen border-pitchGreen text-white shadow-md' 
                  : 'bg-stadiumNavy border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <Clock size={13} />
              <span>{t('Open Now')}</span>
            </button>
          </div>
        </div>

        {/* Categories Carousel */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('Categories')}</label>
          <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-electricBlue text-white shadow-md'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Filters Checkboxes */}
        <div className="border-t border-slate-800/80 pt-3 flex flex-wrap items-center gap-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Filter size={11} />
            {t('Dietary Options')}:
          </span>
          <div className="flex items-center gap-3">
            {Object.keys(dietaryFilters).map((diet) => (
              <label 
                key={diet} 
                className="flex items-center space-x-2 text-xs font-semibold text-slate-300 cursor-pointer select-none"
              >
                <button
                  type="button"
                  onClick={() => handleDietaryToggle(diet)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    dietaryFilters[diet]
                      ? 'bg-electricBlue border-electricBlue text-white'
                      : 'bg-stadiumNavy border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {dietaryFilters[diet] && <Check size={10} strokeWidth={3} />}
                </button>
                <span>{t(diet)}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Main Results Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-2">
          <Loader2 className="animate-spin text-electricBlue" size={32} />
          <span className="text-xs text-slate-400 font-semibold">{t('Retrieving menu details...')}</span>
        </div>
      ) : error ? (
        <div className="p-6 border border-red-500/20 bg-red-500/5 text-center text-xs text-criticalRed rounded-2xl flex flex-col items-center space-y-2">
          <AlertCircle size={24} />
          <span>{error}</span>
        </div>
      ) : filteredFacilities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFacilities.map((facility) => (
            <div 
              key={facility.id} 
              className={`operations-card p-4 md:p-5 flex flex-col justify-between space-y-4 hover:scale-[1.01] transition-all duration-200 ${
                highContrast ? 'border-2 border-white bg-black' : ''
              }`}
            >
              {/* Top part: Name & Badges */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {facility.name}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1">
                      <MapPin size={12} className="text-slate-500 shrink-0" />
                      <span className="font-semibold">{facility.zone || t('Stadium Venue')}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                    facility.status === 'open' 
                      ? 'bg-pitchGreen/10 text-pitchGreen border border-pitchGreen/20' 
                      : 'bg-red-500/10 text-criticalRed border border-red-500/20'
                  }`}>
                    {facility.status === 'open' ? t('Open') : t('Closed')}
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  {facility.description || t('No description available.')}
                </p>

                {/* Tags section */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="bg-stadiumNavy border border-slate-800 rounded px-2 py-0.5 text-[9px] font-bold text-slate-300 uppercase">
                    {facility.category}
                  </span>

                  {facility.accessibility && (
                    <span className="bg-indigo-500/10 border border-indigo-500/20 rounded px-2 py-0.5 text-[9px] font-bold text-indigo-400 flex items-center space-x-0.5">
                      <Accessibility size={9} />
                      <span>{facility.accessibility}</span>
                    </span>
                  )}

                  {facility.dietary && facility.dietary.map(diet => (
                    <span key={diet} className="bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                      {diet}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom part: Info, Label & Navigate */}
              <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block font-mono">
                    {t('Configured venue information')}
                  </span>
                  <span className="text-[9px] text-slate-500 block font-mono">
                    {t('Updated')} {facility.lastUpdated || t('just now')}
                  </span>
                </div>

                <button
                  onClick={() => handleNavigate(facility.id)}
                  className="px-3.5 py-2 bg-electricBlue hover:bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-md cursor-pointer shrink-0"
                >
                  <Compass size={13} />
                  <span>{t('Navigate')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-2">
          <Utensils className="mx-auto text-slate-600" size={32} />
          <h3 className="text-sm font-bold text-white">{t('No facilities found')}</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {t('Try adjusting your search query, selecting another category, or removing dietary restrictions.')}
          </p>
        </div>
      )}
    </div>
  );
}
