import { useTranslation } from 'react-i18next';
import { SUBJECTS } from '../../utils/helpers';
import { MOROCCO_CITIES } from '../../utils/searchUrl';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, resetFilters } from '../../store/slices/uiSlice';

const FilterPanel = ({ onApply, showCity = true, showDelivery = true }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.ui);

  const handleChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleApply = () => {
    onApply?.(filters);
  };

  const handleReset = () => {
    dispatch(resetFilters());
    onApply?.({});
  };

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{t('filters.title')}</h3>
        <button type="button" onClick={handleReset} className="text-sm text-primary hover:underline">
          {t('common.reset')}
        </button>
      </div>

      {showCity && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t('filters.city')}</label>
          <select
            value={filters.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            className="input-field text-sm"
          >
            <option value="">{t('filters.allCities')}</option>
            {MOROCCO_CITIES.filter((c) => c !== 'All cities').map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      )}

      {showCity && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t('filters.neighborhood')}</label>
          <input
            type="text"
            value={filters.neighborhood || ''}
            onChange={(e) => handleChange('neighborhood', e.target.value)}
            placeholder={t('filters.neighborhoodPlaceholder')}
            className="input-field text-sm"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">{t('filters.subject')}</label>
        <select
          value={filters.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          className="input-field text-sm"
        >
          <option value="">{t('filters.allSubjects')}</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {showDelivery && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t('filters.centerType')}</label>
          <select
            value={filters.deliveryMode || ''}
            onChange={(e) => handleChange('deliveryMode', e.target.value)}
            className="input-field text-sm"
          >
            <option value="">{t('filters.allTypes')}</option>
            <option value="physical">{t('filters.physical')}</option>
            <option value="online">{t('filters.online')}</option>
            <option value="hybrid">{t('filters.hybrid')}</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          {t('filters.distance')}: {filters.distance}km
        </label>
        <input
          type="range"
          min="1"
          max="100"
          value={filters.distance}
          onChange={(e) => handleChange('distance', parseInt(e.target.value, 10))}
          className="w-full accent-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          {t('filters.minRating')}: {filters.rating}★
        </label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={filters.rating}
          onChange={(e) => handleChange('rating', parseFloat(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">{t('filters.priceRange')}</label>
        <select
          value={filters.price}
          onChange={(e) => handleChange('price', e.target.value)}
          className="input-field text-sm"
        >
          <option value="">{t('filters.anyPrice')}</option>
          <option value="0-500">0 - 500 MAD</option>
          <option value="500-1000">500 - 1000 MAD</option>
          <option value="1000-3000">1000 - 3000 MAD</option>
          <option value="3000-99999">3000+ MAD</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={filters.popularity}
          onChange={(e) => handleChange('popularity', e.target.checked)}
          className="rounded border-border text-primary focus:ring-primary"
        />
        {t('filters.popularity')}
      </label>

      <button type="button" onClick={handleApply} className="btn-primary w-full">
        {t('filters.applyFilters')}
      </button>
    </div>
  );
};

export default FilterPanel;
