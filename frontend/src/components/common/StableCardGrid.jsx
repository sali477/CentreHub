/**
 * Keeps grid layout stable during loading — shows previous cards or skeletons
 * instead of swapping the grid for empty states.
 */
const StableCardGrid = ({
  items = [],
  loading = false,
  emptyMessage = 'No results found.',
  gridClassName = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
  minHeight = 'min-h-[28rem]',
  skeletonCount = 6,
  renderItem,
  getKey = (item, index) => item?._id || item?.id || index,
}) => {
  const hasItems = items.length > 0;
  const showEmpty = !loading && !hasItems;

  if (showEmpty) {
    return (
      <div className={`${minHeight} flex items-center justify-center`}>
        <p className="text-muted-foreground text-center px-4">{emptyMessage}</p>
      </div>
    );
  }

  const slots = hasItems
    ? items
    : Array.from({ length: skeletonCount }, (_, i) => ({ _placeholder: i }));

  return (
    <div className={`relative ${minHeight}`}>
      <div
        className={`${gridClassName} transition-opacity duration-200 ${
          loading && hasItems ? 'opacity-60 pointer-events-none' : 'opacity-100'
        }`}
      >
        {slots.map((item, index) =>
          item._placeholder != null ? (
            <div
              key={`placeholder-${item._placeholder}`}
              className="card h-[17.5rem] animate-pulse bg-muted"
              aria-hidden
            />
          ) : (
            <div key={getKey(item, index)} className="h-full">
              {renderItem(item, index)}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default StableCardGrid;
