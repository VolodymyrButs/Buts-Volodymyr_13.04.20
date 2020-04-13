const { createStore, combineReducers } = require('redux')
const { saveState, loadState } = require('./localStorage')

const url = 'http://my-json-server.typicode.com/moviedb-tech/movies/list'

const get = (url) => {
    return fetch(url).then((response) => {
        return response.json()
    })
}
const film = (state = loadState().film, action) => {
    switch (action.type) {
        case 'FETCH_MOVIES':
            return (state.film = action.data)
        default:
            return state
    }
}

const favorite = (state = loadState().favorite, action) => {
    switch (action.type) {
        case 'ADD_FAV':
            return [...state, action.id]
        case 'DEL_FAV':
            return state.filter((id) => id !== action.id)
        default:
            return state
    }
}
const filmsApp = combineReducers({ film, favorite })
const store = createStore(filmsApp)

get(url)
    .then((films) =>
        store.dispatch({
            type: 'FETCH_MOVIES',
            data: films,
        })
    )
    .then(() => renderMoviesGalery())

store.subscribe(() => saveState(store.getState()))
console.log(store.getState())
window.onload = () => {
    renderFavList(), createFilter(), renderMoviesGalery()
}

const renderMoviesGalery = () => {
    document.querySelector('.moviesGalery').innerHTML = ''
    store.getState().film.forEach((film) => {
        const li = document.createElement('li')
        const img = document.createElement('img')
        const button = document.createElement('button')

        li.innerText = `${film.name}  ${film.year}`
        li.className = 'moviesGaleryItem'
        li.id = film.id
        li.onclick = (event) => {
            event.stopPropagation()
            openModal(event)
        }
        img.src = film.img
        img.id = film.id
        img.className = 'moviesGaleryItemImg'
        button.className = 'moviesGaleryItemButton'
        button.innerText = store.getState().favorite.includes(film.id)
            ? 'Delete from fav'
            : 'Add to fav'
        button.style.color = store.getState().favorite.includes(film.id)
            ? 'red'
            : 'black'
        store.subscribe(() => {
            if (store.getState().favorite.includes(film.id)) {
                button.style.color = 'red'
                button.innerText = 'Delete from fav'
            } else {
                button.style.color = 'black'
                button.innerText = 'Add to fav'
            }
        })
        button.onclick = (e) => {
            e.stopPropagation()
            if (store.getState().favorite.includes(film.id)) {
                store.dispatch({
                    type: 'DEL_FAV',
                    id: film.id,
                })
                renderFavList()
            } else {
                store.dispatch({
                    type: 'ADD_FAV',
                    id: film.id,
                }),
                    store.getState().favorite,
                    renderFavList()
            }
        }
        li.appendChild(img)
        li.appendChild(button)
        document.querySelector('.moviesGalery').appendChild(li)
    })
}
const openModal = (event) => {
    document.querySelector('.backPlate').style.display = 'block'
    get(url).then((data) => {
        let film = data[event.target.id - 1]
        console.log(film)
        document.querySelector('.imgModal').src = film.img
        const buttonFavModal = document.querySelector('.buttonFavModal')
        buttonFavModal.innerText = store.getState().favorite.includes(film.id)
            ? 'Delete from fav'
            : 'Add to fav'
        buttonFavModal.style.color = store.getState().favorite.includes(film.id)
            ? 'red'
            : 'black'
        store.subscribe(() => {
            if (store.getState().favorite.includes(film.id)) {
                buttonFavModal.style.color = 'red'
                buttonFavModal.innerText = 'Delete from fav'
            } else {
                buttonFavModal.style.color = 'black'
                buttonFavModal.innerText = 'Add to fav'
            }
        })
        buttonFavModal.onclick = (e) => {
            e.stopPropagation()
            if (store.getState().favorite.includes(film.id)) {
                store.dispatch({
                    type: 'DEL_FAV',
                    id: film.id,
                })
                renderFavList()
            } else {
                store.dispatch({
                    type: 'ADD_FAV',
                    id: film.id,
                }),
                    store.getState().favorite,
                    renderFavList()
            }
        }
        document.querySelector('.yearModal').innerText = `Year: ${film.year}`
        let genres = document.createElement('span')
        genres.innerText = 'Genres :'
        document.querySelector('.genresWraperModal').appendChild(genres)
        film.genres.forEach((genre) => {
            const span = document.createElement('span')
            span.innerText = genre
            span.className = 'genreModal'
            document.querySelector('.genresWraperModal').appendChild(span)
        })
        document.querySelector('.nameNodal').innerText = film.name
        document.querySelector('.descriptionModal').innerText = film.description
        document.querySelector(
            '.directorModal'
        ).innerText = `Director : ${film.director}`
        let starring = document.createElement('span')
        starring.innerText = 'Starring :'
        document.querySelector('.starringWraperModal').appendChild(starring)
        film.starring.forEach((starringItem) => {
            const span = document.createElement('span')
            span.innerText = `${starringItem},`
            span.className = 'starringModal'

            document.querySelector('.starringWraperModal').appendChild(span)
        })
        document.querySelector('.closeButton').onclick = () => {
            closeModal()
        }
    })
}

const closeModal = () => {
    document.querySelector('.backPlate').style.display = 'none'
    document.querySelector('.starringWraperModal').innerHTML = ''
    document.querySelector('.genresWraperModal').innerHTML = ''
}

const renderFavList = () => {
    document.querySelector('.favoriteList').innerHTML = ''
    for (let key of store.getState().favorite) {
        const li = document.createElement('li')
        const a = document.createElement('a')
        const button = document.createElement('button')
        a.innerText = loadState().film[key - 1].name
        a.id = loadState().film[key - 1].id
        a.onclick = (event) => {
            openModal(event)
        }
        li.className = 'moviesFavoriteItem'
        button.className = 'moviesFavoriteItemButton'
        button.innerText = 'X'
        button.onclick = () => {
            store.dispatch({
                type: 'DEL_FAV',
                id: loadState().film[key - 1].id,
            })
            renderFavList()
        }
        li.appendChild(a)
        li.appendChild(button)
        document.querySelector('.favoriteList').appendChild(li)
    }
}

const createFilter = () => {
    let genresList = []
    store.getState().film.forEach((film) => {
        genresList = genresList.concat(film.genres)
    })
    let unique = genresList.filter((item, i, ar) => ar.indexOf(item) === i)
    unique.forEach((genres) => {
        const option = document.createElement('option')
        option.innerText = genres

        document.querySelector('.filter').appendChild(option)
    })
}

document.querySelector('.filter').onchange = () => {
    setFilter()
}
const setFilter = () => {
    let value = document.querySelector('.filter').value
    if (value === 'No filter') {
        document.querySelector('.moviesGalery').innerHTML = ''
        renderMoviesGalery()
    } else {
        document.querySelector('.moviesGalery').innerHTML = ''

        store.getState().film.forEach((film) => {
            if (film.genres.includes(value)) {
                const li = document.createElement('li')
                const img = document.createElement('img')
                const button = document.createElement('button')

                li.innerText = `${film.name}  ${film.year}`
                li.className = 'moviesGaleryItem'
                li.id = film.id
                li.onclick = (event) => {
                    event.stopPropagation()
                    openModal(event)
                }
                img.src = film.img
                img.id = film.id
                img.className = 'moviesGaleryItemImg'
                button.className = 'moviesGaleryItemButton'
                button.innerText = store.getState().favorite.includes(film.id)
                    ? 'Delete from fav'
                    : 'Add to fav'
                button.style.color = store.getState().favorite.includes(film.id)
                    ? 'red'
                    : 'black'
                store.subscribe(() => {
                    if (store.getState().favorite.includes(film.id)) {
                        button.style.color = 'red'
                        button.innerText = 'Delete from fav'
                    } else {
                        button.style.color = 'black'
                        button.innerText = 'Add to fav'
                    }
                })
                button.onclick = (e) => {
                    e.stopPropagation()
                    if (store.getState().favorite.includes(film.id)) {
                        store.dispatch({
                            type: 'DEL_FAV',
                            id: film.id,
                        })
                        renderFavList()
                    } else {
                        store.dispatch({
                            type: 'ADD_FAV',
                            id: film.id,
                        }),
                            store.getState().favorite,
                            renderFavList()
                    }
                }
                li.appendChild(img)
                li.appendChild(button)
                document.querySelector('.moviesGalery').appendChild(li)
            }
            return
        })
    }
}
