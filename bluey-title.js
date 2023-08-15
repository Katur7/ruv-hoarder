// https://dubdb.fandom.com/wiki/Bl%C3%A6ja#Episodes
// https://thetvdb.com/series/bluey-2018/seasons/official/2

const seasonTwoTitles = {
    'Dansstilling': 1,
    'Húsasmiðjan': 2,
    'Fjaðrasprotinn': 3,
    'Veggjatennis': 4,
    'Hárgreiðsluleikur': 5,
    'Trjástubbakeppni': 6,
    'Uppáhalds hluturinn': 7,
    'Pabbaskutl': 8,
    'Bára': 9,
    'Teppaeyja': 10,
    'Giskuleikur': 11,
    'Sticky Gecko': 12,
    'Dad Baby': 13,
    'Mum School': 14,
    'Trains': 15,
    'Army': 16,
    'Fancy Restaurant': 17,
    'Piggyback': 18,
    'The Show': 19,
    'Tickle Crabs': 20,
    'Escape': 21,
    'Bus': 22,
    'Queens': 23,
    'Flat Pack': 24,
    'Helicopter': 25,
    'Sleepytim': 26,
    'Grandad': 27,
    'Seesaw': 28,
    'Movies': 29,
    'Library': 30,
    'Barky Boats': 31,
    'Burger Shop': 32,
    'Circus': 33,
    'Swim School': 34,
    'Café': 35,
    'Postman': 36,
    'The Quiet Game': 37,
    'Mr Monkeyjocks': 38,
    'Double Babysitter': 39,
    'Bad Mood': 40,
    'Octopus': 41,
    'Bin Night': 42,
    'Muffin Cone': 43,
    'Duck Cake': 44,
    'Handstand': 45,
    'Road Trip': 46,
    'Ice Cream': 47,
    'Dunny': 48,
    'Typewriter': 49,
    'Baby Race': 50,
    'Christmas Swim': 51,
    'Easter': 52,
};

const seasonOneTitles = {
    'Galdra Sílófónninn': 1,
    'Spítalinn': 2,
    'Halda á Lofti': 3,
    'Pabbi Róbots': 4,
    'Skuggaland': 5,
    'Helgin': 6,
    'Útigrill': 7,
    'Leðurblökur': 8,
    'Á hestbaki': 9,
    'Hótelleikur': 10,
    'Hjólið': 11,
    'Palli Pokakanína': 12,
    'Njósnaleikur': 13,
    'Taka með matur': 14,
    'Fiðrildi': 15,
    'Jógaboltinn': 16,
    'Salka': 17,
    'Læknirinn': 18,
    'Krumlan': 19,
    'Á Markaðinum': 20,
    'Bláfjöll': 21,
    'Sundlaugin': 22,
    'Búðin': 23,
    'Kerruferðin': 24,
    'Leigubíllinn': 25,
    'Ströndin': 26,
    'Sjóræningjar': 27,
    'Ömmur': 28,
    'Lækurinn': 29,
    'Álfar': 30,
    'Vinna': 31,
    'Bumba Og Vitri Gamli Úlfhundurinn': 32,
    'Trampólín': 33,
    'Sorpa': 34,
    'Dýragarður': 35,
    'Bakpokaferðalag': 36,
    'Ævintýrið': 37,
    'Hermikráka': 38,
    'Næturgistingin': 39,
    'Fyrirburi': 40,
    'Mömmuleikur': 41,
    'Feluleikur': 42,
    'Útilega': 43,
    'Mömmuogpabbafjall': 44,
    'Krakkar': 45,
    'Hænurotta': 46,
    'Nágrannar': 47,
    'Að stríða': 48,
    'Aspas': 49,
    'Jónsi': 50,
    'Kvöld Með Pabba': 51,
    'Svalasveinki': 52,
};

export function blueyTitleToEpisodeNr(season, title) {
    if(season === 1) {
        if(seasonOneTitles.hasOwnProperty(title)) {
            return seasonOneTitles[title].toString();
        } else {
            console.error('Could not find episode nr for Bluey -', title);
            throw new Error('Episode nr not found')
        }
    }
    else if(season === 2) {
        if(seasonTwoTitles.hasOwnProperty(title)) {
            return seasonTwoTitles[title].toString();
        } else {
            console.error('Could not find episode nr for Bluey -', title);
            throw new Error('Episode nr not found')
        }
    }
}
