// ==UserScript==
// @name         Переименование темы с её страницы без перезагрузки
// @version      1
// @description  Добавляет в начале темы текстовое поле, через к-рое можно изменить её название
// @downloadURL  https://github.com/Vadim-Moshev/programmersforum/raw/master/thread_renamer.user.js
// @updateURL    https://github.com/Vadim-Moshev/programmersforum/raw/master/thread_renamer.user.js
// @author       Vadim Moshev
// @include      *programmersforum.ru/showthread.php*
// @require      https://raw.githubusercontent.com/Vadim-Moshev/programmersforum/master/consts.js
// ==/UserScript==

(function() {
  'use strict';
  var RENAME_PANEL_ID = 'renamePanel';
  // Защита от повторного запуска
  if ( document.getElementById(RENAME_PANEL_ID) ) {
    return;
  }

  var STYLE_ID = $('select[name="styleid"]:has(optgroup[label="Выбор стиля"])')[0].value;
  var MAX_DEFAULT_THREADNAME_LENGTH = 180; // Как в настройках форума

  // ================================================================

  function clWrite(msg) {
    console.log(msg);
  }

  // ================================================================

  String.prototype.toRegExp = function(flags) {
    var st = this;
    st = st.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    var p = '^' + st + '\\s*';
    return new RegExp(p, flags);
  };

  // ================================================================

  function getCharactersLimit (textField) {
    // функция вернёт количество символов, к-рое ещё можно ввести в это поле
    return (textField.maxLength - textField.value.length);
  }
  // ================================================================

  function createServiceTagsList(optionsList, firstOptionCaption, id) {
    var select = document.createElement('select');
    select.size = 1;
    select.id = id;

    var firstOption = document.createElement('option');
    firstOption.value = '';
    firstOption.innerHTML = firstOptionCaption;

    select.appendChild(firstOption);
    for (var i = 0; i < optionsList.length; i++) {
      var tmpOpt = document.createElement('option');
      tmpOpt.innerHTML = optionsList[i].name;
      tmpOpt.value = optionsList[i].value;
      select.appendChild(tmpOpt);
    }

    return select;
  }

  // ================================================================

  function getValuesTotalLength(aSelectsArray) {
    // Находит суммарную длинну значений всех селектов, переданных в массиве aSelectsArray
    var sum = 0;
    for (var i = 0; i < aSelectsArray.length; i++) {
      sum += aSelectsArray[i].value.length;
    }
    return sum;
  }
  // ================================================================

  function getMaxLegthForTextField(checkbox, selectsArray) {
    var maxLength = MAX_DEFAULT_THREADNAME_LENGTH;
    var serviceTagsInUse = false;

    if (checkbox.checked) {
      maxLength -= checkbox.value.length;
      serviceTagsInUse = true;
    }

    var selectsValuesTotalLength = getValuesTotalLength(selectsArray);
    serviceTagsInUse = serviceTagsInUse || !!selectsValuesTotalLength;

    return maxLength - selectsValuesTotalLength - serviceTagsInUse;
  }

  // ================================================================

  function createRenamePanel(value) {
    // список языков программирования для соответствующей метки
    var languagesLists = [
      {name: 'Pascal', value: '[Pascal]'},
      {name: 'Turbo Pascal', value: '[Turbo Pascal]'},
      {name: 'Free Pascal', value: '[Free Pascal]'},
      {name: 'Pascal ABC', value: '[Pascal ABC]'},
      {name: 'Pascal ABC.NET', value: '[Pascal ABC.NET]'},
      {name: 'Delphi', value: '[Delphi]'},
      {name: 'C', value: '[C]'},
      {name: 'C++', value: '[C++]'},
      {name: 'C#', value: '[C#]'},
      {name: 'Java', value: '[Java]'},
      {name: 'HTML/CSS', value: '[HTML/CSS]'},
      {name: 'JavaScript', value: '[JavaScript]'},
      {name: 'PHP', value: '[PHP]'},
      {name: 'SQL', value: '[SQL]'},
      {name: 'Python', value: '[Python]'},
      {name: 'Ruby', value: '[Ruby]'},
      {name: 'Assembler', value: '[Assembler]'},
      {name: '.NET', value: '[.NET]'},
      {name: 'VB.NET', value: '[VB.NET]'},
      {name: 'VB', value: '[VB]'}
    ];

    // Обёртка для элементов панели переименования
    var renamePanelWrapper = document.createElement('div');

    // Обёртка для органов управления сервисными метками и иконки прогесса
    var serviceTagsControlsWrapper = document.createElement('div');

    // Галочка "решено"
    var troubleIsShootedCheckbox = document.createElement('input');
    troubleIsShootedCheckbox.type = 'checkbox';
    troubleIsShootedCheckbox.id = 'troubleIsShooted';
    troubleIsShootedCheckbox.value = '[РЕШЕНО]';
    var isShooted = (value.indexOf( troubleIsShootedCheckbox.value.trim() ) == 0);
    troubleIsShootedCheckbox.checked = isShooted;
    troubleIsShootedCheckbox.style.cursor = 'pointer';

    var threadTitleWithTags = value;

    var troubleIsShootedSpan = document.createElement('span');
    troubleIsShootedSpan.innerHTML = 'РЕШЕНО';
    troubleIsShootedSpan.style.fontWeight = 'bold';

    var troubleIsShootedLabel = document.createElement('label');
    troubleIsShootedLabel.appendChild(troubleIsShootedCheckbox);
    troubleIsShootedLabel.appendChild(troubleIsShootedSpan);
    troubleIsShootedLabel.style.cursor = 'pointer';

    // Выпадающий список метки для ЯП
    var programmingLanguageSelect = createServiceTagsList(
      languagesLists,
      '(Выберите ЯП)',
      'programmingLanguageSelect'
    );
    var dropListsArray = [
      programmingLanguageSelect
    ];

    // установить значнеие списка ЯП соответственно метке из названия темы
    // Сперва убрать метку "решено"
    var stripShootedRexExp = troubleIsShootedCheckbox.value.toRegExp('i');
    value = value.replace(stripShootedRexExp, '');

    // Создать поле для содержания признака решения проблемы
    var troubleIsShootedHidden = document.createElement('input');
    troubleIsShootedHidden.type = 'hidden';
    troubleIsShootedHidden.id = 'troubleIsShootedHidden';
    troubleIsShootedHidden.value = (isShooted) ? troubleIsShootedCheckbox.value : '';

    // аналогичное поле для меток из выпадающих списков
    var serviceTagsFromSelectsHidden = document.createElement('input');
    serviceTagsFromSelectsHidden.type = 'hidden';
    serviceTagsFromSelectsHidden.id = 'serviceTagsFromSelectsHidden';
    var valueForServTagsHiddenField = '';

    // Теперь определить, какая метка ЯП стоит в названии темы, и устанвоить её в спике
    // иначе - значение этого списка по дефолту
    for (var i = 0; i < languagesLists.length; i++) {
      var tmpRexExp = languagesLists[i].value.toRegExp('i');

      programmingLanguageSelect.previousValue = '';
      if ( tmpRexExp.test(value) ) {
        programmingLanguageSelect.getElementsByTagName('option')[i+1].selected = true;
        programmingLanguageSelect.previousValue = programmingLanguageSelect.value;

        value = value.replace(tmpRexExp, '');
        valueForServTagsHiddenField += languagesLists[i].value;
        break;
      }
    }

    // необходимо деактивировать галочку, если суммарная длина меток из списков с пробелом-разделителем
    // превышают значение галочки "решено". Всё это делать только тогда, когда галочка НЕ СТОИТ
    if (!isShooted) {
      var thereAreNoServiceTags = !getValuesTotalLength(dropListsArray);
      troubleIsShootedCheckbox.disabled = (MAX_DEFAULT_THREADNAME_LENGTH - threadTitleWithTags.length <
        troubleIsShootedCheckbox.value.length + thereAreNoServiceTags);
    }
    serviceTagsFromSelectsHidden.value = valueForServTagsHiddenField;

    // Иконка прогресса
    var progressIcon = document.createElement('img');
    progressIcon.id = 'progressIcon';
    progressIcon.src = Moshev_PFConsts.PATH_TO_LOADER_ICON;
    progressIcon.style.visibility = 'hidden';

    // Подцепим органы управление метками и иконку к обёртке
    serviceTagsControlsWrapper.appendChild(programmingLanguageSelect);
    serviceTagsControlsWrapper.appendChild(troubleIsShootedLabel);
    serviceTagsControlsWrapper.appendChild(progressIcon);
    serviceTagsControlsWrapper.appendChild(troubleIsShootedHidden);
    serviceTagsControlsWrapper.appendChild(serviceTagsFromSelectsHidden);

    // Текстовое поле
    var renamePanelTextField = document.createElement('input');
    renamePanelTextField.type = 'text';
    renamePanelTextField.id = 'renamePanelTextField';
    renamePanelTextField.value = value;
    renamePanelTextField.maxLength = getMaxLegthForTextField(troubleIsShootedCheckbox, dropListsArray);

    renamePanelTextField.autocomplete = 'off';
    renamePanelTextField.style.width = '96%';
    renamePanelTextField.style.marginRight = '12px';

    // Счётчик оставшихся символов
    var charactersCounter = document.createElement('span');
    charactersCounter.id = 'charactersCounter';
    charactersCounter.innerHTML = getCharactersLimit(renamePanelTextField);

    // Скрытое поле, где будем хранить последнее удачное наименовани темы
    // Необходимо для отката к этом значению, если попытались отправить пустоту
    var hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.id = 'renamePanelHidden';
    hidden.value = value;

    // Окончательное формирование панели переименования
    renamePanelWrapper.appendChild(serviceTagsControlsWrapper);
    renamePanelWrapper.appendChild(renamePanelTextField);
    renamePanelWrapper.appendChild(charactersCounter);
    renamePanelWrapper.appendChild(hidden);

    renamePanelWrapper.id = RENAME_PANEL_ID;

    return renamePanelWrapper;
  }

  // ========================================================================

  // Получить ссылку на последнее звено в хлебных крошках,
  // после сохранения его тоже будем менять
  var lastBreadCrumbsElement = $('td:has(a[href*="' + location.search + '"]) strong')[0];
  var currentThreadTitle = lastBreadCrumbsElement.textContent.trim();

  // Подготовим место для вставки панели переименования
  // Вставлять её будем после строки с панелью управления темой
  var tableWithThreadManagmentRow = document.getElementById("imod")
    .parentNode
    .parentNode;

  // Подготовим ячейку и строку для вставки панели, после чего вставим её
  var cellForRenamePanel = document.createElement('td');
  cellForRenamePanel.colSpan = 5;

  // Если тема оформления серая (STYLE_ID == 2), то перекрасим ячейку в более яркий цвет
  // иначе (STYLE_ID == 1), это - дефолтная тема, синяя, тогда цвет ячейки - по дефолту
  if (STYLE_ID == 2) {
    cellForRenamePanel.style.backgroundColor = '#D4D0C8';
  }
  cellForRenamePanel.appendChild( createRenamePanel(currentThreadTitle) );

  var rowForCell = document.createElement('tr');
  rowForCell.appendChild(cellForRenamePanel);

  tableWithThreadManagmentRow.appendChild(rowForCell);

  // Возьмём title докуменат и удалим оттуда название темы
  // получим строку вида "[ - имя раздела][ - Страница N] - Форум программистов"
  // Её будем добавлять после окочнания процедуры переименования темы к титлу страницы
  var siteNamePageNumberString = document.title.slice(currentThreadTitle.length);

  // Получим ссылку на заголовок первого сообщения темы. Если мы на первой странице - меняем его
  var firstMessageHeader = document.querySelector("#posts strong:nth-child(2)");

  // Получим идентификатор текущей темы
  var THREAD_ID = document
    .querySelectorAll("#threadsearch_menu a")[1]
    .href
    .split("=")[1];

  // ====================================================================================

  function renameThread(threadTitle, troubleIsShootedCheckbox, selectsArray) {
    var lastSuccesThreadTitleField = document.getElementById('renamePanelHidden');
    threadTitle = (threadTitle === null) ? lastSuccesThreadTitleField.value : threadTitle;

    var troubleIsShootedHidden = document.getElementById('troubleIsShootedHidden');
    var serviceTagTroubleShooted;
    if (troubleIsShootedCheckbox === null) {
      serviceTagTroubleShooted = troubleIsShootedHidden.value;
    } else {
      serviceTagTroubleShooted =
        troubleIsShootedCheckbox.checked ? troubleIsShootedCheckbox.value : '';
    }

    var serviceTagsFromSelects = '';
    var serviceTagsFromSelectsHidden = document.getElementById('serviceTagsFromSelectsHidden');
    if (selectsArray === null) {
      serviceTagsFromSelects = serviceTagsFromSelectsHidden.value;
    } else {
      for (var i = 0; i < selectsArray.length; i++) {
        serviceTagsFromSelects += selectsArray[i].value;
      }
    }

    var allServiceTagsInString = serviceTagTroubleShooted + serviceTagsFromSelects;
    if (allServiceTagsInString) {
      allServiceTagsInString += ' ';
    }
    var threadTitleWithTags = allServiceTagsInString + threadTitle;

    var lastArgument = SESSIONURL
      + "securitytoken="
      + SECURITYTOKEN
      + "&do=updatethreadtitle&t="
      + THREAD_ID
      + "&title="
      + PHP.urlencode(threadTitleWithTags);

    var ps = document.getElementById('progressIcon').style;
    ps.visibility = 'visible';

    YAHOO.util.Connect.asyncRequest(
      "POST",
      "ajax.php?do=updatethreadtitle&t=" + THREAD_ID,
      {
        success: function() {
          // В случае успешного посыла запроса изменим заголовок темы
          // на всех HTML-элементах страницы форума
          document.title = threadTitleWithTags + siteNamePageNumberString;
          lastBreadCrumbsElement.textContent = threadTitleWithTags;

          // Если мы на первой страницы темы, то поменять и заголовок первого сообщения
          if ( !/Страница \d+/.test( siteNamePageNumberString ) ) {
            firstMessageHeader.textContent = threadTitleWithTags;
          }
          document.getElementById('renamePanelTextField').blur();
          lastSuccesThreadTitleField.value = threadTitle;
          troubleIsShootedHidden.value = serviceTagTroubleShooted;
          serviceTagsFromSelectsHidden.value = serviceTagsFromSelects;

          ps.visibility = 'hidden';

        },
        failure: function() {
          // Покажем и скроем фиксированный блок с сообщением об ошибке
          // если запрос ушёл неудачно
          var errorMsg = document.createElement('div');
          errorMsg.innerHTML = 'Ошибка отправки запроса на переименование.';
          var es = errorMsg.style;
          es.position = 'fixed';
          es.left = '0';
          es.top = '0';
          es.backgroundColor = '#ff4d00';
          es.color = 'white';
          es.fontWeight = 'bold';
          es.height = '30px';
          es.lineHeight = '30px';
          es.padding = '0 15px';

          ps.visibility = 'hidden';

          var db = document.body;
          db.insertBefore(errorMsg, db.firstElementChild[0]);

          setTimeout(function () {
            db.removeChild(errorMsg);
          }, 4000);
        }
      },
      lastArgument
    );
  }
  // =========================================================
  var textField = document.getElementById('renamePanelTextField');
  var charactersCounter = document.getElementById('charactersCounter');
  var troubleIsShootedCheckbox = document.getElementById('troubleIsShooted');
  var selects = document.querySelectorAll('#renamePanel select');

  // =========================================================
  // Отправляет запрос на переименование или восстаналивает последнее имя темы,
  // если поле оставили пустым
  function tryToRenameThread(textField) {
    var threadTitle = textField.value;
    if (!threadTitle) {
      textField.value = document.getElementById('renamePanelHidden').value;
      charactersCounter.innerHTML = getCharactersLimit(textField);
    } else {
      renameThread(threadTitle, null, null);
    }
    return false;
  }
  // Обновить состояние счётчика при вводе или вставке символов
  // и установить доступность/недоступность галочки, но не деативировтаь её, если она установлена
  textField.oninput = function () {
    var charsLimit = getCharactersLimit(this);
    charactersCounter.innerHTML = charsLimit;
    if (!troubleIsShootedCheckbox.checked) {
      // Наличие меток предполагает один символ, чтобы отделить их список от названия темы
      // Если у нас метки не используются, то для их установки (в данном случае "РЕШЕНО")
      // необходимо место как под саму метку, так и для разделяющего пробела.
      // Поэтом уих отсутствие накладывает дополнительные ограничения
      // если лимит символов < длинна метки "решено" + 1 пробел-разделитель,
      // то галочку ставить нельзя, иначе - можно.
      var thereAreNoServiceTags = !getValuesTotalLength(selects);
      troubleIsShootedCheckbox.disabled =
        (charsLimit < troubleIsShootedCheckbox.value.length + thereAreNoServiceTags);
    }
  };

  // =========================================================
  // выполним пересчёт символьных характеристик поля в зависимости от того,
  // установлена ли метка "решено" или нет, и отправим запрос на переименование
  troubleIsShootedCheckbox.onchange = function () {
    textField.maxLength = getMaxLegthForTextField(this, selects);
    charactersCounter.innerHTML = getCharactersLimit(textField);
    renameThread(null, this, null);
  };

  // =========================================================
  // Просто отменить переход на другу страницу при нажатии ENTER на тектовом поле
  // с последующим запросом на переименование
  textField.onkeypress = function (event) {
    if (event.keyCode == 13) {
      tryToRenameThread(this);
      return false;
    }
  };

  // =========================================================
  // Просто отменить переход на другую страницу при нажатии ENTER на галочке
  troubleIsShootedCheckbox.onkeypress = function () {
    return false;
  };

  // =========================================================
  // При нажатии на кнопку ENTER или потере фокуса у нас дожен посылаться ajax запрос серверу
  // на переименование темы.
  textField.onchange = function () {
    tryToRenameThread(this);
  };

  // =========================================================
  // Заставим селекты при имзмении значения вносить изменения в метки
  for (var i = 0; i < selects.length; i++) {
    selects[i].onchange = function() {
      var selectedOptionLength = this.value.length;

      var troubleIsShooted = troubleIsShootedCheckbox.checked;
      var tagsFromDropListAreSelected = !!totalSelectsValuesLength;

      // К переменной charsLimit я ДОБАВЛЯЮ this.previousValue.length, чтобы отменить
      // результат воздействия предыдущей метки перед выставлением новой
      var charsLimit = getCharactersLimit(textField) + this.previousValue.length;
      if (selectedOptionLength + !troubleIsShooted > charsLimit) {
        var m = 'Вы не можете установить эту метку, так как её длина ('
          + selectedOptionLength
          + ' символов) превышает количество символов, котрое вы можете ещё ввести ('
          + charsLimit
          + ' символов).\n\n'
          + 'ОБРАТИТЕ ВНИМАНИЕ: ИСПОЛЬЗОВАНИЕ СЕРВИСНЫХ МЕТОК ПРЕДПОЛАГАЕТ НАЛИЧИЕ ПРОБЕЛА, '
          + 'ОТДЕЛЯЮЩЕГО ИХ СПИСОК ОТ НАЗВАНИЯ ТЕМЫ. ЕСЛИ НА МОМЕНТ АКТИВАЦИИ МЕТКИ У ВАС НЕ БЫЛО '
          + 'АКТИВИРОВАНО НИ ОДНОЙ МЕТКИ, ТО К КОЛИЧЕСТВУ СИМВОЛОВ ЗНАЧЕНИЯ ВЫБРАННОЙ МЕТКИ '
          + 'ИЗ ВЫПАДАЮЩЕГО СПИСКА СЛЕДУЕТ ПРИБАВЛЯТЬ ЕДИНИЦУ';
        alert(m);

        if ( this.previousValue ) { // Откат к предыдущему значению селекта
          this.value = this.previousValue;
        } else {
          this.querySelector('option').selected = true;
        }
        return;
      }
      if (!troubleIsShooted) {
        var totalSelectsValuesLength = getValuesTotalLength(selects);
        var serviceTagsInUse = !!totalSelectsValuesLength;
        var checkboxMustBeDisabled =
          (charsLimit - totalSelectsValuesLength - serviceTagsInUse) < troubleIsShootedCheckbox.value.length;
        troubleIsShootedCheckbox.disabled = checkboxMustBeDisabled;
      }
      textField.maxLength = getMaxLegthForTextField(troubleIsShootedCheckbox, selects);
      charactersCounter.innerHTML = getCharactersLimit(textField);
      this.previousValue = this.value;
      renameThread(null, null, selects);
    };
  }
})();

//*************************************************************************************
// Автор кода - Вадим Мошев. http://www.programmersforum.ru/member.php?u=117060
// Благодарю Alex11223 http://www.programmersforum.ru/member.php?u=129198
// за помощь в написании кода, консультации и идеи.
// Также за идеи хочу поблагодарить Администратора форума программистов Alar
// http://www.programmersforum.ru/member.php?u=1
