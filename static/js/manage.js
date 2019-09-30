$(document).ready(function() {
  const $ = jQuery

  // Conference editing page

  $('.img.big').on('click', function() {
    $('.fileinput').click()
  })

  $('.fileinput').change(function() {
    let file = this.files[0]
    let reader = new FileReader()
    let container = $($($(this).parents()[0]).find('.img')[0])
    reader.onloadend = function() {
      container.css('background-image', 'url("' + reader.result + '")')
    }
    if (file) reader.readAsDataURL(file)
  })

  // Approval / Manage page
  // attach to each, instead of all so that we can update individually

  $('.reject').each(function() {
    $(this).on('click', function() {
      let id = $($(this).parents()[1]).data('id')
      document.location.href =
        './edit?id=' +
        id +
        '&return=' +
        document.location.pathname.split('/')[1]
    })
  })

  $('.approve').each(function() {
    $(this).on('click', function() {
      let id = $($(this).parents()[1]).data('id')
      document.location.href =
        './accept?id=' +
        id +
        '&return=' +
        document.location.pathname.split('/')[1]
    })
  })

  $('.remove').each(function() {
    $(this).on('click', function() {
      let id = $($(this).parents()[1]).data('id')
      document.location.href =
        './purge?id=' +
        id +
        '&return=' +
        document.location.pathname.split('/')[1]
    })
  })
})
