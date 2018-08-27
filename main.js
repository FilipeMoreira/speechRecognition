var phrases = [];

$(document).ready(function() {
	try {

		var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		var recognition = new SpeechRecognition();
		var needsTranslation = true;
		recognition.lang = 'en-US';
		recognition.maxAlternatives = 5;

		var spanId = 0;

		var continuous;

		recognition.onstart = function() { 
		  console.log('Reconhecimento de voz ativado.');
		}

		recognition.onspeechend = function() {
		  console.log('Silencio detectado. Reconhecimento de voz desativado.');
		}

		recognition.onerror = function(event) {
		  if(event.error == 'no-speech') {
		    console.log('Nenhuma fala foi detectada.');
			}
		}

		recognition.onend = function(event) {
			if (continuous) recognition.start();
		}

		recognition.onresult = function(event) {

		  // event is a SpeechRecognitionEvent object.
		  // It holds all the lines we have captured so far. 
		  // We only need the current one.
		  var current = event.resultIndex;

		  // Get a transcript of what was said.
		  var transcript = event.results[current][0].transcript;

		  // Add the current transcript to the contents of our Note.
		  if ($("#inputLang").val().split("-")[0] != $("#outputLang").val()) {
		  	translateToEnglish(transcript, $("#inputLang").val().split("-")[0], $("#outputLang").val());
		  } else {
		  	insertIntoPhraseArray(transcript);
		  }

		
		console.log(event.results);
		$('#btn-stop').css({
		  	backgroundColor: "#ddd"
		  });
		$('#btn-start').css({
		  	backgroundColor: "#ddd"
		  });
		}

		$('#btn-start').click( function(e) {
			continuous = true;

			recognition.lang = $("#inputLang").val();

		  	recognition.start();
		  	$("#control").css('opacity', 0);
		  
		});

	} catch(e) {
		console.error(e);
		$("#text").html($("#text").html() + "<br>ERRO: "+e);
	}
});

function insertIntoPhraseArray(value) {
	let phrase = {
		text: value,
		initTime: new Date().getTime(),
		time: (value.length/2) > 1 ? (value.length/2)*1000 : 1000
	}

	console.log(phrase);

	phrases.push(phrase);

	let now = new Date();
	if ((phrases[0].initTime + phrases[0].time) <= now.getTime()) {
		phrases.shift();
	}

	printPhrases("text", phrases);
}

function printPhrases(elementId, phrasesArray) {
	let phrase = "";
	phrasesArray.forEach(function(item, index) {
		phrase = generatePhrase(item.text);
	});
	console.log(phrase);
	console.log("#" + elementId)
	$("#" + elementId).html(phrase);
}

function generatePhrase(value) {
	return "<span class='phrase'>" + value + "</span>";
}

function translateToEnglish(value, sourceLang, targetLang) {

	let phrase = "";

	console.log(sourceLang);
	console.log(targetLang);

	$.post("https://translation.googleapis.com/language/translate/v2",
		{
			key: "AIzaSyASfEsrO2CELhU3QohVw6HlOJtpWGhLLNI",
			source: sourceLang,
			target: targetLang,
			q: value
		}
	).done(function(data) {
		insertIntoPhraseArray(data.data.translations[0].translatedText);
	});
}