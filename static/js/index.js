$(document).ready(function () {
  $('.toggle').each(function (index) {
    var $this = $(this)
    $this.on('click', function (index) {
      var container = $($this.parents()[0])
      var text = $($this.find('p'))
      if (container.hasClass('small')) {
        container.removeClass('small').addClass('big').css('left', '2% !important') // Packery applies 4%, which is too much
        text.text('- See Less')
        $('#conferences').packery({ percentPosition: true })
      } else {
        container.removeClass('big').addClass('small').css('left', 'auto')
        text.text('+ See More')
        $('#conferences').packery({ percentPosition: true })
      }
    })
  })

  // Search adapations

  $('#search').on('click', function () {
    var now = new Date()
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    var title = $($('input')[0]).val()
    var country = $('#country p').text().split('▾')[0]
    var month = $('#month p').text().split('▾')[0].substring(0, 3)
    var search = '/search?'

    search += 'country=' + country + '&' // If user doesn't input, it will just be Worldwide
    if (title === '') search += 'title=Any&'
    else search += 'title=' + title + '&'
    if (month === 'Thi') search += 'month=' + months[now.getMonth()]
    else search += 'month=' + month

    document.location.href = search
  })
  document.getElementsByTagName('input')[0].addEventListener('keydown', function (event) {
    if (event.key === 'Enter') $('#search').click()
  })

  var url = document.location.href
  if (url.includes('search')) {
    var country = url.split('country').pop().split('&')[0].split('=')[1].replace(/%20/g, ' ')
    var title = url.split('title').pop().split('&')[0].split('=')[1]
    var month = url.split('month').pop().split('&')[0].split('=')[1]

    $('#month ul li').each(function () {
      var $this = $(this)
      if ($this.text().includes(month)) $this.click().click() // clickity clack
    })

    if (country != 'Any') {
      $('#country .sel').text(country)
      $('#country .sel').css('color', 'black')
    } else $('#country .sel').text('Worldwide')

    if (title != 'Any') $($('input')[0]).val(title.replace(/%20/g, ' '))
  }
})
