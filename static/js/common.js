$(document).ready(function() {
  const $ = jQuery
  let match = false

  $('.menu').each(function(index) {
    let _this = $(this)
    _this
      .on('click', function() {
        let drop = _this.find('.dropdown')
        if (drop.hasClass('active')) {
          _this.css('border-radius', '21px')
          drop.removeClass('active').addClass('inactive')
        } else {
          _this.css('border-radius', '19px 19px 0 0')
          drop.removeClass('inactive').addClass('active')
        }
      })
      .on('mouseleave', function() {
        _this.css('border-radius', '21px')
        _this
          .find('.dropdown')
          .removeClass('active')
          .addClass('inactive')
      })
  })

  document.addEventListener('keydown', (event) => {
    // event.key is better than jQuery's e.which
    let country = $('#country ul')
    let month = $('#month ul')

    function search(which) {
      let i = which.find('li')
      for (let t = 0; t < i.length; t++) {
        if (
          $(i[t])
            .text()
            .toString()
            .substring(0, 1)
            .toLowerCase() === event.key
        ) {
          if (!match) {
            match = i[t] // for the pun
            break
          }
        }
      }
    }

    if (country.hasClass('active')) search(country)
    else if (month.hasClass('active')) search(month)
  })

  document.addEventListener('keyup', (event) => {
    if (match) {
      $(match)
        .parents()[0]
        .scrollTo(0, match.offsetTop - 25)
    }
    match = false
  })

  $('.dropdown li').each(function() {
    let _this = $(this)
    let parent = _this.parents()[1]
    _this.on('click', function() {
      $($(parent).find('.sel'))
        .text(_this.text())
        .css('color', 'rgb(0, 0, 0)')
    })
  })

  $('#profile img').on('click', function() {
    $('#profile').toggleClass('open')
  })
})
