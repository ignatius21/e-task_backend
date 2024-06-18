import mongoose,{Schema,Document} from 'mongoose';

export interface IUser extends Document{
    name:string;
    email:string;
    password:string;
    confirmed:boolean;
}

const UserSchema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    confirmed:{
        type:Boolean,
        default:false
    }
});

export default mongoose.model<IUser>('User',UserSchema);