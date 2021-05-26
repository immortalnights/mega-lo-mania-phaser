
export const getKeyForSector = (index, data) => {
  const at = id => data[id] || 0

  let key = ''

  // Always Top
  key += at(index - 4)
  
  // Right
  key += (index % 4 !== 3) ? at(index + 1) : 0

  // Bottom
  key += '' + at(index + 4)
  // Left
  key += (index % 4 !== 0) ? at(index - 1) : 0

  return key
}

export const yearFromEpoch = epoch => {
  let year = ''
  let notation = ''

  switch (epoch)
  {
    case 1:
    {
      year = 9500
      notation = 'bc'
      break
    }
    case 2:
    {
      year = 3000
      notation = 'bc'
      break
    }
    case 3:
    {
      year = 100
      notation = 'bc'
      break
    }
    case 4:
    {
      year = 900
      notation = 'ad'
      break
    }
    case 5:
    {
      year = 1400
      notation = 'ad'
      break
    }
    case 6:
    {
      year = 1850
      notation = 'ad'
      break
    }
    case 7:
    {
      year = 1915
      notation = 'ad'
      break
    }
    case 8:
    {
      year = 1945
      notation = 'ad'
      break
    }
    case 9:
    {
      year = 1980
      notation = 'ad'
      break
    }
    case 10:
    {
      year = 2001
      notation = 'ad'
      break
    }
  }

  return [ year, notation ]
}

export const allocateOrDeallocate = (available, allocated, change = 1, reserved = 0) => {
  let realChange = 0
  if (change < 0)
  {
    realChange = Math.min(allocated, Math.abs(change))
    allocated = allocated - realChange
    available = available + realChange
  }
  else
  {
    realChange = Math.min(available - reserved, change)
    available = available - realChange
    allocated = allocated + realChange
  }

  return [ available, allocated ]
}