$(document).ready(function () {
  $('.menu').each(function (index) {
    var _this = $(this)
    _this.on('click', function () {
      var drop = _this.find('.dropdown')
      if (drop.hasClass('active')) {
        _this.css('border-radius', '21px')
        drop.removeClass('active').addClass('inactive')
      } else {
        _this.css('border-radius', '19px 19px 0 0')
        drop.removeClass('inactive').addClass('active')
      }
    }).on('mouseleave', function () {
      _this.css('border-radius', '21px')
      _this.find('.dropdown').removeClass('active').addClass('inactive')
    })
  })

  var match = false
  document.addEventListener('keydown', (event) => { // event.key is better than jQuery's e.which
    var country = $('#country ul')
    var month = $('#month ul')

    function search (which) {
      var i = which.find('li')
      for (t = 0; t < i.length; t++) {
        if ($(i[t]).text().toString().substring(0, 1).toLowerCase() === event.key) {
          if (!match) {
            match = i[t] // for the pun
            break
          } else continue
        }
      }
    }

    if (country.hasClass('active')) search(country)
    else if (month.hasClass('active')) search(month)
  })
  document.addEventListener('keyup', (event) => {
    if (match) { $(match).parents()[0].scrollTo(0, match.offsetTop - 25) }
    match = false
  })

  $('.dropdown li').each(function () {
    var _this = $(this)
    var parent = _this.parents()[1]
    _this.on('click', function () { $($(parent).find('.sel')).text(_this.text()).css('color', 'rgb(0, 0, 0)') })
  })

  $('#profile img').on('click', function () {
    $('#profile').toggleClass('open')
  })
})
