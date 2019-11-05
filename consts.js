class Moshev_PFConsts {
  static get PATH_TO_LOADER_ICON() {
    return '/images/misc/progress.gif'
  }

  // ==========================================================================

  static renumberPosts(aStart = 1, aDeletedPostNumber) {
    console.log('библиотека подключена')

    if (typeof aStart !== 'number') {
      throw new TypeError('Аргумент функции renumberPosts должен быть числом.')
    }

    // пока костыльное быдлорешение. Оно состоит в том, что мы игнорируем удаляемый пост

    const hyperReferencesWithPostNumbers = document.querySelectorAll('a[id^="postcount"]');
    for (let i = 0, newNumber = aStart; i < hyperReferencesWithPostNumbers.length; i++) {
      const currentHyperReference = hyperReferencesWithPostNumbers[i];

      if (+currentHyperReference.getAttribute('name') === aDeletedPostNumber) {
        continue
      }

      currentHyperReference.setAttribute('name', newNumber);
      currentHyperReference.href = currentHyperReference.href.replace(/postcount=\d+/, `postcount=${newNumber}`);
      currentHyperReference.querySelector('strong').textContent = newNumber;

      newNumber++;
    }
  }

  // ==========================================================================
}
