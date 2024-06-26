import mongoose,{Schema,Document,Types} from 'mongoose';

export interface IToken extends Document{
    token:string;
    user: Types.ObjectId;
    createdAt: Date;
}

const tokenSchema = new Schema({
    token:{
        type:String,
        required:true,
    },
    user:{
        type: Types.ObjectId,
        ref:'User',
        required:true
    },
    expiresAt:{
        type:Date,
        default:Date.now(),
        expires:"1h"
    }
});

const Token = mongoose.model<IToken>('Token',tokenSchema);
export default Token;