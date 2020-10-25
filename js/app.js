window.jsPDF = window.jspdf.jsPDF;

const MAIN_FORM = $('form');
const BUTTON_DODAJ_PRODUKT = $('button#produkt-dodaj');
const BUTTON_WYCZYSC_PRODUKTY = $('button#wyczysc-produkty');
const BUTTON_TESTOWY = $('#testbutton');
const DATEPICKER_ZAPLACONO = $('input[name="zaplacono-data"]');
const DATEPICKER_DATA_ZAMOWIENIA = $('input[name="data-zamowienia"]');
const DATEPICKER_WYSLAC_DO_DNIA = $('input[name="data-wyslac-do-dnia"]');
const KONTENER_LISTA_PRODUKTOW = $('div.lista-produktow');
const KONTENER_NUMER_ZAMOWIENIA = $('div.kontener-numer-zamowienia');
const NUMER_ZAMOWIENIA = $('input[name="numer-zamowienia"]');
const ZRODLO_RADIO_BUTTONY = $('input[name="zrodlo-zamowienia"]');
const WALUTA_RADIO_BUTTONY = $('input[name="waluta"]');
const WALUTA_INNA_INPUT = $('input[name="waluta-inna-input"]');
const KRAJ_RADIO_BUTTONY = $('input[name="kraj"]');
const KRAJ_INNY_INPUT = $('input[name="kraj-inny-input"]');
const EXPORT_CHECKBOX = $('input[name="export-checkbox"]');

// DANE OPERACYJNE (DO RENDEROWANIA PRODUKTÓW NA STRONIE)
let licznikPolek = 0;
let licznikDomkow = 0;
let licznikMateracy = 0;
let licznikStopni = 0;

// DANE OPERACYJNE (DO RENDEROWANIA PDF)
let PDF = new jsPDF('p', 'pt');

let biezacaWysokosc = 50;
let biezacyLewyMargines = 60;
let czyJestFalaWRzedzie = false;

// PRZYPISANIE WALUTY DO ZRODLA ZAMOWIENIA
ZRODLO_RADIO_BUTTONY.change((event) => {
    switch (event.target.id) {
        case 'ebay-us':
        case 'amazon':
            $('#usd').prop('checked', 'true');
            break;
        case 'etsy':
        case 'ebay-de':
        case '4mypet':
            $('#eur').prop('checked', 'true');
            break;
        case '4mypetshop':
        case 'allegro':
            $('#pln').prop('checked', 'true');
            break;
        case 'ebay-uk':
            $('#gbp').prop('checked', 'true');
            break;
    }
    WALUTA_INNA_INPUT.prop('disabled', true);

    if (event.target.id === '4mypet' || event.target.id === '4mypetshop') {
        KONTENER_NUMER_ZAMOWIENIA.show();
        NUMER_ZAMOWIENIA.prop('required', 'true');
    } else {
        KONTENER_NUMER_ZAMOWIENIA.hide();
        NUMER_ZAMOWIENIA.removeAttr('required');
    }
});

// OZYWIENIE PRZYCISKÓW 'WALUTA'
WALUTA_RADIO_BUTTONY.change(() => {
    $('input#waluta-inna').is(':checked') ? WALUTA_INNA_INPUT.prop('disabled', false) : WALUTA_INNA_INPUT.prop('disabled', true);
});

// OZYWIENIE PRZYCISKÓW 'KRAJ'
KRAJ_RADIO_BUTTONY.change((event) => {
    $('input#kraj-inny').is(':checked') ? KRAJ_INNY_INPUT.prop('disabled', false) : KRAJ_INNY_INPUT.prop('disabled', true);

    switch (event.target.id) {
        case 'usa':
        case 'au':
        case 'ca':
            EXPORT_CHECKBOX.prop('checked', true);
            break;
        default:
            EXPORT_CHECKBOX.prop('checked', false);
            break;
    }
});

// TWORZENIE NOWEJ POLKI
const stworzNowaPolke = () => {
    licznikPolek++;

    KONTENER_LISTA_PRODUKTOW.append(`
        <div class="produkt produkt-polka" id="polka-numer-${licznikPolek}">
            <p>PÓŁKA NR ${licznikPolek}</p>
            <p>Liczba półek</p>
            <input type="text" name="${licznikPolek}-liczba-polek" value="1" required>
            <br>
        </div>
    `);
    renderujKsztalt(licznikPolek);
    dodajPrzyciskUsun('#polka-numer-'+licznikPolek);
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
            `);
            break;
        case 'Łuk Podwójny':
            kontenerAtrybutow.append(`
                <p>Długość</p>
                <label for="${idNumer}-dlugosc-100"><input type="radio" name="${idNumer}-dlugosc" id="${idNumer}-dlugosc-100" value="100 cm" required checked>100 cm</label>
            `);
            break;
        case 'Fala':
            kontenerAtrybutow.append(`
                <p>Długość</p>
                <label for="${idNumer}-dlugosc-75"><input type="radio" name="${idNumer}-dlugosc" id="${idNumer}-dlugosc-75" value="75 cm" required>75 cm</label>
                <label for="${idNumer}-dlugosc-95"><input type="radio" name="${idNumer}-dlugosc" id="${idNumer}-dlugosc-95" value="95 cm" required>95 cm</label>
                <label for="${idNumer}-dlugosc-100"><input type="radio" name="${idNumer}-dlugosc" id="${idNumer}-dlugosc-100" value="100 cm" required>100 cm</label>
                <p>Symetria</p>
                <label for="${idNumer}-symetryczna"><input type="radio" name="${idNumer}-symetria" id="${idNumer}-symetryczna" value="Symetryczna">Symetryczna</label>
                <label for="${idNumer}-asymetryczna"><input type="radio" name="${idNumer}-symetria" id="${idNumer}-asymetryczna" value="Asymetryczna">Asymetryczna</label>
                <p>Strona</p>
                <label for="${idNumer}-lewa"><input type="radio" name="${idNumer}-strona" id="${idNumer}-lewa" value="Lewa">Lewa</label>
                <label for="${idNumer}-prawa"><input type="radio" name="${idNumer}-strona" id="${idNumer}-prawa" value="Prawa">Prawa</label>
        `);
            break;
    }
    renderujReszte(idNumer);
};

const renderujReszte = (idNumer) => {
    $('#atrybuty-polki-' + idNumer).append(`
        <p>Materac</p>
        <label for="${idNumer}-polka-materac-kremowy"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-kremowy" value="Kremowy">Kremowy</label>
        <label for="${idNumer}-polka-materac-bezowy"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-bezowy" value="Beżowy">Beżowy</label>
        <label for="${idNumer}-polka-materac-brazowy"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-brazowy" value="Brązowy">Brązowy</label>
        <label for="${idNumer}-polka-materac-czekoladowy"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-czekoladowy" value="Czekoladowy">Czekoladowy</label>
        <label for="${idNumer}-polka-materac-fioletowy"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-fioletowy" value="Fioletowy">Fioletowy</label>
        <label for="${idNumer}-polka-materac-czerwony"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-czerwony" value="Czerwony">Czerwony</label>
        <label for="${idNumer}-polka-materac-granatowy"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-granatowy" value="Granatowy">Granatowy</label>
        <label for="${idNumer}-polka-materac-popielaty"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-popielaty" value="Popielaty">Popielaty</label>
        <label for="${idNumer}-polka-materac-antracytowy"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-antracytowy" value="Antracytowy">Antracytowy</label>
        <label for="${idNumer}-polka-materac-czarny"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-czarny" value="Czarny">Czarny</label>
        <label for="${idNumer}-polka-materac-cappuccino"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-cappuccino" value="Cappucinno">Cappucinno</label>
        <p>Podstawa</p>
        <label for="${idNumer}-polka-podstawa-kremowy"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-kremowy" value="Kremowy">Kremowy</label>
        <label for="${idNumer}-polka-podstawa-bezowy"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-bezowy" value="Beżowy">Beżowy</label>
        <label for="${idNumer}-polka-podstawa-brazowy"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-brazowy" value="Brązowy">Brązowy</label>
        <label for="${idNumer}-polka-podstawa-czekoladowy"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-czekoladowy" value="Czekoladowy">Czekoladowy</label>
        <label for="${idNumer}-polka-podstawa-fioletowy"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-fioletowy" value="Fioletowy">Fioletowy</label>
        <label for="${idNumer}-polka-podstawa-czerwony"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-czerwony" value="Czerwony">Czerwony</label>
        <label for="${idNumer}-polka-podstawa-granatowy"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-granatowy" value="Granatowy">Granatowy</label>
        <label for="${idNumer}-polka-podstawa-popielaty"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-popielaty" value="Popielaty">Popielaty</label>
        <label for="${idNumer}-polka-podstawa-antracytowy"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-antracytowy" value="Antracytowy">Antracytowy</label>
        <label for="${idNumer}-polka-podstawa-czarny"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-czarny" value="Czarny">Czarny</label>
        <label for="${idNumer}-polka-podstawa-cappuccino"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-cappuccino" value="Cappucinno">Cappucinno</label>
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
            <p>Liczba materacy</p>
            <input type="text" name="${licznikMateracy}-liczba-materacy" value="1" required>
            <p>Długość</p>
            <label for="${licznikMateracy}-dlugosc-60-materac"><input type="radio" name="${licznikMateracy}-dlugosc-materac" id="${licznikMateracy}-dlugosc-60-materac" value="60 cm" required>60 cm</label>
            <label for="${licznikMateracy}-dlugosc-75-materac"><input type="radio" name="${licznikMateracy}-dlugosc-materac" id="${licznikMateracy}-dlugosc-75-materac" value="75 cm" required>75 cm</label>
            <label for="${licznikMateracy}-dlugosc-95-materac"><input type="radio" name="${licznikMateracy}-dlugosc-materac" id="${licznikMateracy}-dlugosc-95-materac" value="95 cm" required>95 cm</label>
            <label for="${licznikMateracy}-dlugosc-100-materac"><input type="radio" name="${licznikMateracy}-dlugosc-materac" id="${licznikMateracy}-dlugosc-100-materac" value="100 cm" required>100 cm</label>
            <p>Kolor</p>
            <label for="${licznikMateracy}-materac-kremowy"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-kremowy" value="Kremowy">Kremowy</label>
            <label for="${licznikMateracy}-materac-bezowy"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-bezowy" value="Beżowy">Beżowy</label>
            <label for="${licznikMateracy}-materac-brazowy"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-brazowy" value="Brązowy">Brązowy</label>
            <label for="${licznikMateracy}-materac-czekoladowy"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-czekoladowy" value="Czekoladowy">Czekoladowy</label>
            <label for="${licznikMateracy}-materac-fioletowy"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-fioletowy" value="Fioletowy">Fioletowy</label>
            <label for="${licznikMateracy}-materac-czerwony"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-czerwony" value="Czerwony">Czerwony</label>
            <label for="${licznikMateracy}-materac-granatowy"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-granatowy" value="Granatowy">Granatowy</label>
            <label for="${licznikMateracy}-materac-popielaty"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-popielaty" value="Popielaty">Popielaty</label>
            <label for="${licznikMateracy}-materac-antracytowy"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-antracytowy" value="Antracytowy">Antracytowy</label>
            <label for="${licznikMateracy}-materac-czarny"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-czarny" value="Czarny">Czarny</label>
            <label for="${licznikMateracy}-materac-cappuccino"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-cappuccino" value="Cappucinno">Cappucinno</label>
        </div>
    `);

    dodajPrzyciskUsun('#materac-numer-'+licznikMateracy);
};

// TWORZENIE NOWEGO STOPNIA
const stworzNowyStopien = () => {
    licznikStopni++;

    KONTENER_LISTA_PRODUKTOW.append(`
        <div class="produkt produkt-stopien" id="stopien-numer-${licznikStopni}">
            <p>STOPIEŃ NR ${licznikStopni}</p>
            <p>Liczba stopni</p>
            <input type="text" name="${licznikStopni}-liczba-stopni" value="1" required>
            <p>Filc</p>
            <label for="${licznikStopni}-stopien-filc-kremowy"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-kremowy" value="Kremowy">Kremowy</label>
            <label for="${licznikStopni}-stopien-filc-bezowy"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-bezowy" value="Beżowy">Beżowy</label>
            <label for="${licznikStopni}-stopien-filc-szaryjasny"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-szaryjasny" value="Jasny szary">Jasny szary</label>
            <label for="${licznikStopni}-stopien-filc-szaryciemny"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-szaryciemny" value="Ciemny szary">Ciemny szary</label>
            <label for="${licznikStopni}-stopien-filc-czarny"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-czarny" value="Czarny">Czarny</label>
            <label for="${licznikStopni}-stopien-filc-burgundowy"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-burgundowy" value="Burgundowy">Burgundowy</label>
            <label for="${licznikStopni}-stopien-filc-niebieski"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-niebieski" value="Kobaltowy">Kobaltowy niebieski</label>
            <label for="${licznikStopni}-stopien-filc-pomaranczowy"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-pomaranczowy" value="Pomarańczowy">Pomarańczowy</label>
            <p>Platforma</p>
            <label for="${licznikStopni}-stopien-platforma-bialy"><input type="radio" name="${licznikStopni}-stopien-platforma" id="${licznikStopni}-stopien-platforma-bialy" value="Biały">Biały</label>
            <label for="${licznikStopni}-stopien-platforma-szary"><input type="radio" name="${licznikStopni}-stopien-platforma" id="${licznikStopni}-stopien-platforma-szary" value="Szary">Szary</label>
            <label for="${licznikStopni}-stopien-platforma-karmelowy"><input type="radio" name="${licznikStopni}-stopien-platforma" id="${licznikStopni}-stopien-platforma-karmelowy" value="Karmelowy">Karmelowy</label>
            <label for="${licznikStopni}-stopien-platforma-brazowy"><input type="radio" name="${licznikStopni}-stopien-platforma" id="${licznikStopni}-stopien-platforma-brazowy" value="Brązowy">Brązowy</label>
            <label for="${licznikStopni}-stopien-platforma-czarny"><input type="radio" name="${licznikStopni}-stopien-platforma" id="${licznikStopni}-stopien-platforma-czarny" value="Czarny">Czarny</label>
            <p>Osłona</p>
            <label for="${licznikStopni}-stopien-oslona-bialy"><input type="radio" name="${licznikStopni}-stopien-oslona" id="${licznikStopni}-stopien-oslona-bialy" value="Biały">Biały</label>
            <label for="${licznikStopni}-stopien-oslona-szary"><input type="radio" name="${licznikStopni}-stopien-oslona" id="${licznikStopni}-stopien-oslona-szary" value="Szary">Szary</label>
            <label for="${licznikStopni}-stopien-oslona-karmelowy"><input type="radio" name="${licznikStopni}-stopien-oslona" id="${licznikStopni}-stopien-oslona-karmelowy" value="Karmelowy">Karmelowy</label>
            <label for="${licznikStopni}-stopien-oslona-brazowy"><input type="radio" name="${licznikStopni}-stopien-oslona" id="${licznikStopni}-stopien-oslona-brazowy" value="Brązowy">Brązowy</label>
            <label for="${licznikStopni}-stopien-oslona-czarny"><input type="radio" name="${licznikStopni}-stopien-oslona" id="${licznikStopni}-stopien-oslona-czarny" value="Czarny">Czarny</label>
        </div>
    `);

    dodajPrzyciskUsun('#stopien-numer-'+licznikStopni);
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
            case selektor.startsWith('#polka'):
                licznikPolek--;
                break;
            case selektor.startsWith('#domek'):
                licznikDomkow--;
                break;
        }
    });
};

const drukujPDF = () => {
    drukujDaneOgolne();
    licznikPolek > 0 ? drukujPolki() : console.log('brak polek');
    licznikStopni > 0 ? drukujStopnie() : console.log('brak stopni');
    licznikMateracy > 0 ? drukujMaterace() : console.log('brak materacy');
    drukujStopke();
};

const drukujDaneOgolne = () => {
    const ZAMAWIAJACY = $('#zamawiajacy').val();
    const KRAJ = $('#kraj-inny').is(':checked') ? $('input[name="kraj-inny-input"]').val() : $('input[name="kraj"]:checked').val();
    const DATA = $('input[name="data-zamowienia"]').val();
    const NUMER = NUMER_ZAMOWIENIA.is(':visible') ? NUMER_ZAMOWIENIA.val() : '';
    const KWOTA = $('input[name="kwota-zamowienia"]').val();
    const WALUTA = $('input#waluta-inna').is(':checked') ? $('input[name="waluta-inna-input"]').val() : $('input[name="waluta"]:checked').val();
    const ZRODLO = $('input[name="zrodlo-zamowienia"]:checked').val();
    const ZAPLACONO = $('input[name="zaplacono-data"]').val() || '';
    const ZAPYTANIE = $('input[name="zapytanie-telefon-dodatki"]').is(':checked') ? 'TAK' : 'NIE';
    const LISTA_EXPRESS = $('input[name="lista-express"]').is(':checked') ? 'TAK' : 'NIE';

    if (NUMER) {
        stworzTabele(
            [['Zamawiający', 'Kraj', 'Data', 'Numer', 'Kwota', 'Waluta']],
            [[ZAMAWIAJACY, KRAJ, DATA, NUMER, KWOTA, WALUTA]]
        );
    } else {
        stworzTabele(
            [['Zamawiający', 'Kraj', 'Data', 'Kwota', 'Waluta']],
            [[ZAMAWIAJACY, KRAJ, DATA, KWOTA, WALUTA]]
        );
    }
    stworzTabele(
        [['Źródło zamówienia', 'Zapłacono', 'Zapytanie o telefon/dodatki', 'Lista express']],
        [[ZRODLO, ZAPLACONO, ZAPYTANIE, LISTA_EXPRESS]],
        60
    );

    biezacaWysokosc += 60;
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
                stworzTabeleProduktu([
                    {title: 'PÓŁKA', value: 'Sztuk: ' + LICZBA_POLEK},
                    {title: 'Kształt', value: KSZTALT},
                    {title: 'Długość', value: DLUGOSC},
                    {title: 'Materac', value: MATERAC},
                    {title: 'Podstawa', value: PODSTAWA}
                ]);
                break;
            case 'Fala':
                czyJestFalaWRzedzie = true;
                stworzTabeleProduktu([
                    {title: 'PÓŁKA ' + idNumer, value: 'Sztuk: ' + LICZBA_POLEK},
                    {title: 'Kształt', value: KSZTALT},
                    {title: 'Długość', value: DLUGOSC},
                    {title: 'Symetria', value: SYMETRIA},
                    {title: 'Strona', value: STRONA},
                    {title: 'Materac', value: MATERAC},
                    {title: 'Podstawa', value: PODSTAWA}
                ]);
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
        stworzTabeleProduktu([
            {title: 'STOPIEŃ', value: 'Sztuk: ' + LICZBA_STOPNI},
            {title: 'Filc', value: FILC},
            {title: 'Platforma', value: PLATFORMA},
            {title: 'Osłona', value: OSLONA}
        ]);
    }
};

const drukujMaterace = () => {
    for (let idNumer = 1 ; idNumer <= licznikMateracy ; idNumer++) {
        const LICZBA_MATERACY = $('input[name="' + idNumer + '-liczba-materacy"]').val();
        const DLUGOSC = $('input[name="' + idNumer + '-dlugosc-materac"]:checked').val();
        const KOLOR = $('input[name="' + idNumer + '-materac"]:checked').val();
        stworzTabeleProduktu([
            {title: 'MATERAC', value: 'Sztuk: ' + LICZBA_MATERACY},
            {title: 'Długość', value: DLUGOSC},
            {title: 'Kolor', value: KOLOR}
        ]);
    }
};

const drukujStopke = () => {
    const UWAGI_DO_ZAMOWIENIA = $('#uwagi-do-zamowienia').val() || '\n \n \n';
    const DATA_WYSLAC_DO_DNIA = $('input[name="data-wyslac-do-dnia"]').val();
    biezacaWysokosc = 630;

    stworzTabele(
        [['Uwagi do zamówienia']],
        [[UWAGI_DO_ZAMOWIENIA]]
    );
    stworzTabele(
        [['Wysłać do dnia', 'Waga paczki', 'Wysłano dnia', 'Przewoźnik']],
        [[DATA_WYSLAC_DO_DNIA, '', '', '']],
        100,
        300
    );

    if (EXPORT_CHECKBOX.is(':checked')) {
        stworzTabele(
            [['Export']],
            [['']],
            0,
            100,
            450
        );
    }
};

const stworzTabele = (zbiorHead, zbiorBody, wzrostWysokosci, tableWidth, lewyMargines) => {
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
        }
    });
};

const stworzTabeleProduktu = (zbiorBody) => {
    PDF.autoTable({
        theme: 'plain',
        startY: biezacaWysokosc,
        styles: {
            font: 'Roboto-Regular',
            fontSize: 12,
            lineColor: 0,
            lineWidth: 1
        },
        tableWidth: 160,
        columnStyles: { title: { font: 'Roboto-Bold', fontStyle: 'bold' } }, // European countries centered
        body: zbiorBody,
        margin: { left: biezacyLewyMargines },
        columns: [
            { dataKey: 'title' },
            { dataKey: 'value' }
        ]
    });
    skorygujPolozenieTabeli();
};

const skorygujPolozenieTabeli = () => {
    switch (biezacyLewyMargines) {
        case 60:
            biezacyLewyMargines = 225;
            break;
        case 225:
            biezacyLewyMargines = 390;
            break;
        case 390:
            biezacyLewyMargines = 60;
            czyJestFalaWRzedzie ? biezacaWysokosc += 180 : biezacaWysokosc += 132;
            czyJestFalaWRzedzie = false;
            break;
    }
};

// DATEPICKER KONFIGURACJA
$.datepicker.setDefaults({
    dateFormat: 'd-m-yy',
    dayNamesMin: ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'],
    firstDay: 1,
    showOtherMonths: true,
    monthNames: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień']
});

// DATA ZAMOWIENIA
DATEPICKER_DATA_ZAMOWIENIA.datepicker();

// ZAPLACONO - DATA
DATEPICKER_ZAPLACONO.datepicker();

// WYSŁAĆ DO DNIA
DATEPICKER_WYSLAC_DO_DNIA.datepicker();

// GENEROWANIE PRODUKTU
BUTTON_DODAJ_PRODUKT.click((event) => {
    event.preventDefault();

    const radioProdukt = $('input[name="produkt"]:checked').val();
    switch (radioProdukt) {
        case 'Półka':
            stworzNowaPolke();
            break;
        case 'Stopień':
            stworzNowyStopien();
            break;
        case 'Materac':
            stworzNowyMaterac();
            break;
        case 'Domek':
            stworzNowyDomek();
            break;
    }
});

// CZYSZCZENIE DANYCH OPERACYJNYCH DO GENEROWANIA PDF
const wyczyscDaneOperacyjnePDF = () => {
    biezacyLewyMargines = 60;
    biezacaWysokosc = 50;
    czyJestFalaWRzedzie = false;
};

// CZYSZCZENIE DANYCH OPERACYJNYCH DO GENEROWANIA PRODUKTOW HTML
const wyczyscDaneOperacyjneHTML = () => {
    licznikMateracy = licznikPolek = licznikStopni = licznikDomkow = 0;
};

const dzisiejszaData = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();

    return yyyy + mm + dd;
};

// CZYSZCZENIE LISTY PRODUKTÓW
BUTTON_WYCZYSC_PRODUKTY.click((event) => {
    event.preventDefault();
    wyczyscDaneOperacyjnePDF();
    wyczyscDaneOperacyjneHTML();
    $('.produkt').remove();
});

if (BUTTON_TESTOWY.length) {
    BUTTON_TESTOWY.click(() => {
        drukujPDF();
        PDF.save('Zamowienie_' + dzisiejszaData());
        wyczyscDaneOperacyjnePDF();
        PDF = new jsPDF('p', 'pt');
    });
}

// SUBMIT
MAIN_FORM.submit((event) => {
    event.preventDefault();
    drukujPDF();
    PDF.save('Zamowienie_' + dzisiejszaData());
    wyczyscDaneOperacyjnePDF();
    PDF = new jsPDF('p', 'pt');
});
