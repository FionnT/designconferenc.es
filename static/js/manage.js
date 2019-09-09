$(document).ready(function () {
  const $ = jQuery;

  // attach to each, instead of all so that we can update individually
  $('.remove').each(function () {
    $(this).on('click', function () {
      $($(this).parents()[1]).css('background-image', 'url(./img/placeholder.png)')
    })
  });

  $('.upload').each(function () {
    $(this).on('click', function () {
      $($($(this).parents()[2]).find('.fileinput')[0]).click()
    })
  });

  $('.item.big.admin').each(function () { // Input and textarea are self closing elements
    let input = $(this).find('input'); // Therefore we can't set values dynamically with pug (you could also use the data field)
    for (let item in input) { // So we set their placeholder dynamically, update their val using this script
      // skip the file input             // then we change their placeholders so users can still know when they're empty
      if (item >= 1) {
        let thing = $(input[item]);
        thing.val(thing.attr('placeholder'));
        thing.attr('placeholder', 'You emptied this!')
      }
    }
    let text = $($(this).find('textarea')[0]);
    text.val(text.attr('placeholder'));
    text.attr('placeholder', 'You emptied this!')
  });

  $('.fileinput').each(function () {
    $(this).change(function () {
      let file = this.files[0];
      let reader = new FileReader();
      let container = $($($(this).parents()[0]).find('.img')[0]);
      reader.onloadend = function () {
        container.css('background-image', 'url("' + reader.result + '")')
      };
      if (file) reader.readAsDataURL(file)
    })
  });

  function type (container) {
    const loc = document.location.href;
    if (loc.match('/approve').length > 0) return 'suggestion';
    else if (loc.match('/manage').length > 0) return 'conference'
  }

  function clear (container) {
    let params = {
      id: container.data('id').toString(),
      type: type()
    };
    let formData = new FormData();
    formData.append('data', JSON.stringify(params));
    $.ajax({
      type: 'POST',
      url: '/purge',
      contentType: false,
      data: formData,
      processData: false,
      success: function (r) {
        if (r === 'OK') {
          container.fadeOut().remove()
        }
      },
      error: function (e) {
        console.log('some error', e)
      }
    })
  }

  function approve (container) {
    const inputs = container.find('input');

    let name = inputs[1].value;
    let date = inputs[2].value;
    let city = inputs[3].value.split(', ')[0];
    let country = inputs[3].value.split(', ')[1];
    let website = inputs[4].value;
    let file = container.find('.fileinput')[0].files[0];
    let desc = container.find('textarea')[0].value;
    let formData = new FormData();
    let filename;

    if (file) filename = file.name;
    else if ($(container.find('.img')[0]).css('background-image') !== 'url("http://localhost/img/placeholder.png"\)') let filename = ($(container.find('.img')[0]).css('background-image')).split('/pending/')[1].replace('")', '');
    else filename = false;

    let conference = {
      title: name,
      date: date,
      country: country,
      city: city,
      description: desc,
      website: website,
      image: filename,
      approve: true
    };

    formData.append('data', JSON.stringify(conference));
    formData.append('file', file);

    $.ajax({
      type: 'POST',
      url: '/submit',
      contentType: false,
      data: formData,
      processData: false,
      success: function (r) {
        if (r === 'OK') {
          clear(container)
        }
      },
      error: function (e) {
        console.log('some error', e)
      }
    })
  }

  $('.reject').each(function () {
    $(this).on('click', function () {
      let container = $($(this).parents()[1]);
      clear(container)
    })
  })

  $('.approve').each(function () {
    $(this).on('click', function () {
      let container = $($(this).parents()[1]);
      approve(container)
    })
  })
});
