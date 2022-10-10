$(function(){
  
  $('.burger').on('click', function(){
    $('.header__top').toggleClass('header__top--active')
  });


  const burger = document.querySelector('.burger'); 
  
  burger.addEventListener('click', () => {
    burger.classList.toggle('burger--active'); 
  });


  $(".menu").on("click","a", function (event) {
		
		event.preventDefault();

		
		var id  = $(this).attr('href'),

	
			top = $(id).offset().top;
		
		
		$('body,html').animate({scrollTop: top}, 1500);
	});



  var mixer = mixitup('.portfolio__images');

});