import { Color } from 'excalibur';
import { sample } from '../Util';

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
        "Nell", "Kell", "Tell", "Pell", "Jell", "Xell", "Zell", "Zil", "Zok", "Zog", "Mog", "Moog", "Mogue", "Rogue", "Boog", "Dude", "Aesthyr", "Kerax",
        "Norman", "Gordon", "Gordax", "Gornoth", "Torgon", "Zorgax", "Zarnath", "Sarnox", "Porkath", "Esperil", "Ythr", "Dream", "Fever", "Spite", "Coreheart",
        "Darkfire", "Lost", "Found", "Norm", "Korm", "Dorm", "Lorm", "Form", "Sorm", "Roam", "Nome", "Tome", "Bore", "Nore", "Kore", "Dorling", "Norlath",
        "Natling", "Dathron", "Dathlax", "Kargill", "Nomandy", "Exactlee", "Terminax", "Exlith", "Lisztia", "Zed", "Alphus", "Quatlewis", "Serenado", "Imma", 


        // very long names
        // "Turbinaceous", "Etceteron", "Domicilian", "Colphraginate","Malfeagarance", "Fintupulate", 
        // "Explenador", "Sedmonicker", "Diphtongidus", "Temperance", "Templexity", "Excapital", 
        // "Amtrack", "Coalescent", "Coagulant", "Tertullius",  "Imaginandum", "Terrycotta",
        // "Aristotle", "Maximilien",
      ])
    }

  static colors = [Color.Orange] // Color.Azure], // Color.Red, Color.Blue, Color.Green, Color.Magenta]
  static skyColors = [Color.Cyan] //b, Color.Vermillion], // Color.Violet, Color.Chartreuse, Color.Orange, Color.Rose]

  static pickColor() {
    return sample(World.colors).
      clone().
      darken(0.1).
      desaturate(0.8);
  }

  static pickSkyColor() {
    return sample(World.skyColors).
      clone().
      desaturate(0.74).
      lighten(0.18)
  }

}