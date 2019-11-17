class Moshev_PFConsts {
  // Это просто URL картинки-лоадера
  static get PATH_TO_LOADER_ICON() {
    return '/images/misc/progress.gif'
  }

  // ==========================================================================

  // Функция перенумеровывает все посты на странице по порядку, начиная с номера,
  // переданного в аргументе
  static renumberPosts(aStart = 1) {
    if (typeof aStart !== 'number') {
      throw new TypeError('Аргумент функции renumberPosts должен быть числом.')
    }

    const hyperReferencesWithPostNumbers = document.querySelectorAll('a[id^="postcount"]');
    for (let i = 0, newNumber = aStart; i < hyperReferencesWithPostNumbers.length; i++) {
      const currentHyperReference = hyperReferencesWithPostNumbers[i];

      currentHyperReference.setAttribute('name', newNumber);
      currentHyperReference.href = currentHyperReference.href.replace(/postcount=\d+/, `postcount=${newNumber}`);
      currentHyperReference.querySelector('strong').textContent = newNumber;

      newNumber++;
    }
  }

  // ==========================================================================

  // Для сообщения, имя автора которого передано в aUserName, устанавливаются
  // признаки блокировки пользователя в соответствии с настройками форума:
  // — удаляется аватар;
  // — устанавливается статус «Заблокирован», все остальные статусы удаляются;
  // — удаляется подпись.
  static setSuspendedStatusToUsername(aUserName) {
    const
      STATUS                          = 'Заблокирован',
      SMALLFONT_CLASS_SEARCH_SELECTOR = 'table[id^="post"] tr:nth-child(2) td:first-child div.smallfont',
      SINGATURE_BLOCK_SEARCH_SELECTOR = 'td[id^="td_post_"] div.signature';


    if (typeof aUserName !== 'string') {
      throw new TypeError('Аргумент функции setSuspendedStatusByUsername должен быть строкой.')
    }

    if (posts === null) {
      throw new TypeError('Контейнер с сообщениями не обнаружен на текущей странице.')
    }

    let userPosts = posts.querySelectorAll('div[align="center"]');
    let currentUserSmallfontElements;

    userPosts = Array.prototype.slice.call(userPosts);
    userPosts
      .filter(aCurrentPost => {
        let userNameContainer = aCurrentPost.querySelector('.bigusername');
        return userNameContainer !== null && userNameContainer.textContent === aUserName
      }).forEach(aCurrentPost => {
          currentUserSmallfontElements = aCurrentPost.querySelectorAll(SMALLFONT_CLASS_SEARCH_SELECTOR);
          if (currentUserSmallfontElements.length === 1) {
            let theOnlySmallfont = currentUserSmallfontElements[0];

            let suspendedCaption = document.createElement('div');
            suspendedCaption.classList.add('smallfont');
            suspendedCaption.textContent = STATUS;

            theOnlySmallfont.parentNode.insertBefore(suspendedCaption, theOnlySmallfont);
          } else {
            currentUserSmallfontElements[0].textContent = STATUS;
            for (let i = currentUserSmallfontElements.length - 2; i > 0 ; i--) {
              currentUserSmallfontElements[i].remove()
            }
          }

          // удалить подпись
          let signature = aCurrentPost.querySelector(SINGATURE_BLOCK_SEARCH_SELECTOR);
          if (signature !== null) {
            signature.remove()
          }
      });
  }
}
