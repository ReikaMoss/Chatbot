var controller;
var altoScreen;
var anchoScreen;
var hDetalle;
var availH;
var nextH;

$(document).ready(function() {
	// window.resize
	_dHeight();
	_Acomodar();

	// Empieza carousel
	$('#homeIndividuos').on('slide.bs.carousel', function (e) {
      console.log("Sliding instruction Received!");       
    });
    // Termina carousel
    $('#homeIndividuos').on('slid.bs.carousel', function () {
      console.log("Sliding over!");      
    });   
});

$(window).resize(function() {
	// Ajusto altura de elementos segun pantalla	
	_dHeight();
	_Acomodar();
});

// fin document.ready
$(window).load(function(){
	// preloader
	$('#preloader').delay(200).fadeOut('slow',function(){		
		$(this).delay(100).remove();
	});
});
// fin window.load

// Acomodo según tamaño de la pantalla
function _Acomodar(){
	var browserName=navigator.appName;
	if (browserName=="Microsoft Internet Explorer"){
		if(document.documentElement.clientWidth == 0){
			altoScreen = document.body.clientHeight;
			anchoScreen = document.body.clientWidth;
		}else{
			altoScreen = document.documentElement.clientHeight;
			anchoScreen = document.documentElement.clientWidth;
		}
	} else{
		anchoScreen = window.innerWidth;
		altoScreen = window.innerHeight;
	}	

	$('.toolresponsive>span.res').html('<div class="nro">'+anchoScreen+'</div>'+'<div class="nro">'+altoScreen+'</div>');

	// var hDetalle = $('.item').height();
	// $('.item a img').css('height',hDetalle);

	// console.log(hDetalle);	
}

function _dHeight (){
	var availH = screen.availHeight;
	// $('.seccamarillo').css('height',availH);
}

// Normalize Carousel Heights - pass in Bootstrap Carousel items.
// function carouselNormalization() {
//     var items = jQuery('#homeIndividuos .item'), //grab all slides
//     heights = [], //create empty array to store height values
//     shortest; //create variable to make note of the shortest slide

//     if (items.length) {
// 	    function normalizeHeights() {
// 		    items.each(function() { //add heights to array
// 		    heights.push(jQuery(this).height());
// 	    });
// 	    shortest = Math.min.apply(null, heights); //cache largest value
// 	    items.each(function() {
// 		    jQuery('.carousel-inner').css('height',shortest + 'px').css('overflow','hidden');
// 		    });
// 	    };
// 	    normalizeHeights();

// 	    jQuery(window).on('resize orientationchange', function () {
// 		    shortest = 0, heights.length = 0; //reset vars
// 		    items.each(function() {
// 		    	jQuery('.carousel-inner').css('height','0'); //reset min-height
// 		    });
// 		    normalizeHeights(); //run it again
// 	    });
//     }
// }
// carouselNormalization();



