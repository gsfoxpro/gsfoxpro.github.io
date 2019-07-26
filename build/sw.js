const date = new Date()
const IGNORE_STRINGS = ['yandex', 'localhost', 'login', 'v1/orders', 'v1/clients', 'v1/profile', 'v1/checkout']

self.addEventListener('install', (event) => {
    console.log('Установлен');
})

self.addEventListener('activate', (event) => {
    console.log('Активирован')
    caches.keys().then(names => {
        for (let name of names) {
            console.log(`Delete ${name}`)
            caches.delete(name)
        }
    })
})

self.addEventListener('fetch', (event) => {
    const CACHE = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}` //кеш на один день
    const {request} = event

    event.respondWith((async () => {
        let needIgnore = false
        IGNORE_STRINGS.forEach(string => {
            if (request.url.includes(string)) {
                needIgnore = true
            }
        })
        if (needIgnore) {
            return fetch(request)
        }

        console.log(`Происходит запрос на сервер ${request.url}`)
        const cache = await caches.open(CACHE)
        const cachedResponse = await cache.match(request)
        if (cachedResponse && cachedResponse.status === 200) {
            console.log(`Вернули из кеша ${request.url}`)
            return cachedResponse
        }
        const response = await fetch(request)
        if(!response || response.status !== 200 || response.type !== 'basic') {
            cache.delete(request)
            return response
        }

        console.log(`Положили в кеш ${request.url}`)
        cache.put(request, response.clone())

        return response
    })())
})