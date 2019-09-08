$(document).ready(function () {


/////////////////////////////////
//          Calender           //
/////////////////////////////////

  var start_date = {}
  var end_date = {}
  var current_year
  var current_month
  var empty_days

  var monthfield = $('p.date')
  var displayfield = $('p.selected')

  var now = new Date()
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  function highlight(first_date, last_date){

    // More = Highlight right half only
    // Less = Highlight left half only
    if(first_date>last_date) {
      for (i = last_date + 1; i <= first_date - 1; i++) $($('.date')[i]).addClass('middle')
      $($('.date')[first_date]).addClass('less')
      $($('.date')[last_date]).addClass('more')
    }
    else{
      for (i = first_date + 1; i <= last_date - 1; i++) $($('.date')[i]).addClass('middle')
      $($('.date')[last_date]).addClass('less')
      $($('.date')[first_date]).addClass('more')
    }
  }

  function crossmonth (){
    if(end_date.month>start_date.month && end_date.year === start_date.year){ // Increasing months, but not years
      highlight(0, end_date.index)
      displayfield.text(start_date.date + ' ' + months[start_date.month].substring(0,3) + ' - ' + end_date.date + ' ' + months[end_date.month].substring(0,3) + ' ' + end_date.year)
    }else if(end_date.year>start_date.year){ // Increasing the years
      highlight(0, end_date.index)
      displayfield.text(start_date.date + ' ' + months[start_date.month].substring(0,3) + ' ' + start_date.year + ' - ' + end_date.date + ' ' + months[end_date.month].substring(0,3) + ', ' + current_year)
    }else if(end_date.month<start_date.month && end_date.year === start_date.year){ // Decreasing months, but not years
      highlight(end_date.index, 99)
      displayfield.text(end_date.date + ' ' + months[end_date.month].substring(0,3) + ' - ' + start_date.date + ' ' + months[start_date.month].substring(0,3) + ' ' + start_date.year)
    }
    else if(end_date.year < start_date.year) { // Decreasing the year
      highlight(end_date.index, 99)
      displayfield.text(end_date.date + ' ' + months[end_date.month].substring(0,3) + ' ' + end_date.year + ' - ' + start_date.date + ' ' + months[start_date.month].substring(0,3) + ', ' + start_date.year)
    }
    else if(start_date.index>end_date.index && end_date.year === start_date.year) { // Same month, user picked the end date first
      highlight(end_date.index, start_date.index)
      displayfield.text(end_date.date + ' - ' + start_date.date + ' ' + months[end_date.month].substring(0,3) + ' ' + end_date.year)
    }else {
      displayfield.text(start_date.date + ' - ' + end_date.date + ' ' + months[start_date.month] + ', ' + current_year)
      highlight(start_date.index, end_date.index) // Same month, user picked the start date first
    }
  }

  function month_memory (){
    if(start_date.month === current_month && start_date.year === current_year) {
      if(start_date.month>end_date.month){
        if(start_date.year<end_date.year) highlight(start_date.index, 99)
        else highlight(0, start_date.index)
      }else if(start_date.month<end_date.month){
        if(start_date.year>end_date.year) highlight(0, start_date.index)
        else highlight(start_date.index, 99)
      }
      $($('.date')[start_date.index]).addClass('active')
    }else if(end_date.month === current_month && end_date.year === current_year){
      if(start_date.month>end_date.month){
        if(start_date.year<end_date.year) highlight(0, end_date.index)
        else highlight(end_date.index, 99)
      }else if(start_date.month<end_date.month){
        if(start_date.year>end_date.year) highlight(end_date.index, 99)
        else highlight(0, end_date.index)
      }
      $($('.date')[end_date.index]).addClass('active')
    }
  }

  function time(month, year) {
    var m = new Date(year, month, 0)
    return [m.getDate(), m.getDay()]
    // returns array containing:
    // [Days in x month, Day of the week x month starts on]
  }

  function calendar (month, year) {
    var container = $('.numbers')
    var days = time(month + 1, year)[0] // How many days there are; count from months from 1
    var date = 0

    empty_days = time(month, year)[1] // What day it starts on, how many empty items to insert; count months from 0

    monthfield.text(months[month] + ' ' + year).data('date', (month + ',' + year).toString()) // set month and year text descriptor, then store current month and year in data

    current_month = Number(monthfield.data('date').split(',')[0])
    current_year = Number(monthfield.data('date').split(',')[1])

    for (i = 0; i < empty_days; i++) { $($('.hidden')[0]).clone().detach().prependTo(container) } // Insert empty items to bump to correct starting date
    for (i = 0; i < days; i++) { $($('.hidden')[0]).clone().detach().removeClass('hidden').appendTo(container) } // Insert items that contain the dates

    $('.numbers li.date').each(function (index) {
      var _this = $(this)
      if (!(_this.hasClass('hidden'))) { // Don't add dates to bump items
        if (date < days) {
          date += 1
          $(_this.find('p')).text(date)
        }
      }
    })
    month_memory()
  }

  calendar(now.getMonth(), now.getFullYear()) // Default to this month


  $('.numbers').on('click', '.date', function (event) { // http://learn.jquery.com/events/event-delegation/

    $('#calendar').css('border', '1px solid #DEE0E4') // reset on clicking, in case: changed to alert missing

    event.preventDefault()
    var _this = $(this)

    function select(which_date){
      if(which_date.index != start_date.index){
        _this.addClass('active')
        which_date.index = (_this.index() + 1)
        which_date.date = (_this.index() + 1) - empty_days
        which_date.month = current_month
        which_date.year = current_year
      }
    }
    if (start_date.hasOwnProperty('index') && end_date.hasOwnProperty('index') || !start_date.hasOwnProperty('index')) {
      start_date = {}
      end_date = {}
      reset(false)
      select(start_date)
      displayfield.text(start_date.date + ' ' + months[start_date.month])
    }else if(start_date.hasOwnProperty('index')) {
      select(end_date)
      crossmonth()
    }
  })



  function reset (full) {
    if(full) $('.numbers').empty()
    date = 1
    $('.date').each(function () {
      $(this).removeClass('active middle more less') // you can pass multiple classes to the selector
    })
  }

  // reset on clicking, in case changed to alert it was missing
  $('input').each(function () { $(this).on('click', function () { $(this).css('border', '1px solid #DEE0E4') }) })
  $('#country').on('click', function () { $(this).css('border', '1px solid #DEE0E4') })

  $('.controls .left').on('click', function () {
    reset(true)
    if (current_month === 0) calendar(11, current_year - 1) // i.e. Change December to January
    else calendar(current_month - 1, current_year)
  })

  $('.controls .right').on('click', function () {
    reset(true)
    if (current_month === 11) calendar(0, current_year + 1) // i.e. Change January to December
    else calendar(current_month + 1, current_year)
  })


  // Fake input - file uploader
  var realInput = $('.fileinput')
  var filename
  $('.file').on('click', function () { realInput.click() })

  realInput.on('change', function () {
    filename = realInput.val().split(/\\|\//).pop()
    $('.fileinfo').text(filename)
  })



/////////////////////////////////
//    Form Posting handler     //
/////////////////////////////////


  $('.rectangle').on('click', function () {
    var name = $($('input')[0]).val()
    var website = $($('input')[1]).val()

    var country = $('#country p').text().split('▾')[0]
    var city = $($('input')[2]).val()
    var desc = $('textarea').val()
    var file = $('.fileinput')[0].files[0]
    var missing = []
    var text_date = displayfield.text()

    function notify () {
      if (name === '') missing.push('name')
      if (city === '') missing.push('city')
      if (country === 'Select a country...') missing.push('country')
      if (!start_date.hasOwnProperty('index')) missing.push('date')
      if (!end_date.hasOwnProperty('index')) end_date = start_date // assume it's a one day conference

      function red (item) { item.css('border', '1px solid #e05f5fbd') }

      if (missing.length === 0) {
        return true
      } else {
        // we're using a loop so that we only bump to the top once after checking all fields
        for (item in missing) {
          if (missing[item] === 'name') red($($('input')[0]))
          else if (missing[item] === 'city') red($($('input')[2]))
          else if (missing[item] === 'country') red($('#country'))
          else if (missing[item] === 'date') red($('#calendar'))
        }
      }
      window.scrollTo(0, 0)
      return false
    }

    if (notify()) {
      var formData = new FormData()
      var conference = {
        title: name,
        text_date: text_date,
        start_date: start_date,
        end_date: end_date,
        country: country,
        city: city,
        description: desc,
        website: website,
        image: filename
      }

      formData.append('data', JSON.stringify(conference))
      formData.append('file', file)
      $.ajax({
        type: 'POST',
        url: '/submit',
        contentType: false,
        data: formData,
        processData: false,
        success: function (r) {
          if (r === 'OK') {
            document.location.href = '/thanks'
          }
        },
        error: function (e) {
          console.log('some error', e)
        }
      })
    }
  })

})
