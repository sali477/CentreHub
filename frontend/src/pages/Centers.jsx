import { useEffect, useState, useCallback } from 'react';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FiMap, FiList } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { fetchCenters } from '../store/slices/centerSlice';
import { setSearchQuery } from '../store/slices/uiSlice';
import { getCurrentLocation } from '../utils/helpers';
import { buildSearchApiParams } from '../utils/searchUrl';
import { getEntityId } from '../utils/entityId';

import SearchBar from '../components/common/SearchBar';

import FilterPanel from '../components/common/FilterPanel';

import CenterCard from '../components/centers/CenterCard';

import StableCardGrid from '../components/common/StableCardGrid';

import GoogleMapView from '../components/maps/GoogleMapView';



const Centers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { list: centers, loading } = useSelector((state) => state.centers);
  const { filters } = useSelector((state) => state.ui);
  const urlQuery = searchParams.get('q') || searchParams.get('search') || '';

  const [viewMode, setViewMode] = useState('list');
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [activeSearch, setActiveSearch] = useState(urlQuery);



  const buildParams = useCallback(
    (overrides = {}) => {
      const params = buildSearchApiParams(filters, { limit: 20, ...overrides });
      if (params.q) {
        params.search = params.q;
        delete params.q;
      }
      if (filters.distance) params.radius = filters.distance;
      if (filters.popularity) params.popularity = 'true';
      return params;
    },
    [filters]
  );

  const loadCenters = useCallback(
    async (options = {}) => {
      const params = buildParams();

      if (options.search?.trim()) params.search = options.search.trim();

      if (options.nearMe) {
        try {
          const location = options.location || (await getCurrentLocation());
          params.lat = location.lat;
          params.lng = location.lng;
          params.near = true;
          params.radius = filters.distance;
          setUserLocation(location);
          setLocationError(null);
        } catch (err) {
          setLocationError(err.message);
          return;
        }
      }

      dispatch(fetchCenters(params));
    },
    [buildParams, dispatch, filters.distance]
  );

  useEffect(() => {
    loadCenters({ search: urlQuery });
    setActiveSearch(urlQuery);
  }, [urlQuery, loadCenters]);

  const handleSearch = (query, options = {}) => {
    if (options.clear) {
      setActiveSearch('');
      setLocationError(null);
      navigate('/centers');
      dispatch(fetchCenters({ limit: 20 }));
      return;
    }
    const trimmed = (query || '').trim();
    setActiveSearch(trimmed);
    navigate(trimmed ? `/centers?q=${encodeURIComponent(trimmed)}` : '/centers');
    loadCenters({ search: trimmed, ...options });
  };

  const handleApplyFilters = () => {
    loadCenters({ search: activeSearch });
  };



  return (

    <div className="page-shell">

      <div className="mb-8 relative min-h-[4.5rem]">

        <div className="flex items-center justify-between mb-4">

          <h1 className="section-title">{t('centers.title')}</h1>

          <div className="flex bg-muted rounded-lg p-1 shrink-0">

            <button

              onClick={() => setViewMode('list')}

              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${

                viewMode === 'list' ? 'bg-card shadow text-primary' : 'text-muted-foreground'

              }`}

            >

              <FiList /> {t('common.list')}

            </button>

            <button

              onClick={() => setViewMode('map')}

              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${

                viewMode === 'map' ? 'bg-card shadow text-primary' : 'text-muted-foreground'

              }`}

            >

              <FiMap /> {t('common.map')}

            </button>

          </div>

        </div>

        <SearchBar showDropdown searchType="centers" onSearch={handleSearch} />

        {locationError && (

          <p className="absolute left-0 right-0 top-full mt-2 text-sm text-destructive-muted-foreground bg-destructive-muted border border-destructive-muted rounded-lg px-4 py-2 z-10">

            {locationError}

          </p>

        )}

      </div>



      {viewMode === 'map' ? (

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          <div className="lg:col-span-1 order-2 lg:order-1">

            <FilterPanel onApply={handleApplyFilters} />

            <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto">

              {centers.map((center) => (

                <CenterCard key={center._id} center={center} />

              ))}

            </div>

          </div>

          <div className="lg:col-span-3 order-1 lg:order-2">

            <GoogleMapView

              centers={centers}

              userLocation={userLocation}

              height="600px"

              className="card"

              onCenterClick={(c) => {

                const centerId = getEntityId(c);

                if (centerId) navigate(`/centers/${centerId}`);

              }}

            />

          </div>

        </div>

      ) : (

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          <div className="lg:col-span-1 shrink-0">

            <FilterPanel onApply={handleApplyFilters} />

          </div>



          <div className="lg:col-span-3 min-h-[28rem]">

            <StableCardGrid

              items={centers}

              loading={loading}

              emptyMessage={t('centers.empty')}

              gridClassName="grid grid-cols-1 sm:grid-cols-2 gap-6"

              minHeight="min-h-[28rem]"

              skeletonCount={4}

              renderItem={(center) => <CenterCard center={center} />}

            />

          </div>

        </div>

      )}

    </div>

  );

};



export default Centers;

