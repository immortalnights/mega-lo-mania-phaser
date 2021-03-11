
export const getKeyForSector = (index, data) => {
  const at = id => data[id] || 0
  return '' + at(index - 4) + at(index + 1) + at(index + 4) + at(index - 1)
}