// ==UserScript==
// @name         unapprovedThreadPostNotifier
// @version      4
// @downloadURL  https://github.com/Vadim-Moshev/programmersforum/raw/master/unapproved_notifier.user.js
// @updateURL    https://github.com/Vadim-Moshev/programmersforum/raw/master/unapproved_notifier.user.js
// @description  Уведомляет модераторов/администраторов о темах/сообщениях на премодерации
// @author       Vadim Moshev
// @include      *programmersforum.ru*
// @exclude      *programmersforum.ru/mo40/index.php
// @exclude      *programmersforum.ru/showpost.php*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    if (window.UNAPPROVED_MESSAGES_NOTIFIER) {
      return;
    };
    window.UNAPPROVED_MESSAGES_NOTIFIER = true;

    function clWrite(m) {
    	console.log(m);
    };

    // ================================================================================
    // Создаёт элемент с именем aName, атрибутами из объекта aAttributes,
    // свойствами из объекта aCSSProps и содержимым aInnerText
    // объеты должны иметь вид {свойство: "значение"}
    // если атрибуты/свойства не нужны, в соответствующих аргументах передайте null
    // aInnerText - не обязательный аргумент
    // Автор функции - Вадим Мошев
    function mkElem(aName, aAttributes, aCSSProps, aInnerText) {
      let e = document.createElement(aName);

      if (aAttributes) {
        for (let attributeName in aAttributes) {
          e[attributeName] = aAttributes[attributeName];
        };
      };

      if (aCSSProps) {
        for (let cssPropName in aCSSProps) {
          e.style[cssPropName] = aCSSProps[cssPropName];
        };
      };

      if (aInnerText) {
        e.textContent = aInnerText;
      };

      return e;
    };

    // ================================================================================

    let notificationBlockCSSProps = {
      display: 'none',
      padding: "5px",
      backgroundColor: "orange",
      position: "fixed",
      top: "0",
      left: "0",
      border: "2px black groove"
    };

    let notificationBlock = mkElem('div', null, notificationBlockCSSProps);
    document.body.appendChild(notificationBlock);

    let serviceObjectsToSendArray = [
    	{do: "viewthreads", type: "moderated", textForLink: "Темы на премодерации: "},
    	{do: "viewposts", type: "moderated", textForLink: "Сообщения на премодерации: "}
    ];

    serviceObjectsToSendArray.forEach(function(aObjectToSend) {
    	function callBack(aData, aStatus) {
	      if (aStatus != 'success') {
	        console.log('Ошибка отправки запроса. Статус: ' + aStatus);
	        return;
	      };

	      let amount = $(aData).find('#threadslist span.smallfont').text().match(/\d+/g)[0];

	      if (amount == 0) {
	      	return;
	      };

	     	notificationBlock.style.display = 'block';
	     	let textForLink = aObjectToSend.textForLink;
	     	delete aObjectToSend.textForLink;

	      let locationSearchParamsArray = [];
  			for (let prop in aObjectToSend) {
  				locationSearchParamsArray.push( prop + '=' + aObjectToSend[prop] );
  			};
  			let hrefString = location.origin + '/moderation.php?' + locationSearchParamsArray.join('&');

  			let notificationLinkAttributes = {
	      	href: hrefString,
	      	target: "_blank"
	    	};

		    let notificationLinkCSSProps = {
		      color: "#FFF",
		      fontWeight: "bold",
		      borderBottom: "1px #fff dotted"
		    };

		    let link = mkElem('a',
		    	notificationLinkAttributes,
		    	notificationLinkCSSProps,
		    	textForLink + amount
	    	);
        // назначем айдишники именно таким образом, потому что порядок следования ссылок может быть любым
          if ( /^Сообщения на премодерации/.test(link.textContent) ) {
            link.id = 'LINK_TO_UNAPPROVED_POSTS';
          } else {
            link.id = 'LINK_TO_UNAPPROVED_THREADS';
          };

	    	let blockForLink = mkElem('div', null, null);
	    	blockForLink.appendChild(link);
	    	notificationBlock.appendChild(blockForLink);
   		};

  		$.get('/moderation.php', aObjectToSend, callBack);
    });
})();
