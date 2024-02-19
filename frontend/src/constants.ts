const StatusCodes = {
    UNAUTHORIZED: 401,
    OK: 200
}

const HomeViews = {
  crimes: 'crimes',
  agencies: 'agencies',
  all: 'all',
}

const AccraCoordinates = {
  lat: '5.614818',
  lon: '-0.205874',
}

const CrimeMarkers: Array<string> = [
  'name',
  'age',
  'height',
  'hair',
  'skin',
  'eye',
  'gender',
  'build',
  'body',
  'ethnicity',
  'race',
  'behaviour',
  'clothing',
  'complexion',
  'vehicle',
  'tattoo',
  'scar',
  'mark',
]

export {
  StatusCodes,
  HomeViews,
  CrimeMarkers,
  AccraCoordinates,
}