export class User {
	constructor(
		public id:String,
		public name: String,
		public email: String,
		public gender:String,
		public photo:String,
		public created_at:Date,
	) { }
}