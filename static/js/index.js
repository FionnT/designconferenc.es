$(document).ready(function() {
  const $ = jQuery
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]
  let url = document.location.href

  if (window.innerWidth >= 960) {
    $('.toggle').each(function(index) {
      let _this = $(this)
      _this.on('click', function(index) {
        let container = $(_this.parents()[0])
        let text = $(_this.find('p')[0])
        if (container.hasClass('small')) {
          container
            .removeClass('small')
            .addClass('big')
            .css('left', '2% !important') // Packery applies 4%, which is too much
          text.text('- See Less')
          $('#conferences').packery({percentPosition: true})
        } else {
          container
            .removeClass('big')
            .addClass('small')
            .css('left', 'auto')
          text.text('+ See More')
          $('#conferences').packery({percentPosition: true})
        }
      })
    })
  } else if (window.innerWidth < 960) {
    $('.toggle').each(function(index) {
      let _this = $(this)
      $(_this.children()[0]).css('display', 'none') // Hide expand button
      const container = $(_this.parents()[0])
      container.removeClass('small').addClass('big')
    })
  }

  // Search

  $('#search').on('click', function() {
    let now = new Date()
    let title = $($('input')[0]).val()
    let country = $('#country p')
      .text()
      .split('▾')[0]
    let month = $('#month p')
      .text()
      .split('▾')[0]
      .substring(0, 3)
    let search = '/search?'

    search += 'country=' + country + '&' // If user doesn't input, it will just be Worldwide
    if (title === '') search += 'title=Any&'
    else search += 'title=' + title + '&'
    if (month === 'Thi') search += 'month=' + months[now.getMonth()]
    else search += 'month=' + month

    document.location.href = search
  })

  document
    .getElementsByTagName('input')[0]
    .addEventListener('keydown', function(event) {
      if (event.key === 'Enter') $('#search').click()
    })

  if (url.includes('search')) {
    let country = url
      .split('country')
      .pop()
      .split('&')[0]
      .split('=')[1]
      .replace(/%20/g, ' ')
    let title = url
      .split('title')
      .pop()
      .split('&')[0]
      .split('=')[1]
    let month = url
      .split('month')
      .pop()
      .split('&')[0]
      .split('=')[1]
    let country_sel = $('#country .sel')

    $('#month ul li').each(function() {
      let _this = $(this)
      if (_this.text().includes(month)) _this.click().click() // click clack
    })

    if (country !== 'Any') country_sel.text(country).css('color', 'black')
    else country_sel.text('Worldwide')

    if (title !== 'Any') $($('input')[0]).val(title.replace(/%20/g, ' '))
  }
})
