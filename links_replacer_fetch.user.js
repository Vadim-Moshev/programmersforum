// ==UserScript==
// @name         Замена ссылок их нахваниями через фетч
// @namespace    https://programmersforum.ru/
// @version      1.1
// @description  try to take over the world!
// @updateURL    https://github.com/Vadim-Moshev/programmersforum/raw/master/links_replacer_fetch.user.js
// @downloadURL  https://github.com/Vadim-Moshev/programmersforum/raw/master/links_replacer_fetch.user.js
// @author       Vadim Moshev
// @include      *programmersforum.ru/showthread.php*
// @include      *programmersforum.ru/showpost.php*
// @include      *programmersforum.ru/private.php*
// ==/UserScript==

(function() {
// защита от повторного запуска
  if (window.replaceLinksWithCaptions) {
  	return
  };
  window.replaceLinksWithCaptions = true;

// ===============================================================================

	const
		TEXT_ENCODING = 'windows-1251',
		FORUM_DOMAIN = 'programmersforum.ru',
		PATH_ID_MAP = {
			'/showthread.php'   : ['t', 'p'],
			'/showpost.php'     : ['p'],
			'/forumdisplay.php' : ['f'],
			'/member.php'       : ['u']
		};
		// REQUEST_HOST = 'localhost';

// --------------------------------------------------------------------------------

  function HTMLTextToDOM(aHTMLText) {
    let container = document.createElement('div');
    container.insertAdjacentHTML('afterBegin', aHTMLText);
    return container;
  };

// --------------------------------------------------------------------------------

function parseURL(aURL) {
  // Автор функции Alex P (Alex11223)
  // https://github.com/AlexP11223/ProgForumRuUserscripts/blob/master/non-user-js/video_embed.js

  let parser = document.createElement('a');
  let searchDict = {};

  parser.href = aURL;

  let queries = parser.search.replace(/^\?/, '').split('&');
  for (let i = 0; i < queries.length; i++) {
    let parts = queries[i].split('=');
    searchDict[parts[0]] = parts[1];
  }

  return {
    protocol: parser.protocol,
    host: parser.host,
    hostname: parser.hostname,
    port: parser.port,
    pathname: parser.pathname,
    search: parser.search,
    hash: parser.hash,
    searchDict: searchDict,
    pathParts: parser.pathname.substring(1).split('/')
  };
};

// --------------------------------------------------------------------------------

	function getPageTitle(aServerResponse) {
		let searchResult = aServerResponse.match(/<title>(.*)<\/title>/i);
		if (!searchResult) {
			return null;
		};

		let pageTitle = searchResult[1];

		// remove EOLs and excessive whitespaces
		return pageTitle.replace(/\s+/g, ' ').trim();
	};

// --------------------------------------------------------------------------------

function removeLastPart(aStr, aSeparator = '-') {
	let separatorLastIndex = aStr.lastIndexOf(aSeparator);
	return (separatorLastIndex > -1) ? aStr.substring(0, separatorLastIndex) : aStr;
};

// --------------------------------------------------------------------------------

function removeLastPartNTimes(aStr, aTimes, aSeparator = '-') {
	for (let i = 1; i <= aTimes; i++) {
		aStr = removeLastPart(aStr, aSeparator);
	};

	return aStr;
};

// --------------------------------------------------------------------------------

const makeTitlePart = (aName, aValue) => (!aValue) ? '' : ` - ${aName} ${aValue}`;

// --------------------------------------------------------------------------------

const getBySelector = aSelector => document.querySelector(aSelector);

// --------------------------------------------------------------------------------

const getBySelectorAll = aSelector => document.querySelectorAll(aSelector);

// --------------------------------------------------------------------------------

const makePageNumberPart = (aPage) => makeTitlePart('Страница', aPage);

// --------------------------------------------------------------------------------

function queryStringToHash(aQueryString) {
	let result = {};

	let keyValuePairs = aQueryString.split('&');
	keyValuePairs.forEach(aPair => {
		let [key, value] = aPair.split('=');
		result[key] = value;
	});

	return result;
};

// ===============================================================================

let linksInPosts = Array.prototype.slice.apply( getBySelectorAll('div[id^="post_message_"] a'));
let linksToChangeTitle =linksInPosts
	.filter(aLinkElement => {
		let url = aLinkElement.href;
		let linkCurrentTitle = aLinkElement.textContent.trim();
		let urlParts = parseURL(url);

		let host = urlParts.host;
		let path = urlParts.pathname;
		let query = urlParts.search.replace('?', '');

		// Если Ссылка содержит изображения, то исключаем её
			if (aLinkElement.querySelectorAll('img').length) {
				return false;
			};

		// проверка ссылки на именованность (текст ссылки отличается от её href)
		// будем считать внутреннюю ссылку именованной, если она не содержит домена нашего форума
		// именованные ссылки исключаем
			if (linkCurrentTitle.toLowerCase().indexOf(FORUM_DOMAIN) === -1) {
				return false
			};

		// внешние ссылки, строки без запросов или на неинтересующие нас скрипты исключаем
			if (url.indexOf(FORUM_DOMAIN) === -1 || !(path in PATH_ID_MAP) || !query) {
				return false;
			};

		// запрос или нужная пара ключ-значение не существует
			let idKey = PATH_ID_MAP[path];
			let queryParts = queryStringToHash(query);
			if (!idKey.some( aIdKey => !!queryParts[aIdKey] )) {
				return false;
			};

		let id = queryParts[idKey.filter( aIdKey => !!queryParts[aIdKey] )[0]];
		if (!id) {
			return false; // без id всё не имеет смысла
		};

		let page = queryParts.page || 0;

		aLinkElement.setAttribute('entityId', id);
		aLinkElement.setAttribute('page', page);

		return true;
	});

	linksToChangeTitle.forEach(aLinkElement => {
		let options = {
		  credentials: 'omit'
		};

		// удалим протокол и www, чтобы не было кросдоменных запросов с загрузок с небезопасных мест
		let currentLinkHref = aLinkElement
			.href
			.toLowerCase()
			.replace(/https?:\/\/(www\.)?programmersforum\.ru/, '');

		fetch(currentLinkHref, options)
		  .then(aResponse => aResponse.arrayBuffer() )
		  .then(aBuffer => {
		    let decoder = new TextDecoder(TEXT_ENCODING);
		    let text = decoder.decode(aBuffer);
		    return text;
		  })
		  .then(aResponseText => {
		  	let title = getPageTitle(aResponseText);

		  	// Пропускаем недоступные ссылки (например, удалённые темы {у них титл === 'Форум программистов'})
			  	if (!title || title.indexOf(' - ') === -1) {
			  		return;
			  	};

				let urlParts = parseURL(currentLinkHref);
				let path = urlParts.pathname;
				let postCount = queryStringToHash(urlParts.search).postcount;
		  	let page = +aLinkElement.getAttribute('page');
		  	let id = aLinkElement.getAttribute('entityId');
		  	aLinkElement.removeAttribute('page');
		  	aLinkElement.removeAttribute('entityId');
				let pageNumberCaption = page ? makePageNumberPart(page) : '';

				let subject;
		  	switch (path) {
		  		case '/member.php': { // Форум программистов - Просмотр профиля: Пупунчик золотой
		  			aLinkElement.textContent = title.replace('Форум программистов - Просмотр профиля: ', '');
		  			return;
		  		};

		  		case '/showthread.php': { // С днем программиста! - Свободное общение - [Страница 2] - Форум программистов
		  			subject = removeLastPartNTimes(title, page ? 3 : 2).trim();
		  			aLinkElement.textContent = subject + pageNumberCaption;
		  			return;
		  		};

		  		case '/showpost.php': { // Свободное общение - Показать сообщение отдельно -  С днем программиста!
		  			let strBeforeSubject = 'Показать сообщение отдельно - '; // В оригинале в конце пробела не было
		  			let pos = title.indexOf(strBeforeSubject);
		  			if (pos === -1) {
		  				return;
		  			};

						subject = title.substr(pos + strBeforeSubject.length).trim();

						//  получим порядковый номер сообщения в теме
							if (postCount) {
								aLinkElement.textContent = subject + makeTitlePart('Сообщение', postCount);
							} else {
								let threadMessageURL = `showthread.php?p=${id}#post${id}`;
								fetch(threadMessageURL, options)
									.then(aResponse => aResponse.arrayBuffer())
									.then(aBuffer => {
										let decoder = new TextDecoder(TEXT_ENCODING);
										return decoder.decode(aBuffer);
									})
									.then(aResponseText => {
										postCount = HTMLTextToDOM(aResponseText)
											.querySelector(`#postcount${id}`)
											.name;

										aLinkElement.textContent = subject + makeTitlePart('Сообщение', postCount);
									})
							};

						return;
					};

					case '/forumdisplay.php': { // Свободное общение - [Страница 2] - Форум программистов
						let unitName = (removeLastPart(title)).trim();
						aLinkElement.textContent = unitName;
						return;
					};
		  	};
		  });
	});
})();
