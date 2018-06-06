// ==UserScript==
// @name         Обращение по нику
// @namespace    http://programmersforum.ru/
// @version      1.1
// @description  Позволяет обращаться к пользователемя по нику
// @downloadURL  https://github.com/Vadim-Moshev/programmersforum/raw/master/refer_by_nickname.user.js
// @updateURL    https://github.com/Vadim-Moshev/programmersforum/raw/master/refer_by_nickname.user.js
// @author       Vadim Moshev
// @include      *programmersforum.ru/showthread.php*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function getById(id) {
    	return document.getElementById(id);
    };

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

    // ------------------------------------------------------------------------

    function scrollIntoMiddle(element) {
        var elementRect = element.getBoundingClientRect();
        var absoluteElementTop = elementRect.top + window.pageYOffset;
        var height = elementRect.height ? elementRect.height : 100;
        var middle = absoluteElementTop - (window.innerHeight / 2) + height / 2;
        window.scrollTo(0, middle);
    }

    function appendText(text) {
        vB_Editor[QR_EditorID].insert_text(text);
        vB_Editor[QR_EditorID].collapse_selection_end();

        scrollIntoMiddle(vB_Editor[QR_EditorID].textobj);
}

    // ------------------------------------------------------------------------

    // Защита от повторного запуска
    	var REFER_BY_NICKNAME_ID = 'referByNickname';
    	if (getById(REFER_BY_NICKNAME_ID)) {
    		return;
    	};
    	document.body.insertBefore(mkElem('div', {id: REFER_BY_NICKNAME_ID}), document.body.firstElementChild);

    // Выйдем из скрипта, если такого нет текстового поля
			if (!getById('vB_Editor_QR_textarea')) {
				return;
			};

		// Будем размещать кнопку обращения по нику под никами пользователей
			// Получим все посты на странице
				var postsArray = [];
				var tables = document.getElementsByTagName('table');
				for (var i = 0; i < tables.length; i++) {
					if (/^post\d+$/.test( tables[i].id ) && tables[i].querySelector('.bigusername')) {
						postsArray.push(tables[i]);
					};
				};

			// размещаем кнопки и вешаем одновременно на них события по клику

				for (i = 0; i < postsArray.length; i++) {
					var divForButton = mkElem('div');					

					var button = mkElem(
						'span',
						{
							title: 'Ник пользователя будет выделен жирным и вставлен в текстовое поле.'
						},
						{
							fontWeight: 'bold',
							color: '#424242',
							cursor: 'pointer',
						},
						'[Обратиться по нику]'
					);
					button.nickname = postsArray[i].querySelector('.bigusername').textContent;

					divForButton.appendChild(button);

					var postmenu = postsArray[i].querySelector('div[id^="postmenu_"]');
					postmenu.parentNode.insertBefore(divForButton, postmenu.nextElementSibling);

					button.onclick = function() {
						appendText('[B]' + this.nickname + '[/B], ');
					};

					button.onmouseover = function() {
						this.style.color = 'red'
					};

					button.onmouseout = function() {
						this.style.color = '#424242'
					};
				};
})();
