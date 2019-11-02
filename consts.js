class UUU {
  static get PATH_TO_LOADER_ICON() {
    return '/images/misc/progress.gif'
  }

  // ==========================================================================

  static renumberPosts(aStart = 1) {
    if (typeof aStart !== 'number') {
      throw new TypeError('Аргумент функции renumberPosts должен быть числом.')
    }

    const hyperReferencesWithPostNumbers = document.querySelectorAll('a[id^="postcount"]');
    for (let i = 0, newNumber = aStart; i < hyperReferencesWithPostNumbers.length; i++, newNumber++) {
      const currentHyperReference = hyperReferencesWithPostNumbers[i];
      currentHyperReference.setAttribute('name', newNumber);
      currentHyperReference.href = currentHyperReference.href.replace(/postcount=\d+/, `postcount=${newNumber}`)
      currentHyperReference.querySelector('strong').textContent = newNumber;
    }
  }
}

class Moshev_PFConsts {
  static get PATH_TO_LOADER_ICON() {
    return '/images/misc/progress.gif'
  }

  static get FT() {
    return 42
  }

  // ==========================================================================

  static renumberPosts(aStart = 1) {
    if (typeof aStart !== 'number') {
      throw new TypeError('Аргумент функции renumberPosts должен быть числом.')
    }

    const hyperReferencesWithPostNumbers = document.querySelectorAll('a[id^="postcount"]');
    for (let i = 0, newNumber = aStart; i < hyperReferencesWithPostNumbers.length; i++, newNumber++) {
      const currentHyperReference = hyperReferencesWithPostNumbers[i];
      currentHyperReference.setAttribute('name', newNumber);
      currentHyperReference.href = currentHyperReference.href.replace(/postcount=\d+/, `postcount=${newNumber}`)
      currentHyperReference.querySelector('strong').textContent = newNumber;
    }
  }
}
