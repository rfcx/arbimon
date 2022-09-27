import { TaxonSpeciesPhoto } from '@rfcx-bio/common/dao/types'

export const rawMissingTaxonSpeciesPhoto: Array<Omit<TaxonSpeciesPhoto, 'taxonSpeciesId'> & { slug: string }> = [
  {
    source: 'AMPHIBIANWEB',
    photoUrl: 'https://calphotos.berkeley.edu/imgs/512x768/1111_1111/1111/2879.jpeg',
    photoCaption: 'Whistle Coqui',
    photoAuthor: 'Luis J. Villanueva-Rivera',
    photoLicense: 'CC BY-NC-SA 3.0',
    photoLicenseUrl: 'https://calphotos.berkeley.edu/cgi/img_query?enlarge=1111+1111+1111+2879',
    slug: 'eleutherodactylus-cochranae'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/191409815/medium.jpeg',
    photoCaption: 'Puerto Rican Vireo',
    photoAuthor: 'Max Ramey',
    photoLicense: 'CC BY-NC',
    photoLicenseUrl: 'https://inaturalist.ca/photos/191409815',
    slug: 'vireo-latimeri'
  },
  {
    source: 'AMPHIBIANWEB',
    photoUrl: 'https://calphotos.berkeley.edu/imgs/512x768/1111_1111/1111/2882.jpeg',
    photoCaption: 'Coquí Martillito',
    photoAuthor: 'Luis J. Villanueva-Rivera',
    photoLicense: 'CC BY-NC-SA 3.0',
    photoLicenseUrl: 'https://calphotos.berkeley.edu/cgi/img_query?enlarge=1111+1111+1111+2882',
    slug: 'eleutherodactylus-locustus'
  },
  {
    source: 'AMPHIBIANWEB',
    photoUrl: 'https://calphotos.berkeley.edu/imgs/512x768/1111_1111/1111/2883.jpeg',
    photoCaption: 'Coquí de La Montaña',
    photoAuthor: 'Luis J. Villanueva-Rivera',
    photoLicense: 'CC BY-NC-SA 3.0',
    photoLicenseUrl: 'https://calphotos.berkeley.edu/cgi/img_query?enlarge=1111+1111+1111+2883',
    slug: 'eleutherodactylus-portoricensis'
  },
  {
    source: 'AMPHIBIANWEB',
    photoUrl: 'https://calphotos.berkeley.edu/imgs/512x768/1111_1111/1111/2884.jpeg',
    photoCaption: 'Coquí Caoba',
    photoAuthor: 'Luis J. Villanueva-Rivera',
    photoLicense: 'CC BY-NC-SA 3.0',
    photoLicenseUrl: 'https://calphotos.berkeley.edu/cgi/img_query?enlarge=1111+1111+1111+2884',
    slug: 'eleutherodactylus-richmondi'
  },
  {
    source: 'AMPHIBIANWEB',
    photoUrl: 'https://calphotos.berkeley.edu/imgs/512x768/1111_1111/1111/2885.jpeg',
    photoCaption: 'Coquí Melodioso',
    photoAuthor: 'Luis J. Villanueva-Rivera',
    photoLicense: 'CC BY-NC-SA 3.0',
    photoLicenseUrl: 'https://calphotos.berkeley.edu/cgi/img_query?enlarge=1111+1111+1111+2885',
    slug: 'eleutherodactylus-wightmanae'
  },
  {
    source: 'AMPHIBIANWEB',
    photoUrl: 'https://calphotos.berkeley.edu/imgs/512x768/0000_0000/0502/0200.jpeg',
    photoCaption: 'Cane Toad',
    photoAuthor: 'William Flaxington',
    photoLicense: 'CC BY-NC 3.0',
    photoLicenseUrl: 'https://calphotos.berkeley.edu/cgi/img_query?enlarge=0000+0000+0502+0200',
    slug: 'rhinella-marina'
  },
  {
    source: 'AMPHIBIANWEB',
    photoUrl: 'https://calphotos.berkeley.edu/imgs/512x768/1111_1111/1111/2881.jpeg',
    photoCaption: 'Coquí Grillo',
    photoAuthor: 'Luis J. Villanueva-Rivera',
    photoLicense: 'CC BY-NC 3.0',
    photoLicenseUrl: 'https://calphotos.berkeley.edu/cgi/img_query?enlarge=1111+1111+1111+2881',
    slug: 'eleutherodactylus-gryllus'
  },
  // {
  //   source: '',
  //   photoUrl: '',
  //   photoCaption: '',
  //   photoAuthor: '',
  //   photoLicense: '',
  //   photoLicenseUrl: '',
  //   slug: 'eleutherodactylus-hedricki'
  // },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/134497951/medium.jpeg',
    photoCaption: 'Mona Coqui',
    photoAuthor: 'archypielago08',
    photoLicense: 'CC BY-NC',
    photoLicenseUrl: 'https://inaturalist.ca/photos/134497951',
    slug: 'eleutherodactylus-monensis'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/174295170/medium.jpeg',
    photoCaption: 'Puerto Rican Pewee',
    photoAuthor: 'Ben Zerante',
    photoLicense: 'CC BY-NC',
    photoLicenseUrl: 'https://inaturalist.ca/photos/174295170',
    slug: 'contopus-latirostris-blancoi'
  },
  {
    source: 'WIKI',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Sarabi-dog.jpg',
    photoCaption: 'Sarabi dog',
    photoAuthor: 'Sina xiave',
    photoLicense: 'CC BY-SA 4.0',
    photoLicenseUrl: 'https://en.wikipedia.org/wiki/Dog#/media/File:Sarabi-dog.jpg',
    slug: 'canis-lupus-familiaris'
  },
  {
    source: 'WIKI',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Macaws_at_Jurong_Bird_Park_-Singapore-8.jpg',
    photoCaption: 'Blue-and-gold Macaw (Ara ararauna) on left and Green-winged Macaw (Ara chloropterus) on right. At Jurong Bird Park, Singapore.',
    photoAuthor: 'Desmond Peh',
    photoLicense: 'CC BY 2.0',
    photoLicenseUrl: 'https://en.wikipedia.org/wiki/Ara_(bird)#/media/File:Macaws_at_Jurong_Bird_Park_-Singapore-8.jpg',
    slug: 'ara-sp'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/58975809/medium.jpg',
    photoCaption: 'Dorisiana noriegai',
    photoAuthor: 'Ben P',
    photoLicense: 'CC BY 4.0',
    photoLicenseUrl: 'https://inaturalist.ca/photos/58975809',
    slug: 'dorisiana-noriegai'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/10973364/medium.jpg',
    photoCaption: 'Striped Wren-Babbler',
    photoAuthor: 'Carlos Sanchez',
    photoLicense: 'CC BY-NC',
    photoLicenseUrl: 'https://www.inaturalist.org/photos/10973364',
    slug: 'kenopia-striata'
  },
  // {
  //   source: 'INATURALIST',
  //   photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/24003229/medium.jpg',
  //   photoCaption: 'Chestnut-winged Babbler',
  //   photoAuthor: 'John Clough',
  //   photoLicense: 'CC BY-NC',
  //   photoLicenseUrl: 'https://www.inaturalist.org/photos/24003229',
  //   slug: 'stachyris-erythroptera'
  // },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/11057775/medium.jpeg',
    photoCaption: 'Malaysian Hawk-Cuckoo',
    photoAuthor: 'Tan Kok Hui',
    photoLicense: 'CC BY-NC',
    photoLicenseUrl: 'https://www.inaturalist.org/photos/11057775',
    slug: 'hierococcyx-fugax'
  },
  {
    source: 'WIKI',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Gould%27s_Frogmouth_-_Si_Phangnga_-_Thailand_MG_9666_%2814258331524%29.jpg/400px-Gould%27s_Frogmouth_-_Si_Phangnga_-_Thailand_MG_9666_%2814258331524%29.jpg?20210322072452',
    photoCaption: "Gould's Frogmouth - Si Phangnga - Thailand_MG_9666",
    photoAuthor: 'Francesco Veronesi',
    photoLicense: 'CC BY-SA 2.0',
    photoLicenseUrl: "https://en.wikipedia.org/wiki/Gould%27s_frogmouth#/media/File:Gould's_Frogmouth_-_Si_Phangnga_-_Thailand_MG_9666_(14258331524).jpg",
    slug: 'batrachostomus-stellatus'
  },
  {
    source: 'WIKI',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/%D0%9C%D0%B0%D0%BB%D1%8B%D0%B9_%D0%B7%D0%B5%D0%BB%D0%B5%D0%BD%D1%8B%D0%B9_%D1%80%D0%BE%D0%B3%D0%BE%D0%BA%D0%BB%D1%8E%D0%B2_Calyptomena_viridis.jpg',
    photoCaption: 'Малый зелёный рогоклюв (Calyptomena viridis)',
    photoAuthor: 'cuatrok77',
    photoLicense: 'CC BY 2.0',
    photoLicenseUrl: 'https://en.wikipedia.org/wiki/Green_broadbill#/media/File:%D0%9C%D0%B0%D0%BB%D1%8B%D0%B9_%D0%B7%D0%B5%D0%BB%D0%B5%D0%BD%D1%8B%D0%B9_%D1%80%D0%BE%D0%B3%D0%BE%D0%BA%D0%BB%D1%8E%D0%B2_Calyptomena_viridis.jpg',
    slug: 'calyptomena-viridis'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/23473686/medium.jpeg',
    photoCaption: 'Ferruginous Babbler',
    photoAuthor: 'tanhk',
    photoLicense: 'CC BY-NC',
    photoLicenseUrl: 'https://www.inaturalist.org/photos/23473686',
    slug: 'trichastoma-bicolor'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/47157820/medium.jpg',
    photoCaption: 'Garnet Pitta',
    photoAuthor: 'Gregory Greene',
    photoLicense: 'CC BY-NC',
    photoLicenseUrl: 'https://www.inaturalist.org/photos/47157820',
    slug: 'erythropitta-granatina'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/10130555/medium.jpg',
    photoCaption: 'Rufous-fronted Babbler',
    photoAuthor: 'Tan Kok Hui',
    photoLicense: 'CC BY-NC',
    photoLicenseUrl: 'https://www.inaturalist.org/photos/10130555',
    slug: 'stachyris-rufifrons'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/11190977/medium.jpeg',
    photoCaption: 'Chestnut-bellied Malkoha',
    photoAuthor: 'Tan Kok Hui',
    photoLicense: 'CC BY-NC',
    photoLicenseUrl: 'https://www.inaturalist.org/photos/11190977',
    slug: 'phaenicophaeus-sumatranus'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/99336502/medium.jpg',
    photoCaption: 'Reddish Scops-Owl',
    photoAuthor: 'Cheong Weng Chun',
    photoLicense: 'CC BY-NC',
    photoLicenseUrl: 'https://www.inaturalist.org/photos/99336502',
    slug: 'otus-rufescens'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/12455875/medium.jpg',
    photoCaption: 'Sunda Frogmouth',
    photoAuthor: 'Melindra12',
    photoLicense: 'CC BY-SA',
    photoLicenseUrl: 'https://www.inaturalist.org/photos/12455875',
    slug: 'batrachostomus-cornutus'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/32472483/medium.jpeg',
    photoCaption: 'Gray-rumped Treeswift',
    photoAuthor: 'Nina Lester Finley',
    photoLicense: 'CC BY-NC',
    photoLicenseUrl: 'https://www.inaturalist.org/photos/32472483',
    slug: 'hemiprocne-longipennis'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/120393091/medium.jpeg',
    photoCaption: 'Pied Triller',
    photoAuthor: 'anukma',
    photoLicense: 'CC BY',
    photoLicenseUrl: 'https://www.inaturalist.org/photos/120393091',
    slug: 'lalage-nigra'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/5265681/medium.jpeg',
    photoCaption: 'Sooty-headed Bulbul',
    photoAuthor: 'Bruno Durand',
    photoLicense: 'CC BY-NC',
    photoLicenseUrl: 'https://www.inaturalist.org/photos/5265681',
    slug: 'pycnonotus-aurigaster'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/11083589/medium.jpeg',
    photoCaption: 'Cream-vented Bulbul',
    photoAuthor: 'Tan Kok Hui',
    photoLicense: 'CC BY-NC',
    photoLicenseUrl: 'https://www.inaturalist.org/photos/11083589',
    slug: 'pycnonotus-simplex'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/24007755/medium.jpeg',
    photoCaption: 'Hairy-backed Bulbul',
    photoAuthor: 'John Clough',
    photoLicense: 'CC BY-NC',
    photoLicenseUrl: 'https://www.inaturalist.org/photos/24007755',
    slug: 'tricholestes-criniger'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/18395893/medium.jpg',
    photoCaption: 'Rufous-crowned Babbler',
    photoAuthor: 'Tan Kok Hui',
    photoLicense: 'CC BY-NC',
    photoLicenseUrl: 'https://www.inaturalist.org/photos/18395893',
    slug: 'malacopteron-magnum'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/18395903/medium.jpg',
    photoCaption: 'Gray-breasted Babbler',
    photoAuthor: 'Tan Kok Hui',
    photoLicense: 'CC BY-NC',
    photoLicenseUrl: 'https://www.inaturalist.org/photos/18395903',
    slug: 'malacopteron-albogulare'
  },
  {
    source: 'WIKI',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Stachyris_leucotis.jpg',
    photoCaption: 'White-necked Babbler (Stachyris leucotis)',
    photoAuthor: 'jmittermeier',
    photoLicense: 'CC BY 2.0',
    photoLicenseUrl: 'https://en.wikipedia.org/wiki/White-necked_babbler#/media/File:Stachyris_leucotis.jpg',
    slug: 'stachyris-leucotis'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/11032925/medium.jpeg',
    photoCaption: 'Lesser Green Leafbird',
    photoAuthor: 'Tan Kok Hui',
    photoLicense: 'CC BY-NC',
    photoLicenseUrl: 'https://www.inaturalist.org/photos/11032925',
    slug: 'chloropsis-cyanopogon'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/99373565/medium.jpeg',
    photoCaption: 'Yellow-breasted Flowerpecker',
    photoAuthor: 'Ben Tsai蔡維哲',
    photoLicense: 'CC BY-NC',
    photoLicenseUrl: 'https://www.inaturalist.org/photos/99373565',
    slug: 'prionochilus-maculatus'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/17177063/medium.jpg',
    photoCaption: 'Sunda Woodpecker ',
    photoAuthor: 'Bronze Cheung Kwok Yee',
    photoLicense: 'CC BY-NC',
    photoLicenseUrl: 'https://www.inaturalist.org/photos/17177063',
    slug: 'yungipicus-moluccensis'
  },
  {
    source: 'INATURALIST',
    photoUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/25268705/medium.jpg',
    photoCaption: 'Fluffy-backed Tit-Babbler',
    photoAuthor: 'Tan Kok Hui',
    photoLicense: 'CC BY-NC',
    photoLicenseUrl: 'https://www.inaturalist.org/photos/25268705',
    slug: 'macronus-ptilosus'
  }
]
