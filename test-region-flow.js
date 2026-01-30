// Тестовый скрипт для проверки флоу region_id

const API_KEY = '69c09e00-c605-4c2d-9381-738e6710f69a'

// Тест 1: Geocode для Челябинска
async function testGeocode() {
  console.log('\n=== TEST 1: Geocode (Челябинск) ===')

  const lat = 55.1644
  const lng = 61.4368

  const url = `https://catalog.api.2gis.com/3.0/items/geocode?lat=${lat}&lon=${lng}&fields=items.address,items.region_id&key=${API_KEY}`

  console.log('Request URL:', url)

  const response = await fetch(url)
  const data = await response.json()

  const item = data.result?.items?.[0]

  console.log('Response item:', {
    full_name: item?.full_name,
    address_name: item?.address_name,
    region_id: item?.region_id
  })

  return item?.region_id
}

// Тест 2: Поиск места в Челябинске
async function testPlaceSearch(regionId) {
  console.log('\n=== TEST 2: Place Search в region_id=' + regionId + ' ===')

  const query = 'Театр оперы и балета'

  const params = new URLSearchParams({
    q: query,
    region_id: regionId,
    type: 'branch,building,attraction',
    fields: 'items.point,items.address',
    key: API_KEY,
    page_size: '1'
  })

  const url = `https://catalog.api.2gis.com/3.0/items?${params}`

  console.log('Request URL:', url)

  const response = await fetch(url)
  const data = await response.json()

  const item = data.result?.items?.[0]

  console.log('Found place:', {
    name: item?.name,
    address: item?.address_name,
    coordinates: item?.point
  })
}

// Тест 3: Geocode для Волжского
async function testVolzhskiy() {
  console.log('\n=== TEST 3: Geocode (Волжский) ===')

  const lat = 48.7859
  const lng = 44.7745

  const url = `https://catalog.api.2gis.com/3.0/items/geocode?lat=${lat}&lon=${lng}&fields=items.address,items.region_id&key=${API_KEY}`

  const response = await fetch(url)
  const data = await response.json()

  const item = data.result?.items?.[0]

  console.log('Response item:', {
    full_name: item?.full_name,
    region_id: item?.region_id
  })

  return item?.region_id
}

// Запуск всех тестов
async function runTests() {
  try {
    const chelyabinskRegionId = await testGeocode()

    if (chelyabinskRegionId) {
      await testPlaceSearch(chelyabinskRegionId)
    }

    const volzhskiyRegionId = await testVolzhskiy()

    console.log('\n=== SUMMARY ===')
    console.log('Челябинск region_id:', chelyabinskRegionId)
    console.log('Волжский region_id:', volzhskiyRegionId)

  } catch (error) {
    console.error('Error:', error)
  }
}

runTests()
