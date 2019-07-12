export interface Volontario {
    idVolontario: string;
    identificativo: string;
    cognome: string;
    nome: string;
    cellulare: string;
    esecutore: boolean;
}

export interface Dae {
    id: string;
    co118: string;
    codiceCo118: string;
}

export interface TrackingData {
    timestamp_evento: string;
    volontario: Volontario;
    dae?: Dae;
    latitudine: number;
    longitudine: number;
}