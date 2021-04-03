export class NormalTask {

    constructor(
        public userName: any,
        public date: any,
        public task: any,
        public isUrgent: boolean,
        public projectId: any,
        public ccUsers: any,
        public parentTaskId: any,
        public isFuture: boolean,
        public futureDate: any,
        public subject: any,
        public isQueue:boolean
    ) { }
}