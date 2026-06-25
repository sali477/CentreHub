/** Resolve MongoDB _id or legacy id from API entities */
export const getEntityId = (entity) => {
  if (!entity) return null;
  const id = entity._id ?? entity.id;
  if (id == null) return null;
  if (typeof id === 'object') {
    if (typeof id.toString === 'function' && id.toString() !== '[object Object]') {
      return id.toString();
    }
    if (id.$oid) return String(id.$oid);
    return null;
  }
  return String(id);
};
