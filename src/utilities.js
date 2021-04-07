
export const getKeyForSector = (index, data) => {
  const at = id => data[id] || 0
  return '' + at(index - 4) + at(index + 1) + at(index + 4) + at(index - 1)
}

export const yearFromEpoch = epoch => {
  let year = ''
  let notation = ''

  switch (epoch)
  {
    case 1:
    {
      year = 9500
      notation = 'BC'
      break
    }
    case 2:
    {
      year = 3000
      notation = 'BC'
      break
    }
    case 3:
    {
      year = 100
      notation = 'BC'
      break
    }
    case 4:
    {
      year = 900
      notation = 'AD'
      break
    }
    case 5:
    {
      year = 1400
      notation = 'AD'
      break
    }
    case 6:
    {
      year = 1850
      notation = 'AD'
      break
    }
    case 7:
    {
      year = 1915
      notation = 'AD'
      break
    }
    case 8:
    {
      year = 1945
      notation = 'AD'
      break
    }
    case 9:
    {
      year = 1980
      notation = 'AD'
      break
    }
    case 10:
    {
      year = 2001
      notation = 'AD'
      break
    }
  }

  return [ year, notation ]
}