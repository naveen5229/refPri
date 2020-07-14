export class ScheduleTask {
  
    constructor(
        public description: any,
        public primaryUser: any,
        public escalationUser: any,
        public reportingUser: any,
        public logicType: any,
        public scheduleParam: any,
        public days: any,
        public hours: any
            ) {}
    }