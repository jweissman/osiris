import { Color } from 'excalibur';
import { sample } from '../Util';

export class Colors {
  static primary: Color[] = [
    Color.Red, Color.Blue, Color.Yellow, // Color.Green,
  ]

  static secondary: Color[] = [
    Color.Green, Color.Orange, Color.Violet,
  ]

  static tertiary: Color[] = [
    Color.Vermillion, Color.Chartreuse, Color.Magenta, Color.Azure,
    //Color.Teal,
    new Color(54, 117, 136),

    //Color.Amber
    new Color(255, 191, 0),
  ]

  static process(c: Color): Color {
    return c.clone()
      .desaturate(0.68)
      .lighten(0.14)
  }
}

export class World {
    static nameCitizen(): string {
      return sample([
        // first-gen names
        'Parthas', 'Athos', 'Karzak', 'Echo', 'Jaen', 'Xavier', 'Mante', 'Ern', 'Leor', 'Exiel', 'Tomlien', 'Amriel', 'Sariel', 'Arthax', 'Avalon',
        'Kor', 'Exelon', 'Dominel', 'Prinz', 'Etsa', 'Corinth', 'Coade', 'Exter', 'Domnek', 'Tahm', 'Esk', 'Ith', 'Torl', 'Klapaucius', 'Antonidus',
        'Exeleron', 'Moab', 'Thim', 'Pol', 'Maigel',

        // second-gen
        "Abalone", "Exton", "Mauritius", "Elenorg", "Miga", "Elph", "Jame", "Eln", "Corax", "Thoeam", "Spoob", "Morna", "Elia", "Iatia", "Manea",
        "Elphenor", "Morican", "Neutron", "Codeman", "Alphegor", "Belfast", "Minah", "Alcahtrazz", "Miskadew", "Erlangjag", "Manling", "Hopeful",
        "Noman", "Nohbdy", "Elseone", "Othera", "Selene", "Maytrix", "Damsehl", "Allegore", "Samilie", "Phonolia", "Philia", "Dippides", "Euripimus",
        "D'arcy", "Noname", "Sig", "Gil", "Felix",  "Ertrude", "Imitos", "Exitos", "Xenia", "Corelia", "Lineament", "Fundament", "Hyperion", "Nonce",
        "Eris", "Nael", "Gronthax", "Sparerib", "Carhorn", "Doorknot", "Careful", "Sadusee", "Alright", "Kevim", "Elador", "Elabor", "Elgar", "Elbow",
        "Nell", "Kell", "Tell", "Pell", "Jell", "Xell", "Zell", "Zil", "Zok", "Nog", "Yog", "Moog", "Mogue", "Rogue", "Boog", "Dude", "Aesthyr", "Kerax",
        "Norman", "Gordon", "Gordax", "Gornoth", "Torgon", "Zorgax", "Zarnath", "Sarnox", "Porkath", "Esperil", "Ythr", "Dream", "Fever", "Spite", "Coreheart",
        "Darkfire", "Lost", "Found", "Norm", "Korm", "Dorm", "Lorm", "Form", "Sorm", "Roam", "Nome", "Tome", "Bore", "Nore", "Kore", "Dorling", "Norlath",
        "Natling", "Dathron", "Dathlax", "Kargill", "Nomandy", "Exactlee", "Terminax", "Exlith", "Lisztia", "Zed", "Alphus", "Quatlewis", "Serenado", "Imma", 

        // third-gen
        "Splendor", "Airline", "Phax", "Index", "Tolerable", "Expert", "Tonsil", "Deerhoof", "Coldrain", "Darkwater",
        "Interzone", "Neverwhen", "Dream", "Really", "Artefax", "Maniple", "Anseb", "Target", "Novim", "Evim", "Lisem", "Nancem",
        "Orligot", "Nolifun", "Deriduh", "Flandor", "Lamplife", "Coldwave", "Oncetold", "Oncebit", "Twiceshy", "Niceguy", "Okay",


        // very long names
        // "Turbinaceous", "Etceteron", "Domicilian", "Colphraginate","Malfeagarance", "Fintupulate", 
        // "Explenador", "Sedmonicker", "Diphtongidus", "Temperance", "Templexity", "Excapital", 
        // "Amtrack", "Coalescent", "Coagulant", "Tertullius",  "Imaginandum", "Terrycotta",
        // "Aristotle", "Maximilien",
      ])
    }

  static colors = [
    ...Colors.primary,
  ] 

  static skyColors = [
    ...Colors.secondary,
  ]

  static pickColor() {
    return Colors.process(sample(World.colors)).darken(0.2)
  }

  static pickSkyColor() {
    return Colors.process(
      sample(World.skyColors)
    ).lighten(0.2)
  }
}