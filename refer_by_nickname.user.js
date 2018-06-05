// ==UserScript==
// @name         Обращение по нику
// @namespace    http://tprogrammersforum.ru/
// @version      1
// @description  Позволяет обращаться к пользователемя по нику
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

    function insertAtCaret(areaId, text) {
		  var txtarea = getById(areaId);
		  var scrollPos = txtarea.scrollTop;
		  var strPos = 0;
		  var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
		            "ff" : (document.selection ? "ie" : false ) );
		  if (br == "ie") {
		      txtarea.focus();
		      var range = document.selection.createRange();
		      range.moveStart ('character', -txtarea.value.length);
		      strPos = range.text.length;
		  }
		  else if (br == "ff") strPos = txtarea.selectionStart;

		  var front = (txtarea.value).substring(0,strPos);
		  var back = (txtarea.value).substring(strPos,txtarea.value.length);
		  txtarea.value=front+text+back;
		  strPos = strPos + text.length;
		  if (br == "ie") {
		      txtarea.focus();
		      range = document.selection.createRange();
		      range.moveStart ('character', -txtarea.value.length);
		      range.moveStart ('character', strPos);
		      range.moveEnd ('character', 0);
		      range.select();
		  }
		  else if (br == "ff") {
		      txtarea.selectionStart = strPos;
		      txtarea.selectionEnd = strPos;
		      txtarea.focus();
		  }
		  txtarea.scrollTop = scrollPos;
};

    // ------------------------------------------------------------------------

    // Защита от повторного запуска
    	var REFER_BY_NICKNAME_ID = 'referByNickname';
    	if (getById(REFER_BY_NICKNAME_ID)) {
    		return;
    	};

    	document.body.insertBefore(mkElem('div', {id: REFER_BY_NICKNAME_ID}), document.body.firstElementChild);

    // Получим id текстового поля для сообщения и выйдем из скрипта, если такого поля нет
    	var textarea = getById('vB_Editor_QR_textarea');
			var areaId = 'vB_Editor_QR_textarea';
			if (!textarea) {
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
					var button = mkElem(
						'div',
						null,
						{
							textAlign: 'center',
							fontWeight: 'bold',
							color: '#22229C',
							cursor: 'pointer'
						},
						'[Ник]'
					);
					button.nickname = postsArray[i].querySelector('.bigusername').textContent;

					var postmenu = postsArray[i].querySelector('div[id^="postmenu_"]');
					postmenu.parentNode.insertBefore(button, postmenu.nextElementSibling);

					button.onclick = function() {
						textarea.focus();
						insertAtCaret( areaId, '[b]' + this.nickname + '[/b], ' );
					};
				};
})();
