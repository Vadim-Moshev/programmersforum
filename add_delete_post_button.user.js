// ==UserScript==
// @name         Кнопка "Удалить сообщение"
// @version      1
// @description  Добавляет кнопку удалить сообщение и соответствующий функционал
// @downloadURL  https://github.com/Vadim-Moshev/programmersforum/raw/master/add_delete_post_button.user.js
// @updateURL    https://github.com/Vadim-Moshev/programmersforum/raw/master/add_delete_post_button.user.js
// @author       Vadim Moshev
// @include      *programmersforum.ru/showthread.php*
// ==/UserScript==

(function() {
	'use strict';

	// Защита от повторного запуска
		if (window.addDeletePostButton) {
			return;
		};
		window.addDeletePostButton = true;

	// Не включать скрипт, если текущая тема удалена
		let areThereClosedOrReplyButtons = document.querySelector('img[src$="threadclosed.gif"]')
			|| document.querySelector('img[src$="/reply.gif"]');
		if ( !areThereClosedOrReplyButtons ) {
			return;
		};

  const clWrite = msg => {console.log(msg)};
	const getById = id => document.getElementById(id);
	const mkText = txt => document.createTextNode(txt);
	const STYLE_ID = +document.querySelector('select[name="styleid"] option[selected]').value;
	const THREAD_ID = getById('inlinemodform').action.match(/threadid=(\d+)/)[1];
	const ANIMATION_CLASSES_LIST = [];
	const goToParentUnit = _ => {document.location = document.querySelector('span.navbar:last-child a').href};
	const PAGINATORS_SET = document.querySelectorAll('div.pagenav');
	const POSTS_CONTAINER = getById('posts');
	const deleteElement = AElement => AElement.parentNode.removeChild(AElement);
	const BUTTON_BACKGROUND_COLOR = ['839DCA', '7D7D7D'][STYLE_ID - 1];
	const BUTTON_BACKGROUND_GRADIENT = ['linear-gradient(to right, #839DCA, #35496C)',
				'linear-gradient(to right, #7D7D7D, #4A4A4A)'][STYLE_ID - 1];
	const isApproved = APost => !APost.querySelector('img[src="images/misc/moderated.gif"]');
	const isAlive = APost => !!APost.querySelector('a.bigusername');
	const UNAPPROVED_MESSAGES_NOTIFIER_BLOCK = getById('UNAPPROVED_MESSAGES_NOTIFIER');


  // ========================================================================

  // Получим номера текущей страницы и количества страниц в теме
  	let currentPageNumber = 1;
  	let threadPagesNumber = 1;
  	if (PAGINATORS_SET.length) {
  		let p = PAGINATORS_SET[0];
  		currentPageNumber = +p.querySelector('.vbmenu_control').textContent.split(' ')[1];
  		threadPagesNumber = +p.querySelector('.vbmenu_control').textContent.split(' ')[3];
  	};
  	const CURRENT_PAGE_NUMBER = currentPageNumber;
  	const THREAD_PAGES_NUMBER = threadPagesNumber;
  	let thisPageIsLast = (CURRENT_PAGE_NUMBER == THREAD_PAGES_NUMBER);

  	let oldPaginatorsSet = PAGINATORS_SET;

  // ========================================================================  
  
  	Array.prototype.getRandomElement = function() {
  		let getRandomInt = (AMin, AMax) => Math.floor( Math.random()*(AMax - AMin + 1) ) + AMin;
  		return this[getRandomInt(0, this.length - 1)];
  	};

  // ========================================================================

  // Вкючение отключение полос прокрутки страницы (true - вкл / false - выкл)
	// Второй аргумент - буква оси (X/Y). если не передано, то обе оси
	function toggleScrollBars(AState, AAxis = '') {
		document.body.style['overflow' + AAxis.toUpperCase()] = ['hidden', 'auto'][+AState];
	};

  // ========================================================================

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

  // ========================================================================
  
  function isLastAlivePostOnPage(APost) {
  	let nextPost = APost.nextElementSibling;
  	while (nextPost.id != 'lastpost') {
  		if ( isAlive(APost) ) {
  			return false;
  		};
  	};
  	return true;
  };

  // ========================================================================

  function getLastAlivePost(ADOMForSearch) {
		let lastAlivePost = ADOMForSearch.querySelector('#lastpost').previousElementSibling;
		while ( !isAlive(lastAlivePost) ) {
			lastAlivePost = lastAlivePost.previousElementSibling
		};

		return lastAlivePost;
	};

  // ========================================================================

  // Функция преобразует HTML-текст в DOM иерархиею элементов
  // На выходе - div-контейнер с иерархией
  function HTMLTextToDOM(AHTMLText) {
  	let container = mkElem('div');
  	container.insertAdjacentHTML('afterBegin', AHTMLText);
  	return container;
  };

  // ========================================================================
  
  function unicodeToWin1251_UrlEncoded(s) {
	  // Функция найдена по адресу: https://toster.ru/q/323211
  	let DMap = {
			0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 12, 13: 13,	14: 14, 15: 15,
			16: 16, 17: 17, 18: 18, 19: 19, 20: 20, 21: 21, 22: 22, 23: 23, 24: 24, 25: 25, 26: 26, 27: 27, 28: 28, 29: 29,
			30: 30, 31: 31, 32: 32, 33: 33, 34: 34, 35: 35, 36: 36, 37: 37,	38: 38, 39: 39, 40: 40, 41: 41, 42: 42, 43: 43,
			44: 44, 45: 45, 46: 46, 47: 47, 48: 48, 49: 49, 50: 50, 51: 51, 52: 52, 53: 53, 54: 54, 55: 55, 56: 56, 57: 57,
			58: 58, 59: 59, 60: 60, 61: 61, 62: 62, 63: 63, 64: 64, 65: 65, 66: 66, 67: 67, 68: 68, 69: 69, 70: 70, 71: 71,
			72: 72, 73: 73, 74: 74, 75: 75, 76: 76, 77: 77, 78: 78, 79: 79, 80: 80, 81: 81, 82: 82, 83: 83, 84: 84, 85: 85,
			86: 86, 87: 87, 88: 88, 89: 89, 90: 90, 91: 91, 92: 92, 93: 93, 94: 94, 95: 95, 96: 96, 97: 97, 98: 98, 99: 99,
			100: 100, 101: 101, 102: 102, 103: 103, 104: 104, 105: 105, 106: 106, 107: 107, 108: 108, 109: 109, 110: 110,
			111: 111, 112: 112, 113: 113, 114: 114, 115: 115, 116: 116, 117: 117, 118: 118, 119: 119, 120: 120, 121: 121,
			122: 122, 123: 123, 124: 124, 125: 125, 126: 126, 127: 127, 1027: 129, 8225: 135, 1046: 198, 8222: 132,
			1047: 199, 1168: 165, 1048: 200, 1113: 154, 1049: 201, 1045: 197, 1050: 202, 1028: 170, 160: 160, 1040: 192,
			1051: 203, 164: 164, 166: 166, 167: 167, 169: 169, 171: 171, 172: 172, 173: 173, 174: 174, 1053: 205, 176: 176,
			177: 177, 1114: 156, 181: 181, 182: 182, 183: 183, 8221: 148, 187: 187, 1029: 189, 1056: 208, 1057: 209,
			1058: 210, 8364: 136, 1112: 188, 1115: 158, 1059: 211, 1060: 212, 1030: 178, 1061: 213, 1062: 214, 1063: 215,
			1116: 157, 1064: 216, 1065: 217, 1031: 175, 1066: 218, 1067: 219, 1068: 220, 1069: 221, 1070: 222, 1032: 163,
			8226: 149, 1071: 223, 1072: 224, 8482: 153, 1073: 225, 8240: 137, 1118: 162, 1074: 226, 1110: 179, 8230: 133,
			1075: 227, 1033: 138, 1076: 228, 1077: 229, 8211: 150, 1078: 230, 1119: 159, 1079: 231, 1042: 194, 1080: 232,
			1034: 140, 1025: 168, 1081: 233, 1082: 234, 8212: 151, 1083: 235, 1169: 180, 1084: 236,	1052: 204, 1085: 237,
			1035: 142, 1086: 238, 1087: 239, 1088: 240, 1089: 241, 1090: 242, 1036: 141, 1041: 193, 1091: 243, 1092: 244,
			8224: 134, 1093: 245, 8470: 185, 1094: 246, 1054: 206, 1095: 247, 1096: 248, 8249: 139, 1097: 249, 1098: 250,
			1044: 196, 1099: 251, 1111: 191, 1055: 207, 1100: 252, 1038: 161, 8220: 147, 1101: 253, 8250: 155, 1102: 254,
			8216: 145, 1103: 255, 1043: 195, 1105: 184, 1039: 143, 1026: 128, 1106: 144, 8218: 130, 1107: 131, 8217: 146,
			1108: 186, 1109: 190
		};

    let L = [];
    for (let i = 0; i < s.length; i++) {
        let ord = s.charCodeAt(i);
        if ( !(ord in DMap) )
            throw "Character " + s.charAt(i) + " isn't supported by win1251!";
        L.push('%' + DMap[ord].toString(16));
    };
    return L.join('').toUpperCase();
	};

  // ========================================================================

  function insertButtonIntoPost(APost, AIsFirstPost, AIsUnapproved) {
		let quickReplyButton = APost.querySelector('a[id^="qr_"]');
		let quickReplyButtonParent = quickReplyButton.parentNode; // Ошибка
		let postId = +quickReplyButton.id.replace('qr_', '');

		let deletePostButton = mkElem(
			'div',
			null,
			{
				display 				: 'inline-block',
				height 					: '16px',
				borderRadius 		: '10px',
				color 					: 'white',
				backgroundColor : BUTTON_BACKGROUND_COLOR,
				backgroundImage : BUTTON_BACKGROUND_GRADIENT,
				cursor 					: 'pointer',
				fontWeight 			: 'bold',
				fontFamily 			: 'helvetica',
				padding 				: '3px 10px',
				position 				: 'relative',
				top 						: '-4px'
			},
			'Удалить'
		);

		deletePostButton.onclick = function() {
			openPanel(AIsFirstPost, postId, AIsUnapproved);
		};

		quickReplyButtonParent.appendChild(deletePostButton);
		return postId;
	};

  // ========================================================================

  function setQuickQuoteToPost(APost) {
		// Добавим функцию быстрой цитаты
		// Автор кода - Copyright (c) 2016 Alex P. (alexp.frl@gmail.com, http://programmersforum.ru/member.php?u=129198)
			function scrollIntoMiddle(element) {
		    var elementRect = element.getBoundingClientRect();
		    var absoluteElementTop = elementRect.top + window.pageYOffset;
		    var height = elementRect.height ? elementRect.height : 100;
		    var middle = absoluteElementTop - (window.innerHeight / 2) + height / 2;
		    window.scrollTo(0, middle);
			};

			function appendText(text) {
        if (vB_Editor[QR_EditorID].get_editor_contents().length > 0) {
            text = '\n' + text;
        }
        vB_Editor[QR_EditorID].insert_text(text);
        vB_Editor[QR_EditorID].collapse_selection_end();

        scrollIntoMiddle(vB_Editor[QR_EditorID].textobj);
	    };
			
			$(APost).find('a:has(img[src*="quote."])').click( function(e) {
        e.preventDefault();

        var url = $(this).attr('href');
        var progressIndicator = $(this).prevAll('img[id^="progress"]').first();

        progressIndicator.show();

        $.get(url, function(response) {
            var html = $.parseHTML(response);

            var quote = $.trim($(html).find('#vB_Editor_001_textarea').text());

            if (quote) {
                appendText(quote);
            }
        }).done(function() {
            progressIndicator.hide();
        });
			});
	};

  // ========================================================================
  
  // В эту функцию надо передавать Warpper поста, который начинается как <div align="center">
  function getPostId(APost) {
  	if (APost.tagName != 'DIV') {
  		return null;
  	};

  	let w = APost.querySelector('div[id^="edit"]');
  	return w ? +w.id.replace('edit', '') : null;
  };

  // ========================================================================

  function executePostDeleting() {
  	// Покажем лоадер
			loaderPicture.style.display = 'inline';

		// Составим объект для передачи скрипту
			let objectToSend = {
				s: '', // Пустой
				securitytoken:	SECURITYTOKEN, // Маркер безопасности
				t: THREAD_ID, // ID темы
				p: '', // пустой
				postids: postIdHiddenField.value, // ID посто дял удаления (но у нас толкьо 1)
				do: 'dodeleteposts', // Имя действия
				url: encodeURIComponent('/showthread.php?t=' + THREAD_ID + '&page=' + CURRENT_PAGE_NUMBER),
				deletetype: '1', // Тип удаления - мягкое
				deletereason: unicodeToWin1251_UrlEncoded(deletingReasonTextField.value)
			};
			let stringedObjectToSend = '';
			for (let param in objectToSend) {
				stringedObjectToSend += param + '=' + objectToSend[param] + '&';
			};
			stringedObjectToSend = stringedObjectToSend.slice(0, -1);

			let callbacks = {
				success: function(AResponseObject) {
					closePanel();
					// в случае удаления темы "проанимируем" её и перейдём в родРаздел
						if (+isFirstPostHiddenField.value) {
							toggleScrollBars(false);
							document.body.className = ANIMATION_CLASSES_LIST.getRandomElement();
							setTimeout(goToParentUnit, 1000);
							return;
						};

					if (+isUnapprovedHiddenField.value) {
					// Интеграция со скриптом уведомления о непроверенных темах/сообщениях
					// Уменьшим количество непроверенных сообщений на 1, если такая ссылка и вообще блок есть
						if (UNAPPROVED_MESSAGES_NOTIFIER_BLOCK) {
							let arr = UNAPPROVED_MESSAGES_NOTIFIER_BLOCK.querySelectorAll('a');
							for (let i = 0; i < arr.length; i++) {
								let p = arr[i];
								let textContent = p.textContent;
								if ( /^Сообщения на премодерации/.test(textContent) ) {
									let number = +textContent.split(': ')[1];
									if (number > 1) {
										p.textContent = p.textContent.replace(/\d+$/, number - 1)
									} else {
										if (arr.length == 2) { // значит, у нас ещё есть ТЕМЫ на премодерации
											deleteElement(p);
										} else {
											deleteElement(UNAPPROVED_MESSAGES_NOTIFIER_BLOCK);
										};
									};
									break;
								};
							};
						};
					};

					// получим dom-ссылку на элемент удаляемого поста
						let deletedPostElement = getById('edit' + postIdHiddenField.value).parentNode.parentNode;

					// И на его враппер, который будем сжимать
						let deletedPostElementWrapper = deletedPostElement.parentNode;
						
					let deletedPostWasUnapproved = !isApproved(deletedPostElementWrapper);
					let deletedPostWasLastOnPage = isLastAlivePostOnPage(deletedPostElementWrapper);
					let nextToDeletedPost = deletedPostElementWrapper.nextElementSibling;
					let lastPostOnCurrentPageId = getPostId( getLastAlivePost(document.body) );

					// назначим высоту врапперу, чтобы применить класс сжатия высоты
						let h = deletedPostElementWrapper.clientHeight + 'px';
						deletedPostElementWrapper.setAttribute('style', 'height: ' + h);
					// установим класс сжатия высоты до нуля
						deletedPostElementWrapper.className = 'serviceStyle_decreaseHeightToZero';

					// Анимация удаления
						toggleScrollBars(false, 'X');
						deletedPostElement.className = ANIMATION_CLASSES_LIST.getRandomElement();
						

					// плавно сожмём враппер по высоте до нуля, удалив атрибут style
						setTimeout(
							_ => {toggleScrollBars(true, 'X'); deletedPostElementWrapper.removeAttribute('style')},
							1000
						);

					// Удаления враппера элемента из DOM-дерева
						setTimeout(
							_ => {deleteElement(deletedPostElementWrapper)},
							2000
						);

					// Если кол-во постов после удаления равно 0 (последний пост на стр.), - переход в род раздел
						setTimeout(
							function() {
								let remainingPostsNumberOnCurrentPages = POSTS_CONTAINER
									.querySelectorAll('#posts div[align="center"] .bigusername')
									.length;
								if (!remainingPostsNumberOnCurrentPages) {
									goToParentUnit();
								};
							},
							2300 // Через 0,3 сек после удаления поста из DOM-дерева
						);

					if (!thisPageIsLast) {
						let loadedDOMAfterPostDeleting = HTMLTextToDOM(AResponseObject.responseText);
						let postToInsert = loadedDOMAfterPostDeleting // Следующий за тем, что был последним перед удалением
							.querySelector('#edit' + lastPostOnCurrentPageId) // lastPostOnCurrentPageId - до удаления
							.parentNode
							.parentNode
							.parentNode
							.nextElementSibling;

						// Вставляем сообщение со следующей страницы
							let lp = getById('lastpost');
							let containerToInsertInto = lp.parentNode;
							while (postToInsert.id != 'lastpost') { // нам надо на id поста, а id элемента
								if ( isAlive(postToInsert) ) {
									let clone = postToInsert.cloneNode(true);
									containerToInsertInto.insertBefore(clone, lp);
									let isUnapproved = !isApproved(clone);
									insertButtonIntoPost(clone, false, isUnapproved);

									let newPostId = getPostId(clone);
									// регистрация конткектного меню ника, репутации и "быстрый ответ на это сообщение"
										vbmenu_register("postmenu_" + newPostId, true);
										vbrep_register(newPostId.toString());
										setQuickQuoteToPost(clone);
								};
								postToInsert = postToInsert.nextElementSibling;
							};
							vB_AJAX_QuickEdit_Init('posts'); // Иниализация быстрого редактора
							qr_init(); // И быстрого ответа

						// Проверим, существует ли пагинатор после удаления
						// если нет - удалим текущий и считаем текущую страницу последний
						// если да - проверим с помощью него, является ли текущая страница последней
							let newPaginatorsSet = loadedDOMAfterPostDeleting.querySelectorAll('.pagenav');
							if (!newPaginatorsSet.length) {
								deleteElement(oldPaginatorsSet[0]);
								deleteElement(oldPaginatorsSet[1]);
								thisPageIsLast = true;
							} else {
								let p = newPaginatorsSet[0];
								let nextToAlt2Tag = p.querySelector('.alt2').nextElementSibling;
								thisPageIsLast = (nextToAlt2Tag.className != 'alt1');

								// Обновим пагинаторы
									oldPaginatorsSet[0].parentNode.replaceChild(newPaginatorsSet[0], oldPaginatorsSet[0]);
									oldPaginatorsSet[1].parentNode.replaceChild(newPaginatorsSet[1], oldPaginatorsSet[1]);

									oldPaginatorsSet = newPaginatorsSet;
							};
					};

					// Скорректируем порядковые номер постов и ссылку на них на странице,
					// если удаляемое сообщение не последнее на странице или не одобрено
						if (deletedPostWasLastOnPage || deletedPostWasUnapproved ) {
							return;
						};
						let numberToLastPost;
						let postToChangeNumberIn = nextToDeletedPost;
						while (postToChangeNumberIn.id != 'lastpost') {
							let identifyerOfPostToChangeNumberIn = getPostId(postToChangeNumberIn);
							let c = !isAlive(postToChangeNumberIn)
								|| !isApproved(postToChangeNumberIn)
								|| !identifyerOfPostToChangeNumberIn;
							if (!c) {
								let a = postToChangeNumberIn.querySelector('a[id^="postcount"]');
								let newNumber;
								a.childNodes[0].textContent = newNumber = +a.childNodes[0].textContent - 1;
								a.href = a.href.replace(/\d+$/, newNumber);
								a.name = newNumber;
								numberToLastPost = newNumber+1;
							};

							postToChangeNumberIn = postToChangeNumberIn.nextElementSibling;
						};
					// у добавленного сообщения не корректируется номер (он остаётся равным предпоследнему)
					// не знаю пока, почему так, возможно это связано с тем, что объекты копируются по ссылке,
					// а не содержимому. Корректируем последний пост отдельно. Да, это по-быдлокоредски.
					// Сначала получим последний одобренный пост, а потом всё остальное
						let s = getLastAlivePost(document.body);
						while(!isApproved(s)) {
							s = s.previousElementSibling;
						};
						let a = s.querySelector('a[id^="postcount"]');
						a.href = a.href.replace(/\d+$/, numberToLastPost);
						a.name = numberToLastPost;
						a.childNodes[0].textContent = numberToLastPost;
				},
				failure: function() {
					alert('Ошибка отправки запроса. Повторите попытку позднее.');
					closePanel();
				}
			};
			YAHOO.util.Connect.asyncRequest('POST', '/inlinemod.php', callbacks, stringedObjectToSend);
  };

  // ========================================================================

  // Сверстаем панель для удаления сообщений
    // Оверлей
	    let addDeletePostButtonPanelOverlay = mkElem(
	    	'div',
	    	{
	    		id: 'addDeletePostButtonPanelOverlay'
	    	},
	    	{
	    		position: "fixed",
	    		zIndex: '1000',
	    		display: "none",
	    		left: "0",
	    		right: "0",
	    		top: "0",
	    		bottom: "0",
	    		backgroundColor: "rgba(33, 150, 243, 0.68)" // Подобрал экспериментальным путём. Красиво.
	    	}
	    );
		document.body.appendChild(addDeletePostButtonPanelOverlay);

		// Сама панель удаления
	  	let panel = mkElem(
	  		'div',
	  		null,
	  		{
	  			backgroundColor: "#E1E4F2",
	  			position: "absolute",
	  			left: "50%",
	  			top: "50%",
	  			transform: "translate(-50%, -50%)",
	  			padding: "10px",
	  			borderRadius: "10px",
	  			border: "2px solid #bebebe"
	  		}
	  	);
	  	addDeletePostButtonPanelOverlay.appendChild(panel);

	  	// Скрытые поля для ID сообщения
	  		let postIdHiddenField = mkElem('input', {type: 'hidden'});
	  		let isFirstPostHiddenField = mkElem('input', {type: 'hidden'});
	  		let isUnapprovedHiddenField = mkElem('input', {type: 'hidden'});

	  		panel.appendChild(postIdHiddenField);

	  	// Предупреждение, если это первый пост
	  		let firstPostWarning = mkElem(
	  			'div',
	  			null,
	  			{
	  				textAlign: 'center',
	  				color: 'red',
	  				fontWeight: 'bold'
	  			},
	  			'Это первое сообщение темы. Вместе с ним будет удалена и вся тема.'
	  		);
	  		panel.appendChild(firstPostWarning);

	  	// Отчеркнуть линией
	  		panel.appendChild( mkElem('hr') );

	  	// Select с причинами для удаления и тектовым полем для её ввода. Всё в виде таблицы 2*2
	  	// <Подпись> <select>
	  	// <Подпись> <Тектовое поле>
	  		let deletingResonTable = mkElem('table');
	  		let deletingReasonTr1 = mkElem('tr');
	  		let deletingReasonTd1 = mkElem('td', null, {width: "220px"}, 'Выберите причину удаления:');
	  		let deletingReasonTd2 = mkElem('td');
	  		let deletingReasonTr2 = mkElem('tr');
				let deletingReasonTd3 = mkElem('td', null, null, 'или введите вручную:');
	  		let deletingReasonTd4 = mkElem('td');

	  		let deletingReasonsArray = [
	  			'Спам / Реклама',
					'Нарушитель-рецедивист',
					'Дубликат',
					'Неактуально',
					'Чистка',
					'Мусор',
					'Флуд',
					'Оффтоп',
					'По просьбе автора / Автор затёр сообщение',
					'Оскорбления',
					'Мат',
					'Кросспостинг'
	  		];
	  		let deletingReasonsSelect = mkElem('select', null, {width: "100%"});
	  		let deletingReasonsSelectFirstOption = mkElem('option', null, null, '[Выберите причину]');
	  		deletingReasonsSelectFirstOption.disabled = true;
	  		deletingReasonsSelectFirstOption.selected = true;
	  		deletingReasonsSelect.appendChild( deletingReasonsSelectFirstOption );
	  		for (let i = 0; i < deletingReasonsArray.length; i++) {
	  			let deletingReasonOpt = mkElem(
	  				'option',
	  				{
	  					value: deletingReasonsArray[i]
	  				},
	  				null,
	  				deletingReasonsArray[i]
	  			);
	  			deletingReasonsSelect.appendChild(deletingReasonOpt);
	  		};

	  		deletingReasonTd2.appendChild(deletingReasonsSelect);
	  		deletingReasonTr1.appendChild(deletingReasonTd1);
	  		deletingReasonTr1.appendChild(deletingReasonTd2);

	  		let deletingReasonTextField = mkElem(
	  			'input',
	  			{
	  				type: "text"
	  			},
	  			{
	  				width: "98%"
	  			}
	  		);

	  		deletingReasonTd4.appendChild(deletingReasonTextField);
	  		deletingReasonTr2.appendChild(deletingReasonTd3);
	  		deletingReasonTr2.appendChild(deletingReasonTd4);

	  		deletingResonTable.appendChild(deletingReasonTr1);
	  		deletingResonTable.appendChild(deletingReasonTr2);

	  		panel.appendChild(deletingResonTable);

	  		// Сделаем так, чтобы селект причины удаления влиял на её тектовое поле
	  			deletingReasonsSelect.onchange = function () {
	  				deletingReasonTextField.value = this.value;
	  			};

	  	// Отчеркнуть линией
	  		panel.appendChild( mkElem('hr') );

	  	// Кнопки "выполнить" и "отмена"
	  		let divForButtons = mkElem('div', null, {textAlign: "center"});

	  		let buttonExecute = mkElem(
	  			'input',
	  			{
	  				type: "button",
	  				value: "Выполнить"
	  			},
	  			{
	  				marginRight: "20px"
	  			}
	  		);

	  		let buttonCancel = mkElem(
	  			'input',
	  			{
	  				type: "button",
	  				value: "Отмена"
	  			}
	  		);

	  		divForButtons.appendChild(buttonExecute);
	  		divForButtons.appendChild(buttonCancel);

	  		panel.appendChild(divForButtons);

	  	// картинка лоадер
	  		let loaderPicture = mkElem(
	  			'img',
	  			{
	  				src: 'http://www.programmersforum.ru/images/misc/progress.gif',
	  				width: '50'
	  			},
	  			{
	  				position: 'absolute',
	  				left: '50%',
	  				top: '50%',
	  				transform: 'translate(-50%, -50%)'
	  			}
	  		);
	  		panel.appendChild(loaderPicture);

	  		// заставим кнопку "отмена" закрывать панель
	  			buttonCancel.onclick = function () {
	  				closePanel()
	  			};

	  		// Обработчик кнопки выполнить
	  			buttonExecute.onclick = executePostDeleting;

	  		// При нажатии Enter на поле ввода причины также удалить пост
	  			deletingReasonTextField.onkeydown = function(AEvent) {
	  				if (AEvent.keyCode == 13) {
	  					executePostDeleting();
	  				};
	  			};

	// ========================================================================

	function closePanel() {
	  toggleScrollBars(true);
	  addDeletePostButtonPanelOverlay.style.display = 'none';
	};

	// ========================================================================

	function openPanel(AIsFirstPost, APostId, AIsUnapproved) {
	  toggleScrollBars(false);
	  addDeletePostButtonPanelOverlay.style.display = 'block';

	  // Установка служебной инфомрации
	  	isFirstPostHiddenField.value = +AIsFirstPost;
	  	postIdHiddenField.value = APostId;
	  	isUnapprovedHiddenField.value = +AIsUnapproved;

	  // Сбросить состояние органов управления
	  	deletingReasonsSelectFirstOption.selected = true;
	  	deletingReasonTextField.value = '';
		  loaderPicture.style.display = 'none';
		
		// Установить предупреждение, если это первый пост
			let q = AIsFirstPost ? 'block' : 'none';
		  firstPostWarning.style.display = q;
		  firstPostWarning.nextElementSibling.style.display = q;
	};

  // ========================================================================
  
  // Добавим CSS стили на страницу для анимации удаления постов
  /*<переход> = [ none | <transition-property> ] || <transition-duration> ||
	<transition-timing-function> || <transition-delay>*/
  	let styleTag = mkElem('style');
  	styleTag.appendChild( mkText(`
			/* dps - delete post style */
			.dps_fadeout {
				opacity: 0;
				transition: all 1s ease-out
			}

			.dps_swirl {
				transform: rotate(1800deg) scale(0);
				transition: all 1s ease-out
			}

			.dps_zoomInFadeout {
				transform: scale(5);
				opacity: 0;
				transition: all 1s ease-out
			}

			.dps_decreasing {
				transform: scale(0);
				transition: all 1s ease-out
			}

			.dps_oneWayBoomerang {
				transform: rotateY(1800deg) scale(0);
				transition: all 1s ease-out
			}

			.dps_verticalComression {
				transform: scaleY(0);
				transition: all 1s ease-out
			}

			.dps_tornado {
				transform: rotate(-1800deg) scale(0.0) translate(650px,-1000px);
				transition: all 1s ease-out;
			}

			.dps_dragster_left {
				transform: skew(-60deg) translateX(2500px);
				opacity: 0;
				transition: all 1s ease-out;
			}

			.dps_dragster_right {
				transform: skew(60deg) translateX(-2500px);
				opacity: 0;
				transition: all 1s ease-out;
			}

			.serviceStyle_decreaseHeightToZero {
				height: 0px;
				transition: all 1s ease-out
			}
  	`) );
  	document.head.appendChild(styleTag);
  	ANIMATION_CLASSES_LIST.push('dps_fadeout');
  	ANIMATION_CLASSES_LIST.push('dps_swirl');
  	ANIMATION_CLASSES_LIST.push('dps_zoomInFadeout');
  	ANIMATION_CLASSES_LIST.push('dps_decreasing');
  	ANIMATION_CLASSES_LIST.push('dps_oneWayBoomerang');
  	ANIMATION_CLASSES_LIST.push('dps_verticalComression');
  	ANIMATION_CLASSES_LIST.push('dps_tornado');
  	ANIMATION_CLASSES_LIST.push('dps_dragster_left');
  	ANIMATION_CLASSES_LIST.push('dps_dragster_right');

  // ========================================================================

	// Перебор живых постов на странице
		let postsSet = POSTS_CONTAINER.querySelectorAll('div[align="center"]');
		for (let i = 0; i < postsSet.length; i++) {
			let post = postsSet[i];
			if (isAlive(post)) {
				let isFirstPost = (i == 0) && (CURRENT_PAGE_NUMBER == 1);
				let isUnapproved = !isApproved(post);

				insertButtonIntoPost(post, isFirstPost, isUnapproved);
			};
		};
})();
