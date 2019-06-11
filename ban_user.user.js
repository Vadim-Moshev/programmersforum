// ==UserScript==
// @name         Блокировка пользователя
// @version      1.1
// @description  Блокировка пользователя без захода в админку
// @downloadURL  https://github.com/Vadim-Moshev/programmersforum/raw/master/ban_user.user.js
// @updateURL    https://github.com/Vadim-Moshev/programmersforum/raw/master/ban_user.user.js
// @author       Vadim Moshev
// @include      *programmersforum.ru/showthread.php*
// @require		   https://raw.githubusercontent.com/Vadim-Moshev/programmersforum/master/consts.js
// ==/UserScript==

(function() {
    'use strict';

    const clWrite = msg => {console.log(msg);};
    const getById = id => document.getElementById(id);
    const mkText = txt => document.createTextNode(txt);

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

    // ------------------------------------------------------------------------    

    // Защита от повторного запуска
    	const BAN_USER_ID = 'banUserPanelOverlay';
    	if (getById(BAN_USER_ID)) {
    		return;
    	};

	  const postsArray = document.querySelectorAll('table[id^="post"]');

    // Сверстаем панель
    	// Оверлей
		    let banUserPanelOverlay = mkElem(
		    	'div',
		    	{
		    		id: BAN_USER_ID
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
		 		document.body.appendChild(banUserPanelOverlay);

		  // Сама панель бана
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
		  	banUserPanelOverlay.appendChild(panel);

		  // картинка лоадер
		  		let loaderPicture = mkElem(
		  			'img',
		  			{
		  				src: Moshev_PFConsts.PATH_TO_LOADER_ICON,
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

		  // Скрытые поля для служебных данных
	  		let threadIdHiddenField = mkElem('input', {type: 'hidden'});
	  		let postIdHiddenField = mkElem('input', {type: 'hidden'});
	  		let userIdHiddenField = mkElem('input', {type: 'hidden'});
	  		let userNameHiddenField = mkElem('input', {type: 'hidden'});

		  // Имя пользователя, к которому примяется наказание
	  		let userNameBold = mkElem('b');
	  		panel.appendChild( mkText('Применить наказание к ') );
	  		panel.appendChild(userNameBold);

	  	// Отчеркнуть линией
	  		panel.appendChild( mkElem('hr') );

		  // Таблица 3*2 со сроком бана, а также с селектом и текстовым полем причины
		  	// <Подпись> <select срок блокировки>
		  	// <Подпись> <select причина блокировки>
		  	// <Подпись> <textfield причина блокировки>
		  		let banUserTable = mkElem('table', null);

		  		let banUserTr1 = mkElem('tr');
		  		let banUserTd1 = mkElem('td', null, {width: "220px"}, 'Срок блокировки:');
		  		let banUserTd2 = mkElem('td');

		  		let banUserTr2 = mkElem('tr');
		  		let banUserTd3 = mkElem('td', null, null, 'Выберите причину блокировки:');
		  		let banUserTd4 = mkElem('td');

		  		let banUserTr3 = mkElem('tr');
		  		let banUserTd5 = mkElem('td', null, null, 'или введите её вручную:');
		  		let banUserTd6 = mkElem('td');

		  		let banUserValuesAndPeriods = [
		  			{value : "D_1", period: "1 день"},
						{value : "D_2", period: "2 дня"},
						{value : "D_3", period: "3 дня"},
						{value : "D_4", period: "4 дня"},
						{value : "D_5", period: "5 дней"},
						{value : "D_6", period: "6 дней"},
						{value : "D_7", period: "7 дней"},
						{value : "D_10", period: "10 дней"},
						{value : "D_14", period: "2 недели"},
						{value : "D_21", period: "3 недели"},
						{value : "M_1", period: "1 месяц"},
						{value : "M_2", period: "2 месяца"},
						{value : "M_3", period: "3 месяца"},
						{value : "M_4", period: "4 месяца"},
						{value : "M_5", period: "5 месяца"},
						{value : "M_6", period: "6 месяцев"},
						{value : "Y_1", period: "1 год"},
						{value : "Y_2", period: "2 года"},
						{value : "PERMANENT", period: "Пожизненная блокировка"}
		  		];

		  		let banUserPeriodSelect = mkElem('select', null, {width: "100%"});
		  		for (let i = 0; i < banUserValuesAndPeriods.length; i++) {
		  			let opt = mkElem(
		  				'option',
		  				 {
		  				 	value: banUserValuesAndPeriods[i].value
		  				 },
		  				 null,
		  				 banUserValuesAndPeriods[i].period
		  			);

		  			banUserPeriodSelect.appendChild(opt);
		  		};
		  		banUserPeriodSelect.value = "PERMANENT";

		  		let banUserReasons = [
		  			'Спам',
		  			'Нарушитель-рецедивист'
		  		];

		  		let banUserReasonsSelect = mkElem('select', null, {width: "100%"});
		  		let banUserReasonsSelectFirstOpt = mkElem('option', null, null, '[Выберите причину]');
		  		banUserReasonsSelectFirstOpt.disabled = banUserReasonsSelectFirstOpt.selected = true;
		  		banUserReasonsSelect.appendChild(banUserReasonsSelectFirstOpt);
		  		for (let i = 0; i < banUserReasons.length; i++) {
		  			let opt = mkElem('option', {value: banUserReasons[i]}, null, banUserReasons[i]);
		  			banUserReasonsSelect.appendChild(opt);
		  		};

		  		let banUserTextField = mkElem('input', {type: "text"}, {width: "98%"});

		  		banUserTd2.appendChild(banUserPeriodSelect);
		  		banUserTd4.appendChild(banUserReasonsSelect);
		  		banUserTd6.appendChild(banUserTextField);

		  		banUserTr1.appendChild(banUserTd1);
		  		banUserTr1.appendChild(banUserTd2);

		  		banUserTr2.appendChild(banUserTd3);
		  		banUserTr2.appendChild(banUserTd4);

		  		banUserTr3.appendChild(banUserTd5);
		  		banUserTr3.appendChild(banUserTd6);

		  		banUserTable.appendChild(banUserTr1);
		  		banUserTable.appendChild(banUserTr2);
		  		banUserTable.appendChild(banUserTr3);

		  		panel.appendChild(banUserTable);

		  		// Заставим select с причиой бана влиять на текстовое поле
		  			banUserReasonsSelect.onchange = function () {
		  				banUserTextField.value = this.value;
		  			};

		  // Отчеркнуть линией
		  		panel.appendChild( mkElem('hr') );

	  	// Кнопки "выполнить" и "отмена"
	  		let divForButtons = mkElem('div', null, {textAlign: "center"});

	  		let buttonExecute = mkElem( 'input', {type: "button", value: "Заблокировать"}, {marginRight: "20px"} );
	  		buttonExecute.onclick = function() {
	  			// После нажатия на кнопку "выполнить" покажем картинку-лоадер
						loaderPicture.style.display = 'inline';

	  			function unicodeToWin1251_UrlEncoded(s) {
					  // Функция найдена по адресу: https://toster.ru/q/323211
				  	var DMap = {
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
				        if ( !(ord in DMap) ) {
				        	throw "Character " + s.charAt(i) + " isn't supported by win1251!";
				        };
				        L.push('%' + DMap[ord].toString(16));
				    };
				    return L.join('').toUpperCase();
					};

					// Подготовим данные для отправки на сервер
						let objectToSend = {
		  				s: '', // Назначение мне неизвестно. Пустой всегда
			  			securitytoken : SECURITYTOKEN, // Маркер безопасности
			  			url: '/showthread.php?t=' + threadIdHiddenField.value,
			  			do: 'dodeletespam',
			  			postids: postIdHiddenField.value, // Возможно, идентификатор сообщения
			  			t: threadIdHiddenField.value, // id темы
			  			type: 'post', // Тип запроса
			  			deletetype: '1', // Тип удаления - "мягкое". Всегда равно 1
			  			deletereason: '', // Причину удаления сообщения не пишем - восстановим
			  			useraction: 'ban', // Возможно, действие над пользователем. Имеет значение ban толкьо при бане, иначе - пусто
			  			'userid[]': userIdHiddenField.value, // МАССИВ!!!!! с id пользователей; в нашем случае id один
	  					report: '0', // Не отправлять данные в службу анти-спама
					  	p: postIdHiddenField.value, // Идентификатор сообщения
					  	deleteother: '0',
					  	keepattachments: '1', // Сохраним вложения, потому что наша цель не удалить их
					  	usergroupid: '8', // id группы, в которую попадает пользователь. 8 - забаненнные
		  				period: banUserPeriodSelect.value, // Длительность блокировки
		  				reason: unicodeToWin1251_UrlEncoded(banUserTextField.value), // Причина бана
		  				sbutton: '' // Неизвестно. Значение декодировать не удалось, поэтому оставлю пустым
	  				};

	  				let requestString = '';
	  				for (let prop in objectToSend) {
	  					requestString += prop + '=' + objectToSend[prop] + '&';
	  				};
	  				requestString = requestString.slice(0, -1);

	  				let callbacks = {
	  					success: function() {
	  						// Изменить везде статус банимого пользователя на "Заблокирован"
	  							for (let i = 0; i < postsArray.length; i++) {
										let bigUsername = postsArray[i].querySelector('a.bigusername');

										// Пропустить трупы сообщений и сообщения, не принаджежащие банимому пользователю
											if (!bigUsername || bigUsername.textContent != userNameBold.textContent) {
												continue
											};
										
										let smallFontsPseudoArray = postsArray[i].querySelectorAll('.smallfont');
										let serviceInfo = smallFontsPseudoArray[smallFontsPseudoArray.length - 2];
										let smallFontsParent = serviceInfo.parentNode;
										
										let childNumber = 1;
										while (smallFontsParent.querySelectorAll('.smallfont').length > 1) {
											let tmp = smallFontsParent.children[childNumber];
											if (tmp.className != 'smallfont') {
												childNumber++
											} else {
												smallFontsParent.removeChild(smallFontsParent.children[childNumber]);
											};
										};

										let bannedCaption = mkElem('div', null, null, 'Заблокирован');
										bannedCaption.className = 'smallfont';
										smallFontsParent.insertBefore( bannedCaption, serviceInfo );
									};

								// Восстановить удалённое сообщение
									let restoreMessageObjectToSend = {
										do: 'undeleteposts',
										s: '',
										securitytoken: SECURITYTOKEN,
										threadid: threadIdHiddenField.value,
										p: '',
										url: '/showthread.php?t=' + threadIdHiddenField.value
									};
									restoreMessageObjectToSend['plist[' + postIdHiddenField.value + ']'] = 2;

									let restoreMessageRequestString = '';
									for (let prop in restoreMessageObjectToSend) {
										restoreMessageRequestString += prop + '=' + restoreMessageObjectToSend[prop] + '&';
									};
									restoreMessageRequestString = restoreMessageRequestString.slice(0, -1);

									let restoreMessageCallbacks = {
										failure: () => { alert('Ошибка отправки запроса. Повторите попытку позднее.') }
									};

									YAHOO.util.Connect.asyncRequest(
										'POST',
										'/inlinemod.php',
										restoreMessageCallbacks,
										restoreMessageRequestString
									);

	  						closePanel();
	  					},
	  					failure: function() {
	  						alert('Ошибка отправки запроса. Повторите попытку позднее.');
								closePanel();
	  					}
	  				};

					YAHOO.util.Connect.asyncRequest('POST', '/inlinemod.php', callbacks, requestString);
	  		};

	  		let buttonCancel = mkElem( 'input', {type: "button",	value: "Отмена"} );
	  		buttonCancel.onclick = function() {
	  			closePanel();
	  		};

	  		divForButtons.appendChild(buttonExecute);
	  		divForButtons.appendChild(buttonCancel);

	  		panel.appendChild(divForButtons);

		// ------------------------------------------------------------------------

		function closePanel() {
		  document.body.style.overflow = 'auto';
		  banUserPanelOverlay.style.display = 'none';
		};

		// ------------------------------------------------------------------------

		function openPanel(aThreadId, aPostId, aUserName, aUserId) {
			document.body.style.overflow = 'hidden';
		  banUserPanelOverlay.style.display = 'block';

		  userNameBold.textContent = aUserName;

		  // Сбросить состояние органов управления в првоначальное состояние
		  	banUserPeriodSelect.value = 'PERMANENT';
		  	banUserReasonsSelectFirstOpt.selected = true;
		  	banUserTextField.value = '';
		  	loaderPicture.style.display = 'none';

		  // Заполнить служебные поля при открытии панели
		  	threadIdHiddenField.value = aThreadId;
		  	postIdHiddenField.value = aPostId;
		  	userNameHiddenField.value = aUserName;
		  	userIdHiddenField.value = aUserId;
		};

		// ------------------------------------------------------------------------

    // Разместим кнопки "блокировать пользователя" во всех всплывающих меню
			let threadId = getById('inlinemodform').action.match(/threadid=(\d+)/)[1];
			for (let i = 0; i < postsArray.length; i++) {
				let bigusername = postsArray[i].querySelector('a.bigusername');
				// игнорируем трупы сообщений
					if (!bigusername) {
						continue;
					};

				let postId = postsArray[i].id.replace('post', '');
				let userName = bigusername.textContent;
				let userId = bigusername.href.split('=')[1];

				// Игнорируем представителей администрации и заблокированных
					let smallfonts = getById('postmenu_' + postId).parentNode.querySelectorAll('.smallfont');
					let [firstSmallfont, secondSmallfont] = [	smallfonts[0], smallfonts[1] ];
					let administrationOrBannedCondition = firstSmallfont.textContent == 'Заблокирован'
						|| ( (secondSmallfont) && (/^.*(модератор|администратор).*$/i.test( secondSmallfont.textContent )) );
					if (administrationOrBannedCondition) {
						continue;
					};

				let popupMenuTable = postsArray[i].nextElementSibling.querySelector('tbody');

				let banUserTd = mkElem('td');
				let banUserTdDefaultClassName = banUserTd.className = "vbmenu_option vbmenu_option_alink";
				banUserTd.onmouseover = function() {
					this.className = "vbmenu_hilite vbmenu_hilite_alink";
				};

				banUserTd.onmouseout = function() {
					this.className = banUserTdDefaultClassName;
				};

				let banUserTr = mkElem('tr');

				let banUserButton = mkElem('div', null, {color: '#921717', fontWeight: 'bold'}, 'Заблокировать пользователя');
				banUserButton.onclick = function() {
					// Скрыть popUp меню после клика по пункту
						getById('postmenu_' + postId + '_menu').style.display = 'none';

					openPanel(threadId, postId, userName, userId);
				};

				banUserTd.appendChild(banUserButton);
				banUserTr.appendChild(banUserTd);
				popupMenuTable.appendChild(banUserTr);
			};
})();
