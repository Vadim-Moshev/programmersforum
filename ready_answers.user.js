// ==UserScript==
// @name         Готовые ответы
// @namespace    http://programmersforum.ru/
// @version      1
// @description  Позволяет вставлять готовые фрагменты ответа в сообщение
// @author       Vadim Moshev
// @downloadURL  https://github.com/Vadim-Moshev/programmersforum/raw/master/ready_answers.user.js
// @updateURL    https://github.com/Vadim-Moshev/programmersforum/raw/master/ready_answers.user.js
// @include      *programmersforum.ru/showthread.php*
// @include      *programmersforum.ru/newreply.php*
// @include      *programmersforum.ru/editpost.php*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const clWrite = msg => {console.log(msg);};
    const getById = id => document.getElementById(id);
    const mkText = txt => document.createTextNode(txt);

    // ------------------------------------------------------------------------

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

    function insertAtCaret(areaId, text) {
		  // найдено здесь http://www.programmersforum.ru/showpost.php?p=1594072&postcount=4
		  let txtarea = getById(areaId);
		  let scrollPos = txtarea.scrollTop;
		  let strPos = 0;
		  let br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
		            "ff" : (document.selection ? "ie" : false ) );
		  if (br == "ie") {
		      txtarea.focus();
		      let range = document.selection.createRange();
		      range.moveStart ('character', -txtarea.value.length);
		      strPos = range.text.length;
		  }
		  else if (br == "ff") strPos = txtarea.selectionStart;

		  let front = (txtarea.value).substring(0,strPos);
		  let back = (txtarea.value).substring(strPos,txtarea.value.length);
		  txtarea.value=front+text+back;
		  strPos = strPos + text.length;
		  if (br == "ie") {
		      txtarea.focus();
		      let range = document.selection.createRange();
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

    // ========================================================================

			const textarea = getById('vB_Editor_QR_textarea') || getById('vB_Editor_001_textarea');
			const areaId = textarea.id;

		// Создадим панель готовых ответов
			const READY_ANSWERS_PANEL_OVERLAY_ID = 'readyAnswersPanelOverlay';
			// Защита от повторного запуска
				if ( getById('readyAnswersPanelOverlay') ) {
					return;
				};

			// Оверлей
				let readyAnswersPanelOverlay = mkElem(
		    	'div',
		    	{
		    		id: READY_ANSWERS_PANEL_OVERLAY_ID
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
		   	document.body.appendChild(readyAnswersPanelOverlay);

		  // Сама панель
		  	let panel = mkElem(
		  		'div',
		  		null,
		  		{
		  			backgroundColor: "#D1D1E1",
		  			position: "absolute",
		  			left: "50%",
		  			top: "50%",
		  			transform: "translate(-50%, -50%)",
		  			padding: "10px",
		  			borderRadius: "10px",
		  			border: "2px solid #bebebe"
		  		}
		  	);
		  	readyAnswersPanelOverlay.appendChild(panel);

		  	panel.appendChild( mkText(`Выберите один или несколько ответов. Для выбора нескольких удерживайте CTRL.
		  														Текст будет вставлен по месторасположению курсора. Двойнок клик вставит значение
		  														выбранного пункта.`) );

		  	// Список названий готовых ответов
		  		let divForList = mkElem('div', null, {textAlign: 'center', paddingTop: '10px'});
		  		panel.appendChild(divForList);

		  		let readyAnswersList = mkElem('select', {	size: '5'	}, {minWidth: '300px'}	);
		  		readyAnswersList.multiple = true;
		  		// Массив объектов с названиями и значениями ответов (Здесь \n и <br> не работают)
		  			let answersTextsAndValues = [
		  				{
		  					name: 'Оформляйте код',
		  					value: '[B][COLOR="Red"]Пожалуйста, оформляйте Ваш код согласно '
		  								 + '[URL="http://www.programmersforum.ru/showpost.php?p=1497723&postcount=3"]правилам[/URL].[/COLOR][/B]'
		  				},
		  				{
		  					name: 'Добавление к последнему сообщению',
		  					value: '[B][COLOR="Red"]Чтоб добавить что-то к своему сообщению, используйте кнопку "Правка", '
		  					       + 'а не пишите несколько сообщений подряд.[/COLOR][/B]'
		  				},
		  			];
		  		// наполним список
		  			for (let i = 0; i < answersTextsAndValues.length; i++) {
		  				let opt = mkElem('option', {value: answersTextsAndValues[i].value}, null, answersTextsAndValues[i].name);
		  				readyAnswersList.appendChild(opt)
		  			};

		  		// Двойной клик на выбранной опции должен приводить к тому, что её значение вставляется
		  			readyAnswersList.ondblclick = function() {
		  				insertAtCaret(areaId, readyAnswersList.value);
		  				closePanel();
		  			};

		  		divForList.appendChild(readyAnswersList);

		  	// Отчеркнуть линией
		  		panel.appendChild( mkElem('hr') );

		  	// Кнопки "Вставить" и "отмена"
		  		let divForButtons = mkElem('div', null, {textAlign: "center"});

		  		let buttonInsert = mkElem(
		  			'input',
		  			{
		  				type: "button",
		  				value: "Вставить"
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

		  		divForButtons.appendChild(buttonInsert);
		  		divForButtons.appendChild(buttonCancel);

		  		panel.appendChild(divForButtons);

		  		// заставим кнопку "отмена" закрывать панель
		  			buttonCancel.onclick = function() {
		  				closePanel()
		  			};

		  		buttonInsert.onclick = function() {
						let result = '';
						let listOptions = readyAnswersList.children;
		    		for (let i = 0; i < listOptions.length; i++) {
		    			if (listOptions[i].selected) {
		    				result += listOptions[i].value + '\n';
		    			};
		    		};

		    		insertAtCaret(areaId, result);

		  			closePanel();
		  		};


    // ------------------------------------------------------------------------

    function openPanel() {
    	readyAnswersPanelOverlay.style.display = 'block';
		  document.body.style.overflow = 'hidden';    	

    	// Снять выделение со всего
    		let listOptions = readyAnswersList.children;
    		for (let i = 0; i < listOptions.length; i++) {
    			listOptions[i].selected = false;
    		};
    };

    function closePanel() {
    	readyAnswersPanelOverlay.style.display = 'none';
		  document.body.style.overflow = 'auto';

    };

    // ------------------------------------------------------------------------

    // Создание и размещение кнопки вызова панели готовых ответов
    	if (textarea) {
    		let button = mkElem(
    			'div',
    			null,
    			{
    				color: '#22229C',
    				borderBottom: '1px dashed #22229C',
    				cursor: 'pointer',
    				display: 'inline-block',
    				marginBottom: '5px'
    			},
    			'Готовые ответы'
    		);

    		textarea.parentNode.insertBefore(button, textarea);

    		button.onclick = function () {
    			openPanel();
    		};
    	};

})();
