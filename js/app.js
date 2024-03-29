window.jsPDF = window.jspdf.jsPDF;

console.log('Order Creator v1.22');

const MAIN_FORM = $('form');
const BUTTON_TESTOWY = $('#testbutton');
const ZAMAWIAJACY_INPUT = $('#zamawiajacy');
const ZAPLACONO_RADIO_BUTTONY = $('input[name="zapytanie-zaplacono"]');
const DATEPICKER_ZAPLACONO = $('input[name="zaplacono-data"]');
const DATEPICKER_DATA_ZAMOWIENIA = $('input[name="data-zamowienia"]');
const DATEPICKER_WYSLAC_DO_DNIA = $('input[name="data-wyslac-do-dnia"]');
const KONTENER_LISTA_PRODUKTOW = $('div.lista-produktow');
const KONTENER_NUMER_ZAMOWIENIA = $('div.kontener-numer-zamowienia');
const NUMER_ZAMOWIENIA = $('input[name="numer-zamowienia"]');
const KWOTA_ZAMOWIENIA = $('input[name="kwota-zamowienia"]');
const ZRODLO_RADIO_BUTTONY = $('input[name="zrodlo-zamowienia"]');
const ZRODLO_INNE_INPUT = $('input[name="zrodlo-inne-input"]');
const WALUTA_RADIO_BUTTONY = $('input[name="waluta"]');
const WALUTA_INNA_INPUT = $('input[name="waluta-inna-input"]');
const KRAJ_RADIO_BUTTONY = $('input[name="kraj"]');
const KRAJ_INNY_INPUT = $('input[name="kraj-inny-input"]');
const EXPORT_RADIO_TAK = $('#zapytanie-export-tak');
const EXPORT_RADIO_NIE = $('#zapytanie-export-nie');
const EXPORT_KONTENER = $('div.checkbox.export');

// DANE Z PAMIECI PODRECZNEJ (do kalendarzy)
let ostatniaDataZamowienia = localStorage['ostatniaDataZamowienia'] || null;
let ostatniaDataZaplacono = localStorage['ostatniaDataZaplacono'] || null;
let ostatniaDataWyslac = localStorage['ostatniaDataWyslac'] || null;

console.log('ostatnia Data Zamowienia pobrana z local storage: ', ostatniaDataZamowienia);
console.log('ostatnia Data Zaplacono pobrana z local storage: ', ostatniaDataZaplacono);
console.log('ostatnia Data Wyslac pobrana z local storage: ', ostatniaDataWyslac);

// DANE OPERACYJNE (DO RENDEROWANIA PRODUKTÓW NA STRONIE)
let licznikPolek = 0;
let licznikDomkow = 0;
let licznikMateracy = 0;
let licznikPokrowcow = 0;
let licznikStopni = 0;
let licznikInnych = 0;

// DANE OPERACYJNE (DO RENDEROWANIA PDF)
let PDF = new jsPDF('p', 'pt');

let biezacaWysokosc = 50;
let biezacyLewyMargines = 60;
// let czyJestFalaWRzedzie = false;

// USTAWIENIA STRONY
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

$(document).ready(() => {
    ZAMAWIAJACY_INPUT.focus();
});

// DYNAMICZNY TITLE PAGE
ZAMAWIAJACY_INPUT.on('input',function(event){
    document.title = event.target.value;
});

// DATEPICKER KONFIGURACJA
$.datepicker.setDefaults({
    dateFormat: 'd-m-yy',
    dayNamesMin: ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'],
    firstDay: 1,
    showOtherMonths: true,
    monthNames: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień']
});

// DATA ZAMOWIENIA
DATEPICKER_DATA_ZAMOWIENIA.datepicker({
    defaultDate: ostatniaDataZamowienia || null,
    onSelect: (dateText) => {
        DATEPICKER_DATA_ZAMOWIENIA.datepicker('option', 'defaultDate', dateText);
        localStorage['ostatniaDataZamowienia'] = dateText;
    }
});

// ZAPLACONO - DATA
DATEPICKER_ZAPLACONO.datepicker({
    defaultDate: ostatniaDataZaplacono || null,
    onSelect: (dateText) => {
        DATEPICKER_ZAPLACONO.datepicker('option', 'defaultDate', dateText);
        localStorage['ostatniaDataZaplacono'] = dateText;
    }
});

// WYSŁAĆ DO DNIA
DATEPICKER_WYSLAC_DO_DNIA.datepicker({
    defaultDate: ostatniaDataWyslac || null,
    onSelect: (dateText) => {
        DATEPICKER_WYSLAC_DO_DNIA.datepicker('option', 'defaultDate', dateText);
        localStorage['ostatniaDataWyslac'] = dateText;
    }
});

// GENEROWANIE PRODUKTU
$('input[name="produkt"]').change((event) => {
    event.preventDefault();

    switch (event.target.value) {
        case 'Półka':
            stworzNowaPolke();
            break;
        case 'Stopień':
            stworzNowyStopien();
            break;
        case 'Materac':
            stworzNowyMaterac();
            break;
        case 'Pokrowiec':
            stworzNowyPokrowiec();
            break;
        case 'Domek':
            stworzNowyDomek();
            break;
        case 'Inny':
            stworzNowyInny();
            break;
    }

    $(event.target).prop('checked',false);
});

// ZRODLO ZAMOWIENIA
ZRODLO_RADIO_BUTTONY.change((event) => {
    ZRODLO_INNE_INPUT.prop('disabled', true).hide();
    WALUTA_INNA_INPUT.prop('disabled', true).hide();
    KRAJ_INNY_INPUT.prop('disabled', true).hide();
    KONTENER_NUMER_ZAMOWIENIA.hide();
    $('.waluta-input').hide();
    EXPORT_KONTENER.hide();
    EXPORT_RADIO_NIE.prop('checked', true);
    KRAJ_RADIO_BUTTONY.prop('checked', false);
    NUMER_ZAMOWIENIA.removeAttr('required');

    switch (event.target.id) {
        case 'ebay-us':
        case 'amazon':
            $('.usd').prop('checked', 'true').show();
            break;
        case 'etsy':
            $('.eur').prop('checked', 'true').show();
            DATEPICKER_ZAPLACONO.prop('disabled', false).css('display', 'inline-block');
            DATEPICKER_ZAPLACONO.val(DATEPICKER_DATA_ZAMOWIENIA.val());
            break;
        case 'ebay-de':
            $('.eur').prop('checked', 'true').show();
            $('#de').prop('checked', 'true');
            break;
        case '4mypet':
            KONTENER_NUMER_ZAMOWIENIA.show();
            NUMER_ZAMOWIENIA.prop('required', 'true');
            $('.eur').prop('checked', 'true').show();
            break;
        case '4mypetshop':
            KONTENER_NUMER_ZAMOWIENIA.show();
            NUMER_ZAMOWIENIA.prop('required', 'true');
            $('.pln').prop('checked', 'true').show();
            $('#pl').prop('checked', 'true');
            break;
        case 'allegro':
            $('.pln').prop('checked', 'true').show();
            $('#pl').prop('checked', 'true');
            break;
        case 'ebay-uk':
            $('.gbp').prop('checked', 'true').show();
            $('#uk').prop('checked', 'true');
            EXPORT_KONTENER.show();
            EXPORT_RADIO_TAK.prop('checked', true);
            break;
        case 'zrodlo-inne':
            ZRODLO_INNE_INPUT.prop('disabled', false).css('display', 'inline-block');
            $('.waluta-input').show();
            break;
    }
});

// OZYWIENIE INPUTU 'ZAPŁACONO'
ZAPLACONO_RADIO_BUTTONY.change((event) => {
    if (event.target.id === 'zapytanie-zaplacono-tak') {
        DATEPICKER_ZAPLACONO.prop('disabled', false).css('display', 'inline-block').val(DATEPICKER_DATA_ZAMOWIENIA.val());
        DATEPICKER_WYSLAC_DO_DNIA.prop('disabled', false).css('display', 'inline-block').focus();
        $('#data-wysylki-title').show();
    } else {
        DATEPICKER_ZAPLACONO.prop('disabled', true).hide();
        DATEPICKER_WYSLAC_DO_DNIA.prop('disabled', true).hide();
        $('#data-wysylki-title').hide();
    }
});

// OZYWIENIE PRZYCISKÓW 'WALUTA'
WALUTA_RADIO_BUTTONY.change(() => {
    $('input#waluta-inna').is(':checked') ? WALUTA_INNA_INPUT.prop('disabled', false).css('display', 'inline-block') : WALUTA_INNA_INPUT.prop('disabled', true).hide();
});

// OZYWIENIE PRZYCISKÓW 'KRAJ'
KRAJ_RADIO_BUTTONY.change((event) => {
    KRAJ_INNY_INPUT.prop('disabled', true).hide();

    switch (event.target.id) {
        case 'usa':
        case 'au':
        case 'ca':
            EXPORT_KONTENER.show();
            EXPORT_RADIO_TAK.prop('checked', true);
            break;
        case 'uk':
        case 'ch':
        case 'no':
            EXPORT_KONTENER.show();
            EXPORT_RADIO_TAK.prop('checked', true);
            break;
        case 'kraj-inny':
            EXPORT_KONTENER.show();
            EXPORT_RADIO_NIE.prop('checked', false);
            EXPORT_RADIO_TAK.prop('checked', false);
            KRAJ_INNY_INPUT.prop('disabled', false).css('display', 'inline-block');
            break;
        default:
            EXPORT_KONTENER.hide();
            EXPORT_RADIO_NIE.prop('checked', true);
            break;
    }
});

// KWOTA ZAMOWIENIA
KWOTA_ZAMOWIENIA.change((event) => {
    KWOTA_ZAMOWIENIA.val(konwertujNaWalute(event.target.value));
});

// konwertowanie tresci inputu na wartosc dziesietna, np. 23,2 -> 23,20
const konwertujNaWalute = (trescInputu) => {
    return (Math.round(trescInputu.replace(',','.') * 100) / 100).toFixed(2).replace('.', ',');
};

// TWORZENIE NOWEJ POLKI
const stworzNowaPolke = () => {
    licznikPolek++;

    KONTENER_LISTA_PRODUKTOW.append(`
        <div class="produkt produkt-polka" id="polka-numer-${licznikPolek}">
            <p>PÓŁKA NR ${licznikPolek}</p>
            <p>Ilość półek</p>
            <input type="text" name="${licznikPolek}-liczba-polek" required>
            <br>
        </div>
    `);
    renderujKsztalt(licznikPolek);
    dodajPrzyciskUsun('#polka-numer-'+licznikPolek);
    focusNaLiczbe(`input[name="${licznikPolek}-liczba-polek"]`);
};

const renderujKsztalt = (idNumer) => {
    $('#polka-numer-' + idNumer).append(`
        <label for="${idNumer}-luk"><input type="radio" name="${idNumer}-ksztalt" id="${idNumer}-luk" value="Łuk" required>Łuk</label>
        <label for="${idNumer}-luk-podwojny"><input type="radio" name="${idNumer}-ksztalt" id="${idNumer}-luk-podwojny" value="Łuk Podwójny" required>Łuk Podwójny</label>
        <label for="${idNumer}-fala"><input type="radio" name="${idNumer}-ksztalt" id="${idNumer}-fala" value="Fala" required>Fala</label>
        <div id="atrybuty-polki-${licznikPolek}"></div>
    `);

    $('input[name="' + idNumer + '-ksztalt"]').change((event) => {
        renderujAtrybuty($(event.target).val(), idNumer);
    });
};

const renderujAtrybuty = (ksztaltPolki, idNumer) => {
    const kontenerAtrybutow = $('#atrybuty-polki-' + idNumer);
    kontenerAtrybutow.empty();
    switch (ksztaltPolki) {
        case 'Łuk':
            kontenerAtrybutow.append(`
                <p>Długość</p>
                <label for="${idNumer}-dlugosc-60"><input type="radio" name="${idNumer}-dlugosc" id="${idNumer}-dlugosc-60" value="60 cm" required>60 cm</label>
                <label for="${idNumer}-dlugosc-75"><input type="radio" name="${idNumer}-dlugosc" id="${idNumer}-dlugosc-75" value="75 cm" required>75 cm</label>
                <label for="${idNumer}-dlugosc-95"><input type="radio" name="${idNumer}-dlugosc" id="${idNumer}-dlugosc-95" value="95 cm" required>95 cm</label>
                <label for="${idNumer}-dlugosc-100"><input type="radio" name="${idNumer}-dlugosc" id="${idNumer}-dlugosc-100" value="100 cm" required>100 cm</label>
                <label for="${idNumer}-dlugosc-inne"><input type="radio" name="${idNumer}-dlugosc" id="${idNumer}-dlugosc-inne" value="" required>Inna</label>
                <label for="${idNumer}-dlugosc-nie-podano"><input type="radio" name="${idNumer}-dlugosc" id="${idNumer}-dlugosc-nie-podano" value="" required>Nie podano</label>
            `);
            break;
        case 'Łuk Podwójny':
            kontenerAtrybutow.append(`
                <p>Długość</p>
                <label for="${idNumer}-dlugosc-100"><input type="radio" name="${idNumer}-dlugosc" id="${idNumer}-dlugosc-100" value="100 cm" required checked>100 cm</label>
                <label for="${idNumer}-dlugosc-inne"><input type="radio" name="${idNumer}-dlugosc" id="${idNumer}-dlugosc-inne" value="" required>Inna</label>
                <label for="${idNumer}-dlugosc-nie-podano"><input type="radio" name="${idNumer}-dlugosc" id="${idNumer}-dlugosc-nie-podano" value="" required>Nie podano</label>
            `);
            break;
        case 'Fala':
            kontenerAtrybutow.append(`
                <p>Długość</p>
                <label for="${idNumer}-dlugosc-75"><input type="radio" name="${idNumer}-dlugosc" id="${idNumer}-dlugosc-75" value="75 cm" required>75 cm</label>
                <label for="${idNumer}-dlugosc-95"><input type="radio" name="${idNumer}-dlugosc" id="${idNumer}-dlugosc-95" value="95 cm" required>95 cm</label>
                <label for="${idNumer}-dlugosc-100"><input type="radio" name="${idNumer}-dlugosc" id="${idNumer}-dlugosc-100" value="100 cm" required>100 cm</label>
                <label for="${idNumer}-dlugosc-inne"><input type="radio" name="${idNumer}-dlugosc" id="${idNumer}-dlugosc-inne" value="" required>Inna</label>
                <label for="${idNumer}-dlugosc-nie-podano"><input type="radio" name="${idNumer}-dlugosc" id="${idNumer}-dlugosc-nie-podano" value="" required>Nie podano</label>
                <p>Symetria</p>
                <label for="${idNumer}-symetryczna"><input type="radio" name="${idNumer}-symetria" id="${idNumer}-symetryczna" value="Symetryczna" required>Symetryczna</label>
                <label for="${idNumer}-asymetryczna"><input type="radio" name="${idNumer}-symetria" id="${idNumer}-asymetryczna" value="Asymetryczna" required>Asymetryczna</label>
                <label for="${idNumer}-symetria-nie-podano"><input type="radio" name="${idNumer}-symetria" id="${idNumer}-symetria-nie-podano" value="" required>Nie podano</label>
                <p>Strona</p>
                <label for="${idNumer}-lewa"><input type="radio" name="${idNumer}-strona" id="${idNumer}-lewa" value="Lewa" required>Lewa</label>
                <label for="${idNumer}-prawa"><input type="radio" name="${idNumer}-strona" id="${idNumer}-prawa" value="Prawa" required>Prawa</label>
                <label for="${idNumer}-strona-nie-podano"><input type="radio" name="${idNumer}-strona" id="${idNumer}-strona-nie-podano" value="" required>Nie podano</label>
        `);
            break;
    }
    renderujReszte(idNumer);
};

const renderujReszte = (idNumer) => {
    $('#atrybuty-polki-' + idNumer).append(`
        <p>Materac</p>
        <p>grupa DOT</p>
        <label for="${idNumer}-polka-materac-dot-light-silver-gray"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-dot-light-silver-gray" value="DOT Light Silver-Gray" required>DOT Light Silver-Gray</label>
        <label for="${idNumer}-polka-materac-dot-gray"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-dot-gray" value="DOT Gray" required>DOT Gray</label>
        <label for="${idNumer}-polka-materac-dot-dark-gray"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-dot-dark-gray" value="DOT Dark Gray" required>DOT Dark Gray</label>
        <label for="${idNumer}-polka-materac-dot-cream"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-dot-cream" value="DOT Cream" required>DOT Cream</label>
        <label for="${idNumer}-polka-materac-dot-beige"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-dot-beige" value="DOT Beige" required>DOT Beige</label>
        <label for="${idNumer}-polka-materac-dot-mustard"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-dot-mustard" value="DOT Mustard" required>DOT Mustard</label>
        <label for="${idNumer}-polka-materac-dot-brick-brown"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-dot-brick-brown" value="DOT Brick Brown" required>DOT Brick Brown</label>
        <label for="${idNumer}-polka-materac-dot-pastel-pink"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-dot-pastel-pink" value="DOT Pastel Pink" required>DOT Pastel Pink</label>
        <label for="${idNumer}-polka-materac-dot-dark-pastel-pink"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-dot-dark-pastel-pink" value="DOT Dark Pastel Pink" required>DOT Dark Pastel Pink</label>
        <label for="${idNumer}-polka-materac-dot-dark-chocolate"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-dot-dark-chocolate" value="DOT Dark Chocolate" required>DOT Dark Chocolate</label>
        <label for="${idNumer}-polka-materac-dot-mint"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-dot-mint" value="DOT Mint" required>DOT Mint</label>
        <label for="${idNumer}-polka-materac-dot-bottle-green"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-dot-bottle-green" value="DOT Bottle Green" required>DOT Bottle Green</label>
        <label for="${idNumer}-polka-materac-dot-blue-gray"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-dot-blue-gray" value="DOT Blue-Gray" required>DOT Blue-Gray</label>
        <label for="${idNumer}-polka-materac-dot-deep-navy-blue"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-dot-deep-navy-blue" value="DOT Deep Navy Blue" required>DOT Deep Navy Blue</label>
        <label for="${idNumer}-polka-materac-dot-black"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-dot-black" value="DOT Black" required>DOT Black</label>
        <p>grupa DIOSA</p>
        <label for="${idNumer}-polka-materac-diosa-cream"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-diosa-cream" value="DIOSA Cream" required>DIOSA Cream</label>
        <label for="${idNumer}-polka-materac-diosa-beige"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-diosa-beige" value="DIOSA Beige" required>DIOSA Beige</label>
        <label for="${idNumer}-polka-materac-diosa-brick-orange"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-diosa-brick-orange" value="DIOSA Brick-Orange" required>DIOSA Brick-Orange</label>
        <label for="${idNumer}-polka-materac-diosa-powder-pink"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-diosa-powder-pink" value="DIOSA Powder Pink" required>DIOSA Powder Pink</label>
        <label for="${idNumer}-polka-materac-diosa-mint"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-diosa-mint" value="DIOSA Mint" required>DIOSA Mint</label>
        <label for="${idNumer}-polka-materac-diosa-sea-green"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-diosa-sea-green" value="DIOSA Sea Green" required>DIOSA Sea Green</label>
        <label for="${idNumer}-polka-materac-diosa-gray"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-diosa-gray" value="DIOSA Gray" required>DIOSA Gray</label>
        <label for="${idNumer}-polka-materac-diosa-navy-blue"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-diosa-navy-blue" value="DIOSA Navy Blue" required>DIOSA Navy Blue</label>
        <label for="${idNumer}-polka-materac-diosa-graphite"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-diosa-graphite" value="DIOSA Graphite" required>DIOSA Graphite</label>
        <br>
        <br>
        <label for="${idNumer}-polka-materac-inne"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-inne" value="" required>Inny</label>
        <label for="${idNumer}-polka-materac-nie-podano"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-nie-podano" value="" required>Nie podano</label>

        <p>Podstawa</p>
        <p>grupa DOT</p>
        <label for="${idNumer}-polka-podstawa-dot-light-silver-gray"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-dot-light-silver-gray" value="DOT Light Silver-Gray" required>DOT Light Silver-Gray</label>
        <label for="${idNumer}-polka-podstawa-dot-gray"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-dot-gray" value="DOT Gray" required>DOT Gray</label>
        <label for="${idNumer}-polka-podstawa-dot-dark-gray"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-dot-dark-gray" value="DOT Dark Gray" required>DOT Dark Gray</label>
        <label for="${idNumer}-polka-podstawa-dot-cream"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-dot-cream" value="DOT Cream" required>DOT Cream</label>
        <label for="${idNumer}-polka-podstawa-dot-beige"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-dot-beige" value="DOT Beige" required>DOT Beige</label>
        <label for="${idNumer}-polka-podstawa-dot-mustard"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-dot-mustard" value="DOT Mustard" required>DOT Mustard</label>
        <label for="${idNumer}-polka-podstawa-dot-brick-brown"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-dot-brick-brown" value="DOT Brick Brown" required>DOT Brick Brown</label>
        <label for="${idNumer}-polka-podstawa-dot-pastel-pink"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-dot-pastel-pink" value="DOT Pastel Pink" required>DOT Pastel Pink</label>
        <label for="${idNumer}-polka-podstawa-dot-dark-pastel-pink"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-dot-dark-pastel-pink" value="DOT Dark Pastel Pink" required>DOT Dark Pastel Pink</label>
        <label for="${idNumer}-polka-podstawa-dot-dark-chocolate"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-dot-dark-chocolate" value="DOT Dark Chocolate" required>DOT Dark Chocolate</label>
        <label for="${idNumer}-polka-podstawa-dot-mint"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-dot-mint" value="DOT Mint" required>DOT Mint</label>
        <label for="${idNumer}-polka-podstawa-dot-bottle-green"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-dot-bottle-green" value="DOT Bottle Green" required>DOT Bottle Green</label>
        <label for="${idNumer}-polka-podstawa-dot-blue-gray"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-dot-blue-gray" value="DOT Blue-Gray" required>DOT Blue-Gray</label>
        <label for="${idNumer}-polka-podstawa-dot-deep-navy-blue"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-dot-deep-navy-blue" value="DOT Deep Navy Blue" required>DOT Deep Navy Blue</label>
        <label for="${idNumer}-polka-podstawa-dot-black"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-dot-black" value="DOT Black" required>DOT Black</label>
        <p>grupa DIOSA</p>
        <label for="${idNumer}-polka-podstawa-diosa-cream"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-diosa-cream" value="DIOSA Cream" required>DIOSA Cream</label>
        <label for="${idNumer}-polka-podstawa-diosa-beige"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-diosa-beige" value="DIOSA Beige" required>DIOSA Beige</label>
        <label for="${idNumer}-polka-podstawa-diosa-brick-orange"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-diosa-brick-orange" value="DIOSA Brick-Orange" required>DIOSA Brick-Orange</label>
        <label for="${idNumer}-polka-podstawa-diosa-powder-pink"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-diosa-powder-pink" value="DIOSA Powder Pink" required>DIOSA Powder Pink</label>
        <label for="${idNumer}-polka-podstawa-diosa-mint"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-diosa-mint" value="DIOSA Mint" required>DIOSA Mint</label>
        <label for="${idNumer}-polka-podstawa-diosa-sea-green"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-diosa-sea-green" value="DIOSA Sea Green" required>DIOSA Sea Green</label>
        <label for="${idNumer}-polka-podstawa-diosa-gray"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-diosa-gray" value="DIOSA Gray" required>DIOSA Gray</label>
        <label for="${idNumer}-polka-podstawa-diosa-navy-blue"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-diosa-navy-blue" value="DIOSA Navy Blue" required>DIOSA Navy Blue</label>
        <label for="${idNumer}-polka-podstawa-diosa-graphite"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-diosa-graphite" value="DIOSA Graphite" required>DIOSA Graphite</label>
        <br>
        <br>
        <label for="${idNumer}-polka-podstawa-inne"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-inne" value="" required>Inna</label>
        <label for="${idNumer}-polka-podstawa-nie-podano"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-nie-podano" value="" required>Nie podano</label>
    `);
};

// TWORZENIE NOWEGO DOMKU
const stworzNowyDomek = () => {
    console.log('brak danych o domku = ', licznikDomkow);
};

// TWORZENIE NOWEGO MATERACA
const stworzNowyMaterac = () => {
    licznikMateracy++;

    KONTENER_LISTA_PRODUKTOW.append(`
        <div class="produkt produkt-materac" id="materac-numer-${licznikMateracy}">
            <p>MATERAC NR ${licznikMateracy}</p>
            <p>Ilość materacy</p>
            <input type="text" name="${licznikMateracy}-liczba-materacy" required>
            <p>Pasuje do półki:</p>
            <label for="${licznikMateracy}-dlugosc-60-materac"><input type="radio" name="${licznikMateracy}-dlugosc-materac" id="${licznikMateracy}-dlugosc-60-materac" value="60 cm" required>60 cm</label>
            <label for="${licznikMateracy}-dlugosc-75-materac"><input type="radio" name="${licznikMateracy}-dlugosc-materac" id="${licznikMateracy}-dlugosc-75-materac" value="75 cm" required>75 cm</label>
            <label for="${licznikMateracy}-dlugosc-95-materac"><input type="radio" name="${licznikMateracy}-dlugosc-materac" id="${licznikMateracy}-dlugosc-95-materac" value="95 cm" required>95 cm</label>
            <label for="${licznikMateracy}-dlugosc-100-materac"><input type="radio" name="${licznikMateracy}-dlugosc-materac" id="${licznikMateracy}-dlugosc-100-materac" value="100 cm" required>100 cm</label>
            <label for="${licznikMateracy}-dlugosc-materac-inne"><input type="radio" name="${licznikMateracy}-dlugosc-materac" id="${licznikMateracy}-dlugosc-materac-inne" value="" required>Inny</label>
            <label for="${licznikMateracy}-dlugosc-materac-nie-podano"><input type="radio" name="${licznikMateracy}-dlugosc-materac" id="${licznikMateracy}-dlugosc-materac-nie-podano" value="" required>Nie podano</label>
            <p>Kolor</p>
            <p>grupa DOT</p>
            <label for="${licznikMateracy}-materac-dot-light-silver-gray"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-dot-light-silver-gray" value="DOT Light Silver-Gray" required>DOT Light Silver-Gray</label>
            <label for="${licznikMateracy}-materac-dot-gray"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-dot-gray" value="DOT Gray" required>DOT Gray</label>
            <label for="${licznikMateracy}-materac-dot-dark-gray"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-dot-dark-gray" value="DOT Dark Gray" required>DOT Dark Gray</label>
            <label for="${licznikMateracy}-materac-dot-cream"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-dot-cream" value="DOT Cream" required>DOT Cream</label>
            <label for="${licznikMateracy}-materac-dot-beige"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-dot-beige" value="DOT Beige" required>DOT Beige</label>
            <label for="${licznikMateracy}-materac-dot-mustard"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-dot-mustard" value="DOT Mustard" required>DOT Mustard</label>
            <label for="${licznikMateracy}-materac-dot-brick-brown"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-dot-brick-brown" value="DOT Brick Brown" required>DOT Brick Brown</label>
            <label for="${licznikMateracy}-materac-dot-pastel-pink"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-dot-pastel-pink" value="DOT Pastel Pink" required>DOT Pastel Pink</label>
            <label for="${licznikMateracy}-materac-dot-dark-pastel-pink"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-dot-dark-pastel-pink" value="DOT Dark Pastel Pink" required>DOT Dark Pastel Pink</label>
            <label for="${licznikMateracy}-materac-dot-dark-chocolate"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-dot-dark-chocolate" value="DOT Dark Chocolate" required>DOT Dark Chocolate</label>
            <label for="${licznikMateracy}-materac-dot-mint"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-dot-mint" value="DOT Mint" required>DOT Mint</label>
            <label for="${licznikMateracy}-materac-dot-bottle-green"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-dot-bottle-green" value="DOT Bottle Green" required>DOT Bottle Green</label>
            <label for="${licznikMateracy}-materac-dot-blue-gray"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-dot-blue-gray" value="DOT Blue-Gray" required>DOT Blue-Gray</label>
            <label for="${licznikMateracy}-materac-dot-deep-navy-blue"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-dot-deep-navy-blue" value="DOT Deep Navy Blue" required>DOT Deep Navy Blue</label>
            <label for="${licznikMateracy}-materac-dot-black"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-dot-black" value="DOT Black" required>DOT Black</label>
            <p>grupa DIOSA</p>
            <label for="${licznikMateracy}-materac-diosa-cream"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-diosa-cream" value="DIOSA Cream" required>DIOSA Cream</label>
            <label for="${licznikMateracy}-materac-diosa-beige"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-diosa-beige" value="DIOSA Beige" required>DIOSA Beige</label>
            <label for="${licznikMateracy}-materac-diosa-brick-orange"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-diosa-brick-orange" value="DIOSA Brick-Orange" required>DIOSA Brick-Orange</label>
            <label for="${licznikMateracy}-materac-diosa-powder-pink"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-diosa-powder-pink" value="DIOSA Powder Pink" required>DIOSA Powder Pink</label>
            <label for="${licznikMateracy}-materac-diosa-mint"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-diosa-mint" value="DIOSA Mint" required>DIOSA Mint</label>
            <label for="${licznikMateracy}-materac-diosa-sea-green"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-diosa-sea-green" value="DIOSA Sea Green" required>DIOSA Sea Green</label>
            <label for="${licznikMateracy}-materac-diosa-gray"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-diosa-gray" value="DIOSA Gray" required>DIOSA Gray</label>
            <label for="${licznikMateracy}-materac-diosa-navy-blue"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-diosa-navy-blue" value="DIOSA Navy Blue" required>DIOSA Navy Blue</label>
            <label for="${licznikMateracy}-materac-diosa-graphite"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-diosa-graphite" value="DIOSA Graphite" required>DIOSA Graphite</label>
            <br>
            <br>
            <label for="${licznikMateracy}-materac-inne"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-inne" value="" required>Inny</label>
            <label for="${licznikMateracy}-materac-nie-podano"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-nie-podano" value="" required>Nie podano</label>
        </div>
    `);

    dodajPrzyciskUsun('#materac-numer-'+licznikMateracy);
    focusNaLiczbe(`input[name="${licznikMateracy}-liczba-materacy"]`);
};

// TWORZENIE NOWEGO MATERACA
const stworzNowyPokrowiec = () => {
    licznikPokrowcow++;

    KONTENER_LISTA_PRODUKTOW.append(`
        <div class="produkt produkt-pokrowiec" id="pokrowiec-numer-${licznikPokrowcow}">
            <p>POKROWIEC NR ${licznikPokrowcow}</p>
            <p>Ilość pokrowcow</p>
            <input type="text" name="${licznikPokrowcow}-liczba-pokrowcow" required>
            <p>Pasuje do półki:</p>
            <label for="${licznikPokrowcow}-dlugosc-60-pokrowiec"><input type="radio" name="${licznikPokrowcow}-dlugosc-pokrowiec" id="${licznikPokrowcow}-dlugosc-60-pokrowiec" value="60 cm" required>60 cm</label>
            <label for="${licznikPokrowcow}-dlugosc-75-pokrowiec"><input type="radio" name="${licznikPokrowcow}-dlugosc-pokrowiec" id="${licznikPokrowcow}-dlugosc-75-pokrowiec" value="75 cm" required>75 cm</label>
            <label for="${licznikPokrowcow}-dlugosc-95-pokrowiec"><input type="radio" name="${licznikPokrowcow}-dlugosc-pokrowiec" id="${licznikPokrowcow}-dlugosc-95-pokrowiec" value="95 cm" required>95 cm</label>
            <label for="${licznikPokrowcow}-dlugosc-100-pokrowiec"><input type="radio" name="${licznikPokrowcow}-dlugosc-pokrowiec" id="${licznikPokrowcow}-dlugosc-100-pokrowiec" value="100 cm" required>100 cm</label>
            <label for="${licznikPokrowcow}-dlugosc-pokrowiec-inne"><input type="radio" name="${licznikPokrowcow}-dlugosc-pokrowiec" id="${licznikPokrowcow}-dlugosc-pokrowiec-inne" value="" required>Inny</label>
            <label for="${licznikPokrowcow}-dlugosc-pokrowiec-nie-podano"><input type="radio" name="${licznikPokrowcow}-dlugosc-pokrowiec" id="${licznikPokrowcow}-dlugosc-pokrowiec-nie-podano" value="" required>Nie podano</label>
            <p>Kolor</p>
            <p>grupa DOT</p>
            <label for="${licznikPokrowcow}-pokrowiec-dot-light-silver-gray"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-dot-light-silver-gray" value="DOT Light Silver-Gray" required>DOT Light Silver-Gray</label>
            <label for="${licznikPokrowcow}-pokrowiec-dot-gray"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-dot-gray" value="DOT Gray" required>DOT Gray</label>
            <label for="${licznikPokrowcow}-pokrowiec-dot-dark-gray"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-dot-dark-gray" value="DOT Dark Gray" required>DOT Dark Gray</label>
            <label for="${licznikPokrowcow}-pokrowiec-dot-cream"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-dot-cream" value="DOT Cream" required>DOT Cream</label>
            <label for="${licznikPokrowcow}-pokrowiec-dot-beige"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-dot-beige" value="DOT Beige" required>DOT Beige</label>
            <label for="${licznikPokrowcow}-pokrowiec-dot-mustard"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-dot-mustard" value="DOT Mustard" required>DOT Mustard</label>
            <label for="${licznikPokrowcow}-pokrowiec-dot-brick-brown"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-dot-brick-brown" value="DOT Brick Brown" required>DOT Brick Brown</label>
            <label for="${licznikPokrowcow}-pokrowiec-dot-pastel-pink"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-dot-pastel-pink" value="DOT Pastel Pink" required>DOT Pastel Pink</label>
            <label for="${licznikPokrowcow}-pokrowiec-dot-dark-pastel-pink"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-dot-dark-pastel-pink" value="DOT Dark Pastel Pink" required>DOT Dark Pastel Pink</label>
            <label for="${licznikPokrowcow}-pokrowiec-dot-dark-chocolate"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-dot-dark-chocolate" value="DOT Dark Chocolate" required>DOT Dark Chocolate</label>
            <label for="${licznikPokrowcow}-pokrowiec-dot-mint"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-dot-mint" value="DOT Mint" required>DOT Mint</label>
            <label for="${licznikPokrowcow}-pokrowiec-dot-bottle-green"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-dot-bottle-green" value="DOT Bottle Green" required>DOT Bottle Green</label>
            <label for="${licznikPokrowcow}-pokrowiec-dot-blue-gray"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-dot-blue-gray" value="DOT Blue-Gray" required>DOT Blue-Gray</label>
            <label for="${licznikPokrowcow}-pokrowiec-dot-deep-navy-blue"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-dot-deep-navy-blue" value="DOT Deep Navy Blue" required>DOT Deep Navy Blue</label>
            <label for="${licznikPokrowcow}-pokrowiec-dot-black"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-dot-black" value="DOT Black" required>DOT Black</label>
            <p>grupa DIOSA</p>
            <label for="${licznikPokrowcow}-pokrowiec-diosa-cream"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-diosa-cream" value="DIOSA Cream" required>DIOSA Cream</label>
            <label for="${licznikPokrowcow}-pokrowiec-diosa-beige"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-diosa-beige" value="DIOSA Beige" required>DIOSA Beige</label>
            <label for="${licznikPokrowcow}-pokrowiec-diosa-brick-orange"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-diosa-brick-orange" value="DIOSA Brick-Orange" required>DIOSA Brick-Orange</label>
            <label for="${licznikPokrowcow}-pokrowiec-diosa-powder-pink"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-diosa-powder-pink" value="DIOSA Powder Pink" required>DIOSA Powder Pink</label>
            <label for="${licznikPokrowcow}-pokrowiec-diosa-mint"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-diosa-mint" value="DIOSA Mint" required>DIOSA Mint</label>
            <label for="${licznikPokrowcow}-pokrowiec-diosa-sea-green"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-diosa-sea-green" value="DIOSA Sea Green" required>DIOSA Sea Green</label>
            <label for="${licznikPokrowcow}-pokrowiec-diosa-gray"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-diosa-gray" value="DIOSA Gray" required>DIOSA Gray</label>
            <label for="${licznikPokrowcow}-pokrowiec-diosa-navy-blue"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-diosa-navy-blue" value="DIOSA Navy Blue" required>DIOSA Navy Blue</label>
            <label for="${licznikPokrowcow}-pokrowiec-diosa-graphite"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-diosa-graphite" value="DIOSA Graphite" required>DIOSA Graphite</label>
            <br>
            <br>
            <label for="${licznikPokrowcow}-pokrowiec-inne"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-inne" value="" required>Inny</label>
            <label for="${licznikPokrowcow}-pokrowiec-nie-podano"><input type="radio" name="${licznikPokrowcow}-pokrowiec" id="${licznikPokrowcow}-pokrowiec-nie-podano" value="" required>Nie podano</label>
        </div>
    `);

    dodajPrzyciskUsun('#pokrowiec-numer-'+licznikPokrowcow);
    focusNaLiczbe(`input[name="${licznikPokrowcow}-liczba-pokrowcow"]`);
};

// TWORZENIE NOWEGO STOPNIA
const stworzNowyStopien = () => {
    licznikStopni++;

    KONTENER_LISTA_PRODUKTOW.append(`
        <div class="produkt produkt-stopien" id="stopien-numer-${licznikStopni}">
            <p>STOPIEŃ NR ${licznikStopni}</p>
            <p>Ilość stopni</p>
            <input type="text" name="${licznikStopni}-liczba-stopni" required>
            <p>Filc</p>
            <label for="${licznikStopni}-stopien-filc-bialy"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-bialy" value="Biały" required>Biały</label>
            <label for="${licznikStopni}-stopien-filc-kremowy"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-kremowy" value="Kremowy" required>Kremowy</label>
            <label for="${licznikStopni}-stopien-filc-bezowy"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-bezowy" value="Beżowy" required>Beżowy</label>
            <label for="${licznikStopni}-stopien-filc-szary"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-szary" value="Szary" required>Szary</label>
            <label for="${licznikStopni}-stopien-filc-grafitowy"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-grafitowy" value="Grafitowy" required>Grafitowy</label>
            <label for="${licznikStopni}-stopien-filc-czarny"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-czarny" value="Czarny" required>Czarny</label>
            <label for="${licznikStopni}-stopien-filc-burgundowy"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-burgundowy" value="Burgundowy" required>Burgundowy</label>
            <label for="${licznikStopni}-stopien-filc-niebieski"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-niebieski" value="Kobaltowy" required>Kobaltowy niebieski</label>
            <label for="${licznikStopni}-stopien-filc-pomaranczowy"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-pomaranczowy" value="Pomarańczowy" required>Pomarańczowy</label>
            <label for="${licznikStopni}-stopien-filc-inne"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-inne" value="" required>Inny</label>
            <label for="${licznikStopni}-stopien-filc-nie-podano"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-nie-podano" value="" required>Nie podano</label>
            <p>Platforma</p>
            <label for="${licznikStopni}-stopien-platforma-bialy"><input type="radio" name="${licznikStopni}-stopien-platforma" id="${licznikStopni}-stopien-platforma-bialy" value="Biały" required>Biały</label>
            <label for="${licznikStopni}-stopien-platforma-szary"><input type="radio" name="${licznikStopni}-stopien-platforma" id="${licznikStopni}-stopien-platforma-szary" value="Szary" required>Szary</label>
            <label for="${licznikStopni}-stopien-platforma-karmelowy"><input type="radio" name="${licznikStopni}-stopien-platforma" id="${licznikStopni}-stopien-platforma-karmelowy" value="Karmelowy" required>Karmelowy</label>
            <label for="${licznikStopni}-stopien-platforma-brazowy"><input type="radio" name="${licznikStopni}-stopien-platforma" id="${licznikStopni}-stopien-platforma-brazowy" value="Brązowy" required>Brązowy</label>
            <label for="${licznikStopni}-stopien-platforma-czarny"><input type="radio" name="${licznikStopni}-stopien-platforma" id="${licznikStopni}-stopien-platforma-czarny" value="Czarny" required>Czarny</label>
            <label for="${licznikStopni}-stopien-platforma-inne"><input type="radio" name="${licznikStopni}-stopien-platforma" id="${licznikStopni}-stopien-platforma-inne" value="" required>Inny</label>
            <label for="${licznikStopni}-stopien-platforma-nie-podano"><input type="radio" name="${licznikStopni}-stopien-platforma" id="${licznikStopni}-stopien-platforma-nie-podano" value="" required>Nie podano</label>
            <p>Osłona</p>
            <label for="${licznikStopni}-stopien-oslona-bialy"><input type="radio" name="${licznikStopni}-stopien-oslona" id="${licznikStopni}-stopien-oslona-bialy" value="Biały" required>Biały</label>
            <label for="${licznikStopni}-stopien-oslona-szary"><input type="radio" name="${licznikStopni}-stopien-oslona" id="${licznikStopni}-stopien-oslona-szary" value="Szary" required>Szary</label>
            <label for="${licznikStopni}-stopien-oslona-karmelowy"><input type="radio" name="${licznikStopni}-stopien-oslona" id="${licznikStopni}-stopien-oslona-karmelowy" value="Karmelowy" required>Karmelowy</label>
            <label for="${licznikStopni}-stopien-oslona-brazowy"><input type="radio" name="${licznikStopni}-stopien-oslona" id="${licznikStopni}-stopien-oslona-brazowy" value="Brązowy" required>Brązowy</label>
            <label for="${licznikStopni}-stopien-oslona-czarny"><input type="radio" name="${licznikStopni}-stopien-oslona" id="${licznikStopni}-stopien-oslona-czarny" value="Czarny" required>Czarny</label>
            <label for="${licznikStopni}-stopien-oslona-inne"><input type="radio" name="${licznikStopni}-stopien-oslona" id="${licznikStopni}-stopien-oslona-inne" value="" required>Inny</label>
            <label for="${licznikStopni}-stopien-oslona-nie-podano"><input type="radio" name="${licznikStopni}-stopien-oslona" id="${licznikStopni}-stopien-oslona-nie-podano" value="" required>Nie podano</label>
        </div>
    `);

    dodajPrzyciskUsun('#stopien-numer-'+licznikStopni);
    focusNaLiczbe(`input[name="${licznikStopni}-liczba-stopni"]`);
};

// TWORZENIE NIESTANDARDOWEGO PRODUKTU
const stworzNowyInny = () => {
    licznikInnych++;

    KONTENER_LISTA_PRODUKTOW.append(`
            <div class="produkt produkt-inny" id="inny-numer-${licznikInnych}">
            <p>INNY NR ${licznikInnych}</p>
            <p>Nazwa:</p>
            <input type="text" name="${licznikInnych}-nazwa-inny" required>
            <p>Ilość:</p>
            <input type="text" name="${licznikInnych}-liczba-inny" required>
            <p>Opis</p>
            <textarea rows="3" cols="50" id="${licznikInnych}-opis-inny"></textarea>
        </div>
    `);

    dodajPrzyciskUsun('#inny-numer-'+licznikInnych);
    focusNaLiczbe(`input[name="${licznikInnych}-nazwa-inny"]`);
};

// DODAWANIE DELETE BUTTONA
const dodajPrzyciskUsun = (selektor) => {
    $(selektor).append(`
        <br>
        <button class="usun-produkt">Usuń produkt</button>
    `);

    $(selektor + ' button.usun-produkt').click(() => {
        $(selektor).remove();

        switch (true) {
            case selektor.startsWith('#stopien'):
                licznikStopni--;
                break;
            case selektor.startsWith('#materac'):
                licznikMateracy--;
                break;
            case selektor.startsWith('#pokrowiec'):
                licznikPokrowcow--;
                break;
            case selektor.startsWith('#polka'):
                licznikPolek--;
                break;
            case selektor.startsWith('#domek'):
                licznikDomkow--;
                break;
            case selektor.startsWith('#inny'):
                licznikInnych--;
                break;
        }
    });
};

// FOCUSOWANIE NA INPUCIE LICZBY POLEK
const focusNaLiczbe = (selektor) => {
    $(selektor).focus();
};

// SPRAWDZENIE, CZY LISTA PRODUKTÓW JEST PUSTA
const sprawdzCzyListaProduktowPusta = () => {
    return !licznikPolek && !licznikDomkow && !licznikMateracy && !licznikPokrowcow && !licznikStopni && !licznikInnych;
};

const drukujPDF = () => {
    drukujDaneOgolne();
    licznikPolek > 0 ? drukujPolki() : console.log('brak polek');
    licznikStopni > 0 ? drukujStopnie() : console.log('brak stopni');
    licznikMateracy > 0 ? drukujMaterace() : console.log('brak materacy');
    licznikPokrowcow > 0 ? drukujPokrowce() : console.log('brak pokrowcow');
    licznikInnych > 0 ? drukujInne() : console.log('brak innych');
    drukujStopke();
};

const drukujDaneOgolne = () => {
    const ZAMAWIAJACY = ZAMAWIAJACY_INPUT.val();
    const KRAJ = $('#kraj-inny').is(':checked') ? $('input[name="kraj-inny-input"]').val() : $('input[name="kraj"]:checked').val();
    const DATA = $('input[name="data-zamowienia"]').val();
    const NUMER = NUMER_ZAMOWIENIA.is(':visible') ? NUMER_ZAMOWIENIA.val() : '';
    const KWOTA = $('input[name="kwota-zamowienia"]').val();
    const WALUTA = $('input#waluta-inna').is(':checked') ? $('input[name="waluta-inna-input"]').val() : $('input[name="waluta"]:checked').val();
    const ZRODLO = $('#zrodlo-inne').is(':checked') ? $('input[name="zrodlo-inne-input"]').val() : $('input[name="zrodlo-zamowienia"]:checked').val();
    const ZAPLACONO = $('#zapytanie-zaplacono-tak').is(':checked') ? $('input[name="zaplacono-data"]').val() : '';

    stworzTabele(
        [['Zamawiający', 'Kraj', 'Data', 'Kwota', 'Waluta']],
        [[ZAMAWIAJACY, KRAJ, DATA, KWOTA, WALUTA]]
    );

    if (NUMER_ZAMOWIENIA.is(':visible')) {
        stworzTabele(
            [['Źródło zamówienia', 'Numer', 'Zapłacono']],
            [[ZRODLO, NUMER, ZAPLACONO]],
            60,
            250
        );
    } else {
        stworzTabele(
            [['Źródło zamówienia', 'Zapłacono']],
            [[ZRODLO, ZAPLACONO]],
            60,
            200
        );
    }
};

const drukujPolki = () => {
    for (let idNumer = 1 ; idNumer <= licznikPolek ; idNumer++) {
        const LICZBA_POLEK = $('input[name="' + idNumer + '-liczba-polek"]').val();
        const KSZTALT = $('input[name="' + idNumer + '-ksztalt"]:checked').val();
        const DLUGOSC = $('input[name="' + idNumer + '-dlugosc"]:checked').val();
        const SYMETRIA = $('input[name="' + idNumer + '-symetria"]:checked').val();
        const STRONA = $('input[name="' + idNumer + '-strona"]:checked').val();
        const MATERAC = $('input[name="' + idNumer + '-polka-materac"]:checked').val();
        const PODSTAWA = $('input[name="' + idNumer + '-polka-podstawa"]:checked').val();

        switch (KSZTALT) {
            case 'Łuk':
            case 'Łuk Podwójny':
                // stworzTabeleProduktu([
                //     {title: 'PÓŁKA', value: 'Sztuk: ' + LICZBA_POLEK},
                //     {title: 'Kształt', value: KSZTALT},
                //     {title: 'Długość', value: DLUGOSC},
                //     {title: 'Materac', value: MATERAC},
                //     {title: 'Podstawa', value: PODSTAWA}
                // ]);
                stworzTabele(
                    [['PÓŁKA', 'Kształt', 'Długość', 'Materac', 'Podstawa']],
                    [['Sztuk: ' + LICZBA_POLEK, KSZTALT, DLUGOSC, MATERAC, PODSTAWA]],
                    60
                );
                break;
            case 'Fala':
                // czyJestFalaWRzedzie = true;
                // stworzTabeleProduktu([
                //     {title: 'PÓŁKA', value: 'Sztuk: ' + LICZBA_POLEK},
                //     {title: 'Kształt', value: KSZTALT},
                //     {title: 'Długość', value: DLUGOSC},
                //     {title: 'Symetria', value: SYMETRIA},
                //     {title: 'Strona', value: STRONA},
                //     {title: 'Materac', value: MATERAC},
                //     {title: 'Podstawa', value: PODSTAWA}
                // ]);
                stworzTabele(
                    [['PÓŁKA', 'Kształt', 'Długość', 'Symetria', 'Strona', 'Materac', 'Podstawa']],
                    [['Sztuk: ' + LICZBA_POLEK, KSZTALT, DLUGOSC, SYMETRIA, STRONA, MATERAC, PODSTAWA]],
                    60
                );
                break;
        }
    }
};

const drukujStopnie = () => {
    for (let idNumer = 1 ; idNumer <= licznikStopni ; idNumer++) {
        const LICZBA_STOPNI = $('input[name="' + idNumer + '-liczba-stopni"]').val();
        const FILC = $('input[name="' + idNumer + '-stopien-filc"]:checked').val();
        const PLATFORMA = $('input[name="' + idNumer + '-stopien-platforma"]:checked').val();
        const OSLONA = $('input[name="' + idNumer + '-stopien-oslona"]:checked').val();
        // stworzTabeleProduktu([
        //     {title: 'STOPIEŃ', value: 'Sztuk: ' + LICZBA_STOPNI},
        //     {title: 'Filc', value: FILC},
        //     {title: 'Platforma', value: PLATFORMA},
        //     {title: 'Osłona', value: OSLONA}
        // ]);
        stworzTabele(
            [['STOPIEŃ', 'Filc', 'Platforma', 'Osłona']],
            [['Sztuk: ' + LICZBA_STOPNI, FILC, PLATFORMA, OSLONA]],
            60
        );
    }
};

const drukujMaterace = () => {
    for (let idNumer = 1 ; idNumer <= licznikMateracy ; idNumer++) {
        const LICZBA_MATERACY = $('input[name="' + idNumer + '-liczba-materacy"]').val();
        const DLUGOSC = $('input[name="' + idNumer + '-dlugosc-materac"]:checked').val();
        const KOLOR = $('input[name="' + idNumer + '-materac"]:checked').val();
        // stworzTabeleProduktu([
        //     {title: 'MATERAC', value: 'Sztuk: ' + LICZBA_MATERACY},
        //     {title: 'Długość', value: DLUGOSC},
        //     {title: 'Kolor', value: KOLOR}
        // ]);
        stworzTabele(
            [['MATERAC', 'Długość', 'Kolor']],
            [['Sztuk: ' + LICZBA_MATERACY, DLUGOSC, KOLOR]],
            60
        );
    }
};

const drukujPokrowce = () => {
    for (let idNumer = 1 ; idNumer <= licznikPokrowcow ; idNumer++) {
        const LICZBA_POKROWCOW = $('input[name="' + idNumer + '-liczba-pokrowcow"]').val();
        const DLUGOSC = $('input[name="' + idNumer + '-dlugosc-pokrowiec"]:checked').val();
        const KOLOR = $('input[name="' + idNumer + '-pokrowiec"]:checked').val();
        // stworzTabeleProduktu([
        //     {title: 'POKROWIEC', value: 'Sztuk: ' + LICZBA_POKROWCOW},
        //     {title: 'Długość', value: DLUGOSC},
        //     {title: 'Kolor', value: KOLOR}
        // ]);
        stworzTabele(
            [['POKROWIEC', 'Długość', 'Kolor']],
            [['Sztuk: ' + LICZBA_POKROWCOW, DLUGOSC, KOLOR]],
            60
        );
    }
};

const drukujInne = () => {
    for (let idNumer = 1 ; idNumer <= licznikInnych ; idNumer++) {
        const NAZWA = $('input[name="' + idNumer + '-nazwa-inny"]').val();
        const LICZBA = $('input[name="' + idNumer + '-liczba-inny"]').val();
        const OPIS = $('#' + idNumer + '-opis-inny').val();
        // stworzTabele(
        //     [[NAZWA]],
        //     [['Sztuk: ' + LICZBA], [OPIS]],
        //     false,
        //     240,
        //     biezacyLewyMargines,
        //     false
        // );
        stworzTabele(
            [[NAZWA, 'Opis']],
            [['Sztuk: ' + LICZBA, OPIS]],
            60
        );
        // skorygujPolozenieTabeli();
    }
};

const drukujStopke = () => {
    const UWAGI_DO_ZAMOWIENIA = $('#uwagi-do-zamowienia').val();
    const DATA_WYSLAC_DO_DNIA = $('#zapytanie-zaplacono-tak').is(':checked') ? DATEPICKER_WYSLAC_DO_DNIA.val() : '';
    biezacaWysokosc = 530;

    stworzTabele(
        [['Uwagi do zamówienia']],
        [[UWAGI_DO_ZAMOWIENIA]],
        false,
        false,
        false,
        160
    );

    stworzTabele(
        [['Wysłać do dnia', 'Waga paczki', 'Wysłano dnia', 'Przewoźnik']],
        [[DATA_WYSLAC_DO_DNIA, '', '', '']],
        200,
        300
    );

    if (EXPORT_RADIO_TAK.is(':checked')) {
        stworzTabele(
            [['Export']],
            [['']],
            0,
            100,
            450
        );
    }
};

const stworzTabele = (zbiorHead, zbiorBody, wzrostWysokosci, tableWidth, lewyMargines, wysokoscKomorki) => {
    biezacaWysokosc += wzrostWysokosci || 0;
    PDF.autoTable({
        head: zbiorHead,
        body: zbiorBody,
        theme: 'plain',
        styles: {
            font: 'Roboto-Regular',
            fontSize: 12,
            lineColor: 0,
            lineWidth: 1
        },
        startY: biezacaWysokosc,
        tableWidth: tableWidth || 490,
        margin: { left: lewyMargines || 60 },
        headStyles: {
            font: 'Roboto-Bold',
            fontStyle: 'bold'
        },
        bodyStyles: {
            minCellHeight: wysokoscKomorki || 0
        }
    });
};

// const stworzTabeleProduktu = (zbiorBody) => {
//     PDF.autoTable({
//         theme: 'plain',
//         startY: biezacaWysokosc,
//         styles: {
//             font: 'Roboto-Regular',
//             fontSize: 12,
//             lineColor: 0,
//             lineWidth: 1
//         },
//         tableWidth: 240,
//         columnStyles: {
//             title: {
//                 font: 'Roboto-Bold',
//                 fontStyle: 'bold'
//             },
//             value: {
//                 cellWidth: 140
//             }
//         },
//         body: zbiorBody,
//         margin: { left: biezacyLewyMargines },
//         columns: [
//             { dataKey: 'title' },
//             { dataKey: 'value' }
//         ]
//     });
//     skorygujPolozenieTabeli();
// };

// const skorygujPolozenieTabeli = () => {
//     switch (biezacyLewyMargines) {
//         case 60:
//             biezacyLewyMargines = 310;
//             break;
//         case 310:
//             biezacyLewyMargines = 60;
//             czyJestFalaWRzedzie ? biezacaWysokosc += 180 : biezacaWysokosc += 132;
//             czyJestFalaWRzedzie = false;
//             break;
//     }
// };

// CZYSZCZENIE DANYCH OPERACYJNYCH DO GENEROWANIA PDF
const wyczyscDaneOperacyjnePDF = () => {
    biezacyLewyMargines = 60;
    biezacaWysokosc = 50;
    // czyJestFalaWRzedzie = false;
};

// GENEROWANIE DZISIEJSZEJ DATY
const dzisiejszaData = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //Styczeń to 0!
    const yy = String(today.getFullYear()).substr(-2);

    return yy + mm + dd;
};

if (BUTTON_TESTOWY.length) {
    BUTTON_TESTOWY.click(() => {
        drukujPDF();
        PDF.save('Zamówienie ' + dzisiejszaData() + ' ' + ZAMAWIAJACY_INPUT.val());
        wyczyscDaneOperacyjnePDF();
        PDF = new jsPDF('p', 'pt');
    });
}

// SUBMIT
MAIN_FORM.submit((event) => {
    event.preventDefault();
    if (sprawdzCzyListaProduktowPusta()) {
        alert('Brak wybranych produktów!');
        return;
    }
    drukujPDF();
    PDF.save('Zamówienie ' + dzisiejszaData() + ' ' + ZAMAWIAJACY_INPUT.val());
    wyczyscDaneOperacyjnePDF();
    PDF = new jsPDF('p', 'pt');
});
