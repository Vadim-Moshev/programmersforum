// ==UserScript==
// @name         unapprovedThreadPostNotifier
// @namespace    http://tampermonkey.net/
// @version      1.3
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
      var e = document.createElement(aName);

      if (aAttributes) {
        for (var attributeName in aAttributes) {
          e[attributeName] = aAttributes[attributeName];
        };
      };

      if (aCSSProps) {
        for (var cssPropName in aCSSProps) {
          e.style[cssPropName] = aCSSProps[cssPropName];
        };
      };

      if (aInnerText) {
        e.textContent = aInnerText;
      };

      return e;
    };

    // ================================================================================

    var notificationBlockCSSProps = {
      display: 'none',
      padding: "5px",
      backgroundColor: "orange",
      position: "fixed",
      top: "0",
      left: "0",
      border: "2px black groove"
    };

    var notificationBlock = mkElem('div', null, notificationBlockCSSProps);
    document.body.appendChild(notificationBlock);

    var serviceObjectsToSendArray = [
    	{do:"viewthreads", type:"moderated", textForLink: "Темы на премодерации: "},
    	{do:"viewposts", type:"moderated", textForLink: "Сообщения на премодерации: "}
    ];

    serviceObjectsToSendArray.forEach(function(aObjectToSend) {
    	function callBack(aData, aStatus) {
	      if (aStatus != 'success') {
	        console.log('Ошибка отправки запроса. Статус: ' + aStatus);
	        return;
	      };

	      var amount = $(aData).find('#threadslist span.smallfont').text().match(/\d+/g)[0];

	      if (amount == 0) {
	      	return;
	      };

	     	notificationBlock.style.display = 'block';
	     	var textForLink = aObjectToSend.textForLink;
	     	delete aObjectToSend.textForLink;

	      var locationSearchParamsArray = [];
  			for (var prop in aObjectToSend) {
  				locationSearchParamsArray.push( prop + '=' + aObjectToSend[prop] );
  			};
  			var hrefString = location.origin + '/moderation.php?' + locationSearchParamsArray.join('&');

  			var notificationLinkAttributes = {
	      	href: hrefString,
	      	target: "_blank"
	    	};

		    var notificationLinkCSSProps = {
		      color: "#FFF",
		      fontWeight: "bold",
		      borderBottom: "1px #fff dotted"
		    };

		    var link = mkElem('a',
		    	notificationLinkAttributes,
		    	notificationLinkCSSProps,
		    	textForLink + amount
	    	);

	    	var blockForLink = mkElem('div', null, null);
	    	blockForLink.appendChild(link);
	    	notificationBlock.appendChild(blockForLink);
   		};

  		$.get('/moderation.php', aObjectToSend, callBack);
    });
})();
