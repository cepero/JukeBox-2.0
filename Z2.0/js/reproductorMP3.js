var oAudio;
var bAutoplay;
var bLoop;
var bEnEjecucion;

var sRutaTrackActual;
var sRutaTrackAnterior;
var sTitulo;
var sExtension;
var nTrackActual;
var nTrackAnterior;
var nTotalTracks;
var nVolumen;
var nMaxLong;
var lt;

var ControlPlayStop;
var ControlLista;
var ControlStop;
var ControlVolumen;
var BarraProgreso;
var BPTpoCargado;
var BPTpoReproducido;
var TpoTotal;
var TpoActual;
var TituloEnReproduccion;
var Canciones;
var SelectorCancion;

var positionP;
var topProgress;
var leftProgress;
var barWidthP;
var ctWidth;


$(function (){
	//Creación Objeto Audio
	oAudio = new Audio();
	oAudio.preload = 'metadata';
	oAudio.autoplay = 'true';
	
	//Asignación componentes HTML a variables	
	ControlPlayStop = $("#ControlPlayStop");
	ControlLista = $("#ControlLista");
	ControlStop = $("#ControlStop");
	ControlVolumen = $(":range");
	BarraProgreso = $("#BarraProgreso");
	BPTpoCargado = $("#BPTpoCargado");
	BPTpoReproducido = $("#BPTpoReproducido");
	TpoTotal = $("#TpoTotal");
	TpoActual = $("#TpoActual");
	TituloEnReproduccion = $("#TituloEnReproduccion");
	Canciones = $("#Canciones");
	SelectorCancion = $(".track");
		
	//Asignación valores iniciales
	nVolumen = 1.0;   //Volumen inicial
	nMaxLong = 65;    // Maximo de caracteres para cada item de #Canciones
	nTrackActual = 0; //Cancion inicial
	sExtension = '.mp3';
	bEnEjecucion = false;
	ControlVolumen.val(nVolumen);
	oAudio.volume = nVolumen;
	bAutoplay = $("#ReproductorMP3").attr("data-autoplay");
	bLoop = $("#ReproductorMP3").attr("data-loop");
	nTotalTracks = $(".track").size();
    sRutaTrackActual = $(".track").eq(nTrackActual).attr("data-source");
	fnRenombrarCanciones();
	ControlVolumen.rangeinput();//Crea control de volumen
	//Asignación valores para la 'Barra de Progreso'
	positionP = BarraProgreso.position();
	topProgress = positionP.top - BarraProgreso.height() + 10;
	leftProgress = positionP.left;
	barWidthP = BarraProgreso.width();
	ctWidth = TpoActual.width();
	ncont = 0;	
	
			
	//Inicio de la reproducción
	if(bAutoplay==1)
	{
		nTrackAnterior = nTrackActual;
		fnAntesDeReproducir();	
	};
		
    //Asignación de funciones a los eventos del objeto Audio
	oAudio.addEventListener('timeupdate',fnAlActualizarElTiempo);
	oAudio.addEventListener('ended',fnAlTerminarUnaCancion);
	oAudio.addEventListener('progress',fnAlCargarNuevaCancion);
	oAudio.addEventListener('loadedmetadata',fnAlCargarMetadatosDeUnaCancion);
	oAudio.addEventListener('error',fnAlProducirseUnError);
	
	//Inicio del "Temporizador" que controlará las operaciones AJAX
	temporizador = setInterval('fnRefrescarLista()', 5000);

	
	/////////////////////////////
	// Eventos del REPRODUCTOR //
    /////////////////////////////
	
	//Al presionar Pausar o Reaunar
	ControlPlayStop.click(function (){
		if(bEnEjecucion)
		{
			oAudio.pause();
			bEnEjecucion = false;
			ControlPlayStop.css('background','url(img/play.png)');
		}
		else
		{	
			if(bAutoplay == 0)
				fnAntesDeReproducir();
			else
			{
				oAudio.play();
				bEnEjecucion = true;
				ControlPlayStop.css('background','url(img/pause.png)');
			}
		}
	});
	
	//Al presionar STOP
	ControlStop.click(function (){
		oAudio.pause();
		oAudio.currentTime = 0;
		bEnEjecucion = false;
		
		oAudio.removeEventListener('canplay',fnReproducir);

		BPTpoReproducido.css('width','0%');
		ControlPlayStop.css('background','url(img/play.png)');

	});

	$(":range").change(function (e,vl){
		oAudio.volume = vl;
		nVolumen = vl;
	});

	//Al seleccionar una canción de la lista
	SelectorCancion.click(function (){
		sRutaTrackActual = $(this).attr('data-source');

		var trackIndex = SelectorCancion.index(this);
		if((sRutaTrackAnterior === sRutaTrackActual && bEnEjecucion == false) || sRutaTrackAnterior !== sRutaTrackActual)
		{
			nTrackAnterior = nTrackActual;
			nTrackActual = trackIndex;

			fnAntesDeReproducir();
		}		
	});

	//Al reproducir una canción (Actualización de la Barra de Progreso)
	BarraProgreso.bind({
		'click': function(e){			
			var pos = e.pageX - leftProgress;
			var newPos = (pos * oAudio.duration) / barWidthP;
			
			//if(newPos <= lt.end(0) && bEnEjecucion)
			if(bEnEjecucion)
			oAudio.currentTime = newPos;
		},
		'mousemove': function (e){
			
			var pos = e.pageX - leftProgress;
			var nTpoAct = pos * (oAudio.duration) / barWidthP;
			var ctLeft = e.pageX - (ctWidth / 2)+'px';
			TpoActual.css({
				'display':'block',
				'top':topProgress+'px',
				'left': ctLeft
			});

			TpoActual.text(fnFormatearTiempo(nTpoAct));
		},
		'mouseout':function (){
			TpoActual.css('display','none');
		}
	});

	//Al pulsar el control que oculta o muestra la Lista de ReproducciÃ³n
	ControlLista.click(function (){
		//var imageList=[<?php
        //$dir='/projectdir/img/';
        //$files = scandir($dir);
        //foreach((array)$files as $file){
        //   if($file=='.'||$file=='..') continue;
        //   $fileList[]=$file;
        //}
        //echo "'".implode("','", $fileList)."'";
    	//?>];
		
		if(Canciones.css('display') === 'block')
		{
			Canciones.slideUp('fast');
			$(this).html('&#x25BC;');
		}
		else
		{
			Canciones.slideDown('fast');
			$(this).html('&#x25B2;');
		}
	});
});

function fnRefrescarLista() {
	$.ajax({
		url: './php/lectura_de_carpeta.php',
		type: 'get',
		dataType:"text",
		success: function (respuesta,estatus) {
			Canciones.empty();
			var nuevasCanciones = respuesta.split("%");
			for(var i=0; i<nuevasCanciones.length-1; i++){
				var nombreCancion=nuevasCanciones[i].split(".");
				Canciones.append('<article class="track" data-source="tracks/' + nombreCancion[0] + '">' +
								 '<span class="TituloCancion">' + nombreCancion[0].split(".") + '</span>' + 
					 			 '</article>');
			}
			Canciones = $("#Canciones");
			SelectorCancion = $(".track");
			nTotalTracks = $(".track").size();
		    sRutaTrackActual = $(".track").eq(nTrackActual).attr("data-source");
			fnRenombrarCanciones();
			
			//Al seleccionar una canción de la lista
			SelectorCancion.click(function (){
				sRutaTrackActual = $(this).attr('data-source');

				var trackIndex = SelectorCancion.index(this);
				if((sRutaTrackAnterior === sRutaTrackActual && bEnEjecucion == false) || sRutaTrackAnterior !== sRutaTrackActual)
				{
					nTrackAnterior = nTrackActual;
					nTrackActual = trackIndex;

					fnAntesDeReproducir();
				}		
			});
			
						
			//temporizador = clearInterval(temporizador);
		}
	});
};


function fnAlCargarNuevaCancion()
{
	lt = oAudio.buffered;
	var loadedTime = lt.end(0);
	var tl = ( (loadedTime * 100)/oAudio.duration );

	BPTpoCargado.css('width',tl+'%');
}

function fnAlCargarMetadatosDeUnaCancion()
{
	var total = fnFormatearTiempo(oAudio.duration);
	TpoTotal.text(total);
}

function fnAntesDeReproducir()
{
	if(bEnEjecucion)
	{
		oAudio.pause();
		bEnEjecucion = false;
		ControlPlayStop.css('background','url(img/play.png');
		BPTpoCargado.css('width','0%');
		BPTpoReproducido.css('width','0%');
	}

	sTitulo = SelectorCancion.eq(nTrackActual).text();
	TituloEnReproduccion.text('Loading...');

	SelectorCancion.eq(nTrackAnterior).removeClass('trackPlaying');
	SelectorCancion.eq(nTrackActual).addClass('trackPlaying');


	oAudio.src = sRutaTrackActual+sExtension;
	oAudio.load();

	oAudio.addEventListener('canplay',fnReproducir);
}

function fnReproducir()
{
	TituloEnReproduccion.text(sTitulo);
	oAudio.play();
	sRutaTrackAnterior = sRutaTrackActual;
	bEnEjecucion = true;
	ControlPlayStop.css('background','url(img/pause.png)');

}

function fnAlActualizarElTiempo()
{
	var total = oAudio.duration;
	var current = oAudio.currentTime;

	var currentPercentage = (current * 100) / total;
	BPTpoReproducido.css('width',currentPercentage+'%');

	var ctText = fnFormatearTiempo(current);
	$("#TpoReproducido").text(ctText);

	if(lt.end(0) < total && !$.browser.opera)
	{
		lt = oAudio.buffered;
		fnAlCargarNuevaCancion();
	};
}

function fnAlTerminarUnaCancion()
{

	oAudio.pause();
	bEnEjecucion = false;
	
	oAudio.removeEventListener('canplay',fnReproducir);

	BPTpoReproducido.css('width','0%');
	BPTpoCargado.css('width','0%');
	ControlPlayStop.css('background','url(img/play.png)');

	nTrackAnterior = nTrackActual;

	if(nTrackActual==(nTotalTracks-1) && bLoop == 1)
	{

		if(nTrackActual<(nTotalTracks-1))
			nTrackActual++;
		else
			nTrackActual = 0;

		sRutaTrackActual = SelectorCancion.eq(nTrackActual).attr('data-source');
		fnAntesDeReproducir();
	}
	else if(nTrackActual<(nTotalTracks-1))
	{
	
		nTrackActual++;

		sRutaTrackActual = SelectorCancion.eq(nTrackActual).attr('data-source');
		fnAntesDeReproducir();
	}
}

function fnAlProducirseUnError()
{
	if(oAudio.error.code == 4)
		errorString = 'Codec Error';
	else
	
	TituloEnReproduccion.text('Error Loading Files: '+errorString);
}

function fnRenombrarCanciones()
{
	$(".track span").each(function (){
		var st = $(this).text();

		if(st.length > nMaxLong)
		{
			st = st.substring(0,nMaxLong);
			$(this).text(st+' ...');
		}
			
	});
}

function fnFormatearTiempo(time)
{
	var s = Math.floor(time%60);
	var min = Math.floor(time/60);
	var timeText;

	if(s < 10)
		s = '0' + s;
	
	if(min < 10)
		min = '0' + min;

	timeText = min + ':' + s;

	return timeText;
}
