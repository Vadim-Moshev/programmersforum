// ==UserScript==
// @name         +++++++++++++++++++++ замена ссылок ++++++++++++++++++
// @namespace    https://programmersforum.ru/
// @version      1
// @description  try to take over the world!
// @author       Vadim Moshev
// @include      *programmersforum.ru/showthread.php*
// @include      *programmersforum.ru/showpost.php*
// @include      *programmersforum.ru/private.php*
// ==/UserScript==

(function() {
  'use strict';

    // Функция преобразует HTML-текст в DOM иерархиею элементов
    // На выходе - div-контейнер с иерархией
    function HTMLTextToDOM(AHTMLText) {
      let container = document.createElement('div');
      container.insertAdjacentHTML('afterBegin', AHTMLText);
      return container;
    };

  // защита от повторного запуска
    if (window.replaceLinksWithCaptions) {
    	return
    };
    window.replaceLinksWithCaptions = true;

  let tmp = document.querySelectorAll('div[id^="post_message_"] a');
  let linksInPosts = [];
  // let linksInPosts = [...tmp];
  for (let i = 0; i < tmp.length; i++) {
  	linksInPosts.push(tmp[i]);
  };

  		// debugger;
  let unnamedInternalLinksWithoutPictures = linksInPosts.filter(aLink => {
  	let href = aLink.href;
  	let textContentSubstring = aLink.textContent.replace(/\.{3}.+$/i, '').replace(/https?:\/\//, '');
  	let condition = true
  		&& (href.indexOf('programmersforum.ru') > -1)
  		&& (href.indexOf(textContentSubstring) > -1)
  		&& (!aLink.querySelector('img'));
  	if ( condition ) {
  		aLink.href = href.replace(/^http:/, 'https:');
  		return aLink;
  	};
  });

  // сайт доступен (пока) как с www, так и без него.
  // если надо, поставим www там, где его нет, чтобы не было кросдоменных запросов — они всё равно запрещены
  // и из-за этого замена не происходит
  // иначе удалим
  	if (location.href.indexOf('www.') > -1) {
  		unnamedInternalLinksWithoutPictures.forEach(aLink => {
  			if (aLink.href.indexOf('www.') === -1) {
  				aLink.href = aLink.href.replace('programmersforum', 'www.programmersforum');
  			};

  			return aLink;
  		})
  	} else {
  		unnamedInternalLinksWithoutPictures.forEach(aLink => {
  			aLink.href = aLink.href.replace('https://www.', 'https://');
  			return aLink;
  		});
  	};

  unnamedInternalLinksWithoutPictures.forEach(aLink => {
	  let href = aLink.href;

  	let callbacks = {
  		success: function(AResponseObject) {
  			let responseDOM = HTMLTextToDOM(AResponseObject.responseText);

  			let strongInNavbar = responseDOM.querySelector('td.navbar strong');
  			strongInNavbar = strongInNavbar || responseDOM.querySelector('div.navbar strong')
  			let newLinkCaption;
  			if (strongInNavbar) {
  				newLinkCaption = strongInNavbar.textContent.trim();
  			};

  			// Если это страница с профилем пользователя, удалим подстроку "Профиль "
  				if (href.indexOf('member.php') > -1) {
  					newLinkCaption = newLinkCaption.replace('Профиль ', '');
  				};

  			// Если это страница темы форума, укажем номер страницы
  				if (href.indexOf('showthread.php') > -1) {
  					let pageNumber = 1;
  					let paginator = responseDOM.querySelector('div.pagenav');
  					if (paginator) {
  						pageNumber = paginator.querySelector('strong').textContent;
  					};

  					newLinkCaption += ' (страница ' + pageNumber + ')';

  					// если есть якорь, покажем номер сообщения в теме
  						if (href.indexOf('#post') > -1) {

  							newLinkCaption += ' [сообщение #'
  								+ responseDOM.querySelector('#postcount'
  								+ href.replace(/^.+#post(\d+)$/, '$1')).name
  								+ ']';
  						};
  				};

  			// Если ссылка на отдельное сообщение
  				if (href.indexOf('showpost.php') > -1) {
  					let postId = href.replace(/^.+p=(\d+).*$/, '$1');
  					let messageNumber = responseDOM.querySelector('#postcount' + postId).name;
  					let hrefToSearch ='showthread.php?p=' + postId + '#post' + postId;
  					let threadName = responseDOM
  						.querySelector('a[href="' + hrefToSearch + '"]')
  						.textContent;

  					newLinkCaption = threadName + ' [сообщение #' + messageNumber + ', ОТДЕЛЬНО]';
  				};

  			aLink.textContent = newLinkCaption || href;
  			aLink.style.fontWeight = newLinkCaption ? 'bold' : 'normal';
  		}
  	};

  	YAHOO.util.Connect.asyncRequest('GET', href, callbacks, '');
  });
})();
