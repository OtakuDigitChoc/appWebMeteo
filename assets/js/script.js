$(function(){

	/* Configuration */

	var DEG = 'c';			// c pour celsius, f pour fahrenheit

	var weatherDiv = $('#weather'),
		scroller = $('#scroller'),
		location = $('p.location');

	// verifier si le navigateur supporte la geolocalisation
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
	}
	else{
		showError("Votre Navigateur ne prend pas en charge la geolosation");
	}


	function locationSuccess(position) {

		try{

			// initialisation du cache
			var cache = localStorage.weatherCache && JSON.parse(localStorage.weatherCache);

			var d = new Date();

			// si le cache n'a pas dépassé les 30 minutes
			if(cache && cache.timestamp && cache.timestamp > d.getTime() - 30*60*1000){

                //alors on recupere les données du cache
				var city = cache.data.name;
				var country = cache.data.sys.country;

				$.each(cache.data, function(){

					addWeather(
						cache.data.weather[0].icon,
                        d.toLocaleDateString()+' - '+d.toLocaleTimeString()+'.',
						cache.data.weather[0].description + ' <b>' + convertTemperature(cache.data.main.temp_min) + '°' + DEG +
												' / ' + convertTemperature(cache.data.main.temp_max) + '°' + DEG +'</b>'
					);

				});

				location.html(city+', <b>'+country+'</b>');

				weatherDiv.addClass('loaded');

				showSlide(0);

			}
            //sinon si le cache n'existe pas ou il a depassé les 30 minutes
			else{
                //alors on recupere les données de l'api
				var weatherAPI = "http://api.openweathermap.org/data/2.5/weather?lat="+position.coords.latitude+"&lon="+position.coords.longitude+"&appid=2de143494c0b295cca9337e1e96b00e0"
  

				$.getJSON(weatherAPI, function(response){

					// permet de stocker les donnée recus dans le cache
					localStorage.weatherCache = JSON.stringify({
						timestamp:(new Date()).getTime(),
						data: response
					});

					locationSuccess(position);
				});
			}

		}
		catch(e){
			showError("Impossible d'obtenir des informations de votre lieu");
			window.console && console.error(e);
		}
	}

	function addWeather(icon, day, condition){

		var markup = '<li>'+
			'<img src="assets/img/icons/'+ icon +'.png" />'+
			' <p class="day">'+ day +'</p> <p class="cond">'+ condition +
			'</p></li>';

		scroller.append(markup);
	}

	/* permet de gere le slide

	var currentSlide = 0;
	weatherDiv.find('a.previous').click(function(e){
		e.preventDefault();
		showSlide(currentSlide-1);
	});

	weatherDiv.find('a.next').click(function(e){
		e.preventDefault();
		showSlide(currentSlide+1);
	});


	$(document).keydown(function(e){
		switch(e.keyCode){
			case 37: 
				weatherDiv.find('a.previous').click();
			break;
			case 39:
				weatherDiv.find('a.next').click();
			break;
		}
	});*/

	function showSlide(i){
		var items = scroller.find('li');

		if (i >= items.length || i < 0 || scroller.is(':animated')){
			return false;
		}

		weatherDiv.removeClass('first last');

		if(i == 0){
			weatherDiv.addClass('first');
		}
		else if (i == items.length-1){
			weatherDiv.addClass('last');
		}

		scroller.animate({left:(-i*100)+'%'}, function(){
			currentSlide = i;
		});
	}

	/* gestion des erreurs*/

	function locationError(error){
		switch(error.code) {
			case error.TIMEOUT:
				showError("Temps d'attente trop long, veuillez réesayer plus tard");
				break;
			case error.POSITION_UNAVAILABLE:
				showError('Impossible de trouver votre localisation');
				break;
			case error.PERMISSION_DENIED:
				showError('Veuillez activer la localisation');
				break;
			case error.UNKNOWN_ERROR:
				showError('erreur inconnue');
				break;
		}

	}

	function convertTemperature(kelvin){
		// permet de convertir la temperature
		return Math.round(DEG == 'c' ? (kelvin - 273.15) : (kelvin*9/5 - 459.67));
	}

	function showError(msg){
		weatherDiv.addClass('error').html(msg);
	}

});
