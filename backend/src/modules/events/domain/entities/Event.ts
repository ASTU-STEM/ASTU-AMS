export class Event {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly date: Date,
    public readonly location: string,
    public readonly type: string, // "ONLINE" | "IN_PERSON"
    public readonly createdBy: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}

export class EventRSVP {
  constructor(
    public readonly id: string,
    public readonly eventId: string,
    public readonly alumniId: string,
    public readonly status: string, // "GOING" | "NOT_GOING"
    public readonly createdAt: Date
  ) {}
}
