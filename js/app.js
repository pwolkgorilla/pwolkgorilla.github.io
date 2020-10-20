window.jsPDF = window.jspdf.jsPDF;

const MAIN_FORM = $('form');
const BUTTON_DODAJ_PRODUKT = $('button#produkt-dodaj');
const BUTTON_WYCZYSC_PRODUKTY = $('button#wyczysc-produkty');
const CHECKBOX_ZAPLACONO = $('#zaplacono');
const DATEPICKER_ZAPLACONO = $('input[name="zaplacono-data"]');
const DATEPICKER_DATA_ZAMOWIENIA = $('input[name="data-zamowienia"]');
const DATEPICKER_WYSLAC_DO_DNIA = $('input[name="data-wyslac-do-dnia"]');
const KONTENER_LISTA_PRODUKTOW = $('div.lista-produktow');

// DANE OPERACYJNE (DO RENDEROWANIA PRODUKTÓW NA STRONIE)
let licznikPolek = 0;
let licznikDomkow = 0;
let licznikMateracy = 0;
let licznikStopni = 0;

// DANE OPERACYJNE (DO RENDEROWANIA PDF)
let PDF = new jsPDF('p', 'pt');

let biezacaWysokosc = 180;
let biezacyLewyMargines = 60;
let czyJestFalaWRzedzie = false;

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
                <label for="${idNumer}-symetryczna"><input type="radio" name="${idNumer}-symetria" id="${idNumer}-symetryczna" value="Symetryczna" required>Symetryczna</label>
                <label for="${idNumer}-asymetryczna"><input type="radio" name="${idNumer}-symetria" id="${idNumer}-asymetryczna" value="Asymetryczna" required>Asymetryczna</label>
                <p>Strona</p>
                <label for="${idNumer}-lewa"><input type="radio" name="${idNumer}-strona" id="${idNumer}-lewa" value="Lewa" required>Lewa</label>
                <label for="${idNumer}-prawa"><input type="radio" name="${idNumer}-strona" id="${idNumer}-prawa" value="Prawa" required>Prawa</label>
        `);
            break;
    }
    renderujReszte(idNumer);
};

const renderujReszte = (idNumer) => {
    $('#atrybuty-polki-' + idNumer).append(`
        <p>Materac</p>
        <label for="${idNumer}-polka-materac-czerwony"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-czerwony" value="Czerwony" required>Czerwony</label>
        <label for="${idNumer}-polka-materac-niebieski"><input type="radio" name="${idNumer}-polka-materac" id="${idNumer}-polka-materac-niebieski" value="Niebieski" required>Niebieski</label>
        <p>Podstawa</p>
        <label for="${idNumer}-polka-podstawa-czerwony"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-czerwony" value="Czerwona" required>Czerwona</label>
        <label for="${idNumer}-polka-podstawa-niebieski"><input type="radio" name="${idNumer}-polka-podstawa" id="${idNumer}-polka-podstawa-niebieski" value="Niebieska" required>Niebieska</label>
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
            <label for="${licznikMateracy}-materac-czerwony"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-czerwony" value="Czerwony" required>Czerwony</label>
            <label for="${licznikMateracy}-materac-niebieski"><input type="radio" name="${licznikMateracy}-materac" id="${licznikMateracy}-materac-niebieski" value="Niebieski" required>Niebieski</label>
        </div>
    `);
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
            <label for="${licznikStopni}-stopien-filc-czerwony"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-czerwony" value="Czerwony" required>Czerwony</label>
            <label for="${licznikStopni}-stopien-filc-niebieski"><input type="radio" name="${licznikStopni}-stopien-filc" id="${licznikStopni}-stopien-filc-niebieski" value="Niebieski" required>Niebieski</label>
            <p>Platforma</p>
            <label for="${licznikStopni}-stopien-platforma-czerwony"><input type="radio" name="${licznikStopni}-stopien-platforma" id="${licznikStopni}-stopien-platforma-czerwony" value="Czerwony" required>Czerwony</label>
            <label for="${licznikStopni}-stopien-platforma-niebieski"><input type="radio" name="${licznikStopni}-stopien-platforma" id="${licznikStopni}-stopien-platforma-niebieski" value="Niebieski" required>Niebieski</label>
            <p>Osłona</p>
            <label for="${licznikStopni}-stopien-oslona-czerwony"><input type="radio" name="${licznikStopni}-stopien-oslona" id="${licznikStopni}-stopien-oslona-czerwony" value="Czerwony" required>Czerwony</label>
            <label for="${licznikStopni}-stopien-oslona-niebieski"><input type="radio" name="${licznikStopni}-stopien-oslona" id="${licznikStopni}-stopien-oslona-niebieski" value="Niebieski" required>Niebieski</label>
        </div>
    `);
};

// ZAPŁACONO
CHECKBOX_ZAPLACONO.change(() => {
    if (CHECKBOX_ZAPLACONO.prop('checked')) {
        DATEPICKER_ZAPLACONO.prop('disabled', false);
    } else {
        DATEPICKER_ZAPLACONO.prop('disabled', true);
    }
});

// DATEPICKER KONFIGURACJA
$.datepicker.setDefaults({
    dateFormat: 'd-m-yy',
    dayNamesMin: ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'],
    firstDay: 1,
    showOtherMonths: true,
    monthNames: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień']
});

const drukujPDF = () => {
    drukujDaneOgolne();
    licznikPolek > 0 ? drukujPolki() : console.log('brak polek');
    licznikStopni > 0 ? drukujStopnie() : console.log('brak stopni');
    licznikMateracy > 0 ? drukujMaterace() : console.log('brak materacy');
    drukujStopke();
};

const drukujDaneOgolne = () => {
    const ZAMAWIAJACY = $('#zamawiajacy').val();
    const KRAJ = $('input[name="kraj"]:checked').val();
    const DATA = $('input[name="data-zamowienia"]').val();
    const NUMER = $('input[name="numer-zamowienia"]').val();
    const WALUTA = $('input[name="waluta"]:checked').val();
    const ZRODLO = $('input[name="zrodlo-zamowienia"]:checked').val();
    const ZAPLACONO = $('input[name="zaplacono"]').is(':checked') ? $('input[name="zaplacono-data"]').val() : '_______';
    const ZAPYTANIE = $('input[name="zapytanie-telefon-dodatki"]').is(':checked') ? 'TAK' : 'NIE';
    const LISTA_EXPRESS = $('input[name="lista-express"]').is(':checked') ? 'TAK' : 'NIE';

    stworzTabele(
        [['Zamawiający', 'Kraj', 'Data', 'Numer', 'Waluta']],
        [[ZAMAWIAJACY, KRAJ, DATA, NUMER, WALUTA]]
    );
    stworzTabele(
        [['Źródło zamówienia', 'Zapłacono', 'Zapytanie o telefon/dodatki', 'Lista express']],
        [[ZRODLO, ZAPLACONO, ZAPYTANIE, LISTA_EXPRESS]]
    );
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
                    {title: 'PÓŁKA ' + idNumer, value: 'Sztuk: ' + LICZBA_POLEK},
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
            {title: 'STOPIEŃ ' + idNumer, value: 'Sztuk: ' + LICZBA_STOPNI},
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
            {title: 'MATERAC ' + idNumer, value: 'Sztuk: ' + LICZBA_MATERACY},
            {title: 'Długość', value: DLUGOSC},
            {title: 'Kolor', value: KOLOR}
        ]);
    }
};

const drukujStopke = () => {
    const UWAGI_DO_ZAMOWIENIA = $('#uwagi-do-zamowienia').val() || '\n \n \n';
    const DATA_WYSLAC_DO_DNIA = $('input[name="data-wyslac-do-dnia"]').val();

    stworzTabele(
        [['Uwagi do zamówienia']],
        [[UWAGI_DO_ZAMOWIENIA]]
    );
    stworzTabele(
        [['Wysłać do dnia', 'Waga paczki', 'Wysłano dnia', 'Przewoźnik']],
        [[DATA_WYSLAC_DO_DNIA, '', '', '']]
    );
};

const stworzTabele = (zbiorHead, zbiorBody) => {
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
        tableWidth: 490,
        margin: { left: 60 },
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
    biezacaWysokosc = 180;
    czyJestFalaWRzedzie = false;
};

// CZYSZCZENIE DANYCH OPERACYJNYCH DO GENEROWANIA PRODUKTOW HTML
const wyczyscDaneOperacyjneHTML = () => {
    licznikMateracy = licznikPolek = licznikStopni = licznikDomkow = 0;
};

// CZYSZCZENIE LISTY PRODUKTÓW
BUTTON_WYCZYSC_PRODUKTY.click((event) => {
    event.preventDefault();
    wyczyscDaneOperacyjnePDF();
    wyczyscDaneOperacyjneHTML();
    $('.produkt').remove();
});

$('#testbutton').click(() => {
    drukujPDF();
    PDF.save('Zamowienie_nr_' + $('input[name="numer-zamowienia"]').val());
    wyczyscDaneOperacyjnePDF();
    PDF = new jsPDF('p', 'pt');
});

// SUBMIT
MAIN_FORM.submit(() => {
    drukujPDF();
    PDF.save('Zamowienie_nr_' + $('input[name="numer-zamowienia"]').val());
    wyczyscDaneOperacyjnePDF();
    PDF = new jsPDF('p', 'pt');
});
