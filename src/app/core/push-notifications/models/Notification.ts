
export class Notification {
    constructor (
        public id: string,
        public sentDate: Date,
        public title: string,
        public message: string,
        public isNew: boolean
    ) { }
}
