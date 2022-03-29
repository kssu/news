const API_KEY = 'cd6ed174fd3a4f0e9d9ca9e4a5b9e106';

const choicesElem = document.querySelector('.js-choise'),
    newList = document.querySelector('.news__list'),
    formSearch = document.querySelector('.form'),
    title = document.querySelector('.title');

const choices = new Choices(choicesElem, {
    searchEnabled: false,
    itemSelectText: ''
});

const getData = async (url) => {
    const response = await fetch(url, {
        headers: {
            'X-Api-Key': API_KEY,
        }
    });

    const data = await response.json();

    return data;
};
const getDateCorrectFormat = isoDate => {
    const date = new Date(isoDate);
    const fullDate = date.toLocaleString('en-Gb', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });

    const fullTime = date.toLocaleString('en-Gb', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return `<span class="news__date">${fullDate}</span> ${fullTime}`;
};

const getImage = url => new Promise((resolve) => {
    const image = new Image(270, 200);

    image.addEventListener('load', () => {
        resolve(image);
    });
    image.addEventListener('error', () => {
        image.src = 'img/no-photo.jpg';
        resolve(image);
    });

    image.src = url || 'img/no-photo.jpg';
    image.className = 'news__img';
    
    return image;
}); 

const renderCard = (data) => {
    newList.textContent = '';
    data.forEach( async ({urlToImage, title, url, description, publishedAt, author}) => {
        const card = document.createElement('li');
        card.className = 'news__item';

        const image = await getImage(urlToImage);
        image.alt = title;
        card.append(image);

        card.insertAdjacentHTML('beforeend', `
            <h3 class="news__title">
                <a href="${url}" class="news__link" target="_blank">${title || ''}</a>
            </h3>
            <div class="news__descr">
                ${description || ''}
            </div>
            <div class="news__footer">
                <time class="news__datetime" datetime="${publishedAt}">
                ${getDateCorrectFormat(publishedAt)}
                </time>
                <div class="news__author">${author || ''}</div>
            </div>
        `);


        newList.append(card);
    });
};

const loadSearch = async value => {
    
    const data = await getData(`https://newsapi.org/v2/everything?q=${value}&pageSize=100`);
    title.classList.remove('hide');
    title.textContent = `According to your request "${value}" found ${data.articles.length} results`;
    choices.setChoiceByValue('');
    renderCard(data.articles);
};

const loadNews = async () => {
    newList.innerHTML = '<li class="preload"></li>';
    const country = localStorage.getItem('country') || 'us';
    choices.setChoiceByValue(country);
    title.classList.add('hide');
    const data = await getData(`https://newsapi.org/v2/top-headlines?country=${country}&pageSize=30`);
    renderCard(data.articles);
};

choicesElem.addEventListener('change', (event) => {
    const value = event.detail.value;
    localStorage.setItem('country', value);
    loadNews(value);
    
});

formSearch.addEventListener('submit', event => {
    event.preventDefault();
    loadSearch(formSearch.search.value);
    formSearch.reset();
});

loadNews();