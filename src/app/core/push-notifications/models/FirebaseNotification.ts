import { TopicTypes } from './TopicTypes';

export class FirebaseNotification {
    constructor (
        public tap: boolean,
        public type: TopicTypes,
        public title: string,
        public body: string,
        public meetingId?: string,
        public agendaItemId?: string
    ) { }
}
